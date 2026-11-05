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
  Paintbrush,
  Sun,
  Edit,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  // Determine current active workspace context
  const getWorkspace = () => {
    if (currentPage.startsWith('kleanmaxpro')) return 'kleanmaxpro';
    if (currentPage.startsWith('kleanmax')) return 'kleanmax';
    if (currentPage.startsWith('uniquepainters')) return 'uniquepainters';
    if (currentPage.startsWith('cleantech')) return 'cleantech';
    if (currentPage.startsWith('superadmin')) return 'superadmin';
    return 'admin';
  };

  const currentWorkspace = getWorkspace();

  return (
    <aside className="w-64 bg-[#0B1120] text-slate-300 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 select-none">
      <div className="py-4 px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-8rem)]">
        
        {/* WORKSPACE SWITCHER SELECTOR */}
        <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center justify-between">
            <span>WORKSPACE MODE</span>
            <span className="text-[9px] text-amber-400 font-bold uppercase">{currentWorkspace}</span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>👑 All Companies</span>
              </div>
              <span className="text-[9px] opacity-75">Home</span>
            </button>

            <button
              onClick={() => onNavigate('kleanmaxpro_dash')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentWorkspace === 'kleanmaxpro'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>⚡ Klean Max Pro</span>
              </div>
              <span className="text-[9px] opacity-75">Floor Scrub</span>
            </button>

            <button
              onClick={() => onNavigate('kleanmax_dash')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentWorkspace === 'kleanmax'
                  ? 'bg-sky-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>🔧 Kleanmax</span>
              </div>
              <span className="text-[9px] opacity-75">Cleaning & Spares</span>
            </button>

            <button
              onClick={() => onNavigate('uniquepainters_dash')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentWorkspace === 'uniquepainters'
                  ? 'bg-purple-600 text-white font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>🎨 Unique Painters</span>
              </div>
              <span className="text-[9px] opacity-75">Painting</span>
            </button>

            <button
              onClick={() => onNavigate('cleantech_dash')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentWorkspace === 'cleantech'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>🌿 Cleantech Services</span>
              </div>
              <span className="text-[9px] opacity-75">Solar & AMC</span>
            </button>

            <button
              onClick={() => onNavigate('superadmin_dash')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentWorkspace === 'superadmin' || currentPage === 'superadmin_dash' || currentPage === 'settings' || currentPage === 'customers'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">🛡️</span>
                <span>Super Admin</span>
              </div>
              <span className="text-[9px] opacity-75">Master</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE PAGES */}
        {currentWorkspace === 'admin' ? (
          /* ================= UNIFIED ADMIN: 4 COMPANIES + SUPER ADMIN ================= */
          <div className="space-y-2">
            <div className="px-3 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                NAVIGATION
              </span>
            </div>

            <button
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>All 4 Companies (Cards)</span>
            </button>

            <button
              onClick={() => onNavigate('superadmin_dash')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === 'superadmin_dash'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Super Admin Console</span>
            </button>

            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pb-1">
                Company Portals:
              </div>

              <button
                onClick={() => onNavigate('kleanmaxpro_dash')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
                  <span>Klean Max Pro</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('kleanmax_dash')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 group-hover:scale-125 transition-transform" />
                  <span>Kleanmax</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('uniquepainters_dash')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-purple-400 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                  <span>Unique Painters</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('cleantech_dash')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 group-hover:scale-125 transition-transform" />
                  <span>Cleantech Services</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-400 transition-colors" />
              </button>
            </div>
          </div>
        ) : currentWorkspace === 'superadmin' ? (
          /* ================= SUPER ADMIN CONSOLE PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                SUPER ADMIN
              </span>
            </div>

            <button
              onClick={() => onNavigate('superadmin_dash')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'superadmin_dash'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div>Admin Console</div>
                <div className="text-[10px] text-slate-400 font-normal">Hub & Navigation</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'settings'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div>Manage 4 Companies</div>
                <div className="text-[10px] text-slate-400 font-normal">Letterhead & Bank Details</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('customers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'customers'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <div>Customer Directory</div>
                <div className="text-[10px] text-slate-400 font-normal">Master Client Database</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('quotations')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotations'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div>All Past Records & Audit</div>
                <div className="text-[10px] text-slate-400 font-normal">Consolidated Records</div>
              </div>
            </button>
          </div>
        ) : currentWorkspace === 'kleanmaxpro' ? (
          /* ================= KLEANMAX PRO DEDICATED PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                KLEANMAX PRO
              </span>
            </div>

            <button
              onClick={() => onNavigate('kleanmaxpro_dash')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmaxpro_dash'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div>1. Company Hub</div>
                <div className="text-[10px] text-slate-400 font-normal">Navigation Cards</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('kleanmaxpro_area')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmaxpro_area'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calculator className={`w-4 h-4 ${currentPage === 'kleanmaxpro_area' ? 'text-slate-950' : 'text-amber-400'}`} />
              <div className="text-left">
                <div>2. Quotation Generator</div>
                <div className={`text-[10px] ${currentPage === 'kleanmaxpro_area' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  Area & Floor Scrubbing
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('kleanmaxpro_quotes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmaxpro_quotes'
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <div className="text-left">
                <div>3. Past Records</div>
                <div className="text-[10px] text-slate-400 font-normal">View, Word & PDF</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('quotation_edit', { company_code: 'kleanmaxpro' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit' && !currentPage.includes('kleanmax_')
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div>4. Quotation Editor</div>
                <div className="text-[10px] text-slate-400 font-normal">Edit & Custom Build</div>
              </div>
            </button>
          </div>
        ) : currentWorkspace === 'kleanmax' ? (
          /* ================= KLEANMAX DEDICATED PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                KLEANMAX
              </span>
            </div>

            <button
              onClick={() => onNavigate('kleanmax_dash')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmax_dash'
                  ? 'bg-sky-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <div>1. Company Hub</div>
                <div className="text-[10px] text-slate-400 font-normal">Navigation Cards</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('kleanmax_generator')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmax_generator' || currentPage === 'kleanmax_spares'
                  ? 'bg-sky-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className={`w-4 h-4 ${currentPage === 'kleanmax_generator' ? 'text-slate-950' : 'text-sky-400'}`} />
              <div className="text-left">
                <div>2. Quotation Generator</div>
                <div className={`text-[10px] ${currentPage === 'kleanmax_generator' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  Cleaning Proposals
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('kleanmax_quotes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmax_quotes'
                  ? 'bg-slate-800 text-sky-400 border border-sky-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <div className="text-left">
                <div>3. Past Records</div>
                <div className="text-[10px] text-slate-400 font-normal">View, Word & PDF</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('quotation_edit', { company_code: 'kleanmax' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit'
                  ? 'bg-slate-800 text-sky-400 border border-sky-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <div>4. Quotation Editor</div>
                <div className="text-[10px] text-slate-400 font-normal">Edit & Custom Build</div>
              </div>
            </button>
          </div>
        ) : currentWorkspace === 'uniquepainters' ? (
          /* ================= UNIQUE PAINTERS DEDICATED PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                UNIQUE PAINTERS
              </span>
            </div>

            <button
              onClick={() => onNavigate('uniquepainters_dash')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'uniquepainters_dash'
                  ? 'bg-purple-600 text-white font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <div className="text-left">
                <div>1. Company Hub</div>
                <div className="text-[10px] text-slate-400 font-normal">Navigation Cards</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('uniquepainters_generator')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'uniquepainters_generator'
                  ? 'bg-purple-600 text-white font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Paintbrush className={`w-4 h-4 ${currentPage === 'uniquepainters_generator' ? 'text-white' : 'text-purple-400'}`} />
              <div className="text-left">
                <div>2. Quotation Generator</div>
                <div className={`text-[10px] ${currentPage === 'uniquepainters_generator' ? 'text-purple-200' : 'text-slate-400'}`}>
                  Painting & Epoxy
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('uniquepainters_quotes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'uniquepainters_quotes'
                  ? 'bg-slate-800 text-purple-400 border border-purple-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <div className="text-left">
                <div>3. Past Records</div>
                <div className="text-[10px] text-slate-400 font-normal">View, Word & PDF</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('quotation_edit', { company_code: 'uniquepainters' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit'
                  ? 'bg-slate-800 text-purple-400 border border-purple-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-purple-400" />
              <div className="text-left">
                <div>4. Quotation Editor</div>
                <div className="text-[10px] text-slate-400 font-normal">Edit & Custom Build</div>
              </div>
            </button>
          </div>
        ) : (
          /* ================= CLEANTECH SERVICES DEDICATED PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                CLEANTECH SERVICES
              </span>
            </div>

            <button
              onClick={() => onNavigate('cleantech_dash')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'cleantech_dash'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-teal-400" />
              <div className="text-left">
                <div>1. Company Hub</div>
                <div className="text-[10px] text-slate-400 font-normal">Navigation Cards</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('cleantech_generator')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'cleantech_generator'
                  ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sun className={`w-4 h-4 ${currentPage === 'cleantech_generator' ? 'text-slate-950' : 'text-teal-400'}`} />
              <div className="text-left">
                <div>2. Quotation Generator</div>
                <div className={`text-[10px] ${currentPage === 'cleantech_generator' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  Solar & AMC Estimator
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('cleantech_quotes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'cleantech_quotes'
                  ? 'bg-slate-800 text-teal-400 border border-teal-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <div className="text-left">
                <div>3. Past Records</div>
                <div className="text-[10px] text-slate-400 font-normal">View, Word & PDF</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('quotation_edit', { company_code: 'cleantech' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit'
                  ? 'bg-slate-800 text-teal-400 border border-teal-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-teal-400" />
              <div className="text-left">
                <div>4. Quotation Editor</div>
                <div className="text-[10px] text-slate-400 font-normal">Edit & Custom Build</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* QUICK SWITCH TO ALL COMPANIES BANNER */}
      <div className="p-3 m-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
        {currentWorkspace !== 'admin' ? (
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to All Companies</span>
          </button>
        ) : (
          <div className="text-[11px] text-slate-400 text-center">
            <div className="font-bold text-amber-400">4 Companies QMS</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Click any big card to open its company portal.</div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
