import chalk from 'chalk';
import type { Command } from './command.interface.js';

export class HelpCommand implements Command {
  public getName(): string {
    return '--help';
  }

  public execute(): void {
    console.log(chalk.bold.cyan('\nПрограмма для подготовки данных для REST API сервера.\n'));
    
    console.log(chalk.yellow('Пример использования:'));
    console.log(chalk.gray('  cli.js --<command> [--arguments]\n'));
    
    console.log(chalk.yellow('Команды:'));
    
    const commands = [
      { name: '--version', desc: 'выводит номер версии приложения' },
      { name: '--help', desc: 'выводит этот текст с описанием команд' },
      { name: '--import <path>', desc: 'импортирует данные из TSV-файла' },
      { name: '--generate <n> <path> <url>', desc: 'генерирует тестовые данные' }
    ];

    commands.forEach(cmd => {
      console.log(chalk.green(`  ${cmd.name.padEnd(35)}`), chalk.white(`# ${cmd.desc}`));
    });
    
    console.log('');
  }
}
