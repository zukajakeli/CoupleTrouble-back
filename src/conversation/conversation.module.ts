import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { User } from 'src/user/entities/user.entity';
import { PromptsModule } from 'src/prompts/prompts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, User]), PromptsModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
