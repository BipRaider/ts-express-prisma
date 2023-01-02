//NodeJs def
import { Server, createServer } from 'http';
//Lib
import 'reflect-metadata';
import express, { Express } from 'express';
import { json } from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import logger from 'morgan';
import { inject, injectable } from 'inversify';
//Api files
import { UserController } from './users/users.controller';
import { PrismaService } from './database/prisma.service';
import { AuthMiddleware } from './common/auth.middleware';
//Types and interface
import { TYPES } from './types/types';
import { ILogger } from './logger/logger.interface';
import { IConfigService } from './config/config.service.interface';
import { IExceptionFilter } from './errors/exception.filter.interface';

@injectable()
export class App {
  app: Express;
  server: Server;
  port: number;

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.UserController) private userController: UserController,
    @inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.PrismaService) private prismaService: PrismaService,
  ) {
    const port = this.configService.get('PORT');
    this.app = express();
    this.port = +port || 8000;
  }

  useMiddleware(): void {
    this.app.use(json());
    this.app.disable('x-powered-by');
    this.app.enable('trust proxy');
    this.app.use(logger('dev'));
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: true,
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(
      fileUpload({
        tempFileDir: 'temp',
        useTempFiles: true,
      }),
    );
    const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'));
    this.app.use(authMiddleware.execute.bind(authMiddleware));
  }

  useRoutes(): void {
    this.app.use('/users', this.userController.router);
  }

  useExceptionFilters(): void {
    this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    this.app.use(this.exceptionFilter.noPath.bind(this.exceptionFilter));
  }

  public async init(): Promise<void> {
    this.useMiddleware();
    this.useRoutes();
    this.useExceptionFilters();
    await this.prismaService.connect();

    const server = createServer(this.app);

    this.server = server.listen(this.port, () => {
      this.logger.log(`Server started on port : http://localhost:${this.port}`);
    });
  }

  public close(): void {
    this.server.close(() => process.exit(1));
  }
}
