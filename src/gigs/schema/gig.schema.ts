import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Document } from 'mongoose';
import { GigImage } from '../dto/gigs.type';

@ObjectType()
export class ImageType {
  @Field()
  @Prop({ required: true })
  url: string;

  @Field()
  @Prop({ required: true })
  publicId: string;
}

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

  @Field()
  @Prop({ required: true })
  userId: string;

  @Field(() => [ImageType], { nullable: true })
  @Prop({ type: [{ url: String, publicId: String }], default: [] })
  images: ImageType[];
}

export const GigSchema = SchemaFactory.createForClass(Gig);
