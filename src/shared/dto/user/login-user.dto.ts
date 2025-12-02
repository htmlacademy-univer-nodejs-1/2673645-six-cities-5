import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(12, { message: 'Password must not exceed 12 characters' })
    password: string;

  constructor(data: Partial<LoginUserDto>) {
    this.email = data.email || '';
    this.password = data.password || '';
  }
}
