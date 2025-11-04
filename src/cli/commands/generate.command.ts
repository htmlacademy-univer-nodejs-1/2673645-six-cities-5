import chalk from 'chalk';
import type { Command } from './command.interface.js';
import { DataFetcher } from '../../shared/libs/data-fetcher.js';
import { OfferGenerator } from '../../shared/libs/offer-generator.js';
import { TSVFileWriter } from '../../shared/libs/tsv-file-writer.js';
import type { GeneratorOffer } from '../../shared/libs/offer-generator.js';

export class GenerateCommand implements Command {
  public getName(): string {
    return '--generate';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [countStr, filepath, url] = parameters;

    if (!countStr || !filepath || !url) {
      console.error(chalk.red('\n✗ Ошибка: необходимо указать все параметры'));
      console.log(chalk.yellow('Пример: --generate 10 ./mocks/test-data.tsv http://localhost:3000\n'));
      return;
    }

    const count = parseInt(countStr, 10);
    if (isNaN(count) || count <= 0) {
      console.error(chalk.red(`\n✗ Ошибка: количество должно быть положительным числом\n`));
      return;
    }

    console.log(chalk.cyan('\n📊 Начало генерации тестовых данных...\n'));
    console.log(chalk.white(`  📝 Количество предложений: ${count}`));
    console.log(chalk.white(`  💾 Файл: ${filepath}`));
    console.log(chalk.white(`  🌐 URL сервера: ${url}\n`));

    try {
      const dataFetcher = new DataFetcher(url);
      
      console.log(chalk.gray('Проверка доступности сервера...'));
      const isAvailable = await dataFetcher.isServerAvailable();
      
      if (!isAvailable) {
        console.error(chalk.red(`\n✗ Ошибка: сервер ${url} недоступен`));
        console.log(chalk.yellow('Убедитесь, что запущен JSON Server:'));
        console.log(chalk.gray('  npm run mock:server\n'));
        return;
      }

      console.log(chalk.green('✓ Сервер доступен\n'));

      console.log(chalk.gray('Получение шаблонов предложений с сервера...'));
      
      let templates: GeneratorOffer[] = [];
      try {
        const fetchedData = await dataFetcher.fetchOffers();
        templates = fetchedData as GeneratorOffer[];
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`\n✗ Ошибка при получении шаблонов: ${errorMessage}\n`));
        return;
      }

      if (templates.length === 0) {
        console.error(chalk.red('\n✗ Ошибка: на сервере нет шаблонов предложений\n'));
        return;
      }

      console.log(chalk.green(`✓ Получено ${templates.length} шаблонов\n`));

      console.log(chalk.gray(`Генерация ${count} предложений...`));
      
      let mockOffers: any[] = [];
      try {
        mockOffers = OfferGenerator.generateMultipleMockOffers(templates, count);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`\n✗ Ошибка при генерации: ${errorMessage}\n`));
        process.exit(1);
      }
      
      console.log(chalk.green(`✓ Сгенерировано ${count} предложений\n`));

      console.log(chalk.gray('Запись в файл TSV...'));
      
      try {
        const tsvWriter = new TSVFileWriter();
        await tsvWriter.writeOffers(mockOffers, filepath);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`\n✗ Ошибка при записи в файл: ${errorMessage}\n`));
        process.exit(1);
      }
      
      console.log(chalk.green('✓ Данные записаны в файл\n'));

      console.log(chalk.green.bold(`✓ Генерация завершена успешно\n`));
      console.log(chalk.cyan('📊 Статистика:'));
      console.log(chalk.white(`  Файл: ${filepath}`));
      console.log(chalk.white(`  Предложений: ${count}`));
      console.log(chalk.white(`  Строк: ${count + 1} (включая заголовок)\n`));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`\n✗ Ошибка при генерации: ${errorMessage}\n`));
      process.exit(1);
    }
  }
}
