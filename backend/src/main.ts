import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(
    helmet({
      // Swagger UI carrega assets inline — evita bloquear /api/docs em dev
      contentSecurityPolicy:
        config.get('NODE_ENV') === 'production' ? undefined : false,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') || 'http://localhost:5173',
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

  const swagger = new DocumentBuilder()
    .setTitle('Distac API — Vendas Internas')
    .setDescription(
      'API base Prottus (NestJS). Auth via cookies httpOnly (`access_token` / `refresh_token`). ' +
        'Use o botão Authorize apenas se testar Bearer; neste projeto o fluxo padrão é cookie.',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addTag('auth', 'Login / refresh / logout / me')
    .addTag('clientes')
    .addTag('produtos')
    .addTag('pedidos')
    .addTag('dashboard')
    .addTag('health')
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(config.get('PORT') || 3000);
  await app.listen(port);
  console.log(`Distac API em http://localhost:${port}/api`);
  console.log(`Swagger     em http://localhost:${port}/api/docs`);
}
bootstrap();
