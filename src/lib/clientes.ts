// Datos de clientes extraídos de las imágenes
// La información viene de las imágenes "data" en public/images/clientes

export interface ClienteData {
  nombre: string;
  instagram?: string;
  paginaWeb?: string;
  logo?: string;
}

export interface Cliente {
  nombre: string;
  imagenes: string[]; // [sin numero, 1, 2]
  imagenData: string; // imagen con "data"
  data: ClienteData;
}

// Mapeo manual de datos de clientes basado en las imágenes disponibles
// Estos datos deberían venir de las imágenes "data", pero por ahora los definimos aquí
// TODO: Actualizar estos datos según la información real de las imágenes "data"
export const clientesData: Record<string, ClienteData> = {
  amano: {
    nombre: 'Amano',
    instagram: '@amano',
  },
  artemisa: {
    nombre: 'Artemisa',
    instagram: '@artemisa',
  },
  elfaro: {
    nombre: 'El Faro',
    instagram: '@elfaro',
  },
  elpasuco: {
    nombre: 'El Pasuco',
    instagram: '@elpasuco',
  },
  elpicahueso: {
    nombre: 'El Pica Hueso',
    instagram: '@elpicahueso',
  },
  gorila: {
    nombre: 'Gorila',
    instagram: '@gorila',
  },
  hyn: {
    nombre: 'HYN',
    instagram: '@hyn',
  },
  luy: {
    nombre: 'Luy',
    instagram: '@luy',
  },
  monk: {
    nombre: 'Monk',
    instagram: '@monk',
  },
  'sabor a roble': {
    nombre: 'Sabor a Roble',
    instagram: '@saboraroble',
  },
  weberly: {
    nombre: 'Weberly',
    instagram: '@weberly',
  },
};

// Función para obtener la lista de clientes con sus imágenes
export function getClientes(): Cliente[] {
  const nombresClientes = [
    'amano',
    'artemisa',
    'elfaro',
    'elpasuco',
    'elpicahueso',
    'gorila',
    'hyn',
    'luy',
    'monk',
    'sabor a roble',
    'weberly',
  ];

  return nombresClientes.map((nombre) => {
    const nombreNormalizado = nombre.toLowerCase();
    // Mantener el nombre del archivo tal como está en el sistema de archivos
    const nombreArchivo = nombre;
    
    const imagenes = [
      `/images/clientes/${nombreArchivo}.png`,
      `/images/clientes/${nombreArchivo}1.png`,
      `/images/clientes/${nombreArchivo}2.png`,
    ];
    
    const imagenData = `/images/clientes/${nombreArchivo} data.png`;
    
    return {
      nombre,
      imagenes,
      imagenData,
      data: clientesData[nombreNormalizado] || {
        nombre,
        instagram: `@${nombreNormalizado.replace(/\s+/g, '')}`,
      },
    };
  });
}
