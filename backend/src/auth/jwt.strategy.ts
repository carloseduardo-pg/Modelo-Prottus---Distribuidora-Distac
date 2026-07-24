import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

/** Payload mínimo do access JWT Distac. */
export type JwtPayload = {
  sub: string;
  email: string;
};

/** Lê `access_token` do cookie — Distac não usa Authorization Bearer no fluxo padrão. */
function cookieExtractor(req: Request): string | null {
  if (req?.cookies?.access_token) {
    return req.cookies.access_token as string;
  }
  return null;
}

/** Strategy Passport `jwt` alimentada pelo cookie httpOnly. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

  /** Expõe `userId`/`email` em `req.user` para controllers. */
  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
