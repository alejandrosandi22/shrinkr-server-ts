import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { UsersModule } from '../users/users.module';
import { URLEntity } from './entities/urls.entity';
import { URLsController } from './urls.controller';
import { URLsService } from './urls.service';

@Module({
  imports: [
    HttpModule,
    AnalyticsModule,
    UsersModule,
    TypeOrmModule.forFeature([URLEntity]),
  ],
  controllers: [URLsController],
  providers: [URLsService],
  exports: [URLsService],
})
export class URLsModule {}
