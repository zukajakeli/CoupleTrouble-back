import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Exclude } from 'class-transformer';

export enum ConversationSource {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
}

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column('text')
  text: string;

  @Column('json', { nullable: true })
  analysis: any | null;

  @Column({ nullable: true })
  lovePoints?: number;

  @Column({
    type: 'enum',
    enum: ConversationSource,
  })
  source: ConversationSource;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.conversations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column('json', { nullable: true })
  metadata?: any;
}
