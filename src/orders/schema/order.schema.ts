// src/orders/schema/order.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Document } from 'mongoose';
import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { RequirementsType } from '../dto/order.type.dto';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DELIVERED = 'delivered',
  REVISION = 'revision',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

// Register enums with GraphQL
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Order status enum',
});

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment status enum',
});

@ObjectType() // Add this decorator
@Schema({ timestamps: true })
export class Order {
  @Field(() => ID) // Add this
  _id: string;

  @Field(() => ID) // Add this
  id: string;

  @Field(() => ID) // Add this
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyer: Types.ObjectId;

  @Field(() => ID) // Add this
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  seller: Types.ObjectId;

  @Field(() => RequirementsType, { nullable: true })
  @Prop({
    type: {
      additionalInstructions: { type: String },
      requirements: { type: String },
    },
  })
  requirements: {
    additionalInstructions?: string;
    requirements?: string;
  };

  @Field(() => ID) // Add this
  @Prop({ type: Types.ObjectId, ref: 'Gig', required: true })
  gig: Types.ObjectId;

  @Field() // Add this
  @Prop({ required: true })
  packageType: string; // basic, standard, premium

  @Field() // Add this
  @Prop({ required: true })
  packageName: string;

  @Field() // Add this
  @Prop({ required: true })
  description: string;

  @Field() // Add this
  @Prop({ required: true })
  price: number;

  @Field() // Add this
  @Prop({ required: true, min: 1 })
  quantity: number;

  @Field() // Add this
  @Prop({ required: true })
  totalAmount: number;

  @Field() // Add this
  @Prop({ required: true })
  deliveryTime: number; // in days

  @Field(() => OrderStatus) // Add this
  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Field(() => PaymentStatus) // Add this
  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Field({ nullable: true }) // Add this
  @Prop()
  stripePaymentIntentId: string;

  @Field({ nullable: true }) // Add this
  @Prop()
  stripePaymentMethodId: string;

  @Field(() => Date, { nullable: true }) // Add this
  @Prop({ type: Date })
  startedAt: Date;

  @Field(() => Date, { nullable: true }) // Add this
  @Prop({ type: Date })
  completedAt: Date;

  @Field(() => Date, { nullable: true }) // Add this
  @Prop({ type: Date })
  cancelledAt: Date;

  @Field(() => ID, { nullable: true }) // Add this
  @Prop({ type: Types.ObjectId, ref: 'Review' })
  review: Types.ObjectId;

  @Field(() => Date) // Add this
  createdAt: Date;

  @Field(() => Date) // Add this
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
