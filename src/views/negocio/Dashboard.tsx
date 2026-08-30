import React from 'react';
import { useAppState, type ViewType } from '../../context/AppContext';
import { BarChart, BatchProfitChart } from '../../components/Charts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  PlusCircle, 
  Search 
} from 'lucide-react';

export const DashboardNegocio: React.FC = () => {
  const { lotes, productos, navigateTo } = useAppState();

  // Aggregate metrics from active mock database
  const totalInvertido = lotes.reduce((acc, l) => acc + l.inversion, 0);
  const totalVendido = lotes.reduce((acc, l) => acc + l.ventas, 0);
  const totalGanancia = lotes.reduce((acc, l) => acc + l.ganancia, 0);
  
  // Calculate inventory value (cost of available items)
  const inventarioDisponible = productos
    .filter(p => p.estado === 'Disponible' || p.estado === 'Apartado')
    .reduce((acc, p) => acc + (p.costo * p.cantidad), 0);

  const quickActions = [
    { label: 'Punto de venta (POS)', view: 'negocio-pos' as ViewType, color: 'bg-terracotta-500 hover:bg-terracotta-600', icon: ShoppingBag },
    { label: 'Ver inventario', view: 'negocio-inventario' as ViewType, color: 'bg-sage-500 hover:bg-sage-600', icon: Search },
    { label: 'Registrar producto', view: 'negocio-registrar-producto' as ViewType, color: 'bg-grayblue-500 hover:bg-grayblue-600', icon: PlusCircle },
    { label: 'Mis compras y lotes', view: 'negocio-lotes' as ViewType, color: 'bg-cream-600 hover:bg-cream-700', icon: Layers },
  ];

  return (
    <div className="space-y-8">
      
      {/* Upper header filter bar */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider mb-1">
            Periodo Activo
          </h3>
          <span className="text-sm font-bold text-grayblue-900">Agosto 2026</span>
        </div>
        <div className="text-xs font-semibold text-grayblue-500 bg-cream-50 px-3 py-1.5 rounded-lg border border-cream-100">
          Moneda: MXN ($)
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* KPI 1: Invertido */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-cream-100 p-3.5 rounded-xl text-grayblue-700 shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Invertido</span>
            <span className="text-2xl font-black text-grayblue-950 block">
              ${totalInvertido.toLocaleString()}
            </span>
          </div>
        </div>

        {/* KPI 2: Vendido */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-sage-50 p-3.5 rounded-xl text-sage-600 shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Vendido</span>
            <span className="text-2xl font-black text-grayblue-950 block">
              ${totalVendido.toLocaleString()}
            </span>
          </div>
        </div>

        {/* KPI 3: Ganancia */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-terracotta-50 p-3.5 rounded-xl text-terracotta-50 shrink-0 text-terracotta-500">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Ganancia</span>
            <span className="text-2xl font-black text-grayblue-950 block">
              ${totalGanancia.toLocaleString()}
            </span>
          </div>
        </div>

        {/* KPI 4: Inventario Disponible */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-4">
          <div className="bg-grayblue-50 p-3.5 rounded-xl text-grayblue-500 shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-grayblue-400 uppercase block">Inventario Disp.</span>
            <span className="text-2xl font-black text-grayblue-950 block">
              ${inventarioDisponible.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <BarChart />
        <BatchProfitChart lotes={lotes} />
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-grayblue-900">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((act, index) => {
            const Icon = act.icon;
            return (
              <button
                key={index}
                onClick={() => navigateTo(act.view)}
                className="flex items-center gap-4 bg-white hover:bg-cream-100 border border-cream-200 hover:border-cream-300 p-5 rounded-2xl transition-all shadow-xs text-left group cursor-pointer"
              >
                <div className={`${act.color} text-white p-3 rounded-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-grayblue-900 text-sm md:text-base leading-snug">
                    {act.label}
                  </h4>
                  <span className="text-xs font-semibold text-grayblue-400">Ir al módulo</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
