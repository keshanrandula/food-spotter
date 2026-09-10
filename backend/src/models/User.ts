import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  badge?: string;
  favoriteCuisines: string[];
  dietaryPreferences: string[];
  savedPlaceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatarUrl: { type: String },
    bio: { type: String, default: 'Passionate foodie exploring culinary spots.' },
    badge: { type: String, default: 'Gourmet Explorer ★' },
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
