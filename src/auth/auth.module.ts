import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
