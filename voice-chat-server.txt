const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MEDICAL_SYSTEM_PROMPT = `أنت مساعد طبي متخصص. مهمتك تقديم معلومات طبية دقيقة ومفيدة.
يجب أن تكون إجاباتك واضحة ومفهومة، وتذكّر المستخدم دائماً بضرورة استشارة طبيب متخصص.
لا تقدم تشخيصات قطعية، بل اشرح الأعراض والحالات الطبية بشكل عام.
أجب باللغة العربية دائماً.`;

/**
 * تحويل الصوت إلى نص باستخدام Whisper
 */
router.post("/voice/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "لم يتم إرسال ملف صوتي" });
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
      language: "ar",
    });

    fs.unlinkSync(req.file.path);
    res.json({ text: transcription.text });
  } catch (error) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `فشل تحويل الصوت: ${error.message}` });
  }
});

/**
 * إرسال النص إلى OpenAI والرد بصوت
 */
router.post("/voice/chat/openai", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "الرسالة مطلوبة" });

  try {
    // الحصول على الرد النصي
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: MEDICAL_SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message },
      ],
    });

    const replyText = completion.choices[0].message.content;

    // تحويل الرد إلى صوت
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: replyText,
    });

    const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    res.json({
      text: replyText,
      audio: `data:audio/mp3;base64,${audioBase64}`,
      model: "openai",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * إرسال النص إلى Gemini والرد بصوت (TTS عبر OpenAI)
 */
router.post("/voice/chat/gemini", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "الرسالة مطلوبة" });

  try {
    // الحصول على الرد من Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: MEDICAL_SYSTEM_PROMPT,
    });

    const geminiHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    const replyText = result.response.text();

    // تحويل الرد إلى صوت عبر OpenAI TTS
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: replyText,
    });

    const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    res.json({
      text: replyText,
      audio: `data:audio/mp3;base64,${audioBase64}`,
      model: "gemini",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * حفظ سجل المحادثة كملف نصي
 */
router.post("/voice/save-history", (req, res) => {
  const { history = [], sessionId } = req.body;
  if (!history.length) return res.status(400).json({ error: "لا توجد محادثة للحفظ" });

  const logsDir = path.join(__dirname, "conversation-logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

  const date = new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });
  const fileName = `محادثة-${Date.now()}.txt`;
  const filePath = path.join(logsDir, fileName);

  let content = `═══════════════════════════════════\n`;
  content += `   سجل محادثة المساعد الطبي\n`;
  content += `   التاريخ: ${date}\n`;
  content += `═══════════════════════════════════\n\n`;

  history.forEach((msg, i) => {
    const role = msg.role === "user" ? "👤 المستخدم" : `🤖 المساعد (${msg.model || "AI"})`;
    content += `${role}:\n${msg.content}\n\n`;
    if (i < history.length - 1) content += `───────────────────────────────────\n\n`;
  });

  content += `\n═══════════════════════════════════\n`;
  content += `تنبيه: هذه المعلومات للاستئناس فقط.\nيُرجى دائماً استشارة طبيب متخصص.\n`;

  fs.writeFileSync(filePath, content, "utf8");

  res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(filePath, () => {
    fs.unlinkSync(filePath);
  });
});

/**
 * عرض جميع المحادثات المحفوظة
 */
router.get("/voice/history", (req, res) => {
  const logsDir = path.join(__dirname, "conversation-logs");
  if (!fs.existsSync(logsDir)) return res.json({ files: [] });

  const files = fs.readdirSync(logsDir).map((f) => ({
    name: f,
    created: fs.statSync(path.join(logsDir, f)).birthtime,
  }));

  res.json({ files });
});

module.exports = router;
