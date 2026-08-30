import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { ShoppingBag, DollarSign, User, ShieldCheck } from 'lucide-react';

export const POS: React.FC = () => {
  const { productos, registrarVenta } = useAppState();

  // Load only available garments for sale
  const availableGarments = productos.filter(p => p.estado === 'Disponible' || p.estado === 'Apartado');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(availableGarments[0]?.id || '');
  const [cliente, setCliente] = useState('');
  const [formaPago, setFormaPago] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Pendiente'>('Efectivo');
  const [customPrice, setCustomPrice] = useState('');

  // Find currently selected product details
  const selectedProduct = productos.find(p => p.id === selectedProductId);

  // Fallbacks and pricing variables
  const suggestPrice = selectedProduct?.precio || 0;
  const productCost = selectedProduct?.costo || 0;
  const finalPrice = customPrice !== '' ? parseFloat(customPrice) : suggestPrice;
  const currentGain = Math.max(0, finalPrice - productCost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !cliente.trim()) return;

    registrarVenta({
      productoId: selectedProductId,
      precioFinal: finalPrice,
      cliente,
      formaPago
    });

    // POS Success notification banner
    const alertBox = document.createElement('div');
    alertBox.className = 'fixed bottom-5 right-5 bg-terracotta-500 text-white py-3.5 px-6 rounded-2xl shadow-lg border border-terracotta-600 font-semibold text-sm z-50 flex items-center gap-2 animate-slide-in';
    alertBox.innerHTML = `
      <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>¡Venta de "${selectedProduct?.descripcion}" registrada con éxito!</span>
    `;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => alertBox.remove(), 500);
    }, 3000);

    // Reset Form
    setCliente('');
    setCustomPrice('');
    // Switch to next available if any
    const remaining = availableGarments.filter(p => p.id !== selectedProductId);
    setSelectedProductId(remaining[0]?.id || '');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        <h3 className="text-xl font-bold text-grayblue-900 mb-1">Registrar Nueva Venta (Punto de Venta)</h3>
        <p className="text-sm font-semibold text-grayblue-500">
          Selecciona una prenda disponible en tu inventario para registrar su cobro.
        </p>
      </div>

      {availableGarments.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-3xl border border-cream-200 text-grayblue-400 font-semibold space-y-4">
          <ShoppingBag className="h-12 w-12 text-grayblue-300 mx-auto" />
          <p>No hay productos disponibles para venta en el inventario actual.</p>
          <p className="text-xs font-medium text-grayblue-400">
            Registra una nueva compra o lote para abastecer prendas.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
          
          <div className="p-6 md:p-8 space-y-5">
            
            {/* Product Selector */}
            <div>
              <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                Seleccionar Prenda / Artículo
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setCustomPrice(''); // Reset customizable pricing override
                }}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400 font-bold"
              >
                {availableGarments.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.categoria}] {p.descripcion} (Talla: {p.talla}) — Sugerido: ${p.precio}
                  </option>
                ))}
              </select>
            </div>

            {/* Client input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                  Nombre del Cliente
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-grayblue-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-terracotta-400 focus:bg-white"
                    placeholder="Ej. Patricia Flores"
                  />
                </div>
              </div>

              {/* Forma Pago Selector */}
              <div>
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                  Forma de Pago
                </label>
                <select
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value as any)}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-terracotta-400"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="Pendiente">Dejar Cuenta Pendiente (Fiar)</option>
                </select>
              </div>
            </div>

            <hr className="border-cream-100" />

            {/* Pricing Overview grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-cream-50 border border-cream-100 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold text-grayblue-400 uppercase block">Costo Prenda</span>
                <span className="text-base font-bold text-grayblue-700 block">${productCost.toLocaleString()}</span>
              </div>

              <div className="bg-cream-50 border border-cream-100 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold text-grayblue-400 uppercase block">Precio Sugerido</span>
                <span className="text-base font-bold text-sage-600 block">${suggestPrice.toLocaleString()}</span>
              </div>

              {/* Customizable Override Price Input */}
              <div className="bg-white border-2 border-dashed border-cream-200 p-2.5 rounded-xl">
                <label className="text-[9px] font-bold text-terracotta-500 uppercase block leading-none mb-1">
                  Precio Cobrado ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full text-center py-1 bg-cream-50 focus:bg-white border border-cream-200 rounded-lg text-sm font-bold text-grayblue-900 focus:outline-none focus:border-terracotta-400"
                  placeholder={suggestPrice.toString()}
                />
              </div>
            </div>

            {/* live potential gain calculations */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <div className="text-xs font-bold text-left">
                  <span className="block">Ganancia Directa de Venta: ${currentGain.toLocaleString()}</span>
                  <span className="text-emerald-600 block text-[10px]">Calculada como Precio Final - Costo de prenda</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Precio Total</span>
                <span className="text-xl font-black text-emerald-800">${finalPrice.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Footer Submit Button */}
          <div className="p-6 bg-cream-50 border-t border-cream-100">
            <button
              type="submit"
              className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-4 rounded-2xl shadow-md shadow-terracotta-200/50 hover:shadow-lg transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <DollarSign className="h-5 w-5" />
              <span>Registrar Venta</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
