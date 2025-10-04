import { UserType } from './user-type.enum.js';

export type User = {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  type: UserType;
}
