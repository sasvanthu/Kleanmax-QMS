import React, { useState, useEffect } from 'react';
import { Service, User } from '../services/types';
import { api } from '../services/api';
import { Layers, Plus, Search, Tag, Sparkles, Edit2, Check, X, ShieldAlert, History } from 'lucide-react';

interface ServicesCatalogueProps {
  currentUser: User | null;
}

export const ServicesCatalogue: React.FC<ServicesCatalogueProps> = ({ currentUser }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTab, setCategoryTab] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form states
  const [serviceCode, setServiceCode] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState<'cleaning' | 'painting' | 'equipment_sales' | 'spare_parts' | 'repair_service' | 'rental' | 'amc'>('cleaning');
  const [quotationType, setQuotationType] = useState<'area_based' | 'item_based' | 'repair_service' | 'rental' | 'contract'>('area_based');
  const [description, setDescription] = useState('');
  const [defaultUom, setDefaultUom] = useState('sq_ft');
  const [hsnSac, setHsnSac] = useState('998533');
  const [standardRate, setStandardRate] = useState<number>(4.50);
  const [taxRate, setTaxRate] = useState<number>(18.00);
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // New rate state
  const [newRateValue, setNewRateValue] = useState<number>(0);
  const [newRateUom, setNewRateUom] = useState('sq_ft');

  useEffect(() => {
    loadServices();
  }, [categoryTab]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.services.list(categoryTab !== 'all' ? categoryTab : undefined);
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isAuthorized = true; // Unified Admin & Staff access

  const categories = [
    { id: 'all', label: 'All Services & Products' },
    { id: 'cleaning', label: 'Area Cleaning' },
    { id: 'painting', label: 'Epoxy & Painting' },
    { id: 'equipment_sales', label: 'Equipment Sales' },
    { id: 'rental', label: 'Equipment Rental' },
    { id: 'repair_service', label: 'Repair & Overhaul' },
  ];

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
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
        internal_notes: internalNotes.trim() || undefined,
        is_active: true,
      });
      setModalOpen(false);
      loadServices();
    } catch (err: any) {
      setError(err.message || 'Failed to create service');
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
            Rate Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Commercial Service Catalogue & Pricing Matrix
          </h1>
        </div>

        {isAuthorized && (
          <button
            onClick={() => {
              setError('');
              setModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        )}
      </div>

      {/* Categories Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryTab(c.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              categoryTab === c.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-400 font-bold">
            Loading catalogue items...
          </div>
        ) : (
          services.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {s.service_code}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {s.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="font-extrabold text-base text-slate-900 leading-snug">
                  {s.service_name}
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {s.description || 'Commercial grade service execution.'}
                </p>

                {s.hsn_sac_code && (
                  <div className="mt-2 text-[10px] text-slate-400 font-mono">
                    SAC/HSN: <strong>{s.hsn_sac_code}</strong> • GST: {s.default_tax_rate}%
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Standard Rate</div>
                  <div className="text-lg font-black text-slate-900">
                    ₹ {Number(s.standard_rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ {s.default_uom}</span>
                  </div>
                </div>

                {isAuthorized && (
                  <button
                    onClick={() => {
                      setSelectedService(s);
                      setNewRateValue(Number(s.standard_rate));
                      setNewRateUom(s.default_uom);
                      setRateModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Edit Rate</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FED10C]" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  Add Service Catalogue Entry
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-6 space-y-4">
              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-semibold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Service Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SVC-WH-POLISH"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value="cleaning">Cleaning</option>
                    <option value="painting">Epoxy & Painting</option>
                    <option value="equipment_sales">Equipment Sales</option>
                    <option value="spare_parts">Spare Parts</option>
                    <option value="rental">Rental Service</option>
                    <option value="repair_service">Repair & Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warehouse Concrete Floor Polishing"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Detailed Scope Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed execution methodology..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit of Measure *
                  </label>
                  <select
                    value={defaultUom}
                    onChange={(e) => setDefaultUom(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value="sq_ft">Square Feet (sq ft)</option>
                    <option value="sq_m">Square Metres (sq m)</option>
                    <option value="nos">Numbers (nos)</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Standard Rate (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={standardRate}
                    onChange={(e) => setStandardRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
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
                  className="px-5 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Creating...' : 'Create Service'}</span>
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
                Update Catalogue Rate
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
