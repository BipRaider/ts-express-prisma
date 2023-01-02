import 'reflect-metadata';
import {expect, jest,beforeAll,describe,it} from '@jest/globals';

import { UserModel } from '@prisma/client';
import { Container } from 'inversify';

import { IConfigService } from '../src/config/config.service.interface';
import { TYPES } from '../src/types/types';
import { User } from '../src/users/user.entity';
import { IUsersRepository } from '../src/users/users.repository.interface';
import { UserService } from '../src/users/users.service';
import { IUserService } from '../src/users/users.service.interface';



const ConfigServiceMock: IConfigService = {
	get: jest.fn() as (key:string)=> string,
};

const UsersRepositoryMock: IUsersRepository = {
	find: jest.fn() as any,
	create: jest.fn() as any
};

const container = new Container();
let configService: IConfigService;
let usersRepository: IUsersRepository;
let usersService: IUserService;

beforeAll(() => {
	container.bind<IUserService>(TYPES.UserService).to(UserService);
	container.bind<IConfigService>(TYPES.ConfigService).toConstantValue(ConfigServiceMock);
	container.bind<IUsersRepository>(TYPES.UsersRepository).toConstantValue(UsersRepositoryMock);

	configService = container.get<IConfigService>(TYPES.ConfigService);
	usersRepository = container.get<IUsersRepository>(TYPES.UsersRepository);
	usersService = container.get<IUserService>(TYPES.UserService);
});

let createdUser: UserModel | any;

describe('User Service', () => {
	it('createUser', async () => {
		configService.get = jest.fn().mockReturnValueOnce('1')  as (key:string)=> string;

		const createUserFn: any = ({name,email,password}: User): UserModel => ({ name, email, password, id: 1}) 


		usersRepository.create  = jest.fn().mockImplementationOnce(createUserFn) as any;

		createdUser = await usersService.createUser({
			email: 'a@a.ru',
			name: 'Антон',
			password: '1',
		});
		expect(createdUser?.id).toEqual(1);
		expect(createdUser?.password).not.toEqual('1');
	});

	it('validateUser - success', async () => {

		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser) as any;

		const res = await usersService.validateUser({
			email: 'a@a.ru',
			password: '1',
		}) as any;

		expect(res).toBeTruthy();
	});

	it('validateUser - wrong password', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser) as any;
		const res = await usersService.validateUser({
			email: 'a@a.ru',
			password: '2',
		});
		expect(res).toBeFalsy();
	});

	it('validateUser - wrong user', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(null) as any;
		const res = await usersService.validateUser({
			email: 'a2@a.ru',
			password: '2',
		});
		expect(res).toBeFalsy();
	});
});
