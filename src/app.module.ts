import { AnalyticsModule } from '@/analytics/analytics.module';
import { AnalyticsEntity } from '@/analytics/entities/analytics.entity';
import { URLEntity } from '@/urls/entities/urls.entity';
import { URLsModule } from '@/urls/urls.module';
import { UserEntity } from '@/users/entities/user.entity';
import { UsersModule } from '@/users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USER,
      entities: [UserEntity, URLEntity, AnalyticsEntity],
      database: process.env.DB_NAME,
      synchronize: true,
      logging: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `Shrinkr <${process.env.MAIL_FROM}>`,
      },
    }),
    UsersModule,
    URLsModule,
    AnalyticsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
