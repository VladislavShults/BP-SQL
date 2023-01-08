import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BlogsController } from '../../features/public-API/blogs/api/blogs.controller';
import { blogsMongooseConnection } from '../../features/public-API/blogs/blogsMongooseConnection';
import { BlogsService } from '../../features/public-API/blogs/application/blogs.service';
import { BlogsRepository } from '../../features/public-API/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../features/public-API/blogs/api/blogs.query.repository';
import { PostsController } from '../../features/public-API/posts/api/posts.controller';
import { PostsService } from '../../features/public-API/posts/application/posts.service';
import { PostsRepository } from '../../features/public-API/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from '../../features/public-API/posts/api/posts.query.repository';
import { postMongooseConnection } from '../../features/public-API/posts/postMongooseConnection';
import { commentsMongooseConnection } from '../../features/public-API/comments/commentsMongooseConnection';
import { CommentsService } from '../../features/public-API/comments/application/comments.service';
import { CommentsRepository } from '../../features/public-API/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../features/public-API/comments/api/comments.query.repository';
import { CommentsController } from '../../features/public-API/comments/api/comments.controller';
import { TestingController } from '../../features/public-API/testing/testing.controller';
import { usersMongooseConnection } from '../../features/SA-API/users/usersMongooseConnection';
import { UsersService } from '../../features/SA-API/users/application/users.servive';
import { UsersRepository } from '../../features/SA-API/users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../features/SA-API/users/api/users.query.repository';
import { UsersController } from '../../features/SA-API/users/api/users.controller';
import { likesMongooseConnection } from '../../features/public-API/likes/likesMongooseConnection';
import { AuthController } from '../../features/public-API/auth/api/auth.controller';
import { JwtService } from '../JWT-utility/jwt-service';
import { AuthService } from '../../features/public-API/auth/application/auth.service';
import { EmailService } from '../SMTP-adapter/email-service';
import { EmailManager } from '../SMTP-adapter/email-manager';
import { EmailAdapter } from '../SMTP-adapter/email-adapter';
import { devicesSecurityMongooseConnection } from '../../features/public-API/devices/devicesSecurityMongooseConnection';
import { AuthRepository } from '../../features/public-API/auth/infrastrucrure/auth.repository';
import { LikesService } from '../../features/public-API/likes/application/likes.service';
import { LikesRepository } from '../../features/public-API/likes/infrastructure/likes.repository';
import { BlogIdValidation } from '../../features/public-API/blogs/validation/blogId-validation';
import { ipRestrictionMongooseConnection } from '../ip-restriction/ipRestrictionMongooseConnection';
import { SecurityController } from '../../features/public-API/devices/api/devices.controller';
import { DevicesService } from '../../features/public-API/devices/application/devices.service';
import { DevicesQueryRepository } from '../../features/public-API/devices/api/devices.query.repository';
import { BloggersBlogsController } from '../../features/bloggers-API/blogs/api/bloggers.blogs.controller';
import { BloggersBlogsQueryRepository } from '../../features/bloggers-API/blogs/api/bloggers.blogs.query.repository';
import { AdminBlogsController } from '../../features/SA-API/blogs/api/admin.blogs.controller';
import { AdminBlogsQueryRepository } from '../../features/SA-API/blogs/api/admin.blogs.query.repository';
import { bannedUsersForBlogMongooseConnection } from '../../features/bloggers-API/users/bannedUsersForBlogMongooseConnection';
import { BloggerUsersController } from '../../features/bloggers-API/users/api/blogger.users.controller';

@Module({
  imports: [DatabaseModule],
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
    BloggersBlogsQueryRepository,
    AdminBlogsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    AuthRepository,
    JwtService,
    EmailService,
    EmailManager,
    EmailAdapter,
    LikesService,
    LikesRepository,
    BlogIdValidation,
    DevicesService,
    DevicesQueryRepository,
    ...blogsMongooseConnection,
    ...postMongooseConnection,
    ...commentsMongooseConnection,
    ...usersMongooseConnection,
    ...likesMongooseConnection,
    ...devicesSecurityMongooseConnection,
    ...ipRestrictionMongooseConnection,
    ...bannedUsersForBlogMongooseConnection,
  ],
})
export class BlogsPlatformModule {}
