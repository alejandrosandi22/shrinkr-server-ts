import { AuthService } from '@/auth/auth.service';
import { LoginDto } from '@/auth/dto/login.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { FacebookGuard } from '@/auth/guards/facebook.guard';
import { GoogleOauthGuard } from '@/auth/guards/google-oauth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('authorization')
  @UseGuards(AuthGuard)
  async findAll(@Req() request: Request) {
    const access_token = request.headers['authorization'].split(' ')[1];
    return await this.authService.isAuthenticated(access_token);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async GoogleOauth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @Redirect()
  async googleAuthCallback(@Req() req: Request) {
    const { access_token } = await this.authService.oAuthLogin(req.user);
    return {
      url: `${process.env.CLIENT_APP_URL}/dashboard?access_token=${access_token}`,
      status: 301,
    };
  }

  @Get('facebook')
  @UseGuards(FacebookGuard)
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  @Redirect(`${process.env.CLIENT_APP_URL}`, 301)
  async facebookAuthCallback(@Req() req: Request) {
    const { access_token } = await this.authService.oAuthLogin(req.user);
    return {
      url: `${process.env.CLIENT_APP_URL}?access_token=${access_token}`,
      status: 301,
    };
  }
}
