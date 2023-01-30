import mongoose from 'mongoose';

export const BannedUserForBlogSchema = new mongoose.Schema(
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
