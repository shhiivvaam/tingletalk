import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;
    private readonly logger = new Logger(RedisIoAdapter.name);

    constructor(
        private app: INestApplicationContext,
        private configService: ConfigService,
    ) {
        super(app);
    }

    async connectToRedis(): Promise<void> {
        let redisUrl = this.configService.get<string>('REDIS_URL');

        if (redisUrl) {
            redisUrl = redisUrl.replace(/^['"](.*)['"]$/, '$1');
        }

        if (!redisUrl) {
            throw new Error('REDIS_URL environment variable is required for WebSocket adapter');
        }

        try {
            // Use ioredis for consistency with the rest of the app
            const pubClient = new Redis(redisUrl, { db: 0 });
            const subClient = new Redis(redisUrl, { db: 0 });

            await Promise.all([
                new Promise((resolve, reject) => {
                    pubClient.on('ready', resolve);
                    pubClient.on('error', reject);
                }),
                new Promise((resolve, reject) => {
                    subClient.on('ready', resolve);
                    subClient.on('error', reject);
                })
            ]);

            // Create adapter using ioredis clients
            this.adapterConstructor = createAdapter(pubClient as any, subClient as any);

            this.logger.log('✓ Redis WebSocket adapter connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect Redis WebSocket adapter:', error);
            throw new Error(`Redis WebSocket adapter connection failed: ${error.message}`);
        }
    }

    createIOServer(port: number, options?: ServerOptions): any {
        if (!this.adapterConstructor) {
            throw new Error('Redis adapter not initialized. Call connectToRedis() first.');
        }

        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}
