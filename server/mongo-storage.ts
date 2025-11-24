import { randomUUID } from "crypto";
import {
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Appointment, type InsertAppointment
} from "@shared/schema";
import { IStorage } from "./storage";
import { connectToMongoDB } from "./mongodb";
import { Conversation as ConversationModel, IConversation } from "./models/Conversation";
import { Message as MessageModel, IMessage } from "./models/Message";
import { User as UserModel } from "./models/User";
import { CreditLog } from "./models/CreditLog";
import { VaidhyaSession, IVaidhyaSession } from "./models/VaidhyaSession";
import { DrishtiAnalysis, IDrishtiAnalysis } from "./models/DrishtiAnalysis";

export class MongoStorage implements IStorage {
  constructor() {
    // Connect to MongoDB when storage is initialized
    connectToMongoDB().then(async () => {
      try {
        console.log('🔍 [MongoStorage] Starting index audit...');
        const collection = UserModel.collection;
        const indexes = await collection.indexes();

        console.log('📋 [MongoStorage] Current indexes:', JSON.stringify(indexes, null, 2));

        // Check for the specific problematic index 'email_1'
        const emailIndex = indexes.find(idx => idx.name === 'email_1');

        if (emailIndex) {
          console.log('⚠️ [MongoStorage] Found problematic "email_1" index. Dropping it safely...');
          await collection.dropIndex('email_1');
          console.log('✅ [MongoStorage] Successfully dropped "email_1" index.');
        } else {
          console.log('✅ [MongoStorage] No problematic "email_1" index found.');
        }
      } catch (error: any) {
        // Log but don't crash - connection might be successful even if index ops fail
        console.error('⚠️ [MongoStorage] Index audit warning:', error.message);
      }
    }).catch(error => {
      console.error('❌ [MongoStorage] Failed to connect to MongoDB:', error);
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
      const conversation = await ConversationModel.findById(id);
      if (!conversation) return undefined;

      return {
        id: conversation._id,
        userId: conversation.userId,
        title: conversation.title,
        mode: conversation.mode,
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
      const conversations = await ConversationModel.find({ userId })
        .sort({ updatedAt: -1 });

      return conversations.map(conv => ({
        id: conv._id,
        userId: conv.userId,
        title: conv.title,
        mode: conv.mode,
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

      const newConversation = new ConversationModel({
        _id: id,
        userId: conversation.userId,
        title: conversation.title,
        mode: conversation.mode || 'LEGACY',
        createdAt: now,
        updatedAt: now,
      });

      await newConversation.save();

      return {
        id: newConversation._id,
        userId: newConversation.userId,
        title: newConversation.title,
        mode: newConversation.mode,
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
      if (updates.mode !== undefined) updateData.mode = updates.mode;

      const conversation = await ConversationModel.findByIdAndUpdate(
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
        mode: conversation.mode,
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
        ConversationModel.findByIdAndDelete(id),
        MessageModel.deleteMany({ conversationId: id })
      ]);
    } catch (error) {
      console.error('MongoDB deleteConversation error:', error);
      throw new Error(`Failed to delete conversation: ${error}`);
    }
  }

  // Messages
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    try {
      const messages = await MessageModel.find({ conversationId })
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
      const existingMessage = await MessageModel.findOne({ messageId: message.id });
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

      const newMessage = new MessageModel({
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

      const message = await MessageModel.findOneAndUpdate(
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

  // Credits - implemented with MongoDB User collection
  async getUserCredits(uid: string): Promise<number> {
    try {
      const now = new Date();
      const cycleEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days

      // Atomically find user or create if not exists (upsert)
      // Also check for cycle reset in the same operation if possible, 
      // but for simplicity we'll just ensure existence first.
      let user = await UserModel.findById(uid);

      if (!user) {
        user = await UserModel.findOneAndUpdate(
          { _id: uid },
          {
            $setOnInsert: {
              _id: uid,
              username: uid,
              password: '',
              totalCredits: 40,
              usedCredits: 0,
              remainingCredits: 40,
              cycleStart: now,
              cycleEnd: cycleEnd,
              plan: 'free',
              createdAt: now,
            }
          },
          { upsert: true, new: true }
        );
      }

      // Check if cycle has expired and reset if needed
      if (user && now > user.cycleEnd) {
        await this.resetCreditsForUser(uid);
        return 40;
      }

      return user ? user.remainingCredits : 40;
    } catch (error) {
      console.error('MongoDB getUserCredits error:', error);
      return 40; // Default on error
    }
  }

  async getUserCreditsDetails(uid: string): Promise<{ totalCredits: number; cycleStart: Date; cycleEnd: Date } | null> {
    try {
      const user = await UserModel.findById(uid);
      if (!user) return null;
      return {
        totalCredits: user.totalCredits,
        cycleStart: user.cycleStart,
        cycleEnd: user.cycleEnd
      };
    } catch (error) {
      console.error('MongoDB getUserCreditsDetails error:', error);
      return null;
    }
  }

  async deductCredits(uid: string, amount: number, reason: string, mode?: string, clientRequestId?: string): Promise<number> {
    const executeDeduction = async (retryCount = 0): Promise<number> => {
      try {
        const now = new Date();
        const cycleEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days

        // Ensure user exists first (upsert)
        await UserModel.findOneAndUpdate(
          { _id: uid },
          {
            $setOnInsert: {
              _id: uid,
              username: uid,
              password: '',
              totalCredits: 40,
              usedCredits: 0,
              remainingCredits: 40,
              cycleStart: now,
              cycleEnd: cycleEnd,
              plan: 'free',
              createdAt: now,
            }
          },
          { upsert: true }
        );

        // Check for cycle reset
        const user = await UserModel.findById(uid);
        if (user && now > user.cycleEnd) {
          await this.resetCreditsForUser(uid);
        }

        // Atomic deduction
        const updatedUser = await UserModel.findOneAndUpdate(
          {
            _id: uid,
            remainingCredits: { $gte: amount }
          },
          {
            $inc: {
              usedCredits: amount,
              remainingCredits: -amount
            }
          },
          { new: true }
        );

        if (!updatedUser) {
          const currentUser = await UserModel.findById(uid);
          if (currentUser && currentUser.remainingCredits < amount) {
            throw new Error("Insufficient credits");
          }
          throw new Error("Failed to deduct credits - user state mismatch");
        }

        // Log credit usage
        await this.logCreditUsage(uid, amount, reason, updatedUser.remainingCredits + amount, updatedUser.remainingCredits, mode, clientRequestId);

        return updatedUser.remainingCredits;

      } catch (error: any) {
        // Handle duplicate key error (E11000) with a single retry
        if (error.code === 11000 && retryCount < 1) {
          console.warn(`⚠️ [deductCredits] Duplicate key error encountered (code: ${error.code}). Retrying once...`, {
            keyPattern: error.keyPattern,
            keyValue: error.keyValue
          });
          return executeDeduction(retryCount + 1);
        }

        console.error('❌ [deductCredits] Error:', error);
        throw error;
      }
    };

    return executeDeduction();
  }

  async refundCredits(uid: string, amount: number, reason: string, clientRequestId?: string): Promise<number> {
    try {
      // Atomic increment
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: uid },
        {
          $inc: {
            usedCredits: -amount,
            remainingCredits: amount
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("User not found for refund");
      }

      // Log refund
      await this.logCreditUsage(
        uid,
        amount,
        'REFUND',
        updatedUser.remainingCredits - amount,
        updatedUser.remainingCredits,
        undefined,
        clientRequestId
      );

      return updatedUser.remainingCredits;
    } catch (error) {
      console.error('❌ [refundCredits] Error:', error);
      throw error;
    }
  }

  async logCreditUsage(uid: string, deducted: number, reason: string, before: number, after: number, mode?: string, clientRequestId?: string): Promise<void> {
    try {
      const log = new CreditLog({
        userId: uid,
        type: reason.toUpperCase(),
        amount: deducted,
        before,
        after,
        mode,
        clientRequestId,
        timestamp: new Date()
      });
      await log.save();
    } catch (error) {
      console.error('Failed to log credit usage:', error);
      // Don't throw here to avoid blocking the main flow
    }
  }

  async resetCreditsForUser(uid: string, newCredits = 40): Promise<void> {
    const now = new Date();
    const cycleEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days

    await UserModel.findByIdAndUpdate(uid, {
      totalCredits: newCredits,
      usedCredits: 0,
      remainingCredits: newCredits,
      cycleStart: now,
      cycleEnd: cycleEnd,
    });

    // Log the reset
    await this.logCreditUsage(uid, 0, 'RESET', 0, newCredits);
  }

  async resetCreditsForAllUsers(newCredits = 40): Promise<void> {
    // This is a heavy operation, should be done in batches in production
    // For now we'll just find users who need reset
    const now = new Date();
    const usersToReset = await UserModel.find({ cycleEnd: { $lt: now } });

    for (const user of usersToReset) {
      await this.resetCreditsForUser(user._id, newCredits);
    }
  }

  async getCreditLogs(uid: string, limit: number = 5): Promise<any[]> {
    try {
      const logs = await CreditLog.find({ userId: uid })
        .sort({ timestamp: -1 })
        .limit(limit);

      return logs.map(log => ({
        id: log._id,
        type: log.type,
        amount: log.amount,
        before: log.before,
        after: log.after,
        timestamp: log.timestamp
      }));
    } catch (error) {
      console.error('MongoDB getCreditLogs error:', error);
      return [];
    }
  }

  // User Profile methods
  async getUserProfile(userId: string): Promise<any | null> {
    try {
      const { UserProfile } = await import('./models/UserProfile');
      const profile = await UserProfile.findOne({ userId });

      if (!profile) return null;

      return {
        id: profile._id,
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        phone: profile.phone,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB getUserProfile error:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, data: any): Promise<any> {
    try {
      const { UserProfile } = await import('./models/UserProfile');

      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            userId,
            createdAt: new Date(),
          }
        },
        { upsert: true, new: true }
      );

      return {
        id: profile._id,
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        phone: profile.phone,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB updateUserProfile error:', error);
      throw new Error(`Failed to update profile: ${error}`);
    }
  }

  // User Settings methods
  async getUserSettings(userId: string): Promise<any | null> {
    try {
      const { UserSettings } = await import('./models/UserSettings');
      const settings = await UserSettings.findOne({ userId });

      if (!settings) return null;

      return {
        id: settings._id,
        userId: settings.userId,
        theme: settings.theme,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        profileVisibility: settings.profileVisibility,
        updatedAt: settings.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB getUserSettings error:', error);
      return null;
    }
  }

  async updateUserSettings(userId: string, data: any): Promise<any> {
    try {
      const { UserSettings } = await import('./models/UserSettings');

      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            userId,
          }
        },
        { upsert: true, new: true }
      );

      return {
        id: settings._id,
        userId: settings.userId,
        theme: settings.theme,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        profileVisibility: settings.profileVisibility,
        updatedAt: settings.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB updateUserSettings error:', error);
      throw new Error(`Failed to update settings: ${error}`);
    }
  }

  // Vaidhya Session
  async createVaidhyaSession(session: any): Promise<any> {
    try {
      const newSession = new VaidhyaSession({
        _id: randomUUID(),
        ...session,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newSession.save();
      return newSession.toObject();
    } catch (error) {
      console.error('MongoDB createVaidhyaSession error:', error);
      throw error;
    }
  }

  async getVaidhyaSession(conversationId: string): Promise<any> {
    try {
      const session = await VaidhyaSession.findOne({ conversationId });
      return session ? session.toObject() : null;
    } catch (error) {
      console.error('MongoDB getVaidhyaSession error:', error);
      throw error;
    }
  }

  async updateVaidhyaSession(conversationId: string, updates: any): Promise<any> {
    try {
      const session = await VaidhyaSession.findOneAndUpdate(
        { conversationId },
        { $set: { ...updates, updatedAt: new Date() } },
        { new: true }
      );
      return session ? session.toObject() : null;
    } catch (error) {
      console.error('MongoDB updateVaidhyaSession error:', error);
      throw error;
    }
  }

  // Drishti Analysis
  async createDrishtiAnalysis(analysis: any): Promise<any> {
    try {
      const newAnalysis = new DrishtiAnalysis({
        _id: randomUUID(),
        ...analysis,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newAnalysis.save();
      return newAnalysis.toObject();
    } catch (error) {
      console.error('MongoDB createDrishtiAnalysis error:', error);
      throw error;
    }
  }

  async getDrishtiAnalysis(analysisId: string): Promise<any> {
    try {
      const analysis = await DrishtiAnalysis.findOne({ analysisId });
      return analysis ? analysis.toObject() : null;
    } catch (error) {
      console.error('MongoDB getDrishtiAnalysis error:', error);
      throw error;
    }
  }

  async updateDrishtiAnalysis(analysisId: string, updates: any): Promise<any> {
    try {
      const analysis = await DrishtiAnalysis.findOneAndUpdate(
        { analysisId },
        { $set: { ...updates, updatedAt: new Date() } },
        { new: true }
      );
      return analysis ? analysis.toObject() : null;
    } catch (error) {
      console.error('MongoDB updateDrishtiAnalysis error:', error);
      throw error;
    }
  }

  // Cookie Consent methods
  async saveCookieConsent(data: {
    userId: string | null;
    deviceId: string;
    preferences: {
      essential: boolean;
      analytics: boolean;
      personalization: boolean;
      ai_logs: boolean;
    };
    acceptedAll: boolean;
  }): Promise<any> {
    try {
      const { CookieConsent } = await import('./models/CookieConsent');
      const now = new Date();

      // Find existing consent by userId or deviceId
      const query = data.userId
        ? { userId: data.userId }
        : { deviceId: data.deviceId, userId: null };

      const consent = await CookieConsent.findOneAndUpdate(
        query,
        {
          $set: {
            userId: data.userId,
            deviceId: data.deviceId,
            preferences: data.preferences,
            acceptedAll: data.acceptedAll,
            updatedAt: now,
          },
          $setOnInsert: {
            _id: randomUUID(),
            timestamp: now,
          }
        },
        { upsert: true, new: true }
      );

      return {
        id: consent._id,
        userId: consent.userId,
        deviceId: consent.deviceId,
        preferences: consent.preferences,
        acceptedAll: consent.acceptedAll,
        timestamp: consent.timestamp,
        updatedAt: consent.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB saveCookieConsent error:', error);
      throw new Error(`Failed to save cookie consent: ${error}`);
    }
  }

  async getCookieConsent(userId: string | null, deviceId: string): Promise<any | null> {
    try {
      const { CookieConsent } = await import('./models/CookieConsent');

      // Try to find by userId first, then by deviceId
      let consent;
      if (userId) {
        consent = await CookieConsent.findOne({ userId });
      }

      if (!consent) {
        consent = await CookieConsent.findOne({ deviceId, userId: null });
      }

      if (!consent) return null;

      return {
        id: consent._id,
        userId: consent.userId,
        deviceId: consent.deviceId,
        preferences: consent.preferences,
        acceptedAll: consent.acceptedAll,
        timestamp: consent.timestamp,
        updatedAt: consent.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB getCookieConsent error:', error);
      return null;
    }
  }

  async hasUserConsented(userId: string | null, deviceId: string, category?: string): Promise<boolean> {
    try {
      const consent = await this.getCookieConsent(userId, deviceId);

      if (!consent) return false;

      // If checking specific category
      if (category) {
        return consent.preferences[category] === true;
      }

      // If no category specified, check if user has made any choice
      return true;
    } catch (error) {
      console.error('MongoDB hasUserConsented error:', error);
      return false;
    }
  }
}
