import React, { useState } from 'react';
import { useAppState, type ViewType } from '../context/AppContext';
import { 
  GraduationCap, 
  Store, 
  CheckSquare, 
  Award, 
  FileText, 
  Menu, 
  X, 
  Home, 
  ArrowLeft 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentView, navigateTo, goBack } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If in login page, don't show the layout frame
  if (currentView === 'login') {
    return <>{children}</>;
  }

  const menuItems = [
    { label: 'Inicio', view: 'hub' as ViewType, icon: Home },
    { label: 'Control Escolar', view: 'escolar-dashboard' as ViewType, icon: GraduationCap },
    { label: 'Asistencia', view: 'escolar-asistencia' as ViewType, icon: CheckSquare },
    { label: 'Calificaciones', view: 'escolar-campos' as ViewType, icon: Award },
    { label: 'Mi Negocio', view: 'negocio-dashboard' as ViewType, icon: Store },
    { label: 'Reportes', view: 'reportes' as ViewType, icon: FileText },
  ];

  const handleNav = (view: ViewType) => {
    navigateTo(view);
    setMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'hub': return 'Panel Principal';
      case 'escolar-dashboard': return 'Control Escolar';
      case 'escolar-alumnos': return 'Listado de Alumnos';
      case 'escolar-asistencia': return 'Registro de Asistencia';
      case 'escolar-campos': return 'Campos Formativos';
      case 'escolar-actividades': return 'Actividades y Calificaciones';
      case 'escolar-porcentajes': return 'Configuración de Porcentajes';
      case 'escolar-concentrado': return 'Detalle del Alumno';
      case 'negocio-dashboard': return 'Mi Negocio de Ropa';
      case 'negocio-lotes': return 'Compras y Lotes';
      case 'negocio-registrar-producto': return 'Registrar Producto';
      case 'negocio-inventario': return 'Inventario de Prendas';
      case 'negocio-pos': return 'Registrar Nueva Venta';
      case 'negocio-detalle-lote': return 'Detalles del Lote';
      case 'reportes': return 'Reportes Generales';
      default: return 'Sistema Jenny';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream-50 text-grayblue-900 transition-all duration-200">
      
      {/* SIDEBAR FOR DESKTOP & TABLET */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-cream-200 shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-cream-200 flex items-center gap-3">
          <div className="bg-sage-100 p-2 rounded-xl text-sage-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-grayblue-900 tracking-tight m-0">Sistema Jenny</h1>
            <span className="text-xs text-grayblue-400 font-medium">Control & Administración</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Determine active tab
            const isActive = currentView === item.view || 
              (item.view === 'escolar-dashboard' && currentView.startsWith('escolar-')) ||
              (item.view === 'negocio-dashboard' && currentView.startsWith('negocio-'));

            return (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-sage-500 text-white shadow-sm shadow-sage-200' 
                    : 'text-grayblue-500 hover:bg-cream-100 hover:text-grayblue-900'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User profile / Log out footer */}
        <div className="p-4 border-t border-cream-200 bg-cream-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-terracotta-200 flex items-center justify-center font-bold text-terracotta-700">
              J
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-grayblue-900 truncate">Jenny Maestra</p>
              <button 
                onClick={() => handleNav('login')}
                className="text-xs text-terracotta-500 hover:underline font-medium block"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP NAVIGATION BAR */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-cream-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-grayblue-500 hover:bg-cream-100 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-lg text-grayblue-900">Sistema Jenny</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-terracotta-200 flex items-center justify-center font-bold text-terracotta-700">
          J
        </div>
      </header>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-80 max-w-xs bg-white h-full shadow-xl z-50 animate-slide-in">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-sage-100 p-2 rounded-xl text-sage-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-grayblue-900 m-0">Sistema Jenny</h2>
                  <span className="text-xs text-grayblue-400">Control Escolar</span>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-grayblue-400 hover:text-grayblue-900 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view || 
                  (item.view === 'escolar-dashboard' && currentView.startsWith('escolar-')) ||
                  (item.view === 'negocio-dashboard' && currentView.startsWith('negocio-'));

                return (
                  <button
                    key={item.view}
                    onClick={() => handleNav(item.view)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive 
                        ? 'bg-sage-500 text-white shadow-sm' 
                        : 'text-grayblue-500 hover:bg-cream-100 hover:text-grayblue-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-cream-200 bg-cream-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-terracotta-200 flex items-center justify-center font-bold text-terracotta-700">
                  J
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-grayblue-900 truncate">Jenny Maestra</p>
                  <button 
                    onClick={() => handleNav('login')}
                    className="text-xs text-terracotta-500 hover:underline font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP NAVBAR FOR APP ACTIONS */}
        <header className="hidden md:flex items-center justify-between bg-white/70 backdrop-blur-md border-b border-cream-200 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {currentView !== 'hub' && (
              <button 
                onClick={goBack}
                className="p-2 hover:bg-cream-100 rounded-lg text-grayblue-500 hover:text-grayblue-950 transition-colors cursor-pointer"
                title="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-grayblue-900 m-0">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-grayblue-500">Ciclo: 2026-2027</span>
            <div className="h-1.5 w-1.5 rounded-full bg-sage-400"></div>
            <span className="text-sm font-semibold text-sage-600 bg-sage-50 px-3 py-1.5 rounded-full">
              Docente Conectada
            </span>
          </div>
        </header>

        {/* Mobile secondary header for Back button */}
        {currentView !== 'hub' && (
          <div className="md:hidden flex items-center gap-3 bg-cream-100 px-4 py-2 border-b border-cream-200">
            <button 
              onClick={goBack}
              className="flex items-center gap-1 text-sm font-semibold text-sage-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>
            <span className="text-xs font-bold text-grayblue-500 truncate">| {getPageTitle()}</span>
          </div>
        )}

        {/* SCROLLABLE Vistas Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
