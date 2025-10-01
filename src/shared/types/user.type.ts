export type UserType = 'обычный' | 'pro';

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
  password: string;
  type: UserType;
}
