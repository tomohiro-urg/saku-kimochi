// GASをウェブアプリとして公開したときのURLを、かぎかっこの内側に貼ります。
const GAS_URL = "https://script.google.com/macros/s/AKfycbybS7ugsqwor1u3zujXqmgVgr75qKi945A4opW84w6SopfWwfeja9z-6f3MtzUs1G3XCA/exec";

const PASS_KEY = "saku-passphrase";
const LAST_LINE_KEY = "saku-last-line";
const SEND_LONG_EDGE = 1024;
const SEND_JPEG_QUALITY = 0.8;
const PICTURE_LONG_EDGE = 1600;
const PICTURE_JPEG_QUALITY = 0.9;
const REQUEST_TIMEOUT_MS = 45000;
const LONG_WAIT_MS = 10000;
const MAX_LINE_CHARS = 30;

const MESSAGE_PHOTO_ERROR = "うまくいかんかったで、もう一回撮ってみてちょう";
const MESSAGE_WRONG_PASS = "合言葉がちがうみたいだわ。もう一回入れてちょう";
const MESSAGE_NO_CONNECTION = "つながらんかったで、もう一回押してちょう";

const FONT_FAMILY = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans CJK JP", "Yu Gothic", Meiryo, sans-serif';
// 行の頭に来ると読みにくい文字
const NO_LINE_START = "、。ーっゃゅょぁぃぅぇぉッャュョァィゥェォ…";

const $ = (id) => document.getElementById(id);
const screens = ["screen-pass", "screen-home", "screen-wait", "screen-result"];

let busy = false;
let longWaitTimer = null;
let pictureFile = null;
let pictureUrl = null;
let currentPass = "";
// 合言葉を入れずに「AIなし」で遊ぶことを選んだか(開き直すと元に戻る)
let offlineOnly = false;

function isServerReady() {
  return GAS_URL.startsWith("https://");
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// 非公開モードなどで記憶できないスマホでも止まらないようにする
function readStore(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // 記憶できなくても、今回の操作はそのまま続ける
  }
}

function removeStore(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // 消せなくても、今回の操作はそのまま続ける
  }
}

function showScreen(id) {
  for (const screenId of screens) {
    $(screenId).hidden = screenId !== id;
  }
  window.scrollTo(0, 0);
}

function showHome(message) {
  $("home-message").textContent = message || "";
  showScreen("screen-home");
}

function showPassScreen(message) {
  $("pass-message").textContent = message || "";
  $("pass-input").value = "";
  showScreen("screen-pass");
}

/* サーバーとのやりとり */

async function postToServer(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    // text/plain で送ると、ブラウザの事前確認なしでGASに届く
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });
    const data = JSON.parse(await response.text());
    if (!data || typeof data !== "object") throw new Error("unexpected answer");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/* 合言葉 */

async function handlePassSubmit(event) {
  event.preventDefault();
  const passphrase = $("pass-input").value.trim();
  if (!passphrase) return;

  $("pass-submit").disabled = true;
  $("pass-message").textContent = "";
  try {
    const result = await postToServer({ action: "check", passphrase });
    if (result.status === "ok") {
      writeStore(PASS_KEY, passphrase);
      currentPass = passphrase;
      showHome();
    } else {
      $("pass-message").textContent = MESSAGE_WRONG_PASS;
    }
  } catch (error) {
    $("pass-message").textContent = MESSAGE_NO_CONNECTION;
  } finally {
    $("pass-submit").disabled = false;
  }
}

/* 写真の読み込みと縮小 */

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    image.src = url;
  });
}

// HEICなどの形式も、一度Canvasに描くことでJPEGに変換できる
function drawScaled(image, longEdge) {
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) throw new Error("image is empty");

  const scale = Math.min(1, longEdge / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sourceWidth * scale);
  canvas.height = Math.round(sourceHeight * scale);
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas export failed"));
    }, "image/jpeg", quality);
  });
}

/* 吹き出しの合成 */

function wrapText(context, text, maxWidth) {
  const rows = [];
  let row = "";
  for (const char of Array.from(text)) {
    const fits = context.measureText(row + char).width <= maxWidth;
    if (fits || !row || NO_LINE_START.includes(char)) {
      row += char;
    } else {
      rows.push(row);
      row = char;
    }
  }
  if (row) rows.push(row);
  return rows;
}

function drawBubbleShape(context, x, y, width, height, radius, tailSize) {
  const centerX = x + width / 2;
  const bottom = y + height;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, bottom, radius);
  context.arcTo(x + width, bottom, x, bottom, radius);
  context.lineTo(centerX + tailSize * 0.7, bottom);
  context.lineTo(centerX, bottom + tailSize);
  context.lineTo(centerX - tailSize * 0.7, bottom);
  context.arcTo(x, bottom, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawPicture(image, line, mood) {
  const canvas = drawScaled(image, PICTURE_LONG_EDGE);
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const isLandscape = width > canvas.height;

  // 横に細長い写真では、高さに合わせて文字を小さくする
  const fontSize = Math.round(Math.min(width * (isLandscape ? 0.055 : 0.065), canvas.height * 0.1));
  const moodSize = Math.round(fontSize * 0.62);
  const lineHeight = Math.round(fontSize * 1.35);
  const moodLineHeight = mood ? Math.round(moodSize * 1.8) : 0;
  const paddingX = Math.round(fontSize * 0.8);
  const paddingY = Math.round(fontSize * 0.55);
  // 横に細長い写真でも吹き出しが写真の外に出ないよう、短い辺を基準にする
  const margin = Math.round(Math.min(width, canvas.height) * 0.03);
  const maxBubbleWidth = width - margin * 2;

  const lineFont = `700 ${fontSize}px ${FONT_FAMILY}`;
  const moodFont = `400 ${moodSize}px ${FONT_FAMILY}`;
  const moodText = mood ? `気持ち: ${mood}` : "";

  context.font = lineFont;
  const rows = wrapText(context, line, maxBubbleWidth - paddingX * 2);
  let contentWidth = Math.max(...rows.map((row) => context.measureText(row).width));
  if (moodText) {
    context.font = moodFont;
    contentWidth = Math.max(contentWidth, context.measureText(moodText).width);
  }

  const bubbleWidth = Math.min(maxBubbleWidth, Math.ceil(contentWidth) + paddingX * 2);
  const bubbleHeight = rows.length * lineHeight + moodLineHeight + paddingY * 2;
  const bubbleX = Math.round((width - bubbleWidth) / 2);
  const bubbleY = margin;
  const centerX = width / 2;

  drawBubbleShape(context, bubbleX, bubbleY, bubbleWidth, bubbleHeight, fontSize * 0.5, fontSize * 0.7);
  context.fillStyle = "#ffffff";
  context.fill();
  context.lineWidth = Math.max(2, Math.round(fontSize * 0.05));
  context.strokeStyle = "#2e2118";
  context.stroke();

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#2e2118";
  context.font = lineFont;
  rows.forEach((row, index) => {
    context.fillText(row, centerX, bubbleY + paddingY + lineHeight * (index + 0.5));
  });
  if (moodText) {
    context.font = moodFont;
    context.fillStyle = "#5c4a3c";
    context.fillText(
      moodText,
      centerX,
      bubbleY + paddingY + rows.length * lineHeight + moodLineHeight * 0.55,
    );
  }
  return canvas;
}

/* AIなしモード */

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickOfflineResult() {
  const lastLine = readStore(LAST_LINE_KEY);
  const moods = Object.keys(LINES);
  const mood = pickRandom(moods);
  const lines = LINES[mood];
  const choices = lines.filter((line) => line !== lastLine);
  return { mood, line: pickRandom(choices.length ? choices : lines) };
}

/* 撮影から結果までの流れ */

async function askServer(base64) {
  if (!isServerReady() || offlineOnly) return { status: "ai_unavailable" };
  try {
    return await postToServer({ action: "analyze", passphrase: currentPass, image: base64 });
  } catch (error) {
    return { status: "ai_unavailable" };
  }
}

function isUsableAnswer(answer) {
  if (typeof answer.line !== "string" || !answer.line) return false;
  if (Array.from(answer.line).length > MAX_LINE_CHARS) return false;
  return answer.mood === "不明" || Object.prototype.hasOwnProperty.call(LINES, answer.mood);
}

function startLongWaitTimer() {
  $("wait-text").textContent = "サクの気持ちを読んどる…";
  longWaitTimer = setTimeout(() => {
    $("wait-text").textContent = "もうちょっと待ってちょう…";
  }, LONG_WAIT_MS);
}

async function handlePhoto(file) {
  if (busy || !file) return;
  busy = true;
  try {
    const image = await loadImage(file);
    const sendCanvas = drawScaled(image, SEND_LONG_EDGE);
    const dataUrl = sendCanvas.toDataURL("image/jpeg", SEND_JPEG_QUALITY);
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    if (!base64) throw new Error("image export failed");

    $("wait-photo").src = dataUrl;
    showScreen("screen-wait");
    startLongWaitTimer();

    const answer = await askServer(base64);
    clearTimeout(longWaitTimer);

    if (answer.status === "wrong_passphrase") {
      removeStore(PASS_KEY);
      currentPass = "";
      showPassScreen(MESSAGE_WRONG_PASS);
      return;
    }
    if (answer.status === "bad_request") {
      showHome(MESSAGE_PHOTO_ERROR);
      return;
    }

    const isAiAnswer = answer.status === "ok" && isUsableAnswer(answer);
    const { mood, line } = isAiAnswer ? answer : pickOfflineResult();
    writeStore(LAST_LINE_KEY, line);
    await showResult(image, line, mood === "不明" ? "" : mood, !isAiAnswer);
  } catch (error) {
    clearTimeout(longWaitTimer);
    showHome(MESSAGE_PHOTO_ERROR);
  } finally {
    busy = false;
  }
}

async function showResult(image, line, mood, isOffline) {
  const picture = drawPicture(image, line, mood);
  // 共有はボタンを押した直後に始める必要があるので、画像を先に作っておく
  const blob = await canvasToBlob(picture, PICTURE_JPEG_QUALITY);
  pictureFile = new File([blob], `saku-no-kimochi-${Date.now()}.jpg`, { type: "image/jpeg" });

  if (pictureUrl) URL.revokeObjectURL(pictureUrl);
  pictureUrl = URL.createObjectURL(pictureFile);

  const photo = $("result-photo");
  photo.src = pictureUrl;
  photo.alt = mood ? `サクのセリフ「${line}」、気持ちは${mood}` : `サクのセリフ「${line}」`;
  $("result-offline").hidden = !isOffline;
  $("result-message").textContent = "";

  showScreen("screen-result");
  // すでに結果の履歴の上にいるとき(処理中に「進む」を押したときなど)は、履歴を増やさず書きかえる
  if (history.state && history.state.result) {
    history.replaceState({ result: true }, "");
  } else {
    history.pushState({ result: true }, "");
  }
}

/* 結果画面のボタン */

function goBackHome() {
  if (history.state && history.state.result) {
    history.back();
  } else {
    showHome();
  }
}

function downloadPicture() {
  const link = document.createElement("a");
  link.href = pictureUrl;
  link.download = pictureFile.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function handleSave() {
  if (!pictureFile) return;
  if (isIOS()) {
    $("save-panel-photo").src = pictureUrl;
    $("save-panel").hidden = false;
    $("btn-save-close").focus();
    return;
  }
  downloadPicture();
  $("result-message").textContent = "保存したで。写真のアプリか「ダウンロード」を見てちょう";
}

async function handleShare() {
  if (!pictureFile) return;
  const shareData = { files: [pictureFile] };
  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      // 送る画面を自分で閉じただけなら、何も出さない
      if (error.name === "AbortError") return;
      // ボタンを押してから時間がたつと保存が止められることがあるので、保存の案内に切り替える
      $("result-message").textContent = "送る画面が開かんかったで、「保存する」を押してLINEから送ってちょう";
      return;
    }
  }
  downloadPicture();
  $("result-message").textContent = "送る画面が開かんかったで、写真を保存したわ。LINEから送ってちょう";
}

/* 起動 */

currentPass = readStore(PASS_KEY) || "";

function bindPhotoButton(buttonId, inputId) {
  const input = $(inputId);
  $(buttonId).addEventListener("click", () => {
    $("home-message").textContent = "";
    input.value = "";
    input.click();
  });
  input.addEventListener("change", () => handlePhoto(input.files[0]));
}

bindPhotoButton("btn-camera", "input-camera");
bindPhotoButton("btn-album", "input-album");
$("pass-form").addEventListener("submit", handlePassSubmit);
$("pass-skip").addEventListener("click", () => {
  offlineOnly = true;
  showHome();
});
$("btn-again").addEventListener("click", goBackHome);
$("btn-save").addEventListener("click", handleSave);
$("btn-share").addEventListener("click", handleShare);
$("btn-save-close").addEventListener("click", () => {
  $("save-panel").hidden = true;
});

// スマホの「戻る」でアプリが閉じないように、結果画面からはホーム画面に戻す。
// 「進む」で結果画面に戻ってきたときは、さっきの結果をもう一度出す
window.addEventListener("popstate", (event) => {
  $("save-panel").hidden = true;
  if (busy) return;
  if (event.state && event.state.result && pictureFile) {
    showScreen("screen-result");
  } else {
    showHome();
  }
});

// 開き直したときに、前回の結果画面の履歴が残らないようにする
history.replaceState(null, "");

if (isServerReady() && !currentPass) {
  showPassScreen();
} else {
  showHome();
}
