import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditLog extends Document {
    userId: string;
    type: 'NEW_CHAT' | 'BOT_RESPONSE' | 'IMAGE_GENERATION' | 'RESET' | 'REFUND' | 'MODE_START';
    amount: number;
    before: number;
    after: number;
    mode?: 'GYAAN' | 'VAIDYA' | 'DRISHTI' | 'LEGACY';
    referenceId?: string; // conversationId, messageId, etc.
    clientRequestId?: string;
    timestamp: Date;
}

const creditLogSchema = new Schema({
    userId: { type: String, required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: ['NEW_CHAT', 'BOT_RESPONSE', 'IMAGE_GENERATION', 'RESET', 'REFUND', 'MODE_START']
    },
    amount: { type: Number, required: true },
    before: { type: Number, required: true },
    after: { type: Number, required: true },
    mode: { type: String, enum: ['GYAAN', 'VAIDYA', 'DRISHTI', 'LEGACY'] },
    referenceId: { type: String },
    clientRequestId: { type: String, index: true },
    timestamp: { type: Date, default: Date.now, index: true }
});

export const CreditLog = mongoose.model<ICreditLog>('CreditLog', creditLogSchema);
