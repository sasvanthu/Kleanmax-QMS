import React from 'react';
import { User } from '../services/types';
import {
  Sparkles,
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
  FileText
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
      {/* Merged Master Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/20 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#FED10C] text-slate-950 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Super Admin Console
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All 4 Companies Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            4 Companies & Master Enterprise Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Consolidated overview and central administration across all 4 enterprise subsidiaries. Access any company portal below or configure master settings, customer directory, and global records.
          </p>
        </div>
      </div>

      {/* SECTION 1: 4 SUBSIDIARY COMPANIES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              4 Subsidiary Companies
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any company to access its dedicated quotation generator, past records, and visual editor.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Company 1: Klean Max Pro */}
          <div className="group relative bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-[#FED10C] text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Company 1
                </span>
                <span className="text-xs font-black text-slate-400">KMP</span>
              </div>

              <h3
                onClick={() => onNavigate('kleanmaxpro_dash')}
                className="text-xl font-black text-slate-900 hover:text-amber-600 transition-colors cursor-pointer"
              >
                Klean Max Pro
              </h3>
              <p className="text-[11px] font-bold text-amber-700 mt-0.5 uppercase tracking-wider">
                Floor Scrubbing & Facility Care
              </p>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Industrial mechanized scrubbing, ride-on sweeper sanitization & warehouse area calculations.
              </p>

              {/* Subpage Action Links */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmaxpro_area')}
                  className="w-full text-left font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>+ Generate Quotation</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmaxpro_quotes')}
                  className="w-full text-left font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Past Records</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-5 pt-3">
              <button
                type="button"
                onClick={() => onNavigate('kleanmaxpro_dash')}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-[#FED10C] text-white hover:text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Enter Klean Max Pro Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Company 2: Kleanmax */}
          <div className="group relative bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-sky-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-sky-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Company 2
                </span>
                <span className="text-xs font-black text-slate-400">KLM</span>
              </div>

              <h3
                onClick={() => onNavigate('kleanmax_dash')}
                className="text-xl font-black text-slate-900 hover:text-sky-600 transition-colors cursor-pointer"
              >
                Kleanmax
              </h3>
              <p className="text-[11px] font-bold text-sky-700 mt-0.5 uppercase tracking-wider">
                Cleaning, Spares & Sales
              </p>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Commercial continuous cleaning proposals, ride-on scrubbers, genuine spare parts & machine service.
              </p>

              {/* Subpage Action Links */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmax_generator')}
                  className="w-full text-left font-bold text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>+ Cleaning Proposal</span>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmax_sales')}
                  className="w-full text-left font-bold text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>+ Sales Quotation</span>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('kleanmax_quotes')}
                  className="w-full text-left font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Past Records</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-5 pt-3">
              <button
                type="button"
                onClick={() => onNavigate('kleanmax_dash')}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-sky-500 text-white hover:text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Enter Kleanmax Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Company 3: Unique Painters */}
          <div className="group relative bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-purple-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Company 3
                </span>
                <span className="text-xs font-black text-slate-400">UNP</span>
              </div>

              <h3
                onClick={() => onNavigate('uniquepainters_dash')}
                className="text-xl font-black text-slate-900 hover:text-purple-600 transition-colors cursor-pointer"
              >
                Unique Painters
              </h3>
              <p className="text-[11px] font-bold text-purple-700 mt-0.5 uppercase tracking-wider">
                Surface Coating & Painting
              </p>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Industrial epoxy floor coatings, multi-coat painting & surface prep with balanced 20mm margins.
              </p>

              {/* Subpage Action Links */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('uniquepainters_generator')}
                  className="w-full text-left font-bold text-purple-950 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>+ Generate Quotation</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('uniquepainters_quotes')}
                  className="w-full text-left font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Past Records</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-5 pt-3">
              <button
                type="button"
                onClick={() => onNavigate('uniquepainters_dash')}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-purple-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Enter Unique Painters Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Company 4: Cleantech Services */}
          <div className="group relative bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-teal-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Company 4
                </span>
                <span className="text-xs font-black text-slate-400">CTS</span>
              </div>

              <h3
                onClick={() => onNavigate('cleantech_dash')}
                className="text-xl font-black text-slate-900 hover:text-teal-600 transition-colors cursor-pointer"
              >
                Cleantech Services
              </h3>
              <p className="text-[11px] font-bold text-teal-700 mt-0.5 uppercase tracking-wider">
                Solar & Facility AMC
              </p>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Industrial solar panel de-dusting, high-rise facade cleaning & annual maintenance contracts.
              </p>

              {/* Subpage Action Links */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('cleantech_generator')}
                  className="w-full text-left font-bold text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>+ Generate Quotation</span>
                  <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('cleantech_quotes')}
                  className="w-full text-left font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Past Records</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-5 pt-3">
              <button
                type="button"
                onClick={() => onNavigate('cleantech_dash')}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-teal-500 text-white hover:text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Enter Cleantech Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MASTER ENTERPRISE MANAGEMENT (SUPER ADMIN) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Master Enterprise Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin controls for company profiles, client directory, and global audit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Manage 4 Companies */}
          <div
            onClick={() => onNavigate('settings')}
            className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                Manage 4 Companies
              </h3>
              <p className="text-xs font-bold text-amber-700 mt-1 uppercase tracking-wider">
                Letterhead, GSTIN & Bank Info
              </p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Upload letterhead banners, configure registered addresses, GSTIN numbers, contact details, and bank account info for all 4 entities.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-[#FED10C] text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
                <span>Edit Company Profiles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Customer Directory */}
          <div
            onClick={() => onNavigate('customers')}
            className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-sky-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                Customer Directory
              </h3>
              <p className="text-xs font-bold text-sky-700 mt-1 uppercase tracking-wider">
                Client Database & Accounts
              </p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Centralized client address book shared across all subsidiaries: company names, site locations, contact persons, GSTIN, and billing addresses.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-sky-500 text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
                <span>Open Client Directory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: All Past Records & Audit */}
          <div
            onClick={() => onNavigate('quotations')}
            className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                All Past Records & Audit
              </h3>
              <p className="text-xs font-bold text-emerald-700 mt-1 uppercase tracking-wider">
                Consolidated Archive & Deletion
              </p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                View, download Word (.docx) & PDF, search, filter, or perform administrative deletions across every proposal generated by any subsidiary.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-emerald-500 text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
                <span>View All Past Records</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
