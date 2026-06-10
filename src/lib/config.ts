// Configuración de la aplicación
// TODO: Mover estos valores a variables de entorno en producción

export const config = {
  whatsapp: {
    number: '5492236209554',
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
    name: 'BBVA',
    accountType: 'Caja de Ahorro',
    accountNumber: '90-495078/8',
    cbu: '0170090940000049507885',
    alias: 'ALCOHN.SELLOS',
    titular: 'MORENO JULIAN',
    cuit: '20-41306528-4',
  },
};







