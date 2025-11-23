import mongoose, { Schema, Document } from 'mongoose';

export interface IVaidhyaSession extends Document {
    _id: string;
    conversationId: string;
    userId: string;
    questionsAsked: string[];
    answers: { question: string; answer: string }[];
    status: 'collecting' | 'diagnosed';
    createdAt: Date;
    updatedAt: Date;
}

const VaidhyaSessionSchema = new Schema<IVaidhyaSession>({
    _id: { type: String, required: true },
    conversationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    questionsAsked: { type: [String], default: [] },
    answers: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    status: { type: String, required: true, enum: ['collecting', 'diagnosed'], default: 'collecting' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    _id: false
});

export const VaidhyaSession = mongoose.model<IVaidhyaSession>('VaidhyaSession', VaidhyaSessionSchema);
