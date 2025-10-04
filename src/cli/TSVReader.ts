import * as fs from 'node:fs';
import * as readline from 'node:readline';
import { City } from '../models/city.enum.js';
import { Convenience } from '../models/convenience.enum.js';
import { HousingType } from '../models/housing-type.enum.js';
import { RentalOffer } from '../models/rental-offer.js';

function parseEnum<T>(enumObj: T, key: string): T[keyof T] {
  return enumObj[key as keyof T];
}

export class TSVReader {
  private readStream: fs.ReadStream;
  private getNextLine: AsyncIterableIterator<string>;
  private countRentalOffers: number;

  constructor(filePath: string) {
    this.readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

    this.getNextLine = readline
      .createInterface({
        input: this.readStream,
        crlfDelay: Infinity,
      })[Symbol.asyncIterator]();

    this.countRentalOffers = 0;
  }

  public async getRentalOffer(): Promise<[RentalOffer, number] | undefined> {
    const { value, done } = await this.getNextLine.next();

    if (done) {
      this.readStream.close();
      return undefined;
    }

    this.countRentalOffers++;
    const rentalOffer = this.parseRentalOffer(value.split('\t'));
    
    return [rentalOffer, this.countRentalOffers];
  }

  public parseRentalOffer(fields: string[]): RentalOffer {
    return {
      name: fields[0],
      offerDescription: fields[1],
      publicationDate: new Date(fields[2]),
      city: parseEnum(City, fields[3]),
      previewUrl: fields[4],
      housingImages: fields[5] as unknown as string[],
      isPremium: fields[6] === 'true',
      isFavorite: fields[7] === 'true',
      rating: parseFloat(fields[8]),
      housingType: parseEnum(HousingType, fields[9]),
      roomsCount: parseInt(fields[10], 10),
      guestsCount: parseInt(fields[11], 10),
      rentalCost: parseInt(fields[12], 10),
      convenienceList: fields[13] as unknown as Convenience[],
      author: fields[14],
      commentsCount: parseInt(fields[15], 10),
      offerCoordinates: {
        latitude: parseFloat(fields[16].split(', ')[0]),
        longitude: parseFloat(fields[16].split(', ')[1]),
      },
    };
  }
}
