import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { IMiddleware } from './middleware.interface';

export class ValidateMiddleware implements IMiddleware {
  constructor(private classToValidate: ClassConstructor<object>) {}

  execute = async ({ body }: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToClass(this.classToValidate, body);

    const valid = await validate(instance);

    if (valid.length > 0) res.status(422).send(valid);
    else next();
  };
}
