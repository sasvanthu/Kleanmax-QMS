import React, { useState, useEffect } from 'react';
import { Quotation, Customer, Service, User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  Sparkles, Calculator, FileText, CheckCircle2, PlusCircle,
  Building2, Users, ArrowUpRight, Eye, ShieldCheck, ArrowRight,
  TrendingUp, Clock, AlertCircle, Layers, Check, Wrench, ChevronRight,
  Edit, Download
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
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Area Estimator state
  const [length, setLength] = useState<number>(100);
  const [breadth, setBreadth] = useState<number>(50);
  const [repetitions, setRepetitions] = useState<number>(1);
  const [selectedRate, setSelectedRate] = useState<number>(4.5);
  const [serviceName, setServiceName] = useState<string>('Warehouse Deep Floor Scrubbing');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qList, sList, comp] = await Promise.all([
        api.quotations.list({ company_code: 'kleanmaxpro' }),
        api.services.list('cleaning'),
        api.company.get('kleanmaxpro'),
      ]);
      setQuotations(qList);
      setServices(sList);
      setCompany(comp);
    } catch (err) {
      console.error('Failed to load Kleanmax Pro data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatedArea = length * breadth * repetitions;
  const estimatedTotal = calculatedArea * selectedRate;
  const totalProQuotations = quotations.length;
  const totalValue = quotations.reduce((acc, q) => acc + Number(q.final_amount || 0), 0);
  const approvedCount = quotations.filter(q => q.status === 'approved' || q.status === 'issued').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#FED10C] text-slate-950 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-xs">
                Company 1 • Division Hub
              </span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                Prefix: {company?.quotation_prefix || 'KMP'}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Entity
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{company?.company_name || 'Klean Max Pro'}</span>
              <span className="text-sm font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                Commercial Floor Scrubbing & Deep Facility Care
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Industrial mechanized scrubbing, ride-on sweeper dry/wet sanitization, high-gloss floor restoration, and multi-bay factory area calculations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('kleanmaxpro_area')}
              className="px-4 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch Area Generator</span>
            </button>
            <button
              onClick={() => onNavigate('settings', { tab: 'kleanmaxpro' })}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Edit Company Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Proposals</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalProQuotations}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">{approvedCount} approved</span>
            <span>• {totalProQuotations - approvedCount} in review</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pipeline Value</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            Commercial Flooring Contracts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Standard Base Rate</span>
            <Calculator className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹4.50 <span className="text-xs font-normal text-slate-500">/ sq.ft</span></div>
          <div className="text-[11px] text-slate-500 mt-1">
            Slab tiers from ₹3.25 to ₹5.50
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">GSTIN & Entity</span>
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-xs font-mono font-black text-slate-800 truncate">
            {company?.gstin || '33AABCK1234F1Z8'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {company?.city || 'Chennai'}, {company?.state || 'Tamil Nadu'}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Quick Estimator + Service Slabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Estimator */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-500" />
                <span>Instant Area-Based Pricing Estimator</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate commercial floor scrubbing pricing for warehouses, factories, and shop floors.
              </p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-1 rounded-lg">
              Live Slabs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Length (ft)
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(Number(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Breadth (ft)
              </label>
              <input
                type="number"
                value={breadth}
                onChange={(e) => setBreadth(Number(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Bays / Repetitions
              </label>
              <input
                type="number"
                value={repetitions}
                onChange={(e) => setRepetitions(Number(e.target.value) || 1)}
                className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Scrubbing Service Type
              </label>
              <select
                value={selectedRate}
                onChange={(e) => {
                  const rate = Number(e.target.value);
                  setSelectedRate(rate);
                  if (rate === 4.5) setServiceName('Warehouse Deep Floor Scrubbing');
                  if (rate === 3.25) setServiceName('Industrial Ride-On Automated Scrubbing');
                  if (rate === 5.5) setServiceName('Heavy-Duty Oil Degreasing & Scrubbing');
                }}
                className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:border-amber-400 focus:outline-hidden bg-white"
              >
                <option value={4.5}>Warehouse Deep Floor Scrubbing (₹4.50 / sq.ft)</option>
                <option value={3.25}>Ride-On Automated Maintenance Scrub (₹3.25 / sq.ft)</option>
                <option value={5.5}>Heavy-Duty Slurry & Oil Degreasing (₹5.50 / sq.ft)</option>
              </select>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-900 uppercase">Calculated Area</div>
                <div className="text-xl font-black text-slate-900">
                  {calculatedArea.toLocaleString()} <span className="text-xs font-normal text-slate-600">sq.ft</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold text-amber-900 uppercase">Estimated Pre-Tax</div>
                <div className="text-xl font-black text-amber-700">
                  ₹{estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Includes single-disc & ride-on scrubber machinery, trained operators & industrial chemicals.
            </span>
            <button
              onClick={() => onNavigate('kleanmaxpro_area', { length, breadth, repetitions, rate: selectedRate, serviceName })}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <span>Build Full Formal Quotation</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FED10C]" />
            </button>
          </div>
        </div>

        {/* Quick Service Catalogue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Kleanmax Pro Slabs</span>
              </h2>
              <button
                onClick={() => onNavigate('services')}
                className="text-xs text-amber-600 font-bold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50/50 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">Standard Warehouse Floor</span>
                  <span className="font-black text-xs text-amber-700">₹4.50 / sq.ft</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Rotary scrubbing, slurry vacuuming & neutralizer</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50/50 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">Ride-On Auto Scrubbing</span>
                  <span className="font-black text-xs text-amber-700">₹3.25 / sq.ft</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">High-speed mechanized cleaning for shop floors</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50/50 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">Roof Truss & High Dusting</span>
                  <span className="font-black text-xs text-amber-700">₹5.50 / sq.ft</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Boom-lift assisted overhead beam & duct clean</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('kleanmaxpro_quotes')}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-amber-200"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>View All Kleanmax Pro Quotes ({totalProQuotations})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Kleanmax Pro Quotations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Recent Kleanmax Pro Quotations</h2>
            <p className="text-xs text-slate-500">Commercial floor scrubbing work orders and area quotes.</p>
          </div>
          <button
            onClick={() => onNavigate('kleanmaxpro_area')}
            className="px-3 py-1.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Area Quote</span>
          </button>
        </div>

        {quotations.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No quotations found for Kleanmax Pro. Click "New Area Quote" above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.slice(0, 6).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {q.quotation_number}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {q.customer?.company_name || 'Standard Client'}
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
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg"
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

export default KleanmaxProDashboard;

