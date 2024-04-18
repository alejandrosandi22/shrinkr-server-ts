import { URLEntity } from '@/urls/entities/urls.entity';
import { UserEntity } from '@/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { URLsModule } from './urls/urls.module';
import { UsersModule } from './users/users.module';

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
      entities: [UserEntity, URLEntity],
      database: process.env.DB_NAME,
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    URLsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
