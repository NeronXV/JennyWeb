import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { 
  FileText, 
  FileSpreadsheet, 
  User, 
  Clock,
  Printer,
  X,
  GraduationCap
} from 'lucide-react';
import { downloadCSV } from '../../utils/exportUtils';

export const Concentrado: React.FC = () => {
  const { selectedStudentId, alumnos, camposFormativos, porcentajes, trimestre, cicloEscolar } = useAppState();
  const [printModalOpen, setPrintModalOpen] = useState(false);

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

    const actAvg = val.actividades && val.actividades.length > 0 
      ? val.actividades.reduce((a, b) => a + b, 0) / val.actividades.length 
      : 0;

    const tarAvg = val.tareas && val.tareas.length > 0 
      ? val.tareas.reduce((a, b) => a + b, 0) / val.tareas.length 
      : 0;

    const partAvg = val.participacion && val.participacion.length > 0
      ? val.participacion.reduce((a, b) => a + b, 0) / val.participacion.length
      : (val.actividades && val.actividades.length > 0 ? actAvg : 9);

    const examVal = val.examen !== null && val.examen !== undefined ? val.examen : 0;

    const actWeight = cfg.actividades || 0;
    const tarWeight = cfg.tareas || 0;
    const exWeight = cfg.examen || 0;
    const partWeight = cfg.participacion || 0;

    const finalGrade = (actAvg * (actWeight / 100)) + 
                       (tarAvg * (tarWeight / 100)) + 
                       (examVal * (exWeight / 100)) + 
                       (partAvg * (partWeight / 100));

    return parseFloat(finalGrade.toFixed(1));
  };

  const handleExportCSV = () => {
    const headers = ['Campo Formativo', 'Promedio Actividades', 'Promedio Tareas', 'Promedio Participación', 'Examen', 'Calificación Trimestre'];
    const rows = camposFormativos.map(campo => {
      const cal = student.calificaciones[campo.id] || { actividades: [], tareas: [], examen: null, participacion: [] };
      const actAvg = cal.actividades && cal.actividades.length > 0 ? (cal.actividades.reduce((a, b) => a + b, 0) / cal.actividades.length).toFixed(1) : '0';
      const tarAvg = cal.tareas && cal.tareas.length > 0 ? (cal.tareas.reduce((a, b) => a + b, 0) / cal.tareas.length).toFixed(1) : '0';
      const partAvg = cal.participacion && cal.participacion.length > 0 ? (cal.participacion.reduce((a, b) => a + b, 0) / cal.participacion.length).toFixed(1) : actAvg;
      const grade = calculateFieldGrade(campo.id);
      return [
        campo.nombre,
        actAvg,
        tarAvg,
        partAvg,
        campo.tieneExamen ? (cal.examen !== null ? cal.examen : 'N/A') : 'Sin Examen',
        grade
      ];
    });

    // Add summary row
    rows.push(['PROMEDIO GENERAL', '', '', '', '', student.promedio]);
    rows.push(['ASISTENCIA (%)', '', '', '', '', `${Math.round((student.asistenciasCount / (student.asistenciasCount + student.faltasCount)) * 100)}%`]);

    const sanitizedName = student.nombre.replace(/\s+/g, '_');
    downloadCSV(`Boleta_${sanitizedName}_${trimestre}_Trimestre`, headers, rows);
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
        <div className="flex w-full md:w-auto gap-3">
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-cream-100 hover:bg-cream-200 text-grayblue-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors border border-cream-300 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Exportar Excel (CSV)</span>
          </button>
          <button
            onClick={() => setPrintModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm shadow-sage-200 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Ver Boleta / Imprimir PDF</span>
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
              const cal = student.calificaciones[campo.id] || { actividades: [], tareas: [], examen: null, participacion: [] };
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
                <div 
                  key={campo.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-cream-50/50 rounded-2xl border border-cream-100/50 gap-4"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-grayblue-900 text-base">{campo.nombre}</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-grayblue-400 font-semibold">
                      <span>Actividades: {actAvg}</span>
                      <span>•</span>
                      <span>Tareas: {tarAvg}</span>
                      <span>•</span>
                      <span>Participación: {partAvg}</span>
                      <span>•</span>
                      <span>Examen: {cal.examen !== null && cal.examen !== undefined ? cal.examen : 'S/N'}</span>
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
            <div className="border-2 border-grayblue-800 p-6 rounded-2xl space-y-6 text-grayblue-900 bg-white">
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
                <div><span className="font-bold text-grayblue-600">Fecha de Nacimiento:</span> <span className="font-bold text-grayblue-900">{student.fechaNacimiento}</span></div>
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
                  <p className="text-grayblue-600 font-medium">Porcentaje de asistencia: <b>{Math.round((student.asistenciasCount / (student.asistenciasCount + student.faltasCount)) * 100)}%</b></p>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-48 border-b-2 border-grayblue-400 mb-1"></div>
                  <span className="font-bold text-grayblue-800 text-[11px]">Firma de la Docente / Directivo</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
