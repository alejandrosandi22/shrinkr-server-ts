import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as countryList from 'country-list';
import * as geoip from 'geoip-lite';
import { customAlphabet } from 'nanoid';
import * as schedule from 'node-schedule';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../analytics/analytics.service';
import { UsersService } from '../users/users.service';
import { CreateURLDto } from './dto/create-url.dto';
import { UpdateURLDto } from './dto/update-url.dto';
import { URLEntity } from './entities/urls.entity';

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

  async shorten(createURLDto: CreateURLDto) {
    const nanoid = customAlphabet(alphabet, 6);

    if (!createURLDto.expiration_date)
      throw new BadRequestException('Expiration date should be provided');

    const payload = {
      ...createURLDto,
      short_url: nanoid(),
    };

    const newUrl = await this.urlRepository.save({
      ...payload,
    });

    schedule.scheduleJob(createURLDto.expiration_date, async () => {
      await this.urlRepository.delete(newUrl.id);
    });

    return newUrl;
  }

  /**
   * Retrieves a URL entity from the database by its short URL.
   * @param short_url The short URL of the entity to retrieve.
   * @param select An array specifying which fields of the URL entity to select.
   * @returns A Promise that resolves to the URL entity matching the provided short URL,
   * with fields specified by the 'select' parameter.
   */
  async getURLByShortURL(short_url: string, select: URLEntityKey[]) {
    return await this.urlRepository.findOne({
      where: { short_url },
      select,
    });
  }

  getAllById(id: number) {
    return this.urlRepository.find({
      where: { user: { id } },
      order: { request_count: { direction: 'DESC' } },
    });
  }
  async setVisitByShortURL(payload: any) {
    try {
      const geo = geoip.lookup(payload.ip);
      const location = countryList.getName(geo.country);

      const url = await this.urlRepository.findOne({
        where: { short_url: payload.shortURL },
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
      await this.analyticsService.create({ ...payload, location }, url);

      return url;
    } catch (error) {
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
