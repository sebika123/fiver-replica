// src/orders/orders.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { StripeService } from '../stripe/stripe.service';
import { CreateOrderInput } from './dto/order.type.dto';
import { OrderStatus } from './schema/order.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private stripeService: StripeService,
  ) {}

  @Post()
  async createOrder(
    @Req() req: RequestWithUser,
    @Body() createOrderDto: CreateOrderInput,
  ) {
    const order = await this.ordersService.createOrder(
      req.user.userId,
      createOrderDto,
    );
    return order;
  }

  @Post(':orderId/create-payment-intent')
  async createPaymentIntent(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.createPaymentIntent(orderId, req.user.userId);
  }

  @Post(':orderId/confirm-payment')
  async confirmPayment(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
    @Body('paymentIntentId') paymentIntentId: string,
    @Body('paymentMethodId') paymentMethodId: string,
  ) {
    return this.ordersService.confirmPayment(
      orderId,
      paymentIntentId,
      paymentMethodId,
    );
  }

  @Patch(':orderId/status')
  async updateOrderStatus(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
    @Body('status') status: OrderStatus,
    @Body('userType') userType: 'buyer' | 'seller',
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      req.user.userId,
      status,
      userType,
    );
  }

  @Get('buyer')
  async getBuyerOrders(
    @Req() req: RequestWithUser,
    @Query('status') status?: OrderStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.getBuyerOrders(
      req.user.userId,
      status,
      +page,
      +limit,
    );
  }

  @Get('seller')
  async getSellerOrders(
    @Req() req: RequestWithUser,
    @Query('status') status?: OrderStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.getSellerOrders(
      req.user.userId,
      status,
      +page,
      +limit,
    );
  }

  @Get(':orderId')
  async getOrderById(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.getOrderById(orderId, req.user.userId);
  }
}

@Controller('webhooks')
export class WebhooksController {
  constructor(private ordersService: OrdersService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(@Req() req: Request) {
    const signature = req.headers['stripe-signature'];
    const event = this.stripeService.constructWebhookEvent(req.body, signature);

    await this.ordersService.handlePaymentWebhook(event);
    return { received: true };
  }
}
