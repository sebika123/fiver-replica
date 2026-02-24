import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Public } from './dto/public.decorator';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { User } from 'src/users/schema/user.schema';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Public()
  @Mutation(() => String)
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => User)
  async register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }
}
