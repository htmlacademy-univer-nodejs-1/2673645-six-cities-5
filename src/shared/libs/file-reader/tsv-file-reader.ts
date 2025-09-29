import { FileReader } from './file-reader.interface.js';
import { readFileSync } from 'node:fs';
import { Offer, City, Good, HousingType } from '../../types/index.js';

const CITY: Record<string, City> = {
  Paris: 'Paris',
  Cologne: 'Cologne',
  Brussels: 'Brussels',
  Amsterdam: 'Amsterdam',
  Hamburg: 'Hamburg',
  Dusseldorf: 'Dusseldorf',
};

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string
  ) {}

  public read(): void {
    this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
  }

  public toArray(): Offer[] {
    if (!this.rawData)
      throw new Error('File was not read');

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => line.split('\t'))
      .map(([title, description, postDate, cityName, previewImage, images, isPremium, isFavorite, rating, type, bedrooms, maxAdults, price, goods, author, commentsCount, latitude, longitude]) => ({
        title,
        description,
        postDate: new Date(postDate),
        city: CITY[cityName],
        previewImage,
        images: images.split(';'),
        isPremium: isPremium === 'true',
        isFavorite: isFavorite === 'true',
        rating: parseFloat(rating),
        type: type as HousingType,
        bedrooms: parseInt(bedrooms, 10),
        maxAdults: parseInt(maxAdults, 10),
        price: parseInt(price, 10),
        goods: goods.split(';') as Good[],
        author,
        commentsCount: parseInt(commentsCount, 10),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      }));
  }
}
