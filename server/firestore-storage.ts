import { admin } from "./firebaseAdmin";
import { 
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Appointment, type InsertAppointment 
} from "@shared/schema";
import { IStorage } from "./storage";

export class FirestoreStorage implements IStorage {
  private db: admin.firestore.Firestore;
  
  constructor() {
    try {
      this.db = admin.firestore();
    } catch (error) {
      console.error('❌ Failed to initialize Firestore:', error);
      throw new Error('Firestore initialization failed. Check Firebase Admin credentials.');
    }
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
    const doc = await this.db.collection("conversations").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Conversation;
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    const snapshot = await this.db
      .collection("conversations")
      .where("userId", "==", userId)
      .get();

    const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));

    // Sort in memory since we can't order by updatedAt without an index
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    try {
      const now = admin.firestore.Timestamp.now();
      const docRef = conversation.id 
        ? this.db.collection("conversations").doc(conversation.id)
        : this.db.collection("conversations").doc();
      const data = {
        userId: conversation.userId,
        title: conversation.title,
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(data);
      return { id: docRef.id, ...data, createdAt: now.toDate(), updatedAt: now.toDate() };
    } catch (error) {
      console.error('Firestore createConversation error:', error);
      throw new Error(`Failed to create conversation: ${error}`);
    }
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const docRef = this.db.collection("conversations").doc(id);
    const updateData = {
      ...updates,
      updatedAt: admin.firestore.Timestamp.now(),
    };
    await docRef.update(updateData);
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    const batch = this.db.batch();
    
    // Delete conversation
    batch.delete(this.db.collection("conversations").doc(id));
    
    // Delete all messages in the conversation
    const messagesSnapshot = await this.db
      .collection("conversations")
      .doc(id)
      .collection("messages")
      .get();
    
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  // Messages - stored in /conversations/{conversationId}/messages/{messageId}
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const snapshot = await this.db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId,
        role: data.role,
        content: data.content,
        attachments: data.attachments || null,
        createdAt: data.timestamp?.toDate() || new Date(),
      } as Message;
    });
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const docRef = message.id 
      ? this.db.collection("conversations").doc(message.conversationId).collection("messages").doc(message.id)
      : this.db.collection("conversations").doc(message.conversationId).collection("messages").doc();
    
    const data = {
      id: message.id || docRef.id,
      role: message.role,
      content: message.content,
      attachments: message.attachments || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await docRef.set(data);
    
    return {
      id: docRef.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      attachments: message.attachments || null,
      createdAt: new Date(),
    };
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    // Find the message across all conversations
    const conversationsSnapshot = await this.db.collection("chats").get();
    
    for (const conversationDoc of conversationsSnapshot.docs) {
      const messageRef = conversationDoc.ref.collection("messages").doc(id);
      const messageDoc = await messageRef.get();
      
      if (messageDoc.exists) {
        const updateData: any = {};
        if (updates.content !== undefined) updateData.content = updates.content;
        if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
        
        await messageRef.update(updateData);
        
        const updatedDoc = await messageRef.get();
        const data = updatedDoc.data()!;
        
        return {
          id: updatedDoc.id,
          conversationId: conversationDoc.id,
          role: data.role,
          content: data.content,
          attachments: data.attachments || null,
          createdAt: data.timestamp?.toDate() || new Date(),
        };
      }
    }
    
    throw new Error("Message not found");
  }

  async updateMessageByConversation(conversationId: string, messageId: string, updates: Partial<Message>): Promise<Message> {
    const messageRef = this.db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .doc(messageId);
    
    const updateData: any = {};
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
    
    await messageRef.update(updateData);
    
    const updatedDoc = await messageRef.get();
    const data = updatedDoc.data()!;
    
    return {
      id: updatedDoc.id,
      conversationId,
      role: data.role,
      content: data.content,
      attachments: data.attachments || null,
      createdAt: data.timestamp?.toDate() || new Date(),
    };
  }

  // Appointments
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const docRef = this.db.collection("appointments").doc();
    const data = {
      userId: appointment.userId,
      conversationId: appointment.conversationId ?? null,
      appointmentLink: appointment.appointmentLink ?? null,
      reason: appointment.reason ?? null,
      createdAt: admin.firestore.Timestamp.now(),
    };
    await docRef.set(data);
    return { id: docRef.id, ...data, createdAt: data.createdAt.toDate() };
  }

  async getAppointmentsByUserId(userId: string): Promise<Appointment[]> {
    const snapshot = await this.db
      .collection("appointments")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }
}