import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

function requireJwtSecrets() {
  const access = process.env.JWT_ACCESS_SECRET;
  const refresh = process.env.JWT_REFRESH_SECRET;
  if (!access || !refresh) {
    throw new Error(
      'JWT_ACCESS_SECRET e JWT_REFRESH_SECRET são obrigatórios no .env',
    );
  }
  if (
    access.includes('change-in-prod') ||
    refresh.includes('change-in-prod')
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Substitua os secrets JWT antes de produção');
    }
    console.warn(
      '[segurança] JWT secrets ainda são de desenvolvimento — troque em produção',
    );
  }
}

async function bootstrap() {
  requireJwtSecrets();
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`Distac API em http://localhost:${port}/api`);
}
bootstrap();
