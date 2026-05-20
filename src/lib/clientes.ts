// Datos extraídos de las capturas "data" (perfil de Instagram de cada cliente)

export interface ClienteData {
  nombre: string;
  instagram?: string;
}

export interface Cliente {
  nombre: string;
  imagenes: string[];
  data: ClienteData;
}

export const clientesData: Record<string, ClienteData> = {
  amano: {
    nombre: 'Amano',
    instagram: '@amano.salta',
  },
  artemisa: {
    nombre: 'Artemisa',
    instagram: '@universo.artemisa',
  },
  elfaro: {
    nombre: 'El Faro',
    instagram: '@elfaro.ef',
  },
  elpasuco: {
    nombre: 'El Pasuco',
    instagram: '@el_pasuco',
  },
  elpicahueso: {
    nombre: 'Pica Hueso',
    instagram: '@el_pica_hueso',
  },
  gorila: {
    nombre: 'Good Gorilla',
    instagram: '@goodgorillaok',
  },
  hyn: {
    nombre: 'Here&Now - Accesorios',
    instagram: '@hn.leatherworks',
  },
  luy: {
    nombre: 'Alejandro Luy',
    instagram: '@alejandro_luy',
  },
  monk: {
    nombre: 'Monk',
    instagram: '@monk.tabaco',
  },
  'sabor a roble': {
    nombre: 'Sabor a Roble',
    instagram: '@saboraroble',
  },
  weberly: {
    nombre: 'Weberly Knives',
    instagram: '@weberlyknives',
  },
};

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
    
    return {
      nombre,
      imagenes,
      data: clientesData[nombreNormalizado] || {
        nombre,
      },
    };
  });
}
