import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type { FileReader } from './file-reader.interface.js';

export class TSVFileReader implements FileReader {
  async read(filepath: string): Promise<string[]> {
    const lines: string[] = [];
    const fileStream = createReadStream(filepath, { encoding: 'utf-8' });
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      lines.push(line);
    }

    return lines;
  }
}
