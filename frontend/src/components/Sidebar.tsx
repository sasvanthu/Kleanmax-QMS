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
                currentWorkspace === 'admin'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>👑 Unified Admin</span>
              </div>
              <span className="text-[9px] opacity-75">4 Cos</span>
            </button>

            <button
              onClick={() => onNavigate('kleanmaxpro_area')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentWorkspace === 'kleanmaxpro'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>⚡ Kleanmax Pro</span>
              </div>
              <span className="text-[9px] opacity-75">Scrubbing</span>
            </button>

            <button
              onClick={() => onNavigate('kleanmax_generator')}
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
              <span className="text-[9px] opacity-75">Cleaning</span>
            </button>

            <button
              onClick={() => onNavigate('uniquepainters_generator')}
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
              onClick={() => onNavigate('cleantech_generator')}
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
              <span className="text-[9px] opacity-75">Solar</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE PAGES */}
        {currentWorkspace === 'admin' ? (
          /* ================= UNIFIED ADMIN PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                ADMINISTRATION (4 COS)
              </span>
            </div>

            <button
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>4 Companies Overview</span>
            </button>

            <button
              onClick={() => onNavigate('quotations')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotations'
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Past Quotations (All)</span>
            </button>

            <button
              onClick={() => onNavigate('quotation_edit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit' || currentPage === 'create_quotation'
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-blue-400" />
              <span>Quotation Editor</span>
            </button>

            <button
              onClick={() => onNavigate('services')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'services'
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Products & Services</span>
            </button>

            <button
              onClick={() => onNavigate('customers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'customers'
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Customer Details</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'settings'
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Manage 4 Companies</span>
            </button>
          </div>
        ) : currentWorkspace === 'kleanmaxpro' ? (
          /* ================= KLEANMAX PRO: 3 FOCUSED PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                KLEANMAX PRO (3 PAGES)
              </span>
            </div>

            {/* Page 1: Quotation Generator */}
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
                <div>1. Quotation Generator</div>
                <div className={`text-[10px] ${currentPage === 'kleanmaxpro_area' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  Rental, Sales & Service
                </div>
              </div>
            </button>

            {/* Page 2: Past Quotations */}
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
                <div>2. Past Quotations</div>
                <div className="text-[10px] text-slate-400 font-normal">View, PDF/Word & Edit</div>
              </div>
            </button>

            {/* Page 3: Quotation Editor */}
            <button
              onClick={() => onNavigate('quotation_edit', { company_code: 'kleanmaxpro' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit' && !currentPage.includes('kleanmax_')
                  ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <div>3. Quotation Editor</div>
                <div className="text-[10px] text-slate-400 font-normal">Edit & Custom Build</div>
              </div>
            </button>
          </div>
        ) : currentWorkspace === 'kleanmax' ? (
          /* ================= KLEANMAX: 3 FOCUSED PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                KLEANMAX (3 PAGES)
              </span>
            </div>

            {/* Page 1: Quotation Generator */}
            <button
              onClick={() => onNavigate('kleanmax_generator')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'kleanmax_generator' || currentPage === 'kleanmax_spares' || currentPage === 'kleanmax_sales'
                  ? 'bg-sky-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className={`w-4 h-4 ${currentPage === 'kleanmax_generator' ? 'text-slate-950' : 'text-sky-400'}`} />
              <div className="text-left">
                <div>1. Proposal Generator</div>
                <div className={`text-[10px] ${currentPage === 'kleanmax_generator' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  Commercial Cleaning Proposals
                </div>
              </div>
            </button>

            {/* Page 2: Past Quotations */}
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
                <div>2. Past Quotations</div>
                <div className="text-[10px] text-slate-400 font-normal">View, PDF/Word & Edit</div>
              </div>
            </button>

            {/* Page 3: Quotation Editor */}
            <button
              onClick={() => onNavigate('quotation_edit', { company_code: 'kleanmax' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit'
                  ? 'bg-slate-800 text-sky-400 border border-sky-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <div>3. Quotation Editor</div>
                <div className="text-[10px] text-slate-400 font-normal">Edit & Custom Build</div>
              </div>
            </button>
          </div>
        ) : currentWorkspace === 'uniquepainters' ? (
          /* ================= UNIQUE PAINTERS: 3 FOCUSED PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                UNIQUE PAINTERS (3 PAGES)
              </span>
            </div>

            {/* Page 1: Quotation Generator */}
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
                <div>1. Quotation Generator</div>
                <div className={`text-[10px] ${currentPage === 'uniquepainters_generator' ? 'text-purple-200' : 'text-slate-400'}`}>
                  Painting & Epoxy Estimator
                </div>
              </div>
            </button>

            {/* Page 2: Past Quotations */}
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
                <div>2. Past Quotations</div>
                <div className="text-[10px] text-slate-400 font-normal">View, PDF/Word & Edit</div>
              </div>
            </button>

            {/* Page 3: Quotation Editor */}
            <button
              onClick={() => onNavigate('quotation_edit', { company_code: 'uniquepainters' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit'
                  ? 'bg-slate-800 text-purple-400 border border-purple-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <div>3. Quotation Editor</div>
                <div className="text-[10px] text-slate-400 font-normal">Edit & Custom Build</div>
              </div>
            </button>
          </div>
        ) : (
          /* ================= CLEANTECH SERVICES: 3 FOCUSED PAGES ================= */
          <div className="space-y-1">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                CLEANTECH SERVICES (3 PAGES)
              </span>
            </div>

            {/* Page 1: Quotation Generator */}
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
                <div>1. Quotation Generator</div>
                <div className={`text-[10px] ${currentPage === 'cleantech_generator' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  Solar Array & AMC Estimator
                </div>
              </div>
            </button>

            {/* Page 2: Past Quotations */}
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
                <div>2. Past Quotations</div>
                <div className="text-[10px] text-slate-400 font-normal">View, PDF/Word & Edit</div>
              </div>
            </button>

            {/* Page 3: Quotation Editor */}
            <button
              onClick={() => onNavigate('quotation_edit', { company_code: 'cleantech' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 'quotation_edit'
                  ? 'bg-slate-800 text-teal-400 border border-teal-400/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <div>3. Quotation Editor</div>
                <div className="text-[10px] text-slate-400 font-normal">Edit & Custom Build</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* QUICK SWITCH TO ADMIN BANNER */}
      <div className="p-3 m-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
        {currentWorkspace !== 'admin' ? (
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Switch to Admin</span>
          </button>
        ) : (
          <div className="text-[11px] text-slate-400">
            <div className="font-bold text-amber-400">Admin Portfolio Mode</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Click any company button above to open its 3-page Employee Dashboard.</div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
