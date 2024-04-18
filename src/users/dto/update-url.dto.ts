import { CreateUrlDto } from '@/users/dto/create-url.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUrlDto extends PartialType(CreateUrlDto) {}
