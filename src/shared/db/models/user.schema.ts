import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  avatarPath?: string;
  password: string;
  type: 'обычный' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, maxlength: 15 },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatarPath: { type: String, default: null },
    password: { type: String, required: true, minlength: 6, maxlength: 12, select: false },
    type: { type: String, enum: ['обычный', 'pro'], default: 'обычный' }
  },
  { timestamps: true, collection: 'users' }
);

userSchema.index({ email: 1 });
export const UserModel = mongoose.model<IUser>('User', userSchema);
