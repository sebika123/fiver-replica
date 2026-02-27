// src/orders/dto/create-order.dto.ts
import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsMongoId,
  IsOptional,
} from 'class-validator';

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requirements?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additionalInstructions?: string;
}
