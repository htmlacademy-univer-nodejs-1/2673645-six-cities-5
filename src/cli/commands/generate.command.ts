import chalk from 'chalk';
import type { Command } from './command.interface.js';

export class GenerateCommand implements Command {
  public getName(): string {
    return '--generate';
  }

  public execute(...parameters: string[]): void {
    const [count, filepath, url] = parameters;

    if (!count || !filepath || !url) {
      console.error(chalk.red('Ошибка: необходимо указать все параметры'));
      console.log(chalk.yellow('Пример: --generate 10 ./mocks/test-data.tsv http://localhost:3000/api'));
      return;
    }

    console.log(chalk.cyan('Генерация тестовых данных...'));
    console.log(chalk.white(`  Количество: ${count}`));
    console.log(chalk.white(`  Файл: ${filepath}`));
    console.log(chalk.white(`  URL сервера: ${url}`));
    console.log('');
    console.log(chalk.yellow('Эта команда будет реализована в следующем задании'));
  }
}
