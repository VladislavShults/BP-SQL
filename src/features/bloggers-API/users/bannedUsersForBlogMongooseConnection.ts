import { Mongoose } from 'mongoose';
import { BannedUserForBlogSchema } from './schemas/bannedUserForBlogSchema';

export const bannedUsersForBlogMongooseConnection = [
  {
    provide: 'BANNED_USER_FOR_BLOG_MODEL',
    useFactory: (mongoose: Mongoose) =>
      mongoose.model('BannedUserForBlog', BannedUserForBlogSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
