import path from 'path';

import 'reflect-metadata';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { inject, injectable } from 'inversify';

import { IConfigService } from './config.service.interface';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types/types';

@injectable()
export class ConfigService implements IConfigService {
  private config: DotenvParseOutput;

  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    const result: DotenvConfigOutput = config({ path: path.join(__dirname, '../../.env') });

    if (result.error) {
      this.logger.error('[ConfigService] Failed to read .env file or not find it');
    } else {
      this.logger.log('[ConfigService] Configurations .env file loaded');
      this.config = result.parsed as DotenvParseOutput;
    }
  }

  get(key: string): string {
    return this.config[key] as string;
  }
}
