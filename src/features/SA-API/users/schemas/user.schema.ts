import mongoose from 'mongoose';
import { UserDBType } from '../types/users.types';

export const UserSchema = new mongoose.Schema(
  {
    login: String,
    email: String,
    createdAt: Date,
    passwordHash: String,
    emailConfirmation: {
      confirmationCode: String,
      expirationDate: Date,
      isConfirmed: Boolean,
    },
    banInfo: {
      isBanned: Boolean,
      banDate: Date,
      banReason: String || null,
    },
  },
  {
    versionKey: false,
  },
);
