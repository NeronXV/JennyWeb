import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { 
  FileText, 
  FileSpreadsheet, 
  User, 
  Printer, 
  X, 
  GraduationCap, 
  Sparkles 
} from 'lucide-react';
import { downloadCSV } from '../../utils/exportUtils';

export const Concentrado: React.FC = () => {
  const { selectedStudentId, alumnos, camposFormativos, porcentajes, trimestre, cicloEscolar, userName, navigateTo } = useAppState();
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
  const [diagnosticObservations, setDiagnosticObservations] = useState(
    'El alumno muestra buena disposición al inicio del ciclo escolar. Con base en la valoración diagnóstica, se recomienda consolidar la comprensión lectora autónoma, reforzar el cálculo mental y afianzar hábitos de estudio y entrega de tareas tanto en el aula como con apoyo en el hogar.'
  );

  const studentId = selectedStudentId || 'a1';
  const student = alumnos.find(al => al.id === studentId) || alumnos[0];

  if (!student) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-cream-200 text-grayblue-400 font-semibold space-y-4">
        <GraduationCap className="h-12 w-12 text-grayblue-300 mx-auto" />
        <h4 className="text-lg font-bold text-grayblue-800">No hay alumnos registrados aún</h4>
        <p className="text-xs text-grayblue-400 max-w-sm mx-auto">
          Para ver la ficha completa, generar boletas o el Informe de Diagnóstico Inicial, primero registra a los alumnos de tu grupo.
        </p>
        <button
          onClick={() => navigateTo('escolar-alumnos')}
          className="bg-sage-500 hover:bg-sage-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Ir a Registro de Alumnos
        </button>
      </div>
    );
  }

  // Calculate field grades dynamically based on current configurations
  const calculateFieldGrade = (campoId: string) => {
    const val = student.calificaciones[campoId];
    const cfg = porcentajes[campoId];
    if (!val || !cfg) return 0;

    const actAvg = val.actividades && val.actividades.length > 0 
      ? val.actividades.reduce((a, b) => a + b, 0) / val.actividades.length 
      : 0;

    const tarAvg = val.tareas && val.tareas.length > 0 
      ? val.tareas.reduce((a, b) => a + b, 0) / val.tareas.length 
      : 0;

    const partAvg = val.participacion && val.participacion.length > 0 
      ? val.participacion.reduce((a, b) => a + b, 0) / val.participacion.length 
      : actAvg;

    const exScore = val.examen !== null && val.examen !== undefined ? val.examen : 0;

    const actWeight = cfg.actividades / 100;
    const tarWeight = cfg.tareas / 100;
    const partWeight = (cfg.participacion || 15) / 100;
    const exWeight = cfg.examen / 100;

    const finalG = (actAvg * actWeight) + (tarAvg * tarWeight) + (partAvg * partWeight) + (exScore * exWeight);
    return parseFloat(finalG.toFixed(1));
  };

  // Export Individual Student CSV Breakdown
  const handleExportCSV = () => {
    const headers = ['Campo Formativo', 'Promedio Actividades', 'Promedio Tareas', 'Promedio Participación', 'Examen', 'Calificación Ponderada'];
    const rows = camposFormativos.map(campo => {
      const cal = student.calificaciones[campo.id] || { actividades: [], tareas: [], examen: null, participacion: [] };
      const actAvg = cal.actividades && cal.actividades.length > 0 ? (cal.actividades.reduce((a, b) => a + b, 0) / cal.actividades.length).toFixed(1) : '0';
      const tarAvg = cal.tareas && cal.tareas.length > 0 ? (cal.tareas.reduce((a, b) => a + b, 0) / cal.tareas.length).toFixed(1) : '0';
      const partAvg = cal.participacion && cal.participacion.length > 0 ? (cal.participacion.reduce((a, b) => a + b, 0) / cal.participacion.length).toFixed(1) : actAvg;
      const exVal = cal.examen !== null && cal.examen !== undefined ? cal.examen : '—';
      const grade = calculateFieldGrade(campo.id);
      return [campo.nombre, actAvg, tarAvg, partAvg, exVal, grade];
    });

    const sanitizedName = student.nombre.replace(/\s+/g, '_');
    downloadCSV(`Boleta_${sanitizedName}_Trimestre_${trimestre}`, headers, rows);
  };

  // Diagnostic calculations
  const diagCfg = porcentajes['diagnostico'] || { actividades: 35, tareas: 25, examen: 25, participacion: 15 };
  const diagLeng = calculateFieldGrade('lenguajes');
  const diagSab = calculateFieldGrade('saberes');
  const diagEtica = calculateFieldGrade('etica');
  const diagHum = calculateFieldGrade('humano');
  const promedioDiagnostico = parseFloat(((diagLeng + diagSab + diagEtica + diagHum) / 4).toFixed(1));

  const getDiagnosticStatus = (grade: number) => {
    if (grade >= 8.5) {
      return {
        label: 'Nivel Esperado (Consolidado)',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        textColor: 'text-emerald-700',
        colorBar: 'bg-emerald-500'
      };
    }
    if (grade >= 6.0) {
      return {
        label: 'En Desarrollo (En Proceso)',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        textColor: 'text-amber-700',
        colorBar: 'bg-amber-500'
      };
    }
    return {
      label: 'Requiere Apoyo Prioritario',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      textColor: 'text-rose-700',
      colorBar: 'bg-rose-500'
    };
  };

  const statusGlobal = getDiagnosticStatus(promedioDiagnostico);

  // Export Diagnostic Sheet CSV
  const handleExportDiagnosticCSV = () => {
    const headers = ['Campo Formativo', 'Criterios Evaluados en Diagnóstico', 'Calificación Diagnóstica', 'Nivel de Desempeño', 'Ponderación Aplicada'];
    const rows = [
      ['Lenguajes', 'Lectura de comprensión, fluidez lectora, expresión escrita y ortografía', diagLeng, getDiagnosticStatus(diagLeng).label, `${diagCfg.actividades}% Act / ${diagCfg.tareas}% Tar / ${diagCfg.examen}% Ex / ${diagCfg.participacion}% Part`],
      ['Saberes y Pensamiento Científico', 'Sentido numérico, cálculo mental, algoritmos básicos y resolución de problemas', diagSab, getDiagnosticStatus(diagSab).label, `${diagCfg.actividades}% Act / ${diagCfg.tareas}% Tar / ${diagCfg.examen}% Ex / ${diagCfg.participacion}% Part`],
      ['Ética, Naturaleza y Sociedades', 'Reconocimiento del entorno social, valores cívicos, convivencia y normas de aula', diagEtica, getDiagnosticStatus(diagEtica).label, `${diagCfg.actividades}% Act / ${diagCfg.tareas}% Tar / ${diagCfg.examen}% Ex / ${diagCfg.participacion}% Part`],
      ['De lo Humano y lo Comunitario', 'Desarrollo socioemocional, trabajo colaborativo, autorregulación y empatía', diagHum, getDiagnosticStatus(diagHum).label, `${diagCfg.actividades}% Act / ${diagCfg.tareas}% Tar / ${diagCfg.examen}% Ex / ${diagCfg.participacion}% Part`],
      ['PROMEDIO DIAGNÓSTICO INTEGRAL', 'Evaluación inicial para dirección escolar', promedioDiagnostico, statusGlobal.label, '100% Ponderado'],
      ['OBSERVACIONES PEDAGÓGICAS', diagnosticObservations, '', '', '']
    ];

    const sanitizedName = student.nombre.replace(/\s+/g, '_');
    downloadCSV(`Informe_Diagnostico_Inicial_${sanitizedName}_${cicloEscolar}`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-sage-50 text-sage-600 px-3 py-1.5 rounded-full text-xs font-bold border border-sage-100">
            <User className="h-4 w-4" />
            <span>Ficha del Alumno</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-grayblue-900 tracking-tight">
            {student.nombre}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-grayblue-400 font-mono">
            <span>CURP: {student.curp}</span>
            <span>•</span>
            <span>GRUPO: {student.grado} "{student.grupo}"</span>
            <span>•</span>
            <span>PERIODO: {trimestre} Trimestre</span>
          </div>
        </div>

        {/* Action export triggers */}
        <div className="flex flex-wrap w-full md:w-auto gap-3">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cream-100 hover:bg-cream-200 text-grayblue-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors border border-cream-300 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Exportar Excel (CSV)</span>
          </button>
          <button
            onClick={() => setPrintModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm shadow-sage-200 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Ver Boleta / Imprimir PDF</span>
          </button>
          <button
            onClick={() => setDiagnosticModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm shadow-indigo-200 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Informe Diagnóstico (Dirección)</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* GPA & Attendance Summary */}
        <div className="space-y-6 md:col-span-1">
          {/* GPA Card */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs text-center space-y-2">
            <span className="text-xs font-bold text-grayblue-400 uppercase tracking-wider block">
              Promedio General
            </span>
            <div className="text-5xl font-black text-sage-600 tracking-tight">
              {student.promedio}
            </div>
            <p className="text-xs font-semibold text-grayblue-400">
              Calculado con ponderaciones de {trimestre} trimestre
            </p>
          </div>

          {/* Quick Diagnostic Card */}
          <div className="bg-indigo-50/70 p-6 rounded-3xl border border-indigo-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Diagnóstico Inicial
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusGlobal.badge}`}>
                {statusGlobal.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-900">{promedioDiagnostico}</span>
              <span className="text-xs font-semibold text-indigo-600">/ 10</span>
            </div>
            <p className="text-xs text-indigo-800 font-medium leading-relaxed">
              Valoración pedagógica de inicio de ciclo para entregar a Dirección.
            </p>
            <button
              onClick={() => setDiagnosticModalOpen(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Generar Informe Oficial
            </button>
          </div>

          {/* Attendance Stats Card */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <span className="text-xs font-bold text-grayblue-400 uppercase tracking-wider block">
              Resumen de Asistencias
            </span>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-xl font-black text-emerald-700 block">{student.asistenciasCount}</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Asistencias</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-xl font-black text-rose-700 block">{student.faltasCount}</span>
                <span className="text-[10px] font-bold text-rose-600 uppercase">Faltas</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-xl font-black text-amber-700 block">{student.retardosCount}</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Retardos</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-grayblue-500">Porcentaje de asistencia</span>
                <span className="text-sage-600">
                  {Math.round((student.asistenciasCount / (student.asistenciasCount + student.faltasCount || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-cream-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-sage-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.round((student.asistenciasCount / (student.asistenciasCount + student.faltasCount || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown By Field */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-grayblue-400 uppercase tracking-wider">
            Desglose de Calificaciones por Materia
          </h4>

          <div className="grid gap-4">
            {camposFormativos.map((campo) => {
              const cal = student.calificaciones[campo.id] || { actividades: [], tareas: [], examen: null, participacion: [] };
              const grade = calculateFieldGrade(campo.id);
              const cfg = porcentajes[campo.id];

              const actAvg = cal.actividades && cal.actividades.length > 0 
                ? (cal.actividades.reduce((a, b) => a + b, 0) / cal.actividades.length).toFixed(1) 
                : '0';

              const tarAvg = cal.tareas && cal.tareas.length > 0 
                ? (cal.tareas.reduce((a, b) => a + b, 0) / cal.tareas.length).toFixed(1) 
                : '0';

              const partAvg = cal.participacion && cal.participacion.length > 0 
                ? (cal.participacion.reduce((a, b) => a + b, 0) / cal.participacion.length).toFixed(1) 
                : actAvg;

              return (
                <div key={campo.id} className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-grayblue-900">{campo.nombre}</h4>
                      <p className="text-xs font-semibold text-grayblue-400">Ponderación activa del campo</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-sage-600 block">{grade}</span>
                      <span className="text-[10px] font-bold text-grayblue-400 uppercase">Calificación</span>
                    </div>
                  </div>

                  {/* Rubric Breakdown Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-cream-100">
                    <div className="bg-cream-50 p-3 rounded-xl border border-cream-200">
                      <span className="text-[10px] font-bold text-grayblue-400 uppercase block">Actividades ({cfg?.actividades}%)</span>
                      <span className="text-base font-black text-grayblue-900">{actAvg}</span>
                    </div>
                    <div className="bg-cream-50 p-3 rounded-xl border border-cream-200">
                      <span className="text-[10px] font-bold text-grayblue-400 uppercase block">Tareas ({cfg?.tareas}%)</span>
                      <span className="text-base font-black text-grayblue-900">{tarAvg}</span>
                    </div>
                    <div className="bg-cream-50 p-3 rounded-xl border border-cream-200">
                      <span className="text-[10px] font-bold text-grayblue-400 uppercase block">Participación ({cfg?.participacion || 15}%)</span>
                      <span className="text-base font-black text-grayblue-900">{partAvg}</span>
                    </div>
                    <div className="bg-cream-50 p-3 rounded-xl border border-cream-200">
                      <span className="text-[10px] font-bold text-grayblue-400 uppercase block">Examen ({cfg?.examen}%)</span>
                      <span className="text-base font-black text-grayblue-900">
                        {cal.examen !== null && cal.examen !== undefined ? cal.examen : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* BOLETA MODAL / PRINTABLE FORMAT */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setPrintModalOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-scale-in">
            
            {/* Modal actions bar */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-cream-200 print:hidden">
              <span className="text-sm font-bold text-grayblue-500 flex items-center gap-2">
                <Printer className="h-4 w-4 text-sage-500" />
                Vista previa de Boleta Oficial
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-sage-500 hover:bg-sage-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setPrintModalOpen(false)}
                  className="p-2 hover:bg-cream-100 rounded-xl text-grayblue-400 hover:text-grayblue-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Design */}
            <div className="border-2 border-grayblue-800 p-6 rounded-2xl space-y-6 text-grayblue-900 bg-white print:border-black">
              {/* Header */}
              <div className="text-center border-b-2 border-grayblue-800 pb-4">
                <div className="flex items-center justify-center gap-2 text-sage-600 mb-1">
                  <GraduationCap className="h-7 w-7" />
                  <span className="font-extrabold text-xl uppercase tracking-wider text-grayblue-900">Sistema Escolar Jenny</span>
                </div>
                <h4 className="text-base font-bold uppercase text-grayblue-700">Informe de Evaluación del Aprendizaje</h4>
                <p className="text-xs font-semibold text-grayblue-500">Ciclo Escolar: {cicloEscolar} | Periodo: {trimestre} Trimestre</p>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-cream-50 p-4 rounded-xl border border-cream-200">
                <div><span className="font-bold text-grayblue-600">Alumno:</span> <span className="font-black text-grayblue-900">{student.nombre}</span></div>
                <div><span className="font-bold text-grayblue-600">CURP:</span> <span className="font-mono font-bold text-grayblue-900">{student.curp}</span></div>
                <div><span className="font-bold text-grayblue-600">Grado y Grupo:</span> <span className="font-bold text-grayblue-900">{student.grado} "{student.grupo}"</span></div>
                <div><span className="font-bold text-grayblue-600">Docente:</span> <span className="font-bold text-grayblue-900">{userName || 'Profra. Jennifer Valdez Vázquez'}</span></div>
              </div>

              {/* Grades Table */}
              <table className="w-full text-xs border-collapse border border-grayblue-300">
                <thead>
                  <tr className="bg-cream-100 text-grayblue-900 font-bold border-b border-grayblue-300">
                    <th className="p-2.5 text-left border-r border-grayblue-300">Campo Formativo</th>
                    <th className="p-2.5 text-center border-r border-grayblue-300">Actividades</th>
                    <th className="p-2.5 text-center border-r border-grayblue-300">Tareas</th>
                    <th className="p-2.5 text-center border-r border-grayblue-300">Participación</th>
                    <th className="p-2.5 text-center border-r border-grayblue-300">Examen</th>
                    <th className="p-2.5 text-center font-black">Calificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grayblue-200">
                  {camposFormativos.map(campo => {
                    const grade = calculateFieldGrade(campo.id);
                    const cal = student.calificaciones[campo.id] || { actividades: [], tareas: [], examen: null, participacion: [] };
                    const actAvg = cal.actividades && cal.actividades.length > 0 ? (cal.actividades.reduce((a, b) => a + b, 0) / cal.actividades.length).toFixed(1) : '0';
                    const tarAvg = cal.tareas && cal.tareas.length > 0 ? (cal.tareas.reduce((a, b) => a + b, 0) / cal.tareas.length).toFixed(1) : '0';
                    const partAvg = cal.participacion && cal.participacion.length > 0 ? (cal.participacion.reduce((a, b) => a + b, 0) / cal.participacion.length).toFixed(1) : actAvg;
                    return (
                      <tr key={campo.id}>
                        <td className="p-2.5 font-bold border-r border-grayblue-300">{campo.nombre}</td>
                        <td className="p-2.5 text-center border-r border-grayblue-300">{actAvg}</td>
                        <td className="p-2.5 text-center border-r border-grayblue-300">{tarAvg}</td>
                        <td className="p-2.5 text-center border-r border-grayblue-300">{partAvg}</td>
                        <td className="p-2.5 text-center border-r border-grayblue-300">
                          {cal.examen !== null && cal.examen !== undefined ? cal.examen : '—'}
                        </td>
                        <td className="p-2.5 text-center font-black text-sm">{grade}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-cream-100 font-black border-t-2 border-grayblue-800 text-sm">
                    <td colSpan={5} className="p-2.5 text-right border-r border-grayblue-300 uppercase">
                      Promedio Trimestral General:
                    </td>
                    <td className="p-2.5 text-center text-sage-600 text-base">{student.promedio}</td>
                  </tr>
                </tbody>
              </table>

              {/* Attendance and Signatures */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-cream-200">
                <div className="space-y-1">
                  <span className="font-bold text-grayblue-700 block uppercase">Resumen de Asistencia</span>
                  <p className="text-grayblue-600 font-medium">Asistencias: <b>{student.asistenciasCount}</b> | Faltas: <b>{student.faltasCount}</b> | Retardos: <b>{student.retardosCount}</b></p>
                  <p className="text-grayblue-600 font-medium">Porcentaje de asistencia: <b>{Math.round((student.asistenciasCount / (student.asistenciasCount + student.faltasCount || 1)) * 100)}%</b></p>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-48 border-b-2 border-grayblue-400 mb-1"></div>
                  <span className="font-bold text-grayblue-800 text-[11px]">{userName || 'Profra. Jennifer Valdez Vázquez'} (Docente)</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* DIAGNOSTIC REPORT MODAL / PRINTABLE SPECIAL FORMAT FOR DIRECCIÓN */}
      {diagnosticModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setDiagnosticModalOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-3xl p-6 md:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto animate-scale-in">
            
            {/* Modal actions bar */}
            <div className="flex flex-wrap justify-between items-center pb-4 mb-4 border-b border-cream-200 print:hidden gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-grayblue-900">Informe de Evaluación Diagnóstica Inicial</h4>
                  <span className="text-xs text-grayblue-400 font-semibold">Formato oficial para entrega a Dirección Escolar</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportDiagnosticCSV}
                  className="flex items-center gap-1.5 bg-cream-100 hover:bg-cream-200 text-grayblue-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-cream-300 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setDiagnosticModalOpen(false)}
                  className="p-2 hover:bg-cream-100 rounded-xl text-grayblue-400 hover:text-grayblue-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Design */}
            <div className="border-2 border-indigo-950 p-6 md:p-8 rounded-2xl space-y-6 text-grayblue-900 bg-white print:border-black">
              
              {/* Official Institutional Header */}
              <div className="text-center border-b-2 border-indigo-950 pb-5 space-y-1">
                <div className="flex items-center justify-center gap-2 text-indigo-700 mb-1">
                  <GraduationCap className="h-8 w-8" />
                  <span className="font-extrabold text-xl uppercase tracking-wider text-indigo-950">Sistema Educativo Nacional</span>
                </div>
                <h3 className="text-lg font-black uppercase text-grayblue-900 tracking-wide">
                  Informe Individual de Resultados Diagnósticos
                </h3>
                <p className="text-xs font-bold uppercase text-indigo-800 tracking-wider">
                  Periodo Inicial de Identificación de Necesidades Pedagógicas y Nivelación
                </p>
                <div className="flex justify-center gap-4 text-xs font-semibold text-grayblue-500 pt-1">
                  <span>Ciclo Escolar: <b>{cicloEscolar}</b></span>
                  <span>•</span>
                  <span>Fase: <b>Diagnóstico de Inicio</b></span>
                  <span>•</span>
                  <span>Fecha: <b>Septiembre 2026</b></span>
                </div>
              </div>

              {/* Student Metadata Box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
                <div>
                  <span className="font-bold text-grayblue-500 uppercase text-[10px] block">Nombre del Alumno:</span>
                  <span className="font-black text-grayblue-900 text-sm">{student.nombre}</span>
                </div>
                <div>
                  <span className="font-bold text-grayblue-500 uppercase text-[10px] block">CURP:</span>
                  <span className="font-mono font-bold text-grayblue-900">{student.curp}</span>
                </div>
                <div>
                  <span className="font-bold text-grayblue-500 uppercase text-[10px] block">Grado y Grupo:</span>
                  <span className="font-bold text-grayblue-900">{student.grado} "{student.grupo}"</span>
                </div>
                <div>
                  <span className="font-bold text-grayblue-500 uppercase text-[10px] block">Docente Titular:</span>
                  <span className="font-bold text-indigo-950">{userName || 'Profra. Jennifer Valdez Vázquez'}</span>
                </div>
              </div>

              {/* Diagnostic Evaluation Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-grayblue-700 uppercase tracking-wider">
                  Valoración Diagnóstica por Campos Formativos (Plan de Estudio NEM)
                </h4>
                
                <table className="w-full text-xs border-collapse border border-grayblue-300">
                  <thead>
                    <tr className="bg-indigo-50/60 text-grayblue-900 font-bold border-b border-grayblue-300">
                      <th className="p-2.5 text-left border-r border-grayblue-300 w-1/3">Campo Formativo</th>
                      <th className="p-2.5 text-left border-r border-grayblue-300">Habilidades y Contenidos Observados</th>
                      <th className="p-2.5 text-center border-r border-grayblue-300 w-20">Calificación</th>
                      <th className="p-2.5 text-center w-36">Nivel Alcanzado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grayblue-200">
                    {/* Lenguajes */}
                    <tr>
                      <td className="p-2.5 font-bold border-r border-grayblue-300 text-grayblue-900">
                        Lenguajes
                      </td>
                      <td className="p-2.5 border-r border-grayblue-300 text-grayblue-600">
                        Comprensión y fluidez lectora, redacción de textos libres, vocabulario, ortografía y expresión oral.
                      </td>
                      <td className="p-2.5 text-center font-black text-sm border-r border-grayblue-300">
                        {diagLeng}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDiagnosticStatus(diagLeng).badge}`}>
                          {getDiagnosticStatus(diagLeng).label}
                        </span>
                      </td>
                    </tr>

                    {/* Saberes */}
                    <tr>
                      <td className="p-2.5 font-bold border-r border-grayblue-300 text-grayblue-900">
                        Saberes y Pensamiento Científico
                      </td>
                      <td className="p-2.5 border-r border-grayblue-300 text-grayblue-600">
                        Sentido numérico, cálculo mental, algoritmos de operaciones básicas, fracciones y problemas razonados.
                      </td>
                      <td className="p-2.5 text-center font-black text-sm border-r border-grayblue-300">
                        {diagSab}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDiagnosticStatus(diagSab).badge}`}>
                          {getDiagnosticStatus(diagSab).label}
                        </span>
                      </td>
                    </tr>

                    {/* Ética */}
                    <tr>
                      <td className="p-2.5 font-bold border-r border-grayblue-300 text-grayblue-900">
                        Ética, Naturaleza y Sociedades
                      </td>
                      <td className="p-2.5 border-r border-grayblue-300 text-grayblue-600">
                        Conocimiento del medio social y natural, nociones cívicas, convivencia democrática y respeto de acuerdos.
                      </td>
                      <td className="p-2.5 text-center font-black text-sm border-r border-grayblue-300">
                        {diagEtica}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDiagnosticStatus(diagEtica).badge}`}>
                          {getDiagnosticStatus(diagEtica).label}
                        </span>
                      </td>
                    </tr>

                    {/* Humano y Comunitario */}
                    <tr>
                      <td className="p-2.5 font-bold border-r border-grayblue-300 text-grayblue-900">
                        De lo Humano y lo Comunitario
                      </td>
                      <td className="p-2.5 border-r border-grayblue-300 text-grayblue-600">
                        Autorregulación emocional, hábitos de higiene y cuidado, integración grupal, empatía y trabajo cooperativo.
                      </td>
                      <td className="p-2.5 text-center font-black text-sm border-r border-grayblue-300">
                        {diagHum}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDiagnosticStatus(diagHum).badge}`}>
                          {getDiagnosticStatus(diagHum).label}
                        </span>
                      </td>
                    </tr>

                    {/* Diagnostic Summary Row */}
                    <tr className="bg-indigo-50 font-black border-t-2 border-indigo-950 text-sm">
                      <td colSpan={2} className="p-3 text-right border-r border-grayblue-300 uppercase tracking-wider text-indigo-950">
                        Promedio Integral de Evaluación Diagnóstica:
                      </td>
                      <td className="p-3 text-center text-indigo-900 text-base border-r border-grayblue-300">
                        {promedioDiagnostico}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black border ${statusGlobal.badge}`}>
                          {statusGlobal.label}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Diagnostic Weight Reference Banner */}
              <div className="bg-cream-50 p-3 rounded-xl border border-cream-200 text-center text-xs text-grayblue-600 font-semibold flex flex-wrap justify-around gap-2">
                <span>Ponderación Diagnóstica:</span>
                <span>Actividades: <b>{diagCfg.actividades}%</b></span>
                <span>•</span>
                <span>Tareas: <b>{diagCfg.tareas}%</b></span>
                <span>•</span>
                <span>Examen Diagnóstico: <b>{diagCfg.examen}%</b></span>
                <span>•</span>
                <span>Participación: <b>{diagCfg.participacion || 15}%</b></span>
              </div>

              {/* Observations & Intervention Plan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-grayblue-700 uppercase tracking-wider block">
                  Observaciones Docentes y Recomendaciones de Intervención (Para Dirección):
                </label>
                <p className="text-[11px] text-grayblue-400 font-semibold print:hidden">
                  (Puedes editar o complementar esta redacción antes de imprimir o guardar en PDF)
                </p>
                <textarea
                  value={diagnosticObservations}
                  onChange={(e) => setDiagnosticObservations(e.target.value)}
                  rows={3}
                  className="w-full bg-cream-50/70 border border-cream-300 rounded-xl p-3 text-xs text-grayblue-900 font-medium focus:outline-none focus:border-indigo-400 leading-relaxed resize-none print:border-none print:p-0 print:bg-white"
                  placeholder="Escribe las recomendaciones de intervención pedagógica..."
                />
              </div>

              {/* Signatures Section */}
              <div className="grid grid-cols-3 gap-6 text-xs pt-8 border-t border-indigo-200 text-center">
                <div className="flex flex-col items-center justify-end">
                  <div className="w-full max-w-[180px] border-b-2 border-grayblue-800 mb-2"></div>
                  <span className="font-bold text-grayblue-900 block leading-tight">{userName || 'Profra. Jennifer Valdez Vázquez'}</span>
                  <span className="text-[10px] text-grayblue-500 font-semibold uppercase">Docente Titular</span>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <div className="w-full max-w-[180px] border-b-2 border-grayblue-800 mb-2"></div>
                  <span className="font-bold text-grayblue-900 block leading-tight">Dirección de la Escuela</span>
                  <span className="text-[10px] text-grayblue-500 font-semibold uppercase">Vo. Bo. / Sello Oficial</span>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <div className="w-full max-w-[180px] border-b-2 border-grayblue-800 mb-2"></div>
                  <span className="font-bold text-grayblue-900 block leading-tight">Firma de Madre/Padre o Tutor</span>
                  <span className="text-[10px] text-grayblue-500 font-semibold uppercase">Enterado / Compromiso</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
