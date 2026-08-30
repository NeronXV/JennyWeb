import React, { useState } from 'react';
import { useAppState, type PorcentajeConfig } from '../../context/AppContext';
import { Save, AlertTriangle } from 'lucide-react';

export const Porcentajes: React.FC = () => {
  const { camposFormativos, porcentajes, savePorcentajes } = useAppState();

  // Local state to modify values and validate before saving/updating global state
  const [localConfigs, setLocalConfigs] = useState<{ [campoId: string]: PorcentajeConfig }>(() => {
    return JSON.parse(JSON.stringify(porcentajes));
  });

  const handleWeightChange = (campoId: string, tipo: keyof PorcentajeConfig, value: number) => {
    setLocalConfigs(prev => {
      const current = { ...prev[campoId] };
      current[tipo] = value;
      
      // For fields without exam, ensure exam remains 0
      const hasExamen = camposFormativos.find(c => c.id === campoId)?.tieneExamen;
      if (!hasExamen) {
        current.examen = 0;
      }
      
      return {
        ...prev,
        [campoId]: current
      };
    });
  };

  const handleSave = (campoId: string) => {
    const cfg = localConfigs[campoId];
    const total = cfg.actividades + cfg.tareas + cfg.examen;
    
    if (total !== 100) {
      alert('Los porcentajes deben sumar exactamente 100% antes de guardar.');
      return;
    }

    savePorcentajes(campoId, cfg);

    // Dynamic success toast
    const alertBox = document.createElement('div');
    alertBox.className = 'fixed bottom-5 right-5 bg-sage-500 text-white py-3 px-6 rounded-2xl shadow-lg border border-sage-600 font-semibold text-sm z-50 flex items-center gap-2 animate-slide-in';
    alertBox.innerHTML = `
      <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
      <span>¡Porcentajes guardados exitosamente!</span>
    `;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => alertBox.remove(), 500);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        <h3 className="text-xl font-bold text-grayblue-900 mb-1">
          Configuración de Ponderaciones y Porcentajes
        </h3>
        <p className="text-sm font-semibold text-grayblue-500">
          Distribuye el peso del promedio trimestral para las actividades, tareas y exámenes en cada campo formativo.
        </p>
      </div>

      {/* Grid of config Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {camposFormativos.map((campo) => {
          const cfg = localConfigs[campo.id] || { actividades: 0, tareas: 0, examen: 0 };
          const total = cfg.actividades + cfg.tareas + cfg.examen;
          const isError = total !== 100;

          return (
            <div 
              key={campo.id} 
              className={`bg-white border p-6 rounded-3xl space-y-6 transition-all duration-200 ${
                isError ? 'border-amber-200 shadow-sm shadow-amber-50' : 'border-cream-200'
              }`}
            >
              {/* Header Card */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-lg font-bold text-grayblue-900">{campo.nombre}</h4>
                  <span className="text-xs font-semibold text-grayblue-400">
                    {campo.tieneExamen ? 'Modelo: Con examen trimestral' : 'Modelo: Evaluación continua (sin examen)'}
                  </span>
                </div>

                {/* Total indicators */}
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  isError 
                    ? 'bg-amber-50 text-amber-600 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Total: {total}%
                </div>
              </div>

              {/* Sliders and controls */}
              <div className="space-y-4 pt-2">
                
                {/* Sliders: Actividades */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-grayblue-600">
                    <span>ACTIVIDADES</span>
                    <span>{cfg.actividades}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={cfg.actividades}
                    onChange={(e) => handleWeightChange(campo.id, 'actividades', parseInt(e.target.value))}
                    className="w-full accent-sage-500 h-1.5 bg-cream-100 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Sliders: Tareas */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-grayblue-600">
                    <span>TAREAS</span>
                    <span>{cfg.tareas}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={cfg.tareas}
                    onChange={(e) => handleWeightChange(campo.id, 'tareas', parseInt(e.target.value))}
                    className="w-full accent-sage-500 h-1.5 bg-cream-100 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Sliders: Examen if applies */}
                {campo.tieneExamen ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-grayblue-600">
                      <span>EXAMEN</span>
                      <span>{cfg.examen}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={cfg.examen}
                      onChange={(e) => handleWeightChange(campo.id, 'examen', parseInt(e.target.value))}
                      className="w-full accent-sage-500 h-1.5 bg-cream-100 rounded-lg cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="bg-cream-50 p-3.5 rounded-xl border border-cream-100/60 text-xs font-semibold text-grayblue-400">
                    ℹ️ Este campo formativo no contempla examen trimestral. Los porcentajes de Actividades y Tareas deben sumar el 100% de la calificación final.
                  </div>
                )}
              </div>

              {/* Alert Message */}
              {isError && (
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 p-3.5 rounded-xl border border-amber-100 text-xs font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>La suma de las ponderaciones debe ser exactamente 100%. Falta o excede {Math.abs(100 - total)}%.</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave(campo.id)}
                  disabled={isError}
                  className={`flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm select-none cursor-pointer ${
                    isError 
                      ? 'bg-cream-100 text-grayblue-300 border border-cream-200 cursor-not-allowed'
                      : 'bg-sage-500 hover:bg-sage-600 text-white hover:shadow-md'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Ponderaciones</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
