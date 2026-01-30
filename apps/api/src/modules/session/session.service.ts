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
    isOccupied: boolean;
    isInQueue?: boolean; // Optimization to avoid zrange on disconnect
}

@Injectable()
export class SessionService {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    private readonly ONLINE_USERS_SET = 'online_users';

    private getSessionKey(socketId: string): string {
        return `session:${socketId}`;
    }

    async createSession(socketId: string, data: Omit<AnonymousSession, 'id' | 'createdAt' | 'isOccupied' | 'isInQueue'>): Promise<AnonymousSession> {
        const session: AnonymousSession = {
            ...data,
            id: socketId,
            createdAt: Date.now(),
            isOccupied: false,
            isInQueue: false,
        };

        const sessionKey = this.getSessionKey(socketId);

        // Use pipeline to execute commands atomically
        const pipeline = this.redis.pipeline();
        pipeline.setex(sessionKey, 86400, JSON.stringify(session)); // 24h TVL
        pipeline.sadd(this.ONLINE_USERS_SET, socketId);
        await pipeline.exec();

        return session;
    }

    async updateSession(socketId: string, updates: Partial<AnonymousSession>): Promise<void> {
        const key = this.getSessionKey(socketId);
        const current = await this.redis.get(key);
        if (current) {
            const sessions = JSON.parse(current);
            const updated = { ...sessions, ...updates };
            // Update with same TTL
            await this.redis.setex(key, 86400, JSON.stringify(updated));
        }
    }

    async getSession(socketId: string): Promise<AnonymousSession | null> {
        const data = await this.redis.get(this.getSessionKey(socketId));
        return data ? JSON.parse(data) : null;
    }

    private cachedSessions: AnonymousSession[] | null = null;
    private lastCacheTime = 0;
    private readonly CACHE_TTL = 3000; // 3 seconds cache is enough to kill the spike but keep it snappy

    async getAllSessions(): Promise<AnonymousSession[]> {
        // Return cached data if valid to save Redis Reads (Crucial for free tier limits)
        if (this.cachedSessions && (Date.now() - this.lastCacheTime < this.CACHE_TTL)) {
            return this.cachedSessions;
        }

        // Get all socketIds from the Set (O(1) relative to total keyspace, O(N) relative to online users)
        const socketIds = await this.redis.smembers(this.ONLINE_USERS_SET);

        if (socketIds.length === 0) {
            this.cachedSessions = [];
            this.lastCacheTime = Date.now();
            return [];
        }

        // Construct keys for MGET
        const sessionKeys = socketIds.map(id => this.getSessionKey(id));

        // Fetch all sessions in one go
        const sessionsData = await this.redis.mget(sessionKeys);

        const activeSessions: AnonymousSession[] = [];
        const staleIds: string[] = [];

        sessionsData.forEach((data, index) => {
            if (data) {
                try {
                    activeSessions.push(JSON.parse(data));
                } catch (e) {
                    // Corruption check
                    staleIds.push(socketIds[index]);
                }
            } else {
                // Session expired or key missing, but ID still in set -> Stale
                staleIds.push(socketIds[index]);
            }
        });

        // Self-heal: Remove stale IDs from the set asynchronously
        if (staleIds.length > 0) {
            this.redis.srem(this.ONLINE_USERS_SET, ...staleIds).catch(err => {
                console.error('Failed to clean up stale sessions', err);
            });
        }

        // Update Cache
        this.cachedSessions = activeSessions;
        this.lastCacheTime = Date.now();

        return activeSessions;
    }

    async removeSession(socketId: string): Promise<void> {
        const pipeline = this.redis.pipeline();
        pipeline.del(this.getSessionKey(socketId));
        pipeline.srem(this.ONLINE_USERS_SET, socketId);
        await pipeline.exec();
    }

    async updateSessionStatus(socketId: string, isOccupied: boolean): Promise<void> {
        const session = await this.getSession(socketId);
        if (session) {
            session.isOccupied = isOccupied;
            await this.redis.setex(this.getSessionKey(socketId), 86400, JSON.stringify(session));
        }
    }
}
