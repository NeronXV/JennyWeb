import React, { useState } from 'react';
import { useAppState, type AsistenciaStatus } from '../../context/AppContext';
import { Check, Clock, X, Calendar, Save, History, UserCheck } from 'lucide-react';

export const Asistencia: React.FC = () => {
  const { alumnos, asistencia, saveAsistencia } = useAppState();
  
  const today = '2026-08-25'; // Fixed mock date as requested
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState<'registro' | 'historial'>('registro');

  // Local state for the current grid input
  const [localStatus, setLocalStatus] = useState<{ [alumnoId: string]: AsistenciaStatus }>(() => {
    // Try to load existing data for selectedDate, else default to 'presente' for all
    const existing = asistencia.find(a => a.fecha === selectedDate);
    if (existing) {
      return { ...existing.status };
    }
    const initial: { [alumnoId: string]: AsistenciaStatus } = {};
    alumnos.forEach(al => {
      initial[al.id] = 'presente';
    });
    return initial;
  });

  // Calculate live statistics
  let presentesCount = 0;
  let faltasCount = 0;
  let retardosCount = 0;

  Object.values(localStatus).forEach(st => {
    if (st === 'presente') presentesCount++;
    if (st === 'falta') faltasCount++;
    if (st === 'retardo') retardosCount++;
  });

  const handleStatusChange = (alumnoId: string, status: AsistenciaStatus) => {
    setLocalStatus(prev => ({
      ...prev,
      [alumnoId]: status
    }));
  };

  const handleSave = () => {
    saveAsistencia(selectedDate, localStatus);
    
    // Show a custom notification banner
    const alertBox = document.createElement('div');
    alertBox.className = 'fixed bottom-5 right-5 bg-sage-500 text-white py-3 px-6 rounded-2xl shadow-lg border border-sage-600 font-semibold text-sm z-50 flex items-center gap-2 animate-slide-in';
    alertBox.innerHTML = `
      <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
      <span>¡Asistencia del ${selectedDate} guardada exitosamente!</span>
    `;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => alertBox.remove(), 500);
    }, 3000);
  };

  const setAllTo = (status: AsistenciaStatus) => {
    const updated: { [alumnoId: string]: AsistenciaStatus } = {};
    alumnos.forEach(al => {
      updated[al.id] = status;
    });
    setLocalStatus(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls & Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Date Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Calendar className="h-5 w-5 text-sage-500 shrink-0" />
          <div>
            <label className="text-[10px] font-bold text-grayblue-400 uppercase tracking-wider block">
              Fecha de Registro
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-cream-50 border border-cream-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-grayblue-900 focus:outline-none focus:border-sage-400"
            />
          </div>
        </div>

        {/* Tab triggers */}
        <div className="bg-cream-100 p-1 rounded-xl flex gap-1 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('registro')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'registro' 
                ? 'bg-white text-grayblue-900 shadow-xs' 
                : 'text-grayblue-500 hover:text-grayblue-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Pase de Asistencia</span>
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'historial' 
                ? 'bg-white text-grayblue-900 shadow-xs' 
                : 'text-grayblue-500 hover:text-grayblue-900'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Historial del Grupo</span>
          </button>
        </div>
      </div>

      {activeTab === 'registro' ? (
        <>
          {/* Live Summary Bar */}
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Presentes</span>
              <span className="text-xl md:text-3xl font-black text-emerald-800">{presentesCount}</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Retardos</span>
              <span className="text-xl md:text-3xl font-black text-amber-800">{retardosCount}</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Faltas</span>
              <span className="text-xl md:text-3xl font-black text-rose-700">{faltasCount}</span>
            </div>
          </div>

          {/* Quick Bulk Settings */}
          <div className="flex gap-3 justify-end text-xs font-semibold">
            <button 
              onClick={() => setAllTo('presente')}
              className="text-emerald-600 hover:underline"
            >
              Marcar todos presente
            </button>
            <span className="text-cream-300">|</span>
            <button 
              onClick={() => setAllTo('falta')}
              className="text-rose-500 hover:underline"
            >
              Marcar todos falta
            </button>
          </div>

          {/* Touch-Friendly List */}
          <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-cream-100">
              {alumnos.map((al) => {
                const currentVal = localStatus[al.id] || 'presente';

                return (
                  <div 
                    key={al.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:px-6 md:py-5 gap-4 hover:bg-cream-50/30 transition-colors"
                  >
                    {/* Student Name */}
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-grayblue-900 text-base">{al.nombre}</h4>
                      <span className="text-xs text-grayblue-400 font-semibold uppercase font-mono">
                        CURP: {al.curp}
                      </span>
                    </div>

                    {/* Touch Buttons */}
                    <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                      {/* Presente */}
                      <button
                        onClick={() => handleStatusChange(al.id, 'presente')}
                        className={`flex items-center justify-center gap-1.5 py-3 px-4 md:px-5 rounded-xl font-bold text-sm transition-all border select-none cursor-pointer ${
                          currentVal === 'presente'
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                            : 'bg-cream-50 text-grayblue-400 border-cream-200 hover:bg-cream-100'
                        }`}
                      >
                        <Check className="h-4 w-4 shrink-0" />
                        <span>Presente</span>
                      </button>

                      {/* Retardo */}
                      <button
                        onClick={() => handleStatusChange(al.id, 'retardo')}
                        className={`flex items-center justify-center gap-1.5 py-3 px-4 md:px-5 rounded-xl font-bold text-sm transition-all border select-none cursor-pointer ${
                          currentVal === 'retardo'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-cream-50 text-grayblue-400 border-cream-200 hover:bg-cream-100'
                        }`}
                      >
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>Retardo</span>
                      </button>

                      {/* Falta */}
                      <button
                        onClick={() => handleStatusChange(al.id, 'falta')}
                        className={`flex items-center justify-center gap-1.5 py-3 px-4 md:px-5 rounded-xl font-bold text-sm transition-all border select-none cursor-pointer ${
                          currentVal === 'falta'
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-cream-50 text-grayblue-400 border-cream-200 hover:bg-cream-100'
                        }`}
                      >
                        <X className="h-4 w-4 shrink-0" />
                        <span>Falta</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Trigger */}
            <div className="p-6 bg-cream-50/50 border-t border-cream-100 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md shadow-sage-200 transition-colors w-full sm:w-auto cursor-pointer"
              >
                <Save className="h-5 w-5" />
                <span>Guardar Asistencia</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* PAST HISTORY TAB */
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-grayblue-900 mb-2">Registros Anteriores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100/50 border-b border-cream-200 text-xs font-bold text-grayblue-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-center">Presentes</th>
                  <th className="py-3 px-4 text-center">Faltas</th>
                  <th className="py-3 px-4 text-center">Retardos</th>
                  <th className="py-3 px-4 text-center">Porcentaje</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-sm">
                {asistencia.map((reg, idx) => {
                  let pres = 0;
                  let fal = 0;
                  let ret = 0;

                  Object.values(reg.status).forEach(st => {
                    if (st === 'presente') pres++;
                    if (st === 'falta') fal++;
                    if (st === 'retardo') ret++;
                  });

                  const totalReg = pres + fal + ret;
                  const pct = totalReg > 0 ? Math.round(((pres + ret) / totalReg) * 100) : 100;

                  return (
                    <tr key={idx} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-grayblue-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-sage-500" />
                        {reg.fecha}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">{pres}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-rose-500">{fal}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-amber-600">{ret}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-grayblue-700">{pct}%</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          Cargado
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
