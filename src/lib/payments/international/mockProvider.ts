import type {
  CreateInternationalPaymentInput,
  CreateInternationalPaymentResult,
  InternationalPaymentProvider,
  VerifyInternationalPaymentWebhookResult,
} from './types';

export const mockInternationalPaymentProvider: InternationalPaymentProvider = {
  name: 'mock',
  async createCheckout(
    input: CreateInternationalPaymentInput
  ): Promise<CreateInternationalPaymentResult> {
    return {
      provider: 'mock',
      providerPaymentId: `mock_${input.orderId}`,
      checkoutUrl: input.successUrl,
      raw: { simulated: true },
    };
  },
  async verifyWebhook(req: Request): Promise<VerifyInternationalPaymentWebhookResult> {
    const body = (await req.json().catch(() => ({}))) as {
      orderId?: string;
      providerPaymentId?: string;
    };
    return {
      provider: 'mock',
      providerPaymentId: body.providerPaymentId ?? 'mock_unknown',
      orderId: body.orderId ?? '',
      paid: Boolean(body.orderId),
      raw: body,
    };
  },
};
