import { AnalyticsService } from '@/analytics/analytics.service';
import { CreateAnalyticsDto } from '@/analytics/dto/create-analytics.dto';
import { CreateURLDto } from '@/urls/dto/create-url.dto';
import { UpdateURLDto } from '@/urls/dto/update-url.dto';
import { URLEntity } from '@/urls/entities/urls.entity';
import { UsersService } from '@/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { customAlphabet } from 'nanoid';
import * as schedule from 'node-schedule';
import { Repository } from 'typeorm';

interface SetAnalyticsModel extends CreateAnalyticsDto {
  short_url: string;
}

type URLEntityKey = keyof URLEntity;

const alphabet =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

@Injectable()
export class URLsService {
  constructor(
    @InjectRepository(URLEntity)
    private readonly urlRepository: Repository<URLEntity>,
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async create(createURLDto: CreateURLDto) {
    const nanoid = customAlphabet(alphabet, 6);

    const forbbidenURLs = [
      'dashboard',
      'terms-and-conditions',
      'privacy-policy',
    ];

    const user = await this.usersService.getOneById(createURLDto.user_id, [
      'id',
      'name',
    ]);

    if (!user) {
      throw new BadRequestException("User doesn't exist");
    }

    if (createURLDto.custom_alias) {
      if (forbbidenURLs.includes(createURLDto.custom_alias)) {
        throw new BadRequestException('Custom alias not allowed');
      }

      const existCustomAlias = await this.urlRepository.findOne({
        where: { custom_alias: createURLDto.custom_alias },
        select: ['custom_alias'],
      });

      if (existCustomAlias) {
        throw new BadRequestException('Custom alias already used');
      }
    }

    let payload: CreateURLDto = createURLDto;
    if (createURLDto.custom_alias) {
      payload = {
        ...createURLDto,
        short_url: createURLDto.custom_alias,
      };
    } else {
      payload = {
        ...createURLDto,
        short_url: nanoid(),
      };
    }

    const newUrl = await this.urlRepository.save({
      ...payload,
      user,
    });

    if (createURLDto.expiration_date) {
      schedule.scheduleJob(createURLDto.expiration_date, async () => {
        await this.urlRepository.update(newUrl.id, {
          active: false,
        });
      });
    }

    return newUrl;
  }

  async getURLByShortURL(short_url: string, select: URLEntityKey[]) {
    return await this.urlRepository.findOne({ where: { short_url }, select });
  }

  getAllById(id: number) {
    return this.urlRepository.find({
      where: { user: { id } },
      order: { request_count: { direction: 'DESC' } },
    });
  }

  async setVisitByShortURL(payload: SetAnalyticsModel) {
    try {
      const url = await this.urlRepository.findOne({
        where: { short_url: payload.short_url },
        cache: true,
      });

      if (!url) {
        throw new BadRequestException("URL doesn't exist");
      }

      if (!url.active) {
        throw new BadRequestException('URL is deactivated');
      }

      await this.urlRepository.update(url.id, {
        request_count: ++url.request_count,
      });
      await this.analyticsService.create(payload, url);

      return url;
    } catch (error) {
      console.error(error);
      throw new BadRequestException();
    }
  }

  async update(id: number, updateURLDto: UpdateURLDto) {
    const { short_url, custom_alias } = updateURLDto;

    const currentUrlData = await this.urlRepository.findOne({
      where: { short_url },
      select: ['custom_alias'],
    });

    if (currentUrlData.custom_alias && !custom_alias) {
      const nanoid = customAlphabet(alphabet, 6);

      updateURLDto = {
        ...updateURLDto,
        short_url: nanoid(),
      };
    }

    if (short_url === custom_alias || !custom_alias) {
      return await this.urlRepository.update(id, updateURLDto);
    }

    const duplicateAlias = await this.urlRepository.find({
      where: { short_url: custom_alias },
    });

    if (duplicateAlias.length) {
      throw new BadRequestException('Custom alias already exist');
    }

    updateURLDto = {
      ...updateURLDto,
      short_url: updateURLDto.custom_alias,
    };

    return await this.urlRepository.update(id, updateURLDto);
  }

  delete(id: number) {
    return this.urlRepository.delete({ id });
  }
}
