import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDBType } from '../types/users.types';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDBType>,
  ) {}

  async createUser(newUserTypeDb: Omit<UserDBType, '_id'>): Promise<ObjectId> {
    const newUser = await this.userModel.create(newUserTypeDb);
    return newUser._id;
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: userId });
    return result.deletedCount > 0;
  }

  async getUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return null;
    return user;
  }

  async updateUser(user): Promise<boolean> {
    const update = await user.save();
    return update.modifiedPaths.length > 0;
  }

  async findAccountByConfirmationCode(
    code: string,
  ): Promise<UserDBType | null> {
    const account = await this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    if (!account) return null;
    return account;
  }

  async confirmedAccount(accountId: string): Promise<boolean> {
    const confirmAccount = await this.userModel.updateOne(
      { _id: accountId },
      { $set: { 'emailConfirmation.isConfirmed': true } },
      {},
    );
    return confirmAccount.matchedCount === 1;
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }

  async accountIsConfirmed(email: string): Promise<boolean> {
    const account = await this.userModel.findOne({ email: email });
    if (!account) return true;
    return account.emailConfirmation.isConfirmed;
  }

  async findByLogin(login: string): Promise<UserDBType | null> {
    return this.userModel.findOne({ login: login });
  }

  async findUserByEmail(email: string): Promise<UserDBType | null> {
    return this.userModel.findOne({ email: email });
  }
}
