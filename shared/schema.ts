import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Note: These schemas are kept for backward compatibility but MongoDB models are used for storage
// Conversations collection (MongoDB)
export interface MongoConversation {
  id: string; // UUID
  userId: string; // Firebase UID
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// Messages collection (MongoDB)
export interface MongoMessage {
  id: string; // messageId - UUID, unique
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments: any; // Array of file URLs/metadata or null
  createdAt: Date;
}

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  credits: integer("credits").notNull().default(40),
  plan: text("plan").default("free"),
  lastReset: timestamp("last_reset"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Legacy Drizzle schemas (kept for compatibility)
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  attachments: jsonb("attachments"), // Array of file URLs/metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Appointments table (for storing appointment links/requests)
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
  appointmentLink: text("appointment_link"),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().optional(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  createdAt: true,
}).extend({
  id: z.string().optional(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register schema
export const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Chat message schema
export const chatMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, "Message cannot be empty"),
  attachments: z.array(z.any()).optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
