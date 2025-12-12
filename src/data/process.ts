export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Nos enviás tu logo",
    description: "Foto, dibujo o archivo digital. Cualquier formato sirve.",
  },
  {
    step: 2,
    title: "Te armamos una muestra digital",
    description: "Mockup de cómo quedaría tu sello antes de fabricarlo.",
  },
  {
    step: 3,
    title: "Confirmás medida y forma de uso",
    description: "Calor, presión, material. Te asesoramos si hace falta.",
  },
  {
    step: 4,
    title: "Fabricamos el sello en CNC",
    description: "Precisión milimétrica en nuestro taller de Mar del Plata.",
  },
  {
    step: 5,
    title: "Te lo enviamos",
    description: "Por Correo Argentino a sucursal o domicilio.",
  },
  {
    step: 6,
    title: "Lo usás",
    description: "Listo para marcar cuero, madera, alimentos o lo que necesites.",
  },
];





