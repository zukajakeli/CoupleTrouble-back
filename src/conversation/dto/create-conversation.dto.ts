import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  inputText: string;
}
