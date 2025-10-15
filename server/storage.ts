import { 
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Appointment, type InsertAppointment 
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface with all CRUD operations
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  
  // Messages
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Appointments
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByUserId(userId: string): Promise<Appointment[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private appointments: Map<string, Appointment>;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.appointments = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter((conv) => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    const updated = { 
      ...conversation, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
    // Delete associated messages
    Array.from(this.messages.entries()).forEach(([msgId, msg]) => {
      if (msg.conversationId === id) {
        this.messages.delete(msgId);
      }
    });
  }

  // Messages
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  // Appointments
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointmentsByUserId(userId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter((appt) => appt.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Use database storage if DATABASE_URL is available, otherwise use in-memory
import { DbStorage } from "./db-storage";

export const storage = process.env.DATABASE_URL 
  ? new DbStorage() 
  : new MemStorage();
