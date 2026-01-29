import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export interface AnonymousSession {
    id: string; // socketId
    tempId: string;
    nickname: string;
    gender: 'male' | 'female' | 'other';
    age?: number;
    country: string;
    state?: string;
    scope?: 'local' | 'global';
    createdAt: number;
}

@Injectable()
export class SessionService {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    private getSessionKey(socketId: string): string {
        return `session:${socketId}`;
    }

    async createSession(socketId: string, data: Omit<AnonymousSession, 'id' | 'createdAt'>): Promise<AnonymousSession> {
        const session: AnonymousSession = {
            ...data,
            id: socketId,
            createdAt: Date.now(),
        };

        // Store in Redis with 24h TTL
        await this.redis.setex(this.getSessionKey(socketId), 86400, JSON.stringify(session));
        return session;
    }

    async getSession(socketId: string): Promise<AnonymousSession | null> {
        const data = await this.redis.get(this.getSessionKey(socketId));
        return data ? JSON.parse(data) : null;
    }

    async getAllSessions(): Promise<AnonymousSession[]> {
        const keys = await this.redis.keys('session:*');
        if (keys.length === 0) return [];

        const sessions = await this.redis.mget(keys);
        return sessions
            .filter((s) => s !== null)
            .map((s) => JSON.parse(s as string));
    }

    async removeSession(socketId: string): Promise<void> {
        await this.redis.del(this.getSessionKey(socketId));
    }
}
