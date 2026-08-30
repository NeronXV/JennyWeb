import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { GraduationCap, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { navigateTo } = useAppState();
  const [email, setEmail] = useState('jenny@correo.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating authentication load
    setTimeout(() => {
      setLoading(false);
      navigateTo('hub');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sage-100/50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-terracotta-100/50 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white border border-cream-200 rounded-3xl p-8 shadow-xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-sage-100 p-3.5 rounded-2xl text-sage-600 mb-4 shadow-xs">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-grayblue-900 tracking-tight mb-2">Sistema Jenny</h1>
          <p className="text-sm font-semibold text-grayblue-500 max-w-[280px] mx-auto">
            Control escolar y administración personal en un solo lugar.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-grayblue-900 placeholder-grayblue-400 focus:outline-none focus:border-sage-400 focus:bg-white text-base transition-colors"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-grayblue-500 uppercase tracking-wider block">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-grayblue-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-grayblue-900 placeholder-grayblue-400 focus:outline-none focus:border-sage-400 focus:bg-white text-base transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-500 hover:bg-sage-600 active:scale-[0.99] text-white py-3.5 px-4 rounded-2xl font-semibold shadow-md shadow-sage-200/50 transition-all text-base mt-2 flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-cream-200 pt-6 text-xs text-grayblue-400 font-medium">
          Acceso demo instantáneo sin base de datos activa.
        </div>
      </div>
    </div>
  );
};
