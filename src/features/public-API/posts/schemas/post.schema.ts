import mongoose from 'mongoose';
import { PostDBType } from '../types/posts.types';

export const PostSchema = new mongoose.Schema<Omit<PostDBType, '_id'>>(
  {
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: Date,
    likesCount: Number,
    dislikesCount: Number,
    userId: String,
    isBanned: Boolean,
  },
  {
    versionKey: false,
  },
);
