import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ACCESS_SECRET } from 'src/config/const';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token as string,
      ]),
      secretOrKey: JWT_ACCESS_SECRET,
    });
  }

  validate(payload: { sub: string }) {
    return { user_id: payload.sub };
  }
}
