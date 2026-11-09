import React, { useState, useEffect } from 'react';
import { User, CompanySetting, Quotation } from '../services/types';
import { api } from '../services/api';
import {
  Paintbrush,
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
  Edit
} from 'lucide-react';

interface UniquePaintersDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const UniquePaintersDashboard: React.FC<UniquePaintersDashboardProps> = ({
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
        api.company.get('uniquepainters'),
        api.quotations.list({ company_code: 'uniquepainters', limit: 10 })
      ]);
      setCompany(comp);
      setQuotations(quotes || []);
    } catch (err) {
      console.error('Failed to load Unique Painters dashboard data:', err);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Companies</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Company 3 • UNP
            </span>
            <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2.5 py-1 rounded-full">
              Prefix: {company?.quotation_prefix || 'UNP'}
            </span>
            {company?.phone1 && (
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Contact: {company.phone1}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2.5">
            <span>{company?.company_name || 'Unique Painters'}</span>
            <span className="text-2xl">🎨</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Industrial epoxy floor coatings, multi-coat interior/exterior painting & architectural robotic spray finishes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('uniquepainters_generator')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Quotation</span>
          </button>
          <button
            onClick={() => onNavigate('settings', { tab: 'uniquepainters' })}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
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

      {/* Core Action Hub (2 Big Executive Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Quotation Generator */}
        <div
          onClick={() => onNavigate('uniquepainters_generator')}
          className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition-transform">
              <Paintbrush className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
              Generate Quotation
            </h2>
            <p className="text-xs font-bold text-purple-700 mt-1 uppercase tracking-wider">
              Painting & Epoxy Flooring
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Create detailed interior/exterior painting proposals, wall putty applications, and industrial floor epoxy estimates with authentic letterhead and multi-page preview.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-purple-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
              <span>Open Painting Generator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 2: Past Records */}
        <div
          onClick={() => onNavigate('uniquepainters_quotes')}
          className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
              Past Records
            </h2>
            <p className="text-xs font-bold text-purple-700 mt-1 uppercase tracking-wider">
              Full Archive, Word (.docx) & PDF
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Access the historical registry of Unique Painters surface coating quotations. Preview proposals, track client confirmations, and export instantly.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-purple-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
              <span>View Past Records</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Quotations Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
              Recent Unique Painters Quotations
            </h3>
            <p className="text-xs text-slate-500">Live feed of stored proposals in database</p>
          </div>
          <button
            onClick={() => onNavigate('uniquepainters_quotes')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {quotations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-bold">
            No quotations found for Unique Painters yet. Click "+ New Quotation" to generate the first one!
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
                          onClick={() => onNavigate('quotation_edit', { id: q.id, company_code: 'uniquepainters' })}
                          className="p-1.5 hover:bg-slate-200 text-purple-600 rounded-lg cursor-pointer"
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
                          className="p-1.5 hover:bg-slate-200 text-purple-600 rounded-lg cursor-pointer"
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
