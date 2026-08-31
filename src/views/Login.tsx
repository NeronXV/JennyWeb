import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
  const { navigateTo, setUserEmail, setUserName } = useAppState();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage('Por favor introduce tu correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        // Friendly Spanish error messages
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Correo o contraseña incorrectos. Verifica tus datos.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('El correo aún no ha sido confirmado en Supabase.');
        } else {
          setErrorMessage(`Error de acceso: ${error.message}`);
        }
        setLoading(false);
        return;
      }

      // 2. Success: Extract name or use email prefix
      const userMetaName = data.user?.user_metadata?.full_name || 
                           data.user?.email?.split('@')[0] || 
                           'Jenny';

      setUserEmail(cleanEmail);
      setUserName(userMetaName);
      navigateTo('hub');

    } catch (err: any) {
      setErrorMessage('Ocurrió un error al conectar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sage-100/50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-terracotta-100/50 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white border border-cream-200 rounded-3xl p-8 shadow-xl relative z-10 animate-scale-in">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-sage-100 p-3.5 rounded-2xl text-sage-600 mb-3 shadow-xs">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-grayblue-900 tracking-tight mb-1">Sistema Jenny</h1>
          <p className="text-sm font-semibold text-grayblue-500 max-w-[280px] mx-auto">
            Control escolar y administración en un solo lugar.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
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
                className="w-full pl-11 pr-4 py-3.5 bg-cream-50 border border-cream-200 rounded-2xl text-grayblue-900 placeholder-grayblue-400 focus:outline-none focus:border-sage-400 focus:bg-white text-sm transition-colors"
                placeholder="tu-correo@gmail.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-grayblue-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-cream-50 border border-cream-200 rounded-2xl text-grayblue-900 placeholder-grayblue-400 focus:outline-none focus:border-sage-400 focus:bg-white text-sm transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
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
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-8 pt-5 border-t border-cream-200 text-center">
          <span className="text-[11px] text-grayblue-400 font-semibold flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-sage-500" />
            Acceso seguro protegido con Supabase Auth
          </span>
        </div>

      </div>
    </div>
  );
};
