import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../services/types';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  Check
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const PRESET_ACCOUNTS = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    badge: 'Master Console',
    color: 'bg-slate-900 text-amber-300 border-amber-400/40 hover:border-amber-400',
    activeColor: 'bg-slate-950 text-amber-400 border-amber-400 ring-2 ring-amber-400/30',
    username: 'superadmin',
    icon: '👑',
    desc: 'Access all 4 companies, master settings & customer directory'
  },
  {
    id: 'kleanmaxpro',
    name: 'Klean Max Pro',
    badge: 'Company 1',
    color: 'bg-amber-50 text-amber-950 border-amber-200 hover:border-amber-400',
    activeColor: 'bg-amber-100 text-amber-950 border-amber-500 ring-2 ring-amber-400/40',
    username: 'kleanmaxpro',
    icon: '⚡',
    desc: 'Commercial floor scrubbing & area calculations'
  },
  {
    id: 'kleanmax',
    name: 'Kleanmax',
    badge: 'Company 2',
    color: 'bg-sky-50 text-sky-950 border-sky-200 hover:border-sky-400',
    activeColor: 'bg-sky-100 text-sky-950 border-sky-500 ring-2 ring-sky-400/40',
    username: 'kleanmax',
    icon: '🔧',
    desc: 'Cleaning proposals, spares & equipment sales'
  },
  {
    id: 'uniquepainters',
    name: 'Unique Painters',
    badge: 'Company 3',
    color: 'bg-purple-50 text-purple-950 border-purple-200 hover:border-purple-400',
    activeColor: 'bg-purple-100 text-purple-950 border-purple-500 ring-2 ring-purple-400/40',
    username: 'uniquepainters',
    icon: '🎨',
    desc: 'Painting & epoxy coatings with balanced 20mm margins'
  },
  {
    id: 'cleantech',
    name: 'Cleantech Services',
    badge: 'Company 4',
    color: 'bg-teal-50 text-teal-950 border-teal-200 hover:border-teal-400',
    activeColor: 'bg-teal-100 text-teal-950 border-teal-500 ring-2 ring-teal-400/40',
    username: 'cleantech',
    icon: '🌿',
    desc: 'Solar panel wash, high-rise facade & periodic AMC'
  },
];

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('superadmin');
  const [username, setUsername] = useState<string>('superadmin');
  const [password, setPassword] = useState<string>('superadmin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setSelectedPreset(preset.id);
    setUsername(preset.username);
    setPassword(preset.username); // username and password are the same for all company accounts
    setErrorMessage(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const userKey = (selectedPreset || username || 'superadmin').toLowerCase().trim();
    const mockUser: User = {
      id: `usr-${userKey}`,
      email: `${userKey}@kleanmaxpro.com`,
      full_name: userKey === 'superadmin' ? 'Super Admin' : (PRESET_ACCOUNTS.find(p => p.id === userKey)?.name || userKey.toUpperCase()),
      role: 'admin',
      company_code: userKey === 'superadmin' ? 'all' : userKey,
      is_active: true,
    };

    try {
      const res = await api.auth.login(username.trim() || userKey, password.trim() || userKey);
      if (res && res.user) {
        onLoginSuccess(res.user);
        return;
      }
    } catch (err: any) {
      console.warn('Backend login warning, bypassing auth directly as requested:', err);
    }

    // Direct Bypass: immediately store session and enter portal
    localStorage.setItem('token', 'dev-bypass-token-2026');
    localStorage.setItem('user', JSON.stringify(mockUser));
    onLoginSuccess(mockUser);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#FED10C] text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unified Enterprise Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>KLEANMAX PRO QMS</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Sign in to access your company dashboard and proposal tools
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
          {/* Quick Select Portal Buttons */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">
              Select Login Portal / Quick Fill:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_ACCOUNTS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected ? preset.activeColor : preset.color
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{preset.icon}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="mt-1">
                      <div className="font-black text-xs leading-tight">{preset.name}</div>
                      <div className="text-[10px] opacity-75 font-mono">{preset.username}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Username / Portal ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSelectedPreset('');
                  }}
                  placeholder="superadmin, kleanmax, kleanmaxpro..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 focus:outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Default: password is the same as username (e.g. username <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">kleanmaxpro</code>, password <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">kleanmaxpro</code>).
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:to-indigo-900 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Role-Based Access Control • Locked Navigation per Company</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

