import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  email: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  cycleStart: Date;
  cycleEnd: Date;
  plan: 'free' | 'pro' | string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, default: '' }, // Not required for Firebase users
  email: { type: String, default: '' }, // Not required for Firebase users
  totalCredits: { type: Number, required: true, default: 40 },
  usedCredits: { type: Number, required: true, default: 0 },
  remainingCredits: { type: Number, required: true, default: 40 },
  cycleStart: { type: Date, required: true, default: Date.now },
  cycleEnd: { type: Date, required: true, default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
  plan: { type: String, required: true, default: 'free' },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: false, // We handle createdAt manually
  _id: false // Disable auto-generated _id since we're using custom _id
});

// Add indexes for better query performance
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true }); // Allow multiple empty emails

export const User = mongoose.model<IUser>('User', UserSchema);
