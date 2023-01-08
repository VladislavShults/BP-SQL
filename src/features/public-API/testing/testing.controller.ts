import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { PostDBType } from '../posts/types/posts.types';
import {
  BannedUsersForBlogType,
  BlogDBTypeWithoutBlogOwner,
} from '../blogs/types/blogs.types';
import { CommentDBType } from '../comments/types/comments.types';
import { UserDBType } from '../../SA-API/users/types/users.types';
import { LikeDBType } from '../likes/types/likes.types';
import { DevicesSecuritySessionType } from '../devices/types/devices.types';

@Controller('testing')
export class TestingController {
  constructor(
    @Inject('POST_MODEL')
    private readonly postModel: Model<PostDBType>,
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBTypeWithoutBlogOwner>,
    @Inject('COMMENT_MODEL')
    private readonly commentModel: Model<CommentDBType>,
    @Inject('USER_MODEL')
    private readonly userModel: Model<UserDBType>,
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly devicesSecurityModel: Model<DevicesSecuritySessionType>,
    @Inject('LIKES_MODEL')
    private readonly likesModel: Model<LikeDBType>,
    @Inject('BANNED_USER_FOR_BLOG_MODEL')
    private readonly bannedUserForBlogModel: Model<BannedUsersForBlogType>,
  ) {}
  @Delete('all-data')
  @HttpCode(204)
  async clearAllData(): Promise<HttpStatus> {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.devicesSecurityModel.deleteMany({});
    await this.likesModel.deleteMany({});
    await this.bannedUserForBlogModel.deleteMany({});
    return;
  }
}
