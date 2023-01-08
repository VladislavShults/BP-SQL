import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { LikeDBType } from '../types/likes.types';

export const LikesSchema = new mongoose.Schema<Omit<LikeDBType, '_id'>>(
  {
    idObject: ObjectId,
    addedAt: Date,
    userId: ObjectId,
    login: String,
    status: String,
    postOrComment: String,
    isBanned: Boolean,
  },
  {
    versionKey: false,
  },
);
