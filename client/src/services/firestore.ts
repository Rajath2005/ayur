// client/src/services/firestore.ts
import { db } from './firebaseClient';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, orderBy, serverTimestamp, DocumentData, Timestamp } from 'firebase/firestore';
import type { Message, Conversation } from '@shared/schema';

// Conversation operations
export async function createConversation(conversationId: string, data: { title: string; userId: string }) {
  const conversationRef = doc(db, 'conversations', conversationId);
  await setDoc(conversationRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const conversationRef = doc(db, 'conversations', conversationId);
  const snapshot = await getDoc(conversationRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: data.title,
    userId: data.userId,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  };
}

// Message operations
export async function createMessage(conversationId: string, messageId: string, data: { 
  role: 'user' | 'assistant';
  content: string;
}) {
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  await setDoc(messageRef, {
    ...data,
    timestamp: serverTimestamp(),
  });
}

export async function updateMessage(conversationId: string, messageId: string, updates: {
  content: string;
}) {
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  await updateDoc(messageRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      role: data.role as 'user' | 'assistant',
      content: data.content,
      conversationId,
      createdAt: data.timestamp?.toDate() || new Date(),
      attachments: data.attachments || null
    } satisfies Message;
  });
}