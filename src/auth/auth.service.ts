import { LoginDto } from '@/auth/dto/login.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { ProviderEnum } from '@/lib/enums/provider.enum';
import { UserEntity } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.getOneByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Incorrect email or does not exist');
    }

    if (user.provider !== 'email') {
      throw new UnauthorizedException(`Registered user with ${user.provider}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    const payload = { email: user.email, sub: user.id };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      email,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const user = await this.usersService.getOneByEmail(email);

    if (user) {
      throw new BadRequestException('User already exist');
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashPassword,
      provider: ProviderEnum.EMAIL,
    });

    const payload = { email, sub: newUser.id };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      email,
    };
  }

  async oAuthLogin(user: UserEntity) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.usersService.getOneByEmail(user.email);

    if (!userExists) {
      const newUser = await this.usersService.create(user);

      const payload = {
        email: newUser.email,
        name: newUser.name,
        sub: newUser.id,
      };

      const jwt = this.jwtService.sign(payload);
      return { access_token: jwt };
    }

    const payload = {
      email: user.email,
      name: user.name,
      sub: userExists.id,
    };

    const jwt = this.jwtService.sign(payload);
    return { access_token: jwt };
  }

  async isAuthenticated(access_token: string) {
    const decoded = this.jwtService.verify(access_token);

    if (!decoded) throw new UnauthorizedException('User is not logged in');

    const user = this.usersService.getOneByEmail(decoded.email);

    if (!user) {
      throw new UnauthorizedException('User is not logged in');
    }

    return user;
  }
}
