import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../dto/create-url.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
