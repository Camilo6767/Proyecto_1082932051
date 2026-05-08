import { type JwtPayload } from './types';
import { createForbiddenResponse } from './auth';
import { type NextRequest } from 'next/server';

export type RoleHandler = (request: NextRequest, user: JwtPayload) => Promise<Response>;

export function withRole(handler: RoleHandler, allowedRoles: JwtPayload['role'][]): RoleHandler {
  return async function (request: NextRequest, user: JwtPayload): Promise<Response> {
    if (!allowedRoles.includes(user.role)) {
      return createForbiddenResponse();
    }
    return handler(request, user);
  };
}
