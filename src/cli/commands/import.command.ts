import chalk from 'chalk';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import type { Command } from './command.interface.js';
import { DatabaseConnection, DatabaseConnectionOptions } from '../../shared/db/database-connection.js';
import { OfferRepository } from '../../shared/db/repositories/offer.repository.js';
import { UserRepository } from '../../shared/db/repositories/user.repository.js';
import type { MockOffer } from '../../shared/types/mock-data.type.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';

@injectable()
export class ImportCommand implements Command {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.DatabaseConnection) private db: DatabaseConnection,
    @inject(TYPES.OfferRepository) private offerRepository: OfferRepository,
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

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

  private parseDbOptions(args: string[]): DatabaseConnectionOptions {
    const [_, host, port, name] = args;
    
    return {
      host: host || '127.0.0.1',
      port: parseInt(port, 10) || 27017,
      name: name || 'six-cities'
    };
  }

  public async execute(...parameters: string[]): Promise<void> {
    if (parameters.length === 0) {
      console.error(chalk.red('Ошибка: укажите путь к файлу и параметры БД'));
      console.log(chalk.yellow('Пример: --import ./mocks/data.tsv 127.0.0.1 27017 six-cities\n'));
      return;
    }

    const filepath = parameters[0];
    const dbOptions = this.parseDbOptions(parameters);

    console.log(chalk.cyan(`Импорт данных из файла: ${filepath}\n`));

    try {
      await this.db.connect(dbOptions);

      let processedOffers = 0;
      let headers: string[] = [];
      let isFirstLine = true;
      const offers: MockOffer[] = [];

      const fileStream = createReadStream(filepath, { encoding: 'utf-8' });
      const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

      console.log(chalk.gray('Чтение файла...\n'));

      for await (const line of rl) {
        if (isFirstLine) {
          headers = line.split('\t');
          isFirstLine = false;
          continue;
        }

        processedOffers++;
        if (processedOffers % 100 === 0 || processedOffers <= 5) {
          console.log(chalk.gray(`Обработано: ${processedOffers} предложений...`));
        }

        const offer = this.parseOfferLine(line, headers);
        offers.push(offer);
      }

      console.log(chalk.gray('Сохранение пользователей в БД...'));
      const users = new Map();
      
      for (const offer of offers) {
        if (!users.has(offer.userEmail)) {
          try {
            const user = await this.userRepository.create({
              name: offer.userName,
              email: offer.userEmail,
              password: 'defaultpassword',
              type: offer.userType
            });
            users.set(offer.userEmail, user._id);
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            if (!msg.includes('duplicate')) {
              this.logger.error(`Error creating user: ${msg}`);
            } else {
              const existingUser = await this.userRepository.findByEmail(offer.userEmail);
              if (existingUser) {
                users.set(offer.userEmail, existingUser._id);
              }
            }
          }
        }
      }

      console.log(chalk.gray('Сохранение предложений в БД...'));
      
      const offersToSave = offers.map(offer => ({
        title: offer.title,
        description: offer.description,
        publishDate: new Date(offer.publishDate),
        city: offer.city,
        previewImage: offer.previewImage,
        images: offer.images.split(';').filter(img => img),
        isPremium: offer.isPremium === 'true',
        isFavorite: offer.isFavorite === 'true',
        rating: parseFloat(offer.rating),
        type: offer.type,
        bedrooms: parseInt(offer.bedrooms, 10),
        maxAdults: parseInt(offer.maxAdults, 10),
        price: parseInt(offer.price, 10),
        amenities: offer.amenities.split(';').filter(a => a),
        author: users.get(offer.userEmail),
        coordinates: {
          latitude: parseFloat(offer.latitude),
          longitude: parseFloat(offer.longitude)
        }
      }));

      await this.offerRepository.insertMany(offersToSave);

      console.log(chalk.green.bold(`Успешно импортировано: ${offers.length} предложений\n`));
      console.log(chalk.cyan('Статистика:'));
      console.log(chalk.white(`Всего предложений: ${offers.length}`));
      console.log(chalk.white(`Уникальных пользователей: ${users.size}`));
      console.log(chalk.green.bold('Импорт завершен успешно\n'));

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Ошибка при импорте: ${msg}\n`));
      process.exit(1);
    } finally {
      await this.db.disconnect();
    }
  }
}
