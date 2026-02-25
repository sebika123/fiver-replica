import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Document } from 'mongoose';

@ObjectType()
@Schema()
export class User extends Document {
  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Field({ nullable: true })
  @Prop()
  avatarUrl?: string;

  @Field({ nullable: true })
  @Prop()
  phoneNumber?: string;

  @Field({ nullable: true })
  @Prop()
  gender?: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  otp: string;

  @Prop()
  otpExpiry: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
