import React, { useState } from 'react';
import { User } from '../services/types';
import {
  PlusCircle, ShieldCheck, ChevronDown, Sparkles, Building2,
  Layers, Check
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, currentPage, onNavigate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getCompanyLabel = () => {
    if (currentPage.startsWith('kleanmaxpro')) {
      return { name: 'Klean Max Pro', badge: 'bg-amber-400 text-slate-950', dot: 'bg-amber-400' };
    }
    if (currentPage.startsWith('kleanmax')) {
      return { name: 'Kleanmax', badge: 'bg-sky-500 text-slate-950', dot: 'bg-sky-400' };
    }
    if (currentPage.startsWith('uniquepainters')) {
      return { name: 'Unique Painters', badge: 'bg-purple-600 text-white', dot: 'bg-purple-400' };
    }
    if (currentPage.startsWith('cleantech')) {
      return { name: 'Cleantech Services', badge: 'bg-emerald-600 text-white', dot: 'bg-emerald-400' };
    }
    return { name: 'Unified Admin (Master)', badge: 'bg-[#FED10C] text-slate-950', dot: 'bg-emerald-400' };
  };

  const currentBadge = getCompanyLabel();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand Identity & Company Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <img src="/logo.png" alt="QMS Logo" className="h-8 w-auto object-contain" />
          <div className="hidden sm:block">
            <span className="font-black text-sm md:text-base tracking-tight text-slate-900 block leading-tight">
              KLEANMAX PRO QMS
            </span>
            <span className="text-[10px] uppercase font-extrabold text-amber-500 tracking-wider">
              4 Companies • Unified Operations
            </span>
          </div>
        </div>

        {/* Dynamic Company Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold transition-all"
          >
            <span className={`w-2 h-2 rounded-full ${currentBadge.dot} animate-pulse`} />
            <span className="text-slate-700 hidden md:inline">Dashboard:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${currentBadge.badge}`}>
              {currentBadge.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 border-b border-slate-100">
                Switch to Dashboard:
              </div>

              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>👑 Unified Admin Dashboard</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Master</span>
              </button>

              <button
                onClick={() => onNavigate('kleanmaxpro_area')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>⚡ Klean Max Pro Hub</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">KMP</span>
              </button>

              <button
                onClick={() => onNavigate('kleanmax_generator')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-sky-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>🔧 Kleanmax Cleaning Hub</span>
                </div>
                <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono">KLM</span>
              </button>

              <button
                onClick={() => onNavigate('uniquepainters_generator')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-purple-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>🎨 Unique Painters Hub</span>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono">UNP</span>
              </button>

              <button
                onClick={() => onNavigate('cleantech_generator')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-teal-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>🌿 Cleantech Services Hub</span>
                </div>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono">CTS</span>
              </button>

              <div className="pt-2 border-t border-slate-100 mt-1">
                <button
                  onClick={() => onNavigate('settings')}
                  className="w-full text-left px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Manage 4 Companies (All Editable)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: New Quote, Unified Status, User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Action: New Quotation */}
        <button
          onClick={() => onNavigate('create_quotation')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Quotation</span>
        </button>

        {/* 1 Unified Workspace Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold border border-slate-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#FED10C]">5 Dashboards Active</span>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-[#FED10C] font-black text-xs flex items-center justify-center border border-slate-300 shadow-xs">
            {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-black text-slate-900 leading-tight">
              {currentUser?.full_name || 'Admin'}
            </div>
            <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Unified Access
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
