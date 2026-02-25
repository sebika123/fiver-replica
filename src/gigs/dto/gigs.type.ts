import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsNumber, IsArray } from 'class-validator';
import { Gig } from '../schema/gig.schema';

@InputType()
export class CreateGigInput {
  @IsString()
  @Field()
  title: string;

  @IsString()
  @Field()
  description: string;

  @IsNumber()
  @Field()
  price: number;

  @IsString()
  @Field()
  category: string;

  @IsArray()
  @IsString({ each: true })
  @Field(() => [String])
  tags: string[];
}

@ObjectType()
export class CreateGigResponse {
  @Field(() => Gig)
  gig: Gig;

  @Field()
  message: string;
}
