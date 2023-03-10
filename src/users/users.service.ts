import 'reflect-metadata';
import { inject, injectable } from 'inversify';

import { UserModel } from '.prisma/client';
import { IConfigService } from '../config/config.service.interface';
import { TYPES } from '../types/types';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './user.entity';
import { IUsersRepository } from './users.repository.interface';
import { IUserService } from './users.service.interface';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
  ) {}

  public createUser = async ({ email, name, password }: UserRegisterDto): Promise<UserModel | null> => {
    try {
      const newUser = new User(email, name);

      const salt = this.configService.get('SALT');

      await newUser.setPassword(password, Number(salt));

      const existedUser = await this.usersRepository.find(email);
      if (existedUser) return null;

      return this.usersRepository.create(newUser);
    } catch (error) {
      return null;
    }
  };

  public validateUser = async ({ email, password }: UserLoginDto): Promise<boolean> => {
    const existedUser = await this.usersRepository.find(email);

    if (!existedUser) return false;

    const newUser = new User(existedUser.email, existedUser.name || '', existedUser.password);
    return newUser.comparePassword(password);
  };

  public getUserInfo = async ({ email }: Pick<UserModel, 'email'>): Promise<UserModel | null> =>
    this.usersRepository.find(email);
}
