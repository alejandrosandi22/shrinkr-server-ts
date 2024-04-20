import { AnalyticsService } from '@/analytics/analytics.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('main-stats/:id')
  async findMainStats(@Param('id') id: string) {
    const uniqueVisitors =
      await this.analyticsService.countUniqueVisitsLastThirtyDays(+id);
    const visits = await this.analyticsService.countVisitsLastThirtyDays(+id);
    const topCountry =
      await this.analyticsService.getTopCountryOfLastThirtyDays(+id);
    const topReferrer =
      await this.analyticsService.getTopReferrerOfLastThirtyDays(+id);

    return {
      uniqueVisitors,
      visits,
      topCountry,
      topReferrer,
    };
  }

  @Get('top-devices/:id')
  async getTopDevicesOfLastThirtyDays(@Param('id') id: string) {
    return await this.analyticsService.getTopDevicesOfLastThirtyDays(+id);
  }

  @Get('top-platforms/:id')
  async getTopPlatformsOfLastThirtyDays(@Param('id') id: string) {
    return await this.analyticsService.getTopPlatformsOfLastThirtyDays(+id);
  }

  @Get('top-referrers/:id')
  async getTopReferrersOfLastThirtyDays(@Param('id') id: string) {
    return await this.analyticsService.getTopReferrersOfLastThirtyDays(+id);
  }

  @Get('top-countries/:id')
  async getTopCountriesOfLastThirtyDays(@Param('id') id: string) {
    return await this.analyticsService.getTopCountriesOfLastThirtyDays(+id);
  }

  @Get('url-analytics/:url')
  async getAnalyticsByShortURL(@Param('url') short_url: string) {
    return await this.analyticsService.getAnalyticsByShortURL(short_url);
  }
}
