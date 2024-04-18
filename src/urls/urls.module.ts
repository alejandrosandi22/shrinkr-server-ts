import { URLEntity } from '@/urls/entities/urls.entity';
import { URLsController } from '@/urls/urls.controller';
import { URLsService } from '@/urls/urls.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([URLEntity])],
  controllers: [URLsController],
  providers: [URLsService],
  exports: [URLsService],
})
export class URLsModule {}
