/**
 * Sincronización del BuyWizard con Supabase (vía API routes).
 * Errores se registran en consola; el flujo del wizard sigue aunque falle el sync.
 */

import {
  createMockupSolicitud,
  patchMockupSolicitud,
  uploadMockupImage,
  upsertCliente,
  type MockupUploadKind,
} from '@/lib/supabase/mockupApiClient';
import { saveWizardSupabaseSession } from '@/lib/wizardSupabaseSession';

type WizardMaterial = 'cuero' | 'madera' | 'ambos' | 'ceramica' | 'alimentos' | 'otros';

export async function syncWizardContact(
  nombre: string,
  whatsapp: string,
  email: string,
  webSessionId: string
): Promise<string | null> {
  try {
    const { id } = await upsertCliente({ nombre, telefono: whatsapp, email });
    saveWizardSupabaseSession({ web_session_id: webSessionId, cliente_id: id });
    return id;
  } catch (err) {
    console.error('[wizard] upsert cliente', err);
    return null;
  }
}

export async function ensureMockupSolicitud(
  clienteId: string | null,
  material: WizardMaterial,
  opts: {
    nombre?: string;
    whatsapp?: string;
    email?: string;
    webSessionId: string;
    mockupSolicitudId?: string | null;
  }
): Promise<string | null> {
  if (opts.mockupSolicitudId) {
    saveWizardSupabaseSession({
      web_session_id: opts.webSessionId,
      cliente_id: clienteId ?? undefined,
      mockup_solicitud_id: opts.mockupSolicitudId,
    });
    if (clienteId) {
      try {
        await patchMockupSolicitud(opts.mockupSolicitudId, { cliente_id: clienteId });
      } catch (err) {
        console.error('[wizard] patch mockup cliente', err);
      }
    }
    return opts.mockupSolicitudId;
  }

  try {
    const { id } = await createMockupSolicitud({
      cliente_id: clienteId ?? undefined,
      material,
      nombre_muestra: opts.nombre,
      whatsapp: opts.whatsapp,
      email: opts.email,
      web_session_id: opts.webSessionId,
    });
    saveWizardSupabaseSession({
      web_session_id: opts.webSessionId,
      cliente_id: clienteId ?? undefined,
      mockup_solicitud_id: id,
    });
    return id;
  } catch (err) {
    console.error('[wizard] create mockup solicitud', err);
    return null;
  }
}

export async function syncWizardLogos(
  mockupId: string,
  logoOriginal: string,
  logoOptimized?: string
): Promise<void> {
  try {
    await uploadMockupImage(mockupId, 'logo_original', logoOriginal);
    if (logoOptimized && logoOptimized !== logoOriginal) {
      await uploadMockupImage(mockupId, 'logo_optimizado', logoOptimized);
    }
  } catch (err) {
    console.error('[wizard] upload logos', err);
  }
}

function mockupKindsForMaterial(material: WizardMaterial): MockupUploadKind[] {
  switch (material) {
    case 'madera':
      return ['mockup_madera'];
    case 'ambos':
      return ['mockup_cuero', 'mockup_madera'];
    default:
      return ['mockup_cuero'];
  }
}

export async function syncWizardMockupPreview(
  mockupId: string,
  material: WizardMaterial,
  mockupDataUrl: string,
  cotizacion?: { size: string; price?: number; approximateSizeKey?: string }
): Promise<void> {
  try {
    const kinds = mockupKindsForMaterial(material);
    for (const kind of kinds) {
      await uploadMockupImage(mockupId, kind, mockupDataUrl);
    }
    await patchMockupSolicitud(mockupId, {
      estado: 'completado',
      medidas_cotizacion_json: cotizacion ?? null,
    });
  } catch (err) {
    console.error('[wizard] sync mockup preview', err);
  }
}

export async function markMockupPendingApproval(mockupId: string): Promise<void> {
  try {
    await patchMockupSolicitud(mockupId, { estado: 'pendiente_aprobacion' });
  } catch (err) {
    console.error('[wizard] pendiente_aprobacion', err);
  }
}

export async function markCheckoutStarted(mockupId: string, carritoJson: unknown): Promise<void> {
  try {
    await patchMockupSolicitud(mockupId, {
      checkout_iniciado_at: new Date().toISOString(),
      carrito_json: carritoJson,
    });
  } catch (err) {
    console.error('[wizard] checkout_iniciado', err);
  }
}
