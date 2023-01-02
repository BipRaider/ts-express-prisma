import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { sign } from 'jsonwebtoken';

import { TYPES } from '../types/types';
import { ILogger } from '../logger/logger.interface';
import { IUserController } from './users.controller.interface';
import { IConfigService } from '../config/config.service.interface';
import { IUserService } from './users.service.interface';

import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http-error.class';
import { ValidateMiddleware } from '../common/validate.middleware';
import { AuthGuard } from '../common/auth.guard';

import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';

@injectable()
export class UserController extends BaseController implements IUserController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.ConfigService) private configService: IConfigService,
  ) {
    super(loggerService);

    this.bindRoutes([
      {
        path: '/register',
        method: 'post',
        func: this.register,
        middlewares: [new ValidateMiddleware(UserRegisterDto)],
      },
      {
        path: '/login',
        method: 'post',
        func: this.login,
        middlewares: [new ValidateMiddleware(UserLoginDto)],
      },
      {
        path: '/info',
        method: 'get',
        func: this.info,
        middlewares: [new AuthGuard()],
      },
    ]);
  }

  async login(req: Request<unknown, unknown, UserLoginDto>, res: Response, next: NextFunction): Promise<void> {
    const result = await this.userService.validateUser(req.body);

    this.loggerService.log(`[Login] ${result}`);

    if (!result) return next(new HTTPError(401, 'Error authorization', 'login'));

    const jwt = await this.signJWT(req.body.email, this.configService.get('SECRET'));

    this.ok(res, { jwt });
  }

  async register(
    { body }: Request<unknown, unknown, UserRegisterDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await this.userService.createUser(body);

    if (!result) return next(new HTTPError(422, 'This user exists'));

    this.ok(res, { email: result.email, id: result.id });
  }

  public info = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { user } = req;
    if (!user.email) return next(new HTTPError(404, 'This user is not exists'));

    const userInfo = await this.userService.getUserInfo(user);

    this.ok(res, { email: userInfo?.email, id: userInfo?.id });
  };

  private signJWT(email: string, secret: string): Promise<string> {
    return new Promise<string>((res, rej): void => {
      sign(
        {
          email,
          iat: Math.floor(Date.now() / 1000),
        },
        secret,
        {
          algorithm: 'HS256',
        },
        (err, token): void => {
          if (err) {
            rej(err);
          }
          res(token as string);
        },
      );
    });
  }
}
