import { CreateAnalyticsDto } from '@/analytics/dto/create-analytics.dto';
import { AnalyticsEntity } from '@/analytics/entities/analytics.entity';
import { URLEntity } from '@/urls/entities/urls.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEntity)
    private readonly analyticsRepository: Repository<AnalyticsEntity>,
  ) {}

  create(createAnalyticsDto: CreateAnalyticsDto, url: URLEntity) {
    return this.analyticsRepository.save({
      ...createAnalyticsDto,
      url,
    });
  }

  async countUniqueVisitsLastThirtyDays(id: number) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const uniqueVisitsLastThirtyDays = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('COUNT(DISTINCT analytics.ip)', 'unique_visits_last_thirty_days')
      .where(
        `analytics.url_id IN (SELECT id FROM urls WHERE "user_id" = ${id})`,
      )
      .andWhere(`analytics.created_at >= :thirtyDaysAgo`, {
        thirtyDaysAgo,
      })
      .getRawOne();

    const uniqueVisitsLastSixtyDays = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('COUNT(DISTINCT analytics.ip)', 'unique_visits_last_sixty_days')
      .where(
        `analytics."url_id" IN (SELECT id FROM urls WHERE "user_id" = ${id})`,
      )
      .andWhere(
        'analytics."created_at" >= CURRENT_TIMESTAMP - INTERVAL \'60 days\'',
      )
      .andWhere(
        'analytics."created_at" < CURRENT_TIMESTAMP - INTERVAL \'30 days\'',
      )
      .getRawOne();

    const { unique_visits_last_thirty_days } = uniqueVisitsLastThirtyDays;
    const { unique_visits_last_sixty_days } = uniqueVisitsLastSixtyDays;

    let growthPercentage: number =
      ((unique_visits_last_thirty_days - unique_visits_last_sixty_days) /
        unique_visits_last_sixty_days) *
      100;

    if (
      Number(unique_visits_last_thirty_days) === 0 ||
      Number(unique_visits_last_sixty_days) === 0
    )
      growthPercentage = 0;

    return {
      title: 'Unique visits',
      value: unique_visits_last_thirty_days,
      difference: growthPercentage,
    };
  }

  async countVisitsLastThirtyDays(id: number) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const countThirtyDaysAgo = await this.analyticsRepository.count({
      where: {
        url: { user: { id } },
        created_at: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    const countSixtyDaysAgo: number = await this.analyticsRepository.count({
      where: {
        url: { user: { id } },
        created_at: Between(sixtyDaysAgo, thirtyDaysAgo),
      },
    });

    let growthPercentage: number =
      ((countThirtyDaysAgo - countSixtyDaysAgo) / countSixtyDaysAgo) * 100;

    if (countThirtyDaysAgo === 0 || countSixtyDaysAgo === 0)
      growthPercentage = 0;

    return {
      title: 'Visits',
      value: countThirtyDaysAgo,
      difference: growthPercentage,
    };
  }

  private async getTopCountryDifferencePercentage(
    userId: number,
    topCountry: string,
  ) {
    const thirtyDaysAgo = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select(
        'SUM(CASE WHEN (analytics.location) LIKE :location THEN 1 ELSE 0 END)',
        'total_visits_thirty_days_ago',
      )
      .andWhere('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .setParameter('location', topCountry)
      .getRawOne();

    const previousThirtyDays = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select(
        'SUM(CASE WHEN (analytics.location) LIKE :location THEN 1 ELSE 0 END)',
        'total_visits_previous_thirty_days',
      )
      .andWhere('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'60 days\'')
      .andWhere('"created_at" < CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .setParameter('location', topCountry)
      .getRawOne();

    const { total_visits_thirty_days_ago } = thirtyDaysAgo;
    const { total_visits_previous_thirty_days } = previousThirtyDays;

    const totalVisitsThirtyDaysAgo = Number(total_visits_thirty_days_ago);
    const totalVisitsPreviousThirtyDays = Number(
      total_visits_previous_thirty_days,
    );

    if (totalVisitsPreviousThirtyDays === 0 || totalVisitsThirtyDaysAgo === 0)
      return 0;

    const differencePercentage =
      ((totalVisitsThirtyDaysAgo - totalVisitsPreviousThirtyDays) /
        totalVisitsPreviousThirtyDays) *
      100;

    return differencePercentage;
  }

  async getTopCountryOfLastThirtyDays(userId: number) {
    const countThirtyDaysAgo = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.location', 'location')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .groupBy('analytics.location')
      .orderBy('COUNT(*)', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      title: 'Top country',
      value: countThirtyDaysAgo.location,
      difference: await this.getTopCountryDifferencePercentage(
        userId,
        countThirtyDaysAgo.location,
      ),
    };
  }

  private async getReferrerDifferencePercentage(
    userId: number,
    topReferrer: string,
  ) {
    const thirtyDaysAgo = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select(
        'SUM(CASE WHEN LOWER(analytics.referrer) LIKE :referrer THEN 1 ELSE 0 END)',
        'total_visits_thirty_days_ago',
      )
      .andWhere('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" > CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .setParameter('referrer', topReferrer)
      .getRawOne();

    const previousThirtyDays = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select(
        'SUM(CASE WHEN LOWER(analytics.referrer) LIKE :referrer THEN 1 ELSE 0 END)',
        'total_visits_previous_thirty_days',
      )
      .andWhere('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'60 days\'')
      .andWhere('"created_at" < CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .setParameter('referrer', topReferrer)
      .getRawOne();

    const { total_visits_thirty_days_ago } = thirtyDaysAgo;
    const { total_visits_previous_thirty_days } = previousThirtyDays;

    const totalVisitsThirtyDaysAgo = Number(total_visits_thirty_days_ago);
    const totalVisitsPreviousThirtyDays = Number(
      total_visits_previous_thirty_days,
    );

    if (totalVisitsPreviousThirtyDays === 0 || totalVisitsThirtyDaysAgo === 0)
      return 0;

    const differencePercentage =
      ((totalVisitsThirtyDaysAgo - totalVisitsPreviousThirtyDays) /
        totalVisitsPreviousThirtyDays) *
      100;

    return differencePercentage;
  }

  async getTopReferrerOfLastThirtyDays(userId: number) {
    const countThirtyDaysAgo = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.referrer', 'referrer')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .groupBy('analytics.referrer')
      .orderBy('COUNT(*)', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      title: 'Top referrer',
      value: countThirtyDaysAgo.referrer,
      difference: await this.getReferrerDifferencePercentage(
        userId,
        countThirtyDaysAgo.referrer,
      ),
    };
  }

  async getTopDevicesOfLastThirtyDays(userId: number) {
    const result = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.device as name, COUNT(*) as value')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .groupBy('analytics.device')
      .orderBy('COUNT(*)', 'DESC')
      .limit(4)
      .getRawMany();

    return result.map(({ name, value }) => ({ name, value: parseInt(value) }));
  }

  async getTopCountriesOfLastThirtyDays(userId: number) {
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
      .getRawMany();

    return result;
  }

  async getTopPlatformsOfLastThirtyDays(userId: number) {
    const result = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.platforms as name, COUNT(*) as value')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .groupBy('analytics.platforms')
      .orderBy('COUNT(*)', 'DESC')
      .limit(4)
      .getRawMany();

    return result.map(({ name, value }) => ({ name, value: parseInt(value) }));
  }

  async getTopReferrersOfLastThirtyDays(userId: number) {
    const result = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.referrer as name, COUNT(*) as value')
      .where('"url_id" IN (SELECT id FROM urls WHERE "user_id" = :userId)', {
        userId,
      })
      .andWhere('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'30 days\'')
      .groupBy('analytics.referrer')
      .orderBy('COUNT(*)', 'DESC')
      .limit(4)
      .getRawMany();

    return result.map(({ name, value }) => ({ name, value: parseInt(value) }));
  }

  async getAnalyticsByShortURL(shortURL: string) {
    const mainStatsResult = await this.analyticsRepository
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
      .getRawOne();

    const devices = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .innerJoin('analytics.url', 'url')
      .select('analytics.device', 'name')
      .addSelect('COUNT(*)', 'value')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy('analytics.device')
      .orderBy('value', 'DESC')
      .getRawMany();

    const platforms = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .innerJoin('analytics.url', 'url')
      .select('analytics.platforms', 'name')
      .addSelect('COUNT(*)', 'value')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy('analytics.platforms')
      .orderBy('value', 'DESC')
      .getRawMany();

    const referrers = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .innerJoin('analytics.url', 'url')
      .select('analytics.referrer', 'name')
      .addSelect('COUNT(*)', 'value')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy('analytics.referrer')
      .orderBy('value', 'DESC')
      .getRawMany();

    const browsers = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .innerJoin('analytics.url', 'url')
      .select('analytics.browser', 'name')
      .addSelect('COUNT(*)', 'value')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy('analytics.browser')
      .orderBy('value', 'DESC')
      .getRawMany();

    const visits_by_country = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .innerJoin('analytics.url', 'url')
      .select('analytics.location', 'name')
      .addSelect('COUNT(*)', 'value')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy('analytics.location')
      .orderBy('value', 'DESC')
      .getRawMany();

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const sixDaysAgo = new Date(currentDate);
    sixDaysAgo.setDate(currentDate.getDate() - 6);

    const more_active_days = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .innerJoin('analytics.url', 'url')
      .select('analytics.created_at', 'name')
      .addSelect('COUNT(*)', 'value')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy('analytics.created_at')
      .getRawMany();

    const results = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select(`DATE(analytics.created_at) AS date`)
      .addSelect('COUNT(*) AS visits')
      .where('"created_at" >= CURRENT_TIMESTAMP - INTERVAL \'7 days\'')
      .where('url.short_url = :shortURL', { shortURL })
      .groupBy('DATE(analytics.created_at)')
      .orderBy('DATE(analytics.created_at)', 'ASC')
      .getRawMany();

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
      visits_by_country,
      more_active_days,
      last_7_days_performance,
      visits: mainStatsResult.totalVisits,
      unique_visitors: mainStatsResult.uniqueVisitors,
      return_visitors: mainStatsResult.returnVisitors,
    };
  }
}
