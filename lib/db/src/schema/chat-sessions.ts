import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chatSessionsTable = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("محادثة جديدة"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ChatSession = typeof chatSessionsTable.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
