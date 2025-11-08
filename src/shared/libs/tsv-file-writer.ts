import { createWriteStream } from 'node:fs';
import { Transform, Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { MockOffer } from '../types/mock-data.type.js';

export class TSVFileWriter {
  async writeOffers(offers: MockOffer[], filepath: string): Promise<void> {
    if (offers.length === 0) {
      throw new Error('No offers to write');
    }

    const readStream = Readable.from(offers);

    let isHeaderWritten = false;
    const tsvTransformStream = new Transform({
      objectMode: true,
      transform: (_encoding: string) => {
        try {
          if (!isHeaderWritten) {
            isHeaderWritten = true;
          }
        } catch (error) { /* empty */ }
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
