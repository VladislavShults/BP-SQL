import { Mongoose } from 'mongoose';
import { PostSchema } from './schemas/post.schema';

export const postMongooseConnection = [
  {
    provide: 'POST_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Post', PostSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
