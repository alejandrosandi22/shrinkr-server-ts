import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview/:id')
  getPerformanceOfLastThirtyDays(@Param('id') id: string) {
    try {
      return this.analyticsService.getPerformanceOfLastThirtyDays(+id);
    } catch (error) {
      return new Error('Something went wrong');
    }
  }

  @Get('url-analytics/:url')
  async getAnalyticsByShortURL(@Param('url') short_url: string) {
    try {
      return await this.analyticsService.getAnalyticsByShortURL(short_url);
    } catch (error) {
      return new Error('Something went wrong');
    }
  }
}
