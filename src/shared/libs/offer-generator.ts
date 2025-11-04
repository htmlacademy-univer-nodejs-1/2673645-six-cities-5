import { 
  getRandomNumber, 
  getRandomArrayElement, 
  getRandomArrayElements,
  getRandomDate,
  formatDate,
  joinArray 
} from './helper.js';
import type { MockOffer } from '../types/mock-data.type.js';
import type { Amenity } from '../types/offer.type.js';
import type { CityName } from '../types/city.type.js';
import type { UserType } from '../types/user.type.js';

export interface GeneratorOffer {
  id: string;
  title: string;
  description: string;
  city: CityName;
  type: 'apartment' | 'house' | 'room' | 'hotel';
  price: number;
  rating: number;
  isPremium: boolean;
  bedrooms: number;
  maxAdults: number;
  amenities: Amenity[];
  previewImage: string;
  images: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const AMENITIES: Amenity[] = [
  'Breakfast',
  'Air conditioning',
  'Laptop friendly workspace',
  'Baby seat',
  'Washer',
  'Towels',
  'Fridge'
];

const USER_NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
  'Iris',
  'Jack'
] as const;

const USER_TYPES: UserType[] = ['обычный', 'pro'];

export class OfferGenerator {
  static generateMockOffer(template: GeneratorOffer): MockOffer {
    const rating = (getRandomNumber(10, 50) / 10).toFixed(1);
    
    const amenities = getRandomArrayElements(
      [...AMENITIES],
      getRandomNumber(1, AMENITIES.length + 1)
    );
    
    const userName = getRandomArrayElement([...USER_NAMES]);
    const userNumber = getRandomNumber(1, 999);
    
    const userType = getRandomArrayElement(USER_TYPES);

    return {
      title: template.title,
      description: template.description,
      publishDate: formatDate(getRandomDate(60)),
      city: template.city,
      previewImage: template.previewImage,
      images: joinArray(template.images, ';'),
      isPremium: String(template.isPremium),
      isFavorite: String(getRandomNumber(0, 2) === 1),
      rating: rating,
      type: template.type,
      bedrooms: String(template.bedrooms),
      maxAdults: String(template.maxAdults),
      price: String(template.price),
      amenities: joinArray(amenities, ';'),
      userName: `${userName} ${userNumber}`,
      userEmail: `user${getRandomNumber(10000, 99999)}@example.com`,
      userType,
      latitude: String(template.coordinates.latitude),
      longitude: String(template.coordinates.longitude)
    };
  }

  static generateMultipleMockOffers(templates: GeneratorOffer[], count: number): MockOffer[] {
    const offers: MockOffer[] = [];
    
    for (let i = 0; i < count; i++) {
      const template = getRandomArrayElement(templates);
      
      offers.push(this.generateMockOffer(template));
    }
    
    return offers;
  }
}
