import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditLog extends Document {
    userId: string;
    type: 'NEW_CHAT' | 'BOT_RESPONSE' | 'IMAGE_GENERATION' | 'RESET' | 'REFUND';
    amount: number;
    before: number;
    after: number;
    referenceId?: string; // conversationId, messageId, etc.
    timestamp: Date;
}

const creditLogSchema = new Schema({
    userId: { type: String, required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: ['NEW_CHAT', 'BOT_RESPONSE', 'IMAGE_GENERATION', 'RESET', 'REFUND']
    },
    amount: { type: Number, required: true },
    before: { type: Number, required: true },
    after: { type: Number, required: true },
    referenceId: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
});

export const CreditLog = mongoose.model<ICreditLog>('CreditLog', creditLogSchema);
