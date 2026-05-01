import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const diagnosisSchema = z.object({
  name: z.string(),
  confidence: z.number(),
  description: z.string(),
  icdCode: z.string().nullable().optional(),
});

export const suggestedTestSchema = z.object({
  name: z.string(),
  type: z.enum(["lab", "imaging", "other"]),
  reason: z.string(),
  urgency: z.enum(["routine", "urgent", "stat"]),
});

export const treatmentOptionSchema = z.object({
  name: z.string(),
  type: z.enum(["medication", "procedure", "lifestyle", "referral"]),
  description: z.string(),
  dosageRange: z.string().nullable().optional(),
  contraindications: z.string().nullable().optional(),
  interactions: z.string().nullable().optional(),
});

export const patientCasesTable = pgTable("patient_cases", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  chiefComplaint: text("chief_complaint").notNull(),
  symptoms: text("symptoms").notNull(),
  medicalHistory: text("medical_history"),
  medications: text("medications"),
  allergies: text("allergies"),
  status: text("status").notNull().default("pending"),
  isEmergency: boolean("is_emergency").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const caseAnalysesTable = pgTable("case_analyses", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => patientCasesTable.id, { onDelete: "cascade" }),
  differentialDiagnoses: jsonb("differential_diagnoses").notNull().$type<z.infer<typeof diagnosisSchema>[]>(),
  suggestedTests: jsonb("suggested_tests").notNull().$type<z.infer<typeof suggestedTestSchema>[]>(),
  treatments: jsonb("treatments").notNull().$type<z.infer<typeof treatmentOptionSchema>[]>(),
  followUpQuestions: jsonb("follow_up_questions").notNull().$type<string[]>(),
  isEmergency: boolean("is_emergency").notNull().default(false),
  emergencyReason: text("emergency_reason"),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPatientCaseSchema = createInsertSchema(patientCasesTable).omit({ id: true, createdAt: true, updatedAt: true, isEmergency: true, status: true });
export const updatePatientCaseSchema = insertPatientCaseSchema.partial();

export type InsertPatientCase = z.infer<typeof insertPatientCaseSchema>;
export type UpdatePatientCase = z.infer<typeof updatePatientCaseSchema>;
export type PatientCase = typeof patientCasesTable.$inferSelect;
export type CaseAnalysis = typeof caseAnalysesTable.$inferSelect;
