import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview/:id')
  getPerformanceOfLastThirtyDays(@Param('id') id: string) {
    return this.analyticsService.getPerformanceOfLastThirtyDays(+id);
  }

  @Get('url-analytics/:url')
  async getAnalyticsByShortURL(@Param('url') short_url: string) {
    return await this.analyticsService.getAnalyticsByShortURL(short_url);
  }
}
