import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Public } from './dto/public.decorator';
import {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from './dto/auth.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Public()
  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => RegisterResponse)
  async register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }
  @Public()
  @Mutation(() => RegisterResponse)
  async verifyOTP(@Args('userId') userId: string, @Args('otp') otp: string) {
    return this.authService.verifyOTP(userId, otp);
  }
}
