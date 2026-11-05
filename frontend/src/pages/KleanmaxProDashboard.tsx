import React, { useState, useEffect } from 'react';
import { User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  Sparkles,
  Calculator,
  FileText,
  Edit,
  Building2,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  Package,
  CheckCircle2,
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
}) => {
  const [company, setCompany] = useState<CompanySetting | null>(null);
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
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const comp = await api.company.get('kleanmaxpro');
      setCompany(comp);
    } catch (err) {
      console.error('Failed to load Kleanmax Pro info:', err);
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
        service_code: prodCode.trim() || `KMP-PROD-${Date.now()}`,
        company_code: 'kleanmaxpro',
        category: category,
        quotation_type: category === 'rental' ? 'rental' : 'item_based',
        standard_rate: Number(rate) || 0,
        default_uom: uom,
        hsn_sac_code: '8479',
        default_tax_rate: 18.0,
        description: description.trim(),
        is_active: true,
      });
      setToast(`Product "${prodName}" added successfully to Klean Max Pro!`);
      setModalOpen(false);
      setProdName('');
      setDescription('');
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl shadow-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast('')} className="text-emerald-700 font-extrabold text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all mb-3"
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
            onClick={() => onNavigate('settings', { tab: 'kleanmaxpro' })}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Company Settings</span>
          </button>
        </div>
      </div>

      {/* Big Navigation Cards for Klean Max Pro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              Quotation Generator
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
              View, Word (.docx) & PDF
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

        {/* Card 3: Quotation Editor */}
        <div
          onClick={() => onNavigate('quotation_edit', { company_code: 'kleanmaxpro' })}
          className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform">
              <Edit className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
              Quotation Editor
            </h2>
            <p className="text-xs font-bold text-amber-700 mt-1 uppercase tracking-wider">
              Custom Rates, Line Items & Terms
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Open the visual proposal editor configured for Klean Max Pro. Add custom line items, change rates, edit terms, and build customized proposals.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-[#FED10C] text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
              <span>Open Quotation Editor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Actions Row: Add Product & Company Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Quick Action: Add Product */}
        <div
          onClick={() => {
            setProdName('');
            setProdCode(`KMP-PROD-${Math.floor(100 + Math.random() * 900)}`);
            setCategory('rental');
            setRate(30000);
            setUom('NOS');
            setDescription('');
            setModalOpen(true);
          }}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                Add Machine / Product
              </h3>
              <p className="text-xs text-slate-500">
                Register a new scrubber machine, rental rate, or cleaning product.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Quick Action: Company Info */}
        <div
          onClick={() => onNavigate('settings', { tab: 'kleanmaxpro' })}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                Company Letterhead & Info
              </h3>
              <p className="text-xs text-slate-500">
                Update letterhead banner, GSTIN ({company?.gstin || '33AABCK1234F1Z8'}), bank details.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </div>
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
                  <h3 className="font-black text-slate-900 text-base">Add Product for Klean Max Pro</h3>
                  <p className="text-xs text-slate-500">Add a new machine or cleaning service to the catalogue</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Product / Machine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ride-On Auto Scrubber KM-900"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Product Code
                  </label>
                  <input
                    type="text"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-amber-400 focus:outline-hidden bg-white"
                  >
                    <option value="rental">Rental Machine</option>
                    <option value="equipment_sales">Equipment Sale</option>
                    <option value="cleaning">Cleaning Service</option>
                    <option value="spare_parts">Spare Parts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Standard Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-amber-700 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit of Measurement (UOM)
                  </label>
                  <input
                    type="text"
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Specifications
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Battery operated, 85L tank capacity, 32 inch scrubbing path..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs"
                >
                  {saving ? 'Saving...' : 'Add to Catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KleanmaxProDashboard;
