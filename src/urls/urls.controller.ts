import { AuthGuard } from '@/auth/guards/auth.guard';
import { CreateURLDto } from '@/urls/dto/create-url.dto';
import { UpdateURLDto } from '@/urls/dto/update-url.dto';
import { URLsService } from '@/urls/urls.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as countryList from 'country-list';
import { Request } from 'express';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';

@Controller('urls')
export class URLsController {
  constructor(private readonly urlsService: URLsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async create(@Body() createURLDto: CreateURLDto) {
    return await this.urlsService.create(createURLDto);
  }

  @Get(':url')
  @UseGuards(AuthGuard)
  getURLByShortURL(@Param('url') url: string) {
    return this.urlsService.getURLByShortURL(url, [
      'original_url',
      'short_url',
      'expiration_date',
      'request_count',
      'active',
      'created_at',
    ]);
  }

  @Get('get-all/:id')
  @UseGuards(AuthGuard)
  getAllById(@Param('id') id: string) {
    return this.urlsService.getAllById(+id);
  }

  @Get('short-url/:url')
  async setVisitByShortURL(@Param('url') url: string, @Req() req: Request) {
    function getReferrerName(url: string) {
      const result = new URL(url);
      return result.host.split('.')[1];
    }

    const userAgent = req.get('User-Agent');
    const ip = req.headers['x-forwarded-for'] ?? '212.47.230.124'; // Fixed ip for development
    const parsedUserAgent = uaParser(userAgent);

    const countryCode = geoip.lookup(ip as string).country;

    const browser = parsedUserAgent.browser.name ?? 'other';
    const platforms = parsedUserAgent.os.name ?? 'other'; // operative system
    const device = req.device.type; // phone, tablet, pc
    const referrer = req.headers?.referer
      ? getReferrerName(req.headers?.referer)
      : 'direct search';
    const location = countryList.getName(countryCode);

    const payload = {
      device,
      browser,
      referrer,
      platforms,
      location,
      ip,
      short_url: url,
    };

    const response = await this.urlsService.setVisitByShortURL(payload);
    return response;
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateURLDto: UpdateURLDto) {
    return this.urlsService.update(+id, updateURLDto);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  delete(@Param('id') id: string) {
    return this.urlsService.delete(+id);
  }
}
