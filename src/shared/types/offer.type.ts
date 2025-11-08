import type { User } from './user.type.js';
import type { CityName, Coordinates } from './city.type.js';

export type HousingType = 'apartment' | 'house' | 'room' | 'hotel';

export type Amenity =
  | 'Breakfast'
  | 'Air conditioning'
  | 'Laptop friendly workspace'
  | 'Baby seat'
  | 'Washer'
  | 'Towels'
  | 'Fridge';

export interface Offer {
  title: string;
  description: string;
  publishDate: Date;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HousingType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  amenities: Amenity[];
  author: User;
  commentsCount?: number;
  coordinates: Coordinates;
}
