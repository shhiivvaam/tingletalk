import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './database/redis.module';
import { SessionModule } from './modules/session/session.module';
import { ChatModule } from './chat/chat.module';
import { UsernameModule } from './modules/username/username.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RedisModule,
    SessionModule,
    ChatModule,
    UsernameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
