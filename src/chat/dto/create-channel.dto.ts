import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  channelType: string;

  @IsString()
  channelId: string;

  @IsArray()
  members: string[];

  @IsString()
  data: {
    name: string;
  };
}
