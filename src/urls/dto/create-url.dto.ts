import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateURLDto {
  @IsNotEmpty()
  @IsUrl()
  original_url: string;

  @IsOptional()
  short_url: string;

  @IsOptional()
  expiration_date: Date;

  @IsOptional()
  active: boolean;

  @IsOptional()
  custom_alias?: string | null;

  @IsNotEmpty()
  user_id: number;
}
