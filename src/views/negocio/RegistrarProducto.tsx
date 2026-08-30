import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { Camera, Sparkles } from 'lucide-react';

export const RegistrarProducto: React.FC = () => {
  const { lotes, addProducto, navigateTo } = useAppState();

  // Form State
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Blusas');
  const [talla, setTalla] = useState('M');
  const [costo, setCosto] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [loteId, setLoteId] = useState(lotes[0]?.id || '');
  const [notas, setNotas] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  // Live calculations
  const parsedCosto = parseFloat(costo) || 0;
  const parsedPrecio = parseFloat(precio) || 0;
  const parsedCantidad = parseInt(cantidad) || 0;

  const gananciaUnitaria = Math.max(0, parsedPrecio - parsedCosto);
  const gananciaPotencialTotal = gananciaUnitaria * parsedCantidad;

  const categories = [
    'Blusas', 'Trajes', 'Pantalones', 'Camisas', 
    'Vestidos', 'Sudaderas', 'Playeras', 'Suéteres', 
    'Shorts', 'Accesorios', 'Aromatizantes', 'Otros'
  ];

  const sizes = ['Única', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', 'Ajustable'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !costo || !precio || !loteId) return;

    addProducto({
      descripcion,
      categoria,
      talla,
      costo: parsedCosto,
      precio: parsedPrecio,
      cantidad: parsedCantidad,
      loteId,
      notas,
      estado: 'Disponible',
      foto: null
    });

    // Notify success
    alert('¡Producto agregado al inventario exitosamente!');
    
    // Clear form
    setDescripcion('');
    setCosto('');
    setPrecio('');
    setCantidad('1');
    setNotas('');
    navigateTo('negocio-inventario');
  };

  const handleSimulatePhoto = () => {
    // Simulate loading camera/image upload
    alert('Simulación: Fotografía de la prenda cargada.');
    setFoto('https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=200&auto=format&fit=crop');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        <h3 className="text-xl font-bold text-grayblue-900 mb-1">Registrar Nueva Prenda / Artículo</h3>
        <p className="text-sm font-semibold text-grayblue-500">
          Llena la información de la prenda para integrarla al lote e inventario disponible.
        </p>
      </div>

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
        
        {/* Form fields */}
        <div className="p-6 md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Foto uploader mock */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-grayblue-500 uppercase block mb-2 text-center w-full">
                Foto Prenda
              </span>
              <div 
                onClick={handleSimulatePhoto}
                className="w-40 h-48 border-2 border-dashed border-cream-300 hover:border-terracotta-400 bg-cream-50/50 hover:bg-cream-100/50 transition-all rounded-2xl flex flex-col items-center justify-center p-3 text-center cursor-pointer relative overflow-hidden"
              >
                {foto ? (
                  <>
                    <img src={foto} alt="Preview" className="object-cover w-full h-full rounded-xl" />
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFoto(null); }}
                      className="absolute bottom-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs font-bold"
                    >
                      X
                    </button>
                  </>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-grayblue-400 mb-1.5" />
                    <span className="text-xs font-bold text-grayblue-800 leading-tight">Tomar / Subir foto</span>
                    <span className="text-[10px] text-grayblue-400 mt-1">Opcional</span>
                  </>
                )}
              </div>
            </div>

            {/* Main Form Details */}
            <div className="md:col-span-2 space-y-5">
              
              <div>
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                  Descripción del Producto
                </label>
                <input
                  type="text"
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
                  placeholder="Ej. Terno negro formal slim fit, Blusa GAP azul"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                    Talla
                  </label>
                  <select
                    value={talla}
                    onChange={(e) => setTalla(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
                  >
                    {sizes.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

          </div>

          <hr className="border-cream-100" />

          {/* Pricing fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                Costo Unitario ($)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white font-bold"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                Precio de Venta ($)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white font-bold text-sage-600"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                Cantidad Inicial
              </label>
              <input
                type="number"
                required
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                Lote de Compra
              </label>
              <select
                value={loteId}
                onChange={(e) => setLoteId(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
              >
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes field */}
          <div>
            <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
              Notas Adicionales
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white resize-none"
              placeholder="Ej. Detalle en la bastilla, talla reducida..."
            />
          </div>

          {/* live profit helper */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="h-5 w-5 shrink-0" />
              <div className="text-xs font-bold text-left">
                <span className="block">Ganancia Estimada por Prenda: ${gananciaUnitaria.toLocaleString()}</span>
                <span className="text-emerald-600 block text-[10px]">Calculada como Precio - Costo</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">Ganancia Potencial Total</span>
              <span className="text-xl font-black text-emerald-800">${gananciaPotencialTotal.toLocaleString()}</span>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-6 bg-cream-50 border-t border-cream-100 flex gap-4">
          <button
            type="button"
            onClick={() => navigateTo('negocio-dashboard')}
            className="flex-1 py-3.5 bg-white hover:bg-cream-100 text-grayblue-700 font-bold rounded-xl text-sm transition-colors border border-cream-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
          >
            Agregar Producto
          </button>
        </div>

      </form>

    </div>
  );
};
