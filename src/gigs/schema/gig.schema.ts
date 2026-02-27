// gig.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { HydratedDocument } from 'mongoose';

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
@Schema({ timestamps: true })
export class Gig {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  id: string;

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
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  @Prop({ required: true })
  userId: string;

  @Field(() => [ImageType], { nullable: true })
  @Prop({ type: [{ url: String, publicId: String }], default: [] })
  images: ImageType[];
}

//  Use HydratedDocument instead of extending Document in the class
export type GigDocument = HydratedDocument<Gig>;

export const GigSchema: any = SchemaFactory.createForClass(Gig);
GigSchema.set('toObject', { virtuals: true });
GigSchema.set('toJSON', { virtuals: true });
