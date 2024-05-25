import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-url.dto';
import { UpdateUserDto } from './dto/update-url.dto';
import { UserEntity } from './entities/user.entity';

type UserEntityKey = keyof UserEntity;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailerService: MailerService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  getOneById(id: number, select: UserEntityKey[]) {
    return this.userRepository.findOne({ where: { id }, select });
  }

  async getOneByEmail(email: string, select: UserEntityKey[]) {
    try {
      return await this.userRepository.findOneOrFail({
        where: { email },
        select,
      });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  getOneByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'provider'],
    });
  }

  async getURLsByUser(id: number) {
    try {
      return await this.userRepository.findOneOrFail({
        where: { id },
        relations: ['urls'],
      });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async resetPassword(email: string, password: string) {
    const user = await this.getOneByEmail(email, ['id']);

    if (!user) {
      throw new BadRequestException("User doesn't exist");
    }

    const hashPassword = await bcrypt.hash(password, 12);

    return this.userRepository.update(user.id, {
      password: hashPassword,
    });
  }

  supportMail({
    name,
    email,
    reason,
    message,
  }: {
    name: string;
    email: string;
    reason: string;
    message: string;
  }) {
    return this.mailerService.sendMail({
      from: email,
      to: process.env.MAIL_EMAIL,
      subject: `Message from ${name} <${email}>: ${reason}`,
      text: message,
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
