import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  avatarUrl?: string;
  savedPlaceIds: string[];
  preferences: {
    favoriteCuisines: string[];
    priceRange: number[];
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema<IUserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String },
  savedPlaceIds: [{ type: String }],
  preferences: {
    favoriteCuisines: [{ type: String }],
    priceRange: [{ type: Number }],
  },
  createdAt: { type: Date, default: Date.now },
});

const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;
