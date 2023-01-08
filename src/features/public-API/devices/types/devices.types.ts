import { ObjectId } from 'mongodb';

export type DevicesSecuritySessionType = {
  _id: ObjectId;
  issuedAt: string;
  deviceId: string;
  ip: string;
  deviceName: string;
  userId: string;
  expiresAt: string;
  lastActiveDate: Date;
};

export type DevicesResponseType = {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;
};
