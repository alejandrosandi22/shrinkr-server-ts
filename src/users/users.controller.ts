import { AuthGuard } from '@/auth/guards/auth.guard';
import { UpdateUserDto } from '@/users/dto/update-url.dto';
import { UserEntity } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

type UserEntityKey = keyof UserEntity;

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('email')
  getUser(
    @Body()
    body: {
      email: string;
      select: UserEntityKey[];
    },
  ) {
    return this.usersService.getOneByEmail(body.email, body.select);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  delete(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }
}
