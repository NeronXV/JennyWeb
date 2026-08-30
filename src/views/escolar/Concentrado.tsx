import React from 'react';
import { useAppState } from '../../context/AppContext';
import { 
  FileText, 
  FileSpreadsheet, 
  User, 
  Clock
} from 'lucide-react';

export const Concentrado: React.FC = () => {
  const { selectedStudentId, alumnos, camposFormativos, porcentajes, trimestre } = useAppState();

  const studentId = selectedStudentId || 'a1';
  const student = alumnos.find(al => al.id === studentId) || alumnos[0];

  if (!student) {
    return (
      <div className="bg-white p-8 text-center rounded-2xl border border-cream-200 text-grayblue-400 font-semibold">
        No se encontró información del alumno seleccionado.
      </div>
    );
  }

  // Calculate field grades dynamically based on current configurations
  const calculateFieldGrade = (campoId: string) => {
    const val = student.calificaciones[campoId];
    const cfg = porcentajes[campoId];
    if (!val || !cfg) return 0;

    const actAvg = val.actividades.length > 0 
      ? val.actividades.reduce((a, b) => a + b, 0) / val.actividades.length 
      : 0;

    const tarAvg = val.tareas.length > 0 
      ? val.tareas.reduce((a, b) => a + b, 0) / val.tareas.length 
      : 0;

    let finalGrade = 0;
    const isExamenActive = camposFormativos.find(c => c.id === campoId)?.tieneExamen;

    if (isExamenActive && cfg.examen > 0) {
      const examVal = val.examen !== null ? val.examen : 0;
      finalGrade = (actAvg * (cfg.actividades / 100)) + 
                   (tarAvg * (cfg.tareas / 100)) + 
                   (examVal * (cfg.examen / 100));
    } else {
      const totalPct = cfg.actividades + cfg.tareas;
      const normAct = (cfg.actividades / totalPct) * 100;
      const normTar = (cfg.tareas / totalPct) * 100;
      finalGrade = (actAvg * (normAct / 100)) + (tarAvg * (normTar / 100));
    }

    return parseFloat(finalGrade.toFixed(1));
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    alert(`Simulación: Reporte de ${student.nombre} exportado en formato ${type.toUpperCase()}.`);
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
        <div className="flex w-full md:w-auto gap-3">
          <button
            onClick={() => handleExport('excel')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-cream-100 hover:bg-cream-200 text-grayblue-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors border border-cream-300 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm shadow-sage-200 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Exportar PDF</span>
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
            <span className="text-5xl font-black text-sage-600 block leading-none">
              {student.promedio}
            </span>
            <span className="text-xs text-grayblue-400 font-semibold block pt-2">
              Evaluación aprobatoria regular
            </span>
          </div>

          {/* Attendance Card */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider">
              Registro de Asistencia
            </h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-center">
                <span className="text-xs font-bold text-emerald-600 block">Asist.</span>
                <span className="text-lg font-bold text-emerald-800 block">{student.asistenciasCount}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-center">
                <span className="text-xs font-bold text-amber-600 block">Ret.</span>
                <span className="text-lg font-bold text-amber-800 block">{student.retardosCount}</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-center">
                <span className="text-xs font-bold text-rose-500 block">Faltas</span>
                <span className="text-lg font-bold text-rose-700 block">{student.faltasCount}</span>
              </div>
            </div>

            <div className="text-xs font-semibold text-grayblue-500 text-center flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-grayblue-400" />
              <span>
                Asistencia total: {Math.round((student.asistenciasCount / (student.asistenciasCount + student.faltasCount)) * 100)}% de las clases
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Fields Grades Table */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-grayblue-900 mb-2">Calificaciones por Campo Formativo</h4>
          
          <div className="space-y-3">
            {camposFormativos.map((campo) => {
              const grade = calculateFieldGrade(campo.id);
              const cal = student.calificaciones[campo.id] || { actividades: [], tareas: [], examen: null };
              const actAvg = cal.actividades.length > 0 
                ? (cal.actividades.reduce((a, b) => a + b, 0) / cal.actividades.length).toFixed(1)
                : '0';
              const tarAvg = cal.tareas.length > 0
                ? (cal.tareas.reduce((a, b) => a + b, 0) / cal.tareas.length).toFixed(1)
                : '0';

              return (
                <div 
                  key={campo.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-cream-50/50 rounded-2xl border border-cream-100/50 gap-4"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-grayblue-900 text-base">{campo.nombre}</span>
                    <div className="flex gap-3 text-xs text-grayblue-400 font-semibold">
                      <span>Pro. Actividades: {actAvg}</span>
                      <span>•</span>
                      <span>Pro. Tareas: {tarAvg}</span>
                      {campo.tieneExamen && (
                        <>
                          <span>•</span>
                          <span>Examen: {cal.examen !== null ? cal.examen : 'S/N'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-grayblue-400 block uppercase">Calificación:</span>
                    <span className={`text-xl font-black ${
                      grade >= 9 ? 'text-emerald-600' : grade >= 8 ? 'text-sage-600' : 'text-amber-600'
                    }`}>
                      {grade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
