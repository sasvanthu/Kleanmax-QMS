import React, { useState } from 'react';
import { User } from '../services/types';
import {
  ShieldCheck,
  ChevronDown,
  Building2,
  Users,
  FileText,
  Calculator,
  ShoppingCart,
  Paintbrush,
  Sun,
  Edit,
  Home,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentPage,
  onNavigate,
  onLogout = () => {},
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleSubOptionClick = (page: string, params?: any) => {
    setActiveDropdown(null);
    onNavigate(page, params);
  };

  const isSuperAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.company_code === 'all' ||
    !currentUser?.company_code;

  const userCompany = currentUser?.company_code;

  // Access control locks
  const showSuperAdmin = isSuperAdmin;
  const showKmp = isSuperAdmin || userCompany === 'kleanmaxpro';
  const showKlm = isSuperAdmin || userCompany === 'kleanmax';
  const showUnp = isSuperAdmin || userCompany === 'uniquepainters';
  const showCts = isSuperAdmin || userCompany === 'cleantech';
  const showHome = isSuperAdmin;

  // Default home target based on company access
  const getHomeRoute = () => {
    if (userCompany === 'kleanmaxpro') return 'kleanmaxpro_dash';
    if (userCompany === 'kleanmax') return 'kleanmax_dash';
    if (userCompany === 'uniquepainters') return 'uniquepainters_dash';
    if (userCompany === 'cleantech') return 'cleantech_dash';
    return 'dashboard';
  };

  const isSuperAdminActive =
    currentPage.startsWith('superadmin') ||
    currentPage === 'settings' ||
    currentPage === 'customers' ||
    (currentPage === 'quotations' && !currentPage.includes('_'));

  const isKmpActive = currentPage.startsWith('kleanmaxpro');
  const isKlmActive = currentPage.startsWith('kleanmax') && !currentPage.startsWith('kleanmaxpro');
  const isUnpActive = currentPage.startsWith('uniquepainters');
  const isCtsActive = currentPage.startsWith('cleantech');

  return (
    <>
      {/* Backdrop for closing dropdowns when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-xs select-none">
        {/* Left: Brand Identity & Home Link */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => handleSubOptionClick(getHomeRoute())}
            title="Go to Company Hub"
          >
            <img
              src="/logo.png"
              alt="QMS Logo"
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <span className="font-black text-sm tracking-tight text-slate-900 block leading-tight">
                KLEANMAX PRO QMS
              </span>
              <span className="text-[9px] uppercase font-extrabold text-amber-500 tracking-wider">
                {isSuperAdmin ? 'Enterprise Operations' : `${currentUser?.full_name || 'Portal'} Mode`}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Locked Navigation Dropdowns per Account */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Home Button (Visible to Super Admin) */}
          {showHome && (
            <button
              onClick={() => handleSubOptionClick('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                currentPage === 'dashboard'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="All Companies Home"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Home</span>
            </button>
          )}

          {/* 1. Super Admin Dropdown */}
          {showSuperAdmin && (
            <div className="relative">
              <button
                onClick={(e) => toggleDropdown('superadmin', e)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSuperAdminActive
                    ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
                    : activeDropdown === 'superadmin'
                    ? 'bg-slate-200 text-slate-950'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs">👑</span>
                <span className="hidden sm:inline">Super Admin</span>
                <span className="sm:hidden">Admin</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'superadmin' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'superadmin' && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 border-b border-slate-100 flex items-center justify-between">
                    <span>Super Admin Console</span>
                    <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold">Master</span>
                  </div>

                  <button
                    onClick={() => handleSubOptionClick('dashboard')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">Admin Console Hub</div>
                      <div className="text-[10px] text-slate-500 font-normal">Merged home & 4 companies overview</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('settings')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">Manage 4 Companies</div>
                      <div className="text-[10px] text-slate-500 font-normal">Letterhead banners, GSTIN & bank details</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('customers')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-sky-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">Customer Directory</div>
                      <div className="text-[10px] text-slate-500 font-normal">Master client accounts & addresses</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('quotations')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-emerald-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">All Past Records & Audit</div>
                      <div className="text-[10px] text-slate-500 font-normal">Global proposals & administrative delete</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Klean Max Pro Dropdown */}
          {showKmp && (
            <div className="relative">
              <button
                onClick={(e) => toggleDropdown('kleanmaxpro', e)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isKmpActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : activeDropdown === 'kleanmaxpro'
                    ? 'bg-amber-100 text-amber-950'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="hidden sm:inline">Klean Max Pro</span>
                <span className="sm:hidden">KMP</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'kleanmaxpro' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'kleanmaxpro' && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 border-b border-slate-100 flex items-center justify-between">
                    <span>Klean Max Pro (KMP)</span>
                    <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">Floor Scrub</span>
                  </div>

                  <button
                    onClick={() => handleSubOptionClick('kleanmaxpro_dash')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">1. Company Hub</div>
                      <div className="text-[10px] text-slate-500 font-normal">Klean Max Pro big navigation cards</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('kleanmaxpro_area')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">2. Quotation Generator</div>
                      <div className="text-[10px] text-slate-500 font-normal">Area-based warehouse floor scrubbing</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('kleanmaxpro_quotes')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">3. Past Records</div>
                      <div className="text-[10px] text-slate-500 font-normal">View preview, Word (.docx) & PDF</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('quotation_edit', { company_code: 'kleanmaxpro' })}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">4. Quotation Editor</div>
                      <div className="text-[10px] text-slate-500 font-normal">Custom line items, machinery & rates</div>
                    </div>
                  </button>

                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => handleSubOptionClick('settings', { tab: 'kleanmaxpro' })}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-amber-800 hover:bg-amber-50/60 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Company Letterhead & Info</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Kleanmax Dropdown */}
          {showKlm && (
            <div className="relative">
              <button
                onClick={(e) => toggleDropdown('kleanmax', e)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isKlmActive
                    ? 'bg-sky-500 text-slate-950 font-black shadow-xs'
                    : activeDropdown === 'kleanmax'
                    ? 'bg-sky-100 text-sky-950'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="hidden sm:inline">Kleanmax</span>
                <span className="sm:hidden">KLM</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'kleanmax' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'kleanmax' && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-sky-600 border-b border-slate-100 flex items-center justify-between">
                    <span>Kleanmax (KLM)</span>
                    <span className="text-[9px] bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded font-bold">Cleaning & Spares</span>
                  </div>

                  <button
                    onClick={() => handleSubOptionClick('kleanmax_dash')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-sky-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">1. Company Hub</div>
                      <div className="text-[10px] text-slate-500 font-normal">Kleanmax big navigation cards</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('kleanmax_generator')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-sky-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">2. Proposal Generator</div>
                      <div className="text-[10px] text-slate-500 font-normal">Continuous Word-style cleaning proposals</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('kleanmax_sales')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-sky-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">3. Equipment Sales Quote</div>
                      <div className="text-[10px] text-slate-500 font-normal">Machinery, spare parts & accessories</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('kleanmax_quotes')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-sky-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">4. Past Records</div>
                      <div className="text-[10px] text-slate-500 font-normal">View preview, Word (.docx) & PDF</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('quotation_edit', { company_code: 'kleanmax' })}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-sky-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">5. Quotation Editor</div>
                      <div className="text-[10px] text-slate-500 font-normal">Custom line items, spares & terms</div>
                    </div>
                  </button>

                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => handleSubOptionClick('settings', { tab: 'kleanmax' })}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-sky-800 hover:bg-sky-50/60 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Company Letterhead & Info</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Unique Painters Dropdown */}
          {showUnp && (
            <div className="relative">
              <button
                onClick={(e) => toggleDropdown('uniquepainters', e)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isUnpActive
                    ? 'bg-purple-600 text-white font-black shadow-xs'
                    : activeDropdown === 'uniquepainters'
                    ? 'bg-purple-100 text-purple-950'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="hidden sm:inline">Unique Painters</span>
                <span className="sm:hidden">UNP</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'uniquepainters' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'uniquepainters' && (
                <div className="absolute left-0 sm:left-auto sm:right-0 md:left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-purple-600 border-b border-slate-100 flex items-center justify-between">
                    <span>Unique Painters (UNP)</span>
                    <span className="text-[9px] bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-bold">Painting & Epoxy</span>
                  </div>

                  <button
                    onClick={() => handleSubOptionClick('uniquepainters_dash')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-purple-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">1. Company Hub</div>
                      <div className="text-[10px] text-slate-500 font-normal">Unique Painters big navigation cards</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('uniquepainters_generator')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-purple-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Paintbrush className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">2. Painting Generator</div>
                      <div className="text-[10px] text-slate-500 font-normal">Painting & epoxy quotes (20mm margins)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('uniquepainters_quotes')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-purple-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">3. Past Records</div>
                      <div className="text-[10px] text-slate-500 font-normal">View preview, Word (.docx) & PDF</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('quotation_edit', { company_code: 'uniquepainters' })}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-purple-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">4. Quotation Editor</div>
                      <div className="text-[10px] text-slate-500 font-normal">Custom paint lines, primer & terms</div>
                    </div>
                  </button>

                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => handleSubOptionClick('settings', { tab: 'uniquepainters' })}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-purple-800 hover:bg-purple-50/60 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      <span>Company Letterhead & Info</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Cleantech Services Dropdown */}
          {showCts && (
            <div className="relative">
              <button
                onClick={(e) => toggleDropdown('cleantech', e)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCtsActive
                    ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                    : activeDropdown === 'cleantech'
                    ? 'bg-teal-100 text-teal-950'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="hidden sm:inline">Cleantech Services</span>
                <span className="sm:hidden">CTS</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'cleantech' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'cleantech' && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-teal-600 border-b border-slate-100 flex items-center justify-between">
                    <span>Cleantech Services (CTS)</span>
                    <span className="text-[9px] bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded font-bold">Solar & AMC</span>
                  </div>

                  <button
                    onClick={() => handleSubOptionClick('cleantech_dash')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-teal-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">1. Company Hub</div>
                      <div className="text-[10px] text-slate-500 font-normal">Cleantech big navigation cards</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('cleantech_generator')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-teal-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sun className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">2. Solar & AMC Generator</div>
                      <div className="text-[10px] text-slate-500 font-normal">Solar panels, facade & scheduled AMC</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('cleantech_quotes')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-teal-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">3. Past Records</div>
                      <div className="text-[10px] text-slate-500 font-normal">View preview, Word (.docx) & PDF</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSubOptionClick('quotation_edit', { company_code: 'cleantech' })}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-teal-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-900">4. Quotation Editor</div>
                      <div className="text-[10px] text-slate-500 font-normal">Custom line items, schedules & terms</div>
                    </div>
                  </button>

                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => handleSubOptionClick('settings', { tab: 'cleantech' })}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-teal-800 hover:bg-teal-50/60 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Company Letterhead & Info</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Controls: User Profile + Logout Button */}
        <div className="flex items-center gap-3 shrink-0 pl-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-[#FED10C] font-black text-xs flex items-center justify-center border border-slate-300 shadow-xs">
              {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {currentUser?.full_name || 'User'}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {isSuperAdmin ? 'Super Admin' : `${userCompany?.toUpperCase()} Access`}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Log Out of QMS"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default Navbar;
