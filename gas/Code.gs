// サクの気持ちアプリの中継役です。
// スマホから届いた写真をAIに渡し、返事をスマホへ戻します。
// 写真はどこにも保存せず、ログにも残しません。
//
// スクリプトプロパティに登録するもの
//   GEMINI_API_KEY  AIを使うための鍵(必須)
//   PASSPHRASE      家族の合言葉(必須)
//   GEMINI_MODEL    AIの種類を変えたいときだけ登録(省略可)

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const MOODS = [
  "うれしい", "ごきげん", "甘えたい", "眠い", "寝起き", "おなかすいた",
  "散歩行きたい", "退屈", "不満", "拗ねとる", "びっくり", "警戒",
];
const UNKNOWN_MOOD = "不明";
const UNKNOWN_LINE = "ボクの顔、ちゃんと撮ってちょう";
const MAX_LINE_CHARS = 30;
const MAX_IMAGE_BASE64_CHARS = 5 * 1024 * 1024;
const MAX_ATTEMPTS = 2;

const ENDINGS = ["だがね", "だで", "してちょう", "だわ", "がね", "だて"];
const SPEECH_STYLES = ["お願い", "報告", "つぶやき", "自慢", "問いかけ", "呼びかけ"];

// URLをブラウザで直接開いたときの案内です(アプリは別のURLで動きます)
function doGet() {
  return ContentService
    .createTextOutput("ここは「サクの気持ち」の中継役です。アプリは家族に配ったURLから開いてください。")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  let request;
  try {
    request = JSON.parse(e.postData.contents);
  } catch (error) {
    return jsonResponse({ status: "bad_request" });
  }
  if (!request || typeof request !== "object") {
    return jsonResponse({ status: "bad_request" });
  }

  const properties = PropertiesService.getScriptProperties();
  if (!isPassphraseCorrect(request.passphrase, properties.getProperty("PASSPHRASE"))) {
    return jsonResponse({ status: "wrong_passphrase" });
  }

  if (request.action === "check") {
    return jsonResponse({ status: "ok" });
  }

  if (request.action !== "analyze"
      || typeof request.image !== "string"
      || !request.image
      || request.image.length > MAX_IMAGE_BASE64_CHARS) {
    return jsonResponse({ status: "bad_request" });
  }

  const apiKey = properties.getProperty("GEMINI_API_KEY");
  const model = properties.getProperty("GEMINI_MODEL") || DEFAULT_MODEL;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return jsonResponse({ status: "ai_unavailable" });
  }

  return jsonResponse(readMood(request.image, apiKey, model));
}

function isPassphraseCorrect(input, expected) {
  if (typeof input !== "string" || !expected) return false;
  return normalizePassphrase(input) === normalizePassphrase(expected);
}

// 全角と半角、前後の空白のちがいで家族が困らないようにそろえる
function normalizePassphrase(text) {
  return text.normalize("NFKC").trim();
}

function readMood(imageBase64, apiKey, model) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let response;
    try {
      response = callGemini(buildRequestBody(imageBase64), apiKey, model);
    } catch (error) {
      console.error("Gemini request failed");
      return { status: "ai_unavailable" };
    }

    const code = response.getResponseCode();
    if (code !== 200) {
      // ログには番号だけを残す。写真や鍵は書かない
      console.error("Gemini returned status " + code);
      return { status: "ai_unavailable" };
    }

    const answer = parseAnswer(response.getContentText());
    if (answer) return answer;
    console.warn("Gemini answer did not match the rules");
  }
  return { status: "ai_unavailable" };
}

function callGemini(body, apiKey, model) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/"
    + encodeURIComponent(model) + ":generateContent";
  return UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "x-goog-api-key": apiKey },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });
}

function buildRequestBody(imageBase64) {
  return {
    contents: [{
      role: "user",
      parts: [
        { text: buildPrompt() },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
      ],
    }],
    generationConfig: {
      temperature: 1.0,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          mood: { type: "STRING", enum: MOODS.concat(UNKNOWN_MOOD) },
          line: { type: "STRING" },
        },
        required: ["mood", "line"],
      },
    },
  };
}

function buildPrompt() {
  return [
    "あなたは犬の表情を読む名人です。写真のトイプードル「サク」(男の子)の気持ちを、耳、目、口元、顔の向きから推測してください。",
    "",
    "次のJSONだけを返してください。",
    '{ "mood": "気持ちの種類", "line": "サク本人のセリフ" }',
    "",
    "mood は次の12種のどれか1つにします: " + MOODS.join("、"),
    "",
    "line の条件:",
    "- サク本人が家族に話しかける名古屋弁で、30文字以内にする",
    "- 一人称を使うときは必ず「ボク」にする",
    "- 語尾は「だがね」「だで」「してちょう」「だわ」などの名古屋弁を自然に使う",
    "- 同じ気持ちでも毎回ちがう言い回しにする",
    "- 絵文字と記号は使わない。使ってよい区切りは「、」だけ",
    "- 今回は語尾に「" + pickRandom(ENDINGS) + "」を使うと自然なら使い、話し方は「" + pickRandom(SPEECH_STYLES) + "」にする",
    "",
    "写真に犬が写っていない、または犬の顔が写っていないときは、mood を「不明」にし、line を「" + UNKNOWN_LINE + "」にします。",
  ].join("\n");
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function parseAnswer(responseText) {
  let answer;
  try {
    const data = JSON.parse(responseText);
    const parts = data.candidates[0].content.parts;
    const text = parts.filter((part) => !part.thought).map((part) => part.text || "").join("");
    answer = JSON.parse(text);
  } catch (error) {
    return null;
  }
  if (!answer || typeof answer !== "object") return null;

  if (answer.mood === UNKNOWN_MOOD) {
    return { status: "ok", mood: UNKNOWN_MOOD, line: UNKNOWN_LINE };
  }
  if (MOODS.indexOf(answer.mood) === -1 || typeof answer.line !== "string") return null;

  const line = cleanLine(answer.line);
  const length = Array.from(line).length;
  if (length === 0 || length > MAX_LINE_CHARS) return null;
  return { status: "ok", mood: answer.mood, line };
}

// 文字、数字、読点、句点、長音、三点リーダー以外を取り除く
function cleanLine(text) {
  return text.replace(/[^\p{L}\p{N}\p{M}、。ー…]/gu, "");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// 設定の確認用です。エディタで実行すると、結果が画面下のログに出ます。
function checkSetup() {
  const properties = PropertiesService.getScriptProperties();
  const apiKey = properties.getProperty("GEMINI_API_KEY");
  const passphrase = properties.getProperty("PASSPHRASE");
  const model = properties.getProperty("GEMINI_MODEL") || DEFAULT_MODEL;

  console.log("AIの種類: " + model);
  console.log("合言葉: " + (passphrase ? "登録済み" : "未登録です。PASSPHRASE を登録してください"));
  if (!apiKey) {
    console.log("鍵: 未登録です。GEMINI_API_KEY を登録してください");
    return;
  }
  console.log("鍵: 登録済み");

  const code = callGemini({ contents: [{ parts: [{ text: "こんにちは" }] }] }, apiKey, model).getResponseCode();
  if (code === 200) {
    console.log("AIとの接続: 成功");
  } else if (code === 429) {
    console.log("AIとの接続: 回数の上限です(番号 429)。時間をおいて試してください");
  } else if (code === 404) {
    console.log("AIとの接続: AIの種類が見つかりません(番号 404)。README の6番を見てください");
  } else {
    console.log("AIとの接続: 失敗(番号 " + code + ")。鍵が正しいか確認してください");
  }
}
