import React, { useState, useEffect } from 'react';
import { Quotation, Service, User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  Wrench, ShoppingCart, FileText, CheckCircle2, PlusCircle,
  Building2, ArrowRight, Eye, ShieldCheck, TrendingUp, Package,
  Zap, Clock, Layers, Edit, Download
} from 'lucide-react';

interface KleanmaxDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const KleanmaxDashboard: React.FC<KleanmaxDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qList, comp] = await Promise.all([
        api.quotations.list({ company_code: 'kleanmax' }),
        api.company.get('kleanmax'),
      ]);
      setQuotations(qList);
      setCompany(comp);
    } catch (err) {
      console.error('Failed to load Kleanmax data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalQuotes = quotations.length;
  const totalValue = quotations.reduce((acc, q) => acc + Number(q.final_amount || 0), 0);
  const repairQuotes = quotations.filter(q => q.quotation_type === 'repair_service');
  const salesQuotes = quotations.filter(q => q.quotation_type === 'item_based' || q.quotation_type === 'equipment_sales');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-sky-500/30 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-sky-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-xs">
                Company 2 • Spares & Sales Hub
              </span>
              <span className="bg-sky-400/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                Prefix: {company?.quotation_prefix || 'KLM'}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Entity
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{company?.company_name || 'Kleanmax'}</span>
              <span className="text-sm font-semibold text-sky-400 bg-sky-400/10 px-3 py-1 rounded-lg border border-sky-400/20">
                Equipment, Spares & Authorized Machine Service
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Official sales of industrial ride-on scrubber dryers, walk-behinds, genuine spare parts, and fast turnaround repair job cards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('kleanmax_spares')}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>Spares & Repair Quote</span>
            </button>
            <button
              onClick={() => onNavigate('kleanmax_sales')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-400/40 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-sky-400" />
              <span>Equipment Sale Quote</span>
            </button>
            <button
              onClick={() => onNavigate('settings', { tab: 'kleanmax' })}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Edit Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Quotations</span>
            <FileText className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalQuotes}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
            <span>{repairQuotes.length} Repairs</span>
            <span>•</span>
            <span>{salesQuotes.length} Machine Sales</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Equipment Pipeline</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            Machines & Replacement Spares
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Parts In Stock</span>
            <Package className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">120+ <span className="text-xs font-normal text-slate-500">SKUs</span></div>
          <div className="text-[11px] text-slate-500 mt-1">
            Squeegees, scrub discs, vacuum motors
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">GSTIN & Entity</span>
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-xs font-mono font-black text-slate-800 truncate">
            {company?.gstin || '33DXIPS4251R2ZP'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {company?.legal_name || 'Kleanmax Equipment & Spares India LLP'}
          </div>
        </div>
      </div>

      {/* Dual Launchers: Spares vs Sales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Launcher 1: Spares & Service (Imgs 1-2) */}
        <div className="bg-white rounded-2xl border-2 border-sky-100 p-6 shadow-xs hover:border-sky-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-sky-50 text-sky-800 border border-sky-200 font-black text-xs px-3 py-1 rounded-full uppercase">
                Service Division
              </span>
              <Wrench className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Scrubber Repair & Spare Parts Quotation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Pre-configured template based on standard machine overhaul job cards. Includes squeegee rubbers, suction hoses, battery terminals, and labor charges with auto-calculated GST.
            </p>

            <div className="space-y-2 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">B 40 C EP Squeegee Rubbers (Set)</span>
                <span className="font-bold text-slate-900">₹4,200</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Suction Hose Assembly 38mm</span>
                <span className="font-bold text-slate-900">₹3,800</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">On-Site Overhaul Service Labor</span>
                <span className="font-bold text-slate-900">₹1,500</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('kleanmax_spares')}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
          >
            <Wrench className="w-4 h-4" />
            <span>Generate Spares & Service Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Launcher 2: Equipment Sales (Imgs 3-4) */}
        <div className="bg-white rounded-2xl border-2 border-sky-100 p-6 shadow-xs hover:border-sky-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 font-black text-xs px-3 py-1 rounded-full uppercase">
                Machine Sales Division
              </span>
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Industrial Equipment Sales Quotation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Direct commercial machine quotation generator with manufacturer warranty, technical specifications, and official bank payment instructions printed on letterhead.
            </p>

            <div className="space-y-2 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">KMP-850R Ride-On Scrubber Dryer</span>
                <span className="font-bold text-slate-900">₹4,85,000</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Heavy Duty Wet & Dry 80L Vacuum</span>
                <span className="font-bold text-slate-900">₹38,500</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Walk-Behind 500mm Electric Scrubber</span>
                <span className="font-bold text-slate-900">₹1,95,000</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('kleanmax_sales')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
          >
            <ShoppingCart className="w-4 h-4 text-sky-400" />
            <span>Generate Equipment Sales Quote</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Recent Kleanmax Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Recent Kleanmax Quotations</h2>
            <p className="text-xs text-slate-500">Machine repair job cards and commercial equipment sales.</p>
          </div>
          <button
            onClick={() => onNavigate('kleanmax_quotes')}
            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
          >
            <span>View All ({totalQuotes})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {quotations.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No quotations found for Kleanmax.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.slice(0, 6).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {q.quotation_number}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {q.customer?.company_name || 'Industrial Customer'}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600">
                      {q.quotation_type.replace('_', ' ')}
                    </td>
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
                        <button
                          onClick={() => onNavigate('quotation_edit', { id: q.id })}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 rounded-lg transition-colors"
                          title="Edit Quotation"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => api.quotations.downloadDocx(q.id)}
                          className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-colors"
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
                          className="p-1.5 bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-900 rounded-lg transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KleanmaxDashboard;

