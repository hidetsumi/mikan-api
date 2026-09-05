import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  IS_PRODUCTION,
  JWT_ACCESS_EXPIRES_IN_SECONDS,
  JWT_REFRESH_EXPIRES_IN_SECONDS,
} from 'src/config/const';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterRequestDto } from './dto/register.dto';
import { UserResponseDto } from 'src/modules/users/infrastructure/http/dto/response.dto';
import { LoginRequestDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import type { JwtUserPayload } from '../../domain/services/token.services';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unknown email or wrong password.' })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  async login(
    @Body() loginDto: LoginRequestDto,
    @Ip() ip_address: string,
    @Headers('user-agent') user_agent: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const result = await this.loginUseCase.execute({
      email: loginDto.email,
      password: loginDto.password,
      ip_address,
      user_agent,
    });

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'strict',
      maxAge: JWT_ACCESS_EXPIRES_IN_SECONDS * 1000,
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'strict',
      maxAge: JWT_REFRESH_EXPIRES_IN_SECONDS * 1000,
    });

    return result.user;
  }

  @Post('register')
  @ApiBadRequestResponse({ description: 'Validation failed, or the email is already taken.' })
  async register(@Body() registerDto: RegisterRequestDto): Promise<UserResponseDto> {
    const createdUser = await this.registerUseCase.execute(registerDto);

    return {
      email: createdUser.email,
      name: createdUser.name,
      last_name: createdUser.last_name,
      id: createdUser.id,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiUnauthorizedResponse({ description: 'Missing, expired, revoked or already-used token.' })
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @CurrentUser() user: JwtUserPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') user_agent: string,
    @Ip() ip_address: string,
  ): Promise<void> {
    const result = await this.refreshTokenUseCase.execute({
      token: req.cookies.refresh_token as string,
      user_id: user.user_id,
      family: user.family,
      ip_address,
      user_agent,
    });

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'strict',
      maxAge: JWT_ACCESS_EXPIRES_IN_SECONDS * 1000,
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'strict',
      maxAge: JWT_REFRESH_EXPIRES_IN_SECONDS * 1000,
    });
  }
}
