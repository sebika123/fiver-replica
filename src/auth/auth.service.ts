import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { MailService } from 'src/common/mailer/mailer.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(input: LoginInput) {
    const user = await this.validateUser(input.email, input.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return {
      accessToken,
      refreshToken,
      user,
    };
  }
  async register(input: RegisterInput) {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await this.usersService.create({
      ...input,
      password: hashedPassword,
      isActive: false,
    });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    await this.usersService.saveOTP(user._id, otp);
    // Send OTP email
    await this.mailService.sendMail(
      input.email,
      'Verify your email',
      ` Hi ${input.name}, your account has been created. Your OTP code is ${otp}.Use this code to verify your email and activate your account.`,
    );

    return { message: 'User registered. Check email for OTP' };
  }

  async verifyOTP(userId: string, otp: string) {
    const isValid = await this.usersService.verifyOTP(userId, otp);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }
    // Activate user
    await this.usersService.activateUser(userId);
    return { message: 'Email verified successfully' };
  }

  
}
