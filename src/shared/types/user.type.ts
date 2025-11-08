export type UserType = 'обычный' | 'pro';

export interface User {
  name: string;
  email: string;
  avatarPath?: string;
  password: string;
  type: UserType;
}
