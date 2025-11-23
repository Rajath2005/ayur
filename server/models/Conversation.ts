import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: string;
  userId: string;
  title: string;
  mode: 'GYAAN' | 'VAIDYA' | 'DRISHTI' | 'LEGACY';
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  mode: { type: String, required: true, default: 'LEGACY', enum: ['GYAAN', 'VAIDYA', 'DRISHTI', 'LEGACY'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  _id: false // Disable auto-generated _id since we're using custom _id
});

// Add indexes for better query performance
ConversationSchema.index({ userId: 1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
