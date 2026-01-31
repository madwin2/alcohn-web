// Configuración de la aplicación
// TODO: Mover estos valores a variables de entorno en producción

export const config = {
  whatsapp: {
    number: '5492230000000', // TODO: Reemplazar con número real de WhatsApp
    message: {
      base: 'Hola Alcohn 👋, vi la web y quiero un sello de bronce.',
    },
  },
  shipping: {
    domicilio: 8000, // TODO: Confirmar precio exacto
    sucursal: 5000, // TODO: Confirmar precio exacto
  },
  production: {
    days: 10, // Días hábiles de producción
  },
  seña: {
    amount: 10000, // Seña inicial
  },
  bank: {
    // TODO: Reemplazar con datos bancarios reales
    name: 'Banco [Nombre]',
    accountType: 'Cuenta Corriente',
    accountNumber: '0000000000000000000000',
    cbu: '0000000000000000000000',
    alias: 'ALCOHN.SELLOS',
    cuit: '00-00000000-0',
  },
};





