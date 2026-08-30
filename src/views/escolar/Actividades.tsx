import React from 'react';
import { useAppState } from '../../context/AppContext';
import { PlusCircle, HelpCircle, Award, CheckCircle } from 'lucide-react';

export const Actividades: React.FC = () => {
  const { 
    selectedCampoId, 
    camposFormativos, 
    alumnos, 
    porcentajes, 
    updateCalificacion, 
    addColumnaCalificacion,
    trimestre
  } = useAppState();

  const campoId = selectedCampoId || 'lenguajes';
  const campo = camposFormativos.find(c => c.id === campoId) || camposFormativos[0];
  const cfg = porcentajes[campoId];

  // Get current columns sizes
  const firstStudent = alumnos[0];
  const numActivities = firstStudent?.calificaciones[campoId]?.actividades.length || 0;
  const numTareas = firstStudent?.calificaciones[campoId]?.tareas.length || 0;

  const handleGradeChange = (
    alumnoId: string, 
    tipo: 'actividades' | 'tareas' | 'examen', 
    index: number, 
    valStr: string
  ) => {
    let val = parseFloat(valStr);
    if (isNaN(val)) val = 0;
    // Keep between 0 and 10
    val = Math.max(0, Math.min(10, val));
    updateCalificacion(campoId, alumnoId, tipo, index, val);
  };

  const handleAddNewActivity = () => {
    addColumnaCalificacion(campoId, 'actividades');
  };

  const handleAddNewTarea = () => {
    addColumnaCalificacion(campoId, 'tareas');
  };

  // Helper to calculate student final grade based on percentages config
  const getCalculatedFinal = (al: any) => {
    const val = al.calificaciones[campoId];
    if (!val || !cfg) return 0;

    const actAvg = val.actividades.length > 0 
      ? val.actividades.reduce((a: number, b: number) => a + b, 0) / val.actividades.length 
      : 0;

    const tarAvg = val.tareas.length > 0 
      ? val.tareas.reduce((a: number, b: number) => a + b, 0) / val.tareas.length 
      : 0;

    let total = 0;
    if (campo.tieneExamen) {
      const examVal = val.examen !== null ? val.examen : 0;
      total = (actAvg * (cfg.actividades / 100)) + 
              (tarAvg * (cfg.tareas / 100)) + 
              (examVal * (cfg.examen / 100));
    } else {
      const totalPct = cfg.actividades + cfg.tareas;
      const normAct = (cfg.actividades / totalPct) * 100;
      const normTar = (cfg.tareas / totalPct) * 100;
      total = (actAvg * (normAct / 100)) + (tarAvg * (normTar / 100));
    }

    return parseFloat(total.toFixed(1));
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-Header info and configs */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-sage-500 uppercase tracking-widest block">
            Módulo Calificaciones
          </span>
          <h3 className="text-xl font-bold text-grayblue-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-sage-500" />
            {campo.nombre} — {trimestre} Trimestre
          </h3>
        </div>

        {/* Weights Info Indicator */}
        <div className="flex gap-4 text-xs font-semibold bg-cream-50 px-4 py-3 rounded-xl border border-cream-100">
          <div>
            <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Actividades</span>
            <span className="text-grayblue-900">{cfg?.actividades}%</span>
          </div>
          <div>
            <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Tareas</span>
            <span className="text-grayblue-900">{cfg?.tareas}%</span>
          </div>
          {campo.tieneExamen && (
            <div>
              <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Examen</span>
              <span className="text-grayblue-900">{cfg?.examen}%</span>
            </div>
          )}
          <div>
            <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Total</span>
            <span className="text-sage-600">100%</span>
          </div>
        </div>
      </div>

      {/* Grid Controller Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleAddNewActivity}
          className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Nueva actividad</span>
        </button>
        <button
          onClick={handleAddNewTarea}
          className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Nueva tarea</span>
        </button>
        {campo.tieneExamen && (
          <div className="text-xs font-medium text-grayblue-500 flex items-center gap-1.5 px-3">
            <HelpCircle className="h-4 w-4 text-grayblue-400" />
            <span>Los exámenes se capturan directo en la última columna.</span>
          </div>
        )}
      </div>

      {/* Spreadsheet Grade Grid */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto table-container">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-cream-100/50 border-b border-cream-200 text-[10px] font-bold text-grayblue-400 uppercase tracking-wider">
                <th className="py-4 px-6 min-w-[200px]">Alumno</th>
                
                {/* Dynamic Activities Header */}
                {Array.from({ length: numActivities }).map((_, idx) => (
                  <th key={`h-act-${idx}`} className="py-4 px-3 text-center w-20">
                    Act {idx + 1}
                  </th>
                ))}

                {/* Dynamic Tareas Header */}
                {Array.from({ length: numTareas }).map((_, idx) => (
                  <th key={`h-tar-${idx}`} className="py-4 px-3 text-center w-20">
                    Tarea {idx + 1}
                  </th>
                ))}

                {/* Examen Header if applies */}
                {campo.tieneExamen && (
                  <th className="py-4 px-3 text-center w-24 bg-terracotta-50/30 text-terracotta-700">
                    Examen
                  </th>
                )}

                <th className="py-4 px-6 text-center w-24 bg-sage-50/50 text-sage-700 font-extrabold border-l border-cream-200">
                  Final
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-sm">
              {alumnos.map((al) => {
                const cal = al.calificaciones[campoId] || { actividades: [], tareas: [], examen: null };
                const finalGrade = getCalculatedFinal(al);

                return (
                  <tr key={al.id} className="hover:bg-cream-50/20 transition-colors">
                    {/* Alumno Name */}
                    <td className="py-3 px-6 font-bold text-grayblue-900">
                      {al.nombre}
                    </td>

                    {/* Activities Input cells */}
                    {cal.actividades.map((grade, idx) => (
                      <td key={`c-act-${idx}`} className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={grade}
                          onChange={(e) => handleGradeChange(al.id, 'actividades', idx, e.target.value)}
                          className="w-12 text-center py-1.5 border border-cream-200 rounded-lg text-sm font-bold text-grayblue-900 focus:outline-none focus:border-sage-400 focus:bg-white"
                        />
                      </td>
                    ))}

                    {/* Tareas Input cells */}
                    {cal.tareas.map((grade, idx) => (
                      <td key={`c-tar-${idx}`} className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={grade}
                          onChange={(e) => handleGradeChange(al.id, 'tareas', idx, e.target.value)}
                          className="w-12 text-center py-1.5 border border-cream-200 rounded-lg text-sm font-bold text-grayblue-900 focus:outline-none focus:border-sage-400 focus:bg-white"
                        />
                      </td>
                    ))}

                    {/* Examen cell if applies */}
                    {campo.tieneExamen && (
                      <td className="py-3 px-3 text-center bg-terracotta-50/10">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={cal.examen !== null ? cal.examen : ''}
                          onChange={(e) => handleGradeChange(al.id, 'examen', 0, e.target.value)}
                          className="w-16 text-center py-1.5 border border-terracotta-200 rounded-lg text-sm font-bold text-terracotta-700 bg-white focus:outline-none focus:border-terracotta-400"
                          placeholder="-"
                        />
                      </td>
                    )}

                    {/* Calculated Final Grade Cell */}
                    <td className="py-3 px-6 text-center font-extrabold text-sm text-sage-600 bg-sage-50/20 border-l border-cream-200">
                      {finalGrade}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom actions */}
        <div className="p-4 bg-cream-50/50 border-t border-cream-100 flex justify-between items-center text-xs font-semibold text-grayblue-400">
          <span>Las calificaciones se auto-guardan temporalmente en memoria.</span>
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            <span>Guardado automático</span>
          </div>
        </div>
      </div>
    </div>
  );
};
