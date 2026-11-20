import React, { useState, useEffect } from 'react';
import { Quotation, QuotationStatus, User } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Search, PlusCircle, Filter, Eye, Printer, Download,
  CheckCircle2, Send, RotateCcw, AlertTriangle, ChevronRight, X,
  Wrench, ShoppingCart, Layers, Edit, Trash2, ShieldAlert,
  Check, Lock, ShieldCheck, CheckSquare, Square
} from 'lucide-react';

interface QuotationsListProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
  defaultBrandFilter?: 'all' | 'kleanmaxpro' | 'kleanmax' | 'uniquepainters' | 'cleantech';
}

export const getQuotationCompany = (q: Quotation): 'kleanmaxpro' | 'kleanmax' | 'uniquepainters' | 'cleantech' => {
  const code = (q.company_code || '').toLowerCase().trim();
  if (code === 'cleantech' || code === 'cts') return 'cleantech';
  if (code === 'uniquepainters' || code === 'unp') return 'uniquepainters';
  if (code === 'kleanmax' || code === 'klm') return 'kleanmax';
  if (code === 'kleanmaxpro' || code === 'kmp') return 'kleanmaxpro';

  // Fallback to quotation number prefix
  const num = (q.quotation_number || '').toUpperCase().trim();
  if (num.startsWith('CTS')) return 'cleantech';
  if (num.startsWith('UNP')) return 'uniquepainters';
  if (num.startsWith('KLM') || num.startsWith('KM/')) return 'kleanmax';
  if (num.startsWith('KMP')) return 'kleanmaxpro';

  return 'kleanmaxpro';
};

export const QuotationsList: React.FC<QuotationsListProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
  defaultBrandFilter = 'all',
}) => {
  // Instant load from session cache (0ms)
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const cached = sessionStorage.getItem('kmp_cached_quotations');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('kmp_cached_quotations');
    } catch {
      return true;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'kleanmaxpro' | 'kleanmax' | 'uniquepainters' | 'cleantech'>(defaultBrandFilter);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || !currentUser?.company_code || currentUser?.company_code === 'all';

  useEffect(() => {
    setBrandFilter(defaultBrandFilter);
  }, [defaultBrandFilter]);

  // Load fresh quotations from API on mount
  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async (silent = false) => {
    if (!silent && quotations.length === 0) setLoading(true);
    try {
      const data = await api.quotations.list();
      setQuotations(data);
      try {
        sessionStorage.setItem('kmp_cached_quotations', JSON.stringify(data));
      } catch (e) {
        console.warn('Cache write failed:', e);
      }
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, quotationNumber?: string) => {
    setActionLoadingId(id);
    try {
      await api.quotations.approve(id);
      setToastMsg({ type: 'success', message: `Quotation ${quotationNumber || id} approved successfully!` });
      setTimeout(() => setToastMsg(null), 4000);
      loadQuotations(true);
    } catch (err: any) {
      alert(err.message || 'Failed to approve quotation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, quotationNumber: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete quotation ${quotationNumber}? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await api.quotations.delete(id);
      const updated = quotations.filter(q => q.id !== id);
      setQuotations(updated);
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      try {
        sessionStorage.setItem('kmp_cached_quotations', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      setToastMsg({ type: 'success', message: `Quotation ${quotationNumber} deleted successfully!` });
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete quotation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Approve all ${selectedIds.length} selected quotations?`)) return;
    setActionLoadingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.quotations.approve(id).catch(e => console.warn(e))));
      setToastMsg({ type: 'success', message: `${selectedIds.length} quotation(s) approved successfully!` });
      setTimeout(() => setToastMsg(null), 4000);
      setSelectedIds([]);
      loadQuotations(true);
    } catch (err: any) {
      alert(err.message || 'Failed to approve selected quotations');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected quotations? This cannot be undone.`)) return;
    setActionLoadingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.quotations.delete(id).catch(e => console.warn(e))));
      const updated = quotations.filter(q => !selectedIds.includes(q.id));
      setQuotations(updated);
      try {
        sessionStorage.setItem('kmp_cached_quotations', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      setToastMsg({ type: 'success', message: `${selectedIds.length} quotation(s) deleted successfully!` });
      setTimeout(() => setToastMsg(null), 4000);
      setSelectedIds([]);
    } catch (err: any) {
      alert(err.message || 'Failed to delete selected quotations');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Instant in-memory search and multi-criteria filter (0ms delay)
  const filteredQuotations = quotations.filter((q) => {
    // 1. Status Filter
    if (statusFilter !== 'all' && q.status !== statusFilter) {
      return false;
    }

    // 2. Search Query Filter (Quotation #, Company Name, Job, Customer Ref, Notes)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const qNum = (q.quotation_number || '').toLowerCase();
      const cust = (q.customer?.company_name || '').toLowerCase();
      const job = (q.job_description || '').toLowerCase();
      const ref = (q.customer_ref || '').toLowerCase();
      const notes = (q.notes || '').toLowerCase();
      if (
        !qNum.includes(term) &&
        !cust.includes(term) &&
        !job.includes(term) &&
        !ref.includes(term) &&
        !notes.includes(term)
      ) {
        return false;
      }
    }

    // 3. Brand division filter (Strict 1-to-1 matching)
    if (brandFilter !== 'all') {
      const comp = getQuotationCompany(q);
      if (comp !== brandFilter) {
        return false;
      }
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
            Employees can view, edit, and download official records. Deletion is strictly reserved for Super Admin.
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
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KLEANMAX
              </button>
              <button
                onClick={() => setBrandFilter('uniquepainters')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all ${
                  brandFilter === 'uniquepainters'
                    ? 'bg-[#1A5393] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                UNIQUE PAINTERS
              </button>
              <button
                onClick={() => setBrandFilter('cleantech')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all ${
                  brandFilter === 'cleantech'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CLEANTECH
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

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in ${
          toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg.message}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">×</button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl border border-slate-700 animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span><strong className="text-amber-400 text-sm">{selectedIds.length}</strong> quotation(s) selected:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={actionLoadingId === 'bulk'}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionLoadingId === 'bulk' ? 'Processing...' : `Approve Selected (${selectedIds.length})`}</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={actionLoadingId === 'bulk'}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{actionLoadingId === 'bulk' ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

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
                  <th className="p-3.5 text-center w-10">
                    <input
                      type="checkbox"
                      checked={filteredQuotations.length > 0 && selectedIds.length === filteredQuotations.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredQuotations.map(q => q.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                      title="Select All Quotations"
                    />
                  </th>
                  <th className="p-3.5">Quotation #</th>
                  <th className="p-3.5">Division</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions & Document Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((q) => {
                  const isPro =
                    q.quotation_type === 'area_based' ||
                    (q.job_description && q.job_description.includes('Kleanmax Pro'));

                  return (
                    <tr key={q.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.includes(q.id) ? 'bg-amber-50/50' : ''}`}>
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(q.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, q.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== q.id));
                            }
                          }}
                          className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 font-sans font-bold text-slate-900">
                        {q.quotation_number}
                        {q.revision_number > 0 && (
                          <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                            R{q.revision_number}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {(() => {
                          const comp = getQuotationCompany(q);
                          if (comp === 'cleantech') {
                            return (
                              <span className="bg-slate-100 text-slate-900 border border-slate-300 font-extrabold text-[10px] px-2 py-0.5 rounded">
                                CLEANTECH
                              </span>
                            );
                          }
                          if (comp === 'uniquepainters') {
                            return (
                              <span className="bg-blue-50 text-[#1A5393] border border-blue-200 font-extrabold text-[10px] px-2 py-0.5 rounded">
                                UNIQUE PAINTERS
                              </span>
                            );
                          }
                          if (comp === 'kleanmax') {
                            return (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded">
                                KLEANMAX
                              </span>
                            );
                          }
                          return (
                            <span className="bg-amber-100 text-amber-950 border border-amber-300 font-black text-[10px] px-2 py-0.5 rounded">
                              KLEANMAX PRO
                            </span>
                          );
                        })()}
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
                          {/* Approve Button */}
                          {q.status !== 'approved' && q.status !== 'issued' ? (
                            <button
                              onClick={() => handleApprove(q.id, q.quotation_number)}
                              disabled={actionLoadingId === q.id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              title="Approve quotation"
                            >
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              <span>{actionLoadingId === q.id ? 'Approving...' : 'Approve'}</span>
                            </button>
                          ) : (
                            <span
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] rounded-md flex items-center gap-1"
                              title="Quotation Approved"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Approved</span>
                            </span>
                          )}

                          {/* Delete Quotation Button */}
                          <button
                            onClick={() => handleDelete(q.id, q.quotation_number)}
                            disabled={actionLoadingId === q.id}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 hover:border-rose-600 font-black text-[10px] rounded-lg flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                            title={`Permanently delete quotation ${q.quotation_number}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{actionLoadingId === q.id ? 'Deleting...' : 'Delete'}</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => onNavigate('quotation_edit', { id: q.id, company_code: q.company_code || (q.company as any)?.company_code })}
                            className="p-1 hover:bg-slate-200 text-slate-600 hover:text-blue-600 rounded transition-colors"
                            title="Edit Quotation"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Word (.docx) Download */}
                          <button
                            onClick={() => api.quotations.downloadDocx(q.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded flex items-center gap-1 shadow-2xs transition-colors"
                            title="Download Word (.docx)"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Word</span>
                          </button>

                          {/* PDF Download */}
                          <button
                            onClick={() => api.quotations.downloadPdf(q.id)}
                            className="px-2 py-1 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-[10px] rounded flex items-center gap-1 shadow-2xs transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </button>

                          {/* Preview PDF Modal */}
                          <button
                            onClick={() => onOpenPreview(q.id)}
                            className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
                            title="Preview Onscreen"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>

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
