import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateChannelDto {
  @IsArray()
  members: string[];

  @IsString()
  data: {
    name: string;
  };
}
