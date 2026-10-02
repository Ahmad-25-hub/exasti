import React, { useState } from 'react';
import { 
  Kanban, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { taskApi } from '../services/taskApi';

export default function AuthModal({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !name.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    try {
      setIsLoading(true);
      let response;
      if (mode === 'login') {
        response = await taskApi.login({ email: email.trim(), password });
      } else {
        response = await taskApi.register({ name: name.trim(), email: email.trim(), password });
      }

      if (response && response.user) {
        onAuthSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memproses autentikasi');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click Demo Accounts for easy presentation & testing
  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    try {
      setIsLoading(true);
      const res = await taskApi.login({ email: demoEmail, password: demoPass });
      if (res && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Gagal login dengan akun demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 text-white text-center relative overflow-hidden">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-inner">
            <Kanban className="w-8 h-8 text-indigo-200" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Kanban Board Tim
          </h2>
          <p className="text-xs text-indigo-200/90 mt-1 max-w-xs mx-auto">
            Sistem Manajemen Tugas Terstruktur dengan Kolaborasi Workspace &amp; Kode Undangan
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 flex p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Daftar Akun
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden font-medium"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Kanban' : 'Daftar & Buat Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts for grading */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Akun Demo Cepat
              </span>
              <span className="text-[10px] text-slate-400">Klik untuk langsung uji coba</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('ahmad@example.com', 'password123')}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  Ahmad (Owner)
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  ahmad@example.com
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('siti@example.com', 'password123')}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  Siti (Member)
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  siti@example.com
                </p>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
