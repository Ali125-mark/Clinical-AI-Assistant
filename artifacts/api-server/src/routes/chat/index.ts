import { Router } from "express";
import { db } from "@workspace/db";
import { chatSessionsTable, chatMessagesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { speechToText } from "@workspace/integrations-openai-ai-server/audio";
import { eq, desc, asc } from "drizzle-orm";

const router = Router();

const SYSTEM_PROMPT = `أنت مساعد طبي ذكي متخصص في دعم قرارات الأطباء. دورك هو مساعدة الأطباء في تحليل الأعراض وتقديم المعلومات الطبية.

**تعليمات الرد:**
- تحدث بالعربية دائماً
- كن موجزاً ومنظماً في ردودك
- اطرح أسئلة تشخيصية مستهدفة عند الحاجة لمزيد من المعلومات
- عند وجود معلومات كافية، قدم تحليلاً منظماً

**هيكل الرد عند التحليل الكامل:**
يجب أن يكون ردك JSON صالحاً بهذا الهيكل:
{
  "type": "analysis",
  "text": "ملخص سريري موجز بالعربية",
  "diagnoses": [
    { "name": "اسم التشخيص", "confidence": 0.85, "icd": "ICD-10", "reason": "سبب الترجيح" }
  ],
  "tests": [
    { "name": "اسم الفحص", "type": "مختبر|أشعة|أخرى", "urgency": "روتيني|عاجل|طارئ", "reason": "السبب" }
  ],
  "treatments": [
    { "name": "العلاج", "type": "دواء|إجراء|نمط حياة|إحالة", "desc": "الوصف", "dose": "الجرعة إن وجد" }
  ],
  "followUp": ["سؤال متابعة 1؟", "سؤال متابعة 2؟"],
  "isEmergency": false,
  "emergencyReason": null
}

**عند الحاجة لمزيد من المعلومات:**
{
  "type": "question",
  "text": "رسالة نصية بالعربية تطرح أسئلة تشخيصية",
  "followUp": ["سؤال 1؟", "سؤال 2؟"]
}

**في حالات الطوارئ:**
ضع "isEmergency": true واشرح السبب في "emergencyReason"

**تنبيه مهم:** هذا النظام للمساعدة فقط وليس بديلاً عن الحكم الطبي المهني. يجب التحقق من جميع المقترحات مع الخبرة السريرية.`;

// GET /chat/sessions - list all sessions
router.get("/chat/sessions", async (req, res) => {
  try {
    const sessions = await db
      .select()
      .from(chatSessionsTable)
      .orderBy(desc(chatSessionsTable.updatedAt));
    res.json(sessions);
  } catch (err) {
    req.log.error({ err }, "Failed to list sessions");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /chat/sessions - create new session
router.post("/chat/sessions", async (req, res) => {
  try {
    const { title } = req.body;
    const [session] = await db
      .insert(chatSessionsTable)
      .values({ title: title ?? "محادثة جديدة" })
      .returning();
    res.status(201).json(session);
  } catch (err) {
    req.log.error({ err }, "Failed to create session");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /chat/sessions/:id
router.delete("/chat/sessions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(chatMessagesTable).where(eq(chatMessagesTable.sessionId, id));
    await db.delete(chatSessionsTable).where(eq(chatSessionsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete session");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /chat/sessions/:id/messages
router.get("/chat/sessions/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, id))
      .orderBy(asc(chatMessagesTable.createdAt));
    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to get messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /chat/sessions/:id/messages - send message and get AI response
router.post("/chat/sessions/:id/messages", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    // Save user message
    const [userMsg] = await db
      .insert(chatMessagesTable)
      .values({ sessionId, role: "user", content: content.trim(), analysisData: null })
      .returning();

    // Update session title if first message
    const messageCount = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, sessionId));

    if (messageCount.length <= 1) {
      const shortTitle = content.trim().slice(0, 50);
      await db
        .update(chatSessionsTable)
        .set({ title: shortTitle, updatedAt: new Date() })
        .where(eq(chatSessionsTable.id, sessionId));
    } else {
      await db
        .update(chatSessionsTable)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessionsTable.id, sessionId));
    }

    // Build conversation history for OpenAI
    const allMessages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, sessionId))
      .orderBy(asc(chatMessagesTable.createdAt));

    const history = allMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 4096,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      response_format: { type: "json_object" },
    });

    const aiContent = response.choices[0]?.message?.content ?? "{}";
    let analysisData: Record<string, unknown> | null = null;
    let displayText = "";

    try {
      analysisData = JSON.parse(aiContent);
      displayText = (analysisData?.text as string) ?? aiContent;
    } catch {
      displayText = aiContent;
      analysisData = null;
    }

    // Save AI message
    const [aiMsg] = await db
      .insert(chatMessagesTable)
      .values({ sessionId, role: "assistant", content: displayText, analysisData })
      .returning();

    res.json({ userMessage: userMsg, aiMessage: aiMsg });
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /chat/transcribe - voice to text
router.post("/chat/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: "audioBase64 is required" });
      return;
    }
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const format = (
      mimeType?.includes("mp4") ? "mp4"
      : mimeType?.includes("webm") ? "webm"
      : mimeType?.includes("wav") ? "wav"
      : "m4a"
    ) as "mp4" | "webm" | "wav" | "m4a";
    const text = await speechToText(audioBuffer, format);
    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "Failed to transcribe");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
