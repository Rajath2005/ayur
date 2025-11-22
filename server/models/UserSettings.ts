import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
    userId: string; // Firebase UID
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    pushNotifications: boolean;
    profileVisibility: 'public' | 'private';
    updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>({
    userId: { type: String, required: true, unique: true, index: true },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp before saving
UserSettingsSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
