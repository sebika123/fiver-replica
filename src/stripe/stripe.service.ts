import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    metadata: any;
  }) {
    return this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string) {
    return this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }

  async releasePayment(paymentIntentId: string) {
    // In a real implementation, you might need to handle transfers to sellers
    // This could involve creating a transfer to the seller's connected account
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async processRefund(paymentIntentId: string) {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }

  constructWebhookEvent(payload: any, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET'),
    );
  }
}
