import { createHmac, timingSafeEqual } from 'crypto';
import { getMarketConfig } from '@/lib/markets/config';
import type {
  CreateInternationalPaymentInput,
  CreateInternationalPaymentResult,
  InternationalPaymentProvider,
  VerifyInternationalPaymentWebhookResult,
} from './types';

interface DLocalPaymentResponse {
  id?: string;
  status?: string;
  order_id?: string;
  redirect_url?: string;
  code?: number;
  message?: string;
}

function getDLocalConfig() {
  const apiKey = process.env.DLOCAL_API_KEY?.trim();
  const secretKey = process.env.DLOCAL_SECRET_KEY?.trim();
  if (!apiKey || !secretKey) {
    throw new Error('DLOCAL_API_KEY y DLOCAL_SECRET_KEY son obligatorias');
  }

  const base =
    process.env.DLOCAL_API_BASE?.trim() ||
    (process.env.NODE_ENV === 'production'
      ? 'https://api.dlocalgo.com'
      : 'https://api-sbx.dlocalgo.com');

  return { apiKey, secretKey, base: base.replace(/\/$/, '') };
}

function dlocalAuthHeader(apiKey: string, secretKey: string): string {
  return `Bearer ${apiKey}:${secretKey}`;
}

async function dlocalRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { apiKey, secretKey, base } = getDLocalConfig();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: dlocalAuthHeader(apiKey, secretKey),
      ...(init?.headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as T & DLocalPaymentResponse;
  if (!res.ok) {
    const detail =
      typeof data.message === 'string'
        ? data.message
        : `dLocal API respondió ${res.status}`;
    throw new Error(detail);
  }

  return data;
}

function isPaidStatus(status: string): boolean {
  const normalized = status.trim().toUpperCase();
  return normalized === 'PAID' || normalized === 'COMPLETED' || normalized === 'APPROVED';
}

function verifyWebhookSignature(
  apiKey: string,
  secretKey: string,
  rawBody: string,
  authorizationHeader: string
): void {
  const match = authorizationHeader.match(/Signature:\s*([a-f0-9]+)/i);
  if (!match) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Webhook dLocal sin firma HMAC');
    }
    return;
  }

  const expected = createHmac('sha256', secretKey)
    .update(`${apiKey}${rawBody}`)
    .digest('hex');
  const received = match[1];

  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(received, 'utf8');
  if (expectedBuf.length !== receivedBuf.length || !timingSafeEqual(expectedBuf, receivedBuf)) {
    throw new Error('Firma de webhook dLocal inválida');
  }
}

export const dlocalGoPaymentProvider: InternationalPaymentProvider = {
  name: 'dlocal',

  async createCheckout(
    input: CreateInternationalPaymentInput
  ): Promise<CreateInternationalPaymentResult> {
    const marketConfig = getMarketConfig(input.market);
    const description = `Alcohn pedido ${input.orderId.slice(0, 8)}`.slice(0, 100);

    const payload = {
      currency: input.currency,
      amount: input.amount,
      country: marketConfig.countryIso2,
      order_id: input.orderId,
      description,
      success_url: input.successUrl,
      back_url: input.failureUrl,
      ...(input.notificationUrl ? { notification_url: input.notificationUrl } : {}),
      payer: {
        name: input.buyer.name.slice(0, 100),
        email: input.buyer.email.slice(0, 100),
        ...(input.buyer.phone ? { phone: input.buyer.phone.slice(0, 100) } : {}),
      },
    };

    const data = await dlocalRequest<DLocalPaymentResponse>('/v1/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!data.id || !data.redirect_url) {
      throw new Error('dLocal no devolvió redirect_url');
    }

    return {
      provider: 'dlocal',
      providerPaymentId: data.id,
      checkoutUrl: data.redirect_url,
      raw: data,
    };
  },

  async verifyWebhook(req: Request): Promise<VerifyInternationalPaymentWebhookResult> {
    const { apiKey, secretKey } = getDLocalConfig();
    const rawBody = await req.text();
    const authorizationHeader = req.headers.get('authorization') ?? '';

    verifyWebhookSignature(apiKey, secretKey, rawBody, authorizationHeader);

    let payload: { payment_id?: string };
    try {
      payload = JSON.parse(rawBody) as { payment_id?: string };
    } catch {
      throw new Error('Webhook dLocal con JSON inválido');
    }

    const paymentId = payload.payment_id?.trim();
    if (!paymentId) {
      throw new Error('payment_id ausente en webhook dLocal');
    }

    const payment = await dlocalRequest<DLocalPaymentResponse>(
      `/v1/payments/${encodeURIComponent(paymentId)}`
    );

    const orderId = String(payment.order_id ?? '').trim();
    if (!orderId) {
      throw new Error('order_id ausente en pago dLocal');
    }

    return {
      provider: 'dlocal',
      providerPaymentId: paymentId,
      orderId,
      paid: isPaidStatus(String(payment.status ?? '')),
      raw: payment,
    };
  },
};
