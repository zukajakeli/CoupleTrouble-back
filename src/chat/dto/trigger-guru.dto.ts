import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TriggerGuruDto {
  @ApiProperty({
    description: 'The ID of the channel to send the Guru response to',
    example: 'messaging:channel-123',
  })
  @IsString()
  @IsNotEmpty()
  channelId: string;
} 