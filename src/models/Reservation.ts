import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReservationDocument extends Document {
  bookingCode: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhoto?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string;
  timeSlot: string;
  guestsCount: number;
  seatingArea: string;
  specialOccasion: string;
  specialRequests: string;
  preOrderedItems: Array<{
    menuItem: any;
    quantity: number;
  }>;
  totalEstimatedCost: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema: Schema = new Schema<IReservationDocument>(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    restaurantAddress: { type: String, default: 'Colombo, Sri Lanka' },
    restaurantPhoto: { type: String },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true, index: true, lowercase: true, trim: true },
    guestPhone: { type: String, default: '+94 77 000 0000' },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    guestsCount: { type: Number, required: true, default: 2 },
    seatingArea: { type: String, default: 'indoor_ac' },
    specialOccasion: { type: String, default: 'none' },
    specialRequests: { type: String, default: '' },
    preOrderedItems: [
      {
        menuItem: { type: Schema.Types.Mixed },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalEstimatedCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

const ReservationModel: Model<IReservationDocument> =
  mongoose.models.Reservation || mongoose.model<IReservationDocument>('Reservation', ReservationSchema);

export default ReservationModel;
