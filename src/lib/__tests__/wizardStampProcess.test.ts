import { describe, expect, it } from 'vitest';
import { wizardStampProcess } from '@/data/stampUseCases';
import { buildSellosInsertsFromCart } from '@/lib/supabase/sellosFromCart';
import type { CartItem } from '@/lib/cart';

function wizardLine(process: string): CartItem {
  return {
    id: 'personalizado-1-30x30mm',
    title: 'Sello personalizado (Pan, 30x30mm)',
    collection: 'Personalizado',
    material: 'Bronce',
    process,
    variantSize: '30x30mm',
    price: 80000,
    qty: 1,
    image: '',
    designSlug: 'personalizado-1',
  };
}

describe('wizardStampProcess', () => {
  it('pan, fruta y hielo van como alimento', () => {
    expect(wizardStampProcess('para-pan', 'alimentos')).toBe('Alimento');
    expect(wizardStampProcess('para-fruta', 'alimentos')).toBe('Alimento');
    expect(wizardStampProcess('para-hielo', 'alimentos')).toBe('Alimento');
    expect(wizardStampProcess(null, 'alimentos')).toBe('Alimento');
  });

  it('lacre va como lacre', () => {
    expect(wizardStampProcess('para-lacre', 'otros')).toBe('Lacre');
  });

  it('el resto queda clásico', () => {
    for (const slug of ['para-cuero', 'para-madera', 'para-jabon', 'para-ceramica', 'para-packaging']) {
      expect(wizardStampProcess(slug, 'otros')).toBe('CNC');
    }
    expect(wizardStampProcess(null, 'cuero')).toBe('CNC');
  });

  it('llega a sellos.tipo', () => {
    const tipo = (process: string) =>
      buildSellosInsertsFromCart('orden-1', [wizardLine(process)])[0].tipo;
    expect(tipo(wizardStampProcess('para-pan', 'alimentos'))).toBe('Alimento');
    expect(tipo(wizardStampProcess('para-lacre', 'otros'))).toBe('Lacre');
    expect(tipo(wizardStampProcess('para-cuero', 'cuero'))).toBe('Clasico');
  });
});
