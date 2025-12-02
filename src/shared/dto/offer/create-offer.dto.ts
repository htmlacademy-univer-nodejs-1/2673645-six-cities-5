import { IsString, IsBoolean, IsNumber, IsArray, IsEnum, Min, Max, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export enum OfferType {
  Apartment = 'apartment',
  House = 'house',
  Room = 'room',
  Hotel = 'hotel'
}

export class CreateOfferDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(10, { message: 'Title must be at least 10 characters' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
    title: string;

  @IsString({ message: 'Description must be a string' })
  @MinLength(20, { message: 'Description must be at least 20 characters' })
  @MaxLength(1024, { message: 'Description must not exceed 1024 characters' })
    description: string;

  @IsString({ message: 'City must be a string' })
  @IsEnum(['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'])
    city: string;

  @IsString({ message: 'Preview image must be a string' })
    previewImage: string;

  @IsArray({ message: 'Images must be an array' })
  @ArrayMinSize(6, { message: 'Must have at least 6 images' })
  @ArrayMaxSize(6, { message: 'Must have exactly 6 images' })
  @IsString({ each: true, message: 'Each image must be a string' })
    images: string[];

  @IsBoolean({ message: 'isPremium must be a boolean' })
    isPremium: boolean;

  @IsEnum(OfferType, { message: 'Type must be one of: apartment, house, room, hotel' })
    type: OfferType;

  @IsNumber({}, { message: 'Bedrooms must be a number' })
  @Min(1, { message: 'Bedrooms must be at least 1' })
  @Max(8, { message: 'Bedrooms must not exceed 8' })
    bedrooms: number;

  @IsNumber({}, { message: 'MaxAdults must be a number' })
  @Min(1, { message: 'MaxAdults must be at least 1' })
  @Max(10, { message: 'MaxAdults must not exceed 10' })
    maxAdults: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(100, { message: 'Price must be at least 100' })
  @Max(100000, { message: 'Price must not exceed 100000' })
    price: number;

  @IsArray({ message: 'Amenities must be an array' })
  @IsString({ each: true, message: 'Each amenity must be a string' })
    amenities: string[];

  @IsString({ message: 'Author ID must be a string' })
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
    this.type = data.type || OfferType.Apartment;
    this.bedrooms = data.bedrooms || 1;
    this.maxAdults = data.maxAdults || 1;
    this.price = data.price || 100;
    this.amenities = data.amenities || [];
    this.authorId = data.authorId || '';
    this.coordinates = data.coordinates || { latitude: 0, longitude: 0 };
  }
}
