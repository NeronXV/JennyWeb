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
  ArrowLeft,
  Cloud,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentView, navigateTo, goBack, isCloudConnected, isSyncing, userName, userEmail, logout } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Change Password Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Las contraseñas no coinciden. Por favor verifícalas.' });
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setPasswordStatus({ type: 'error', message: `No se pudo actualizar: ${error.message}` });
      } else {
        setPasswordStatus({ type: 'success', message: '¡Tu contraseña ha sido cambiada exitosamente!' });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setProfileModalOpen(false);
          setPasswordStatus(null);
        }, 2000);
      }
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: 'Error de conexión. Intenta nuevamente.' });
    } finally {
      setUpdatingPassword(false);
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
            const isActive = currentView === item.view || 
              (item.view === 'escolar-dashboard' && currentView.startsWith('escolar-')) ||
              (item.view === 'negocio-dashboard' && currentView.startsWith('negocio-'));

            return (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
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
            <div 
              onClick={() => setProfileModalOpen(true)}
              className="h-10 w-10 rounded-full bg-terracotta-200 hover:bg-terracotta-300 flex items-center justify-center font-bold text-terracotta-700 uppercase cursor-pointer transition-colors shrink-0"
              title="Mi perfil y cambiar contraseña"
            >
              {userName.charAt(0) || 'J'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-grayblue-900 truncate">{userName}</p>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="p-1 hover:bg-cream-200 rounded-md text-grayblue-400 hover:text-grayblue-800 transition-colors cursor-pointer"
                  title="Cambiar contraseña"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-grayblue-400 truncate block">{userEmail}</span>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => setProfileModalOpen(true)}
                  className="text-[11px] text-sage-600 hover:underline font-bold cursor-pointer"
                >
                  Cambiar clave
                </button>
                <span className="text-[10px] text-grayblue-300">•</span>
                <button 
                  onClick={logout}
                  className="text-[11px] text-terracotta-500 hover:underline font-medium cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP NAVIGATION BAR */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-cream-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-grayblue-500 hover:bg-cream-100 rounded-lg cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-lg text-grayblue-900">Sistema Jenny</span>
        </div>
        <div 
          onClick={() => setProfileModalOpen(true)}
          className="h-8 w-8 rounded-full bg-terracotta-200 flex items-center justify-center font-bold text-terracotta-700 uppercase cursor-pointer"
        >
          {userName.charAt(0) || 'J'}
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
                <div 
                  onClick={() => { setProfileModalOpen(true); setMobileMenuOpen(false); }}
                  className="h-10 w-10 rounded-full bg-terracotta-200 flex items-center justify-center font-bold text-terracotta-700 uppercase cursor-pointer"
                >
                  {userName.charAt(0) || 'J'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-grayblue-900 truncate">{userName}</p>
                  <span className="text-[11px] text-grayblue-400 truncate block">{userEmail}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => { setProfileModalOpen(true); setMobileMenuOpen(false); }}
                      className="text-[11px] text-sage-600 hover:underline font-bold"
                    >
                      Cambiar clave
                    </button>
                    <span className="text-[10px] text-grayblue-300">•</span>
                    <button 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="text-[11px] text-terracotta-500 hover:underline font-medium"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
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
            
            {/* Supabase Cloud Indicator */}
            <div 
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                isSyncing
                  ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                  : isCloudConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-cream-100 text-grayblue-600 border-cream-200'
              }`}
              title={isCloudConnected ? "Conectado a la base de datos Supabase" : "Modo local activo"}
            >
              <Cloud className="h-3.5 w-3.5" />
              <span>{isSyncing ? 'Sincronizando...' : isCloudConnected ? 'Nube Supabase Conectada' : 'Nube Activa'}</span>
            </div>

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

      {/* MODAL: CAMBIAR CONTRASEÑA Y PERFIL */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setProfileModalOpen(false)} />
          <div className="relative bg-white border border-cream-200 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl z-10 animate-scale-in">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-sage-100 p-2.5 rounded-2xl text-sage-600">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-grayblue-900">Seguridad de la Cuenta</h3>
                  <p className="text-xs text-grayblue-400">Actualiza tu contraseña de acceso</p>
                </div>
              </div>
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 hover:bg-cream-100 rounded-xl text-grayblue-400 hover:text-grayblue-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Account Info Box */}
            <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 mb-5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-grayblue-700">
                <User className="h-3.5 w-3.5 text-sage-500" />
                <span>Usuario actual: {userName}</span>
              </div>
              <p className="text-[11px] text-grayblue-500 font-mono pl-5">{userEmail}</p>
            </div>

            {/* Status alerts */}
            {passwordStatus && (
              <div className={`mb-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
                passwordStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {passwordStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                )}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            {/* Change Password Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-grayblue-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-sage-400 focus:bg-white text-grayblue-900"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-grayblue-400 hover:text-grayblue-700 cursor-pointer"
                    title={showPassword ? "Ocultar" : "Ver"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-grayblue-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-sage-400 focus:bg-white text-grayblue-900"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-xs text-grayblue-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex-1 py-3 bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {updatingPassword ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Guardar Contraseña'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
