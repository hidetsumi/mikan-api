import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUserPayload } from 'src/modules/auth/domain/services/token.services';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user: JwtUserPayload }>();

  if (!request.user) throw new Error('User not found in request');

  return request.user;
});
