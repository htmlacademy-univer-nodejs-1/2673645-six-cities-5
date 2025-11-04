export interface FileReader {
  read(filepath: string): Promise<string[]>;
}
