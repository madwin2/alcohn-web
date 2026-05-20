export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: 'Nos enviás tu logo',
    description:
      'Elegís el material a marcar y subís tu logo. Nuestro sistema inteligente lo procesa, verifica que sea factible de fabricar y lo prepara para generar la muestra.',
  },
  {
    step: 2,
    title: 'Ves cómo quedaría',
    description:
      'En minutos podés ver cómo quedaría en el material que elegiste. Te ayuda a verificar que el diseño esté bien y sea lo que vos querés.',
  },
  {
    step: 3,
    title: 'Confirmás medida y forma de pago',
    description:
      'El sistema te muestra las medidas posibles para tu sello. Elegís la que querés y luego el método de pago: transferencia o tarjeta de forma segura con la aplicación del Banco BBVA, que acepta todas las tarjetas.',
  },
  {
    step: 4,
    title: 'Fabricamos el sello en CNC',
    description:
      'Precisión milimétrica en nuestro taller de Mar del Plata. Se prueba, se verifica y te enviamos una foto para que veas cómo quedó.',
  },
  {
    step: 5,
    title: 'Te lo enviamos',
    description: 'Por correo a domicilio o sucursal, según tu preferencia.',
  },
  {
    step: 6,
    title: 'Lo usás',
    description:
      'Te llega listo para usar en el material que quieras. Después de la compra tenés a nuestro equipo para asesorarte y ayudarte cuando lo necesites.',
  },
];
