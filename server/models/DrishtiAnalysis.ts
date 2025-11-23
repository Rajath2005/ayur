import mongoose, { Schema, Document } from 'mongoose';

export interface IDrishtiAnalysis extends Document {
    _id: string;
    userId: string;
    analysisId: string;
    clientRequestId: string;
    storagePath?: string;
    status: 'reserved' | 'uploaded' | 'processing' | 'completed' | 'failed';
    visualReport?: any;
    refundLogId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DrishtiAnalysisSchema = new Schema<IDrishtiAnalysis>({
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    analysisId: { type: String, required: true, unique: true },
    clientRequestId: { type: String, required: true, index: true },
    storagePath: { type: String },
    status: {
        type: String,
        required: true,
        enum: ['reserved', 'uploaded', 'processing', 'completed', 'failed'],
        default: 'reserved'
    },
    visualReport: { type: Schema.Types.Mixed },
    refundLogId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    _id: false
});

export const DrishtiAnalysis = mongoose.model<IDrishtiAnalysis>('DrishtiAnalysis', DrishtiAnalysisSchema);
