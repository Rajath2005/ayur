import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  messageId: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: Date;
  roleData?: any;
}

const MessageSchema = new Schema<IMessage>({
  messageId: { type: String, required: true, unique: true, index: true },
  conversationId: { type: String, required: true, index: true },
  sender: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  roleData: { type: Schema.Types.Mixed },
}, {
  timestamps: false, // We handle createdAt manually
});

// Add compound index for conversation queries
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
