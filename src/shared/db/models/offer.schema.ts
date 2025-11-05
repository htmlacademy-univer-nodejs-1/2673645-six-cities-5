import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description: string;
  publishDate: Date;
  city: string;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: 'apartment' | 'house' | 'room' | 'hotel';
  bedrooms: number;
  maxAdults: number;
  price: number;
  amenities: string[];
  author: mongoose.Types.ObjectId;
  commentsCount: number;
  coordinates: { latitude: number; longitude: number };
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true, minlength: 10 },
    description: { type: String, required: true, minlength: 20 },
    publishDate: { type: Date, default: Date.now },
    city: { 
      type: String, 
      required: true,
      enum: ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf']
    },
    previewImage: { type: String, required: true },
    images: { type: [String], required: true },
    isPremium: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
    type: { type: String, enum: ['apartment', 'house', 'room', 'hotel'], required: true },
    bedrooms: { type: Number, required: true, min: 1, max: 8 },
    maxAdults: { type: Number, required: true, min: 1, max: 10 },
    price: { type: Number, required: true, min: 100, max: 100000 },
    amenities: { type: [String], required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    commentsCount: { type: Number, default: 0 },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  { timestamps: true, collection: 'offers' }
);

offerSchema.index({ city: 1, publishDate: -1 });
export const OfferModel = mongoose.model<IOffer>('Offer', offerSchema);
