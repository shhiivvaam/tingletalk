import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: (configService: ConfigService) => {
                const logger = new Logger('RedisModule');
                const redisUrl = configService.get<string>('REDIS_URL');

                if (!redisUrl) {
                    throw new Error('REDIS_URL environment variable is required');
                }

                const redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    enableReadyCheck: true,
                    lazyConnect: false,
                });

                redis.on('error', (err) => {
                    logger.error('Redis connection error:', err);
                    throw err;
                });

                redis.on('connect', () => {
                    logger.log('✓ Redis connected successfully');
                });

                return redis;
            },
            inject: [ConfigService],
        },
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
