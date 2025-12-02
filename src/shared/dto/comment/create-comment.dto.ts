import { IsString, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Text must be a string' })
  @MinLength(5, { message: 'Comment text must be at least 5 characters' })
  @MaxLength(1024, { message: 'Comment text must not exceed 1024 characters' })
    text: string;

  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
    rating: number;

  authorId: string;
  offerId: string;

  constructor(data: Partial<CreateCommentDto>) {
    this.text = data.text || '';
    this.rating = data.rating || 1;
    this.authorId = data.authorId || '';
    this.offerId = data.offerId || '';
  }
}
