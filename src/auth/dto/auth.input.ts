import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { User } from 'src/users/schema/user.schema';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(6)
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(6)
  password: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsString()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsString()
  gender?: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;
}
