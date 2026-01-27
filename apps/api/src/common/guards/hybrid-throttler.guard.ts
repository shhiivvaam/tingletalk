import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ThrottlerRequest } from '@nestjs/throttler/dist/throttler.guard.interface';

@Injectable()
export class HybridThrottlerGuard extends ThrottlerGuard {
    protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
        const { context, limit, ttl, throttler, blockDuration, generateKey } = requestProps;

        // 1. WebSocket Handling
        if (context.getType() === 'ws') {
            const client = context.switchToWs().getClient();
            // socket.io connection address fallback
            const ip: string = client.conn?.remoteAddress || client.handshake?.address || 'unknown';

            // Use the passed generator or fallback
            const key = generateKey(context, ip, throttler.name || 'default');

            // v6 storage increment usually takes (key, ttl, limit, blockDuration, throttlerName)
            const { totalHits } = await this.storageService.increment(
                key, ttl, limit, blockDuration, throttler.name || 'default'
            );

            if (totalHits > limit) {
                throw new ThrottlerException();
            }
            return true;
        }

        // 2. HTTP Handling (default behavior with headers)
        return super.handleRequest(requestProps);
    }
}
