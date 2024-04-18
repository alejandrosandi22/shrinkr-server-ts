import { CreateURLDto } from '@/urls/dto/create-url.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateURLDto extends PartialType(CreateURLDto) {}
