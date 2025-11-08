import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  text: string;
  rating: number;
  author: mongoose.Types.ObjectId;
  offer: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    text: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offer: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'comments'
  }
);

commentSchema.index({ offer: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

export const CommentModel = mongoose.model<IComment>('Comment', commentSchema);
