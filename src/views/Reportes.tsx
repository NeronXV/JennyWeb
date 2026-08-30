import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  GraduationCap, 
  Store, 
  FileText, 
  FileSpreadsheet, 
  Tag 
} from 'lucide-react';

export const Reportes: React.FC = () => {
  const { alumnos, lotes, productos } = useAppState();
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

  const handleExport = (reportName: string, format: 'pdf' | 'excel') => {
    alert(`Simulación: Reporte "${reportName}" exportado en formato ${format.toUpperCase()}.`);
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
                Descarga de Documentos
              </h4>
              
              {/* Concentrado Trimestral export */}
              <div className="p-3 bg-cream-50 rounded-2xl border border-cream-100/50 flex justify-between items-center">
                <span className="text-xs font-bold text-grayblue-900">Concentrado Trimestral</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleExport('Concentrado Trimestral', 'excel')}
                    className="p-1.5 hover:bg-cream-200 rounded-lg text-emerald-600"
                    title="Excel"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleExport('Concentrado Trimestral', 'pdf')}
                    className="p-1.5 hover:bg-cream-200 rounded-lg text-sage-500"
                    title="PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Registro Asistencia export */}
              <div className="p-3 bg-cream-50 rounded-2xl border border-cream-100/50 flex justify-between items-center">
                <span className="text-xs font-bold text-grayblue-900">Bitácora de Asistencia</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleExport('Bitácora de Asistencia', 'excel')}
                    className="p-1.5 hover:bg-cream-200 rounded-lg text-emerald-600"
                    title="Excel"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleExport('Bitácora de Asistencia', 'pdf')}
                    className="p-1.5 hover:bg-cream-200 rounded-lg text-sage-500"
                    title="PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Student average listings */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-grayblue-900">Lista General de Promedios</h4>
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
                      <td className="py-3 px-4 text-center text-grayblue-500 font-semibold">1.º</td>
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
                    {soldGarments} de {totalGarments} ({Math.round((soldGarments / totalGarments) * 100)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Export documents */}
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider mb-2">
                Descarga de Documentos
              </h4>
              
              {/* Balance General export */}
              <div className="p-3 bg-cream-50 rounded-2xl border border-cream-100/50 flex justify-between items-center">
                <span className="text-xs font-bold text-grayblue-900">Balance General de Ventas</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleExport('Balance de Ventas', 'excel')}
                    className="p-1.5 hover:bg-cream-200 rounded-lg text-emerald-600"
                    title="Excel"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleExport('Balance de Ventas', 'pdf')}
                    className="p-1.5 hover:bg-cream-200 rounded-lg text-sage-500"
                    title="PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Inventario export */}
              <div className="p-3 bg-cream-50 rounded-2xl border border-cream-100/50 flex justify-between items-center">
                <span className="text-xs font-bold text-grayblue-900">Inventario y Lotes</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleExport('Inventario y Lotes', 'excel')}
                    className="p-1.5 hover:bg-cream-200 rounded-lg text-emerald-600"
                    title="Excel"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleExport('Inventario y Lotes', 'pdf')}
                    className="p-1.5 hover:bg-cream-200 rounded-lg text-sage-500"
                    title="PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Batch performance breakdowns */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-grayblue-900">Desempeño Financiero por Lote</h4>
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
                          <Tag className="h-3.5 w-3.5 text-terracotta-450 text-terracotta-400" />
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
