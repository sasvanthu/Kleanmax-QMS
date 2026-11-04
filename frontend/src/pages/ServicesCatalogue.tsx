import React, { useState, useEffect } from 'react';
import { Service, User } from '../services/types';
import { api } from '../services/api';
import { Layers, Plus, Search, Tag, Sparkles, Edit2, Check, X, Trash2, Building2, Wrench, FileText } from 'lucide-react';

interface ServicesCatalogueProps {
  currentUser: User | null;
}

const COMPANIES = [
  { code: 'all', name: 'All Companies', badge: 'bg-slate-900 text-white' },
  { code: 'kleanmaxpro', name: '⚡ Kleanmax Pro', badge: 'bg-amber-400 text-slate-950' },
  { code: 'kleanmax', name: '🔧 Kleanmax', badge: 'bg-sky-400 text-slate-950' },
  { code: 'uniquepainters', name: '🎨 Unique Painters', badge: 'bg-purple-600 text-white' },
  { code: 'cleantech', name: '🌿 Cleantech Services', badge: 'bg-teal-500 text-slate-950' },
];

export const ServicesCatalogue: React.FC<ServicesCatalogueProps> = ({ currentUser }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyTab, setCompanyTab] = useState<string>('all');
  const [categoryTab, setCategoryTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form states
  const [formCompanyCode, setFormCompanyCode] = useState('kleanmaxpro');
  const [serviceCode, setServiceCode] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState<'rental' | 'equipment_sales' | 'cleaning' | 'painting' | 'spare_parts' | 'repair_service' | 'amc'>('rental');
  const [quotationType, setQuotationType] = useState<'rental' | 'item_based' | 'area_based' | 'repair_service' | 'contract'>('rental');
  const [description, setDescription] = useState('');
  const [defaultUom, setDefaultUom] = useState('NOS');
  const [hsnSac, setHsnSac] = useState('8479');
  const [standardRate, setStandardRate] = useState<number>(32000.00);
  const [taxRate, setTaxRate] = useState<number>(18.00);
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // New rate state
  const [newRateValue, setNewRateValue] = useState<number>(0);
  const [newRateUom, setNewRateUom] = useState('NOS');

  useEffect(() => {
    loadServices();
  }, [companyTab, categoryTab]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.services.list({
        company_code: companyTab !== 'all' ? companyTab : undefined,
        category: categoryTab !== 'all' ? categoryTab : undefined,
        search: searchTerm.trim() || undefined,
      });
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isAuthorized = true; // Unified Admin access

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'rental', label: 'Equipment Rental' },
    { id: 'equipment_sales', label: 'Equipment Sales' },
    { id: 'cleaning', label: 'Cleaning Services' },
    { id: 'painting', label: 'Epoxy & Painting' },
    { id: 'spare_parts', label: 'Spare Parts' },
    { id: 'repair_service', label: 'Repairs & Overhaul' },
    { id: 'amc', label: 'AMC Contracts' },
  ];

  const openCreateModal = () => {
    setEditingService(null);
    setFormCompanyCode(companyTab !== 'all' ? companyTab : 'kleanmaxpro');
    setServiceCode(`KMP-PROD-${Math.floor(100 + Math.random() * 900)}`);
    setServiceName('');
    setCategory('rental');
    setQuotationType('rental');
    setDescription('');
    setDefaultUom('NOS');
    setHsnSac('8479');
    setStandardRate(25000.00);
    setTaxRate(18.00);
    setInternalNotes('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setFormCompanyCode(s.company_code || 'kleanmaxpro');
    setServiceCode(s.service_code);
    setServiceName(s.service_name);
    setCategory(s.category as any);
    setQuotationType(s.quotation_type as any);
    setDescription(s.description || '');
    setDefaultUom(s.default_uom || 'NOS');
    setHsnSac(s.hsn_sac_code || '8479');
    setStandardRate(Number(s.standard_rate || 0));
    setTaxRate(Number(s.default_tax_rate || 18));
    setInternalNotes(s.internal_notes || '');
    setError('');
    setModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingService) {
        await api.services.update(editingService.id, {
          service_name: serviceName.trim(),
          category,
          quotation_type: quotationType,
          description: description.trim() || undefined,
          default_uom: defaultUom,
          hsn_sac_code: hsnSac.trim() || undefined,
          standard_rate: Number(standardRate),
          default_tax_rate: Number(taxRate),
          company_code: formCompanyCode,
          internal_notes: internalNotes.trim() || undefined,
        });
      } else {
        await api.services.create({
          service_code: serviceCode.trim().toUpperCase(),
          service_name: serviceName.trim(),
          category,
          quotation_type: quotationType,
          description: description.trim() || undefined,
          default_uom: defaultUom,
          hsn_sac_code: hsnSac.trim() || undefined,
          standard_rate: Number(standardRate),
          default_tax_rate: Number(taxRate),
          company_code: formCompanyCode,
          internal_notes: internalNotes.trim() || undefined,
          is_active: true,
        });
      }
      setModalOpen(false);
      loadServices();
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await api.services.delete(id);
      loadServices();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service');
    }
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    try {
      await api.services.addRate(selectedService.id, {
        uom: newRateUom,
        rate: Number(newRateValue),
        is_current: true,
      });
      setRateModalOpen(false);
      loadServices();
    } catch (err: any) {
      alert(err.message || 'Failed to update rate');
    }
  };

  // Filtered by local search query if typed
  const displayedServices = services.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.service_name.toLowerCase().includes(q) ||
      s.service_code.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
            Enterprise Product Catalog & Price Matrix
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Commercial Products & Services Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin management of machines, rates, specs, and spare parts across all 4 companies.
          </p>
        </div>

        {isAuthorized && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product / Machine</span>
          </button>
        )}
      </div>

      {/* Multi-Company Tab Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase text-slate-400 mb-1.5">Filter by Subsidiary Company:</div>
            <div className="flex flex-wrap items-center gap-1.5">
              {COMPANIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCompanyTab(c.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    companyTab === c.code
                      ? 'bg-slate-900 text-white shadow-xs ring-2 ring-amber-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, code, specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryTab(c.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                categoryTab === c.id
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-400 font-bold">
            Loading products for {companyTab.toUpperCase()}...
          </div>
        ) : displayedServices.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="text-slate-400 font-bold text-sm">No products found for this selection.</div>
            <button
              onClick={openCreateModal}
              className="mt-3 px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
            >
              + Create First Product for {companyTab}
            </button>
          </div>
        ) : (
          displayedServices.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {s.service_code}
                    </span>
                    <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {s.company_code || 'KLEANMAXPRO'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {s.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="font-black text-base text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                  {s.service_name}
                </div>

                {s.description && (
                  <pre className="text-[11px] text-slate-600 mt-2 whitespace-pre-wrap font-sans bg-slate-50 p-2 rounded-lg border border-slate-100 max-h-36 overflow-y-auto leading-relaxed">
                    {s.description}
                  </pre>
                )}

                {s.hsn_sac_code && (
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    HSN/SAC: <strong>{s.hsn_sac_code}</strong> • GST: {s.default_tax_rate}%
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Standard Rate / Rent</div>
                  <div className="text-lg font-black text-slate-900">
                    ₹ {Number(s.standard_rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ {s.default_uom}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors border border-slate-200"
                    title="Edit Product & Specs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedService(s);
                      setNewRateValue(Number(s.standard_rate));
                      setNewRateUom(s.default_uom);
                      setRateModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200 text-[11px] font-bold"
                    title="Quick Update Rate"
                  >
                    Rate
                  </button>
                  <button
                    onClick={() => handleDeleteService(s.id, s.service_name)}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-slate-200"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm tracking-wide">
                  {editingService ? 'Edit Commercial Product / Machine' : 'Add New Commercial Product / Machine'}
                </h3>
                <p className="text-[11px] text-slate-400">Configured in Unified Admin for employee generator search</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subsidiary Company *
                  </label>
                  <select
                    value={formCompanyCode}
                    onChange={(e) => setFormCompanyCode(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="kleanmaxpro">Klean Max Pro (Rental & Scrubbing)</option>
                    <option value="kleanmax">Kleanmax (Equipment Sales & Spares)</option>
                    <option value="uniquepainters">Unique Painters (Epoxy & Painting)</option>
                    <option value="cleantech">Cleantech Services (Solar & AMC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Product / Service Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceCode}
                    disabled={!!editingService}
                    onChange={(e) => setServiceCode(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 bg-slate-50 uppercase focus:ring-1 focus:ring-amber-500"
                    placeholder="e.g. KMP-RENT-RB800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Product / Machine Name *
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. RIDE ON SCRUBBER MACHINE RB-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                  >
                    <option value="rental">Rental Equipment</option>
                    <option value="equipment_sales">Equipment Sales</option>
                    <option value="cleaning">Area Cleaning</option>
                    <option value="painting">Painting & Coating</option>
                    <option value="spare_parts">Spare Parts</option>
                    <option value="repair_service">Repair & Service</option>
                    <option value="amc">AMC Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Quotation Style</label>
                  <select
                    value={quotationType}
                    onChange={(e) => setQuotationType(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                  >
                    <option value="rental">Rental (Monthly / Daily)</option>
                    <option value="item_based">Line Item / Machine</option>
                    <option value="area_based">Area Calculation (LxB)</option>
                    <option value="repair_service">Spares & Job Card</option>
                    <option value="contract">Annual Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">UOM</label>
                  <input
                    type="text"
                    required
                    value={defaultUom}
                    onChange={(e) => setDefaultUom(e.target.value.toUpperCase())}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5"
                    placeholder="NOS, MONTH, DAY, sq_ft"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Standard Rate / Rent (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={standardRate}
                    onChange={(e) => setStandardRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={hsnSac}
                    onChange={(e) => setHsnSac(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
                    placeholder="8479 or 998533"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Technical Specifications / Description (Shown on Proposal)
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 leading-relaxed"
                  placeholder="BRUSH SCRUBBING WIDTH - 800mm&#10;SUCTION WIDTH - 1100mm&#10;COVERAGE AREA - 4800M.SQ/HR&#10;WORKING SPEED - 6KM/HR&#10;POWER - 24V&#10;TANK CAPACITY - 120LTRS"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingService ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rate Modal */}
      {rateModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wide">
                Quick Update Rate
              </h3>
              <button onClick={() => setRateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRate} className="p-5 space-y-4">
              <div className="text-xs">
                <div className="font-bold text-slate-900">{selectedService.service_name}</div>
                <div className="text-slate-500">Current: ₹{selectedService.standard_rate}/{selectedService.default_uom}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Configured Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg"
                >
                  Save Standard Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesCatalogue;
