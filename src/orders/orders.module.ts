import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController, WebhooksController } from './orders.controller';
import { OrdersResolver } from './orders.resolver';
import { GigsModule } from 'src/gigs/gigs.module';
import { Order, OrderSchema } from './schema/order.schema';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    // StripeModule,
    GigsModule,
    StripeModule,
  ],
  controllers: [OrdersController, WebhooksController],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
