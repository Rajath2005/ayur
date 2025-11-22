import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
    userId: string; // Firebase UID
    name?: string;
    email: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    email: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp before saving
UserProfileSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
