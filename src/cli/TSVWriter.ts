import * as fs from 'node:fs';
import { RentalOffer } from '../models/rental-offer.js';

export class TSVWriter {
  private writeStream: fs.WriteStream;
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;

    if (this.fileExist(this.filePath)) {
      fs.writeFileSync(filePath, '');
    }

    this.writeStream = fs.createWriteStream(this.filePath, {
      encoding: 'utf-8',
    });
  }

  public fileExist(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    return true;
  }

  public addRentalOffer(offer: RentalOffer): void {
    const tsvLine = this.transformToTsvLine(offer);
    this.writeStream.write(`${tsvLine}\n`);
  }

  public end(): void {
    this.writeStream.end();
  }

  private transformToTsvLine(offer: RentalOffer): string {
    return [
      offer.name,
      offer.offerDescription,
      offer.publicationDate,
      offer.city,
      offer.previewUrl,
      offer.housingImages.join(', '),
      offer.isPremium,
      offer.isFavorite,
      offer.rating,
      offer.housingType,
      offer.roomsCount,
      offer.guestsCount,
      offer.rentalCost,
      offer.convenienceList.join(', '),
      offer.author,
      offer.commentsCount,
      `${offer.offerCoordinates.latitude}, ${offer.offerCoordinates.longitude}`,
    ].join('\t');
  }
}
