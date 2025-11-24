import mongoose, { Schema, Document } from 'mongoose';

export interface ICookieConsent extends Document {
    _id: string;
    userId: string | null;
    deviceId: string;
    preferences: {
        essential: boolean;
        analytics: boolean;
        personalization: boolean;
        ai_logs: boolean;
    };
    acceptedAll: boolean;
    timestamp: Date;
    updatedAt: Date;
}

const CookieConsentSchema = new Schema<ICookieConsent>({
    _id: { type: String, required: true },
    userId: { type: String, default: null, index: true },
    deviceId: { type: String, required: true, index: true },
    preferences: {
        essential: { type: Boolean, default: true },
        analytics: { type: Boolean, default: false },
        personalization: { type: Boolean, default: false },
        ai_logs: { type: Boolean, default: false },
    },
    acceptedAll: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Create compound index for efficient lookups
CookieConsentSchema.index({ userId: 1, deviceId: 1 });

export const CookieConsent = mongoose.model<ICookieConsent>('CookieConsent', CookieConsentSchema);
