import 'reflect-metadata';
import { IsEmail, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsEmail({}, { message: 'The email is incorrect' })
  email: string;

  @IsString({ message: 'The password is incorrect' })
  password: string;

  @IsString({ message: 'The name is incorrect' })
  name: string;
}
