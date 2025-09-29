import chalk from 'chalk';
import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';

export class ImportCommand implements Command {
  public getName(): string {
    return '--import';
  }

  public execute(...parameters: string[]): void {
    const [filename] = parameters;
    const fileReader = new TSVFileReader(filename.trim());

    try {
      fileReader.read();
      console.info(chalk.bgGreen.black(' Imported data: '));
      console.info(chalk.gray(JSON.stringify(fileReader.toArray(), null, 2)));
    } catch (err) {

      if (!(err instanceof Error)) {
        throw err;
      }

      console.error(chalk.bgRed.white(` Can't import data from file: ${filename} `));
      console.error(chalk.red(`Details: ${err.message}`));
    }
  }
}
