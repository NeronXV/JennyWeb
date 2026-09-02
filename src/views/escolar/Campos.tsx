import React from 'react';
import { useAppState } from '../../context/AppContext';
import { BookOpen, Binary, Globe, HeartHandshake, Sparkles } from 'lucide-react';

export const Campos: React.FC = () => {
  const { camposFormativos, porcentajes, navigateTo } = useAppState();

  const getFormatStats = (id: string) => {
    const p = porcentajes[id] || { actividades: 35, tareas: 25, examen: 25, participacion: 15 };
    return `Actividades (${p.actividades}%) • Tareas (${p.tareas}%) • Examen (${p.examen}%) • Participación (${p.participacion}%)`;
  };

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
          stats: getFormatStats('lenguajes')
        };
      case 'saberes':
        return {
          icon: Binary,
          bg: 'bg-amber-50/50 hover:bg-amber-50',
          border: 'border-amber-100 hover:border-amber-200',
          iconColor: 'text-amber-600 bg-amber-100',
          desc: 'Matemáticas, Física, Biología y Química. Enfocado en el pensamiento lógico y la investigación.',
          stats: getFormatStats('saberes')
        };
      case 'etica':
        return {
          icon: Globe,
          bg: 'bg-emerald-50/50 hover:bg-emerald-50',
          border: 'border-emerald-100 hover:border-emerald-200',
          iconColor: 'text-emerald-600 bg-emerald-100',
          desc: 'Geografía, Historia, Formación Cívica. Comprensión del entorno social, natural y ético.',
          stats: getFormatStats('etica')
        };
      case 'humano':
        return {
          icon: HeartHandshake,
          bg: 'bg-rose-50/50 hover:bg-rose-50',
          border: 'border-rose-100 hover:border-rose-200',
          iconColor: 'text-rose-600 bg-rose-100',
          desc: 'Educación Física, Socioemocional, Vida Saludable. Formación integral para la convivencia y la salud.',
          stats: getFormatStats('humano')
        };
      default:
        return {
          icon: BookOpen,
          bg: 'bg-cream-50',
          border: 'border-cream-200',
          iconColor: 'text-sage-600 bg-sage-100',
          desc: '',
          stats: getFormatStats(id)
        };
    }
  };

  return (
    <div className="space-y-8">
      
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        <h3 className="text-xl font-bold text-grayblue-900 mb-1">
          Campos Formativos (Nueva Escuela Mexicana)
        </h3>
        <p className="text-sm font-semibold text-grayblue-500">
          Selecciona un campo formativo para capturar calificaciones, actividades, tareas, participación o exámenes.
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

      {/* Diagnóstico Inicial Card */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 text-grayblue-800 font-extrabold text-base">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h4>Periodo de Diagnóstico Inicial</h4>
        </div>

        <button
          onClick={() => navigateTo('escolar-actividades', { campoId: 'diagnostico' })}
          className="w-full flex flex-col md:flex-row justify-between items-start md:items-center text-left p-6 md:p-8 rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30 hover:border-indigo-300 transition-all duration-300 group cursor-pointer hover:shadow-lg gap-6"
        >
          <div className="flex items-start gap-5">
            <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-extrabold text-grayblue-900 group-hover:text-indigo-600 transition-colors">
                  Diagnóstico Inicial
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                  Evaluación Diagnóstica
                </span>
              </div>
              <p className="text-sm text-grayblue-500 font-medium max-w-2xl leading-relaxed">
                Captura de actividades, tareas diagnósticas, participación y prueba diagnóstica al comienzo del ciclo escolar.
              </p>
            </div>
          </div>

          <div className="shrink-0 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-2xl">
            {getFormatStats('diagnostico')}
          </div>
        </button>
      </div>

    </div>
  );
};
