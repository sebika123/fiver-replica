import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(input: { email: string; password: string }) {
    const user = await this.validateUser(input.email, input.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, sub: user._id };
    return this.jwtService.sign(payload);
  }
  async register(input: { email: string; password: string; name: string }) {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    return this.usersService.create({
      ...input,
      password: hashedPassword,
    });
  }
}
