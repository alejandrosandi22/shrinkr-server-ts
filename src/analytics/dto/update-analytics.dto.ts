import { CreateAnalyticsDto } from '@/analytics/dto/create-analytics.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAnalyticsDto extends PartialType(CreateAnalyticsDto) {}
