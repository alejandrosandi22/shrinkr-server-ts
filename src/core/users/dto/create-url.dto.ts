import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { OAuthEnum } from '../../../common/enums/oauth.enum';

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
  provider: OAuthEnum;

  @IsOptional()
  current_password?: string;
}
