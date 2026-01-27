import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const type = host.getType();

        if (type === 'http') {
            this.handleHttpException(exception, host);
        } else if (type === 'ws') {
            this.handleWsException(exception, host);
        } else {
            // Default to console log for unknown types (rpc/graphql)
            this.logger.error(`Unknown exception type: ${type}`, exception);
        }
    }

    private handleHttpException(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        this.logger.error(
            `HTTP ${status} Error: ${JSON.stringify(message)}`,
            exception instanceof Error ? exception.stack : ''
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: typeof message === 'string' ? message : (message as any).message || message,
        });
    }

    private handleWsException(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const client = ctx.getClient<Socket>();

        // Default to 'error' event unless specialized
        const event = 'error';
        const errorData = exception instanceof WsException
            ? exception.getError()
            : { message: 'Internal WebSocket Server Error' };

        this.logger.error(
            `WS Error on client ${client.id}: ${JSON.stringify(errorData)}`
        );

        client.emit(event, errorData);
    }
}
