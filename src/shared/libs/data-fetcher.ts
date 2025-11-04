import axios, { AxiosInstance } from 'axios';

export class DataFetcher {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async fetchOffers(): Promise<any[]> {
    try {
      const response = await this.client.get('/offers');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch offers: ${error.message}`);
      }
      throw error;
    }
  }

  async isServerAvailable(): Promise<boolean> {
    try {
      await this.client.get('/offers');
      return true;
    } catch {
      return false;
    }
  }
}
