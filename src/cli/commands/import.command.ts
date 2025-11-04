import chalk from 'chalk';
import type { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/index.js';
import type { MockOffer } from '../../shared/types/index.js';

export class ImportCommand implements Command {
  private fileReader = new TSVFileReader();

  public getName(): string {
    return '--import';
  }

  private parseOffer(line: string, headers: string[]): MockOffer {
    const values = line.split('\t');
    const offer: Record<string, string> = {};

    headers.forEach((header, index) => {
      offer[header] = values[index] || '';
    });

    return offer as unknown as MockOffer;
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filepath] = parameters;

    if (!filepath) {
      console.error(chalk.red('Ошибка: необходимо указать путь к TSV-файлу'));
      console.log(chalk.yellow('Пример: --import ./mocks/mock-data.tsv'));
      return;
    }

    console.log(chalk.cyan(`\nИмпорт данных из файла: ${filepath}`));
    console.log(chalk.gray('Чтение файла...'));

    try {
      const lines = await this.fileReader.read(filepath);

      if (lines.length < 2) {
        console.error(chalk.red('Ошибка: файл пуст или содержит только заголовки'));
        return;
      }

      const headers = lines[0].split('\t');
      const offers: MockOffer[] = [];

      for (let i = 1; i < lines.length; i++) {
        offers.push(this.parseOffer(lines[i], headers));
      }

      console.log(chalk.green.bold(`\n✓ Успешно импортировано: ${offers.length} предложений\n`));

      offers.forEach((offer, index) => {
        console.log(chalk.blue(`Предложение #${index + 1}:`));
        console.log(chalk.white(`Название: ${offer.title}`));
        console.log(chalk.white(`Город: ${offer.city}`));
        console.log(chalk.white(`Тип: ${offer.type}`));
        console.log(chalk.white(`Цена: €${offer.price}`));
        console.log(chalk.white(`Рейтинг: ${offer.rating}/5`));
        console.log(chalk.white(`Премиум: ${offer.isPremium === 'true' ? 'Да' : 'Нет'}`));
        console.log(chalk.gray(`Автор: ${offer.userName} (${offer.userEmail})`));
        console.log('');
      });

      console.log(chalk.green.bold('✓ Импорт завершен успешно\n'));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(`\n✗ Ошибка при импорте: ${errorMessage}\n`));
      process.exit(1);
    }
  }
}
