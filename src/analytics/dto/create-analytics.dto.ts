import { IsNotEmpty } from 'class-validator';

export class CreateAnalyticsDto {
  @IsNotEmpty()
  device: string;

  @IsNotEmpty()
  platforms: string;

  @IsNotEmpty()
  referrer: string;

  @IsNotEmpty()
  browser: string;

  @IsNotEmpty()
  country: string;
}
