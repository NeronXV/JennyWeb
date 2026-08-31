import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchAlumnosFromSupabase,
  upsertAlumnoToSupabase,
  deleteAlumnoFromSupabase,
  fetchAsistenciasFromSupabase,
  saveAsistenciaToSupabase,
  fetchLotesFromSupabase,
  upsertLoteToSupabase,
  fetchProductosFromSupabase,
  upsertProductoToSupabase,
  deleteProductoFromSupabase,
  fetchVentasFromSupabase,
  insertVentaToSupabase
} from '../services/supabaseService';

// --- TYPES ---

export interface Alumno {
  id: string;
  nombre: string;
  curp: string;
  sexo: 'M' | 'F';
  fechaNacimiento: string;
  grado: string;
  grupo: string;
  promedio: number;
  asistenciasCount: number;
  faltasCount: number;
  retardosCount: number;
  calificaciones: {
    [campoId: string]: {
      actividades: number[];
      tareas: number[];
      examen: number | null;
    };
  };
}

export type AsistenciaStatus = 'presente' | 'retardo' | 'falta';

export interface AsistenciaRegistro {
  fecha: string; // YYYY-MM-DD
  status: { [alumnoId: string]: AsistenciaStatus };
}

export interface CampoFormativo {
  id: string;
  nombre: string;
  tieneExamen: boolean;
}

export interface PorcentajeConfig {
  actividades: number;
  tareas: number;
  examen: number;
}

export interface Lote {
  id: string;
  nombre: string;
  fecha: string;
  inversion: number;
  ventas: number;
  ganancia: number;
  productosRestantes: number;
  estado: 'Activo' | 'Completado';
}

export interface Producto {
  id: string;
  descripcion: string;
  categoria: string;
  talla: string;
  costo: number;
  precio: number;
  cantidad: number;
  loteId: string;
  notas: string;
  estado: 'Disponible' | 'Vendido' | 'Apartado';
  foto: string | null;
}

export interface Venta {
  id: string;
  productoId: string;
  precioFinal: number;
  cliente: string;
  formaPago: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Pendiente';
  fecha: string;
}

export type ViewType = 
  | 'login'
  | 'hub'
  | 'escolar-dashboard'
  | 'escolar-alumnos'
  | 'escolar-asistencia'
  | 'escolar-campos'
  | 'escolar-actividades'
  | 'escolar-porcentajes'
  | 'escolar-concentrado'
  | 'negocio-dashboard'
  | 'negocio-lotes'
  | 'negocio-registrar-producto'
  | 'negocio-inventario'
  | 'negocio-pos'
  | 'negocio-detalle-lote'
  | 'reportes';

interface AppContextProps {
  currentView: ViewType;
  selectedStudentId: string | null;
  selectedBatchId: string | null;
  selectedCampoId: string | null;
  
  // Navigation
  navigateTo: (view: ViewType, options?: { studentId?: string; batchId?: string; campoId?: string }) => void;
  goBack: () => void;

  // User Session
  userEmail: string;
  userName: string;
  setUserEmail: (email: string) => void;
  setUserName: (name: string) => void;
  logout: () => void;

  // Cloud status
  isCloudConnected: boolean;
  isSyncing: boolean;

  // School Data
  alumnos: Alumno[];
  asistencia: AsistenciaRegistro[];
  camposFormativos: CampoFormativo[];
  porcentajes: { [campoId: string]: PorcentajeConfig };
  cicloEscolar: string;
  grado: string;
  grupo: string;
  trimestre: string;
  
  setCicloEscolar: (val: string) => void;
  setGrado: (val: string) => void;
  setGrupo: (val: string) => void;
  setTrimestre: (val: string) => void;
  
  addAlumno: (alumno: Omit<Alumno, 'id' | 'promedio' | 'asistenciasCount' | 'faltasCount' | 'retardosCount' | 'calificaciones'>) => void;
  deleteAlumno: (id: string) => void;
  saveAsistencia: (fecha: string, status: { [alumnoId: string]: AsistenciaStatus }) => void;
  updateCalificacion: (campoId: string, alumnoId: string, tipo: 'actividades' | 'tareas' | 'examen', index: number, value: number) => void;
  addColumnaCalificacion: (campoId: string, tipo: 'actividades' | 'tareas') => void;
  savePorcentajes: (campoId: string, config: PorcentajeConfig) => void;

  // Business Data
  lotes: Lote[];
  productos: Producto[];
  ventas: Venta[];
  
  addLote: (lote: Omit<Lote, 'id' | 'ventas' | 'ganancia' | 'productosRestantes'>) => void;
  addProducto: (producto: Omit<Producto, 'id'>) => void;
  registrarVenta: (venta: Omit<Venta, 'id' | 'fecha'>) => void;
  eliminarProducto: (id: string) => boolean;

  // Persistence management
  resetToDefaultData: () => void;
}

// --- DEFAULT INITIAL SEED DATA ---

const DEFAULT_ALUMNOS: Alumno[] = [
  {
    id: 'a1',
    nombre: 'Ana Martínez López',
    curp: 'MALA160412HDFRRN09',
    sexo: 'F',
    fechaNacimiento: '2016-04-12',
    grado: '5.º',
    grupo: 'A',
    promedio: 8.8,
    asistenciasCount: 54,
    faltasCount: 2,
    retardosCount: 1,
    calificaciones: {
      'lenguajes': { actividades: [9, 10, 8], tareas: [9, 10, 9, 9], examen: 8 },
      'saberes': { actividades: [8, 9, 8], tareas: [9, 8, 9, 10], examen: 9 },
      'etica': { actividades: [10, 9, 10], tareas: [9, 10, 10, 9], examen: null },
      'humano': { actividades: [9, 9, 10], tareas: [10, 9, 9, 9], examen: null },
    }
  },
  {
    id: 'a2',
    nombre: 'Carlos Hernández Ruiz',
    curp: 'HERC160822HDFRRZ01',
    sexo: 'M',
    fechaNacimiento: '2016-08-22',
    grado: '5.º',
    grupo: 'A',
    promedio: 8.3,
    asistenciasCount: 52,
    faltasCount: 4,
    retardosCount: 1,
    calificaciones: {
      'lenguajes': { actividades: [7, 8, 9], tareas: [8, 9, 8, 9], examen: 9 },
      'saberes': { actividades: [8, 7, 9], tareas: [8, 8, 9, 8], examen: 8 },
      'etica': { actividades: [8, 8, 9], tareas: [9, 8, 8, 9], examen: null },
      'humano': { actividades: [9, 8, 8], tareas: [8, 9, 9, 9], examen: null },
    }
  },
  {
    id: 'a3',
    nombre: 'Mariana García Pérez',
    curp: 'GAPM160105MDFRRN05',
    sexo: 'F',
    fechaNacimiento: '2016-01-05',
    grado: '5.º',
    grupo: 'A',
    promedio: 9.4,
    asistenciasCount: 56,
    faltasCount: 0,
    retardosCount: 1,
    calificaciones: {
      'lenguajes': { actividades: [10, 9, 10], tareas: [10, 10, 9, 10], examen: 10 },
      'saberes': { actividades: [9, 10, 9], tareas: [10, 9, 10, 9], examen: 9 },
      'etica': { actividades: [10, 10, 9], tareas: [10, 10, 10, 10], examen: null },
      'humano': { actividades: [9, 10, 10], tareas: [10, 10, 9, 10], examen: null },
    }
  },
  {
    id: 'a4',
    nombre: 'Diego Castro Molina',
    curp: 'CAMD161130HDFSLN02',
    sexo: 'M',
    fechaNacimiento: '2016-11-30',
    grado: '5.º',
    grupo: 'A',
    promedio: 7.9,
    asistenciasCount: 50,
    faltasCount: 6,
    retardosCount: 1,
    calificaciones: {
      'lenguajes': { actividades: [8, 7, 7], tareas: [8, 7, 8, 7], examen: 8 },
      'saberes': { actividades: [7, 8, 7], tareas: [7, 8, 8, 7], examen: 8 },
      'etica': { actividades: [8, 7, 8], tareas: [8, 8, 7, 8], examen: null },
      'humano': { actividades: [8, 8, 8], tareas: [7, 8, 8, 8], examen: null },
    }
  },
  {
    id: 'a5',
    nombre: 'Sofía Romero Díaz',
    curp: 'RODS160714MDFMRN08',
    sexo: 'F',
    fechaNacimiento: '2016-07-14',
    grado: '5.º',
    grupo: 'A',
    promedio: 9.1,
    asistenciasCount: 55,
    faltasCount: 1,
    retardosCount: 1,
    calificaciones: {
      'lenguajes': { actividades: [9, 9, 9], tareas: [9, 10, 9, 9], examen: 9 },
      'saberes': { actividades: [9, 9, 8], tareas: [9, 9, 10, 9], examen: 10 },
      'etica': { actividades: [10, 9, 9], tareas: [9, 9, 9, 10], examen: null },
      'humano': { actividades: [9, 9, 9], tareas: [9, 10, 9, 10], examen: null },
    }
  },
  {
    id: 'a6',
    nombre: 'Luis Torres Medina',
    curp: 'TOML160228HDFRRN01',
    sexo: 'M',
    fechaNacimiento: '2016-02-28',
    grado: '5.º',
    grupo: 'A',
    promedio: 8.6,
    asistenciasCount: 53,
    faltasCount: 3,
    retardosCount: 0,
    calificaciones: {
      'lenguajes': { actividades: [8, 8, 8], tareas: [9, 9, 8, 9], examen: 9 },
      'saberes': { actividades: [9, 8, 8], tareas: [8, 9, 8, 9], examen: 8 },
      'etica': { actividades: [9, 9, 9], tareas: [9, 9, 9, 8], examen: null },
      'humano': { actividades: [9, 8, 9], tareas: [9, 9, 9, 9], examen: null },
    }
  },
  {
    id: 'a7',
    nombre: 'Valeria Ortiz Cruz',
    curp: 'OICV160515MDFRRN04',
    sexo: 'F',
    fechaNacimiento: '2016-05-15',
    grado: '5.º',
    grupo: 'A',
    promedio: 9.3,
    asistenciasCount: 56,
    faltasCount: 0,
    retardosCount: 0,
    calificaciones: {
      'lenguajes': { actividades: [10, 9, 10], tareas: [10, 9, 10, 10], examen: 9 },
      'saberes': { actividades: [9, 10, 9], tareas: [10, 10, 9, 9], examen: 9 },
      'etica': { actividades: [10, 10, 9], tareas: [9, 10, 10, 10], examen: null },
      'humano': { actividades: [9, 10, 10], tareas: [10, 10, 10, 9], examen: null },
    }
  },
  {
    id: 'a8',
    nombre: 'Javier Flores Silva',
    curp: 'FISJ161011HDFRRS06',
    sexo: 'M',
    fechaNacimiento: '2016-10-11',
    grado: '5.º',
    grupo: 'A',
    promedio: 8.0,
    asistenciasCount: 51,
    faltasCount: 4,
    retardosCount: 2,
    calificaciones: {
      'lenguajes': { actividades: [8, 8, 7], tareas: [8, 8, 7, 8], examen: 8 },
      'saberes': { actividades: [7, 7, 8], tareas: [7, 8, 8, 8], examen: 8 },
      'etica': { actividades: [8, 8, 8], tareas: [8, 8, 8, 7], examen: null },
      'humano': { actividades: [8, 8, 9], tareas: [8, 8, 8, 8], examen: null },
    }
  },
  {
    id: 'a9',
    nombre: 'Camila Gómez Juárez',
    curp: 'GOJC161205MDFRRN03',
    sexo: 'F',
    fechaNacimiento: '2016-12-05',
    grado: '5.º',
    grupo: 'A',
    promedio: 8.9,
    asistenciasCount: 54,
    faltasCount: 2,
    retardosCount: 0,
    calificaciones: {
      'lenguajes': { actividades: [9, 8, 9], tareas: [9, 9, 9, 9], examen: 9 },
      'saberes': { actividades: [8, 9, 9], tareas: [9, 9, 8, 9], examen: 9 },
      'etica': { actividades: [9, 9, 9], tareas: [9, 9, 9, 9], examen: null },
      'humano': { actividades: [9, 9, 9], tareas: [9, 9, 9, 9], examen: null },
    }
  },
  {
    id: 'a10',
    nombre: 'Mateo Ramírez Mendoza',
    curp: 'RAMM160309HDFRRN02',
    sexo: 'M',
    fechaNacimiento: '2016-03-09',
    grado: '5.º',
    grupo: 'A',
    promedio: 8.5,
    asistenciasCount: 53,
    faltasCount: 2,
    retardosCount: 2,
    calificaciones: {
      'lenguajes': { actividades: [8, 8, 8], tareas: [8, 9, 8, 9], examen: 8 },
      'saberes': { actividades: [8, 8, 9], tareas: [9, 8, 9, 9], examen: 9 },
      'etica': { actividades: [8, 9, 8], tareas: [9, 8, 9, 8], examen: null },
      'humano': { actividades: [9, 8, 8], tareas: [9, 8, 8, 9], examen: null },
    }
  },
  {
    id: 'a11',
    nombre: 'Valentina Sánchez Vega',
    curp: 'SAVV160918MDFRRN07',
    sexo: 'F',
    fechaNacimiento: '2016-09-18',
    grado: '5.º',
    grupo: 'A',
    promedio: 9.6,
    asistenciasCount: 57,
    faltasCount: 0,
    retardosCount: 0,
    calificaciones: {
      'lenguajes': { actividades: [10, 10, 9], tareas: [10, 10, 10, 10], examen: 10 },
      'saberes': { actividades: [10, 9, 10], tareas: [10, 10, 9, 10], examen: 10 },
      'etica': { actividades: [10, 10, 10], tareas: [10, 10, 10, 10], examen: null },
      'humano': { actividades: [10, 9, 10], tareas: [10, 10, 10, 10], examen: null },
    }
  },
  {
    id: 'a12',
    nombre: 'Santiago Díaz Castro',
    curp: 'DICS160601HDFRRN06',
    sexo: 'M',
    fechaNacimiento: '2016-06-01',
    grado: '5.º',
    grupo: 'A',
    promedio: 8.2,
    asistenciasCount: 52,
    faltasCount: 3,
    retardosCount: 2,
    calificaciones: {
      'lenguajes': { actividades: [8, 8, 7], tareas: [8, 7, 8, 8], examen: 8 },
      'saberes': { actividades: [8, 7, 8], tareas: [8, 8, 7, 8], examen: 9 },
      'etica': { actividades: [8, 8, 8], tareas: [8, 8, 8, 8], examen: null },
      'humano': { actividades: [8, 8, 8], tareas: [8, 8, 8, 8], examen: null },
    }
  }
];

const DEFAULT_CAMPOS: CampoFormativo[] = [
  { id: 'lenguajes', nombre: 'Lenguajes', tieneExamen: true },
  { id: 'saberes', nombre: 'Saberes y pensamiento científico', tieneExamen: true },
  { id: 'etica', nombre: 'Ética, naturaleza y sociedades', tieneExamen: false },
  { id: 'humano', nombre: 'De lo humano y lo comunitario', tieneExamen: false },
];

const DEFAULT_PORCENTAJES: { [campoId: string]: PorcentajeConfig } = {
  'lenguajes': { actividades: 40, tareas: 30, examen: 30 },
  'saberes': { actividades: 40, tareas: 30, examen: 30 },
  'etica': { actividades: 60, tareas: 40, examen: 0 },
  'humano': { actividades: 60, tareas: 40, examen: 0 },
};

const DEFAULT_ASISTENCIA: AsistenciaRegistro[] = [
  {
    fecha: '2026-08-25',
    status: {
      a1: 'presente', a2: 'falta', a3: 'presente', a4: 'presente',
      a5: 'presente', a6: 'falta', a7: 'presente', a8: 'retardo',
      a9: 'presente', a10: 'presente', a11: 'presente', a12: 'presente'
    }
  }
];

const DEFAULT_LOTES: Lote[] = [
  { id: 'l1', nombre: 'Ross', fecha: '2026-08-01', inversion: 4607, ventas: 8180, ganancia: 3573, productosRestantes: 3, estado: 'Activo' },
  { id: 'l2', nombre: 'GAP', fecha: '2026-08-05', inversion: 7790, ventas: 12680, ganancia: 4890, productosRestantes: 5, estado: 'Activo' },
  { id: 'l3', nombre: 'Goodwill', fecha: '2026-08-10', inversion: 4260, ventas: 8050, ganancia: 3790, productosRestantes: 2, estado: 'Activo' },
  { id: 'l4', nombre: 'Tommy / Guess / Hollister', fecha: '2026-08-12', inversion: 15943, ventas: 29945, ganancia: 14002, productosRestantes: 12, estado: 'Activo' }
];

const DEFAULT_PRODUCTOS: Producto[] = [
  { id: 'p1', descripcion: 'Terno negro formal slim fit', categoria: 'Trajes', talla: 'M', costo: 255, precio: 550, cantidad: 2, loteId: 'l1', notas: 'Prenda clásica de alta demanda', estado: 'Disponible', foto: null },
  { id: 'p2', descripcion: 'Blusa GAP azul con logo', categoria: 'Blusas', talla: 'S', costo: 150, precio: 320, cantidad: 5, loteId: 'l2', notas: 'Algodón suave original', estado: 'Disponible', foto: null },
  { id: 'p3', descripcion: 'Jeans Ross azul clásico', categoria: 'Pantalones', talla: '30', costo: 180, precio: 400, cantidad: 4, loteId: 'l1', notas: 'Denim grueso', estado: 'Vendido', foto: null },
  { id: 'p4', descripcion: 'Camisa Tommy Hilfiger blanca', categoria: 'Camisas', talla: 'L', costo: 320, precio: 750, cantidad: 3, loteId: 'l4', notas: 'Custom fit', estado: 'Disponible', foto: null },
  { id: 'p5', descripcion: 'Vestido Hollister floreado', categoria: 'Vestidos', talla: 'XS', costo: 280, precio: 620, cantidad: 4, loteId: 'l4', notas: 'Ideal para el verano', estado: 'Disponible', foto: null },
  { id: 'p6', descripcion: 'Sudadera GAP gris con capucha', categoria: 'Sudaderas', talla: 'L', costo: 220, precio: 500, cantidad: 3, loteId: 'l2', notas: 'Interior afelpado', estado: 'Vendido', foto: null },
  { id: 'p7', descripcion: 'Playera Guess negra letras doradas', categoria: 'Playeras', talla: 'M', costo: 160, precio: 380, cantidad: 6, loteId: 'l4', notas: 'Edición limitada', estado: 'Apartado', foto: null },
  { id: 'p8', descripcion: 'Chaqueta Tommy mezclilla retro', categoria: 'Chaquetas', talla: 'XL', costo: 450, precio: 1100, cantidad: 2, loteId: 'l4', notas: 'Unisex estilo vintage', estado: 'Disponible', foto: null },
  { id: 'p9', descripcion: 'Aromatizante ambiental textil', categoria: 'Aromatizantes', talla: 'Única', costo: 45, precio: 120, cantidad: 10, loteId: 'l3', notas: 'Olor a ropa limpia duradero', estado: 'Disponible', foto: null },
  { id: 'p10', descripcion: 'Suéter Goodwill de lana tejido', categoria: 'Suéteres', talla: 'M', costo: 110, precio: 290, cantidad: 3, loteId: 'l3', notas: 'Excelente estado 10/10', estado: 'Disponible', foto: null },
  { id: 'p11', descripcion: 'Short de lino Ross beige', categoria: 'Shorts', talla: 'S', costo: 90, precio: 220, cantidad: 5, loteId: 'l1', notas: 'Ropa de playa fresca', estado: 'Vendido', foto: null },
  { id: 'p12', descripcion: 'Vestido Guess rojo de noche', categoria: 'Vestidos', talla: 'S', costo: 380, precio: 950, cantidad: 1, loteId: 'l4', notas: 'Hermosa tela satinada', estado: 'Disponible', foto: null },
  { id: 'p13', descripcion: 'Pantalón GAP cargo verde militar', categoria: 'Pantalones', talla: '32', costo: 200, precio: 450, cantidad: 3, loteId: 'l2', notas: 'Bolsillos laterales cómodos', estado: 'Disponible', foto: null },
  { id: 'p14', descripcion: 'Gorra Tommy Hilfiger clásica azul', categoria: 'Accesorios', talla: 'Ajustable', costo: 130, precio: 350, cantidad: 4, loteId: 'l4', notas: 'Logo frontal bordado', estado: 'Apartado', foto: null },
  { id: 'p15', descripcion: 'Aromatizante spray vainilla premium', categoria: 'Aromatizantes', talla: 'Única', costo: 45, precio: 120, cantidad: 10, loteId: 'l3', notas: 'Aroma dulce y concentrado', estado: 'Vendido', foto: null }
];

const DEFAULT_VENTAS: Venta[] = [
  { id: 'v1', productoId: 'p3', precioFinal: 400, cliente: 'Lorena Gómez', formaPago: 'Transferencia', fecha: '2026-08-15' },
  { id: 'v2', productoId: 'p6', precioFinal: 500, cliente: 'Patricia Flores', formaPago: 'Efectivo', fecha: '2026-08-18' },
  { id: 'v3', productoId: 'p11', precioFinal: 220, cliente: 'Beatriz Ruiz', formaPago: 'Tarjeta', fecha: '2026-08-20' },
  { id: 'v4', productoId: 'p15', precioFinal: 120, cliente: 'Lorena Gómez', formaPago: 'Efectivo', fecha: '2026-08-22' }
];

function getStoredValue<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.warn(`Error al leer "${key}" de localStorage:`, error);
  }
  return defaultValue;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Session
  const [currentView, setCurrentView] = useState<ViewType>(() => 
    getStoredValue<ViewType>('jenny_current_view', 'login')
  );
  const [history, setHistory] = useState<ViewType[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(() => 
    getStoredValue<string | null>('jenny_selected_student', null)
  );
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(() => 
    getStoredValue<string | null>('jenny_selected_batch', null)
  );
  const [selectedCampoId, setSelectedCampoId] = useState<string | null>(() => 
    getStoredValue<string | null>('jenny_selected_campo', null)
  );

  // User Session State
  const [userEmail, setUserEmail] = useState<string>(() =>
    getStoredValue('jenny_user_email', 'jenny@correo.com')
  );
  const [userName, setUserName] = useState<string>(() =>
    getStoredValue('jenny_user_name', 'Jenny')
  );

  useEffect(() => {
    localStorage.setItem('jenny_user_email', JSON.stringify(userEmail));
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem('jenny_user_name', JSON.stringify(userName));
  }, [userName]);

  const logout = () => {
    setCurrentView('login');
  };

  // Cloud State
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [cicloEscolar, setCicloEscolar] = useState<string>(() => 
    getStoredValue('jenny_ciclo_escolar', '2026-2027')
  );
  const [grado, setGrado] = useState<string>(() => 
    getStoredValue('jenny_grado', '5.º')
  );
  const [grupo, setGrupo] = useState<string>(() => 
    getStoredValue('jenny_grupo', 'A')
  );
  const [trimestre, setTrimestre] = useState<string>(() => 
    getStoredValue('jenny_trimestre', '1.º')
  );

  // School Data
  const [alumnos, setAlumnos] = useState<Alumno[]>(() => 
    getStoredValue<Alumno[]>('jenny_alumnos', DEFAULT_ALUMNOS)
  );
  const [camposFormativos] = useState<CampoFormativo[]>(DEFAULT_CAMPOS);
  const [porcentajes, setPorcentajes] = useState<{ [campoId: string]: PorcentajeConfig }>(() => 
    getStoredValue('jenny_porcentajes', DEFAULT_PORCENTAJES)
  );
  const [asistencia, setAsistencia] = useState<AsistenciaRegistro[]>(() => 
    getStoredValue<AsistenciaRegistro[]>('jenny_asistencia', DEFAULT_ASISTENCIA)
  );

  // Business Data
  const [lotes, setLotes] = useState<Lote[]>(() => 
    getStoredValue<Lote[]>('jenny_lotes', DEFAULT_LOTES)
  );
  const [productos, setProductos] = useState<Producto[]>(() => 
    getStoredValue<Producto[]>('jenny_productos', DEFAULT_PRODUCTOS)
  );
  const [ventas, setVentas] = useState<Venta[]>(() => 
    getStoredValue<Venta[]>('jenny_ventas', DEFAULT_VENTAS)
  );

  // --- SUPABASE INITIAL LOAD & SYNC ---
  useEffect(() => {
    let isMounted = true;
    async function loadCloudData() {
      setIsSyncing(true);
      try {
        const [cloudAlumnos, cloudAsistencias, cloudLotes, cloudProductos, cloudVentas] = await Promise.all([
          fetchAlumnosFromSupabase(),
          fetchAsistenciasFromSupabase(),
          fetchLotesFromSupabase(),
          fetchProductosFromSupabase(),
          fetchVentasFromSupabase()
        ]);

        if (!isMounted) return;

        if (cloudAlumnos !== null || cloudLotes !== null) {
          setIsCloudConnected(true);
        }

        // If Supabase has data, hydrate state with it
        if (cloudAlumnos && cloudAlumnos.length > 0) {
          setAlumnos(cloudAlumnos);
        } else if (cloudAlumnos && cloudAlumnos.length === 0) {
          // Table exists but is empty -> Seed initial alumnos to cloud
          DEFAULT_ALUMNOS.forEach(a => upsertAlumnoToSupabase(a));
        }

        if (cloudAsistencias && cloudAsistencias.length > 0) {
          setAsistencia(cloudAsistencias);
        } else if (cloudAsistencias && cloudAsistencias.length === 0) {
          DEFAULT_ASISTENCIA.forEach(as => saveAsistenciaToSupabase(as.fecha, as.status));
        }

        if (cloudLotes && cloudLotes.length > 0) {
          setLotes(cloudLotes);
        } else if (cloudLotes && cloudLotes.length === 0) {
          DEFAULT_LOTES.forEach(l => upsertLoteToSupabase(l));
        }

        if (cloudProductos && cloudProductos.length > 0) {
          setProductos(cloudProductos);
        } else if (cloudProductos && cloudProductos.length === 0) {
          DEFAULT_PRODUCTOS.forEach(p => upsertProductoToSupabase(p));
        }

        if (cloudVentas && cloudVentas.length > 0) {
          setVentas(cloudVentas);
        } else if (cloudVentas && cloudVentas.length === 0) {
          DEFAULT_VENTAS.forEach(v => insertVentaToSupabase(v));
        }

      } catch (err) {
        console.warn('Error connecting to Supabase cloud:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    loadCloudData();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- LOCALSTORAGE CACHE SYNC ---
  useEffect(() => {
    localStorage.setItem('jenny_current_view', JSON.stringify(currentView));
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('jenny_selected_student', JSON.stringify(selectedStudentId));
  }, [selectedStudentId]);

  useEffect(() => {
    localStorage.setItem('jenny_selected_batch', JSON.stringify(selectedBatchId));
  }, [selectedBatchId]);

  useEffect(() => {
    localStorage.setItem('jenny_selected_campo', JSON.stringify(selectedCampoId));
  }, [selectedCampoId]);

  useEffect(() => {
    localStorage.setItem('jenny_ciclo_escolar', JSON.stringify(cicloEscolar));
    localStorage.setItem('jenny_grado', JSON.stringify(grado));
    localStorage.setItem('jenny_grupo', JSON.stringify(grupo));
    localStorage.setItem('jenny_trimestre', JSON.stringify(trimestre));
  }, [cicloEscolar, grado, grupo, trimestre]);

  useEffect(() => {
    localStorage.setItem('jenny_alumnos', JSON.stringify(alumnos));
  }, [alumnos]);

  useEffect(() => {
    localStorage.setItem('jenny_porcentajes', JSON.stringify(porcentajes));
  }, [porcentajes]);

  useEffect(() => {
    localStorage.setItem('jenny_asistencia', JSON.stringify(asistencia));
  }, [asistencia]);

  useEffect(() => {
    localStorage.setItem('jenny_lotes', JSON.stringify(lotes));
  }, [lotes]);

  useEffect(() => {
    localStorage.setItem('jenny_productos', JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem('jenny_ventas', JSON.stringify(ventas));
  }, [ventas]);

  // --- RECALCULATE STUDENT AVERAGE ---
  const calculateStudentAverage = (calif: Alumno['calificaciones'], configs: { [campoId: string]: PorcentajeConfig }) => {
    let sumTrimestres = 0;
    let counts = 0;
    
    Object.keys(calif).forEach(campoId => {
      const val = calif[campoId];
      const cfg = configs[campoId];
      if (!cfg) return;

      const actAvg = val.actividades.length > 0 
        ? val.actividades.reduce((a, b) => a + b, 0) / val.actividades.length 
        : 0;

      const tarAvg = val.tareas.length > 0 
        ? val.tareas.reduce((a, b) => a + b, 0) / val.tareas.length 
        : 0;

      let campoGrade = 0;
      if (cfg.examen > 0) {
        const examenGrade = val.examen !== null ? val.examen : 0;
        campoGrade = (actAvg * (cfg.actividades / 100)) + 
                     (tarAvg * (cfg.tareas / 100)) + 
                     (examenGrade * (cfg.examen / 100));
      } else {
        const totalPct = cfg.actividades + cfg.tareas;
        const normAct = totalPct > 0 ? (cfg.actividades / totalPct) * 100 : 50;
        const normTar = totalPct > 0 ? (cfg.tareas / totalPct) * 100 : 50;
        campoGrade = (actAvg * (normAct / 100)) + (tarAvg * (normTar / 100));
      }

      sumTrimestres += campoGrade;
      counts++;
    });

    return counts > 0 ? parseFloat((sumTrimestres / counts).toFixed(2)) : 0;
  };

  useEffect(() => {
    setAlumnos(prevAlumnos => 
      prevAlumnos.map(al => {
        const newProm = calculateStudentAverage(al.calificaciones, porcentajes);
        if (newProm !== al.promedio) {
          return { ...al, promedio: newProm };
        }
        return al;
      })
    );
  }, [porcentajes]);

  // Navigation Logic
  const navigateTo = (view: ViewType, options?: { studentId?: string; batchId?: string; campoId?: string }) => {
    setHistory((prev) => [...prev, currentView]);
    setCurrentView(view);
    if (options) {
      if (options.studentId !== undefined) setSelectedStudentId(options.studentId);
      if (options.batchId !== undefined) setSelectedBatchId(options.batchId);
      if (options.campoId !== undefined) setSelectedCampoId(options.campoId);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((prevH) => prevH.slice(0, -1));
      setCurrentView(prev);
    } else {
      setCurrentView('hub');
    }
  };

  // Reset all to default demo data
  const resetToDefaultData = () => {
    setAlumnos(DEFAULT_ALUMNOS);
    setPorcentajes(DEFAULT_PORCENTAJES);
    setAsistencia(DEFAULT_ASISTENCIA);
    setLotes(DEFAULT_LOTES);
    setProductos(DEFAULT_PRODUCTOS);
    setVentas(DEFAULT_VENTAS);
    localStorage.clear();
  };

  // Add Alumno
  const addAlumno = (newAl: Omit<Alumno, 'id' | 'promedio' | 'asistenciasCount' | 'faltasCount' | 'retardosCount' | 'calificaciones'>) => {
    const id = 'a' + (Date.now());
    
    const defaultCalificaciones = {
      'lenguajes': { actividades: [8, 8], tareas: [8, 8], examen: 8 },
      'saberes': { actividades: [8, 8], tareas: [8, 8], examen: 8 },
      'etica': { actividades: [8, 8], tareas: [8, 8], examen: null },
      'humano': { actividades: [8, 8], tareas: [8, 8], examen: null },
    };

    const student: Alumno = {
      ...newAl,
      id,
      promedio: 8.0,
      asistenciasCount: 50,
      faltasCount: 0,
      retardosCount: 0,
      calificaciones: defaultCalificaciones
    };

    student.promedio = calculateStudentAverage(student.calificaciones, porcentajes);
    setAlumnos((prev) => [...prev, student]);
    upsertAlumnoToSupabase(student);
  };

  // Delete Alumno
  const deleteAlumno = (id: string) => {
    setAlumnos((prev) => prev.filter(al => al.id !== id));
    deleteAlumnoFromSupabase(id);
  };

  // Save/Register daily attendance
  const saveAsistencia = (fecha: string, status: { [alumnoId: string]: AsistenciaStatus }) => {
    setAsistencia((prev) => {
      const idx = prev.findIndex(item => item.fecha === fecha);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { fecha, status };
        return updated;
      } else {
        return [...prev, { fecha, status }];
      }
    });

    setAlumnos(prevAlumnos => 
      prevAlumnos.map(al => {
        let pres = al.asistenciasCount || 50;
        let fal = al.faltasCount || 0;
        let ret = al.retardosCount || 0;

        const currentStatus = status[al.id];
        if (currentStatus === 'presente') pres += 1;
        if (currentStatus === 'falta') fal += 1;
        if (currentStatus === 'retardo') ret += 1;

        const updatedStudent = {
          ...al,
          asistenciasCount: pres,
          faltasCount: fal,
          retardosCount: ret
        };

        upsertAlumnoToSupabase(updatedStudent);
        return updatedStudent;
      })
    );

    saveAsistenciaToSupabase(fecha, status);
  };

  // Update specific student grade
  const updateCalificacion = (
    campoId: string, 
    alumnoId: string, 
    tipo: 'actividades' | 'tareas' | 'examen', 
    index: number, 
    value: number
  ) => {
    setAlumnos(prevAlumnos => 
      prevAlumnos.map(al => {
        if (al.id !== alumnoId) return al;

        const updatedCalificaciones = { ...al.calificaciones };
        const campoCal = { ...(updatedCalificaciones[campoId] || { actividades: [], tareas: [], examen: null }) };

        if (tipo === 'actividades') {
          const acts = [...campoCal.actividades];
          acts[index] = value;
          campoCal.actividades = acts;
        } else if (tipo === 'tareas') {
          const tars = [...campoCal.tareas];
          tars[index] = value;
          campoCal.tareas = tars;
        } else if (tipo === 'examen') {
          campoCal.examen = value;
        }

        updatedCalificaciones[campoId] = campoCal;
        const newProm = calculateStudentAverage(updatedCalificaciones, porcentajes);

        const updated = {
          ...al,
          calificaciones: updatedCalificaciones,
          promedio: newProm
        };

        upsertAlumnoToSupabase(updated);
        return updated;
      })
    );
  };

  // Add a new activity or task column
  const addColumnaCalificacion = (campoId: string, tipo: 'actividades' | 'tareas') => {
    setAlumnos(prevAlumnos => 
      prevAlumnos.map(al => {
        const updatedCalificaciones = { ...al.calificaciones };
        const campoCal = { ...(updatedCalificaciones[campoId] || { actividades: [], tareas: [], examen: null }) };

        if (tipo === 'actividades') {
          campoCal.actividades = [...campoCal.actividades, 8];
        } else {
          campoCal.tareas = [...campoCal.tareas, 8];
        }

        updatedCalificaciones[campoId] = campoCal;
        const newProm = calculateStudentAverage(updatedCalificaciones, porcentajes);

        const updated = {
          ...al,
          calificaciones: updatedCalificaciones,
          promedio: newProm
        };

        upsertAlumnoToSupabase(updated);
        return updated;
      })
    );
  };

  // Save grade percentages configuration
  const savePorcentajes = (campoId: string, config: PorcentajeConfig) => {
    setPorcentajes((prev) => ({
      ...prev,
      [campoId]: config
    }));
  };

  // Add Lote
  const addLote = (newLote: Omit<Lote, 'id' | 'ventas' | 'ganancia' | 'productosRestantes'>) => {
    const id = 'l' + (Date.now());
    const lote: Lote = {
      ...newLote,
      id,
      ventas: 0,
      ganancia: 0,
      productosRestantes: 0,
    };
    setLotes((prev) => [...prev, lote]);
    upsertLoteToSupabase(lote);
  };

  // Add Producto
  const addProducto = (newProd: Omit<Producto, 'id'>) => {
    const id = 'p' + (Date.now());
    const prod: Producto = {
      ...newProd,
      id
    };
    setProductos((prev) => [...prev, prod]);
    upsertProductoToSupabase(prod);

    setLotes(prevLotes => 
      prevLotes.map(l => {
        if (l.id !== prod.loteId) return l;
        const updatedLote = {
          ...l,
          productosRestantes: l.productosRestantes + prod.cantidad,
          inversion: l.inversion + (prod.costo * prod.cantidad)
        };
        upsertLoteToSupabase(updatedLote);
        return updatedLote;
      })
    );
  };

  // Registrar Venta
  const registrarVenta = (newVenta: Omit<Venta, 'id' | 'fecha'>) => {
    const id = 'v' + (Date.now());
    const today = new Date().toISOString().split('T')[0];
    const venta: Venta = {
      ...newVenta,
      id,
      fecha: today
    };

    setVentas((prev) => [...prev, venta]);
    insertVentaToSupabase(venta);

    setProductos(prevProds => 
      prevProds.map(p => {
        if (p.id !== venta.productoId) return p;
        const updatedProd = { ...p, estado: 'Vendido' as const };
        upsertProductoToSupabase(updatedProd);
        return updatedProd;
      })
    );

    const product = productos.find(p => p.id === venta.productoId);
    if (product) {
      const gananciaGenerada = venta.precioFinal - product.costo;

      setLotes(prevLotes => 
        prevLotes.map(l => {
          if (l.id !== product.loteId) return l;
          const updatedLote = {
            ...l,
            ventas: l.ventas + venta.precioFinal,
            ganancia: l.ganancia + gananciaGenerada,
            productosRestantes: Math.max(0, l.productosRestantes - 1)
          };
          upsertLoteToSupabase(updatedLote);
          return updatedLote;
        })
      );
    }
  };

  // Delete product
  const eliminarProducto = (id: string): boolean => {
    const product = productos.find(p => p.id === id);
    if (!product) return false;

    if (product.estado === 'Vendido') {
      alert('No se puede eliminar un producto ya vendido.');
      return false;
    }

    setProductos((prev) => prev.filter(p => p.id !== id));
    deleteProductoFromSupabase(id);

    setLotes(prevLotes => 
      prevLotes.map(l => {
        if (l.id !== product.loteId) return l;
        const updatedLote = {
          ...l,
          inversion: Math.max(0, l.inversion - (product.costo * product.cantidad)),
          productosRestantes: Math.max(0, l.productosRestantes - product.cantidad)
        };
        upsertLoteToSupabase(updatedLote);
        return updatedLote;
      })
    );

    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedStudentId,
        selectedBatchId,
        selectedCampoId,
        navigateTo,
        goBack,
        
        // User Session
        userEmail,
        userName,
        setUserEmail,
        setUserName,
        logout,

        // Cloud
        isCloudConnected,
        isSyncing,

        // School
        alumnos,
        asistencia,
        camposFormativos,
        porcentajes,
        cicloEscolar,
        grado,
        grupo,
        trimestre,
        setCicloEscolar,
        setGrado,
        setGrupo,
        setTrimestre,
        addAlumno,
        deleteAlumno,
        saveAsistencia,
        updateCalificacion,
        addColumnaCalificacion,
        savePorcentajes,

        // Business
        lotes,
        productos,
        ventas,
        addLote,
        addProducto,
        registrarVenta,
        eliminarProducto,

        // Persistence
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
