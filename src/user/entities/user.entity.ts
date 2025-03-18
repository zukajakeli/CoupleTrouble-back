import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  // @Column()
  // dateOfBirth: string;

  // @Column()
  // phonePrefix: string;

  // @Column()
  // phoneNumber: string;

  @Column({ default: 'user' })
  role: string;
}
