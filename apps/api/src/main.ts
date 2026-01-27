import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Apply Helmet for security headers
    app.use(helmet());

    // Apply Global Exception Filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Validate required environment variables
    const requiredEnvVars = ['REDIS_URL', 'DATABASE_URL', 'CORS_ORIGINS', 'PORT'];
    for (const envVar of requiredEnvVars) {
      if (!configService.get(envVar)) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Setup Redis WebSocket adapter
    const redisIoAdapter = new RedisIoAdapter(app, configService);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    // Enable validation globally
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Configure CORS - NO FALLBACK
    const corsOrigins = configService.get<string>('CORS_ORIGINS');
    if (!corsOrigins) {
      throw new Error('CORS_ORIGINS environment variable is required');
    }

    const allowedOrigins = corsOrigins.split(',').map(origin => origin.trim());
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    const port = configService.get<number>('PORT');
    if (!port) {
      throw new Error('PORT environment variable is required');
    }

    await app.listen(port);
    console.log(`✓ Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

bootstrap();
