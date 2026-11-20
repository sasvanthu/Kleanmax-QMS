import React from 'react';
import { User } from '../services/types';
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  Paintbrush,
  Sun,
  Wrench,
  Layers,
  ChevronRight,
  Settings,
  Users,
  FileText,
  Plus,
  LayoutDashboard
} from 'lucide-react';

interface DashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onNavigate,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 font-sans">
      {/* SECTION 1: 4 SUBSIDIARY COMPANIES */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Companies
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an enterprise division to launch quotation generators, view past records, or open the hub.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Klean Max Pro */}
          <div className="group relative bg-white rounded-2xl border-t-4 border-t-amber-500 border-x border-b border-slate-200 hover:border-amber-400/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
            <div>
              {/* Header: Company Name & Direct Hub Link */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    onClick={() => onNavigate('kleanmaxpro_dash')}
                    className="text-lg font-black text-slate-900 hover:text-amber-600 transition-colors cursor-pointer tracking-tight truncate"
                  >
                    Klean Max Pro
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider truncate">
                      Floor Care & Scrubbing
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmaxpro_dash')}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-amber-100/70 border border-slate-200/80 text-slate-500 hover:text-amber-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                  title="Open Klean Max Pro Hub"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clean hairline divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* 3 Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmaxpro_area')}
                  className="w-full text-left font-black text-xs text-slate-950 bg-[#FED10C] hover:bg-amber-400 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Plus className="w-4 h-4 text-slate-950 shrink-0" />
                    <span className="truncate">Generate Quotation</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-900 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('kleanmaxpro_quotes')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Past Records</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('kleanmaxpro_dash')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Company Hub</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Kleanmax */}
          <div className="group relative bg-white rounded-2xl border-t-4 border-t-sky-500 border-x border-b border-slate-200 hover:border-sky-400/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
            <div>
              {/* Header: Company Name & Direct Hub Link */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    onClick={() => onNavigate('kleanmax_dash')}
                    className="text-lg font-black text-slate-900 hover:text-sky-600 transition-colors cursor-pointer tracking-tight truncate"
                  >
                    Kleanmax
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider truncate">
                      Cleaning & Spares Sales
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmax_dash')}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-sky-100/70 border border-slate-200/80 text-slate-500 hover:text-sky-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                  title="Open Kleanmax Hub"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clean hairline divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* 3 Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmax_generator')}
                  className="w-full text-left font-black text-xs text-slate-950 bg-sky-400 hover:bg-sky-500 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Plus className="w-4 h-4 text-slate-950 shrink-0" />
                    <span className="truncate">Cleaning Proposal</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-900 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('kleanmax_sales')}
                  className="w-full text-left font-bold text-xs text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 hover:border-sky-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Plus className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">Sales Quotation</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-600 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('kleanmax_quotes')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Past Records</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Unique Painters */}
          <div className="group relative bg-white rounded-2xl border-t-4 border-t-purple-600 border-x border-b border-slate-200 hover:border-purple-400/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
            <div>
              {/* Header: Company Name & Direct Hub Link */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    onClick={() => onNavigate('uniquepainters_dash')}
                    className="text-lg font-black text-slate-900 hover:text-purple-600 transition-colors cursor-pointer tracking-tight truncate"
                  >
                    Unique Painters
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                    <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider truncate">
                      Surface & Coating
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('uniquepainters_dash')}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-purple-100/70 border border-slate-200/80 text-slate-500 hover:text-purple-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                  title="Open Unique Painters Hub"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clean hairline divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* 3 Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('uniquepainters_generator')}
                  className="w-full text-left font-black text-xs text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Plus className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">Generate Quotation</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('uniquepainters_quotes')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Past Records</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('uniquepainters_dash')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Company Hub</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Cleantech Services */}
          <div className="group relative bg-white rounded-2xl border-t-4 border-t-teal-600 border-x border-b border-slate-200 hover:border-teal-400/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
            <div>
              {/* Header: Company Name & Direct Hub Link */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    onClick={() => onNavigate('cleantech_dash')}
                    className="text-lg font-black text-slate-900 hover:text-teal-600 transition-colors cursor-pointer tracking-tight truncate"
                  >
                    Cleantech Services
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                    <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider truncate">
                      Solar & Facility Care
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('cleantech_dash')}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-teal-100/70 border border-slate-200/80 text-slate-500 hover:text-teal-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                  title="Open Cleantech Services Hub"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clean hairline divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* 3 Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('cleantech_generator')}
                  className="w-full text-left font-black text-xs text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Plus className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">Generate Quotation</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('cleantech_quotes')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Past Records</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('cleantech_dash')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Company Hub</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MASTER ENTERPRISE MANAGEMENT (SUPER ADMIN) */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Enterprise Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Master administrative controls for company letterheads, client database, and global records audit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Manage 4 Companies */}
          <div className="group relative bg-white rounded-2xl border-t-4 border-t-amber-500 border-x border-b border-slate-200 hover:border-amber-400/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
            <div>
              {/* Header: Title & Shortcut Link */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    onClick={() => onNavigate('settings')}
                    className="text-lg font-black text-slate-900 hover:text-amber-600 transition-colors cursor-pointer tracking-tight truncate"
                  >
                    Manage 4 Companies
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider truncate">
                      Letterhead, GSTIN & Bank Info
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-amber-100/70 border border-slate-200/80 text-slate-500 hover:text-amber-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                  title="Edit Company Profiles"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clean hairline divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  className="w-full text-left font-black text-xs text-slate-950 bg-[#FED10C] hover:bg-amber-400 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-slate-950 shrink-0" />
                    <span className="truncate">Edit Company Profiles</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-900 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('settings', { tab: 'kleanmaxpro' })}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Settings className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Letterhead Banners & Bank Accounts</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Customer Directory */}
          <div className="group relative bg-white rounded-2xl border-t-4 border-t-sky-500 border-x border-b border-slate-200 hover:border-sky-400/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
            <div>
              {/* Header: Title & Shortcut Link */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    onClick={() => onNavigate('customers')}
                    className="text-lg font-black text-slate-900 hover:text-sky-600 transition-colors cursor-pointer tracking-tight truncate"
                  >
                    Customer Directory
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider truncate">
                      Client Database & Accounts
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('customers')}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-sky-100/70 border border-slate-200/80 text-slate-500 hover:text-sky-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                  title="Open Client Directory"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clean hairline divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('customers')}
                  className="w-full text-left font-black text-xs text-slate-950 bg-sky-400 hover:bg-sky-500 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="w-4 h-4 text-slate-950 shrink-0" />
                    <span className="truncate">Open Client Directory</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-900 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('customers')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Add Customer & Billing Address</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: All Past Records & Audit */}
          <div className="group relative bg-white rounded-2xl border-t-4 border-t-emerald-600 border-x border-b border-slate-200 hover:border-emerald-400/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
            <div>
              {/* Header: Title & Shortcut Link */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    onClick={() => onNavigate('quotations')}
                    className="text-lg font-black text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer tracking-tight truncate"
                  >
                    All Past Records & Audit
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider truncate">
                      Consolidated Archive & Deletion
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('quotations')}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-emerald-100/70 border border-slate-200/80 text-slate-500 hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                  title="View All Past Records"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clean hairline divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('quotations')}
                  className="w-full text-left font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">View All Past Records</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Layers className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                    <span className="truncate">Master Services Catalogue</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
