#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RentalOffer } from './models/rental-offer.js';
import { TSVWriter } from './cli/TSVWriter.js';
import { TSVReader } from './cli/TSVReader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const version = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
).version;

const showHelp = () => {
  console.log(chalk.blue('Список команд:'));
  console.log(`${chalk.green('--help:')} выводит информацию о командах`);
  console.log(`${chalk.green('--version:')} выводит версию приложения`);
  console.log(
    `${chalk.green('--import <filename>:')} импортирует данные из TSV-файла`
  );
};

const importData = async (filePath: string): Promise<void> => {
  const reader: TSVReader = new TSVReader(filePath);
  let readNext = true;

  while (readNext) {
    const result = await reader.getRentalOffer();
    if (!result) {
      readNext = false;
      continue;
    }

    const [rentalOffer, countRentalOffers] = result as [RentalOffer, number];
    
    console.log(
      chalk.green(
        `Успешно импортированы : ${countRentalOffers} предложений аренды`
      ),
      rentalOffer
    );
  }
};

const generateData = async (
  countRentalOffers: number,
  filePath: string,
  url: string
): Promise<void> => {
  try {
    const response = await axios.get<RentalOffer[]>(url);
    const availableData = response.data;

    const tsvGenerator = new TSVWriter(filePath);
    for (let i = 0; i < countRentalOffers; i++) {
      const randomItem =
        availableData[Math.floor(Math.random() * availableData.length)];
      tsvGenerator.addRentalOffer(randomItem);
    }
    tsvGenerator.end();

  } catch (error) {
    console.error('Ошибка при получении данных с JSON-сервера:', error);
  }
};

const [, , command, ...args] = process.argv;
switch (command) {
  case '--help':
    showHelp();
    break;
  case '--version':
    console.log(chalk.yellow(`Версия приложения: ${version}`));
    break;
  case '--import':
    {
      const [filePath] = args;
      importData(filePath);
    }
    break;
  case '--generate': {
    const [nArg, filePath, url] = args;
    const countRentalOffers: number = parseInt(nArg, 10);
    generateData(countRentalOffers, filePath, url);
    break;
  }
  default:
    showHelp();
}
