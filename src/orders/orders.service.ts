// src/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StripeService } from 'src/stripe/stripe.service';
import { GigsService } from 'src/gigs/gigs.service';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
} from './schema/order.schema';
import { CreateOrderInput } from './dto/order.type.dto';
// import { CreateOrderInput } from './dto/create-order.dto';
// import { StripeService } from '../stripe/stripe.service';
// import { GigsService } from '../gigs/gigs.service';
// import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private stripeService: StripeService,
    private gigsService: GigsService,
    // private notificationsService: NotificationsService,
  ) {}

  async createOrder(
    buyerId: string,
    createOrderInput: CreateOrderInput,
  ): Promise<Order> {
    // Validate gig exists
    const gig = await this.gigsService.findById(createOrderInput.gigId);
    if (!gig) {
      throw new NotFoundException('Gig not found');
    }

    // Calculate total amount (including platform fee)
    const platformFee = this.calculatePlatformFee(createOrderInput.totalAmount);
    const totalWithFee = createOrderInput.totalAmount + platformFee;

    // Prepare requirements object
    const requirements = createOrderInput.requirements
      ? {
          additionalInstructions:
            createOrderInput.requirements.additionalInstructions,
          requirements: createOrderInput.requirements.requirements,
        }
      : {
          additionalInstructions: createOrderInput.additionalInstructions,
        };

    // Create order
    const order = new this.orderModel({
      buyer: new Types.ObjectId(buyerId),
      seller: new Types.ObjectId(createOrderInput.sellerId),
      gig: new Types.ObjectId(createOrderInput.gigId),
      packageType: createOrderInput.selectedPackage.packageType,
      packageName: createOrderInput.selectedPackage.name,
      description: createOrderInput.selectedPackage.description,
      price: createOrderInput.selectedPackage.price,
      quantity: createOrderInput.quantity,
      totalAmount: totalWithFee,
      deliveryTime: createOrderInput.selectedPackage.deliveryDays,
      requirements: requirements,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    return order.save();
  }

  async createPaymentIntent(orderId: string, buyerId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      buyer: buyerId,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already processed');
    }

    // Create Stripe payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        buyerId: buyerId,
      },
    });

    // Update order with payment intent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    return {
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    };
  }

  async confirmPayment(
    orderId: string,
    paymentIntentId: string,
    paymentMethodId: string,
  ) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Confirm payment with Stripe
    const paymentIntent = await this.stripeService.confirmPayment(
      paymentIntentId,
      paymentMethodId,
    );

    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = PaymentStatus.PAID;
      order.orderStatus = OrderStatus.IN_PROGRESS;
      order.stripePaymentMethodId = paymentMethodId;
      order.startedAt = new Date();

      await order.save();

      // Send notifications
      //   await this.notificationsService.sendOrderConfirmation(
      //     order.buyer.toString(),
      //     order._id.toString(),
      //   );

      //   await this.notificationsService.sendNewOrderNotification(
      //     order.seller.toString(),
      //     order._id.toString(),
      //   );
    }

    return order;
  }

  async handlePaymentWebhook(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
    }
  }

  private async handleSuccessfulPayment(paymentIntent: any) {
    const orderId = paymentIntent.metadata.orderId;
    await this.orderModel.findByIdAndUpdate(orderId, {
      paymentStatus: PaymentStatus.PAID,
      orderStatus: OrderStatus.IN_PROGRESS,
    });
  }

  private async handleFailedPayment(paymentIntent: any) {
    const orderId = paymentIntent.metadata.orderId;
    await this.orderModel.findByIdAndUpdate(orderId, {
      paymentStatus: PaymentStatus.FAILED,
    });
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
    userType: 'buyer' | 'seller',
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate permissions based on user type and status transition
    this.validateStatusTransition(order, status, userType);

    // Update status
    order.orderStatus = status;

    // Set timestamps based on status
    switch (status) {
      case OrderStatus.IN_PROGRESS:
        if (order.orderStatus === OrderStatus.PENDING) {
          order.startedAt = new Date();
        }
        break;
      case OrderStatus.COMPLETED:
        order.completedAt = new Date();
        // Release payment to seller
        await this.stripeService.releasePayment(order.stripePaymentIntentId);
        break;
      case OrderStatus.CANCELLED:
        order.cancelledAt = new Date();
        // Process refund if payment was made
        if (order.paymentStatus === PaymentStatus.PAID) {
          await this.stripeService.processRefund(order.stripePaymentIntentId);
          order.paymentStatus = PaymentStatus.REFUNDED;
        }
        break;
    }

    await order.save();

    // Send notification
    // await this.notificationsService.sendOrderStatusUpdate(
    //   userId === order.buyer.toString()
    //     ? order.seller.toString()
    //     : order.buyer.toString(),
    //   orderId,
    //   status,
    // );

    return order;
  }

  private validateStatusTransition(
    order: OrderDocument,
    newStatus: OrderStatus,
    userType: 'buyer' | 'seller',
  ) {
    const currentStatus = order.orderStatus;

    // Define allowed transitions
    const allowedTransitions = {
      [OrderStatus.PENDING]: {
        buyer: [OrderStatus.CANCELLED],
        seller: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      },
      [OrderStatus.IN_PROGRESS]: {
        buyer: [OrderStatus.CANCELLED, OrderStatus.COMPLETED],
        seller: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      },
      [OrderStatus.DELIVERED]: {
        buyer: [OrderStatus.COMPLETED, OrderStatus.REVISION],
        seller: [],
      },
      [OrderStatus.REVISION]: {
        buyer: [],
        seller: [OrderStatus.IN_PROGRESS],
      },
    };

    const allowed = allowedTransitions[currentStatus]?.[userType] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus} as ${userType}`,
      );
    }
  }

  async getBuyerOrders(
    buyerId: string,
    status?: OrderStatus,
    page = 1,
    limit = 10,
  ) {
    const query: any = { buyer: buyerId };
    if (status) {
      query.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate('gig')
        .populate('seller', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSellerOrders(
    sellerId: string,
    status?: OrderStatus,
    page = 1,
    limit = 10,
  ) {
    const query: any = { seller: sellerId };
    if (status) {
      query.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate('gig')
        .populate('buyer', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('gig')
      .populate('buyer', 'name email profileImage')
      .populate('seller', 'name email profileImage')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user is either buyer or seller
    if (
      order.buyer.toString() !== userId &&
      order.seller.toString() !== userId
    ) {
      throw new BadRequestException('Unauthorized to view this order');
    }

    return order;
  }

  private calculatePlatformFee(amount: number): number {
    // Example: 10% platform fee
    return amount * 0.1;
  }
}
