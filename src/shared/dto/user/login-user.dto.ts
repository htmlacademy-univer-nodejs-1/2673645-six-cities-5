export class LoginUserDto {
  email: string;
  password: string;

  constructor(data: Partial<LoginUserDto>) {
    this.email = data.email || '';
    this.password = data.password || '';
  }
}
