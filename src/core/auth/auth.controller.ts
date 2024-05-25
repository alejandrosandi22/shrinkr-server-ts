import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './guards/auth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';

interface RequestWithUser extends Request {
  user: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('authorization')
  @UseGuards(AuthGuard)
  async findAll(@Req() request: RequestWithUser) {
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

  @Post('reset')
  resetPassword(@Body() body: { email: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }

  @Post('recovery')
  sendRecoveryPassword(@Body() body: { email: string }) {
    return this.authService.sendRecoveryPassword(body.email);
  }

  @Post('verify-account/:id')
  verifyAccount(@Param('id') id: string) {
    return this.authService.verifyAccount(+id);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async GoogleOauth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @Redirect()
  async googleAuthCallback(@Req() req: RequestWithUser) {
    const { access_token } = await this.authService.oAuthLogin(req.user);
    return {
      url: `${process.env.CLIENT_APP_URL}/dashboard?access_token=${access_token}`,
      status: 301,
    };
  }
}
