import { createWriteStream, WriteStream } from 'node:fs';
import { Transform, Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { MockOffer } from '../types/mock-data.type.js';

export class TSVFileWriter {
  async writeOffers(offers: MockOffer[], filepath: string): Promise<void> {
    if (offers.length === 0) {
      throw new Error('No offers to write');
    }

    const headers = Object.keys(offers[0]);

    const readStream = Readable.from(offers);

    let isHeaderWritten = false;
    const tsvTransformStream = new Transform({
      objectMode: true,
      transform: (offer: MockOffer, encoding: string, callback) => {
        try {
          if (!isHeaderWritten) {
            const headerLine = `${headers.join('\t') }\n`;
            isHeaderWritten = true;
            return;
          }

          const values = headers.map((header) => {
            const value = (offer as any)[header] || '';
            return String(value)
              .replace(/\n/g, ' ')
              .replace(/\t/g, ' ')
              .trim();
          });

          const line = `${values.join('\t') }\n`;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
        }
      }
    });

    const writeStream = createWriteStream(filepath, {
      encoding: 'utf-8',
      highWaterMark: 64 * 1024
    });

    try {
      await pipeline(readStream, tsvTransformStream, writeStream);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to write TSV file: ${errorMessage}`);
    }
  }
}
