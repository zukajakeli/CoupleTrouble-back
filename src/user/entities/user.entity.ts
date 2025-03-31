import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations: Conversation[];

  // @Column()
  // dateOfBirth: string;

  // @Column()
  // phonePrefix: string;

  // @Column()
  // phoneNumber: string;

  @Column({ default: 'user' })
  role: string;
}
