import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class TimeStamps {
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class BaseGig extends TimeStamps {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  category: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  userId: string;
}