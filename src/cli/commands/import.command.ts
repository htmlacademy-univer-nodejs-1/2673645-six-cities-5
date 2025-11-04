import chalk from 'chalk';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type { Command } from './command.interface.js';
import type { MockOffer } from '../../shared/types/mock-data.type.js';

export class ImportCommand implements Command {
  public getName(): string {
    return '--import';
  }

  private parseOfferLine(line: string, headers: string[]): MockOffer {
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
      console.error(chalk.red('\n✗ Ошибка: необходимо указать путь к TSV-файлу'));
      console.log(chalk.yellow('Пример: --import ./mocks/mock-data.tsv\n'));
      return;
    }

    console.log(chalk.cyan(`\n📥 Импорт данных из файла: ${filepath}\n`));

    let processedOffers = 0;
    let headers: string[] = [];
    let isFirstLine = true;
    const offers: MockOffer[] = [];

    try {
      const fileStream = createReadStream(filepath, { encoding: 'utf-8' });
      
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      console.log(chalk.gray('Обработка данных...'));

      for await (const line of rl) {
        try {
          if (isFirstLine) {
            headers = line.split('\t');
            isFirstLine = false;
            console.log(chalk.gray(`Заголовки: ${headers.slice(0, 5).join(', ')}...\n`));
            continue;
          }

          processedOffers++;
          
          if (processedOffers % 100 === 0 || processedOffers <= 5) {
            console.log(chalk.gray(`  ⏳ Обработано: ${processedOffers} предложений...`));
          }

          const offer = this.parseOfferLine(line, headers);
          offers.push(offer);
        } catch (lineError) {
          const errorMessage = lineError instanceof Error ? lineError.message : String(lineError);
          console.warn(chalk.yellow(`  ⚠️  Ошибка в строке ${processedOffers + 2}: ${errorMessage}`));
          continue;
        }
      }

      console.log(chalk.green.bold(`\n✓ Успешно импортировано: ${offers.length} предложений\n`));

      const displayCount = Math.min(5, offers.length);
      offers.slice(0, displayCount).forEach((offer, index) => {
        console.log(chalk.blue(`Предложение #${index + 1}:`));
        console.log(chalk.white(`  📍 Название: ${offer.title}`));
        console.log(chalk.white(`  🏙️  Город: ${offer.city}`));
        console.log(chalk.white(`  🏠 Тип: ${offer.type}`));
        console.log(chalk.white(`  💰 Цена: €${offer.price}`));
        console.log(chalk.white(`  ⭐ Рейтинг: ${offer.rating}/5`));
        console.log(chalk.white(`  👑 Премиум: ${offer.isPremium === 'true' ? '✓ Да' : '✗ Нет'}`));
        console.log(chalk.gray(`  👤 Автор: ${offer.userName} (${offer.userEmail})`));
        console.log('');
      });

      if (offers.length > displayCount) {
        console.log(chalk.gray(`... и еще ${offers.length - displayCount} предложений\n`));
      }

      this.printStatistics(offers);
      
      console.log(chalk.green.bold('\n✓ Импорт завершен успешно\n'));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`\n✗ Ошибка при импорте: ${errorMessage}\n`));
      process.exit(1);
    }
  }

  private printStatistics(offers: MockOffer[]): void {
    if (offers.length === 0) return;

    console.log(chalk.cyan('📊 Статистика импорта:'));
    console.log(chalk.white(`  Всего предложений: ${offers.length}`));

    const totalPrice = offers.reduce((sum, o) => sum + parseInt(o.price, 10), 0);
    const avgPrice = (totalPrice / offers.length).toFixed(2);
    console.log(chalk.white(`  Средняя цена: €${avgPrice}`));

    const totalRating = offers.reduce((sum, o) => sum + parseFloat(o.rating), 0);
    const avgRating = (totalRating / offers.length).toFixed(1);
    console.log(chalk.white(`  Средний рейтинг: ${avgRating}/5`));

    const premiumCount = offers.filter(o => o.isPremium === 'true').length;
    const premiumPercent = ((premiumCount / offers.length) * 100).toFixed(1);
    console.log(chalk.white(`  Премиум предложений: ${premiumCount} (${premiumPercent}%)`));

    const cityStats = new Map<string, number>();
    offers.forEach(o => {
      cityStats.set(o.city, (cityStats.get(o.city) || 0) + 1);
    });
    
    console.log(chalk.white('  По городам:'));
    cityStats.forEach((count, city) => {
      console.log(chalk.gray(`    ${city}: ${count}`));
    });
  }
}
