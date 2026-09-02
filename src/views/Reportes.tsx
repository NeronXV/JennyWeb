import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  GraduationCap, 
  Store, 
  Tag,
  Download
} from 'lucide-react';
import { downloadCSV } from '../utils/exportUtils';

export const Reportes: React.FC = () => {
  const { alumnos, lotes, productos, ventas, camposFormativos, trimestre, cicloEscolar } = useAppState();
  const [activeTab, setActiveTab] = useState<'escolar' | 'negocio'>('escolar');

  // Math aggregates: School
  const totalStudents = alumnos.length;
  const classAvg = totalStudents > 0 
    ? parseFloat((alumnos.reduce((acc, al) => acc + al.promedio, 0) / totalStudents).toFixed(2))
    : 0;

  // Average attendance percentage
  let totalAttPct = 0;
  if (totalStudents > 0) {
    const sumPcts = alumnos.reduce((acc, al) => {
      const tot = al.asistenciasCount + al.faltasCount;
      const pct = tot > 0 ? (al.asistenciasCount / tot) * 100 : 100;
      return acc + pct;
    }, 0);
    totalAttPct = Math.round(sumPcts / totalStudents);
  }

  // Math aggregates: Business
  const totalInvertido = lotes.reduce((acc, l) => acc + l.inversion, 0);
  const totalVendido = lotes.reduce((acc, l) => acc + l.ventas, 0);
  const totalGanancia = lotes.reduce((acc, l) => acc + l.ganancia, 0);
  const totalGarments = productos.length;
  const soldGarments = productos.filter(p => p.estado === 'Vendido').length;

  const handleExportConcentrado = () => {
    const headers = ['Nombre Alumno', 'CURP', 'Grado/Grupo', ...camposFormativos.map(c => c.nombre), 'Promedio General', 'Asistencia (%)'];
    const rows = alumnos.map(al => {
      const camposGrades = camposFormativos.map(c => {
        const cal = al.calificaciones[c.id];
        if (!cal) return '0';
        const actAvg = cal.actividades.length > 0 ? cal.actividades.reduce((a, b) => a + b, 0) / cal.actividades.length : 0;
        return actAvg.toFixed(1);
      });
      const attPct = Math.round((al.asistenciasCount / (al.asistenciasCount + al.faltasCount || 1)) * 100);
      return [al.nombre, al.curp, `${al.grado} "${al.grupo}"`, ...camposGrades, al.promedio, `${attPct}%`];
    });
    downloadCSV(`Concentrado_Escolar_${cicloEscolar}_Trimestre_${trimestre}`, headers, rows);
  };

  const handleExportDiagnosticoConcentrado = () => {
    const headers = [
      'No.',
      'Nombre del Alumno',
      'CURP',
      'Grado y Grupo',
      'Lenguajes (Diagnóstico)',
      'Saberes y Pensamiento Científico',
      'Ética, Naturaleza y Sociedades',
      'De lo Humano y lo Comunitario',
      'Promedio Diagnóstico Integral',
      'Nivel de Desempeño Diagnóstico',
      'Recomendación de Intervención Pedagógica'
    ];

    const rows = alumnos.map((al, idx) => {
      const getGrade = (campoId: string) => {
        const cal = al.calificaciones[campoId];
        if (!cal) return 0;
        const acts = cal.actividades || [];
        const tars = cal.tareas || [];
        const parts = cal.participacion || [];
        const ex = cal.examen !== null && cal.examen !== undefined ? cal.examen : 0;
        const aAvg = acts.length > 0 ? acts.reduce((a, b) => a + b, 0) / acts.length : (ex || 0);
        const tAvg = tars.length > 0 ? tars.reduce((a, b) => a + b, 0) / tars.length : (ex || 0);
        const pAvg = parts.length > 0 ? parts.reduce((a, b) => a + b, 0) / parts.length : (ex || 0);
        return parseFloat(((aAvg * 0.35) + (tAvg * 0.25) + (ex * 0.25) + (pAvg * 0.15)).toFixed(1));
      };

      const gLeng = getGrade('lenguajes');
      const gSab = getGrade('saberes');
      const gEtica = getGrade('etica');
      const gHum = getGrade('humano');
      const avg = parseFloat(((gLeng + gSab + gEtica + gHum) / 4).toFixed(1));

      let nivel = 'Nivel Esperado (Consolidado)';
      let rec = 'Muestra dominio favorable de los aprendizajes esperados al inicio del ciclo escolar.';
      if (avg < 6.0) {
        nivel = 'Requiere Apoyo Prioritario';
        rec = 'Atención prioritaria y plan de nivelación en lectura, comprensión y razonamiento matemático.';
      } else if (avg < 8.5) {
        nivel = 'En Desarrollo';
        rec = 'Acompañamiento guiado constante y fortalecimiento de hábitos de entrega de tareas.';
      }

      return [
        idx + 1,
        al.nombre,
        al.curp,
        `${al.grado} "${al.grupo}"`,
        gLeng,
        gSab,
        gEtica,
        gHum,
        avg,
        nivel,
        rec
      ];
    });

    downloadCSV(`Concentrado_Diagnostico_Inicial_Direccion_${cicloEscolar}`, headers, rows);
  };

  const handleExportAsistencia = () => {
    const headers = ['Nombre Alumno', 'CURP', 'Asistencias', 'Faltas', 'Retardos', 'Porcentaje Asistencia'];
    const rows = alumnos.map(al => {
      const tot = al.asistenciasCount + al.faltasCount;
      const pct = tot > 0 ? Math.round((al.asistenciasCount / tot) * 100) : 100;
      return [al.nombre, al.curp, al.asistenciasCount, al.faltasCount, al.retardosCount, `${pct}%`];
    });
    downloadCSV(`Bitacora_Asistencia_${cicloEscolar}`, headers, rows);
  };

  const handleExportBalance = () => {
    const headers = ['Folio Venta', 'Fecha', 'Prenda / Producto', 'Cliente', 'Forma de Pago', 'Precio Cobrado ($)'];
    const rows = ventas.map(v => {
      const prod = productos.find(p => p.id === v.productoId);
      return [
        v.id,
        v.fecha,
        prod ? prod.descripcion : 'Producto desconocido',
        v.cliente,
        v.formaPago,
        v.precioFinal
      ];
    });
    downloadCSV('Balance_Ventas_Jenny', headers, rows);
  };

  const handleExportLotes = () => {
    const headers = ['Lote', 'Fecha de Compra', 'Inversión ($)', 'Ventas Realizadas ($)', 'Ganancia Neta ($)', 'Prendas Restantes', 'Estado'];
    const rows = lotes.map(l => [
      l.nombre,
      l.fecha,
      l.inversion,
      l.ventas,
      l.ganancia,
      l.productosRestantes,
      l.estado
    ]);
    downloadCSV('Inventario_Lotes_Jenny', headers, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header with Dual Tab selectors */}
      <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-grayblue-900 mb-1">Concentrado de Reportes</h3>
          <p className="text-sm font-semibold text-grayblue-500">
            Exporta y analiza el estado académico de tus alumnos o los balances financieros de tu negocio de ropa.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="bg-cream-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('escolar')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'escolar' 
                ? 'bg-white text-grayblue-900 shadow-xs' 
                : 'text-grayblue-500 hover:text-grayblue-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Módulo Escolar</span>
          </button>
          <button
            onClick={() => setActiveTab('negocio')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'negocio' 
                ? 'bg-white text-grayblue-900 shadow-xs' 
                : 'text-grayblue-500 hover:text-grayblue-900'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Módulo Negocio</span>
          </button>
        </div>
      </div>

      {activeTab === 'escolar' ? (
        /* ================== TAB: SCHOOL ================== */
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Quick numbers review */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider">
                Resumen Académico Gral.
              </h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-sm font-medium border-b border-cream-100 pb-2">
                  <span className="text-grayblue-500">Alumnos inscritos:</span>
                  <span className="text-grayblue-950 font-bold">{totalStudents}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium border-b border-cream-100 pb-2">
                  <span className="text-grayblue-500">Promedio general:</span>
                  <span className="text-sage-600 font-bold text-base">{classAvg}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-grayblue-500">Asistencia promedio:</span>
                  <span className="text-grayblue-950 font-bold">{totalAttPct}%</span>
                </div>
              </div>
            </div>

            {/* Export buttons list */}
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider mb-2">
                Descarga de Documentos (Excel / CSV)
              </h4>
              
              {/* Concentrado Trimestral export */}
              <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-grayblue-900 block">Concentrado Trimestral</span>
                  <span className="text-[10px] text-grayblue-400 font-medium">Calificaciones por campo</span>
                </div>
                <button 
                  onClick={handleExportConcentrado}
                  className="flex items-center gap-1 bg-white hover:bg-cream-100 border border-cream-300 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  title="Descargar Excel CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
              </div>

              {/* Registro Asistencia export */}
              <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-grayblue-900 block">Bitácora de Asistencia</span>
                  <span className="text-[10px] text-grayblue-400 font-medium">Asistencias, faltas y %</span>
                </div>
                <button 
                  onClick={handleExportAsistencia}
                  className="flex items-center gap-1 bg-white hover:bg-cream-100 border border-cream-300 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  title="Descargar Excel CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
              </div>

              {/* Diagnostico Inicial export for Dirección */}
              <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-950 block">Diagnóstico Inicial (Dirección)</span>
                  <span className="text-[10px] text-indigo-600 font-medium">Informe general de inicio de ciclo</span>
                </div>
                <button 
                  onClick={handleExportDiagnosticoConcentrado}
                  className="flex items-center gap-1 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  title="Descargar Concentrado de Diagnóstico para Dirección"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student average listings */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-grayblue-900">Lista General de Promedios</h4>
              <button
                onClick={handleExportConcentrado}
                className="text-xs font-bold text-sage-600 hover:text-sage-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar tabla completa
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-100/50 border-b border-cream-200 text-[10px] font-bold text-grayblue-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Alumno</th>
                    <th className="py-3 px-4 text-center">Trimestre</th>
                    <th className="py-3 px-4 text-center">Asistencias</th>
                    <th className="py-3 px-4 text-center">Faltas</th>
                    <th className="py-3 px-4 text-right">Promedio Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-sm">
                  {alumnos.map((al) => (
                    <tr key={al.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-grayblue-900">{al.nombre}</td>
                      <td className="py-3 px-4 text-center text-grayblue-500 font-semibold">{trimestre}</td>
                      <td className="py-3 px-4 text-center text-emerald-600 font-semibold">{al.asistenciasCount}</td>
                      <td className="py-3 px-4 text-center text-rose-500 font-semibold">{al.faltasCount}</td>
                      <td className="py-3 px-4 text-right font-black text-sage-600 text-sm">{al.promedio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* ================== TAB: BUSINESS ================== */
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Quick numbers review */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider">
                Resumen Financiero Gral.
              </h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-sm font-medium border-b border-cream-100 pb-2">
                  <span className="text-grayblue-500">Inversión Lotes:</span>
                  <span className="text-grayblue-900 font-bold">${totalInvertido.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium border-b border-cream-100 pb-2">
                  <span className="text-grayblue-500">Vendido:</span>
                  <span className="text-sage-600 font-bold">${totalVendido.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium border-b border-cream-100 pb-2">
                  <span className="text-grayblue-500">Ganancia Neta:</span>
                  <span className="text-terracotta-500 font-bold text-base">${totalGanancia.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-grayblue-500">Prendas Vendidas:</span>
                  <span className="text-grayblue-950 font-bold">
                    {soldGarments} de {totalGarments} ({Math.round((soldGarments / (totalGarments || 1)) * 100)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Export documents */}
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider mb-2">
                Descarga de Documentos (Excel / CSV)
              </h4>
              
              {/* Balance General export */}
              <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-grayblue-900 block">Historial de Ventas</span>
                  <span className="text-[10px] text-grayblue-400 font-medium">{ventas.length} ventas registradas</span>
                </div>
                <button 
                  onClick={handleExportBalance}
                  className="flex items-center gap-1 bg-white hover:bg-cream-100 border border-cream-300 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  title="Descargar Excel CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
              </div>

              {/* Inventario export */}
              <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-grayblue-900 block">Inventario y Lotes</span>
                  <span className="text-[10px] text-grayblue-400 font-medium">Inversión y stock</span>
                </div>
                <button 
                  onClick={handleExportLotes}
                  className="flex items-center gap-1 bg-white hover:bg-cream-100 border border-cream-300 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  title="Descargar Excel CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Batch performance breakdowns */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-grayblue-900">Desempeño Financiero por Lote</h4>
              <button
                onClick={handleExportLotes}
                className="text-xs font-bold text-terracotta-500 hover:text-terracotta-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar reporte lotes
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-100/50 border-b border-cream-200 text-[10px] font-bold text-grayblue-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Lote / Compra</th>
                    <th className="py-3 px-4 text-right">Inversión</th>
                    <th className="py-3 px-4 text-right">Venta</th>
                    <th className="py-3 px-4 text-right">Ganancia</th>
                    <th className="py-3 px-4 text-center">Recuperado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-sm">
                  {lotes.map((lote) => {
                    const isRec = lote.ventas >= lote.inversion;

                    return (
                      <tr key={lote.id} className="hover:bg-cream-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-grayblue-900 flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-terracotta-400" />
                          {lote.nombre}
                        </td>
                        <td className="py-3.5 px-4 text-right text-grayblue-600 font-medium">
                          ${lote.inversion.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right text-sage-600 font-bold">
                          ${lote.ventas.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right text-terracotta-500 font-bold">
                          ${lote.ganancia.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                            isRec ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {isRec ? 'Sí' : 'No'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
