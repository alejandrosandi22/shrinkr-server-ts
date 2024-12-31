import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateUserDto } from './dto/update-url.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('email')
  getUser(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.usersService.getOneByEmail(body.email, [
      'id',
      'name',
      'email',
      'avatar',
    ]);
  }

  @Post('support')
  support(
    @Body()
    body: {
      name: string;
      email: string;
      reason: string;
      message: string;
    },
  ) {
    return this.usersService.supportMail(body);
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
