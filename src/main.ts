import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as device from 'express-device';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api/v1');
  app.use(device.capture());
  app.enableCors({
    origin: process.env.CLIENT_APP_URL,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(5000);
}
bootstrap();
