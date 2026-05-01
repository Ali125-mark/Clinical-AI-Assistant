import { Router } from "express";
import { db } from "@workspace/db";
import { patientCasesTable, caseAnalysesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { speechToText } from "@workspace/integrations-openai-ai-server/audio";
import { eq, desc } from "drizzle-orm";

const router = Router();

// GET /cases - list all cases
router.get("/cases", async (req, res) => {
  try {
    const cases = await db
      .select()
      .from(patientCasesTable)
      .orderBy(desc(patientCasesTable.createdAt));
    res.json(cases);
  } catch (err) {
    req.log.error({ err }, "Failed to list cases");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /cases - create a new case
router.post("/cases", async (req, res) => {
  try {
    const { patientName, age, gender, chiefComplaint, symptoms, medicalHistory, medications, allergies } = req.body;
    if (!patientName || !chiefComplaint || !symptoms) {
      res.status(400).json({ error: "patientName, chiefComplaint, and symptoms are required" });
      return;
    }
    const [newCase] = await db
      .insert(patientCasesTable)
      .values({ patientName, age: age ?? null, gender: gender ?? null, chiefComplaint, symptoms, medicalHistory: medicalHistory ?? null, medications: medications ?? null, allergies: allergies ?? null })
      .returning();
    res.status(201).json(newCase);
  } catch (err) {
    req.log.error({ err }, "Failed to create case");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /cases/:id - get case with latest analysis
router.get("/cases/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [caseRecord] = await db
      .select()
      .from(patientCasesTable)
      .where(eq(patientCasesTable.id, id));
    if (!caseRecord) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    const [latestAnalysis] = await db
      .select()
      .from(caseAnalysesTable)
      .where(eq(caseAnalysesTable.caseId, id))
      .orderBy(desc(caseAnalysesTable.createdAt))
      .limit(1);
    res.json({ ...caseRecord, latestAnalysis: latestAnalysis ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to get case");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /cases/:id - update a case
router.put("/cases/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { patientName, age, gender, chiefComplaint, symptoms, medicalHistory, medications, allergies } = req.body;
    const [updated] = await db
      .update(patientCasesTable)
      .set({ patientName, age: age ?? null, gender: gender ?? null, chiefComplaint, symptoms, medicalHistory: medicalHistory ?? null, medications: medications ?? null, allergies: allergies ?? null, updatedAt: new Date() })
      .where(eq(patientCasesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update case");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /cases/:id
router.delete("/cases/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(patientCasesTable).where(eq(patientCasesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete case");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /cases/:id/analyses - list analyses
router.get("/cases/:id/analyses", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const analyses = await db
      .select()
      .from(caseAnalysesTable)
      .where(eq(caseAnalysesTable.caseId, id))
      .orderBy(desc(caseAnalysesTable.createdAt));
    res.json(analyses);
  } catch (err) {
    req.log.error({ err }, "Failed to list analyses");
    res.status(500).json({ error: "Internal server error" });
  }
});

const SYSTEM_PROMPT = `You are an expert clinical decision support system (CDSS) assisting physicians. You are NOT replacing a physician - you are providing data-driven assistance only.

Your output must be valid JSON with the following structure:
{
  "differentialDiagnoses": [
    {
      "name": "Diagnosis name",
      "confidence": 0.85,
      "description": "Brief explanation of why this diagnosis fits",
      "icdCode": "ICD-10 code if known"
    }
  ],
  "suggestedTests": [
    {
      "name": "Test name",
      "type": "lab|imaging|other",
      "reason": "Why this test is needed",
      "urgency": "routine|urgent|stat"
    }
  ],
  "treatments": [
    {
      "name": "Treatment name",
      "type": "medication|procedure|lifestyle|referral",
      "description": "Description based on clinical guidelines",
      "dosageRange": "General dosage range if medication (or null)",
      "contraindications": "Key contraindications (or null)",
      "interactions": "Notable drug interactions (or null)"
    }
  ],
  "followUpQuestions": ["Question 1?", "Question 2?"],
  "isEmergency": false,
  "emergencyReason": null,
  "summary": "Brief clinical summary"
}

IMPORTANT DISCLAIMER: Always base diagnoses on presented symptoms. Order differential diagnoses by likelihood (confidence 0.0-1.0). Flag emergencies when you see red flags like chest pain with radiation, stroke symptoms, severe allergic reactions, etc. Treatment suggestions are for informational purposes only and must not replace professional medical judgment.`;

// POST /cases/:id/analyze - AI analysis
router.post("/cases/:id/analyze", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [caseRecord] = await db
      .select()
      .from(patientCasesTable)
      .where(eq(patientCasesTable.id, id));
    if (!caseRecord) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    const userPrompt = `Patient Case:
- Name: ${caseRecord.patientName}
- Age: ${caseRecord.age ?? "Not specified"}
- Gender: ${caseRecord.gender ?? "Not specified"}
- Chief Complaint: ${caseRecord.chiefComplaint}
- Symptoms: ${caseRecord.symptoms}
- Medical History: ${caseRecord.medicalHistory ?? "None reported"}
- Current Medications: ${caseRecord.medications ?? "None reported"}
- Allergies: ${caseRecord.allergies ?? "None reported"}

Please analyze this case and provide differential diagnoses, suggested tests, treatment options, follow-up questions, and flag any emergencies.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let analysisData: {
      differentialDiagnoses: Array<{ name: string; confidence: number; description: string; icdCode?: string | null }>;
      suggestedTests: Array<{ name: string; type: "lab" | "imaging" | "other"; reason: string; urgency: "routine" | "urgent" | "stat" }>;
      treatments: Array<{ name: string; type: "medication" | "procedure" | "lifestyle" | "referral"; description: string; dosageRange?: string | null; contraindications?: string | null; interactions?: string | null }>;
      followUpQuestions: string[];
      isEmergency: boolean;
      emergencyReason: string | null;
      summary: string;
    };

    try {
      analysisData = JSON.parse(content);
    } catch {
      req.log.error({ content }, "Failed to parse AI response");
      res.status(500).json({ error: "Failed to parse AI analysis" });
      return;
    }

    const isEmergency = analysisData.isEmergency ?? false;

    const [analysis] = await db
      .insert(caseAnalysesTable)
      .values({
        caseId: id,
        differentialDiagnoses: analysisData.differentialDiagnoses ?? [],
        suggestedTests: analysisData.suggestedTests ?? [],
        treatments: analysisData.treatments ?? [],
        followUpQuestions: analysisData.followUpQuestions ?? [],
        isEmergency,
        emergencyReason: analysisData.emergencyReason ?? null,
        summary: analysisData.summary ?? "",
      })
      .returning();

    // Update case status
    await db
      .update(patientCasesTable)
      .set({ status: isEmergency ? "emergency" : "analyzed", isEmergency, updatedAt: new Date() })
      .where(eq(patientCasesTable.id, id));

    res.json(analysis);
  } catch (err) {
    req.log.error({ err }, "Failed to analyze case");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /transcribe - Standalone transcription
router.post("/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: "audioBase64 is required" });
      return;
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const format = (mimeType?.includes("mp4") ? "mp4" : mimeType?.includes("webm") ? "webm" : mimeType?.includes("wav") ? "wav" : "m4a") as "mp4" | "webm" | "wav" | "m4a";
    const text = await speechToText(audioBuffer, format);
    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "Failed to transcribe audio");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /cases/:id/transcribe - Voice to text
router.post("/cases/:id/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: "audioBase64 is required" });
      return;
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const format = (mimeType?.includes("mp4") ? "mp4" : mimeType?.includes("webm") ? "webm" : mimeType?.includes("wav") ? "wav" : "m4a") as "mp4" | "webm" | "wav" | "m4a";
    const text = await speechToText(audioBuffer, format);
    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "Failed to transcribe audio");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
