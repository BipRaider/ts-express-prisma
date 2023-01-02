import 'reflect-metadata';
import { Response, Router } from 'express';
import { injectable } from 'inversify';

import { ILogger } from '../logger/logger.interface';
import { ExpressReturnType, IControllerRoute } from './route.interface';

export { Router } from 'express';

@injectable()
export abstract class BaseController {
  private readonly _router: Router;

  constructor(private logger: ILogger) {
    this._router = Router();
  }

  get router(): Router {
    return this._router;
  }

  public send<T>(res: Response, code: number, payload: T): ExpressReturnType {
    try {
      res.type('application/json');
      return res.status(code).json(payload);
    } catch (error) {
      return res.end();
    }
  }

  public ok<T>(res: Response, payload: T): ExpressReturnType {
    return this.send<T>(res, 200, payload);
  }

  public created(res: Response): ExpressReturnType {
    try {
      return res.sendStatus(201);
    } catch (error) {
      return res.end();
    }
  }

  protected bindRoutes(routes: IControllerRoute[]): void {
    for (const route of routes) {
      this.logger.log(`[${route.method}] ${route.path}`);
      const middleware = route.middlewares?.map(m => m.execute.bind(m));
      const handler = route.func.bind(this);
      const pipeline = middleware ? [...middleware, handler] : handler;
      this.router[route.method](route.path, pipeline);
    }
  }
}
