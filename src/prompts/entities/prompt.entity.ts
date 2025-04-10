import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { PromptCategory } from '../enums/prompt-category.enum';

@Entity()
export class Prompt {
  @ApiProperty({
    example: 'a8a7b13e-5eac-4a7a-b199-1e5a3a0e5d7f',
    description: 'The unique identifier of the prompt',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'What is your favorite shared memory?',
    description: 'The text content of the prompt',
  })
  @Column()
  content: string;

  @ApiProperty({
    enum: PromptCategory,
    example: PromptCategory.CHAT_GURU,
    description: 'The category of the prompt',
  })
  @Column({
    type: 'enum',
    enum: PromptCategory,
  })
  category: PromptCategory;

  @ApiProperty({ description: 'The date and time the prompt was created' })
  @CreateDateColumn()
  createdAt: Date;
}
