import { IMiddleware } from './middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

export class AuthMiddleware implements IMiddleware {
  constructor(private secret: string) {}

  execute = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const { authorization } = req.headers;

    if (authorization && typeof authorization === 'string') {
      const token = authorization.split(' ')[1];

      if (!token) return next();

      const payload: JwtPayload & { email?: string } = await new Promise((res): void => {
        verify(token, this.secret, (_err, decoded): void => {
          if (decoded) res(decoded as JwtPayload & { email?: string });
        });
      });

      if (payload.email) req.user.email = payload.email;

      next();
    } else {
      next();
    }
  };
}
