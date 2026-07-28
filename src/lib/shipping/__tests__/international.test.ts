import { describe, expect, it } from 'vitest';
import { validateInternationalShippingForm } from '../international';

describe('international shipping', () => {
  it('requires DHL destination address fields', () => {
    const errors = validateInternationalShippingForm('cl', {
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
    });

    expect(errors.nombreCompleto).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.telefono).toBeTruthy();
    expect(errors.direccion1).toBeTruthy();
    expect(errors.region).toBeTruthy();
    expect(errors.ciudad).toBeTruthy();
    expect(errors.codigoPostal).toBeTruthy();
  });

  it('accepts optional document and address line 2', () => {
    const errors = validateInternationalShippingForm('mx', {
      nombreCompleto: 'Juan Perez',
      email: 'juan@example.com',
      telefono: '+52 55 1234 5678',
      documento: '',
      direccion1: 'Av Reforma 123',
      direccion2: '',
      region: 'Ciudad de Mexico',
      ciudad: 'Cuauhtemoc',
      distrito: 'Centro',
      codigoPostal: '06000',
      notasDhl: '',
    });

    expect(errors).toEqual({});
  });
});
