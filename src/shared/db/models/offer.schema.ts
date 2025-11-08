// src/shared/db/models/offer.schema.ts

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
  coordinates: {
    latitude: number;
    longitude: number;
  };
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true, minlength: 10, maxlength: 100 },
    description: { type: String, required: true, minlength: 20, maxlength: 1024 },
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
    rating: { type: Number, required: true, min: 1, max: 5, default: 0 },
    type: {
      type: String,
      enum: ['apartment', 'house', 'room', 'hotel'],
      required: true
    },
    bedrooms: { type: Number, required: true, min: 1, max: 8 },
    maxAdults: { type: Number, required: true, min: 1, max: 10 },
    price: { type: Number, required: true, min: 100, max: 100000 },
    amenities: { type: [String], required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    commentsCount: { type: Number, default: 0 },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    favorites: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'offers'
  }
);

// Индексы
offerSchema.index({ city: 1, publishDate: -1 });
offerSchema.index({ author: 1 });
offerSchema.index({ isPremium: 1 });

export const OfferModel = mongoose.model<IOffer>('Offer', offerSchema);
