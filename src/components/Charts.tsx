import React from 'react';
import { ShoppingBag, Layers } from 'lucide-react';
import type { Venta, Lote } from '../context/AppContext';

interface BarChartProps {
  ventas?: Venta[];
}

export const BarChart: React.FC<BarChartProps> = ({ ventas = [] }) => {
  if (ventas.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-cream-200 flex flex-col justify-between">
        <h3 className="text-sm font-semibold text-grayblue-500 mb-6 uppercase tracking-wider">
          Ventas y ganancias por mes
        </h3>
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-grayblue-400">
          <div className="p-3 bg-cream-50 rounded-2xl mb-3 text-grayblue-300">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <span className="font-bold text-grayblue-700 text-sm">No hay ventas registradas aún</span>
          <span className="text-xs text-grayblue-400 mt-1 max-w-xs">
            Las ventas y ganancias cobradas desde el Punto de Venta (POS) se graficarán aquí.
          </span>
        </div>
      </div>
    );
  }

  // Calculate monthly stats from real ventas
  const monthsMap: { [key: string]: { month: string; ventas: number } } = {};
  ventas.forEach(v => {
    const d = new Date(v.fecha);
    const monthKey = !isNaN(d.getTime()) 
      ? d.toLocaleDateString('es-MX', { month: 'short' })
      : 'Mes';
    if (!monthsMap[monthKey]) {
      monthsMap[monthKey] = { month: monthKey, ventas: 0 };
    }
    monthsMap[monthKey].ventas += v.precioFinal;
  });

  const monthlyData = Object.values(monthsMap);
  const maxVal = Math.max(...monthlyData.map(d => d.ventas), 1000);

  return (
    <div className="bg-white p-6 rounded-2xl border border-cream-200">
      <h3 className="text-sm font-semibold text-grayblue-500 mb-6 uppercase tracking-wider">
        Ventas por mes
      </h3>
      <div className="h-64 flex items-end gap-3 md:gap-6 pt-4">
        {monthlyData.map((d, index) => {
          const salesHeight = (d.ventas / maxVal) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
              <div className="w-full flex justify-center gap-1 mb-2 items-end grow">
                <div 
                  className="w-4 md:w-6 bg-sage-400 rounded-t-md hover:bg-sage-500 transition-all duration-300 relative group"
                  style={{ height: `${salesHeight}%` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 bg-grayblue-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 pointer-events-none mb-1 shadow-md">
                    Venta: ${d.ventas.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-grayblue-400 mt-2 capitalize">{d.month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-6 justify-center text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-sage-400 rounded-xs"></div>
          <span className="text-grayblue-500">Ventas totales</span>
        </div>
      </div>
    </div>
  );
};

// Batch Profit Data
interface BatchProfitProps {
  lotes: Lote[];
}

export const BatchProfitChart: React.FC<BatchProfitProps> = ({ lotes }) => {
  if (lotes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-cream-200 flex flex-col justify-between">
        <h3 className="text-sm font-semibold text-grayblue-500 mb-6 uppercase tracking-wider">
          Ganancia por Lote
        </h3>
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-grayblue-400">
          <div className="p-3 bg-cream-50 rounded-2xl mb-3 text-grayblue-300">
            <Layers className="h-8 w-8" />
          </div>
          <span className="font-bold text-grayblue-700 text-sm">No hay lotes registrados aún</span>
          <span className="text-xs text-grayblue-400 mt-1 max-w-xs">
            Registra tus compras en "Mis compras y lotes" para dar seguimiento al retorno de inversión.
          </span>
        </div>
      </div>
    );
  }

  const maxGain = Math.max(...lotes.map(l => l.ganancia), 1000);

  return (
    <div className="bg-white p-6 rounded-2xl border border-cream-200">
      <h3 className="text-sm font-semibold text-grayblue-500 mb-6 uppercase tracking-wider">
        Ganancia por Lote
      </h3>
      <div className="space-y-4">
        {lotes.map((lote, index) => {
          const pct = Math.max(0, (lote.ganancia / maxGain) * 100);
          
          const colors = [
            'bg-sage-400',
            'bg-terracotta-400',
            'bg-grayblue-400',
            'bg-cream-500'
          ];
          const colorClass = colors[index % colors.length];

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-grayblue-900 truncate max-w-[150px]">{lote.nombre}</span>
                <span className="text-sage-600">${lote.ganancia.toLocaleString()}</span>
              </div>
              <div className="w-full bg-cream-100 h-3 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-grayblue-400">
                <span>Inversión: ${lote.inversion.toLocaleString()}</span>
                <span>Vendido: ${lote.ventas.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
