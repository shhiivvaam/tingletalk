import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;

    constructor(
        private app: INestApplicationContext,
        private configService: ConfigService,
    ) {
        super(app);
    }

    async connectToRedis(): Promise<void> {
        const redisUrl = this.configService.get<string>('REDIS_URL');

        if (!redisUrl) {
            throw new Error('REDIS_URL environment variable is required for WebSocket adapter');
        }

        try {
            // Use ioredis for consistency with the rest of the app
            const pubClient = new Redis(redisUrl);
            const subClient = new Redis(redisUrl);

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

            console.log('✓ Redis WebSocket adapter connected successfully');
        } catch (error) {
            console.error('Failed to connect Redis WebSocket adapter:', error);
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
