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
    trimestre,
    grado,
    grupo,
    setGrado,
    setGrupo,
    gradosDisponibles,
    gruposDisponibles
  } = useAppState();

  const campoId = selectedCampoId || 'lenguajes';
  const campo = camposFormativos.find(c => c.id === campoId) || camposFormativos[0];
  const cfg = porcentajes[campoId] || { actividades: 35, tareas: 25, examen: 25, participacion: 15 };

  // Filter students based on selected Grado and Grupo
  const filteredAlumnos = alumnos.filter(al => {
    const matchesGrado = grado === 'todos' || al.grado === grado;
    const matchesGrupo = grupo === 'todos' || al.grupo === grupo;
    return matchesGrado && matchesGrupo;
  });

  // Get current columns sizes
  const firstStudent = filteredAlumnos[0] || alumnos[0];
  const numActivities = firstStudent?.calificaciones[campoId]?.actividades?.length || 0;
  const numTareas = firstStudent?.calificaciones[campoId]?.tareas?.length || 0;
  const numParticipacion = firstStudent?.calificaciones[campoId]?.participacion?.length || 0;

  const handleGradeChange = (
    alumnoId: string, 
    tipo: 'actividades' | 'tareas' | 'examen' | 'participacion', 
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

  const handleAddNewParticipacion = () => {
    addColumnaCalificacion(campoId, 'participacion');
  };

  // Helper to calculate student final grade based on percentages config
  const getCalculatedFinal = (al: any) => {
    const val = al.calificaciones[campoId];
    if (!val || !cfg) return 0;

    const actAvg = val.actividades && val.actividades.length > 0 
      ? val.actividades.reduce((a: number, b: number) => a + b, 0) / val.actividades.length 
      : 0;

    const tarAvg = val.tareas && val.tareas.length > 0 
      ? val.tareas.reduce((a: number, b: number) => a + b, 0) / val.tareas.length 
      : 0;

    const partAvg = val.participacion && val.participacion.length > 0
      ? val.participacion.reduce((a: number, b: number) => a + b, 0) / val.participacion.length
      : (val.actividades && val.actividades.length > 0 ? actAvg : 9);

    const examVal = val.examen !== null && val.examen !== undefined ? val.examen : 0;

    const actWeight = cfg.actividades || 0;
    const tarWeight = cfg.tareas || 0;
    const exWeight = cfg.examen || 0;
    const partWeight = cfg.participacion || 0;

    const total = (actAvg * (actWeight / 100)) + 
                  (tarAvg * (tarWeight / 100)) + 
                  (examVal * (exWeight / 100)) +
                  (partAvg * (partWeight / 100));

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

        {/* Weights Info Indicator & Classroom Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={grado}
              onChange={(e) => setGrado(e.target.value)}
              className="bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-xs font-bold text-grayblue-900 focus:outline-none focus:border-sage-400 cursor-pointer"
            >
              <option value="todos">Todos los Grados</option>
              {gradosDisponibles.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              className="bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-xs font-bold text-grayblue-900 focus:outline-none focus:border-sage-400 cursor-pointer"
            >
              <option value="todos">Todos los Grupos</option>
              {gruposDisponibles.map(g => (
                <option key={g} value={g}>Grupo "{g}"</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-semibold bg-cream-50 px-4 py-2.5 rounded-xl border border-cream-100">
            <div>
              <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Actividades</span>
              <span className="text-grayblue-900 font-bold">{cfg?.actividades}%</span>
            </div>
            <div>
              <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Tareas</span>
              <span className="text-grayblue-900 font-bold">{cfg?.tareas}%</span>
            </div>
            <div>
              <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Examen</span>
              <span className="text-grayblue-900 font-bold">{cfg?.examen}%</span>
            </div>
            <div>
              <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Participación</span>
              <span className="text-grayblue-900 font-bold">{cfg?.participacion || 0}%</span>
            </div>
            <div className="border-l border-cream-200 pl-2">
              <span className="text-grayblue-400 block uppercase text-[9px] tracking-wider">Total</span>
              <span className="text-sage-600 font-bold">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Controller Buttons */}
      <div className="flex flex-wrap gap-3 items-center">
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
        <button
          onClick={handleAddNewParticipacion}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Nueva participación</span>
        </button>

        <div className="text-xs font-medium text-grayblue-500 flex items-center gap-1.5 px-2">
          <HelpCircle className="h-4 w-4 text-grayblue-400" />
          <span>El examen trimestral se captura directo en la columna Examen.</span>
        </div>
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
                  <th key={`h-act-${idx}`} className="py-4 px-3 text-center w-20 bg-sage-50/20 text-sage-800">
                    Act {idx + 1}
                  </th>
                ))}

                {/* Dynamic Tareas Header */}
                {Array.from({ length: numTareas }).map((_, idx) => (
                  <th key={`h-tar-${idx}`} className="py-4 px-3 text-center w-20 bg-terracotta-50/20 text-terracotta-800">
                    Tarea {idx + 1}
                  </th>
                ))}

                {/* Dynamic Participacion Header */}
                {Array.from({ length: numParticipacion }).map((_, idx) => (
                  <th key={`h-part-${idx}`} className="py-4 px-3 text-center w-20 bg-indigo-50/20 text-indigo-800">
                    Part {idx + 1}
                  </th>
                ))}

                {/* Examen Header */}
                <th className="py-4 px-3 text-center w-24 bg-amber-50/30 text-amber-800">
                  Examen
                </th>

                <th className="py-4 px-6 text-center w-24 bg-sage-50/50 text-sage-700 font-extrabold border-l border-cream-200">
                  Final
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-sm">
              {filteredAlumnos.length === 0 ? (
                <tr>
                  <td colSpan={numActivities + numTareas + numParticipacion + 3} className="py-12 text-center text-grayblue-400 font-medium">
                    No hay alumnos registrados en este grado o grupo. Registra alumnos desde el módulo de Alumnos.
                  </td>
                </tr>
              ) : (
                filteredAlumnos.map((al) => {
                const cal = al.calificaciones[campoId] || { actividades: [], tareas: [], examen: null, participacion: [] };
                const finalGrade = getCalculatedFinal(al);

                return (
                  <tr key={al.id} className="hover:bg-cream-50/20 transition-colors">
                    {/* Alumno Name */}
                    <td className="py-3 px-6 font-bold text-grayblue-900">
                      {al.nombre}
                    </td>

                    {/* Activities Input cells */}
                    {(cal.actividades || []).map((grade, idx) => (
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
                    {(cal.tareas || []).map((grade, idx) => (
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

                    {/* Participación Input cells */}
                    {(cal.participacion || []).map((grade, idx) => (
                      <td key={`c-part-${idx}`} className="py-3 px-3 text-center bg-indigo-50/10">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={grade}
                          onChange={(e) => handleGradeChange(al.id, 'participacion', idx, e.target.value)}
                          className="w-12 text-center py-1.5 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-900 focus:outline-none focus:border-indigo-400 focus:bg-white"
                        />
                      </td>
                    ))}

                    {/* Examen cell */}
                    <td className="py-3 px-3 text-center bg-amber-50/10">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={cal.examen !== null && cal.examen !== undefined ? cal.examen : ''}
                        onChange={(e) => handleGradeChange(al.id, 'examen', 0, e.target.value)}
                        className="w-16 text-center py-1.5 border border-amber-200 rounded-lg text-sm font-bold text-amber-800 bg-white focus:outline-none focus:border-amber-400"
                        placeholder="-"
                      />
                    </td>

                    {/* Calculated Final Grade Cell */}
                    <td className="py-3 px-6 text-center font-extrabold text-sm text-sage-600 bg-sage-50/20 border-l border-cream-200">
                      {finalGrade}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Bottom actions */}
        <div className="p-4 bg-cream-50/50 border-t border-cream-100 flex justify-between items-center text-xs font-semibold text-grayblue-400">
          <span>Las calificaciones se auto-guardan y recalculan el promedio general automáticamente.</span>
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            <span>Guardado automático</span>
          </div>
        </div>
      </div>
    </div>
  );
};
