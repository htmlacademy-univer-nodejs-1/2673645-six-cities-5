import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import chalk from 'chalk';
import type { Command } from './command.interface.js';

export class VersionCommand implements Command {
  private readonly __filename = fileURLToPath(import.meta.url);
  private readonly __dirname = dirname(this.__filename);

  private readVersion(): string {
    try {
      const packagePath = join(this.__dirname, '../../../package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      return packageJson.version;
    } catch {
      return 'unknown';
    }
  }

  public getName(): string {
    return '--version';
  }

  public execute(): void {
    const version = this.readVersion();
    console.log(chalk.bold.green(`Версия приложения: ${version}`));
  }
}
