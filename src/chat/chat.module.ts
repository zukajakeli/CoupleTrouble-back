import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PromptsModule } from 'src/prompts/prompts.module';

@Module({
  imports: [ConfigModule, PromptsModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
