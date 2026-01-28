import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';

import { IsString, IsNotEmpty, MaxLength, IsIn, IsBoolean, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SessionService } from '../modules/session/session.service';
import { MatchingService } from '../modules/matching/matching.service';
import * as geoip from 'geoip-lite';

// --- DTOs ---
class PreferencesDto {
    @IsString()
    @IsIn(['male', 'female', 'all'])
    targetGender: 'male' | 'female' | 'all';
}

class FindMatchDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    username: string;

    @IsString()
    @IsIn(['male', 'female', 'other'])
    gender: 'male' | 'female' | 'other';

    @IsString()
    country: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsIn(['local', 'global'])
    scope: 'local' | 'global';

    @IsString()
    @IsIn(['male', 'female', 'all'])
    targetGender: 'male' | 'female' | 'all';
}

class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500) // Rate limit / Abuse prevention
    message: string;
}

class TypingDto {
    @IsString()
    roomId: string;

    @IsBoolean()
    isTyping: boolean;
}

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
})
@UsePipes(new ValidationPipe({ whitelist: true, transform: true })) // Strict Validation
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly sessionService: SessionService,
        private readonly matchingService: MatchingService,
    ) { }

    async handleConnection(client: Socket) {
        // Enforce max connections per IP if needed, but Throttler handles rates
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Get user session to clean up queue
        const session = await this.sessionService.getSession(client.id);
        if (session) {
            // Remove from matching queue if they were waiting
            await this.matchingService.removeFromQueue(
                client.id,
                session.scope || 'global',
                session.country
            );

            // Broadcast user left
            this.server.emit('userLeft', { userId: client.id });
        }

        await this.sessionService.removeSession(client.id);
    }

    @SubscribeMessage('getOnlineUsers')
    async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
        const sessions = await this.sessionService.getAllSessions();

        // Filter out self and sanitize, ONLY return sessions that are actually connected
        // This prevents "ghost" users and one seeing themselves
        return sessions
            .filter(s => s.id !== client.id && this.server.sockets.sockets.has(s.id))
            .map(s => ({
                id: s.id,
                nickname: s.nickname || 'Anonymous',
                gender: s.gender,
                country: s.country || 'Unknown',
                isOccupied: false // Placeholder for now
            }));
    }


    private getClientIp(client: Socket): string {
        // Handle Nginx/Proxy headers
        const forwarded = client.handshake.headers['x-forwarded-for'];
        if (forwarded) {
            return (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim();
        }
        return client.handshake.address;
    }

    @SubscribeMessage('findMatch')
    async handleFindMatch(
        @MessageBody() data: FindMatchDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            this.logger.log(`User joining lobby: ${data.username} (${client.id})`);

            // 1. Detect Location
            let ip = this.getClientIp(client);

            // LOCALHOST DEV FIX: Use random public IP if localhost
            if (ip === '::1' || ip === '127.0.0.1') {
                // Random US/EU IPs for testing variation
                const randomIps = ['24.48.0.1', '8.8.8.8', '194.12.1.1', '203.0.113.1'];
                ip = randomIps[Math.floor(Math.random() * randomIps.length)];
            }

            const geo = geoip.lookup(ip);
            const country = geo ? geo.country : (data.country || 'Unknown');
            const state = geo ? geo.region : (data.state || undefined);

            // Create session
            const session = await this.sessionService.createSession(client.id, {
                tempId: client.id,
                nickname: data.username,
                gender: data.gender,
                country: country,
                state: state,
            });

            // Broadcast to all that a new user joined the lobby
            this.server.emit('userJoined', {
                id: client.id,
                nickname: session.nickname,
                gender: session.gender,
                country: session.country || 'Unknown',
                isOccupied: false
            });
        } catch (error) {
            this.logger.error(`Failed to handle findMatch for ${client.id}`, error);
        }

        // We KEEP the matching logic for now if they want to use "Random Match" button later,
        // but for the lobby flow, they just stay "online".
        // The frontend might NOT emit 'findMatch' immediately if they just go to lobby.
        // Let's assume for now 'findMatch' IS user onboarding. 
        // NOTE: If we switch to purely manual, we might want a separate 'joinLobby' event, 
        // but 'findMatch' constructs the session, so we reuse it for now.
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        // Broadcast message to room - SANITIZATION happens here (trim)
        const cleanMessage = data.message.trim();
        if (!cleanMessage) return;

        client.to(data.roomId).emit('receiveMessage', {
            senderId: client.id,
            message: cleanMessage,
            timestamp: Date.now(),
        });
    }

    @SubscribeMessage('requestRandomMatch')
    async handleRequestRandomMatch(
        @MessageBody() data: FindMatchDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            this.logger.log(`User requesting random match: ${client.id}`);

            // Get session to confirm details
            const session = await this.sessionService.getSession(client.id);
            if (!session) return;

            const matchRequest = {
                socketId: client.id,
                username: session.nickname,
                gender: session.gender,
                country: session.country,
                state: session.state,
                scope: data.scope,
                preferences: {
                    targetGender: data.targetGender
                }
            };

            const matchId = await this.matchingService.findMatch(matchRequest);

            if (matchId) {
                this.logger.log(`Match found! ${client.id} <-> ${matchId}`);

                // Get match details
                const matchSession = await this.sessionService.getSession(matchId);

                if (matchSession) {
                    // Notify Requestor
                    client.emit('matchFound', {
                        user: {
                            id: matchSession.id,
                            nickname: matchSession.nickname,
                            gender: matchSession.gender,
                            country: matchSession.country,
                            isOccupied: true
                        }
                    });

                    // Notify Match
                    this.server.to(matchId).emit('matchFound', {
                        user: {
                            id: session.id,
                            nickname: session.nickname,
                            gender: session.gender,
                            country: session.country,
                            isOccupied: true
                        }
                    });
                }
            } else {
                this.logger.log(`No match found, adding ${client.id} to queue`);
                await this.matchingService.addToQueue(matchRequest);
                client.emit('waitingForMatch');
            }

        } catch (error) {
            this.logger.error('Error in random matching', error);
        }
    }

    @SubscribeMessage('typing')
    async handleTyping(
        @MessageBody() data: TypingDto,
        @ConnectedSocket() client: Socket,
    ) {
        client.to(data.roomId).emit('userTyping', {
            userId: client.id,
            isTyping: data.isTyping,
        });
    }
}

