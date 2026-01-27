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
import { Logger } from '@nestjs/common';
import { SessionService } from '../modules/session/session.service';
import { MatchingService } from '../modules/matching/matching.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly sessionService: SessionService,
        private readonly matchingService: MatchingService,
    ) { }

    async handleConnection(client: Socket) {
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
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ) {
        this.logger.log(`Finding match for ${client.id}`);

        // Create session
        await this.sessionService.createSession(client.id, {
            tempId: data.tempId || client.id,
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
            scope: data.scope || 'global',
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
        @MessageBody() data: { roomId: string; message: string },
        @ConnectedSocket() client: Socket,
    ) {
        // Broadcast message to room
        client.to(data.roomId).emit('receiveMessage', {
            senderId: client.id,
            message: data.message,
            timestamp: Date.now(),
        });
    }

    @SubscribeMessage('typing')
    async handleTyping(
        @MessageBody() data: { roomId: string; isTyping: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        client.to(data.roomId).emit('userTyping', {
            userId: client.id,
            isTyping: data.isTyping,
        });
    }
}
