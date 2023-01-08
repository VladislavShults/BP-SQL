import { Mongoose } from 'mongoose';
import { CommentSchema } from './schemas/comment.schema';

export const commentsMongooseConnection = [
  {
    provide: 'COMMENT_MODEL',
    useFactory: (mongoose: Mongoose) =>
      mongoose.model('Comment', CommentSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
