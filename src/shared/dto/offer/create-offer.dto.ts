export class CreateOfferDto {
  title: string;
  description: string;
  city: string;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  type: 'apartment' | 'house' | 'room' | 'hotel';
  bedrooms: number;
  maxAdults: number;
  price: number;
  amenities: string[];
  authorId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };

  constructor(data: Partial<CreateOfferDto>) {
    this.title = data.title || '';
    this.description = data.description || '';
    this.city = data.city || '';
    this.previewImage = data.previewImage || '';
    this.images = data.images || [];
    this.isPremium = data.isPremium || false;
    this.type = data.type || 'apartment';
    this.bedrooms = data.bedrooms || 1;
    this.maxAdults = data.maxAdults || 1;
    this.price = data.price || 100;
    this.amenities = data.amenities || [];
    this.authorId = data.authorId || '';
    this.coordinates = data.coordinates || { latitude: 0, longitude: 0 };
  }
}
