import chalk from 'chalk';
import { CommandParser } from './command-parser.js';
import type { Command } from './commands/command.interface.js';
import { HelpCommand, VersionCommand, ImportCommand, GenerateCommand } from './commands/index.js';

export class CLIApplication {
  private commands: Map<string, Command> = new Map();
  private defaultCommand = '--help';

  public registerCommands(): void {
    this.commands.set('--help', new HelpCommand());
    this.commands.set('--version', new VersionCommand());
    this.commands.set('--import', new ImportCommand());
    this.commands.set('--generate', new GenerateCommand());
  }

  public getCommand(commandName: string): Command {
    return this.commands.get(commandName) ?? this.getDefaultCommand();
  }

  public getDefaultCommand(): Command {
    if (!this.commands.has(this.defaultCommand)) {
      throw new Error(`Default command ${this.defaultCommand} is not registered`);
    }
    return this.commands.get(this.defaultCommand)!;
  }

  public processCommand(argv: string[]): void {
    const parsedCommand = CommandParser.parse(argv);
    const [commandName] = Object.keys(parsedCommand);
    const command = this.getCommand(commandName);
    const commandArguments = parsedCommand[commandName] ?? [];

    try {
      command.execute(...commandArguments);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(`Error: ${errorMessage}`));
      process.exit(1);
    }
  }
}
