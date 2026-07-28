import { dlocalGoPaymentProvider } from './dlocalGoProvider';
import { mockInternationalPaymentProvider } from './mockProvider';
import type { InternationalPaymentProvider } from './types';

export function getInternationalPaymentProvider(): InternationalPaymentProvider {
  const provider = process.env.INTERNATIONAL_PAYMENT_PROVIDER?.trim().toLowerCase();

  if (!provider || provider === 'mock') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('INTERNATIONAL_PAYMENT_PROVIDER must be configured in production');
    }
    return mockInternationalPaymentProvider;
  }

  if (provider === 'dlocal') {
    return dlocalGoPaymentProvider;
  }

  throw new Error(`Unsupported international payment provider: ${provider}`);
}
