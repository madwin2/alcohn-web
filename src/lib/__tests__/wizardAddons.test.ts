import { describe, expect, it } from 'vitest';
import { getAccessoryBySlug, getAccessoryLinkPrice, getAccessoryTransferPrice } from '@/data/accessories';
import {
  buildWizardAddonCartLine,
  getWizardAddonSuggestion,
  resolveWizardAddon,
} from '../wizardAddons';

describe('complemento sugerido en el generador', () => {
  it('sugiere según el material', () => {
    expect(getWizardAddonSuggestion('madera')?.primary).toBe('calentador-electrico');
    expect(getWizardAddonSuggestion('cuero', { width: 25, height: 25 })).toEqual({
      primary: 'mango-de-golpe',
      alternative: 'base-aluminio-remachadora',
    });
    expect(getWizardAddonSuggestion('ceramica')).toBeNull();
    expect(getWizardAddonSuggestion('ambos')).toBeNull();
    expect(getWizardAddonSuggestion(undefined)).toBeNull();
  });

  it('en cuero con sello de más de 3×3 cm sugiere la base para remachadora', () => {
    expect(getWizardAddonSuggestion('cuero', { width: 40, height: 25 })).toEqual({
      primary: 'base-aluminio-remachadora',
    });
  });

  it('arma la línea de carrito igual que la ficha del accesorio', () => {
    for (const slug of ['calentador-electrico', 'mango-de-golpe', 'base-aluminio-remachadora']) {
      const addon = resolveWizardAddon(slug);
      const accessory = getAccessoryBySlug(slug)!;
      expect(addon).not.toBeNull();
      const card = buildWizardAddonCartLine(addon!, 'Openpay');
      const transfer = buildWizardAddonCartLine(addon!, 'Transferencia');
      expect(card).toMatchObject({
        title: accessory.title,
        collection: 'Accesorios',
        material: 'Accesorio',
        process: '—',
        designSlug: slug,
        image: accessory.image,
        price: getAccessoryLinkPrice(accessory),
      });
      expect(transfer.price).toBe(getAccessoryTransferPrice(accessory));
    }
  });

  it('el calentador usa la variante en stock como variantSize', () => {
    const addon = resolveWizardAddon('calentador-electrico');
    expect(addon?.variantLabel).toBe('Sin regulador');
  });
});
