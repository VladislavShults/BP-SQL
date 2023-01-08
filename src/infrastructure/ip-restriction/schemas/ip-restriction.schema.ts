import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type IpRestrictionSchema = HydratedDocument<IpRestriction>;

@Schema({ versionKey: false })
export class IpRestriction {
  @Prop()
  endpoint: string;

  @Prop()
  currentIp: string;

  @Prop()
  timeInput: number;
}

export const IpRestrictionSchema = SchemaFactory.createForClass(IpRestriction);
