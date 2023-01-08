import mongoose from 'mongoose';
import { BannedUsersForBlogType } from '../../../public-API/blogs/types/blogs.types';

export const BannedUserForBlogSchema =
  new mongoose.Schema<BannedUsersForBlogType>(
    {
      id: String,
      login: String,
      banInfo: {
        isBanned: Boolean,
        banDate: Date,
        banReason: String,
      },
      blogId: String,
    },
    {
      versionKey: false,
    },
  );
