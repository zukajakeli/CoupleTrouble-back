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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
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
    console.log({ password });
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
    const payload = { email: user.email, sub: user.id, role: user.role };
    console.log('login', payload);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { email } });

    const test = await bcrypt.compare(password, user?.password);
    console.log({ user, email, password, test });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
