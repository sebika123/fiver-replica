import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsNumber, IsArray } from 'class-validator';
import { Gig } from '../schema/gig.schema';
import { GraphQLUpload } from 'graphql-upload';
import { FileUpload } from 'graphql-upload';
@ObjectType()
export class GigImage {
  @Field()
  url: string;

  @Field()
  publicId: string;
}

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

  @Field(() => [GraphQLUpload], { nullable: true })
  images?: Promise<FileUpload>[];

  @Field()
  createdAt: Date;
}

@ObjectType()
export class CreateGigResponse {
  @Field(() => Gig)
  gig: Gig;

  @Field()
  message: string;
}

@InputType()
export class UpdateGigInput {
  @IsString()
  @Field({ nullable: true })
  title?: string;

  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsNumber()
  @Field({ nullable: true })
  price?: number;

  @IsString()
  @Field({ nullable: true })
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [GraphQLUpload], { nullable: true })
  images?: Promise<FileUpload>[];
}

@InputType()
export class ListGigsInput {
  @Field(() => Number, { nullable: true, defaultValue: 1 })
  page: number;

  @Field(() => Number, { nullable: true, defaultValue: 10 })
  limit: number;

  @Field(() => String)
  userId: string;
}
