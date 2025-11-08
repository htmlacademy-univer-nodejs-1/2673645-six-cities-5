export type CityName = 'Paris' | 'Cologne' | 'Brussels' | 'Amsterdam' | 'Hamburg' | 'Dusseldorf';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface City {
  name: CityName;
  coordinates: Coordinates;
}
