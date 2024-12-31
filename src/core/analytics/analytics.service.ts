import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { URLEntity } from '../urls/entities/urls.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { AnalyticsEntity } from './entities/analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEntity)
    private readonly analyticsRepository: Repository<AnalyticsEntity>,
  ) {}

  async create(createAnalyticsDto: CreateAnalyticsDto, url: URLEntity) {
    return this.analyticsRepository.save({
      ...createAnalyticsDto,
      url,
    });
  }

  private async countVisitsInPeriod(
    id: number,
    startDate: Date,
    endDate: Date,
  ) {
    return this.analyticsRepository.count({
      where: {
        url: { user: { id } },
        created_at: Between(startDate, endDate),
      },
    });
  }

  private async countVisitsLastThirtyDays(userId: number) {
    const currentDay = new Date();

    const countThirtyDaysAgo = await this.countVisitsInPeriod(
      userId,
      new Date(currentDay.getDate() - 30),
      currentDay,
    );

    const countSixtyDaysAgo = await this.countVisitsInPeriod(
      userId,
      new Date(currentDay.getDate() - 60),
      new Date(currentDay.getDate() - 30),
    );

    let growthPercentage = 0;
    if (countSixtyDaysAgo !== 0) {
      growthPercentage =
        ((countThirtyDaysAgo - countSixtyDaysAgo) / countSixtyDaysAgo) * 100;
    }

    return {
      title: 'Visits',
      value: countThirtyDaysAgo,
      difference: growthPercentage,
    };
  }

  private async countUniqueVisitsInPeriod(
    id: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('COUNT(DISTINCT analytics.ip)')
      .where(
        'analytics.url_id IN (SELECT id FROM urls WHERE "user_id" = :id)',
        { id },
      )
      .andWhere('analytics.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return Number(result.count);
  }

  async countUniqueVisitsLastThirtyDays(id: number) {
    const currentDay = new Date();

    const uniqueVisitsLastThirtyDays = await this.countUniqueVisitsInPeriod(
      id,
      new Date(currentDay.getDate() - 30),
      currentDay,
    );

    const uniqueVisitsLastSixtyDays = await this.countUniqueVisitsInPeriod(
      id,
      new Date(currentDay.getDate() - 60),
      new Date(currentDay.getDate() - 30),
    );

    let growthPercentage = 0;
    if (uniqueVisitsLastSixtyDays !== 0) {
      growthPercentage =
        ((uniqueVisitsLastThirtyDays - uniqueVisitsLastSixtyDays) /
          uniqueVisitsLastSixtyDays) *
        100;
    }

    return {
      title: 'Unique visits',
      value: uniqueVisitsLastThirtyDays,
      difference: growthPercentage ? growthPercentage : 0,
    };
  }

  private async getTopCountryDifferencePercentage(
    userId: number,
    topCountry: string,
  ) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const previousThirtyDays = new Date();
    previousThirtyDays.setDate(previousThirtyDays.getDate() - 60);

    const totalVisitsThirtyDaysAgo = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('COUNT(*)', 'total_visits_thirty_days_ago')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('analytics.location LIKE :topCountry', {
        topCountry: `%${topCountry}%`,
      })
      .getRawOne();

    const totalVisitsPreviousThirtyDays = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('COUNT(*)', 'total_visits_previous_thirty_days')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= :previousThirtyDays', { previousThirtyDays })
      .andWhere('"created_at" < :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('analytics.location LIKE :topCountry', {
        topCountry: `%${topCountry}%`,
      })
      .getRawOne();

    const { total_visits_thirty_days_ago } = totalVisitsThirtyDaysAgo;
    const { total_visits_previous_thirty_days } = totalVisitsPreviousThirtyDays;

    const totalVisits30Days = Number(total_visits_thirty_days_ago);
    const totalVisitsPrev30Days = Number(total_visits_previous_thirty_days);

    if (totalVisitsPrev30Days === 0 || totalVisits30Days === 0) return 0;

    return (
      ((totalVisits30Days - totalVisitsPrev30Days) / totalVisitsPrev30Days) *
      100
    );
  }

  private async getTopCountryOfLastThirtyDays(userId: number) {
    const topCountryResult = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.location', 'location')
      .addSelect('COUNT(*)', 'visits')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('analytics.created_at >= :thirtyDaysAgo', {
        thirtyDaysAgo: new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
        ),
      })
      .groupBy('analytics.location')
      .orderBy('visits', 'DESC')
      .limit(1)
      .getRawOne();

    const topCountry = topCountryResult ? topCountryResult.location : '';
    const difference = await this.getTopCountryDifferencePercentage(
      userId,
      topCountry,
    );

    return {
      title: 'Top country',
      value: topCountry !== '' ? topCountry : 'N/D',
      difference,
    };
  }

  private async getReferrerDifferencePercentage(
    userId: number,
    topReferrer: string,
  ) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const previousThirtyDays = new Date();
    previousThirtyDays.setDate(previousThirtyDays.getDate() - 60);

    const totalVisitsThirtyDaysAgo = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('COUNT(*)', 'total_visits_thirty_days_ago')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('LOWER(analytics.referrer) LIKE :topReferrer', {
        topReferrer: `%${topReferrer.toLowerCase()}%`,
      })
      .getRawOne();

    const totalVisitsPreviousThirtyDays = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('COUNT(*)', 'total_visits_previous_thirty_days')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= :previousThirtyDays', { previousThirtyDays })
      .andWhere('"created_at" < :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('LOWER(analytics.referrer) LIKE :topReferrer', {
        topReferrer: `%${topReferrer.toLowerCase()}%`,
      })
      .getRawOne();

    const { total_visits_thirty_days_ago } = totalVisitsThirtyDaysAgo;
    const { total_visits_previous_thirty_days } = totalVisitsPreviousThirtyDays;

    const totalVisits30Days = Number(total_visits_thirty_days_ago);
    const totalVisitsPrev30Days = Number(total_visits_previous_thirty_days);

    if (totalVisitsPrev30Days === 0 || totalVisits30Days === 0) return 0;

    return (
      ((totalVisits30Days - totalVisitsPrev30Days) / totalVisitsPrev30Days) *
      100
    );
  }

  private async getTopReferrerOfLastThirtyDays(userId: number) {
    const topReferrerResult = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.referrer', 'referrer')
      .addSelect('COUNT(*)', 'visits')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('analytics.created_at >= :thirtyDaysAgo', {
        thirtyDaysAgo: new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
        ),
      })
      .groupBy('analytics.referrer')
      .orderBy('visits', 'DESC')
      .limit(1)
      .getRawOne();

    const topReferrer = topReferrerResult ? topReferrerResult.referrer : '';
    const difference = await this.getReferrerDifferencePercentage(
      userId,
      topReferrer,
    );

    return {
      title: 'Top referrer',
      value: topReferrer !== '' ? topReferrer : 'N/D',
      difference,
    };
  }

  private async getTopDevicesOfLastThirtyDays(userId: number) {
    const result = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.device as name, COUNT(*) as value')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('analytics.created_at >= :thirtyDaysAgo', {
        thirtyDaysAgo: new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
        ),
      })
      .groupBy('analytics.device')
      .orderBy('value', 'DESC')
      .limit(4)
      .getRawMany();

    return result.map(({ name, value }) => ({ name, value: parseInt(value) }));
  }

  private async getTopPlatformsOfLastThirtyDays(userId: number) {
    const result = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.platforms as name, COUNT(*) as value')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('analytics.created_at >= :thirtyDaysAgo', {
        thirtyDaysAgo: new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
        ),
      })
      .groupBy('analytics.platforms')
      .orderBy('value', 'DESC')
      .limit(4)
      .getRawMany();

    return result.map(({ name, value }) => ({ name, value: parseInt(value) }));
  }

  private async getTopReferrersOfLastThirtyDays(userId: number) {
    const result = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.referrer as name, COUNT(*) as value')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('analytics.created_at >= :thirtyDaysAgo', {
        thirtyDaysAgo: new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
        ),
      })
      .groupBy('analytics.referrer')
      .orderBy('value', 'DESC')
      .limit(4)
      .getRawMany();

    return result.map(({ name, value }) => ({ name, value: parseInt(value) }));
  }

  private async getTopCountriesOfLastThirtyDays(userId: number) {
    const result = await this.analyticsRepository
      .createQueryBuilder()
      .select(
        'DISTINCT ON (cv.country) cv.country, cv.short_url, cv.visits, cv.unique_visitors',
      )
      .from((subQuery) => {
        return subQuery
          .select(
            'analytics.location AS country, urls.short_url, COUNT(*) AS visits, COUNT(DISTINCT analytics.ip) AS unique_visitors',
          )
          .from(AnalyticsEntity, 'analytics')
          .innerJoin('analytics.url', 'urls', 'analytics."url_id" = urls.id')
          .where('urls.user_id = :userId', { userId })
          .andWhere(
            "analytics.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'",
          )
          .groupBy('analytics.location, urls.short_url')
          .orderBy('analytics.location, COUNT(*)', 'DESC');
      }, 'cv')
      .orderBy('cv.country, cv.visits', 'DESC')
      .limit(6)
      .getRawMany();

    return result.map((item) => ({
      country: item.country,
      visits: item.visits,
      uniqueVisitors: item.unique_visitors,
      mostVisitedURL: item.short_url,
    }));
  }

  async getPerformanceOfLastThirtyDays(userId: number) {
    const visits = await this.countVisitsLastThirtyDays(userId);
    const uniqueVisitors = await this.countUniqueVisitsLastThirtyDays(userId);
    const topCountry = await this.getTopCountryOfLastThirtyDays(userId);
    const topReferrer = await this.getTopReferrerOfLastThirtyDays(userId);

    const topDevices = await this.getTopDevicesOfLastThirtyDays(userId);
    const topPlatforms = await this.getTopPlatformsOfLastThirtyDays(userId);
    const topReferrers = await this.getTopReferrersOfLastThirtyDays(userId);
    const topCountries = await this.getTopCountriesOfLastThirtyDays(userId);

    return {
      mainStats: {
        visits,
        uniqueVisitors,
        topCountry,
        topReferrer,
      },
      topPlatforms,
      topReferrers,
      topDevices,
      topCountries,
    };
  }

  async getAnalyticsByShortURL(shortURL: string) {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const sixDaysAgo = new Date(currentDate);
    sixDaysAgo.setDate(currentDate.getDate() - 6);

    const [
      mainStatsResult,
      devices,
      platforms,
      referrers,
      browsers,
      visitsByCountry,
      moreActiveDays,
      results,
    ] = await Promise.all([
      this.analyticsRepository
        .createQueryBuilder('analytics')
        .select('COUNT(DISTINCT analytics.id)', 'totalVisits')
        .addSelect('COUNT(DISTINCT analytics.ip)', 'uniqueVisitors')
        .addSelect(
          'COUNT(DISTINCT CASE WHEN subquery.count > 1 THEN analytics.ip END)',
          'returnVisitors',
        )
        .leftJoin('analytics.url', 'url')
        .where('url.short_url = :shortURL', { shortURL })
        .leftJoin(
          (subQuery) => {
            return subQuery
              .select('analytics.ip, COUNT(analytics.ip) as count')
              .from(AnalyticsEntity, 'analytics')
              .leftJoin('analytics.url', 'url')
              .where('url.short_url = :shortURL', { shortURL })
              .groupBy('analytics.ip');
          },
          'subquery',
          'analytics.ip = subquery.ip',
        )
        .getRawOne(),
      this.getTopFive('device', shortURL),
      this.getTopFive('platforms', shortURL),
      this.getTopFive('referrer', shortURL),
      this.getTopFive('browser', shortURL),
      this.getTopFive('location', shortURL),
      this.getMoreActiveDays(shortURL),
      this.analyticsRepository
        .createQueryBuilder('analytics')
        .select(`DATE(analytics.created_at) AS date`)
        .addSelect('COUNT(*) AS visits')
        .innerJoin('analytics.url', 'url')
        .where(
          '"analytics"."created_at" >= CURRENT_TIMESTAMP - INTERVAL \'7 days\'',
        )
        .andWhere('url.short_url = :shortURL', { shortURL })
        .groupBy('DATE(analytics.created_at)')
        .orderBy('DATE(analytics.created_at)', 'ASC')
        .getRawMany(),
    ]);

    const resultMap = new Map<string, number>();

    const startDate = new Date(sixDaysAgo);

    while (startDate <= currentDate) {
      const formattedDate = startDate.toISOString().slice(0, 10);
      resultMap.set(formattedDate, 0);
      startDate.setDate(startDate.getDate() + 1);
    }

    results.forEach((result) => {
      const formattedDate = result.date.toISOString().slice(0, 10);
      resultMap.set(formattedDate, parseInt(result.visits));
    });

    const last_7_days_performance = Array.from(resultMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    return {
      devices,
      platforms,
      referrers,
      browsers,
      visitsByCountry,
      daysWithMoreVisits: moreActiveDays,
      last_7_days_performance,
      visits: mainStatsResult.totalVisits,
      unique_visitors: mainStatsResult.uniqueVisitors,
      return_visitors: mainStatsResult.returnVisitors,
    };
  }

  async getTopFive(field: string, shortURL: string) {
    return this.analyticsRepository
      .createQueryBuilder('analytics')
      .innerJoin('analytics.url', 'url')
      .select(`analytics.${field}`, 'name')
      .addSelect('COUNT(*)', 'value')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy(`analytics.${field}`)
      .orderBy('value', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getMoreActiveDays(shortURL: string) {
    return this.analyticsRepository
      .createQueryBuilder('analytics')
      .innerJoin('analytics.url', 'url')
      .select('analytics.created_at', 'name')
      .addSelect('COUNT(*)', 'value')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy('analytics.created_at')
      .getRawMany();
  }
}
