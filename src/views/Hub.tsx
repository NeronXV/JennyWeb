import React from 'react';
import { useAppState } from '../context/AppContext';
import { GraduationCap, Store, ArrowRight } from 'lucide-react';

export const Hub: React.FC = () => {
  const { navigateTo } = useAppState();

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-12">
      {/* Welcome Header */}
      <div className="text-center md:text-left space-y-2">
        <h2 className="text-4xl font-extrabold text-grayblue-900 tracking-tight">
          Hola, Jenny 👋
        </h2>
        <p className="text-lg font-medium text-grayblue-500">
          ¿Qué quieres administrar hoy? Selecciona uno de tus módulos de trabajo.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Module 1: Control Escolar */}
        <div className="bg-white border border-cream-200 rounded-3xl p-8 hover:shadow-xl hover:border-sage-200 transition-all duration-300 group flex flex-col justify-between">
          <div className="space-y-6">
            <div className="inline-flex bg-sage-100 p-4 rounded-2xl text-sage-600 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-grayblue-900 flex items-center gap-2">
                Control Escolar
              </h3>
              <p className="text-grayblue-500 font-medium leading-relaxed">
                Organiza alumnos, asistencia diaria, registro de actividades, tareas y calificaciones de tu grupo escolar.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-cream-100">
            <button
              onClick={() => navigateTo('escolar-dashboard')}
              className="w-full flex items-center justify-between bg-sage-500 hover:bg-sage-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-md shadow-sage-100 active:scale-[0.98] cursor-pointer"
            >
              <span>Entrar a mi grupo</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Module 2: Mi Negocio */}
        <div className="bg-white border border-cream-200 rounded-3xl p-8 hover:shadow-xl hover:border-terracotta-200 transition-all duration-300 group flex flex-col justify-between">
          <div className="space-y-6">
            <div className="inline-flex bg-terracotta-100 p-4 rounded-2xl text-terracotta-500 group-hover:scale-110 transition-transform duration-300">
              <Store className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-grayblue-900 flex items-center gap-2">
                Mi Negocio
              </h3>
              <p className="text-grayblue-500 font-medium leading-relaxed">
                Controla compras por lote, inventario general, precios, registro de ventas, inversión realizada y ganancia neta.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-cream-100">
            <button
              onClick={() => navigateTo('negocio-dashboard')}
              className="w-full flex items-center justify-between bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-md shadow-terracotta-100 active:scale-[0.98] cursor-pointer"
            >
              <span>Entrar a mi negocio</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Guide Note */}
      <div className="bg-cream-100 border border-cream-200 rounded-2xl p-6 text-center text-sm font-semibold text-grayblue-500">
        💡 Recuerda que puedes alternar entre ambos módulos rápidamente usando la barra lateral de navegación.
      </div>
    </div>
  );
};
