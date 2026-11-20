import React, { useState, useEffect } from 'react';
import { User, CompanySetting, Quotation } from '../services/types';
import { api } from '../services/api';
import {
  FileText,
  Building2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Eye,
  CheckCircle2,
  TrendingUp,
  Clock,
  Download,
  Edit,
  Wrench,
  ChevronRight
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
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [comp, quotes] = await Promise.all([
        api.company.get('kleanmax'),
        api.quotations.list({ company_code: 'kleanmax', limit: 10 })
      ]);
      setCompany(comp);
      setQuotations(quotes || []);
    } catch (err) {
      console.error('Failed to load Kleanmax dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalQuotes = quotations.length;
  const totalValue = quotations.reduce((acc, q) => acc + (Number(q.final_amount) || 0), 0);
  const confirmedCount = quotations.filter(q => q.status === 'approved' || q.status === 'confirmed' || q.status === 'issued').length;
  const draftCount = quotations.filter(q => q.status === 'draft').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Companies</span>
          </button>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {company?.company_name || 'Kleanmax'}
            </h1>
            <span className="bg-emerald-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              Cleaning & Machine Sales
            </span>
            {company?.gstin && (
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                GSTIN: {company.gstin}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('kleanmax_generator')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
          <button
            onClick={() => onNavigate('settings', { tab: 'kleanmax' })}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Proposals</div>
            <div className="text-2xl font-black text-slate-900">{totalQuotes}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pipeline Value</div>
            <div className="text-xl font-black text-slate-900">
              ₹ {totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Confirmed</div>
            <div className="text-2xl font-black text-slate-900">{confirmedCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Drafts</div>
            <div className="text-2xl font-black text-slate-900">{draftCount}</div>
          </div>
        </div>
      </div>

      {/* Core Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Quotation Generator */}
        <div className="group relative bg-white rounded-2xl border-t-4 border-t-emerald-600 border-x border-b border-slate-200 hover:border-emerald-500/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Generate Quotation
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Cleaning Service & Machine Spares
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('kleanmax_generator')}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-emerald-100/70 border border-slate-200/80 text-slate-500 hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                title="Open Kleanmax Generator"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="border-t border-slate-100 my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('kleanmax_generator')}
                className="w-full text-left font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer shadow-xs active:scale-98 group/btn"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-white shrink-0" />
                  <span>Cleaning Proposal</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('kleanmax_sales')}
                className="w-full text-left font-bold text-xs text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 hover:border-emerald-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Sales Quotation</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-700 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Past Records */}
        <div className="group relative bg-white rounded-2xl border-t-4 border-t-emerald-600 border-x border-b border-slate-200 hover:border-emerald-500/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Past Records
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Full Archive, Word (.docx) & PDF Export
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('kleanmax_quotes')}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-emerald-100/70 border border-slate-200/80 text-slate-500 hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
                title="View Past Records"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="border-t border-slate-100 my-4" />

            <button
              onClick={() => onNavigate('kleanmax_quotes')}
              className="w-full text-left font-bold text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer active:scale-98 group/btn"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 shrink-0" />
                <span>View Past Records & Exports</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Quotations Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
              Recent Kleanmax Quotations
            </h3>
          </div>
          <button
            onClick={() => onNavigate('kleanmax_quotes')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {quotations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-bold">
            No quotations found for Kleanmax yet. Click "+ New Quotation" to generate the first one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Quotation No</th>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.slice(0, 6).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-black text-slate-900">
                      {q.quotation_number}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 uppercase">
                      {q.customer?.company_name || 'Client'}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {q.quotation_date}
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-900">
                      ₹ {Number(q.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        q.status === 'approved' || q.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.status === 'issued'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.status === 'approved' ? 'CONFIRMED' : q.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPreview(q.id)}
                          className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                          title="Preview Official Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('quotation_edit', { id: q.id, company_code: 'kleanmax' })}
                          className="p-1.5 hover:bg-slate-200 text-sky-600 rounded-lg cursor-pointer"
                          title="Edit Quotation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => api.quotations.downloadDocx(q.id)}
                          className="p-1.5 hover:bg-slate-200 text-blue-700 rounded-lg cursor-pointer"
                          title="Download Word (.docx)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => api.quotations.downloadPdf(q.id)}
                          className="p-1.5 hover:bg-slate-200 text-sky-600 rounded-lg cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
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
