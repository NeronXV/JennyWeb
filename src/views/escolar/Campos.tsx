import React from 'react';
import { useAppState } from '../../context/AppContext';
import { BookOpen, Binary, Globe, HeartHandshake } from 'lucide-react';

export const Campos: React.FC = () => {
  const { camposFormativos, navigateTo } = useAppState();

  // Helper icons and styles for each field
  const getFieldDesign = (id: string) => {
    switch (id) {
      case 'lenguajes':
        return {
          icon: BookOpen,
          bg: 'bg-indigo-50/50 hover:bg-indigo-50',
          border: 'border-indigo-100 hover:border-indigo-200',
          iconColor: 'text-indigo-600 bg-indigo-100',
          desc: 'Español, Inglés, Artes y Lengua de Señas. Desarrolla la expresión oral, escrita y artística.',
          stats: 'Examen activo • Actividades (40%) • Tareas (30%) • Examen (30%)'
        };
      case 'saberes':
        return {
          icon: Binary,
          bg: 'bg-amber-50/50 hover:bg-amber-50',
          border: 'border-amber-100 hover:border-amber-200',
          iconColor: 'text-amber-600 bg-amber-100',
          desc: 'Matemáticas, Física, Biología y Química. Enfocado en el pensamiento lógico y la investigación.',
          stats: 'Examen activo • Actividades (40%) • Tareas (30%) • Examen (30%)'
        };
      case 'etica':
        return {
          icon: Globe,
          bg: 'bg-emerald-50/50 hover:bg-emerald-50',
          border: 'border-emerald-100 hover:border-emerald-200',
          iconColor: 'text-emerald-600 bg-emerald-100',
          desc: 'Geografía, Historia, Formación Cívica. Comprensión del entorno social, natural y ético.',
          stats: 'Sin examen • Actividades (60%) • Tareas (40%)'
        };
      case 'humano':
        return {
          icon: HeartHandshake,
          bg: 'bg-rose-50/50 hover:bg-rose-50',
          border: 'border-rose-100 hover:border-rose-200',
          iconColor: 'text-rose-600 bg-rose-100',
          desc: 'Educación Física, Socioemocional, Vida Saludable. Formación integral para la convivencia y la salud.',
          stats: 'Sin examen • Actividades (60%) • Tareas (40%)'
        };
      default:
        return {
          icon: BookOpen,
          bg: 'bg-cream-50',
          border: 'border-cream-200',
          iconColor: 'text-sage-600 bg-sage-100',
          desc: '',
          stats: ''
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        <h3 className="text-xl font-bold text-grayblue-900 mb-1">
          Campos Formativos (Nueva Escuela Mexicana)
        </h3>
        <p className="text-sm font-semibold text-grayblue-500">
          Selecciona un campo formativo para capturar calificaciones, actividades, tareas o registrar exámenes trimestrales.
        </p>
      </div>

      {/* Fields Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {camposFormativos.map((campo) => {
          const design = getFieldDesign(campo.id);
          const Icon = design.icon;

          return (
            <button
              key={campo.id}
              onClick={() => navigateTo('escolar-actividades', { campoId: campo.id })}
              className={`flex flex-col text-left p-6 md:p-8 rounded-3xl border transition-all duration-300 group cursor-pointer ${design.bg} ${design.border} hover:shadow-lg`}
            >
              <div className="space-y-6 flex-1">
                {/* Field Icon */}
                <div className={`inline-flex p-4 rounded-2xl ${design.iconColor} group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Title & Desc */}
                <div className="space-y-3">
                  <h4 className="text-xl font-extrabold text-grayblue-900 group-hover:text-sage-600 transition-colors">
                    {campo.nombre}
                  </h4>
                  <p className="text-sm text-grayblue-500 font-medium leading-relaxed">
                    {design.desc}
                  </p>
                </div>
              </div>

              {/* Status info */}
              <div className="mt-8 pt-4 border-t border-cream-200/60 w-full text-xs font-bold text-grayblue-400">
                {design.stats}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
