import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

function parseOrigins(raw: string | undefined): string[] | string {
  if (!raw) return 'http://localhost:3000';
  const list = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return list.length === 1 ? list[0] : list;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    // Comma-separated allow-list; never use "*" together with credentials.
    origin: parseOrigins(process.env.CORS_ORIGIN),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
