import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  //   @ApiProperty({
  //     required: true,
  //   })
  //   @IsString()
  //   dateOfBirth: string;

  @ApiProperty()
  @IsString()
  @IsOptional() // Optional, default role is 'user'
  role?: string;
}
