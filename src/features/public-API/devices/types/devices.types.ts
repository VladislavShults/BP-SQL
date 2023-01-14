export type DevicesSecuritySessionType = {
  deviceSessionId: number;
  issuedAt: string;
  deviceId: string;
  ip: string;
  deviceName: string;
  userId: number;
  expiresAt: string;
  lastActiveDate: Date;
};

export type DevicesResponseType = {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;
};
