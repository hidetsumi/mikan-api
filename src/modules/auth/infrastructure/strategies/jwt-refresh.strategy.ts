import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_REFRESH_SECRET } from 'src/config/const';
import type { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token as string,
      ]),
      secretOrKey: JWT_REFRESH_SECRET,
      passReqToCallback: false,
    });
  }
  validate(payload: { sub: string; family: string }) {
    return {
      user_id: payload.sub,
      family: payload.family,
    };
  }
}
