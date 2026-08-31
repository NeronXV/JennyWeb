import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppContext';
import { Camera, Sparkles, X, CheckCircle2, Plus, Store } from 'lucide-react';
import { fileToBase64 } from '../../utils/exportUtils';

export const RegistrarProducto: React.FC = () => {
  const { lotes, addLote, addProducto, navigateTo } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Termos y Vasos');
  const [customCategoria, setCustomCategoria] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [talla, setTalla] = useState('Única');
  const [costo, setCosto] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [loteId, setLoteId] = useState(lotes[0]?.id || 'general');
  const [notas, setNotas] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  // Quick New Lote Modal State
  const [newLoteModalOpen, setNewLoteModalOpen] = useState(false);
  const [newLoteNombre, setNewLoteNombre] = useState('');
  const [newLoteInversion, setNewLoteInversion] = useState('');

  // Live calculations
  const parsedCosto = parseFloat(costo) || 0;
  const parsedPrecio = parseFloat(precio) || 0;
  const parsedCantidad = parseInt(cantidad) || 0;

  const gananciaUnitaria = Math.max(0, parsedPrecio - parsedCosto);
  const gananciaPotencialTotal = gananciaUnitaria * parsedCantidad;

  const defaultCategories = [
    'Termos y Vasos', 'Bolsas y Mochilas', 'Ropa y Prendas', 
    'Blusas', 'Vestidos', 'Pantalones', 'Sudaderas', 'Playeras', 
    'Calzado', 'Accesorios y Joyería', 'Cosméticos y Cuidado', 
    'Aromatizantes', 'Hogar y Decoración', 'Papelería y Escolares', 'Otro'
  ];

  const sizes = ['Única', 'Ajustable', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '12 oz', '20 oz', '30 oz', '40 oz (1.2L)'];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file, 600, 0.85);
      setFoto(base64);
    } catch (err) {
      alert('Error al procesar la fotografía.');
    }
  };

  const handleCreateQuickLote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoteNombre.trim()) return;

    const newId = 'l_' + Date.now();
    addLote({
      nombre: newLoteNombre.trim(),
      fecha: new Date().toISOString().split('T')[0],
      inversion: parseFloat(newLoteInversion) || 0,
      estado: 'Activo'
    });

    setLoteId(newId);
    setNewLoteNombre('');
    setNewLoteInversion('');
    setNewLoteModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !costo || !precio) return;

    const finalCategory = isCustomCat && customCategoria.trim() ? customCategoria.trim() : categoria;

    addProducto({
      descripcion: descripcion.trim(),
      categoria: finalCategory,
      talla,
      costo: parsedCosto,
      precio: parsedPrecio,
      cantidad: parsedCantidad,
      loteId: loteId || 'general',
      notas,
      estado: 'Disponible',
      foto: foto
    });

    setSuccessToast(true);

    setTimeout(() => {
      setDescripcion('');
      setCosto('');
      setPrecio('');
      setCantidad('1');
      setNotas('');
      setFoto(null);
      setSuccessToast(false);
      navigateTo('negocio-inventario');
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="font-bold text-sm">¡Artículo registrado exitosamente en el inventario!</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        <h3 className="text-xl font-bold text-grayblue-900 mb-1">Registrar Nuevo Producto o Prenda</h3>
        <p className="text-sm font-semibold text-grayblue-500">
          Registra termos, ropa, bolsas, accesorios o cualquier producto con su costo, precio y foto.
        </p>
      </div>

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
        
        {/* Form fields */}
        <div className="p-6 md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Foto uploader with Real File Input */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-grayblue-500 uppercase block mb-2 text-center w-full">
                Foto del Producto
              </span>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-44 h-52 border-2 border-dashed border-cream-300 hover:border-terracotta-400 bg-cream-50/50 hover:bg-cream-100/50 transition-all rounded-2xl flex flex-col items-center justify-center p-3 text-center cursor-pointer relative overflow-hidden group"
              >
                {foto ? (
                  <>
                    <img src={foto} alt="Preview" className="object-cover w-full h-full rounded-xl" />
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFoto(null); }}
                      className="absolute bottom-2 right-2 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full text-xs font-bold shadow-md cursor-pointer"
                      title="Eliminar foto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-cream-100 group-hover:bg-terracotta-50 p-3.5 rounded-full mb-2 text-grayblue-400 group-hover:text-terracotta-500 transition-colors">
                      <Camera className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-grayblue-800 leading-tight">Subir / Tomar foto</span>
                    <span className="text-[10px] text-grayblue-400 mt-1">Cámara o Galería</span>
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
                  placeholder="Ej. Termo Stanley 40oz rosa pastel, Blusa GAP azul, Bolsa Guess"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
                      Categoría
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCat(!isCustomCat)}
                      className="text-[10px] text-terracotta-600 font-bold hover:underline cursor-pointer"
                    >
                      {isCustomCat ? 'Elegir de lista' : '+ Otra categoría'}
                    </button>
                  </div>
                  
                  {isCustomCat ? (
                    <input
                      type="text"
                      value={customCategoria}
                      onChange={(e) => setCustomCategoria(e.target.value)}
                      placeholder="Escribe la categoría..."
                      className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
                    />
                  ) : (
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white cursor-pointer"
                    >
                      {defaultCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                    Talla o Capacidad
                  </label>
                  <select
                    value={talla}
                    onChange={(e) => setTalla(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white cursor-pointer"
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

          {/* Pricing & Lote fields */}
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
                Cantidad / Stock
              </label>
              <input
                type="number"
                required
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white font-semibold"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
                  Lote / Origen
                </label>
                <button
                  type="button"
                  onClick={() => setNewLoteModalOpen(true)}
                  className="text-[10px] text-terracotta-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                  title="Crear un lote nuevo"
                >
                  <Plus className="h-3 w-3" />
                  Nuevo Lote
                </button>
              </div>
              <select
                value={loteId}
                onChange={(e) => setLoteId(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white cursor-pointer"
              >
                <option value="general">📦 Stock General / Compra Directa</option>
                {lotes.map(l => (
                  <option key={l.id} value={l.id}>
                    🏷️ {l.nombre} ({l.fecha})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ganancia en Vivo */}
          <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sage-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-sage-800 block">Proyección de Ganancia</span>
                <span className="text-xs text-sage-600">
                  Margen por unidad: <strong className="font-bold text-sage-800">${gananciaUnitaria.toFixed(2)}</strong>
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block">Ganancia Potencial Total</span>
              <span className="text-xl font-black text-sage-800">${gananciaPotencialTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white resize-none"
              placeholder="Color, grabado especial, detalles del proveedor o modelo..."
            />
          </div>

        </div>

        {/* Action Button */}
        <div className="p-6 bg-cream-50/50 border-t border-cream-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigateTo('negocio-inventario')}
            className="px-6 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-sm text-grayblue-700 cursor-pointer"
          >
            Ver Inventario
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-terracotta-500 hover:bg-terracotta-600 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md shadow-terracotta-200 transition-all cursor-pointer"
          >
            Guardar Producto en Inventario
          </button>
        </div>

      </form>

      {/* MODAL: CREAR NUEVO LOTE RÁPIDO */}
      {newLoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setNewLoteModalOpen(false)} />
          <div className="relative bg-white border border-cream-200 rounded-3xl w-full max-w-md p-6 shadow-2xl z-10 animate-scale-in">
            
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-terracotta-100 p-2.5 rounded-2xl text-terracotta-600">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-grayblue-900">Crear Nuevo Lote / Origen</h3>
                  <p className="text-xs text-grayblue-400">Agrupa tus compras por tienda, proveedor o fecha</p>
                </div>
              </div>
              <button 
                onClick={() => setNewLoteModalOpen(false)}
                className="p-1.5 hover:bg-cream-100 rounded-xl text-grayblue-400 hover:text-grayblue-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickLote} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                  Nombre del Lote / Tienda / Proveedor
                </label>
                <input
                  type="text"
                  required
                  value={newLoteNombre}
                  onChange={(e) => setNewLoteNombre(e.target.value)}
                  placeholder="Ej. Termos Mayoreo, Liverpool, Amazon, Ross..."
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                  Inversión Total Estimada ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newLoteInversion}
                  onChange={(e) => setNewLoteInversion(e.target.value)}
                  placeholder="0.00 (Opcional)"
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setNewLoteModalOpen(false)}
                  className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-xs text-grayblue-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Crear y Asignar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
