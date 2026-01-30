import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

interface MatchRequest {
    socketId: string;
    username: string;
    gender: 'male' | 'female' | 'other';
    age?: number;
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

        // Get all waiting users (LIMIT to top 100 to prevent O(N) explosion)
        const waiting = await this.redis.zrange(queueKey, 0, 99);

        // Scoring Variables
        let bestMatchId: string | null = null;
        let bestMatchScore = -1;
        let bestMatchItemString: string | null = null;

        for (const item of waiting) {
            const candidate: MatchRequest = JSON.parse(item);

            // Don't match with self
            if (candidate.socketId === request.socketId) {
                continue;
            }

            // Check gender preferences (HARD FILTER)
            const requestWantsCandidate =
                request.preferences.targetGender === 'all' ||
                request.preferences.targetGender === candidate.gender;

            const candidateWantsRequest =
                candidate.preferences.targetGender === 'all' ||
                candidate.preferences.targetGender === request.gender;

            if (requestWantsCandidate && candidateWantsRequest) {
                // Calculate Similarity Score
                let score = 0;

                // 1. Location Score
                if (request.state && candidate.state && request.state === candidate.state) {
                    score += 20; // Same State
                } else if (request.country === candidate.country) {
                    score += 10; // Same Country (Likely true for local queue, but good for global)
                }

                // 2. Age Score
                if (request.age && candidate.age) {
                    const ageDiff = Math.abs(request.age - candidate.age);
                    if (ageDiff <= 2) score += 15;      // Very close age
                    else if (ageDiff <= 5) score += 10; // Close age
                    else if (ageDiff <= 10) score += 5; // Reasonably close
                }

                // 3. FIFO Bonus (Slight preference for those waiting longer? 
                // Actually simpler to just take highest score, break ties with first found)

                // Update Best Match
                if (score > bestMatchScore) {
                    bestMatchScore = score;
                    bestMatchId = candidate.socketId;
                    bestMatchItemString = item;
                }
            }
        }

        if (bestMatchId && bestMatchItemString) {
            // Remove the matched user from the queue (so they don't get matched again)
            await this.redis.zrem(queueKey, bestMatchItemString);
            return bestMatchId;
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
    async findRandomOnlineUser(request: MatchRequest, onlineUsers: any[]): Promise<string | null> {
        // Filter candidates:
        // 1. Not self
        // 2. Not occupied
        // 3. Gender preference matches (Two-way check)

        const candidates = onlineUsers.filter(user => {
            if (user.id === request.socketId) return false;
            if (user.isOccupied) return false;

            // My Preference Check
            const iWantUser = request.preferences.targetGender === 'all' ||
                request.preferences.targetGender === user.gender;

            // Their Preference Check (If user has generic preferences? For now assume they are open if just "Online")
            // Ideally we'd know their preferences, but for "Online List" matches we assume standard compatibility
            // or just use their gender to see if they match ME.
            // Let's strictly check: If I am Male, and I want Female, candidates must be Female.

            return iWantUser;
        });

        if (candidates.length === 0) {
            return null;
        }

        // Random Selection
        const randomIndex = Math.floor(Math.random() * candidates.length);
        return candidates[randomIndex].id;
    }
}
