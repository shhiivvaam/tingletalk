import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SessionModule } from '../modules/session/session.module';
import { MatchingModule } from '../modules/matching/matching.module';

@Module({
    imports: [SessionModule, MatchingModule],
    providers: [ChatGateway],
})
export class ChatModule { }
