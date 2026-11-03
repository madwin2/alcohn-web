import { describe, expect, it } from 'vitest';
import {
  buildWizardEntryKey,
  isWizardDraftWorthResuming,
  parseWizardDraft,
  WIZARD_DRAFT_TTL_MS,
  type WizardDraft,
} from '../wizardDraft';
import { detectBrowserKind } from '../browserKind';

const base: WizardDraft = {
  v: 1,
  savedAt: 1_000_000,
  entryKey: '/buy?mode=custom',
  step: 'logo',
  material: 'madera',
};

describe('buildWizardEntryKey', () => {
  it('ignora UTM, fbclid y retomar', () => {
    const params = new URLSearchParams(
      'mode=custom&utm_source=ig&utm_campaign=x&fbclid=abc&retomar=123'
    );
    expect(buildWizardEntryKey('/buy', params)).toBe('/buy?mode=custom');
  });

  it('distingue producto y mercado', () => {
    expect(buildWizardEntryKey('/mx/buy', new URLSearchParams('product=abc'))).toBe(
      '/mx/buy?product=abc'
    );
  });
});

describe('parseWizardDraft', () => {
  it('lee un avance vigente', () => {
    expect(parseWizardDraft(JSON.stringify(base), base.savedAt + 1000)?.material).toBe('madera');
  });

  it('descarta avances vencidos, rotos o de otra versión', () => {
    const later = base.savedAt + WIZARD_DRAFT_TTL_MS + 1;
    expect(parseWizardDraft(JSON.stringify(base), later)).toBeNull();
    expect(parseWizardDraft('{no json', base.savedAt)).toBeNull();
    expect(parseWizardDraft(JSON.stringify({ ...base, v: 2 }), base.savedAt)).toBeNull();
    expect(parseWizardDraft(JSON.stringify({ ...base, step: 'payment' }), base.savedAt)).toBeNull();
  });
});

describe('isWizardDraftWorthResuming', () => {
  it('pide material y algo más que el primer paso', () => {
    expect(isWizardDraftWorthResuming(base)).toBe(true);
    expect(isWizardDraftWorthResuming({ ...base, material: undefined })).toBe(false);
    expect(isWizardDraftWorthResuming({ ...base, step: 'material' })).toBe(false);
  });
});

describe('detectBrowserKind', () => {
  it('reconoce los navegadores internos de Instagram y Facebook', () => {
    expect(
      detectBrowserKind(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 330.0.0'
      )
    ).toBe('instagram');
    expect(
      detectBrowserKind('Mozilla/5.0 (Linux; Android 14) Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/450.0]')
    ).toBe('facebook');
    expect(detectBrowserKind('Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile Safari/537.36')).toBe(
      'movil'
    );
    expect(detectBrowserKind('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130')).toBe('desktop');
  });
});
