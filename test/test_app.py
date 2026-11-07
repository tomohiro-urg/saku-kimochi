"""合体版の動作確認です。パソコンのChromeの部品で動かし、本物のAIは使いません。

使い方: python test/test_app.py
必要なもの: playwright と Pillow
"""
import functools
import http.server
import io
import json
import math
import re
import socketserver
import struct
import sys
import tempfile
import threading
import wave
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parent.parent
FAKE_GAS = "https://script.google.com/macros/s/TEST/exec"
TEST_PASS = "test-only"
OUT = Path(tempfile.mkdtemp(prefix="saku-test-"))
results = []


def check(name, ok, detail=""):
    results.append(ok)
    print(("OK  " if ok else "NG  ") + name + (f"  [{detail}]" if detail else ""))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(Quiet, directory=str(APP))
    server = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_address[1]}"


def new_page(browser, errors, **kwargs):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, **kwargs)
    page = ctx.new_page()
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    return ctx, page


def no_sideways_scroll(page):
    return page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")


def route_gas_url(ctx, url):
    """試験では本物の中継役を呼ばないよう、shashin.js の住所を差しかえる"""
    def handler(route):
        body = re.sub(r'const GAS_URL = "[^"]*";', f'const GAS_URL = "{url}";',
                      (APP / "shashin.js").read_text(encoding="utf-8"), count=1)
        route.fulfill(status=200, content_type="text/javascript; charset=utf-8", body=body)
    ctx.route("**/shashin.js", handler)


def test_files():
    manifest = json.loads((APP / "manifest.json").read_text(encoding="utf-8"))
    purposes = {i["purpose"] for i in manifest["icons"]}
    check("manifest に any と maskable がある", purposes == {"any", "maskable"})
    for icon in manifest["icons"]:
        check(f"manifest のアイコンがある {icon['src']}", (APP / icon["src"]).exists())
    for name, size in {"icon-512.png": 512, "icon-192.png": 192, "apple-touch-icon.png": 180, "favicon-32.png": 32}.items():
        img = Image.open(APP / "icons" / name)
        corners = [(0, 0), (size - 1, 0), (0, size - 1), (size - 1, size - 1)]
        rgb = img.convert("RGB")
        edge = [(i, 0) for i in range(size)] + [(i, size - 1) for i in range(size)] + [(0, i) for i in range(size)] + [(size - 1, i) for i in range(size)]
        pale = [c for c in corners + edge if min(rgb.getpixel(c)) > 225]
        check(f"アイコンの大きさと余白なし {name}", img.size == (size, size) and img.mode == "RGB" and not pale, f"白っぽい点 {len(pale)}")

    koe = (APP / "koe.js").read_text(encoding="utf-8")
    check("声のセリフに ぼく と あだ名がない", not re.search("ぼく|僕|ぷー太郎", koe))
    gas_line = (APP / "shashin.js").read_text(encoding="utf-8").splitlines()[1]
    check("中継役のURLが書かれている", re.search(r'"https://script\.google\.com/macros/s/[\w-]+/exec"', gas_line) is not None)
    secret = re.compile(r"AIza[0-9A-Za-z_-]{20,}|sk-ant-")
    leaks = [p.name for p in APP.rglob("*") if p.is_file() and p.suffix in {".js", ".html", ".css", ".json", ".gs", ".md"}
             and secret.search(p.read_text(encoding="utf-8"))]
    check("鍵が書かれていない", not leaks, ", ".join(leaks))


def test_entry(browser, base):
    errors = []
    ctx, page = new_page(browser, errors)
    page.goto(base + "/")
    check("入口: 起動画面が出る", page.locator("#splash").is_visible())
    page.screenshot(path=OUT / "1_splash.png")
    page.wait_for_selector("#splash", state="hidden", timeout=5000)
    check("入口: 2つのボタン", page.locator(".menu-btn").count() == 2)
    check("入口: 横にはみ出さない", no_sideways_scroll(page))
    page.screenshot(path=OUT / "2_menu.png")
    page.click("a[href='koe.html']")
    page.wait_for_selector("#screenWho.active")
    page.click("#screenWho .back-link")
    page.wait_for_selector(".menu")
    check("入口: 戻ったときは起動画面が出ない", not page.locator("#splash").is_visible())
    ctx.close()
    check("入口: エラーなし", not errors, "; ".join(errors))


def test_voice(browser, base):
    errors = []
    ctx, page = new_page(browser, errors, permissions=["microphone"])
    page.goto(base + "/koe.html")
    check("声: 起動画面も合言葉も出ない", page.locator("#screenWho.active").is_visible())
    page.screenshot(path=OUT / "3_voice_who.png", full_page=True)
    page.locator("#whoList .scene-btn").nth(1).click()
    page.wait_for_selector("#screenSelect.active")
    check("声: 人の名前が出る", "とうちゃん" in page.inner_text("#whoLabel"))
    check("声: 横にはみ出さない", no_sideways_scroll(page))
    page.wait_for_timeout(400)
    page.screenshot(path=OUT / "4_voice_select.png", full_page=True)
    page.click("#toRecordBtn")
    page.wait_for_selector("#screenRecord.active")
    page.wait_for_timeout(2500)
    page.screenshot(path=OUT / "5_voice_record.png", full_page=True)
    page.click("#stopBtn")
    page.wait_for_selector("#screenResult.active", timeout=15000)
    text = page.inner_text("#resultText")
    check("声: 大きな音でセリフが出る", text.startswith("「") and "きこえん" not in text, text)
    check("声: 気持ちの大きさが出る", bool(page.inner_text("#moodText").strip()), page.inner_text("#moodText"))
    check("声: 結果に ぼく と あだ名がない", not re.search("ぼく|僕|ぷー太郎", text))
    page.wait_for_timeout(400)
    page.screenshot(path=OUT / "6_voice_result.png", full_page=True)
    page.click("#againBtn")
    page.wait_for_selector("#screenSelect.active")
    ctx.close()
    check("声: エラーなし", not errors, "; ".join(errors))


def loud_sound_file():
    """試験用のマイクに聞かせる、大きな音のファイルを作る"""
    path = OUT / "loud.wav"
    rate = 48000
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(rate)
        f.writeframes(b"".join(
            struct.pack("<h", int(24000 * math.sin(2 * math.pi * 600 * i / rate))) for i in range(rate * 3)
        ))
    return path


def photo_file():
    path = OUT / "photo.jpg"
    Image.new("RGB", (1200, 900), (205, 160, 110)).save(path, quality=90)
    return path


def test_photo_without_ai(browser, base):
    errors = []
    ctx, page = new_page(browser, errors)
    route_gas_url(ctx, "ここにGASのURLを貼る")
    page.goto(base + "/shashin.html")
    page.wait_for_selector("#screen-home:not([hidden])")
    check("写真(AIなし): 合言葉は出ない", page.locator("#screen-pass").is_hidden())
    check("写真(AIなし): 横にはみ出さない", no_sideways_scroll(page))
    page.screenshot(path=OUT / "7_photo_home.png", full_page=True)
    page.set_input_files("#input-album", photo_file())
    page.wait_for_selector("#screen-result:not([hidden])", timeout=15000)
    check("写真(AIなし): お休みの表示", page.locator("#result-offline").is_visible())
    page.screenshot(path=OUT / "8_photo_result.png")
    page.click("#btn-again")
    page.wait_for_selector("#screen-home:not([hidden])")
    page.click("#screen-home .back-link")
    page.wait_for_selector(".menu")
    ctx.close()
    check("写真(AIなし): エラーなし", not errors, "; ".join(errors))


def test_photo_with_fake_ai(browser, base):
    errors = []
    ctx, page = new_page(browser, errors)
    asked = []
    mode = {"answer": {"status": "ok", "mood": "うれしい", "line": "試験のセリフだがね"}}

    def fake_gas(route):
        data = json.loads(route.request.post_data)
        asked.append(data["action"])
        if data.get("passphrase") != TEST_PASS:
            answer = {"status": "wrong_passphrase"}
        elif data["action"] == "check":
            answer = {"status": "ok"}
        else:
            answer = mode["answer"]
        route.fulfill(status=200, content_type="application/json", headers={"Access-Control-Allow-Origin": "*"},
                      body=json.dumps(answer))

    route_gas_url(ctx, FAKE_GAS)
    ctx.route(FAKE_GAS, fake_gas)

    page.goto(base + "/koe.html")
    check("声は合言葉なしで使える", page.locator("#screenWho.active").is_visible() and not asked)

    page.goto(base + "/shashin.html")
    page.wait_for_selector("#screen-pass:not([hidden])")
    check("写真(AIあり): 合言葉の画面が出る", True)
    page.screenshot(path=OUT / "9_photo_pass.png", full_page=True)
    page.fill("#pass-input", "wrong")
    page.click("#pass-submit")
    page.wait_for_function("document.getElementById('pass-message').textContent !== ''")
    check("写真(AIあり): ちがう合言葉は入れない", page.locator("#screen-pass").is_visible())

    # 合言葉なしで遊ぶ: AIには送らず、用意したセリフで結果が出る
    sent_before = len(asked)
    page.click("#pass-skip")
    page.wait_for_selector("#screen-home:not([hidden])")
    page.set_input_files("#input-album", photo_file())
    page.wait_for_selector("#screen-result:not([hidden])", timeout=15000)
    check("写真(AIあり): 合言葉なしでも遊べる", page.locator("#result-offline").is_visible() and len(asked) == sent_before)
    page.click("#btn-again")
    page.wait_for_selector("#screen-home:not([hidden])")
    page.goto(base + "/shashin.html")
    page.wait_for_selector("#screen-pass:not([hidden])")
    check("写真(AIあり): 開き直すと合言葉をまた聞く", True)

    page.fill("#pass-input", TEST_PASS)
    page.click("#pass-submit")
    page.wait_for_selector("#screen-home:not([hidden])")

    page.set_input_files("#input-album", photo_file())
    page.wait_for_selector("#screen-result:not([hidden])", timeout=15000)
    check("写真(AIあり): AIのセリフを使う", "試験のセリフだがね" in page.get_attribute("#result-photo", "alt"))
    check("写真(AIあり): お休みの表示は出ない", page.locator("#result-offline").is_hidden())
    page.click("#btn-again")
    page.wait_for_selector("#screen-home:not([hidden])")

    page.goto(base + "/shashin.html")
    page.wait_for_selector("#screen-home:not([hidden])")
    check("写真(AIあり): 次からは合言葉を聞かない", page.locator("#screen-pass").is_hidden())

    mode["answer"] = {"status": "ai_unavailable"}
    page.set_input_files("#input-album", photo_file())
    page.wait_for_selector("#screen-result:not([hidden])", timeout=15000)
    check("写真(AIあり): AIが休みでも動く", page.locator("#result-offline").is_visible())

    # 戻る → 次の写真の処理中に「進む」 → それでも「もう一回」でホームに戻れる
    page.go_back()
    page.wait_for_selector("#screen-home:not([hidden])")
    page.set_input_files("#input-album", photo_file())
    page.go_forward()
    page.wait_for_selector("#screen-result:not([hidden])", timeout=15000)
    page.wait_for_timeout(500)
    page.click("#btn-again")
    page.wait_for_selector("#screen-home:not([hidden])")
    check("写真(AIあり): 処理中に進むを押してもホームに戻れる", page.evaluate("history.state === null"))

    # とても横長の写真でも吹き出しが写真の中に入る
    wide = OUT / "wide.jpg"
    Image.new("RGB", (4000, 100), (205, 160, 110)).save(wide, quality=90)
    page.set_input_files("#input-album", wide)
    page.wait_for_selector("#screen-result:not([hidden])", timeout=15000)
    bubble_inside = page.evaluate("""() => new Promise((ok) => {
      const img = document.getElementById('result-photo');
      const c = document.createElement('canvas');
      const probe = new Image();
      probe.onload = () => {
        c.width = probe.naturalWidth; c.height = probe.naturalHeight;
        const g = c.getContext('2d'); g.drawImage(probe, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        let dark = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] < 80 && d[i+1] < 80 && d[i+2] < 80) dark++;
        ok(dark > 50);
      };
      probe.src = img.src;
    })""")
    check("写真(AIあり): 横長の写真でも吹き出しが中に入る", bubble_inside)
    ctx.close()
    check("写真(AIあり): エラーなし", not errors, "; ".join(errors))


def main():
    test_files()
    server, base = serve()
    with sync_playwright() as p:
        browser = p.chromium.launch(args=[
            "--use-fake-device-for-media-stream",
            "--use-fake-ui-for-media-stream",
            f"--use-file-for-fake-audio-capture={loud_sound_file()}",
        ])
        test_entry(browser, base)
        test_voice(browser, base)
        test_photo_without_ai(browser, base)
        test_photo_with_fake_ai(browser, base)
        browser.close()
    server.shutdown()
    print(f"\n{sum(results)}/{len(results)} OK  screenshots: {OUT}")
    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
