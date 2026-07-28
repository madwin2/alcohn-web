import type { CurrencyCode, InternationalMarketCode } from '@/lib/markets/types';

export interface InternationalPaymentLine {
  id: string;
  title: string;
  unitPrice: number;
  qty: number;
}

export interface CreateInternationalPaymentInput {
  orderId: string;
  market: InternationalMarketCode;
  currency: CurrencyCode;
  amount: number;
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  lines: InternationalPaymentLine[];
  successUrl: string;
  failureUrl: string;
  notificationUrl?: string;
}

export interface CreateInternationalPaymentResult {
  provider: string;
  providerPaymentId: string;
  checkoutUrl: string;
  raw?: unknown;
}

export interface VerifyInternationalPaymentWebhookResult {
  provider: string;
  providerPaymentId: string;
  orderId: string;
  paid: boolean;
  raw?: unknown;
}

export interface InternationalPaymentProvider {
  name: string;
  createCheckout(input: CreateInternationalPaymentInput): Promise<CreateInternationalPaymentResult>;
  verifyWebhook(req: Request): Promise<VerifyInternationalPaymentWebhookResult>;
}
