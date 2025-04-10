import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from './roles.decorator';
import { UserPayload } from '../interfaces/user-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      // If no roles are required, access is granted
      return true;
    }
    // Type the user object from the request
    const request = context.switchToHttp().getRequest<{ user: UserPayload }>();
    const user = request.user;

    // Check if user object exists and has roles
    if (!user || !Array.isArray(user.roles)) {
      // If user or user.roles is not defined, deny access
      // This assumes your authentication strategy attaches a user object with a roles array
      return false;
    }

    // Check if the user has at least one of the required roles
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
