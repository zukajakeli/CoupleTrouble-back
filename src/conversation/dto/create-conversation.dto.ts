import { IsEnum, IsString, isEnum } from 'class-validator';
import { ConversationSource } from '../entities/conversation.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Conversation text',
    type: String,
  })
  @IsString()
  inputText: string;

  @ApiProperty({
    description: 'The source of the conversation',
    enum: ConversationSource,
  })
  @IsEnum(ConversationSource)
  source: ConversationSource;
}
