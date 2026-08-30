import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { Search, Trash2, Tag, ShieldAlert, Download, Image as ImageIcon } from 'lucide-react';
import { downloadCSV } from '../../utils/exportUtils';

export const Inventario: React.FC = () => {
  const { productos, lotes, eliminarProducto } = useAppState();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLote, setSelectedLote] = useState('todos');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedEstado, setSelectedEstado] = useState('todos');

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = [
    'todos', 'Trajes', 'Blusas', 'Pantalones', 'Camisas', 
    'Vestidos', 'Sudaderas', 'Playeras', 'Chaquetas', 
    'Aromatizantes', 'Suéteres', 'Shorts', 'Accesorios'
  ];

  // Filtering Logic
  const filteredProducts = productos.filter(p => {
    const matchesSearch = p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLote = selectedLote === 'todos' || p.loteId === selectedLote;
    const matchesCategory = selectedCategory === 'todos' || p.categoria === selectedCategory;
    const matchesEstado = selectedEstado === 'todos' || p.estado === selectedEstado;

    return matchesSearch && matchesLote && matchesCategory && matchesEstado;
  });

  const getLoteName = (id: string) => {
    return lotes.find(l => l.id === id)?.nombre || 'Lote Desconocido';
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Disponible':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Apartado':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Vendido':
        return 'bg-grayblue-50 text-grayblue-500 border-grayblue-100';
      default:
        return 'bg-cream-100 text-grayblue-400';
    }
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      const res = eliminarProducto(deleteConfirmId);
      if (res) {
        setDeleteConfirmId(null);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Descripción', 'Categoría', 'Talla', 'Costo ($)', 'Precio Venta ($)', 'Ganancia Potencial ($)', 'Lote', 'Estado', 'Cantidad'];
    const rows = filteredProducts.map(p => [
      p.descripcion,
      p.categoria,
      p.talla,
      p.costo,
      p.precio,
      p.precio - p.costo,
      getLoteName(p.loteId),
      p.estado,
      p.cantidad
    ]);
    downloadCSV('Inventario_Prendas_Jenny', headers, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Filtering Control Bar */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider">
            Filtros y Búsqueda de Inventario ({filteredProducts.length} prendas)
          </h3>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-cream-100 hover:bg-cream-200 text-grayblue-700 font-bold py-2 px-3.5 rounded-xl text-xs transition-colors border border-cream-300 cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Exportar a Excel (CSV)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-grayblue-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar prenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-terracotta-400 focus:bg-white"
            />
          </div>

          {/* Lote Filter */}
          <div>
            <select
              value={selectedLote}
              onChange={(e) => setSelectedLote(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400"
            >
              <option value="todos">Todos los Lotes</option>
              {lotes.map(l => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400"
            >
              <option value="todos">Todas las Categorías</option>
              {categories.slice(1).map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Estado Filter */}
          <div>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Apartado">Apartado</option>
              <option value="Vendido">Vendido</option>
            </select>
          </div>

        </div>
      </div>

      {/* Inventario List Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-100/50 border-b border-cream-200 text-[11px] font-bold text-grayblue-400 uppercase tracking-wider">
                <th className="py-4 px-6 min-w-[220px]">Prenda / Foto</th>
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6 text-center">Talla</th>
                <th className="py-4 px-6 text-right">Costo</th>
                <th className="py-4 px-6 text-right">Precio Venta</th>
                <th className="py-4 px-6 text-right">Ganancia Pot.</th>
                <th className="py-4 px-6">Lote Origen</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-grayblue-400 font-semibold">
                    No se encontraron prendas en el inventario.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const potGain = p.precio - p.costo;

                  return (
                    <tr key={p.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-grayblue-900 flex items-center gap-3">
                        {p.foto ? (
                          <img src={p.foto} alt={p.descripcion} className="w-10 h-10 object-cover rounded-xl border border-cream-200 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-cream-100 text-terracotta-400 rounded-xl flex items-center justify-center shrink-0 border border-cream-200">
                            <Tag className="h-5 w-5" />
                          </div>
                        )}
                        <span className="leading-tight">{p.descripcion}</span>
                      </td>
                      <td className="py-4 px-6 text-grayblue-600 font-medium">{p.categoria}</td>
                      <td className="py-4 px-6 text-center font-bold text-grayblue-700">{p.talla}</td>
                      <td className="py-4 px-6 text-right text-grayblue-500 font-medium">
                        ${p.costo.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right text-sage-600 font-bold">
                        ${p.precio.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right text-terracotta-500 font-bold">
                        ${potGain.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-grayblue-500 font-semibold">
                        {getLoteName(p.loteId)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-2 py-0.5 border rounded-md text-xs font-bold ${getStatusBadge(p.estado)}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {p.estado !== 'Vendido' ? (
                          <button
                            onClick={() => handleDeleteTrigger(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar del inventario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-grayblue-300 font-semibold italic">
                            Vendido
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM DELETE DIALOG MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white border border-cream-200 rounded-3xl w-full max-w-sm p-6 shadow-xl z-10 animate-scale-in">
            <div className="text-center space-y-4">
              <div className="inline-flex bg-rose-50 text-rose-500 p-3 rounded-2xl border border-rose-100">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-grayblue-900">¿Confirmas la eliminación?</h4>
                <p className="text-xs font-medium text-grayblue-400">
                  Esta acción retirará la prenda del inventario y restará su costo de la inversión del lote asignado.
                </p>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-xs text-grayblue-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold text-xs text-white shadow-xs cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
