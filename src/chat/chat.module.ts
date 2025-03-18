import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [ConfigModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
