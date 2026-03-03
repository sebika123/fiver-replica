// src/orders/dto/order.type.dto.ts

import { InputType, Field, Int, Float, ObjectType, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { OrderStatus, PaymentStatus } from '../schema/order.schema';
import { Prop } from '@nestjs/mongoose';

@InputType()
export class PackageSelectionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  packageId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  packageType: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  deliveryDays: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;
}

// Create a separate InputType for requirements
@InputType()
export class RequirementsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additionalInstructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requirements?: string;
}

@InputType()
export class CreateOrderInput {
  @Field()
  @IsNotEmpty()
  @IsMongoId()
  gigId: string;

  @Field()
  @IsNotEmpty()
  @IsMongoId()
  sellerId: string;

  @Field(() => PackageSelectionInput)
  @IsNotEmpty()
  selectedPackage: PackageSelectionInput;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  totalAmount: number;

  // Use RequirementsInput instead of RequirementsType
  @Field(() => RequirementsInput, { nullable: true })
  @IsOptional()
  requirements?: RequirementsInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additionalInstructions?: string;
}

// Keep this as ObjectType for output
@ObjectType()
export class RequirementsType {
  @Field({ nullable: true })
  additionalInstructions?: string;

  @Field({ nullable: true })
  requirements?: string;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  id: string;

  @Field(() => ID)
  buyer: string;

  @Field(() => ID)
  seller: string;

  @Field(() => ID)
  gig: string;

  @Field()
  packageType: string;

  @Field()
  packageName: string;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  quantity: number;

  @Field()
  totalAmount: number;

  @Field()
  deliveryTime: number;

  @Field(() => OrderStatus)
  orderStatus: OrderStatus;

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field({ nullable: true })
  stripePaymentIntentId?: string;

  @Field({ nullable: true })
  stripePaymentMethodId?: string;

  // Use RequirementsType for output
  @Field(() => RequirementsType, { nullable: true })
  requirements?: {
    additionalInstructions?: string;
    requirements?: string;
  };

  @Field(() => Date, { nullable: true })
  startedAt?: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => Date, { nullable: true })
  cancelledAt?: Date;

  @Field(() => ID, { nullable: true })
  review?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
