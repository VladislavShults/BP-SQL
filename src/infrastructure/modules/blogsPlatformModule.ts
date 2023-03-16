import { Module } from '@nestjs/common';
import { BlogsController } from '../../features/public-API/blogs/api/blogs.controller';
import { BlogsService } from '../../features/public-API/blogs/application/blogs.service';
import { BlogsRepository } from '../../features/public-API/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../features/public-API/blogs/api/blogs.query.repository';
import { PostsController } from '../../features/public-API/posts/api/posts.controller';
import { PostsService } from '../../features/public-API/posts/application/posts.service';
import { PostsRepository } from '../../features/public-API/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from '../../features/public-API/posts/api/posts.query.repository';
import { CommentsService } from '../../features/public-API/comments/application/comments.service';
import { CommentsRepository } from '../../features/public-API/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../features/public-API/comments/api/comments.query.repository';
import { CommentsController } from '../../features/public-API/comments/api/comments.controller';
import { TestingController } from '../../features/public-API/testing/testing.controller';
import { UsersService } from '../../features/SA-API/users/application/users.servive';
import { UsersRepository } from '../../features/SA-API/users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../features/SA-API/users/api/users.query.repository';
import { UsersController } from '../../features/SA-API/users/api/users.controller';
import { AuthController } from '../../features/public-API/auth/api/auth.controller';
import { JwtService } from '../JWT-utility/jwt-service';
import { AuthService } from '../../features/public-API/auth/application/auth.service';
import { EmailService } from '../SMTP-adapter/email-service';
import { EmailManager } from '../SMTP-adapter/email-manager';
import { EmailAdapter } from '../SMTP-adapter/email-adapter';
import { LikesService } from '../../features/public-API/likes/application/likes.service';
import { LikesRepository } from '../../features/public-API/likes/infrastructure/likes.repository';
import { BlogIdValidation } from '../../features/public-API/blogs/validation/blogId-validation';
import { SecurityController } from '../../features/public-API/devices/api/devices.controller';
import { DevicesService } from '../../features/public-API/devices/application/devices.service';
import { DevicesQueryRepository } from '../../features/public-API/devices/api/devices.query.repository';
import { BloggersBlogsController } from '../../features/bloggers-API/blogs/api/bloggers.blogs.controller';
import { AdminBlogsController } from '../../features/SA-API/blogs/api/admin.blogs.controller';
import { AdminBlogsQueryRepository } from '../../features/SA-API/blogs/api/admin.blogs.query.repository';
import { BloggerUsersController } from '../../features/bloggers-API/users/api/blogger.users.controller';
import { DeviceRepository } from '../../features/public-API/devices/infrastructure/devices.repository';

@Module({
  imports: [],
  controllers: [
    BlogsController,
    BloggersBlogsController,
    AdminBlogsController,
    PostsController,
    CommentsController,
    UsersController,
    BloggerUsersController,
    TestingController,
    AuthController,
    SecurityController,
  ],
  providers: [
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    AdminBlogsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    JwtService,
    EmailService,
    EmailManager,
    EmailAdapter,
    LikesService,
    LikesRepository,
    BlogIdValidation,
    DevicesService,
    DeviceRepository,
    DevicesQueryRepository,
  ],
})
export class BlogsPlatformModule {}
