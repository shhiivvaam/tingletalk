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

import { IsString, IsNotEmpty, MaxLength, IsIn, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SessionService } from '../modules/session/session.service';
import { MatchingService } from '../modules/matching/matching.service';

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
    state?: string;

    @IsString()
    @IsIn(['local', 'global'])
    scope: 'local' | 'global';

    @IsObject()
    @ValidateNested()
    @Type(() => PreferencesDto)
    targetGender: PreferencesDto['targetGender']; // Simplified for now, should be object
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
        }

        await this.sessionService.removeSession(client.id);
    }

    @SubscribeMessage('findMatch')
    async handleFindMatch(
        @MessageBody() data: FindMatchDto,
        @ConnectedSocket() client: Socket,
    ) {
        this.logger.log(`Finding match for ${client.id}`);

        // Create session
        await this.sessionService.createSession(client.id, {
            tempId: client.id,
            nickname: data.username,
            gender: data.gender,
            country: data.country,
            state: data.state,
        });

        const matchRequest = {
            socketId: client.id,
            username: data.username,
            gender: data.gender,
            country: data.country,
            state: data.state,
            scope: data.scope,
            preferences: {
                targetGender: data.targetGender || 'all',
            },
        };

        // Try to find immediate match
        const matchedSocketId = await this.matchingService.findMatch(matchRequest);

        if (matchedSocketId) {
            // Match found!
            const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Join both users to room
            client.join(roomId);
            this.server.sockets.sockets.get(matchedSocketId)?.join(roomId);

            // Notify both users
            client.emit('matchFound', { roomId, partnerId: matchedSocketId });
            this.server.to(matchedSocketId).emit('matchFound', { roomId, partnerId: client.id });

            this.logger.log(`Match found: ${client.id} <-> ${matchedSocketId}`);
        } else {
            // Add to queue
            await this.matchingService.addToQueue(matchRequest);
            client.emit('searching', { message: 'Searching for a match...' });
        }
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

