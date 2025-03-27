import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiService } from './ai.service';

@Module({
  imports: [ConfigModule],
  providers: [ChatService, AiService],
  controllers: [ChatController],
})
export class ChatModule {}
