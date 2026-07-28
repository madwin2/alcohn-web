import { getMarketConfig, isInternationalMarket } from '@/lib/markets/config';
import type { InternationalMarketCode } from '@/lib/markets/types';

export interface InternationalShippingFormData {
  nombreCompleto: string;
  email: string;
  telefono: string;
  documento: string;
  direccion1: string;
  direccion2: string;
  region: string;
  ciudad: string;
  distrito: string;
  codigoPostal: string;
  notasDhl: string;
}

export function emptyInternationalShippingForm(): InternationalShippingFormData {
  return {
    nombreCompleto: '',
    email: '',
    telefono: '',
    documento: '',
    direccion1: '',
    direccion2: '',
    region: '',
    ciudad: '',
    distrito: '',
    codigoPostal: '',
    notasDhl: '',
  };
}

export function getDhlShippingAmount(market: InternationalMarketCode): number {
  return getMarketConfig(market).dhlShippingAmount;
}

export function validateInternationalShippingForm(
  market: InternationalMarketCode,
  form: InternationalShippingFormData
): Record<string, string> {
  if (!isInternationalMarket(market)) return { market: 'País no soportado' };

  const errors: Record<string, string> = {};
  if (!form.nombreCompleto.trim()) errors.nombreCompleto = 'Ingresá nombre completo';
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Ingresá un email válido';
  }
  const phone = form.telefono.replace(/[\s\-()]/g, '');
  if (!phone || !/^\+?[0-9]{8,15}$/.test(phone)) {
    errors.telefono = 'Ingresá un teléfono válido para DHL';
  }
  if (!form.direccion1.trim()) errors.direccion1 = 'Ingresá dirección';
  if (!form.region.trim()) {
    errors.region = `Ingresá ${getMarketConfig(market).addressLabels.region.toLowerCase()}`;
  }
  if (!form.ciudad.trim()) {
    errors.ciudad = `Ingresá ${getMarketConfig(market).addressLabels.city.toLowerCase()}`;
  }
  if (!form.codigoPostal.trim()) errors.codigoPostal = 'Ingresá código postal';
  return errors;
}
