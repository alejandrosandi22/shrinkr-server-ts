import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ProviderEnum } from '../../lib/enums/provider.enum';

export class CreateUserDto {
  @IsOptional()
  avatar?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  email_verified?: Date;

  @IsNotEmpty()
  provider: ProviderEnum;

  @IsOptional()
  current_password?: string;
}
