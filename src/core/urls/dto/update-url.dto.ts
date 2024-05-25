import { PartialType } from '@nestjs/mapped-types';
import { CreateURLDto } from '../../urls/dto/create-url.dto';

export class UpdateURLDto extends PartialType(CreateURLDto) {}
