import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './schema/order.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderInput } from './dto/order.type.dto';
import { CurrentUser } from 'src/auth/currentr-user.decorator';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private ordersService: OrdersService) {}

  @Mutation(() => Order)
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser() user: any,
    @Args('input') createOrderInput: CreateOrderInput,
  ) {
    return this.ordersService.createOrder(user.userId, createOrderInput);
  }

  @Mutation(() => Order)
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @CurrentUser() user: any,
    @Args('orderId') orderId: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
    @Args('userType') userType: 'buyer' | 'seller',
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      user.userId,
      status,
      userType,
    );
  }

  @Query(() => [Order])
  @UseGuards(JwtAuthGuard)
  async buyerOrders(
    @CurrentUser() user: any,
    @Args('status', { nullable: true }) status?: OrderStatus,
  ) {
    const result = await this.ordersService.getBuyerOrders(user.userId, status);
    return result.orders;
  }

  @Query(() => [Order])
  @UseGuards(JwtAuthGuard)
  async sellerOrders(
    @CurrentUser() user: any,
    @Args('status', { nullable: true }) status?: OrderStatus,
  ) {
    const result = await this.ordersService.getSellerOrders(
      user.userId,
      status,
    );
    return result.orders;
  }

  @Query(() => Order)
  @UseGuards(JwtAuthGuard)
  async order(@CurrentUser() user: any, @Args('id') id: string) {
    return this.ordersService.getOrderById(id, user.userId);
  }
}
