import { Controller, Get, Query } from '@nestjs/common';
import { SessionService } from '../session/session.service';

@Controller('api/username')
export class UsernameController {
    constructor(private readonly sessionService: SessionService) { }

    @Get('check')
    async checkAvailability(@Query('username') username: string) {
        // In a real app, check against both Redis (active sessions) and DB (registered users)
        // For now, we'll just check Redis

        if (!username || username.length < 3) {
            return { available: false, reason: 'Username too short' };
        }

        // Simple check - in production, you'd check Redis for active usernames
        // and PostgreSQL for registered usernames
        const isAvailable = true; // Placeholder

        return { available: isAvailable };
    }
}
