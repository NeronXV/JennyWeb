import React, { useState } from 'react';
import { useAppState, type ViewType } from '../../context/AppContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Percent, 
  Calendar, 
  PlusCircle, 
  Award,
  Plus,
  Settings,
  X,
  CheckCircle2
} from 'lucide-react';

export const DashboardEscolar: React.FC = () => {
  const {
    alumnos,
    asistencia,
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
    navigateTo
  } = useAppState();

  // Manage Groups Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newGradoInput, setNewGradoInput] = useState('');
  const [newGrupoInput, setNewGrupoInput] = useState('');
  const [newCicloInput, setNewCicloInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter students based on current selected Grado and Grupo (if set to specific)
  const filteredAlumnos = alumnos.filter(al => {
    const matchesGrado = grado === 'todos' || al.grado === grado;
    const matchesGrupo = grupo === 'todos' || al.grupo === grupo;
    return matchesGrado && matchesGrupo;
  });

  // Calculate dynamic stats for current filtered group
  const totalAlumnos = filteredAlumnos.length;
  
  // Today's attendance details (latest entry)
  const latestAsistencia = asistencia[asistencia.length - 1];
  let presentes = 0;
  let faltas = 0;

  if (latestAsistencia) {
    filteredAlumnos.forEach(al => {
      const status = latestAsistencia.status[al.id];
      if (status === 'presente' || status === 'retardo') presentes++;
      if (status === 'falta') faltas++;
    });
  } else {
    presentes = totalAlumnos;
  }

  // Calculate class average
  const promedioGeneral = totalAlumnos > 0 
    ? parseFloat((filteredAlumnos.reduce((acc, al) => acc + al.promedio, 0) / totalAlumnos).toFixed(2))
    : 0;

  const quickActions = [
    { label: 'Tomar asistencia', view: 'escolar-asistencia' as ViewType, color: 'bg-sage-500 hover:bg-sage-600', icon: Calendar },
    { label: 'Registrar calificaciones', view: 'escolar-campos' as ViewType, color: 'bg-terracotta-500 hover:bg-terracotta-600', icon: Award },
    { label: 'Ver lista de alumnos', view: 'escolar-alumnos' as ViewType, color: 'bg-grayblue-500 hover:bg-grayblue-600', icon: Users },
    { label: 'Configurar porcentajes', view: 'escolar-porcentajes' as ViewType, color: 'bg-cream-600 hover:bg-cream-700', icon: PlusCircle },
  ];

  const handleAddGradoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradoInput.trim()) return;
    addGrado(newGradoInput.trim());
    setToastMsg(`¡Grado "${newGradoInput.trim()}" agregado exitosamente!`);
    setNewGradoInput('');
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleAddGrupoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrupoInput.trim()) return;
    addGrupo(newGrupoInput.trim());
    setToastMsg(`¡Grupo "${newGrupoInput.trim().toUpperCase()}" agregado exitosamente!`);
    setNewGrupoInput('');
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleAddCicloSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCicloInput.trim()) return;
    addCicloEscolar(newCicloInput.trim());
    setToastMsg(`¡Ciclo "${newCicloInput.trim()}" agregado exitosamente!`);
    setNewCicloInput('');
    setTimeout(() => setToastMsg(null), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Upper Filters & Management */}
      <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider">
              Filtros y Grupo Activo
            </h3>
            <span className="text-sm font-bold text-grayblue-900">
              {grado === 'todos' ? 'Todos los Grados' : `${grado}`} {grupo === 'todos' ? '(Todos los grupos)' : `Grupo "${grupo}"`}
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-cream-100 hover:bg-cream-200 text-grayblue-700 font-bold py-2 px-3.5 rounded-xl text-xs transition-colors border border-cream-300 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-sage-600" />
            <span>Agregar Grado / Grupo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-grayblue-500 block mb-1">Ciclo escolar</label>
            <select 
              value={cicloEscolar} 
              onChange={(e) => setCicloEscolar(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400 font-semibold cursor-pointer"
            >
              {ciclosDisponibles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-grayblue-500 block mb-1">Grado</label>
            <select 
              value={grado} 
              onChange={(e) => setGrado(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400 font-semibold cursor-pointer"
            >
              <option value="todos">Todos los Grados</option>
              {gradosDisponibles.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-grayblue-500 block mb-1">Grupo</label>
            <select 
              value={grupo} 
              onChange={(e) => setGrupo(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400 font-semibold cursor-pointer"
            >
              <option value="todos">Todos los Grupos</option>
              {gruposDisponibles.map((g) => (
                <option key={g} value={g}>Grupo "{g}"</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-grayblue-500 block mb-1">Trimestre</label>
            <select 
              value={trimestre} 
              onChange={(e) => setTrimestre(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400 font-semibold cursor-pointer"
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
              <span className="text-xs font-semibold text-grayblue-400">/ {totalAlumnos}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Faltas */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-terracotta-50 p-3.5 rounded-xl text-terracotta-500 shrink-0">
            <UserX className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Faltas hoy</span>
            <span className="text-2xl font-black text-grayblue-950 block">{faltas}</span>
          </div>
        </div>

        {/* Card 4: Promedio General */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-cream-100 p-3.5 rounded-xl text-grayblue-600 shrink-0">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Promedio Gral</span>
            <span className="text-2xl font-black text-sage-600 block">{promedioGeneral}</span>
          </div>
        </div>

      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-grayblue-900 tracking-tight">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => navigateTo(action.view)}
                className={`p-6 rounded-2xl text-white font-semibold flex items-center gap-4 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${action.color}`}
              >
                <div className="bg-white/20 p-3 rounded-xl">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-base font-bold text-left">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADMINISTRAR GRADOS Y GRUPOS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white border border-cream-200 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl z-10 animate-scale-in max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-sage-100 p-2.5 rounded-2xl text-sage-600">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-grayblue-900">Administrar Grados y Grupos</h3>
                  <p className="text-xs text-grayblue-400">Agrega grados o grupos para organizar a tus alumnos</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-cream-100 rounded-xl text-grayblue-400 hover:text-grayblue-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {toastMsg && (
              <div className="mb-4 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{toastMsg}</span>
              </div>
            )}

            <div className="space-y-6">
              
              {/* Add Grado */}
              <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-3">
                <h4 className="text-xs font-bold text-grayblue-600 uppercase">Grados Disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {gradosDisponibles.map(g => (
                    <span key={g} className="bg-white border border-cream-300 text-grayblue-800 text-xs font-bold px-3 py-1.5 rounded-xl">
                      {g}
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddGradoSubmit} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newGradoInput}
                    onChange={(e) => setNewGradoInput(e.target.value)}
                    placeholder="Ej. 1.º, 2.º, Maternal..."
                    className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sage-400 text-grayblue-900"
                  />
                  <button
                    type="submit"
                    className="bg-sage-500 hover:bg-sage-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Agregar Grado
                  </button>
                </form>
              </div>

              {/* Add Grupo */}
              <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-3">
                <h4 className="text-xs font-bold text-grayblue-600 uppercase">Grupos Disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {gruposDisponibles.map(g => (
                    <span key={g} className="bg-white border border-cream-300 text-grayblue-800 text-xs font-bold px-3 py-1.5 rounded-xl">
                      Grupo {g}
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddGrupoSubmit} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newGrupoInput}
                    onChange={(e) => setNewGrupoInput(e.target.value.toUpperCase())}
                    placeholder="Ej. B, C, D, Matutino..."
                    className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sage-400 text-grayblue-900 uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-sage-500 hover:bg-sage-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Agregar Grupo
                  </button>
                </form>
              </div>

              {/* Add Ciclo Escolar */}
              <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-3">
                <h4 className="text-xs font-bold text-grayblue-600 uppercase">Ciclos Escolares</h4>
                <div className="flex flex-wrap gap-2">
                  {ciclosDisponibles.map(c => (
                    <span key={c} className="bg-white border border-cream-300 text-grayblue-800 text-xs font-bold px-3 py-1.5 rounded-xl">
                      {c}
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddCicloSubmit} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newCicloInput}
                    onChange={(e) => setNewCicloInput(e.target.value)}
                    placeholder="Ej. 2027-2028..."
                    className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sage-400 text-grayblue-900"
                  />
                  <button
                    type="submit"
                    className="bg-sage-500 hover:bg-sage-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Agregar Ciclo
                  </button>
                </form>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full py-3 bg-cream-200 hover:bg-cream-300 text-grayblue-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Listo / Cerrar
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
