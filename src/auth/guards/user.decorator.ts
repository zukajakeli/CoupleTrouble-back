import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('request.user', request.user);
    request.user.id = request.user.sub ?? request.user.id;

    return request.user;
  },
);
