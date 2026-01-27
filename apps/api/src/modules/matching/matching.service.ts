import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

interface MatchRequest {
    socketId: string;
    username: string;
    gender: 'male' | 'female' | 'other';
    country: string;
    state?: string;
    scope: 'local' | 'global';
    preferences: {
        targetGender: 'male' | 'female' | 'all';
    };
}

@Injectable()
export class MatchingService {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

    private getQueueKey(scope: string, country?: string): string {
        if (scope === 'global') {
            return 'queue:global';
        }
        return `queue:local:${country}`;
    }

    async addToQueue(request: MatchRequest): Promise<void> {
        const queueKey = this.getQueueKey(request.scope, request.country);
        const data = JSON.stringify(request);

        // Add to queue with timestamp
        await this.redis.zadd(queueKey, Date.now(), data);

        // Set TTL on queue key (1 hour)
        await this.redis.expire(queueKey, 3600);
    }

    async findMatch(request: MatchRequest): Promise<string | null> {
        const queueKey = this.getQueueKey(request.scope, request.country);

        // Get all waiting users
        const waiting = await this.redis.zrange(queueKey, 0, -1);

        for (const item of waiting) {
            const candidate: MatchRequest = JSON.parse(item);

            // Don't match with self
            if (candidate.socketId === request.socketId) {
                continue;
            }

            // Check gender preferences
            const requestWantsCandidate =
                request.preferences.targetGender === 'all' ||
                request.preferences.targetGender === candidate.gender;

            const candidateWantsRequest =
                candidate.preferences.targetGender === 'all' ||
                candidate.preferences.targetGender === request.gender;

            if (requestWantsCandidate && candidateWantsRequest) {
                // Match found! Remove from queue
                await this.redis.zrem(queueKey, item);
                return candidate.socketId;
            }
        }

        return null;
    }

    async removeFromQueue(socketId: string, scope: string, country?: string): Promise<void> {
        const queueKey = this.getQueueKey(scope, country);

        // Find and remove the user from queue
        const waiting = await this.redis.zrange(queueKey, 0, -1);
        for (const item of waiting) {
            const candidate: MatchRequest = JSON.parse(item);
            if (candidate.socketId === socketId) {
                await this.redis.zrem(queueKey, item);
                break;
            }
        }
    }
}
