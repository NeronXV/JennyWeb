import React, { useState, useEffect } from 'react';
import { useAppState, type PorcentajeConfig } from '../../context/AppContext';
import { Save, AlertTriangle, Sparkles, BookOpen, RotateCcw, Copy } from 'lucide-react';

export const Porcentajes: React.FC = () => {
  const { camposFormativos, porcentajes, savePorcentajes } = useAppState();

  // Local state to modify values and validate before saving/updating global state
  const [localConfigs, setLocalConfigs] = useState<{ [campoId: string]: PorcentajeConfig }>(() => {
    const initial: { [campoId: string]: PorcentajeConfig } = {};
    const allKeys = [...camposFormativos.map(c => c.id), 'diagnostico'];
    allKeys.forEach(k => {
      initial[k] = porcentajes[k] || { actividades: 35, tareas: 25, examen: 25, participacion: 15 };
    });
    return initial;
  });

  useEffect(() => {
    setLocalConfigs(prev => {
      const updated = { ...prev };
      const allKeys = [...camposFormativos.map(c => c.id), 'diagnostico'];
      allKeys.forEach(k => {
        if (porcentajes[k]) {
          updated[k] = { ...porcentajes[k] };
        }
      });
      return updated;
    });
  }, [porcentajes, camposFormativos]);

  const handleWeightChange = (campoId: string, tipo: keyof PorcentajeConfig, value: number) => {
    setLocalConfigs(prev => {
      const current = { ...(prev[campoId] || { actividades: 35, tareas: 25, examen: 25, participacion: 15 }) };
      current[tipo] = value;
      return {
        ...prev,
        [campoId]: current
      };
    });
  };

  const handleSetEquitativo = (campoId: string) => {
    setLocalConfigs(prev => ({
      ...prev,
      [campoId]: { actividades: 25, tareas: 25, examen: 25, participacion: 25 }
    }));
  };

  const handleCopyConfigToAll = (sourceCampoId: string) => {
    const src = localConfigs[sourceCampoId];
    if (!src) return;

    setLocalConfigs(prev => {
      const updated = { ...prev };
      camposFormativos.forEach(c => {
        updated[c.id] = { ...src };
      });
      return updated;
    });

    // Success toast for copy
    showToast('Ponderaciones copiadas a todos los campos formativos');
  };

  const showToast = (message: string) => {
    const alertBox = document.createElement('div');
    alertBox.className = 'fixed bottom-5 right-5 bg-sage-500 text-white py-3 px-6 rounded-2xl shadow-lg border border-sage-600 font-semibold text-sm z-50 flex items-center gap-2 animate-slide-in';
    alertBox.innerHTML = `
      <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
      <span>${message}</span>
    `;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => alertBox.remove(), 500);
    }, 2500);
  };

  const handleSave = (campoId: string, nombreCampo?: string) => {
    const cfg = localConfigs[campoId] || { actividades: 0, tareas: 0, examen: 0, participacion: 0 };
    const total = (cfg.actividades || 0) + (cfg.tareas || 0) + (cfg.examen || 0) + (cfg.participacion || 0);
    
    if (total !== 100) {
      alert('Los porcentajes deben sumar exactamente 100% antes de guardar.');
      return;
    }

    savePorcentajes(campoId, cfg);
    showToast(`¡Ponderaciones de ${nombreCampo || 'este campo'} guardadas con éxito!`);
  };

  // Render a reusable slider card for any evaluation field
  const renderPonderacionCard = (
    id: string,
    title: string,
    subtitle: string,
    badgeText?: string,
    isSpecialDiagnostic = false
  ) => {
    const cfg = localConfigs[id] || { actividades: 35, tareas: 25, examen: 25, participacion: 15 };
    const total = (cfg.actividades || 0) + (cfg.tareas || 0) + (cfg.examen || 0) + (cfg.participacion || 0);
    const isError = total !== 100;

    return (
      <div 
        key={id} 
        className={`bg-white border p-6 rounded-3xl space-y-6 transition-all duration-200 ${
          isSpecialDiagnostic 
            ? 'border-indigo-200 shadow-sm shadow-indigo-50/50 bg-gradient-to-b from-indigo-50/20 to-white' 
            : isError 
              ? 'border-amber-200 shadow-sm shadow-amber-50' 
              : 'border-cream-200 hover:border-cream-300'
        }`}
      >
        {/* Header Card */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-lg font-bold text-grayblue-900">{title}</h4>
              {badgeText && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isSpecialDiagnostic 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-cream-100 text-grayblue-500'
                }`}>
                  {badgeText}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-grayblue-400 block">
              {subtitle}
            </span>
          </div>

          {/* Total indicator */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors shrink-0 ${
            isError 
              ? 'bg-amber-50 text-amber-600 border-amber-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            Total: {total}%
          </div>
        </div>

        {/* 4 Sliders and controls: Actividades, Tareas, Examen, Participación */}
        <div className="space-y-4 pt-1">
          
          {/* Sliders: Actividades */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-grayblue-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sage-500"></span>
                ACTIVIDADES
              </span>
              <span className="font-mono text-sage-600">{cfg.actividades}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={cfg.actividades}
              onChange={(e) => handleWeightChange(id, 'actividades', parseInt(e.target.value) || 0)}
              className="w-full accent-sage-500 h-1.5 bg-cream-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Sliders: Tareas */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-grayblue-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-terracotta-500"></span>
                TAREAS
              </span>
              <span className="font-mono text-terracotta-600">{cfg.tareas}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={cfg.tareas}
              onChange={(e) => handleWeightChange(id, 'tareas', parseInt(e.target.value) || 0)}
              className="w-full accent-terracotta-500 h-1.5 bg-cream-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Sliders: Exámenes */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-grayblue-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                EXÁMENES
              </span>
              <span className="font-mono text-amber-600">{cfg.examen}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={cfg.examen}
              onChange={(e) => handleWeightChange(id, 'examen', parseInt(e.target.value) || 0)}
              className="w-full accent-amber-500 h-1.5 bg-cream-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Sliders: Participación */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-grayblue-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                PARTICIPACIÓN
              </span>
              <span className="font-mono text-indigo-600">{cfg.participacion}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={cfg.participacion}
              onChange={(e) => handleWeightChange(id, 'participacion', parseInt(e.target.value) || 0)}
              className="w-full accent-indigo-500 h-1.5 bg-cream-100 rounded-lg cursor-pointer"
            />
          </div>

        </div>

        {/* Alert Message if sum !== 100 */}
        {isError && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 p-3.5 rounded-xl border border-amber-100 text-xs font-bold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {total < 100 
                ? `La suma es ${total}%. Faltan ${100 - total}% para completar el 100%.`
                : `La suma es ${total}%. Excede por ${total - 100}% del 100%.`}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
          {/* Quick Helper Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetEquitativo(id)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-grayblue-500 hover:text-grayblue-800 bg-cream-100 hover:bg-cream-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Ajustar todas las ponderaciones a 25% cada una"
            >
              <RotateCcw className="h-3 w-3" />
              <span>25% c/u</span>
            </button>

            {!isSpecialDiagnostic && (
              <button
                type="button"
                onClick={() => handleCopyConfigToAll(id)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-grayblue-500 hover:text-sage-700 bg-cream-100 hover:bg-sage-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Copiar estos porcentajes a los otros 3 campos formativos"
              >
                <Copy className="h-3 w-3" />
                <span>Copiar a todos</span>
              </button>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={() => handleSave(id, title)}
            disabled={isError}
            className={`flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm select-none cursor-pointer ${
              isError 
                ? 'bg-cream-100 text-grayblue-300 border border-cream-200 cursor-not-allowed'
                : isSpecialDiagnostic
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
                  : 'bg-sage-500 hover:bg-sage-600 text-white hover:shadow-md'
            }`}
          >
            <Save className="h-4 w-4" />
            <span>Guardar Ponderaciones</span>
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-grayblue-900 mb-1">
            Configuración de Ponderaciones y Porcentajes
          </h3>
          <p className="text-sm font-semibold text-grayblue-500">
            Distribuye el peso del promedio para Actividades, Tareas, Exámenes y Participación en cada campo formativo y en el Diagnóstico Inicial.
          </p>
        </div>

        {/* Visual Pill Info */}
        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="bg-sage-50 text-sage-700 border border-sage-200 px-2.5 py-1 rounded-full">
            Actividades
          </span>
          <span className="bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-2.5 py-1 rounded-full">
            Tareas
          </span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
            Exámenes
          </span>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
            Participación
          </span>
        </div>
      </div>

      {/* Grid of Campos Formativos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-grayblue-800 font-extrabold text-base">
          <BookOpen className="h-5 w-5 text-sage-600" />
          <h4>Campos Formativos (Evaluación Trimestral)</h4>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {camposFormativos.map((campo) => 
            renderPonderacionCard(
              campo.id,
              campo.nombre,
              'Modelo con Examen trimestral y Participación activa',
              'Trimestral',
              false
            )
          )}
        </div>
      </div>

      {/* Recuadro Aparte: Diagnóstico Inicial */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 text-grayblue-800 font-extrabold text-base">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h4>Periodo Inicial</h4>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {renderPonderacionCard(
            'diagnostico',
            'Diagnóstico Inicial',
            'Ponderación para la evaluación diagnóstica al inicio del ciclo escolar',
            'Diagnóstico Inicial',
            true
          )}
        </div>
      </div>

    </div>
  );
};
