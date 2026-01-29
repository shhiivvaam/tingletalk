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

    @IsOptional()
    // @IsNumber() - incoming as string from some clients? No, class-transformer handles it if Typed.
    // Let's assume number.
    age?: number;

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
    @IsOptional()
    @MaxLength(500)
    message: string;

    // --- Media Fields ---
    @IsString()
    @IsIn(['text', 'image', 'video', 'audio', 'gif'])
    @IsOptional()
    type: 'text' | 'image' | 'video' | 'audio' | 'gif' = 'text';

    @IsString()
    @IsOptional()
    attachmentUrl?: string; // S3 Public URL

    @IsObject()
    @IsOptional()
    metadata?: any; // duration, size, etc.
}

class TypingDto {
    @IsString()
    roomId: string;

    @IsBoolean()
    isTyping: boolean;
}

const CRAZY_GREETINGS = [
    "Monkey time! 🐒",
    "Pizza is here! 🍕",
    "Knock knock! 🚪",
    "Is this the Krusty Krab? 🦀",
    "I come in peace 👽",
    "Ready for chaos? 🌪️",
    "Meow? 🐱",
    "Help, I'm stuck in the matrix! 💊",
    "Hola Amigo! 🌮",
    "Boom! 💥",
    "Do you believe in ghosts? 👻",
    "I'm not a robot... beep boop 🤖"
];

class MessageReadDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;
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
                age: s.age, // Expose age
                country: s.country || 'Unknown',
                state: s.state,
                isOccupied: false // Placeholder for now
            }));
    }

    @SubscribeMessage('findMatch')
    async handleFindMatch(
        @MessageBody() data: FindMatchDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            this.logger.log(`User joining lobby: ${data.username} (${client.id})`);

            // Creates session using verified data from DTO used in manual entry
            const session = await this.sessionService.createSession(client.id, {
                tempId: client.id,
                nickname: data.username,
                gender: data.gender,
                age: data.age,
                country: data.country || 'Unknown',
                state: data.state, // Allow manual state or undefined
            });

            // Broadcast to all that a new user joined the lobby
            this.server.emit('userJoined', {
                id: client.id,
                nickname: session.nickname,
                gender: session.gender,
                age: session.age,
                country: session.country || 'Unknown',
                state: session.state,
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
        // Allow empty message if there is an attachment (e.g. just sending image)
        if (!cleanMessage && !data.attachmentUrl) return;

        client.to(data.roomId).emit('receiveMessage', {
            senderId: client.id,
            message: cleanMessage,
            type: data.type || 'text',
            attachmentUrl: data.attachmentUrl,
            metadata: data.metadata,
            timestamp: Date.now(),
        });
    }

    @SubscribeMessage('messageRead')
    async handleMessageRead(
        @MessageBody() data: MessageReadDto,
        @ConnectedSocket() client: Socket,
    ) {
        // Notify the OTHER user (data.roomId) that THIS user (client.id) has read their messages
        client.to(data.roomId).emit('messagesRead', {
            readerId: client.id
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
                age: session.age,
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
                            age: matchSession.age,
                            country: matchSession.country,
                            state: matchSession.state,
                            isOccupied: true
                        }
                    });

                    // Notify Match
                    this.server.to(matchId).emit('matchFound', {
                        user: {
                            id: session.id,
                            nickname: session.nickname,
                            gender: session.gender,
                            age: session.age,
                            country: session.country,
                            state: session.state,
                            isOccupied: true
                        }
                    });

                    // --- CRAZY AUTO GREETING ---
                    const randomGreeting = CRAZY_GREETINGS[Math.floor(Math.random() * CRAZY_GREETINGS.length)];

                    // Send from Requester (client) to Match (matchId)
                    this.server.to(matchId).emit('receiveMessage', {
                        senderId: client.id,
                        message: randomGreeting,
                        timestamp: Date.now(),
                    });

                    // Also verify to Requester that "you sent this" (so it shows in their UI)
                    // Or actually, usually the sender adds it optimistically. 
                    // But since this is server-generated, we should tell the sender "You sent this".
                    // But 'receiveMessage' usually means "incoming".
                    // The Frontend likely handles "my messages" by adding them locally.
                    // IMPORTANT: Frontend needs to know this message was sent!
                    // I'll emit a special event or just rely on the frontend to add a message if it detects a match?
                    // No, server is generating content.

                    // Let's emit 'messageSent' confirmation to sender? 
                    // Or simply emit 'receiveMessage' with senderId = client.id to the client itself?
                    // Frontend likely filters out messages where senderId == myId from "incoming" processing 
                    // unless logic handles it.
                    // Let's check ChatWindow.tsx. It listens loop?

                    // Actually, let's just send it to the receiver. The sender will just see the chat open.
                    // If the user wants the sender to SEE "I said Monkey Time!", we need to send it back.
                    client.emit('receiveMessage', {
                        senderId: client.id, // It's from ME
                        message: randomGreeting,
                        timestamp: Date.now()
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

