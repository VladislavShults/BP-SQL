import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { EmailService } from '../../../../infrastructure/SMTP-adapter/email-service';
import { UsersService } from '../../../SA-API/users/application/users.servive';
import { CreateUserDto } from '../../../SA-API/users/api/models/create-user.dto';
import { UsersQueryRepository } from '../../../SA-API/users/api/users.query.repository';
import { CheckDuplicatedEmailGuard } from '../guards/check-duplicated-email-guard';
import { RegistrationConfirmationAuthDto } from './models/registration-confirmation.auth.dto';
import { createErrorMessage } from '../helpers/create-error-message';
import { RegistrationEmailResendingAuthDto } from './models/registration-email-resending.auth.dto';
import { LoginAuthDto } from './models/login.auth.dto';
import { AccessTokenAuthDto } from './models/access-token-auth.dto';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { EmailAuthDto } from './models/email-auth.dto';
import { NewPasswordAuthDto } from './models/new-password.auth.dto';
import { JwtAuthGuard } from '../guards/JWT-auth.guard';
import { InfoAboutMeType } from '../types/info-about-me-type';
import { CheckDuplicatedLoginGuard } from '../guards/check-duplicated-login.guard';
import { CheckUserAndHisPasswordInDB } from '../guards/checkUserAndHisPasswordInDB';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { IpRestrictionGuard } from '../../../../infrastructure/ip-restriction/guards/ip-restriction.guard';
import { Cookies } from '../decorators/cookies.decorator';
import { CheckRefreshTokenInCookie } from '../guards/checkRefreshTokenInCookie';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  @Post('registration')
  @HttpCode(204)
  @UseGuards(
    // IpRestrictionGuard,
    CheckDuplicatedEmailGuard,
    CheckDuplicatedLoginGuard,
  )
  async registration(@Body() inputModel: CreateUserDto): Promise<HttpStatus> {
    const newUserObjectId = await this.usersService.createUser(inputModel);
    const user = await this.usersQueryRepository.getUserByIdDBType(
      newUserObjectId.toString(),
    );
    this.emailService.sendEmailRecoveryCode(
      inputModel.email,
      user.emailConfirmation.confirmationCode,
    );
    return;
  }

  @Post('registration-confirmation')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(204)
  async registrationConfirmation(
    @Body()
    inputModel: RegistrationConfirmationAuthDto,
  ): Promise<HttpStatus> {
    const userByConfirmationCode =
      await this.authService.findAccountByConfirmationCode(inputModel.code);
    if (!userByConfirmationCode)
      throw new BadRequestException(createErrorMessage('code'));
    if (userByConfirmationCode.emailConfirmation.isConfirmed)
      throw new BadRequestException(createErrorMessage('code'));
    const verifiedAccount = await this.authService.confirmAccount(
      userByConfirmationCode._id.toString(),
    );
    if (!verifiedAccount) {
      throw new BadRequestException(createErrorMessage('code'));
    }
    return;
  }

  @Post('registration-email-resending')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(204)
  async registrationEmailResending(
    @Body() inputModel: RegistrationEmailResendingAuthDto,
  ): Promise<HttpStatus> {
    const accountIsConfirmed = await this.authService.accountIsConfirmed(
      inputModel.email,
    );

    const confirmationCode = await this.authService.refreshConfirmationCode(
      inputModel.email,
    );

    if (confirmationCode && !accountIsConfirmed) {
      this.emailService.sendEmailRecoveryCode(
        inputModel.email,
        confirmationCode,
      );
      return;
    } else throw new BadRequestException(createErrorMessage('email'));
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(
    // IpRestrictionGuard,
    CheckUserAndHisPasswordInDB,
  )
  async login(
    @Body() inputModel: LoginAuthDto,
    @Request() req,
    @Response() res,
  ) {
    if (req.cookies?.refreshToken) {
      await this.authService.deleteRefreshToken(req.cookies?.refreshToken);
    }
    const user: UserDBType = req.user;

    if (user.banInfo.isBanned)
      throw new HttpException('Banned user', HttpStatus.UNAUTHORIZED);

    const newAccessToken = await this.authService.createAccessToken(
      user._id.toString(),
      '300000',
    );
    const newRefreshToken = await this.authService.createRefreshToken(
      user._id.toString(),
      '300000',
    );
    await this.authService.saveDeviceInputInDB(
      newRefreshToken,
      req.ip,
      req.headers['user-agent'],
    );
    res
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 300 * 1000,
      })
      .status(200)
      .json({ accessToken: newAccessToken });
  }

  @Post('refresh-token')
  @UseGuards(CheckRefreshTokenInCookie)
  async updateRefreshToken(
    @Body() inputModel: AccessTokenAuthDto,
    @Cookies('refreshToken') oldRefreshToken: string,
    @Response() res,
    @Request() req,
  ) {
    // const userIdFromBodyAccessToken =
    //   (await this.jwtService.extractUserIdFromToken(inputModel.accessToken)) ||
    //   null;

    const userIdFromRefreshToken = await this.jwtService.extractUserIdFromToken(
      oldRefreshToken,
    );

    // if (userIdFromBodyAccessToken !== userIdFromRefreshToken)
    //   throw new HttpException('token', HttpStatus.UNAUTHORIZED);

    const deviceId = await this.jwtService.extractDeviceIdFromToken(
      oldRefreshToken,
    );

    const newAccessToken = await this.authService.createAccessToken(
      userIdFromRefreshToken.toString(),
      '300000',
    );
    const newRefreshToken = await this.jwtService.createRefreshJWT(
      userIdFromRefreshToken.toString(),
      deviceId.toString(),
      '300000',
    );
    await this.authService.updateRefreshToken(
      oldRefreshToken,
      newRefreshToken,
      req.ip,
    );
    res
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 300 * 1000,
      })
      .status(200)
      .json({ accessToken: newAccessToken });
  }

  @Post('password-recovery')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() inputModel: EmailAuthDto) {
    const email = inputModel.email;
    const user = await this.usersService.findUserByEmail(email);
    if (!user) return;
    await this.emailService.sendEmailRecoveryCode(
      inputModel.email,
      user.emailConfirmation.confirmationCode,
    );
    return;
  }

  @Post('new-password')
  // @UseGuards(IpRestrictionGuard)
  @HttpCode(204)
  async newPassword(@Body() inputModel: NewPasswordAuthDto) {
    const userByConfirmationCode =
      await this.authService.findAccountByConfirmationCode(
        inputModel.recoveryCode,
      );
    if (!userByConfirmationCode)
      throw new BadRequestException(createErrorMessage('recoveryCode'));
    const hashNewPassword = await this.authService.generateHash(
      inputModel.newPassword,
    );
    await this.authService.changePassword(
      hashNewPassword,
      userByConfirmationCode._id.toString(),
    );
    return;
  }

  @Post('logout')
  @UseGuards(CheckRefreshTokenInCookie)
  @HttpCode(204)
  async logout(
    @Cookies('refreshToken') refreshToken: string,
  ): Promise<HttpStatus> {
    await this.authService.deleteRefreshToken(refreshToken);
    return;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async infoAboutMe(@Request() req): Promise<InfoAboutMeType> {
    const token: string = req.headers.authorization.split(' ')[1];
    const userId = await this.jwtService.extractUserIdFromToken(token);
    return await this.usersQueryRepository.returnInfoAboutMe(userId.toString());
  }
}
