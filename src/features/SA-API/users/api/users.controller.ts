import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './models/create-user.dto';
import {
  ViewUsersTypeWithPagination,
  ViewUserType,
} from '../types/users.types';
import { UsersService } from '../application/users.servive';
import { UsersQueryRepository } from './users.query.repository';
import { QueryUserDto } from './models/query-user.dto';
import { URIParamUserDto } from './models/URIParam-user.dto';
import { BanUserDto } from './models/ban-user.dto';
import { BasicAuthGuard } from '../../../public-API/auth/guards/basic-auth.guard';

@Controller('sa/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() inputModel: CreateUserDto): Promise<ViewUserType> {
    const userObjectId = await this.usersService.createUser(inputModel);
    return await this.usersQueryRepository.getUserByIdViewType(
      userObjectId.toString(),
    );
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(
    @Query() query: QueryUserDto,
  ): Promise<ViewUsersTypeWithPagination> {
    return await this.usersQueryRepository.getUsers(query);
  }

  @Delete(':userId')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async deleteUserById(@Param() params: URIParamUserDto): Promise<HttpStatus> {
    const deletedUser = await this.usersService.deleteUserById(params.userId);
    if (!deletedUser)
      throw new HttpException('USER NOT FOUND', HttpStatus.NOT_FOUND);

    return;
  }

  @Put(':userId/ban')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async banAndUnbanUser(
    @Param() params: URIParamUserDto,
    @Body() inputModel: BanUserDto,
  ): Promise<HttpStatus> {
    await this.usersService.banAndUnbanUser(params.userId, inputModel);
    return;
  }
}
