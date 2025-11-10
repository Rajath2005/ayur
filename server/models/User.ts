import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  email: string;
  credits: number;
  plan: 'free' | 'pro' | string;
  lastReset?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, default: '' }, // Not required for Firebase users
  email: { type: String, default: '' }, // Not required for Firebase users
  credits: { type: Number, required: true, default: 40 },
  plan: { type: String, required: true, default: 'free' },
  lastReset: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: false, // We handle createdAt manually
  _id: false // Disable auto-generated _id since we're using custom _id
});

// Add indexes for better query performance
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true }); // Allow multiple empty emails

export const User = mongoose.model<IUser>('User', UserSchema);
