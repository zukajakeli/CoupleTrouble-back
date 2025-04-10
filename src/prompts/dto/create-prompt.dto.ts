import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { PromptCategory } from '../enums/prompt-category.enum';

export class CreatePromptDto {
  @ApiProperty({
    description: 'The text content of the prompt',
  })
  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @ApiProperty({
    enum: PromptCategory,
    example: PromptCategory.CHAT_GURU,
    description: 'The category for the prompt',
  })
  @IsEnum(PromptCategory)
  @IsNotEmpty()
  readonly category: PromptCategory;
}
