import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { 
  Plus, 
  FileSpreadsheet, 
  Eye, 
  X, 
  Search, 
  User, 
  Calendar, 
  GraduationCap 
} from 'lucide-react';

export const Alumnos: React.FC = () => {
  const { alumnos, addAlumno, navigateTo } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Add form state
  const [nombre, setNombre] = useState('');
  const [curp, setCurp] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('F');
  const [fechaNacimiento, setFechaNacimiento] = useState('2016-01-01');

  // Filter students based on search term
  const filteredAlumnos = alumnos.filter(al => 
    al.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    al.curp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !curp.trim()) return;

    addAlumno({
      nombre,
      curp: curp.toUpperCase(),
      sexo,
      fechaNacimiento,
      grado: '5.º',
      grupo: 'A'
    });

    // Reset state & close modal
    setNombre('');
    setCurp('');
    setSexo('F');
    setFechaNacimiento('2016-01-01');
    setAddModalOpen(false);
  };

  const openDetails = (student: any) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);
  };

  const handleImportSimulate = () => {
    alert('Simulación: Se han cargado 5 alumnos ficticios desde un archivo de Excel.');
    setImportModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-cream-200 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-grayblue-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Buscar alumno o CURP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-sage-400 focus:bg-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex w-full sm:w-auto gap-3">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cream-100 hover:bg-cream-200 text-grayblue-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors border border-cream-300 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Importar Excel</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm shadow-sage-200 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar alumno</span>
          </button>
        </div>
      </div>

      {/* Alumnos Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-100/50 border-b border-cream-200 text-[11px] font-bold text-grayblue-400 uppercase tracking-wider">
                <th className="py-4 px-6">Nombre</th>
                <th className="py-4 px-6 hidden md:table-cell">CURP</th>
                <th className="py-4 px-6 text-center">Sexo</th>
                <th className="py-4 px-6 hidden lg:table-cell">Nacimiento</th>
                <th className="py-4 px-6 text-center">Grado/Gpo</th>
                <th className="py-4 px-6 text-center">Promedio</th>
                <th className="py-4 px-6 text-center">Asistencia</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-sm">
              {filteredAlumnos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-grayblue-400 font-semibold">
                    No se encontraron alumnos registrados.
                  </td>
                </tr>
              ) : (
                filteredAlumnos.map((al) => (
                  <tr 
                    key={al.id} 
                    className="hover:bg-cream-50/50 transition-colors cursor-pointer group"
                    onClick={() => openDetails(al)}
                  >
                    <td className="py-4 px-6 font-bold text-grayblue-900 group-hover:text-sage-600 transition-colors">
                      {al.nombre}
                    </td>
                    <td className="py-4 px-6 text-grayblue-500 font-semibold hidden md:table-cell">
                      {al.curp}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${
                        al.sexo === 'F' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {al.sexo}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-grayblue-500 hidden lg:table-cell">
                      {al.fechaNacimiento}
                    </td>
                    <td className="py-4 px-6 text-center font-medium text-grayblue-700">
                      {al.grado} "{al.grupo}"
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex font-bold text-sm ${
                        al.promedio >= 9 ? 'text-emerald-600' : al.promedio >= 8 ? 'text-sage-600' : 'text-amber-600'
                      }`}>
                        {al.promedio}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-grayblue-600">
                      {Math.round((al.asistenciasCount / (al.asistenciasCount + al.faltasCount)) * 100)}%
                    </td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openDetails(al)}
                          className="p-1.5 hover:bg-cream-100 rounded-lg text-sage-500 hover:text-sage-700 transition-colors"
                          title="Ver Ficha Rápida"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigateTo('escolar-concentrado', { studentId: al.id })}
                          className="px-2.5 py-1 hover:bg-sage-50 text-sage-600 font-bold text-xs rounded-lg transition-colors border border-sage-100"
                        >
                          Ficha Completa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AGREGAR ALUMNO */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setAddModalOpen(false)} />
          <div className="relative bg-white border border-cream-200 rounded-3xl w-full max-w-md p-6 shadow-xl z-10 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-grayblue-900 flex items-center gap-2">
                <User className="h-5 w-5 text-sage-500" />
                Registrar Nuevo Alumno
              </h3>
              <button 
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 hover:bg-cream-100 rounded-lg text-grayblue-400 hover:text-grayblue-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400 focus:bg-white"
                  placeholder="Ej. Ana Martínez López"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                  CURP (18 Caracteres)
                </label>
                <input
                  type="text"
                  required
                  maxLength={18}
                  value={curp}
                  onChange={(e) => setCurp(e.target.value.toUpperCase())}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400 focus:bg-white font-mono uppercase"
                  placeholder="Ej. MALA160412HDFRRN09"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                    Sexo
                  </label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value as 'M' | 'F')}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400 focus:bg-white"
                  >
                    <option value="F">Femenino (F)</option>
                    <option value="M">Masculino (M)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-grayblue-900 focus:outline-none focus:border-sage-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-sm text-grayblue-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-sage-500 hover:bg-sage-600 rounded-xl font-bold text-sm text-white shadow-sm shadow-sage-200"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORTAR DESDE EXCEL */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setImportModalOpen(false)} />
          <div className="relative bg-white border border-cream-200 rounded-3xl w-full max-w-md p-6 shadow-xl z-10 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-grayblue-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                Importar desde Excel
              </h3>
              <button 
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 hover:bg-cream-100 rounded-lg text-grayblue-400 hover:text-grayblue-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-center py-4">
              <div className="border-2 border-dashed border-cream-300 hover:border-sage-400 transition-colors rounded-2xl p-8 flex flex-col items-center gap-2 cursor-pointer bg-cream-50/50">
                <FileSpreadsheet className="h-10 w-10 text-emerald-500" />
                <span className="text-sm font-semibold text-grayblue-900">Arrastra tu archivo aquí</span>
                <span className="text-xs text-grayblue-400">Formatos soportados: .xlsx, .xls, .csv</span>
              </div>
              
              <div className="text-xs text-grayblue-400 text-left leading-relaxed">
                💡 Asegúrate de que el documento contenga las columnas: **Nombre completo, CURP, Sexo (M/F), Fecha de Nacimiento (YYYY-MM-DD)**.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-sm text-grayblue-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportSimulate}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl"
                >
                  Subir y Procesar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER FICHA RÁPIDA DE ALUMNO */}
      {detailModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setDetailModalOpen(false)} />
          <div className="relative bg-white border border-cream-200 rounded-3xl w-full max-w-md p-6 shadow-xl z-10 animate-scale-in">
            
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-grayblue-900">{selectedStudent.nombre}</h3>
                <span className="text-xs font-bold text-grayblue-400 font-mono tracking-wider uppercase">
                  CURP: {selectedStudent.curp}
                </span>
              </div>
              <button 
                onClick={() => setDetailModalOpen(false)}
                className="p-1.5 hover:bg-cream-100 rounded-lg text-grayblue-400 hover:text-grayblue-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-4 bg-cream-50 p-4 rounded-2xl border border-cream-100 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-sage-500" />
                  <span className="font-semibold text-grayblue-600">Sexo: {selectedStudent.sexo === 'F' ? 'Femenino' : 'Masculino'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sage-500" />
                  <span className="font-semibold text-grayblue-600">{selectedStudent.fechaNacimiento}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <GraduationCap className="h-4 w-4 text-sage-500" />
                  <span className="font-semibold text-grayblue-600">Grupo: {selectedStudent.grado} "{selectedStudent.grupo}"</span>
                </div>
              </div>

              {/* Academic Overview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-grayblue-400 uppercase tracking-wider">Desempeño General</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-sage-50/50 p-4 rounded-xl border border-sage-100 text-center">
                    <span className="text-xs font-semibold text-sage-500 block">Promedio</span>
                    <span className="text-xl font-bold text-sage-600 block">{selectedStudent.promedio}</span>
                  </div>
                  <div className="bg-terracotta-50/50 p-4 rounded-xl border border-terracotta-100 text-center">
                    <span className="text-xs font-semibold text-terracotta-500 block">Asistencia</span>
                    <span className="text-xl font-bold text-terracotta-600 block">
                      {Math.round((selectedStudent.asistenciasCount / (selectedStudent.asistenciasCount + selectedStudent.faltasCount)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-sm text-grayblue-700"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    navigateTo('escolar-concentrado', { studentId: selectedStudent.id });
                  }}
                  className="flex-1 py-3 bg-sage-500 hover:bg-sage-600 rounded-xl font-bold text-sm text-white shadow-sm"
                >
                  Ficha Detallada
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
