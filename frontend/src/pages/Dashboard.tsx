import React, { useState, useEffect } from 'react';
import { Quotation, Customer, Service, User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Clock, CheckCircle2, Send, PlusCircle, Users,
  ArrowUpRight, Search, Eye, TrendingUp, Calculator,
  Building2, ShieldCheck, Layers, Check, Sparkles,
  AlertCircle, ChevronRight, Download, Wrench, ShoppingCart,
  ArrowRight, Paintbrush, Sun, Shield, Palette, HardHat, Edit
} from 'lucide-react';

interface DashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<CompanySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState<'all' | 'kleanmaxpro' | 'kleanmax' | 'uniquepainters' | 'cleantech'>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qList, cList, comps] = await Promise.all([
        api.quotations.list(),
        api.customers.list(),
        api.company.getAll(),
      ]);
      setQuotations(qList);
      setCustomers(cList);
      setCompanies(comps);
    } catch (err) {
      console.error('Error loading master dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (id: string, quotationNumber: string) => {
    setApprovingId(id);
    try {
      await api.quotations.approve(id);
      setToastMessage(`Quotation ${quotationNumber} approved successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve quotation');
    } finally {
      setApprovingId(null);
    }
  };

  // Metrics per company
  const kmpQuotes = quotations.filter(q => q.company_code === 'kleanmaxpro' || (!q.company_code && q.quotation_type === 'area_based'));
  const klmQuotes = quotations.filter(q => q.company_code === 'kleanmax' || q.quotation_type === 'repair_service' || (q.customer_ref && q.customer_ref.startsWith('KM/')));
  const unpQuotes = quotations.filter(q => q.company_code === 'uniquepainters' || (q.job_description && q.job_description.toLowerCase().includes('paint')));
  const ctsQuotes = quotations.filter(q => q.company_code === 'cleantech' || (q.job_description && (q.job_description.toLowerCase().includes('solar') || q.job_description.toLowerCase().includes('facade') || q.job_description.toLowerCase().includes('amc'))));

  const totalValue = quotations.reduce((sum, q) => sum + Number(q.final_amount || 0), 0);
  const kmpValue = kmpQuotes.reduce((sum, q) => sum + Number(q.final_amount || 0), 0);
  const klmValue = klmQuotes.reduce((sum, q) => sum + Number(q.final_amount || 0), 0);
  const unpValue = unpQuotes.reduce((sum, q) => sum + Number(q.final_amount || 0), 0);
  const ctsValue = ctsQuotes.reduce((sum, q) => sum + Number(q.final_amount || 0), 0);

  const pendingCount = quotations.filter(q => q.status === 'pending_approval').length;
  const approvedCount = quotations.filter(q => q.status === 'approved' || q.status === 'issued').length;

  // Filtered quotations list
  const filteredQuotations = quotations.filter(q => {
    // Company match
    if (companyFilter === 'kleanmaxpro') {
      if (q.company_code !== 'kleanmaxpro' && q.quotation_type !== 'area_based') return false;
    } else if (companyFilter === 'kleanmax') {
      if (q.company_code !== 'kleanmax' && q.quotation_type !== 'repair_service') return false;
    } else if (companyFilter === 'uniquepainters') {
      if (q.company_code !== 'uniquepainters') return false;
    } else if (companyFilter === 'cleantech') {
      if (q.company_code !== 'cleantech') return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const numMatch = q.quotation_number?.toLowerCase().includes(query);
      const custMatch = q.customer?.company_name?.toLowerCase().includes(query);
      const descMatch = q.job_description?.toLowerCase().includes(query);
      return numMatch || custMatch || descMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl shadow-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-extrabold text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Unified Executive Master Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-sky-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 bg-[#FED10C] text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                Unified Enterprise Hub
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                4 Active Companies Integrated
              </span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                Admin Privilege Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Enterprise Operations & 5-Dashboard Administration
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Consolidated administration across <span className="text-amber-400 font-bold">Kleanmax Pro</span> (Floor Scrubbing), <span className="text-sky-400 font-bold">Kleanmax</span> (Spares & Sales), <span className="text-purple-400 font-bold">Unique Painters</span> (Surface Coating), and <span className="text-emerald-400 font-bold">Cleantech Services</span> (Sanitization & AMC).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow-xs flex items-center gap-2 transition-all"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Manage 4 Companies (All Editable)</span>
            </button>
            <button
              onClick={() => onNavigate('create_quotation')}
              className="px-4 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Quotation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Enterprise Pipeline</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">{approvedCount} approved / issued</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Quotations</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{quotations.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 4 commercial subsidiaries
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">
            Awaiting executive sign-off
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Client Accounts</span>
            <Users className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{customers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Industrial, tech parks & commercial
          </div>
        </div>
      </div>

      {/* 4 Company Hubs Grid (The Core Multi-Company Navigator) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <span>Dedicated Company Hubs & Dashboards</span>
            </h2>
            <p className="text-xs text-slate-500">
              Select any of the 4 subsidiaries to access its tailored workspace, calculators, and proposals.
            </p>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <span>Edit All 4 Company Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Company 1: Kleanmax Pro */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-[#FED10C] text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Company 1
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">KMP</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                Klean Max Pro
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Commercial floor scrubbing, mechanized warehouse cleaning & area calculations.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Proposals:</span>
                  <span className="font-bold text-slate-900">{kmpQuotes.length}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pipeline:</span>
                  <span className="font-black text-amber-700">₹{kmpValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-1.5">
              <button
                onClick={() => onNavigate('kleanmaxpro_area')}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>1. Quotation Generator</span>
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onNavigate('kleanmaxpro_quotes')}
                  className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 border border-slate-200"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>2. Past Quotes</span>
                </button>
                <button
                  onClick={() => onNavigate('quotation_edit', { company_code: 'kleanmaxpro' })}
                  className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 border border-slate-200"
                >
                  <Edit className="w-3 h-3 text-blue-500" />
                  <span>3. Editor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Company 2: Kleanmax */}
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-xs hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-sky-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Company 2
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">KLM</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                Kleanmax
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Industrial equipment sales, machine repairs, spare parts & job cards.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Proposals:</span>
                  <span className="font-bold text-slate-900">{klmQuotes.length}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pipeline:</span>
                  <span className="font-black text-sky-700">₹{klmValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-1.5">
              <button
                onClick={() => onNavigate('kleanmax_spares')}
                className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>1. Quotation Generator</span>
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onNavigate('kleanmax_quotes')}
                  className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 border border-slate-200"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>2. Past Quotes</span>
                </button>
                <button
                  onClick={() => onNavigate('quotation_edit', { company_code: 'kleanmax' })}
                  className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 border border-slate-200"
                >
                  <Edit className="w-3 h-3 text-blue-500" />
                  <span>3. Editor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Company 3: Unique Painters */}
          <div className="bg-white rounded-2xl border-2 border-purple-200 p-5 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-purple-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Company 3
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">UNP</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                Unique Painters
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Commercial & residential painting, heavy duty epoxy flooring & waterproofing.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Proposals:</span>
                  <span className="font-bold text-slate-900">{unpQuotes.length}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pipeline:</span>
                  <span className="font-black text-purple-700">₹{unpValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-1.5">
              <button
                onClick={() => onNavigate('uniquepainters_generator')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>1. Quotation Generator</span>
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onNavigate('uniquepainters_quotes')}
                  className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 border border-slate-200"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>2. Past Quotes</span>
                </button>
                <button
                  onClick={() => onNavigate('quotation_edit', { company_code: 'uniquepainters' })}
                  className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 border border-slate-200"
                >
                  <Edit className="w-3 h-3 text-blue-500" />
                  <span>3. Editor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Company 4: Cleantech Services */}
          <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-emerald-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Company 4
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">CTS</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                Cleantech Services
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Solar PV array cleaning, facade glass cradles, kitchen ducting & long-term AMC.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Proposals:</span>
                  <span className="font-bold text-slate-900">{ctsQuotes.length}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pipeline:</span>
                  <span className="font-black text-emerald-700">₹{ctsValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-1.5">
              <button
                onClick={() => onNavigate('cleantech_generator')}
                className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>1. Quotation Generator</span>
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onNavigate('cleantech_quotes')}
                  className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 border border-slate-200"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>2. Past Quotes</span>
                </button>
                <button
                  onClick={() => onNavigate('quotation_edit', { company_code: 'cleantech' })}
                  className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 border border-slate-200"
                >
                  <Edit className="w-3 h-3 text-blue-500" />
                  <span>3. Editor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Master Quotations Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Master Quotations Stream (All 4 Companies)
            </h2>
            <p className="text-xs text-slate-500">
              Filter by subsidiary or search across quotation number, client name, and job specifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:border-amber-400 focus:outline-hidden w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Company Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-100 pb-3">
          {[
            { id: 'all', label: `All Entities (${quotations.length})`, color: 'bg-slate-900 text-white' },
            { id: 'kleanmaxpro', label: `⚡ Kleanmax Pro (${kmpQuotes.length})`, color: 'bg-amber-400 text-slate-950 font-black' },
            { id: 'kleanmax', label: `🔧 Kleanmax (${klmQuotes.length})`, color: 'bg-sky-500 text-slate-950 font-black' },
            { id: 'uniquepainters', label: `🎨 Unique Painters (${unpQuotes.length})`, color: 'bg-purple-600 text-white font-bold' },
            { id: 'cleantech', label: `🌿 Cleantech Services (${ctsQuotes.length})`, color: 'bg-emerald-600 text-white font-bold' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCompanyFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                companyFilter === tab.id
                  ? `${tab.color} shadow-xs font-bold`
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredQuotations.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No quotations found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Company Entity</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.slice(0, 10).map((q) => {
                  const compCode = q.company_code || (q.quotation_type === 'area_based' ? 'kleanmaxpro' : 'kleanmax');
                  const compBadge =
                    compCode === 'kleanmaxpro' ? { name: 'Klean Max Pro', badge: 'bg-amber-100 text-amber-800' } :
                    compCode === 'kleanmax' ? { name: 'Kleanmax', badge: 'bg-sky-100 text-sky-800' } :
                    compCode === 'uniquepainters' ? { name: 'Unique Painters', badge: 'bg-purple-100 text-purple-800' } :
                    { name: 'Cleantech', badge: 'bg-emerald-100 text-emerald-800' };

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {q.quotation_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${compBadge.badge}`}>
                          {compBadge.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {q.customer?.company_name || 'Commercial Client'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{q.quotation_date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          q.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          q.status === 'issued' ? 'bg-sky-100 text-sky-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        ₹{Number(q.final_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {q.status === 'pending_approval' && (
                            <button
                              onClick={() => handleQuickApprove(q.id, q.quotation_number)}
                              disabled={approvingId === q.id}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              {approvingId === q.id ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate('quotation_edit', { id: q.id })}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 rounded-lg transition-colors"
                            title="Edit Quotation"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => api.quotations.downloadDocx(q.id)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="Download Word (.docx)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => api.quotations.downloadPdf(q.id)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenPreview(q.id)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg transition-colors"
                            title="Preview A4 Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
