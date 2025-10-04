import { User } from './user.js';

export type Comment = {
  text: string;
  createdAt: Date;
  rating: number;
  author: User;
};
