import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from '../application/devices.service';
import { DevicesQueryRepository } from './devices.query.repository';
import { CheckRefreshTokenInCookie } from '../../auth/guards/checkRefreshTokenInCookie';
import { Cookies } from '../../auth/decorators/cookies.decorator';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { DevicesResponseType } from '../types/devices.types';
import { URIParamDeleteDeviceIdDto } from './models/URIParam-delete-deviceId.dto';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  @Get('devices')
  @UseGuards(CheckRefreshTokenInCookie)
  async getActiveSessionCurrentUser(
    @Cookies('refreshToken') refreshToken: string,
  ): Promise<DevicesResponseType[]> {
    const userId = await this.jwtService.extractUserIdFromToken(refreshToken);
    return await this.devicesQueryRepository.getActiveSessionCurrentUser(
      userId.toString(),
    );
  }

  @Delete('devices')
  @HttpCode(204)
  @UseGuards(CheckRefreshTokenInCookie)
  async terminateAllSessionExcludeCurrent(
    @Cookies('refreshToken') refreshToken: string,
  ): Promise<HttpStatus> {
    const userId = await this.jwtService.extractUserIdFromToken(refreshToken);
    const deviceId = await this.jwtService.extractDeviceIdFromToken(
      refreshToken,
    );
    await this.devicesService.terminateAllSessionExceptThis(
      userId.toString(),
      deviceId.toString(),
    );
    return;
  }

  @Delete('devices/:deviceId')
  @HttpCode(204)
  @UseGuards(CheckRefreshTokenInCookie)
  async terminateSpecificDeviceSession(
    @Param() params: URIParamDeleteDeviceIdDto,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const userId = await this.jwtService.extractUserIdFromToken(refreshToken);

    const deviceId = params.deviceId;

    const sessionByDeviceId = await this.devicesService.findSessionByDeviceId(
      deviceId,
    );

    if (!sessionByDeviceId)
      throw new HttpException('session not found', HttpStatus.NOT_FOUND);

    if (sessionByDeviceId.userId !== userId.toString())
      throw new HttpException('', HttpStatus.FORBIDDEN);
    await this.devicesService.terminateSpecificDeviceSession(
      deviceId,
      userId.toString(),
    );
    return;
  }
}
