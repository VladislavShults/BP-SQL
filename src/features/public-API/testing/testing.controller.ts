import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  @Delete('all-data')
  @HttpCode(204)
  async clearAllData(): Promise<HttpStatus> {
    await this.dataSource.query(`DELETE FROM public."BanInfo"`);
    await this.dataSource.query(`DELETE FROM public."EmailConfirmation"`);
    await this.dataSource.query(`DELETE FROM public."DeviceSession"`);
    await this.dataSource.query(`DELETE FROM public."CommentsLikesOrDislike"`);
    await this.dataSource.query(`DELETE FROM public."PostsLikesOrDislike"`);
    await this.dataSource.query(`DELETE FROM public."Comments"`);
    await this.dataSource.query(`DELETE FROM public."Posts"`);
    await this.dataSource.query(`DELETE FROM public."BannedUsersForBlog"`);
    await this.dataSource.query(`DELETE FROM public."Blogs"`);
    await this.dataSource.query(`DELETE FROM public."Users"`);

    // await this.blogModel.deleteMany({});
    // await this.postModel.deleteMany({});
    // await this.commentModel.deleteMany({});
    // await this.userModel.deleteMany({});
    // await this.devicesSecurityModel.deleteMany({});
    // await this.likesModel.deleteMany({});
    // await this.bannedUserForBlogModel.deleteMany({});
    return;
  }
}
