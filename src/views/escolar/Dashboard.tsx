import React from 'react';
import { useAppState, type ViewType } from '../../context/AppContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Percent, 
  Calendar, 
  PlusCircle, 
  Award 
} from 'lucide-react';

export const DashboardEscolar: React.FC = () => {
  const {
    alumnos,
    asistencia,
    cicloEscolar,
    grado,
    grupo,
    trimestre,
    setCicloEscolar,
    setGrado,
    setGrupo,
    setTrimestre,
    navigateTo
  } = useAppState();

  // Calculate dynamic stats
  const totalAlumnos = alumnos.length;
  
  // Today's attendance details (latest entry)
  const latestAsistencia = asistencia[asistencia.length - 1];
  let presentes = 0;
  let faltas = 0;
  let retardos = 0;

  if (latestAsistencia) {
    Object.values(latestAsistencia.status).forEach(status => {
      if (status === 'presente') presentes++;
      if (status === 'falta') faltas++;
      if (status === 'retardo') presentes++; // Retardos count as present/here, let's keep track
      if (status === 'retardo') retardos++;
    });
  } else {
    presentes = totalAlumnos; // fallback default
  }


  // Calculate class average
  const promedioGeneral = alumnos.length > 0 
    ? parseFloat((alumnos.reduce((acc, al) => acc + al.promedio, 0) / totalAlumnos).toFixed(2))
    : 0;

  const quickActions = [
    { label: 'Tomar asistencia', view: 'escolar-asistencia' as ViewType, color: 'bg-sage-500 hover:bg-sage-600', icon: Calendar },
    { label: 'Registrar calificaciones', view: 'escolar-campos' as ViewType, color: 'bg-terracotta-500 hover:bg-terracotta-600', icon: Award },
    { label: 'Ver lista de alumnos', view: 'escolar-alumnos' as ViewType, color: 'bg-grayblue-500 hover:bg-grayblue-600', icon: Users },
    { label: 'Configurar porcentajes', view: 'escolar-porcentajes' as ViewType, color: 'bg-cream-600 hover:bg-cream-700', icon: PlusCircle },
  ];

  return (
    <div className="space-y-8">
      
      {/* Upper Filters */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        <h3 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider mb-4">
          Filtros de Grupo
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-grayblue-500 block mb-1">Ciclo escolar</label>
            <select 
              value={cicloEscolar} 
              onChange={(e) => setCicloEscolar(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400"
            >
              <option value="2026-2027">2026–2027</option>
              <option value="2025-2026">2025–2026</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-grayblue-500 block mb-1">Grado</label>
            <select 
              value={grado} 
              onChange={(e) => setGrado(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400"
            >
              <option value="5.º">5.º</option>
              <option value="6.º">6.º</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-grayblue-500 block mb-1">Grupo</label>
            <select 
              value={grupo} 
              onChange={(e) => setGrupo(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400"
            >
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-grayblue-500 block mb-1">Trimestre</label>
            <select 
              value={trimestre} 
              onChange={(e) => setTrimestre(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400"
            >
              <option value="1.º">1.º Trimestre</option>
              <option value="2.º">2.º Trimestre</option>
              <option value="3.º">3.º Trimestre</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Card 1: Alumnos */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-sage-50 p-3.5 rounded-xl text-sage-600 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Total Alumnos</span>
            <span className="text-2xl font-black text-grayblue-950 block">{totalAlumnos}</span>
          </div>
        </div>

        {/* Card 2: Presentes */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600 shrink-0">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Presentes hoy</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-grayblue-950 block">{presentes}</span>
              {retardos > 0 && <span className="text-[10px] text-amber-600 font-bold">({retardos} ret.)</span>}
            </div>
          </div>
        </div>

        {/* Card 3: Faltas */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-rose-50 p-3.5 rounded-xl text-rose-500 shrink-0">
            <UserX className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Faltas hoy</span>
            <span className="text-2xl font-black text-grayblue-950 block">{faltas}</span>
          </div>
        </div>

        {/* Card 4: Promedio */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-terracotta-50 p-3.5 rounded-xl text-terracotta-500 shrink-0">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Promedio Gral.</span>
            <span className="text-2xl font-black text-grayblue-950 block">{promedioGeneral}</span>
          </div>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-grayblue-900">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((act, index) => {
            const Icon = act.icon;
            return (
              <button
                key={index}
                onClick={() => navigateTo(act.view)}
                className="flex items-center gap-4 bg-white hover:bg-cream-100 border border-cream-200 hover:border-cream-300 p-5 rounded-2xl transition-all shadow-xs text-left group cursor-pointer"
              >
                <div className={`${act.color} text-white p-3 rounded-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-grayblue-900 text-sm md:text-base leading-snug">
                    {act.label}
                  </h4>
                  <span className="text-xs font-semibold text-grayblue-400">Ir al módulo</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
