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

    // Dashboard Summary
    try {
      // Use require to handle potential ESM/CJS mismatches gracefully or plain JS libs
      const Table = require('cli-table3');
      // Chalk v4 is CJS, v5 is ESM. If installed v5, require might fail in CJS. 
      // We assume chalk is available, if not fallback to plain text.
      const chalk = require('chalk');
      const { default: boxen } = await import('boxen');

      console.clear();

      const table = new Table({
        head: [
          chalk.cyan.bold('Service'),
          chalk.cyan.bold('Status'),
          chalk.cyan.bold('Details')
        ],
        colWidths: [20, 15, 35],
        style: { head: [], border: [] }
      });

      const redisHost = configService.get('REDIS_HOST') || 'localhost';
      const redisPort = configService.get('REDIS_PORT') || '6379';

      table.push(
        ['API Server', chalk.green.bold('RUNNING'), `http://localhost:${port}`],
        ['Database', chalk.green.bold('CONNECTED'), 'PostgreSQL'],
        ['Redis', chalk.green.bold('CONNECTED'), `${redisHost}:${redisPort}`],
        ['Environment', chalk.yellow.bold(process.env.NODE_ENV || 'dev'), '-']
      );

      console.log(boxen(table.toString(), {
        title: chalk.bold.magenta(' Tingle Talk Backend '),
        titleAlignment: 'center',
        padding: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
        margin: 1
      }));
    } catch (e) {
      // Fallback if UI libs fail
      console.log(`✓ Application is running on: http://localhost:${port}`);
      console.error('Failed to render dashboard:', e.message);
    }
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

bootstrap();
