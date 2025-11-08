export class CreateCommentDto {
  text: string;
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
