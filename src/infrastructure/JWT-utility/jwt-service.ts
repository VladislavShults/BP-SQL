import { ObjectId } from 'mongodb';
import * as jwt from 'jsonwebtoken';

export class JwtService {
  async createJWT(userId: string, expiresTime: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: expiresTime,
    });
  }

  async createRefreshJWT(
    userId: string,
    deviceId: string,
    expiresTime: string,
  ) {
    return jwt.sign({ userId, deviceId }, process.env.JWT_SECRET, {
      expiresIn: expiresTime,
    });
  }

  async extractUserIdFromToken(token: string): Promise<ObjectId | null> {
    try {
      const result: any = jwt.verify(token, process.env.JWT_SECRET);
      return result.userId;
    } catch (error) {
      return null;
    }
  }

  async extractDeviceIdFromToken(token: string): Promise<ObjectId | null> {
    try {
      const result: any = jwt.verify(token, process.env.JWT_SECRET);
      return result.deviceId;
    } catch (error) {
      return null;
    }
  }

  async extractExpirationDateFromToken(refreshToken: string): Promise<number> {
    try {
      const result: any = jwt.verify(refreshToken, process.env.JWT_SECRET);
      return result.exp * 1000;
    } catch (error) {
      return null;
    }
  }

  async extractIssueAtFromToken(refreshToken: string): Promise<number> {
    try {
      const result: any = jwt.verify(refreshToken, process.env.JWT_SECRET);
      return result.iat;
    } catch (error) {
      return null;
    }
  }
}
