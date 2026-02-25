import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Document } from 'mongoose';

@ObjectType()
@Schema()
export class Gig extends Document {
  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field()
  @Prop({ required: true })
  price: number;

  @Field()
  @Prop({ required: true })
  category: string;

  @Field(() => [String])
  @Prop({ type: [String], required: true })
  tags: string[];

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const GigSchema = SchemaFactory.createForClass(Gig);
