'use client';

import { useEffect, useState } from 'react';
import { peekPurchaseSnapshot } from '@/lib/analytics/purchaseSnapshot';
import {
  ESTIMATED_DELIVERY_DAYS_AR,
  ESTIMATED_DELIVERY_DAYS_INTERNATIONAL,
  GOOGLE_MERCHANT_ID,
  estimatedDeliveryDate,
} from '@/lib/analytics/googleCustomerReviews';

type GapiSurveyOptIn = {
  load: (name: string, cb: () => void) => void;
  surveyoptin: { render: (options: Record<string, unknown>) => void };
};

declare global {
  interface Window {
    gapi?: GapiSurveyOptIn;
    renderOptIn?: () => void;
  }
}

type GoogleCustomerReviewsOptInProps = {
  orderId: string | null;
  /** Código ISO de 2 letras del país de entrega (AR, CL, PE, CO, MX). */
  deliveryCountry: string;
};

/**
 * Encuesta de aceptación de Reseñas de Clientes en Google en la página de pedido confirmado.
 * Google le pregunta al comprador si quiere opinar y le manda la encuesta después de la entrega.
 * Sin email del pedido no se muestra (Google lo exige).
 */
export default function GoogleCustomerReviewsOptIn({
  orderId,
  deliveryCountry,
}: GoogleCustomerReviewsOptInProps) {
  // Se lee en el primer render, antes de que la página consuma el snapshot para el tracking.
  const [email] = useState(() => (orderId ? peekPurchaseSnapshot(orderId)?.email : undefined));

  useEffect(() => {
    if (!orderId || !email) return;

    const days =
      deliveryCountry === 'AR' ? ESTIMATED_DELIVERY_DAYS_AR : ESTIMATED_DELIVERY_DAYS_INTERNATIONAL;

    window.renderOptIn = () => {
      window.gapi?.load('surveyoptin', () => {
        window.gapi?.surveyoptin.render({
          merchant_id: GOOGLE_MERCHANT_ID,
          order_id: orderId,
          email,
          delivery_country: deliveryCountry,
          estimated_delivery_date: estimatedDeliveryDate(days),
          opt_in_style: 'CENTER_DIALOG',
        });
      });
    };

    if (document.getElementById('google-customer-reviews')) {
      window.renderOptIn();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-customer-reviews';
    script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [orderId, email, deliveryCountry]);

  return null;
}
