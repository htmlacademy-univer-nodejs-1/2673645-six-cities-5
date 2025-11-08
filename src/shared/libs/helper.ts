export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function getRandomArrayElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot get random element from empty array');
  }
  return array[getRandomNumber(0, array.length)];
}

export function getRandomArrayElements<T>(array: T[], count: number): T[] {
  if (array.length === 0) {
    throw new Error('Cannot get random elements from empty array');
  }

  const result: T[] = [];
  const validCount = Math.min(count, array.length);
  for (let i = 0; i < validCount; i++) {
    result.push(getRandomArrayElement(array));
  }
  return result;
}

export function formatDate(date: Date): string {
  return date.toISOString();
}

export function getRandomDate(daysAgo = 30): Date {
  if (daysAgo <= 0) {
    throw new Error('daysAgo must be positive number');
  }

  const now = new Date();
  const msAgo = daysAgo * 24 * 60 * 60 * 1000;
  const randomMs = getRandomNumber(0, msAgo);
  return new Date(now.getTime() - randomMs);
}

export function parseStringArray(str: string, separator = ';'): string[] {
  return str
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function joinArray(arr: string[], separator = ';'): string {
  return arr.join(separator);
}
