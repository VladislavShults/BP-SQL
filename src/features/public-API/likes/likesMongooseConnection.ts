import { Mongoose } from 'mongoose';
import { LikesSchema } from './schemas/likes.schema';

export const likesMongooseConnection = [
  {
    provide: 'LIKES_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Likes', LikesSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
