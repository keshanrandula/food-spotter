import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurantDocument extends Document {
  placeId: string;
  name: string;
  location: string;
  aiSummary?: string;
  rating: number;
  cuisine?: string;
  priceLevel?: number;
  address?: string;
  photoUrl?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
}

const RestaurantSchema: Schema = new Schema<IRestaurantDocument>({
  placeId: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  aiSummary: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  cuisine: { type: String, default: 'General' },
  priceLevel: { type: Number, default: 2 },
  address: { type: String },
  photoUrl: { type: String },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const RestaurantModel: Model<IRestaurantDocument> =
  mongoose.models.Restaurant || mongoose.model<IRestaurantDocument>('Restaurant', RestaurantSchema);

export default RestaurantModel;
