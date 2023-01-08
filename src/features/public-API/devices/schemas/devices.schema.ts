import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DevicesSchema = HydratedDocument<DeviceSession>;

@Schema({ versionKey: false })
export class DeviceSession {
  @Prop()
  issuedAt: string;

  @Prop()
  deviceId: string;

  @Prop()
  ip: string;

  @Prop()
  deviceName: string;

  @Prop()
  userId: string;

  @Prop()
  expiresAt: string;

  @Prop()
  lastActiveDate: Date;
}

export const DevicesSecuritySchema =
  SchemaFactory.createForClass(DeviceSession);
