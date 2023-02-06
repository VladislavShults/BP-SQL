import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  UserDBType,
  UsersJoinBanInfoType,
  UsersJoinEmailConfirmationType,
  ViewUsersTypeWithPagination,
  ViewUserType,
} from '../types/users.types';
import { QueryUserDto } from './models/query-user.dto';
import { mapUserDBTypeToViewType } from '../helpers/mapUserDBTypeToViewType';
import { InfoAboutMeType } from '../../../public-API/auth/types/info-about-me-type';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { mapUserSQLTypeToViewType } from '../helpers/mapUserSQLTypeToViewType';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDBType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // async getUserByIdViewType(userId: string): Promise<ViewUserType | null> {
  //   const userDBType = await this.userModel.findById(userId);
  //   if (!userDBType) return null;
  //   return mapUserDBTypeToViewType(userDBType);
  // }

  async getUserByIdDBType(userId: string): Promise<UserDBType | null> {
    const userDBType = await this.userModel.findById(userId);
    if (!userDBType) return null;
    return userDBType;
  }

  async getUsers(query: QueryUserDto): Promise<ViewUsersTypeWithPagination> {
    const banStatus: string = query.banStatus || 'all';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';
    const searchLoginTerm: string | null = query.searchLoginTerm || '';
    const searchEmailTerm: string | null = query.searchEmailTerm || '';

    let itemsDBType: UsersJoinBanInfoType[];
    let pagesCount: number;
    let totalCount: number;

    if (banStatus === 'all') {
      const queryUsers = `
        SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email", 
                u."CreatedAt" as "createdAt", u."IsDeleted" as "isDeleted",
                b."IsBanned" as "isBanned", b."BanReason" as "banReason", b."BanDate" as "banDate"
        FROM public."Users" u
        JOIN public."BanInfo" b
        ON u."UserId" = b."UserId"
        WHERE LOWER ("Login") LIKE $1 AND "IsDeleted" = false
        OR (LOWER ("Email") LIKE $2 AND "IsDeleted" = false)
        ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
        LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
      `;

      itemsDBType = await this.dataSource.query(queryUsers, [
        '%' + searchLoginTerm.toLocaleLowerCase() + '%',
        '%' + searchEmailTerm.toLocaleLowerCase() + '%',
      ]);

      const queryCount = `SELECT count(*)
                        FROM public."Users" u
                        JOIN public."BanInfo" b
                        ON u."UserId" = b."UserId"
                        WHERE LOWER ("Login") LIKE $1 AND "IsDeleted" = false
                        OR (LOWER ("Email") LIKE $2 AND "IsDeleted" = false)`;

      const totalCountArray = await this.dataSource.query(queryCount, [
        '%' + searchLoginTerm.toLocaleLowerCase() + '%',
        '%' + searchEmailTerm.toLocaleLowerCase() + '%',
      ]);

      totalCount = Number(totalCountArray[0].count);

      pagesCount = Math.ceil(totalCount / pageSize);
    }

    if (banStatus === 'banned') {
      const queryUsers = `
        SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email", 
                u."CreatedAt" as "createdAt", u."IsDeleted" as "isDeleted",
                b."IsBanned" as "isBanned", b."BanReason" as "banReason", b."BanDate" as "banDate"
        FROM public."Users" u
        JOIN public."BanInfo" b
        ON u."UserId" = b."UserId"
        WHERE LOWER ("Login") LIKE $1 AND "IsDeleted" = false AND "IsBanned" = true
        OR (LOWER ("Email") LIKE $2 AND "IsDeleted" = false AND "IsBanned" = true)
        ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
        LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
      `;

      itemsDBType = await this.dataSource.query(queryUsers, [
        '%' + searchLoginTerm.toLocaleLowerCase() + '%',
        '%' + searchEmailTerm.toLocaleLowerCase() + '%',
      ]);

      const queryCount = `SELECT count(*)
                        FROM public."Users" u
                        JOIN public."BanInfo" b
                        ON u."UserId" = b."UserId"
                        WHERE LOWER ("Login") LIKE $1 AND "IsDeleted" = false AND "IsBanned" = true
                        OR (LOWER ("Email") LIKE $2 AND "IsDeleted" = false AND "IsBanned" = true)`;

      const totalCountArray = await this.dataSource.query(queryCount, [
        '%' + searchLoginTerm.toLocaleLowerCase() + '%',
        '%' + searchEmailTerm.toLocaleLowerCase() + '%',
      ]);

      totalCount = Number(totalCountArray[0].count);

      pagesCount = Math.ceil(totalCount / pageSize);
    }

    if (banStatus === 'notBanned') {
      const queryUsers = `
        SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email", 
                u."CreatedAt" as "createdAt", u."IsDeleted" as "isDeleted",
                b."IsBanned" as "isBanned", b."BanReason" as "banReason", b."BanDate" as "banDate"
        FROM public."Users" u
        JOIN public."BanInfo" b
        ON u."UserId" = b."UserId"
        WHERE LOWER ("Login") LIKE $1 AND "IsDeleted" = false AND "IsBanned" = false
        OR (LOWER ("Email") LIKE $2 AND "IsDeleted" = false AND "IsBanned" = false)
        ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
        LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
      `;

      itemsDBType = await this.dataSource.query(queryUsers, [
        '%' + searchLoginTerm.toLocaleLowerCase() + '%',
        '%' + searchEmailTerm.toLocaleLowerCase() + '%',
      ]);

      const queryCount = `SELECT count(*)
                        FROM public."Users" u
                        JOIN public."BanInfo" b
                        ON u."UserId" = b."UserId"
                        WHERE LOWER ("Login") LIKE $1 AND "IsDeleted" = false AND "IsBanned" = false
                        OR (LOWER ("Email") LIKE $2 AND "IsDeleted" = false AND "IsBanned" = false)`;

      const totalCountArray = await this.dataSource.query(queryCount, [
        '%' + searchLoginTerm.toLocaleLowerCase() + '%',
        '%' + searchEmailTerm.toLocaleLowerCase() + '%',
      ]);

      totalCount = Number(totalCountArray[0].count);

      pagesCount = Math.ceil(totalCount / pageSize);
    }

    const items = itemsDBType.map((i) => mapUserDBTypeToViewType(i));

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async returnInfoAboutMe(userId: number): Promise<InfoAboutMeType> {
    const userById = await this.getUserByIdJoinEmailConfirmationType(userId);
    return {
      email: userById.email,
      login: userById.login,
      userId: userById.id.toString(),
    };
  }

  async getUserByLogin(login: string): Promise<UserDBType | null> {
    const user = await this.userModel.findOne({ login: login }).lean();
    if (!user) return null;
    return user;
  }

  async getUserByIdJoinBanInfoType(
    userId: number,
  ): Promise<ViewUserType | null> {
    const userSQLType = await this.dataSource.query(
      `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",u."IsBanned" as "isBanned",
           u."CreatedAt" as "createdAt", b."BanDate" as "banDate", b."BanReason" as "banReason"
    FROM public."BanInfo" b
    JOIN public."Users" u
    ON b."UserId" = u."UserId"
    WHERE b."UserId" = $1
    `,
      [userId],
    );

    if (userSQLType.length === 0) return null;

    return mapUserSQLTypeToViewType(userSQLType[0]);
  }

  async getUserByIdJoinEmailConfirmationType(
    userId: number,
  ): Promise<UsersJoinEmailConfirmationType> {
    const userSQLType = await this.dataSource.query(
      `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",
           e."IsConfirmed" as "isConfirmed", e."ConfirmationCode" as "confirmationCode",
           e."ExpirationDate" as "expirationDate"
    FROM public."Users" u
    JOIN public."EmailConfirmation" e
    ON u."UserId" = e."UserId"
    WHERE "IsDeleted" = false AND u."UserId" = $1
    `,
      [userId],
    );

    if (!userSQLType) return null;

    return userSQLType[0];
  }
}
