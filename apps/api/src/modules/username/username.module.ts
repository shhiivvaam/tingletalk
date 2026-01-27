import { Module } from '@nestjs/common';
import { UsernameController } from './username.controller';
import { SessionModule } from '../session/session.module';

@Module({
    imports: [SessionModule],
    controllers: [UsernameController],
})
export class UsernameModule { }
