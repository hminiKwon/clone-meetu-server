import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

export const GetUser = createParamDecorator((_, ctx: ExecutionContextHost) => {
  const request = ctx.switchToHttp().getRequest();
  const authorization = request.headers.authorization;

  const accessToken = authorization.split(' ')[1];

  if (request.user.accessToken !== accessToken) {
    throw new UnauthorizedException('login failed');
  }

  return request.user;
});
