import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostInfoSchema = HydratedDocument<PostInfo>;

@Schema({ versionKey: false })
export class PostInfo {
  @Prop()
  id: string;

  @Prop()
  title: string;

  @Prop()
  blogId: string;

  @Prop()
  blogName: string;

  @Prop()
  postOwnerUserId: string;
}

export const PostInfoSchema = SchemaFactory.createForClass(PostInfo);
