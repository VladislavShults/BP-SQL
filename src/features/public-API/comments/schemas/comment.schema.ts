import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PostInfo } from './postInfo.schema';

export type CommentSchema = HydratedDocument<Comment>;

@Schema({ versionKey: false })
export class Comment {
  @Prop()
  content: string;

  @Prop()
  userId: string;

  @Prop()
  userLogin: string;

  @Prop()
  createdAt: Date;

  @Prop()
  postId: string;

  @Prop()
  likesCount: number;

  @Prop()
  dislikesCount: number;

  @Prop()
  isBanned: boolean;

  @Prop()
  blogId: string;

  @Prop()
  postInfo: PostInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
