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
      participacion?: number[];
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
  participacion: number;
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
  
  gradosDisponibles: string[];
  gruposDisponibles: string[];
  ciclosDisponibles: string[];

  setCicloEscolar: (val: string) => void;
  setGrado: (val: string) => void;
  setGrupo: (val: string) => void;
  setTrimestre: (val: string) => void;
  
  addGrado: (val: string) => void;
  addGrupo: (val: string) => void;
  addCicloEscolar: (val: string) => void;
  
  addAlumno: (alumno: Omit<Alumno, 'id' | 'promedio' | 'asistenciasCount' | 'faltasCount' | 'retardosCount' | 'calificaciones'>) => void;
  deleteAlumno: (id: string) => void;
  saveAsistencia: (fecha: string, status: { [alumnoId: string]: AsistenciaStatus }) => void;
  updateCalificacion: (campoId: string, alumnoId: string, tipo: 'actividades' | 'tareas' | 'examen' | 'participacion', index: number, value: number) => void;
  addColumnaCalificacion: (campoId: string, tipo: 'actividades' | 'tareas' | 'participacion') => void;
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

const DEFAULT_ALUMNOS: Alumno[] = [];

const DEFAULT_CAMPOS: CampoFormativo[] = [
  { id: 'lenguajes', nombre: 'Lenguajes', tieneExamen: true },
  { id: 'saberes', nombre: 'Saberes y pensamiento científico', tieneExamen: true },
  { id: 'etica', nombre: 'Ética, naturaleza y sociedades', tieneExamen: true },
  { id: 'humano', nombre: 'De lo humano y lo comunitario', tieneExamen: true },
];

const DEFAULT_PORCENTAJES: { [campoId: string]: PorcentajeConfig } = {
  'lenguajes': { actividades: 35, tareas: 25, examen: 25, participacion: 15 },
  'saberes': { actividades: 35, tareas: 25, examen: 25, participacion: 15 },
  'etica': { actividades: 35, tareas: 25, examen: 25, participacion: 15 },
  'humano': { actividades: 35, tareas: 25, examen: 25, participacion: 15 },
  'diagnostico': { actividades: 35, tareas: 25, examen: 25, participacion: 15 },
};

const DEFAULT_ASISTENCIA: AsistenciaRegistro[] = [];
const DEFAULT_LOTES: Lote[] = [];
const DEFAULT_PRODUCTOS: Producto[] = [];
const DEFAULT_VENTAS: Venta[] = [];

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

// One-time purge of demo data from local storage
if (typeof window !== 'undefined' && localStorage.getItem('jenny_demo_purged_v2') !== 'true') {
  localStorage.removeItem('jenny_alumnos');
  localStorage.removeItem('jenny_asistencia');
  localStorage.removeItem('jenny_lotes');
  localStorage.removeItem('jenny_productos');
  localStorage.removeItem('jenny_ventas');
  localStorage.setItem('jenny_demo_purged_v2', 'true');
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

  // Active Filters
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

  // Dynamic lists of Grados, Grupos and Ciclos
  const [gradosDisponibles, setGradosDisponibles] = useState<string[]>(() =>
    getStoredValue('jenny_grados_list', ['1.º', '2.º', '3.º', '4.º', '5.º', '6.º'])
  );
  const [gruposDisponibles, setGruposDisponibles] = useState<string[]>(() =>
    getStoredValue('jenny_grupos_list', ['A', 'B', 'C', 'D', 'E', 'Único'])
  );
  const [ciclosDisponibles, setCiclosDisponibles] = useState<string[]>(() =>
    getStoredValue('jenny_ciclos_list', ['2026-2027', '2025-2026', '2024-2025'])
  );

  useEffect(() => {
    localStorage.setItem('jenny_grados_list', JSON.stringify(gradosDisponibles));
  }, [gradosDisponibles]);

  useEffect(() => {
    localStorage.setItem('jenny_grupos_list', JSON.stringify(gruposDisponibles));
  }, [gruposDisponibles]);

  useEffect(() => {
    localStorage.setItem('jenny_ciclos_list', JSON.stringify(ciclosDisponibles));
  }, [ciclosDisponibles]);

  const addGrado = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !gradosDisponibles.includes(trimmed)) {
      setGradosDisponibles(prev => [...prev, trimmed]);
      setGrado(trimmed);
    }
  };

  const addGrupo = (val: string) => {
    const trimmed = val.trim().toUpperCase();
    if (trimmed && !gruposDisponibles.includes(trimmed)) {
      setGruposDisponibles(prev => [...prev, trimmed]);
      setGrupo(trimmed);
    }
  };

  const addCicloEscolar = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !ciclosDisponibles.includes(trimmed)) {
      setCiclosDisponibles(prev => [...prev, trimmed]);
      setCicloEscolar(trimmed);
    }
  };

  // School Data
  const [alumnos, setAlumnos] = useState<Alumno[]>(() => 
    getStoredValue<Alumno[]>('jenny_alumnos', DEFAULT_ALUMNOS)
  );
  const [camposFormativos] = useState<CampoFormativo[]>(DEFAULT_CAMPOS);
  const [porcentajes, setPorcentajes] = useState<{ [campoId: string]: PorcentajeConfig }>(() => {
    const raw = getStoredValue<Record<string, any>>('jenny_porcentajes', DEFAULT_PORCENTAJES);
    const result: { [campoId: string]: PorcentajeConfig } = {};
    const keys = ['lenguajes', 'saberes', 'etica', 'humano', 'diagnostico'];

    keys.forEach(k => {
      const defaultConf = DEFAULT_PORCENTAJES[k] || { actividades: 35, tareas: 25, examen: 25, participacion: 15 };
      const item = raw?.[k];
      if (!item) {
        result[k] = { ...defaultConf };
      } else {
        const act = item.actividades ?? defaultConf.actividades;
        const tar = item.tareas ?? defaultConf.tareas;
        const ex = item.examen ?? defaultConf.examen;
        const part = item.participacion;

        if (part === undefined || (act + tar + ex + part !== 100)) {
          result[k] = { ...defaultConf };
        } else {
          result[k] = { actividades: act, tareas: tar, examen: ex, participacion: part };
        }
      }
    });
    return result;
  });
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
        if (cloudAlumnos !== null) {
          setAlumnos(cloudAlumnos);
        }

        if (cloudAsistencias !== null) {
          setAsistencia(cloudAsistencias);
        }

        if (cloudLotes !== null) {
          setLotes(cloudLotes);
        }

        if (cloudProductos !== null) {
          setProductos(cloudProductos);
        }

        if (cloudVentas !== null) {
          setVentas(cloudVentas);
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

      const actAvg = val.actividades && val.actividades.length > 0 
        ? val.actividades.reduce((a, b) => a + b, 0) / val.actividades.length 
        : 0;

      const tarAvg = val.tareas && val.tareas.length > 0 
        ? val.tareas.reduce((a, b) => a + b, 0) / val.tareas.length 
        : 0;

      const partAvg = val.participacion && val.participacion.length > 0
        ? val.participacion.reduce((a, b) => a + b, 0) / val.participacion.length
        : (val.actividades && val.actividades.length > 0 ? actAvg : 9);

      const examenGrade = val.examen !== null && val.examen !== undefined ? val.examen : 0;

      const actWeight = cfg.actividades || 0;
      const tarWeight = cfg.tareas || 0;
      const exWeight = cfg.examen || 0;
      const partWeight = cfg.participacion || 0;

      const totalPct = actWeight + tarWeight + exWeight + partWeight;
      
      let campoGrade = 0;
      if (totalPct > 0) {
        campoGrade = (actAvg * (actWeight / 100)) + 
                     (tarAvg * (tarWeight / 100)) + 
                     (examenGrade * (exWeight / 100)) +
                     (partAvg * (partWeight / 100));
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
      'lenguajes': { actividades: [], tareas: [], examen: null, participacion: [] },
      'saberes': { actividades: [], tareas: [], examen: null, participacion: [] },
      'etica': { actividades: [], tareas: [], examen: null, participacion: [] },
      'humano': { actividades: [], tareas: [], examen: null, participacion: [] },
      'diagnostico': { actividades: [], tareas: [], examen: null, participacion: [] },
    };

    const student: Alumno = {
      ...newAl,
      id,
      promedio: 0,
      asistenciasCount: 0,
      faltasCount: 0,
      retardosCount: 0,
      calificaciones: defaultCalificaciones
    };

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
    tipo: 'actividades' | 'tareas' | 'examen' | 'participacion', 
    index: number, 
    value: number
  ) => {
    setAlumnos(prevAlumnos => 
      prevAlumnos.map(al => {
        if (al.id !== alumnoId) return al;

        const updatedCalificaciones = { ...al.calificaciones };
        const campoCal = { ...(updatedCalificaciones[campoId] || { actividades: [], tareas: [], examen: null, participacion: [] }) };

        if (tipo === 'actividades') {
          const acts = [...campoCal.actividades];
          acts[index] = value;
          campoCal.actividades = acts;
        } else if (tipo === 'tareas') {
          const tars = [...campoCal.tareas];
          tars[index] = value;
          campoCal.tareas = tars;
        } else if (tipo === 'participacion') {
          const parts = [...(campoCal.participacion || [])];
          parts[index] = value;
          campoCal.participacion = parts;
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
  const addColumnaCalificacion = (campoId: string, tipo: 'actividades' | 'tareas' | 'participacion') => {
    setAlumnos(prevAlumnos => 
      prevAlumnos.map(al => {
        const updatedCalificaciones = { ...al.calificaciones };
        const campoCal = { ...(updatedCalificaciones[campoId] || { actividades: [], tareas: [], examen: null, participacion: [] }) };

        if (tipo === 'actividades') {
          campoCal.actividades = [...campoCal.actividades, 8];
        } else if (tipo === 'tareas') {
          campoCal.tareas = [...campoCal.tareas, 8];
        } else if (tipo === 'participacion') {
          campoCal.participacion = [...(campoCal.participacion || []), 10];
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
        gradosDisponibles,
        gruposDisponibles,
        ciclosDisponibles,
        setCicloEscolar,
        setGrado,
        setGrupo,
        setTrimestre,
        addGrado,
        addGrupo,
        addCicloEscolar,
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
