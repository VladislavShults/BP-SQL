import { Injectable } from '@nestjs/common';
import {
  EmailConfirmationType,
  UserForTypeOrmType,
  UsersJoinEmailConfirmationType,
} from '../types/users.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async deleteUserById(userId: string): Promise<boolean> {
    await this.dataSource.query(
      `
    UPDATE public."Users" u
    SET "IsDeleted"=true
    WHERE u."UserId" = $1;`,
      [userId],
    );
    return true;
  }

  async getUser(userId: string) {
    try {
      const user = await this.dataSource.query(
        `
    SELECT "UserId", "Login", "CreatedAt", "IsDeleted"
    FROM public."Users" u
    WHERE u."UserId" = $1`,
        [userId],
      );
      if (user.length === 0) return null;
      return user[0];
    } catch (error) {
      return null;
    }
  }

  async findAccountByConfirmationCode(code: string) {
    const account = await this.dataSource.query(
      `
    SELECT "ExpirationDate" as "expirationDate", "IsConfirmed" as "isConfirmed", "UserId" as "userId"
    FROM public."EmailConfirmation"
    WHERE "ConfirmationCode" = $1`,
      [code],
    );

    if (account.length === 0) return null;

    return account[0];
  }

  async confirmedAccount(code: string): Promise<boolean> {
    await this.dataSource.query(
      `
    UPDATE public."EmailConfirmation"
    SET "IsConfirmed"=true
    WHERE "ConfirmationCode" = $1`,
      [code],
    );
    return;
  }

  async checkUserByEmailInDB(email: string): Promise<number | null> {
    const account = await this.dataSource.query(
      `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",
           e."IsConfirmed" as "isConfirmed", e."ConfirmationCode" as "confirmationCode",
           e."ExpirationDate" as "expirationDate"
    FROM public."Users" u
    JOIN public."EmailConfirmation" e
    ON u."UserId" = e."UserId"
    WHERE "IsDeleted" = false AND "Email" = $1
    `,
      [email],
    );
    if (account.length === 0) return null;
    else return account[0].id;
  }

  async accountIsConfirmed(email: string): Promise<boolean> {
    const account: UsersJoinEmailConfirmationType[] =
      await this.dataSource.query(
        `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",
           e."IsConfirmed" as "isConfirmed", e."ConfirmationCode" as "confirmationCode",
           e."ExpirationDate" as "expirationDate"
    FROM public."Users" u
    JOIN public."EmailConfirmation" e
    ON u."UserId" = e."UserId"
    WHERE "IsDeleted" = false AND "Email" = $1`,
        [email],
      );

    if (account.length === 0) return true;

    return account[0].isConfirmed;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersJoinEmailConfirmationType | null> {
    const accountByLoginOrEmail = await this.dataSource.query(
      `
    SELECT u."UserId" as "id", u."Login" as "login", u."Email" as "email",
           e."ConfirmationCode" as "confirmationCode"
    FROM public."Users" u
    JOIN public."EmailConfirmation" e
    ON u."UserId" = e."UserId"
    WHERE u."IsDeleted" = false AND u."Login" = $1
    OR(u."IsDeleted" = false AND u."Email" = $1)`,
      [loginOrEmail],
    );

    if (accountByLoginOrEmail.length === 0) return null;

    return accountByLoginOrEmail[0];
  }

  async saveEmailConfirmation(
    emailConfirmation: EmailConfirmationType,
  ): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO public."EmailConfirmation"(
            "ConfirmationCode", "ExpirationDate", "IsConfirmed", "UserId")
        VALUES ($1, $2, $3, $4)
        RETURNING "EmailConfirmationId";`,
      [
        emailConfirmation.confirmationCode,
        emailConfirmation.expirationDate,
        emailConfirmation.isConfirmed,
        emailConfirmation.userId,
      ],
    );
    return result[0].EmailConfirmationId;
  }

  async createUser(user: UserForTypeOrmType): Promise<number> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public."Users"(
            "Login", "Email", "PasswordHash")
    VALUES ($1, $2, $3)
    RETURNING "UserId";
    `,
      [user.login, user.email, user.passwordHash],
    );
    return result[0].UserId;
  }

  async createBanInfoForUser(userId: number): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO public."BanInfo"(
        "IsBanned", "UserId")
        VALUES ($1, $2)
        RETURNING "BanInfoId";
    `,
      [false, userId],
    );
    return result[0].BanInfoId;
  }

  async banOrUnbanUser(
    userId: string,
    banInfo: { isBanned: boolean; banDate: Date; banReason: string },
  ): Promise<void> {
    await this.dataSource.query(
      `
    UPDATE public."BanInfo"
    SET "IsBanned"= $1, "BanDate"= $2, "BanReason"= $3
    WHERE "UserId" = $4;`,
      [banInfo.isBanned, banInfo.banDate, banInfo.banReason, userId],
    );
    await this.dataSource.query(
      `
    UPDATE public."Users"
    SET "IsBanned"= $1
    WHERE "UserId" = $2;`,
      [banInfo.isBanned, userId],
    );
  }

  async refreshConfirmationCodeAndDate(
    userId: number,
    newConfirmationData: { confirmationCode: string; expirationDate: Date },
  ) {
    await this.dataSource.query(
      `
    UPDATE public."EmailConfirmation"
    SET "ConfirmationCode"=$1, "ExpirationDate"=$2
    WHERE "UserId" = $3;`,
      [
        newConfirmationData.confirmationCode,
        newConfirmationData.expirationDate,
        userId,
      ],
    );
  }

  async changePassword(newPasswordHash: string, userId: string) {
    await this.dataSource.query(
      `
    UPDATE public."Users"
    SET "PasswordHash"=$1
    WHERE "UserId" = $2;`,
      [newPasswordHash, userId],
    );
  }
}
