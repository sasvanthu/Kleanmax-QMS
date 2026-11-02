import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Layers,
  Building2,
  Calculator,
  Wrench,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="py-5 px-3 space-y-6">
        {/* Main Overview */}
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-black transition-all ${
              currentPage === 'dashboard'
                ? 'bg-[#FED10C] text-slate-950 shadow-md'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentPage === 'dashboard' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Division 1: KLEANMAX PRO */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              KLEANMAX PRO
            </span>
            <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-extrabold uppercase">
              Commercial
            </span>
          </div>

          <nav className="space-y-1">
            {/* Area Quotation Generator */}
            <button
              onClick={() => onNavigate('kleanmaxpro_area')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmaxpro_area'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Calculator className={`w-4 h-4 ${currentPage === 'kleanmaxpro_area' ? 'text-slate-950' : 'text-amber-400'}`} />
              <div className="text-left">
                <div>Area Quotation</div>
                <div className="text-[10px] text-slate-400 font-normal">Commercial Scrubbing</div>
              </div>
            </button>

            {/* Pro Quotations List */}
            <button
              onClick={() => onNavigate('kleanmaxpro_quotes')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmaxpro_quotes'
                  ? 'bg-slate-800 text-amber-400 font-bold border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Pro Quotations</span>
            </button>

            {/* Services Catalogue */}
            <button
              onClick={() => onNavigate('services')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'services'
                  ? 'bg-slate-800 text-amber-400 font-bold border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Services & Rates</span>
            </button>

            {/* Customers */}
            <button
              onClick={() => onNavigate('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'customers'
                  ? 'bg-slate-800 text-amber-400 font-bold border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Customers / Clients</span>
            </button>
          </nav>
        </div>

        {/* Division 2: KLEANMAX */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">
              KLEANMAX
            </span>
            <span className="text-[9px] bg-sky-400/20 text-sky-300 px-1.5 py-0.5 rounded font-extrabold uppercase">
              Spares & Sales
            </span>
          </div>

          <nav className="space-y-1">
            {/* Spares & Service Quote (WhatsApp Images 1 & 2) */}
            <button
              onClick={() => onNavigate('kleanmax_spares')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmax_spares'
                  ? 'bg-sky-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Wrench className={`w-4 h-4 ${currentPage === 'kleanmax_spares' ? 'text-slate-950' : 'text-sky-400'}`} />
              <div className="text-left">
                <div>Spares & Service</div>
                <div className="text-[10px] text-slate-400 font-normal">Scrubber Repairs (Imgs 1-2)</div>
              </div>
            </button>

            {/* Equipment Sales Quote (WhatsApp Images 3 & 4) */}
            <button
              onClick={() => onNavigate('kleanmax_sales')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmax_sales'
                  ? 'bg-sky-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <ShoppingCart className={`w-4 h-4 ${currentPage === 'kleanmax_sales' ? 'text-slate-950' : 'text-sky-400'}`} />
              <div className="text-left">
                <div>Equipment Sales</div>
                <div className="text-[10px] text-slate-400 font-normal">Machine Sales (Imgs 3-4)</div>
              </div>
            </button>

            {/* Kleanmax Quotations List */}
            <button
              onClick={() => onNavigate('kleanmax_quotes')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmax_quotes'
                  ? 'bg-slate-800 text-sky-400 font-bold border border-sky-400/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Kleanmax Quotations</span>
            </button>

            {/* All Quotations Master */}
            <button
              onClick={() => onNavigate('quotations')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotations'
                  ? 'bg-slate-800 text-slate-100 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>All Quotations Master</span>
            </button>
          </nav>
        </div>

        {/* Division 3: Settings */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
            SETTINGS
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'settings'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Company & Bank Details</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 m-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 mb-1 text-slate-200 font-black">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Klean Max Pro Engine
        </div>
        <div className="text-[10px] text-slate-400">
          Vanagaram, Chennai • GST: 33DXIPS4251R2ZP
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Unified Admin Session Active
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
