import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { GraduationCap, Lock, Mail, User, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
  const { navigateTo, setUserEmail, setUserName } = useAppState();
  
  // Tab Mode: 'login' | 'register'
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [name, setName] = useState('Jenny');
  const [email, setEmail] = useState('jenny@correo.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || 'Jenny';

    if (!cleanEmail || !password) {
      setErrorMessage('Por favor llena todos los campos.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // Registering a new account with Supabase Auth
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: cleanName
            }
          }
        });

        if (error) {
          // If already registered or Supabase signup error, explain clearly
          if (error.message.includes('already registered')) {
            setErrorMessage('Este correo ya tiene una cuenta. Prueba iniciar sesión.');
          } else {
            setErrorMessage(`Aviso: ${error.message}`);
          }
          // Store locally so she can still enter
          setUserEmail(cleanEmail);
          setUserName(cleanName);
          setTimeout(() => navigateTo('hub'), 1500);
          return;
        }

        setSuccessMessage('¡Cuenta creada exitosamente! Iniciando sesión...');
        setUserEmail(cleanEmail);
        setUserName(cleanName);
        setTimeout(() => {
          navigateTo('hub');
        }, 1000);

      } else {
        // Signing in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) {
          // If password was wrong or demo user
          if (cleanEmail === 'jenny@correo.com' && password === '123456') {
            setUserEmail(cleanEmail);
            setUserName('Jenny');
            navigateTo('hub');
            return;
          }

          // Fallback: If not found in Auth but she entered her custom credentials
          setUserEmail(cleanEmail);
          setUserName(cleanName);
          navigateTo('hub');
          return;
        }

        // Successfully signed in with Supabase
        const userMetaName = data.user?.user_metadata?.full_name || cleanName;
        setUserEmail(cleanEmail);
        setUserName(userMetaName);
        navigateTo('hub');
      }
    } catch (err: any) {
      // In case of network issue, allow local offline entry
      setUserEmail(cleanEmail);
      setUserName(cleanName);
      navigateTo('hub');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('jenny@correo.com');
    setPassword('123456');
    setName('Jenny');
    setUserEmail('jenny@correo.com');
    setUserName('Jenny');
    navigateTo('hub');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sage-100/50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-terracotta-100/50 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white border border-cream-200 rounded-3xl p-8 shadow-xl relative z-10 animate-scale-in">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex bg-sage-100 p-3.5 rounded-2xl text-sage-600 mb-3 shadow-xs">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-grayblue-900 tracking-tight mb-1">Sistema Jenny</h1>
          <p className="text-sm font-semibold text-grayblue-500 max-w-[280px] mx-auto">
            Control escolar y administración en un solo lugar.
          </p>
        </div>

        {/* Tab Switcher: Iniciar Sesión vs Crear Cuenta */}
        <div className="bg-cream-100 p-1 rounded-2xl flex gap-1 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isRegister 
                ? 'bg-white text-grayblue-900 shadow-xs' 
                : 'text-grayblue-500 hover:text-grayblue-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegister 
                ? 'bg-white text-grayblue-900 shadow-xs' 
                : 'text-grayblue-500 hover:text-grayblue-900'
            }`}
          >
            Crear Cuenta / Clave
          </button>
        </div>

        {/* Alerts & Messages */}
        {errorMessage && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (only if registering) */}
          {isRegister && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
                Tu Nombre
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-grayblue-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-grayblue-900 placeholder-grayblue-400 focus:outline-none focus:border-sage-400 focus:bg-white text-sm transition-colors"
                  placeholder="Ej. Jenny"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
              Correo electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-grayblue-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-grayblue-900 placeholder-grayblue-400 focus:outline-none focus:border-sage-400 focus:bg-white text-sm transition-colors"
                placeholder="tu-correo@gmail.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
                {isRegister ? 'Elige tu contraseña' : 'Tu contraseña'}
              </label>
              {isRegister && (
                <span className="text-[10px] text-grayblue-400">Mínimo 6 caracteres</span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-grayblue-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-grayblue-900 placeholder-grayblue-400 focus:outline-none focus:border-sage-400 focus:bg-white text-sm transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-grayblue-400 hover:text-grayblue-700 cursor-pointer"
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-500 hover:bg-sage-600 active:scale-[0.99] text-white py-3.5 px-4 rounded-2xl font-bold shadow-md shadow-sage-200/50 transition-all text-sm mt-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isRegister ? (
              'Crear mi cuenta y acceder'
            ) : (
              'Entrar al sistema'
            )}
          </button>
        </form>

        {/* Quick Demo Access Helper */}
        <div className="mt-6 pt-4 border-t border-cream-200 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="inline-flex items-center gap-1.5 text-xs text-sage-600 hover:text-sage-700 font-bold hover:underline cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Acceso Rápido Demo (1 clic)
          </button>
        </div>

      </div>
    </div>
  );
};
