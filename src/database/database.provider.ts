import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

export const DatabaseProvider: DynamicModule = TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USER,
    database: process.env.DB_NAME,
    autoLoadEntities: true,
    synchronize: process.env.DB_SYNC,
    logging: process.env.DB_LOGGING,
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    cache: {
      alwaysEnabled: true,
      duration: 6000,
    },
  }),
});
