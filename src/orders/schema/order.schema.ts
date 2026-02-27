import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Document } from 'mongoose';
import { timestamp } from 'rxjs';

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

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  seller: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Gig', required: true })
  gig: Types.ObjectId;

  @Prop({ required: true })
  packageType: string; // basic, standard, premium

  @Prop({ required: true })
  packageName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  deliveryTime: number; // in days

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop()
  stripePaymentIntentId: string;

  @Prop()
  stripePaymentMethodId: string;

  @Prop({ type: Object })
  requirements: Record<string, any>;

  @Prop({ type: Date })
  startedAt: Date;

  @Prop({ type: Date })
  completedAt: Date;

  @Prop({ type: Date })
  cancelledAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Review' })
  review: Types.ObjectId;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
