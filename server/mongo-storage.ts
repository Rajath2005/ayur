import { randomUUID } from "crypto";
import {
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Appointment, type InsertAppointment
} from "@shared/schema";
import { IStorage } from "./storage";
import { connectToMongoDB } from "./mongodb";
import { Conversation, IConversation } from "./models/Conversation";
import { Message, IMessage } from "./models/Message";

export class MongoStorage implements IStorage {
  constructor() {
    // Connect to MongoDB when storage is initialized
    connectToMongoDB().catch(error => {
      console.error('❌ Failed to connect to MongoDB in MongoStorage:', error);
      throw new Error('MongoDB connection failed');
    });
  }

  // Users - Firebase Auth handles users, these are placeholder implementations
  async getUser(id: string): Promise<User | undefined> {
    return undefined; // Firebase Auth handles users
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined; // Firebase Auth handles users
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return undefined; // Firebase Auth handles users
  }

  async createUser(user: InsertUser): Promise<User> {
    throw new Error("Use Firebase Auth for user creation");
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    try {
      const conversation = await Conversation.findById(id);
      if (!conversation) return undefined;

      return {
        id: conversation._id,
        userId: conversation.userId,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB getConversation error:', error);
      throw new Error(`Failed to get conversation: ${error}`);
    }
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    try {
      const conversations = await Conversation.find({ userId })
        .sort({ updatedAt: -1 });

      return conversations.map(conv => ({
        id: conv._id,
        userId: conv.userId,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }));
    } catch (error) {
      console.error('MongoDB getConversationsByUserId error:', error);
      throw new Error(`Failed to get conversations: ${error}`);
    }
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    try {
      const now = new Date();
      const id = conversation.id || randomUUID();

      const newConversation = new Conversation({
        _id: id,
        userId: conversation.userId,
        title: conversation.title,
        createdAt: now,
        updatedAt: now,
      });

      await newConversation.save();

      return {
        id: newConversation._id,
        userId: newConversation.userId,
        title: newConversation.title,
        createdAt: newConversation.createdAt,
        updatedAt: newConversation.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB createConversation error:', error);
      throw new Error(`Failed to create conversation: ${error}`);
    }
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    try {
      const updateData: any = { updatedAt: new Date() };
      if (updates.title !== undefined) updateData.title = updates.title;

      const conversation = await Conversation.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      return {
        id: conversation._id,
        userId: conversation.userId,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB updateConversation error:', error);
      throw new Error(`Failed to update conversation: ${error}`);
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      // Delete conversation and all its messages
      await Promise.all([
        Conversation.findByIdAndDelete(id),
        Message.deleteMany({ conversationId: id })
      ]);
    } catch (error) {
      console.error('MongoDB deleteConversation error:', error);
      throw new Error(`Failed to delete conversation: ${error}`);
    }
  }

  // Messages
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    try {
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 });

      return messages.map(msg => ({
        id: msg.messageId,
        conversationId: msg.conversationId,
        role: msg.sender as 'user' | 'assistant' | 'system',
        content: msg.text,
        attachments: null, // Not implemented in current schema
        createdAt: msg.createdAt,
      }));
    } catch (error) {
      console.error('MongoDB getMessagesByConversationId error:', error);
      throw new Error(`Failed to get messages: ${error}`);
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      // Check for duplicate messageId to ensure idempotency
      const existingMessage = await Message.findOne({ messageId: message.id });
      if (existingMessage) {
        // Return existing message if duplicate
        return {
          id: existingMessage.messageId,
          conversationId: existingMessage.conversationId,
          role: existingMessage.sender as 'user' | 'assistant' | 'system',
          content: existingMessage.text,
          attachments: null,
          createdAt: existingMessage.createdAt,
        };
      }

      const newMessage = new Message({
        messageId: message.id || randomUUID(),
        conversationId: message.conversationId,
        sender: message.role,
        text: message.content,
        createdAt: new Date(),
      });

      await newMessage.save();

      return {
        id: newMessage.messageId,
        conversationId: newMessage.conversationId,
        role: newMessage.sender as 'user' | 'assistant' | 'system',
        content: newMessage.text,
        attachments: null,
        createdAt: newMessage.createdAt,
      };
    } catch (error) {
      console.error('MongoDB createMessage error:', error);
      throw new Error(`Failed to create message: ${error}`);
    }
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    try {
      const updateData: any = {};
      if (updates.content !== undefined) updateData.text = updates.content;

      const message = await Message.findOneAndUpdate(
        { messageId: id },
        updateData,
        { new: true }
      );

      if (!message) {
        throw new Error("Message not found");
      }

      return {
        id: message.messageId,
        conversationId: message.conversationId,
        role: message.sender as 'user' | 'assistant' | 'system',
        content: message.text,
        attachments: null,
        createdAt: message.createdAt,
      };
    } catch (error) {
      console.error('MongoDB updateMessage error:', error);
      throw new Error(`Failed to update message: ${error}`);
    }
  }

  async updateMessageByConversation(conversationId: string, messageId: string, updates: Partial<Message>): Promise<Message> {
    return this.updateMessage(messageId, updates);
  }

  // Appointments - keeping placeholder implementations
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    throw new Error("Appointments not implemented in MongoDB storage");
  }

  async getAppointmentsByUserId(userId: string): Promise<Appointment[]> {
    return [];
  }

  // Credits - keeping placeholder implementations
  async getUserCredits?(uid: string): Promise<number> {
    return 40; // Default credits
  }

  async deductCredits?(uid: string, amount = 1, reason = "action"): Promise<number> {
    // Placeholder - would need separate user collection for full implementation
    return 40 - amount;
  }

  async logCreditUsage?(uid: string, deducted: number, reason = "action"): Promise<void> {
    // Placeholder
  }

  async resetCreditsForUser?(uid: string, newCredits = 40): Promise<void> {
    // Placeholder
  }

  async resetCreditsForAllUsers?(newCredits = 40): Promise<void> {
    // Placeholder
  }
}
