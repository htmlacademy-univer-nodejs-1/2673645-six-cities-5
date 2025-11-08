export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  type: 'обычный' | 'pro';
  avatarPath?: string;

  constructor(data: Partial<CreateUserDto>) {
    this.name = data.name || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.type = data.type || 'обычный';
    this.avatarPath = data.avatarPath;
  }
}
