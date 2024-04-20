import { CreateUserDto } from '@/users/dto/create-url.dto';
import { UpdateUserDto } from '@/users/dto/update-url.dto';
import { UserEntity } from '@/users/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

type UserEntityKey = keyof UserEntity;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  getOneById(id: number, select: UserEntityKey[]) {
    return this.userRepository.findOne({ where: { id }, select: [...select] });
  }

  getOneByEmail(email: string, select: UserEntityKey[]) {
    return this.userRepository.findOne({
      where: { email },
      select: [...select],
    });
  }

  getOneByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'provider'],
    });
  }

  getURLsByUser(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['urls'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.getOneById(id, ['name', 'password']);

      const { name, password, current_password } = updateUserDto;

      if (name === user.name && !password) {
        throw new BadRequestException('No changes have been made');
      }

      if (password) {
        const isPasswordValid = await bcrypt.compare(
          current_password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new UnauthorizedException('Incorrect password');
        }

        const hashPassword = await bcrypt.hash(password, 12);

        return this.userRepository.update(id, {
          ...updateUserDto,
          password: hashPassword,
        });
      }

      return this.userRepository.update(id, {
        ...updateUserDto,
        password: user.password,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async delete(id: number) {
    const user = await this.getOneById(id, ['email']);

    if (!user) throw new BadRequestException("User doesn't exist");
    return await this.userRepository.delete(id);
  }
}
