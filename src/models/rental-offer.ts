import { City } from './city.enum.js';
import { Convenience } from './convenience.enum.js';
import { Coordinate } from './coordinate.type.js';
import { HousingType } from './housing-type.enum.js';

export type RentalOffer = {
  name: string;
  offerDescription: string;
  publicationDate: Date;
  city: City;
  previewUrl: string;
  housingImages: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: HousingType;
  roomsCount: number;
  guestsCount: number;
  rentalCost: number;
  convenienceList: Convenience[];
  author: string;
  commentsCount: number;
  offerCoordinates: Coordinate;
}
