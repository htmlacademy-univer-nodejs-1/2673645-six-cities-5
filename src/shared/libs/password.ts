import bcrypt from 'bcryptjs';
import { Logger } from 'pino';

export class PasswordService {
  constructor(private saltRounds: number, private logger: Logger) {}

  async hash(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      this.logger.debug('Password hashed successfully');
      return hash;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error hashing password: ${msg}`);
      throw error;
    }
  }

  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error comparing password: ${msg}`);
      throw error;
    }
  }
}
