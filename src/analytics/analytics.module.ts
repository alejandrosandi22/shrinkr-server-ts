import { AnalyticsController } from '@/analytics/analytics.controller';
import { AnalyticsService } from '@/analytics/analytics.service';
import { AnalyticsEntity } from '@/analytics/entities/analytics.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEntity])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
