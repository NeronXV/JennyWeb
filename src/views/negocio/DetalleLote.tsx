import React from 'react';
import { useAppState } from '../../context/AppContext';
import { Layers, CheckCircle2, TrendingUp, Tag, PlusCircle } from 'lucide-react';

export const DetalleLote: React.FC = () => {
  const { selectedBatchId, lotes, productos, navigateTo } = useAppState();

  // Load selected batch or fallback
  const batchId = selectedBatchId || 'l1';
  const lote = lotes.find(l => l.id === batchId) || lotes[0];

  if (!lote) {
    return (
      <div className="bg-white p-8 text-center rounded-2xl border border-cream-200 text-grayblue-400 font-semibold">
        No se encontró información del lote seleccionado.
      </div>
    );
  }

  // Filter products belonging to this batch
  const batchProducts = productos.filter(p => p.loteId === lote.id);

  // Recovery Calculations
  const recoveryPct = lote.inversion > 0 
    ? Math.min(100, Math.round((lote.ventas / lote.inversion) * 100))
    : 100;
  
  const isRecovered = lote.ventas >= lote.inversion;
  
  // Calculate margin: (Ganancia / Ventas) * 100
  const marginPct = lote.ventas > 0 
    ? parseFloat(((lote.ganancia / lote.ventas) * 100).toFixed(1))
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Upper header review block */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-terracotta-50 text-terracotta-500 px-3 py-1.5 rounded-full text-xs font-bold border border-terracotta-100">
            <Layers className="h-4 w-4" />
            <span>Detalle del Lote</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-grayblue-900 tracking-tight">
            Lote: {lote.nombre}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-grayblue-400 font-mono">
            <span>REGISTRO: {lote.fecha}</span>
            <span>•</span>
            <span>PRODUCTOS DISTINTOS: {batchProducts.length}</span>
            <span>•</span>
            <span>ESTADO: {lote.estado}</span>
          </div>
        </div>

        {/* Status Indicators */}
        {isRecovered ? (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Estado Financiero</span>
              <span className="text-sm font-bold text-emerald-800">✅ Inversión recuperada</span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="bg-amber-100 text-amber-600 p-1.5 rounded-full animate-pulse">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Estado Financiero</span>
              <span className="text-sm font-bold text-amber-700">En proceso de recuperación</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* KPI Summaries and Recovery Progress */}
        <div className="space-y-6 md:col-span-1">
          
          {/* Recovery progress bar */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <div className="flex justify-between text-xs font-bold text-grayblue-600">
              <span>Recuperación de Inversión</span>
              <span className={isRecovered ? 'text-emerald-600' : 'text-amber-600'}>{recoveryPct}%</span>
            </div>
            <div className="w-full bg-cream-100 h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isRecovered ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${recoveryPct}%` }}
              ></div>
            </div>
            <div className="text-[11px] font-semibold text-grayblue-400 text-center leading-snug">
              {isRecovered 
                ? '¡Felicidades! Las ventas han cubierto y superado la inversión inicial del lote.' 
                : `Faltan $${Math.max(0, lote.inversion - lote.ventas).toLocaleString()} para cubrir la inversión inicial.`
              }
            </div>
          </div>

          {/* Stats detailed summary */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider">Métricas Clave</h4>
            
            <div className="space-y-3.5">
              <div className="flex justify-between text-sm font-medium border-b border-cream-100 pb-2">
                <span className="text-grayblue-500">Inversión inicial:</span>
                <span className="text-grayblue-900 font-bold">${lote.inversion.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-b border-cream-100 pb-2">
                <span className="text-grayblue-500">Vendido:</span>
                <span className="text-sage-600 font-bold">${lote.ventas.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-b border-cream-100 pb-2">
                <span className="text-grayblue-500">Ganancia neta:</span>
                <span className="text-terracotta-500 font-bold">${lote.ganancia.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-grayblue-500">Margen del lote:</span>
                <span className="text-grayblue-950 font-bold">{marginPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Batch product lists */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <h4 className="text-sm font-bold text-grayblue-900">Prendas en este Lote ({batchProducts.length})</h4>
            <button
              onClick={() => navigateTo('negocio-registrar-producto')}
              className="flex items-center gap-1.5 text-xs font-bold text-terracotta-500 hover:text-terracotta-600"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Agregar prenda al lote</span>
            </button>
          </div>
          
          <div className="overflow-x-auto table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100/50 border-b border-cream-200 text-[10px] font-bold text-grayblue-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Prenda / Descripción</th>
                  <th className="py-3 px-4 text-center">Talla</th>
                  <th className="py-3 px-4 text-right">Costo</th>
                  <th className="py-3 px-4 text-right">Precio Venta</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-sm">
                {batchProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-grayblue-400 font-semibold">
                      No hay prendas registradas para este lote.
                    </td>
                  </tr>
                ) : (
                  batchProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-grayblue-900 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-terracotta-400" />
                        {p.descripcion}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-grayblue-700">{p.talla}</td>
                      <td className="py-3.5 px-4 text-right text-grayblue-500 font-medium">
                        ${p.costo.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-sage-600 font-bold">
                        ${p.precio.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 border rounded-md text-[10px] font-bold ${
                          p.estado === 'Disponible' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : p.estado === 'Apartado'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-grayblue-50 text-grayblue-500 border-grayblue-100'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
