import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { Plus, X, Layers, ArrowRight } from 'lucide-react';

export const Lotes: React.FC = () => {
  const { lotes, addLote, navigateTo } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);

  // New batch form state
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [inversion, setInversion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !inversion.trim()) return;

    addLote({
      nombre,
      fecha,
      inversion: parseFloat(inversion),
      estado: 'Activo'
    });

    // Reset state & close
    setNombre('');
    setFecha(new Date().toISOString().split('T')[0]);
    setInversion('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub header with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        <div>
          <h3 className="text-xl font-bold text-grayblue-900 mb-1">Mis Compras y Lotes</h3>
          <p className="text-sm font-semibold text-grayblue-500">
            Control de adquisiciones y lotes de prendas. Haz clic en un lote para ver su progreso de recuperación.
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar compra</span>
        </button>
      </div>

      {/* Lotes Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-100/50 border-b border-cream-200 text-[11px] font-bold text-grayblue-400 uppercase tracking-wider">
                <th className="py-4 px-6">Lote / Origen</th>
                <th className="py-4 px-6">Fecha Registro</th>
                <th className="py-4 px-6 text-right">Inversión</th>
                <th className="py-4 px-6 text-right">Ventas Totales</th>
                <th className="py-4 px-6 text-right">Ganancia</th>
                <th className="py-4 px-6 text-center">Prendas Restantes</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-sm">
              {lotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-grayblue-400 font-semibold text-sm">
                    No hay lotes registrados aún. Haz clic en "Registrar compra" para agregar tu primer lote.
                  </td>
                </tr>
              ) : (
                lotes.map((lote) => {
                const recovered = lote.ventas >= lote.inversion;

                return (
                  <tr 
                    key={lote.id} 
                    className="hover:bg-cream-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigateTo('negocio-detalle-lote', { batchId: lote.id })}
                  >
                    <td className="py-4 px-6 font-bold text-grayblue-900 group-hover:text-terracotta-500 transition-colors">
                      {lote.nombre}
                    </td>
                    <td className="py-4 px-6 text-grayblue-500 font-semibold">
                      {lote.fecha}
                    </td>
                    <td className="py-4 px-6 text-right text-grayblue-600 font-medium">
                      ${lote.inversion.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right text-sage-600 font-bold">
                      ${lote.ventas.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right text-terracotta-500 font-bold">
                      ${lote.ganancia.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-grayblue-500">
                      {lote.productosRestantes} pzas.
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        recovered 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {recovered ? 'Recuperado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigateTo('negocio-detalle-lote', { batchId: lote.id })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-terracotta-500 hover:text-terracotta-600"
                      >
                        <span>Detalle</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR COMPRA / LOTE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white border border-cream-200 rounded-3xl w-full max-w-md p-6 shadow-xl z-10 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-grayblue-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-terracotta-500" />
                Registrar Compra de Lote
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-cream-100 rounded-lg text-grayblue-400 hover:text-grayblue-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                  Nombre del Lote / Origen
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
                  placeholder="Ej. Ross Agosto, Hollister Lote 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                    Fecha de Compra
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                    Inversión Inicial ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={inversion}
                    onChange={(e) => setInversion(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white font-bold text-grayblue-900"
                    placeholder="Ej. 4500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-sm text-grayblue-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-terracotta-500 hover:bg-terracotta-600 rounded-xl font-bold text-sm text-white shadow-sm"
                >
                  Registrar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
