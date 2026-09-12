import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  badge?: string;
  role?: string;
  status?: 'active' | 'suspended' | 'banned';
  favoriteCuisines: string[];
  dietaryPreferences: string[];
  savedPlaceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    salt: { type: String },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    bio: { type: String, default: 'Passionate foodie exploring culinary spots.' },
    badge: { type: String, default: 'Gourmet Explorer ★' },
    role: { type: String, default: 'member' },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
    favoriteCuisines: [{ type: String }],
    dietaryPreferences: [{ type: String }],
    savedPlaceIds: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;
