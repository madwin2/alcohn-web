'use client';

import { trackEvent } from './client';
import { trackMetaCustomEvent } from './metaPixel';

export const WIZARD_STEP_KEYS = [
  'material',
  'logo',
  'contact',
  'preview',
  'size',
  'payment',
] as const;

export type WizardStepKey = (typeof WIZARD_STEP_KEYS)[number];

export const WIZARD_STEPS: ReadonlyArray<{ label: string; key: WizardStepKey }> = [
  { label: 'Material', key: 'material' },
  { label: 'Logo', key: 'logo' },
  { label: 'Contacto', key: 'contact' },
  { label: 'Vista previa', key: 'preview' },
  { label: 'Medida', key: 'size' },
  { label: 'Pago', key: 'payment' },
];

export function getWizardStepIndex(key: WizardStepKey): number {
  return WIZARD_STEP_KEYS.indexOf(key);
}

export function getWizardStepKey(index: number): WizardStepKey | undefined {
  return WIZARD_STEP_KEYS[index];
}

export type TrackWizardStepParams = {
  stepIndex: number;
  stepKey: WizardStepKey;
  stepLabel: string;
  mode?: string | null;
  mockupSolicitudId?: string | null;
  webSessionId?: string | null;
};

export function trackWizardStep(params: TrackWizardStepParams): void {
  const metadata: Record<string, unknown> = {
    step_index: params.stepIndex,
    step_key: params.stepKey,
    step_label: params.stepLabel,
    wizard_mode: params.mode ?? 'custom',
  };

  if (params.mockupSolicitudId) {
    metadata.mockup_solicitud_id = params.mockupSolicitudId;
  }
  if (params.webSessionId) {
    metadata.web_session_id = params.webSessionId;
  }

  void trackEvent('wizard_step', { metadata });

  trackMetaCustomEvent('WizardStep', {
    step_index: params.stepIndex,
    step_key: params.stepKey,
    step_label: params.stepLabel,
    wizard_mode: params.mode ?? 'custom',
  });
}
