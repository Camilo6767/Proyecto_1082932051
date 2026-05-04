import { type NextRequest } from 'next/server';
import { getTokenFromCookies, verifyJWT, createUnauthorizedResponse } from './auth';
import { type JwtPayload } from './types';

export type AuthHandler = (request: NextRequest, user: JwtPayload) => Promise<Response>;

export function withAuth(handler: AuthHandler) {
  return async function (request: NextRequest): Promise<Response> {
    const token = getTokenFromCookies(request.headers.get('cookie'));
    if (!token) {
      return createUnauthorizedResponse();
    }

    try {
      const payload = await verifyJWT(token);
      return handler(request, payload);
    } catch (error) {
      return createUnauthorizedResponse();
    }
  };
}
