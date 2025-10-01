import chalk from 'chalk';
import { Command } from './command.interface.js';

export class HelpCommand implements Command {
  public getName(): string {
    return '--help';
  }

  public async execute(..._parameters: string[]): Promise<void> {
    console.info(chalk.cyan('Программа для подготовки данных для REST API сервера.'));
    console.info(chalk.yellow('Пример: cli.js --<command> [--arguments]'));
    console.info(chalk.green('Команды:'));
    console.info(chalk.blue('    --version:') + chalk.gray('                   # выводит номер версии'));
    console.info(chalk.blue('    --help:') + chalk.gray('                      # печатает этот текст'));
    console.info(chalk.blue('    --import <path>:') + chalk.gray('             # импортирует данные из TSV'));
  }
}
