export class UpdateOfferDto {
  title?: string;
  description?: string;
  previewImage?: string;
  images?: string[];
  isPremium?: boolean;
  price?: number;
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
