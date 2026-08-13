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
import { env } from 'src/config/env';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterRequestDto, RegisterResponseDto } from './dto/register.dto';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import type { JwtUserPayload } from '../../domain/services/token.services';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
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
  @ApiOperation({
    summary: 'Log in',
    description:
      'On success, sets the httpOnly `access_token` and `refresh_token` cookies. ' +
      'The tokens are never returned in the response body, which carries only the user.',
  })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unknown email or wrong password.' })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  async login(
    @Body() loginDto: LoginRequestDto,
    @Ip() ip_address: string,
    @Headers('user-agent') user_agent: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.loginUseCase.execute({
      email: loginDto.email,
      password: loginDto.password,
      ip_address,
      user_agent,
    });

    const isProduction = env.NODE_ENV === 'production';

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: env.JWT_ACCESS_EXPIRES_IN * 1000,
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: env.JWT_REFRESH_EXPIRES_IN * 1000,
    });

    return result.user;
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Does not log the user in: no cookies are set. Call POST /auth/login next.',
  })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed, or the email is already taken.' })
  async register(@Body() registerDto: RegisterRequestDto): Promise<RegisterResponseDto> {
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
  @ApiOperation({
    summary: 'Rotate the token pair',
    description:
      'Reads `refresh_token` from the cookie and replaces both cookies with a new pair. ' +
      'Returns an empty body. Reusing a spent token revokes its whole family.',
  })
  @ApiOkResponse({ description: 'Cookies rotated. The response body is empty.' })
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

    const isProduction = env.NODE_ENV === 'production';

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: env.JWT_ACCESS_EXPIRES_IN * 1000,
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: env.JWT_REFRESH_EXPIRES_IN * 1000,
    });
  }
}
