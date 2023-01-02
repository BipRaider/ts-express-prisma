import { NextFunction, Request, Response } from 'express';

import { IMiddleware } from './middleware.interface';

export class AuthGuard implements IMiddleware {
  execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.user) return next();

    await Promise.resolve(res.status(401).send({ error: 'Unauthorized' }));
  };
}
