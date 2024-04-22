import { AnalyticsModule } from '@/analytics/analytics.module';
import { URLEntity } from '@/urls/entities/urls.entity';
import { URLsController } from '@/urls/urls.controller';
import { URLsService } from '@/urls/urls.service';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AnalyticsModule,
    UsersModule,
    TypeOrmModule.forFeature([URLEntity]),
  ],
  controllers: [URLsController],
  providers: [URLsService],
  exports: [URLsService],
})
export class URLsModule {}
