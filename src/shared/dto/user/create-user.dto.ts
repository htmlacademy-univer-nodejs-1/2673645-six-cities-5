import { IsString, IsEmail, IsEnum, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must be at least 1 character' })
  @MaxLength(15, { message: 'Name must not exceed 15 characters' })
    name: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(12, { message: 'Password must not exceed 12 characters' })
    password: string;

  @IsEnum(['обычный', 'pro'], { message: 'Type must be either "обычный" or "pro"' })
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
