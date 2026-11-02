import React, { useState, useEffect } from 'react';
import { Quotation, QuotationStatus, User } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Search, PlusCircle, Filter, Eye, Printer, Download,
  CheckCircle2, Send, RotateCcw, AlertTriangle, ChevronRight, X,
  Wrench, ShoppingCart, Layers
} from 'lucide-react';

interface QuotationsListProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
  defaultBrandFilter?: 'all' | 'kleanmaxpro' | 'kleanmax';
}

export const QuotationsList: React.FC<QuotationsListProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
  defaultBrandFilter = 'all',
}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'kleanmaxpro' | 'kleanmax'>(defaultBrandFilter);

  useEffect(() => {
    loadQuotations();
  }, [searchTerm, statusFilter]);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const data = await api.quotations.list({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setQuotations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'submit' | 'approve' | 'issue' | 'cancel') => {
    try {
      if (action === 'submit') await api.quotations.submit(id);
      if (action === 'approve') await api.quotations.approve(id);
      if (action === 'issue') await api.quotations.issue(id);
      if (action === 'cancel') await api.quotations.cancel(id);
      loadQuotations();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} quotation`);
    }
  };

  // Filter by brand division
  const filteredQuotations = quotations.filter((q) => {
    if (brandFilter === 'all') return true;
    if (brandFilter === 'kleanmaxpro') {
      return q.quotation_type === 'area_based' || (q.job_description && q.job_description.includes('Kleanmax Pro'));
    }
    if (brandFilter === 'kleanmax') {
      return (
        q.quotation_type === 'repair_service' ||
        q.quotation_type === 'item_based' ||
        (q.customer_ref && q.customer_ref.startsWith('KM/')) ||
        (q.job_description && (q.job_description.includes('Spares') || q.job_description.includes('Sales')))
      );
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Statuses' },
    { id: 'draft', label: 'Drafts' },
    { id: 'pending_approval', label: 'Pending Approval' },
    { id: 'approved', label: 'Approved' },
    { id: 'issued', label: 'Issued (Active)' },
    { id: 'revised', label: 'Revised' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
            Automated Quotation Repository
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {brandFilter === 'kleanmaxpro'
              ? 'Kleanmax Pro Quotations'
              : brandFilter === 'kleanmax'
              ? 'Kleanmax Quotations (Spares & Sales)'
              : 'Quotations Directory'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            1-click instant PDF download and official records authenticated by Admin.
          </p>
        </div>

        {/* Quick Quote Launchers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('kleanmaxpro_area')}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#FED10C]" />
            <span>+ Pro Area Quote</span>
          </button>

          <button
            onClick={() => onNavigate('kleanmax_spares')}
            className="px-3 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>+ Spares & Service</span>
          </button>

          <button
            onClick={() => onNavigate('kleanmax_sales')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Equipment Sale</span>
          </button>
        </div>
      </div>

      {/* Division Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Brand Division Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Division:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setBrandFilter('all')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all ${
                  brandFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Divisions
              </button>
              <button
                onClick={() => setBrandFilter('kleanmaxpro')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all ${
                  brandFilter === 'kleanmaxpro'
                    ? 'bg-[#FED10C] text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KLEANMAX PRO
              </button>
              <button
                onClick={() => setBrandFilter('kleanmax')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all ${
                  brandFilter === 'kleanmax'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KLEANMAX
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotation #, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                statusFilter === tab.id
                  ? 'bg-slate-200 text-slate-900 font-extrabold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            Loading active quotations...
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold text-sm">No quotations found</p>
            <p className="text-slate-400 text-xs mt-1">
              Create a new quotation using the buttons above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Quotation #</th>
                  <th className="p-3.5">Division</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((q) => {
                  const isPro =
                    q.quotation_type === 'area_based' ||
                    (q.job_description && q.job_description.includes('Kleanmax Pro'));

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {q.quotation_number}
                        {q.revision_number > 0 && (
                          <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                            R{q.revision_number}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {isPro ? (
                          <span className="bg-[#FED10C]/20 text-slate-900 border border-[#FED10C] font-black text-[10px] px-2 py-0.5 rounded">
                            KLEANMAX PRO
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] px-2 py-0.5 rounded">
                            KLEANMAX
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-bold text-slate-800">
                        {q.customer?.company_name || 'Direct Customer'}
                      </td>

                      <td className="p-3.5 text-slate-500 font-medium">
                        {q.quotation_date
                          ? new Date(q.quotation_date).toLocaleDateString('en-IN')
                          : '—'}
                      </td>

                      <td className="p-3.5 text-right font-black text-slate-900">
                        ₹ {Number(q.final_amount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        {q.status === 'draft' && (
                          <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                            Draft
                          </span>
                        )}
                        {q.status === 'pending_approval' && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase animate-pulse">
                            Pending Approval
                          </span>
                        )}
                        {q.status === 'approved' && (
                          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                            Approved
                          </span>
                        )}
                        {q.status === 'issued' && (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                            Issued (Locked)
                          </span>
                        )}
                        {q.status === 'revised' && (
                          <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                            Revised
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1-Click Ready to Download PDF button */}
                          <a
                            href={`/api/quotations/${q.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-[11px] rounded flex items-center gap-1 shadow-2xs"
                            title="Instant Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>

                          {/* Preview PDF Modal */}
                          <button
                            onClick={() => onOpenPreview(q.id)}
                            className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
                            title="Preview Onscreen"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>

                          {/* Status Submit/Approve if Draft */}
                          {q.status === 'draft' && (
                            <button
                              onClick={() => handleAction(q.id, 'submit')}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-extrabold rounded shadow-2xs"
                              title="Submit for Approval"
                            >
                              Submit
                            </button>
                          )}

                          {/* View Full Detail */}
                          <button
                            onClick={() => onNavigate('quotation_detail', { id: q.id })}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded"
                          >
                            View
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

export default QuotationsList;
