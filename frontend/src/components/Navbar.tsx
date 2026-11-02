import React from 'react';
import { User } from '../services/types';
import { PlusCircle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onNavigate }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <img src="/logo.png" alt="Klean Max Pro Logo" className="h-9 w-auto object-contain" />
          <div className="hidden sm:block">
            <span className="font-black text-base tracking-tight text-slate-900 block leading-tight">
              KLEAN MAX PRO
            </span>
            <span className="text-[10px] uppercase font-extrabold text-amber-500 tracking-wider">
              Smart Commercial Quotation System
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: New Quote, Unified Status, User Profile */}
      <div className="flex items-center gap-3.5">
        {/* Quick Action: New Quotation */}
        <button
          onClick={() => onNavigate('create_quotation')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Quotation</span>
        </button>

        {/* 1 Unified Workspace Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold border border-slate-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[#FED10C]">Unified Workspace:</span>
          <span className="text-slate-100">Admin + Staff</span>
        </div>

        {/* User Profile Badge */}
        <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-[#FED10C] font-black text-xs flex items-center justify-center border border-slate-300 shadow-xs">
            {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'A'}
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-slate-900 leading-tight">
              {currentUser?.full_name || 'Admin'}
            </div>
            <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Full Combined Access
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
