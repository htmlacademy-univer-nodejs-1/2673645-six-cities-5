import { IsString, IsBoolean, IsNumber, IsArray, IsOptional, Min, Max, MinLength, MaxLength, ArrayMaxSize } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(10, { message: 'Title must be at least 10 characters' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
    title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(20, { message: 'Description must be at least 20 characters' })
  @MaxLength(1024, { message: 'Description must not exceed 1024 characters' })
    description?: string;

  @IsOptional()
  @IsString({ message: 'Preview image must be a string' })
    previewImage?: string;

  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @ArrayMaxSize(6, { message: 'Must have at most 6 images' })
  @IsString({ each: true, message: 'Each image must be a string' })
    images?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isPremium must be a boolean' })
    isPremium?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(100, { message: 'Price must be at least 100' })
  @Max(100000, { message: 'Price must not exceed 100000' })
    price?: number;

  @IsOptional()
  @IsArray({ message: 'Amenities must be an array' })
  @IsString({ each: true, message: 'Each amenity must be a string' })
    amenities?: string[];

  constructor(data: Partial<UpdateOfferDto>) {
    if (data.title) {
      this.title = data.title;
    }
    if (data.description) {
      this.description = data.description;
    }
    if (data.previewImage) {
      this.previewImage = data.previewImage;
    }
    if (data.images) {
      this.images = data.images;
    }
    if (data.isPremium !== undefined) {
      this.isPremium = data.isPremium;
    }
    if (data.price) {
      this.price = data.price;
    }
    if (data.amenities) {
      this.amenities = data.amenities;
    }
  }
}
