import { ObjectId } from 'mongodb';

export type LikeType = 'Like' | 'Dislike' | 'None';

export type LikeDBType = {
  _id: ObjectId;
  idObject: ObjectId;
  userId: ObjectId;
  login: string;
  addedAt: Date;
  status: LikeType;
  postOrComment: string;
  isBanned: boolean;
};

export type BannedLikesOrDislikes = {
  _id: ObjectId;
  status: LikeType;
  idObject: ObjectId;
};
