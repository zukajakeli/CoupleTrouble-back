import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async register(
    email: string,
    password: string,
    name: string,
    role: string = 'user',
  ) {
    const existingUser = await this.usersRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = this.usersRepo.create({
      email,
      name,
      password: hashedPassword,
      role,
    });
    await this.usersRepo.save(user);

    return this.login(user);
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
      first_name: user.name,
    };

    await this.chatService.createUser(user.id.toString(), payload);

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
