import React, { useState, useEffect } from 'react';
import { User, CompanySetting, Quotation } from '../services/types';
import { api } from '../services/api';
import {
  Calculator,
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
  Package,
  PlusCircle,
  X
} from 'lucide-react';

interface KleanmaxProDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const KleanmaxProDashboard: React.FC<KleanmaxProDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCode, setProdCode] = useState('');
  const [category, setCategory] = useState<'rental' | 'equipment_sales' | 'cleaning' | 'spare_parts'>('rental');
  const [rate, setRate] = useState<number>(30000);
  const [uom, setUom] = useState('NOS');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [comp, quotes] = await Promise.all([
        api.company.get('kleanmaxpro'),
        api.quotations.list({ company_code: 'kleanmaxpro', limit: 10 })
      ]);
      setCompany(comp);
      setQuotations(quotes || []);
    } catch (err) {
      console.error('Failed to load Kleanmax Pro dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert('Please enter a product / machine name');
      return;
    }
    setSaving(true);
    try {
      await api.services.create({
        service_name: prodName.trim(),
        service_code: prodCode.trim() || `KMP-${Date.now().toString().slice(-4)}`,
        category: category,
        description: description.trim() || undefined,
        standard_rate: rate,
        uom: uom.trim() || 'NOS',
        company_code: 'kleanmaxpro',
        is_active: true,
      });
      setModalOpen(false);
      setToast(`Product "${prodName}" added successfully to Klean Max Pro catalogue!`);
      setTimeout(() => setToast(''), 5000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const totalQuotes = quotations.length;
  const totalValue = quotations.reduce((acc, q) => acc + (Number(q.final_amount) || 0), 0);
  const confirmedCount = quotations.filter(q => q.status === 'approved' || q.status === 'confirmed' || q.status === 'issued').length;
  const draftCount = quotations.filter(q => q.status === 'draft').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-2xl flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{toast}</span>
          </div>
          <button
            onClick={() => setToast('')}
            className="text-xs font-bold text-emerald-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

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
            <span className="bg-[#FED10C] text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Company 1 • KMP
            </span>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
              Prefix: {company?.quotation_prefix || 'KMP'}
            </span>
            {company?.gstin && (
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                GSTIN: {company.gstin}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2.5">
            <span>{company?.company_name || 'Klean Max Pro'}</span>
            <span className="text-2xl">⚡</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Commercial floor scrubbing, mechanized warehouse cleaning & multi-bay area calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('kleanmaxpro_area')}
            className="px-4 py-2.5 bg-[#FED10C] hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Quotation</span>
          </button>
          <button
            onClick={() => {
              setProdName('');
              setProdCode(`KMP-PROD-${Math.floor(100 + Math.random() * 900)}`);
              setCategory('rental');
              setRate(30000);
              setUom('NOS');
              setDescription('');
              setModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Add Machine</span>
          </button>
          <button
            onClick={() => onNavigate('settings', { tab: 'kleanmaxpro' })}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
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
          onClick={() => onNavigate('kleanmaxpro_area')}
          className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
              Generate Quotation
            </h2>
            <p className="text-xs font-bold text-amber-700 mt-1 uppercase tracking-wider">
              Area-Based Floor Scrubbing
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Generate commercial floor scrubbing proposals based on length, breadth, number of bays, and tiered square-foot pricing with instant preview.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-[#FED10C] text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
              <span>Open Area Generator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 2: Past Records */}
        <div
          onClick={() => onNavigate('kleanmaxpro_quotes')}
          className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
              Past Records
            </h2>
            <p className="text-xs font-bold text-amber-700 mt-1 uppercase tracking-wider">
              Full Archive, Word (.docx) & PDF
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Browse all historical Klean Max Pro quotations. View document previews, export instantly to Microsoft Word or PDF, and track status.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-[#FED10C] text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
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
              Recent Klean Max Pro Quotations
            </h3>
            <p className="text-xs text-slate-500">Live feed of stored proposals in database</p>
          </div>
          <button
            onClick={() => onNavigate('kleanmaxpro_quotes')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {quotations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-bold">
            No quotations found for Klean Max Pro yet. Click "+ New Quotation" to generate the first one!
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
                          onClick={() => onNavigate('quotation_edit', { id: q.id, company_code: 'kleanmaxpro' })}
                          className="p-1.5 hover:bg-slate-200 text-amber-600 rounded-lg cursor-pointer"
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
                          className="p-1.5 hover:bg-slate-200 text-amber-600 rounded-lg cursor-pointer"
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

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Package className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Add Machine for Klean Max Pro</h3>
                  <p className="text-xs text-slate-500">Add a new machine or cleaning service to the catalogue</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Machine / Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. KARCHER B 250 R Bp Ride-on Scrubber"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Code</label>
                  <input
                    type="text"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-bold bg-white"
                  >
                    <option value="rental">Machine Rental</option>
                    <option value="equipment_sales">Equipment Sales</option>
                    <option value="cleaning">Area Cleaning Service</option>
                    <option value="spare_parts">Spare Parts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    value={uom}
                    onChange={(e) => setUom(e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded-xl p-2.5 uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Specifications</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Battery operated ride-on floor scrubber dryer with dual disc brushes..."
                  className="w-full border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-slate-900 hover:bg-[#FED10C] hover:text-slate-950 text-white font-black rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add to Catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
