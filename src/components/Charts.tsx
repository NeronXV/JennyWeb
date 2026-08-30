import React from 'react';

// Monthly Sales Data
const monthlyData = [
  { month: 'Abr', ventas: 12000, ganancia: 5400 },
  { month: 'May', ventas: 18500, ganancia: 8300 },
  { month: 'Jun', ventas: 22000, ganancia: 9900 },
  { month: 'Jul', ventas: 28400, ganancia: 12800 },
  { month: 'Ago', ventas: 58855, ganancia: 26255 },
];

export const BarChart: React.FC = () => {
  const maxVal = 65000;

  return (
    <div className="bg-white p-6 rounded-2xl border border-cream-200">
      <h3 className="text-sm font-semibold text-grayblue-500 mb-6 uppercase tracking-wider">
        Ventas y ganancias por mes
      </h3>
      <div className="h-64 flex items-end gap-3 md:gap-6 pt-4">
        {monthlyData.map((d, index) => {
          const salesHeight = (d.ventas / maxVal) * 100;
          const profitHeight = (d.ganancia / maxVal) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
              {/* Tooltip Group */}
              <div className="w-full flex justify-center gap-1 mb-2 items-end grow">
                {/* Sales Bar */}
                <div 
                  className="w-3 md:w-5 bg-sage-400 rounded-t-md hover:bg-sage-500 transition-all duration-300 relative group"
                  style={{ height: `${salesHeight}%` }}
                >
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 bg-grayblue-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 pointer-events-none mb-1 shadow-md">
                    Venta: ${d.ventas.toLocaleString()}
                  </span>
                </div>
                {/* Profit Bar */}
                <div 
                  className="w-3 md:w-5 bg-terracotta-400 rounded-t-md hover:bg-terracotta-500 transition-all duration-300 relative group"
                  style={{ height: `${profitHeight}%` }}
                >
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 bg-grayblue-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 pointer-events-none mb-1 shadow-md">
                    Ganancia: ${d.ganancia.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-grayblue-400 mt-2">{d.month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-6 justify-center text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-sage-400 rounded-xs"></div>
          <span className="text-grayblue-500">Ventas totales</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 bg-terracotta-400 rounded-xs"></div>
          <span className="text-grayblue-500">Ganancia neta</span>
        </div>
      </div>
    </div>
  );
};

// Batch Profit Data
interface BatchProfitProps {
  lotes: {
    nombre: string;
    inversion: number;
    ventas: number;
    ganancia: number;
  }[];
}

export const BatchProfitChart: React.FC<BatchProfitProps> = ({ lotes }) => {
  const maxGain = Math.max(...lotes.map(l => l.ganancia), 1000);

  return (
    <div className="bg-white p-6 rounded-2xl border border-cream-200">
      <h3 className="text-sm font-semibold text-grayblue-500 mb-6 uppercase tracking-wider">
        Ganancia por Lote
      </h3>
      <div className="space-y-4">
        {lotes.map((lote, index) => {
          const pct = (lote.ganancia / maxGain) * 100;
          
          // Custom color cycle for beautiful visual appearance
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
