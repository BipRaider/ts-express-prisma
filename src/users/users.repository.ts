import 'reflect-metadata';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types/types';
import { IUsersRepository } from './users.repository.interface';

import { UserModel } from '.prisma/client';
import { PrismaService } from '../database/prisma.service';
import { User } from './user.entity';

@injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

  async create({ email, password, name }: User): Promise<UserModel> {
    return this.prismaService.client.userModel.create({
      data: { email, password, name },
    });
  }

  async find(email: string): Promise<UserModel | null> {
    return this.prismaService.client.userModel.findFirst({
      where: { email },
    });
  }
}
