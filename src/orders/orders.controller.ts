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
import { CurrentUserRest } from 'src/auth/current-user-rest.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private stripeService: StripeService,
  ) {}

  @Post()
  async createOrder(
    @CurrentUserRest() user: any,
    @Body() createOrderDto: CreateOrderInput,
  ) {
    const order = await this.ordersService.createOrder(
      user.userId,
      createOrderDto,
    );
    return order;
  }

  @Post(':orderId/create-payment-intent')
  async createPaymentIntent(
    @CurrentUserRest() user: any,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.createPaymentIntent(orderId, user.userId);
  }

  @Post(':orderId/confirm-payment')
  async confirmPayment(
    @CurrentUserRest() user: any,
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
    @CurrentUserRest() user: any,
    @Param('orderId') orderId: string,
    @Body('status') status: OrderStatus,
    @Body('userType') userType: 'buyer' | 'seller',
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      user.userId,
      status,
      userType,
    );
  }

  @Get('buyer')
  async getBuyerOrders(
    @CurrentUserRest() user: any,
    @Query('status') status?: OrderStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.getBuyerOrders(
      user.user.userId,
      status,
      +page,
      +limit,
    );
  }

  @Get('seller')
  async getSellerOrders(
    @CurrentUserRest() user: any,
    @Query('status') status?: OrderStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.getSellerOrders(
      user.user.userId,
      status,
      +page,
      +limit,
    );
  }

  @Get(':orderId')
  async getOrderById(
    @CurrentUserRest() user: any,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.getOrderById(orderId, user.user.userId);
  }
}

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private ordersService: OrdersService,
    private stripeService: StripeService, // Add StripeService here
  ) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(@Req() req: Request) {
    const signature = req.headers['stripe-signature'];
    const event = this.stripeService.constructWebhookEvent(req.body, signature);

    await this.ordersService.handlePaymentWebhook(event);
    return { received: true };
  }
}
