import type { UserType } from './user.type.js';
import type { HousingType, Amenity } from './offer.type.js';
import type { CityName } from './city.type.js'

export interface MockOffer {
  title: string;
  description: string;
  publishDate: string;
  city: CityName;
  previewImage: string;
  images: string;
  isPremium: string;
  isFavorite: string;
  rating: string;
  type: HousingType;
  bedrooms: string;
  maxAdults: string;
  price: string;
  amenities: Amenity[];
  userName: string;
  userEmail: string;
  userType: UserType;
  latitude: string;
  longitude: string;
}
