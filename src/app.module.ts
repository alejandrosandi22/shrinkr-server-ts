import { AnalyticsModule } from '@/analytics/analytics.module';
import { AnalyticsEntity } from '@/analytics/entities/analytics.entity';
import { URLEntity } from '@/urls/entities/urls.entity';
import { URLsModule } from '@/urls/urls.module';
import { UserEntity } from '@/users/entities/user.entity';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    UsersModule,
    URLsModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
