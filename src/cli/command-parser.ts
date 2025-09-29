export class CommandParser {
  static parse(cliArguments: string[]): Record<string, string[]> {
    const parsedCommand: Record<string, string[]> = {};
    let currentCommand = '';

    for (const argument of cliArguments) {
      if (argument.startsWith('--')) {
        parsedCommand[argument] = [];
        currentCommand = argument;
      } 
      else if (currentCommand && argument) {
        parsedCommand[currentCommand].push(argument);
      }
    }

    return parsedCommand;
  }
}
