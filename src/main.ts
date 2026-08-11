import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { env } from './config/env';
import cookieParser from 'cookie-parser';
import { isSwaggerEnabled, setupSwagger } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  if (isSwaggerEnabled()) setupSwagger(app);

  await app.listen(env.PORT);
}
void bootstrap();
