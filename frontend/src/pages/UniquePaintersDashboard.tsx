import React, { useState, useEffect } from 'react';
import { Quotation, Service, User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  Paintbrush, Layers, FileText, CheckCircle2, PlusCircle,
  Building2, ArrowRight, Eye, ShieldCheck, TrendingUp, Palette,
  Sparkles, Check, Droplets, HardHat, Hammer, Edit, Download
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
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Painting Calculator State
  const [wallArea, setWallArea] = useState<number>(2500);
  const [selectedServiceRate, setSelectedServiceRate] = useState<number>(28.50);
  const [selectedServiceName, setSelectedServiceName] = useState<string>('Premium Interior Royale (2 Coats + Primer)');
  const [includePrimer, setIncludePrimer] = useState<boolean>(true);
  const [coats, setCoats] = useState<number>(2);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qList, comp] = await Promise.all([
        api.quotations.list({ company_code: 'uniquepainters' }),
        api.company.get('uniquepainters'),
      ]);
      setQuotations(qList);
      setCompany(comp);
    } catch (err) {
      console.error('Failed to load Unique Painters data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalQuotes = quotations.length;
  const totalValue = quotations.reduce((acc, q) => acc + Number(q.final_amount || 0), 0);
  const primerAddition = includePrimer ? 3.5 : 0;
  const effectiveRate = selectedServiceRate + primerAddition;
  const estimatedCost = wallArea * effectiveRate;

  const handleLaunchQuote = () => {
    onNavigate('create_quotation', {
      company_code: 'uniquepainters',
      quotation_type: 'area_based',
      job_description: `${selectedServiceName} for ${wallArea.toLocaleString()} sq.ft area with ${coats} coats of paint and ${includePrimer ? 'surface primer' : 'direct application'}.`,
      notes: 'Colors to be confirmed by client. Surface putty preparation and sanding included.',
      initialSection: {
        section_name: 'Main Wall & Ceiling Painting Scope',
        length: wallArea,
        breadth: 1,
        billable_area: wallArea,
        applied_rate: effectiveRate,
        line_total: estimatedCost,
        service_name: selectedServiceName,
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-purple-500/30 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-xs">
                Company 3 • Surface Coating Hub
              </span>
              <span className="bg-purple-400/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                Prefix: {company?.quotation_prefix || 'UNP'}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Entity
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{company?.company_name || 'Unique Painters'}</span>
              <span className="text-sm font-semibold text-purple-300 bg-purple-400/10 px-3 py-1 rounded-lg border border-purple-400/20">
                Commercial & Residential Painting, Epoxy Flooring & Waterproofing
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Interior luxury emulsions, exterior weather-guard coatings, industrial epoxy floors, terrace waterproofing, and designer texture stenciling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchQuote}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Paintbrush className="w-4 h-4" />
              <span>Create Painting Quote</span>
            </button>
            <button
              onClick={() => onNavigate('settings', { tab: 'uniquepainters' })}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Edit Company Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Quotations</span>
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalQuotes}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Commercial & Residential Painting
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Project Value</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            Coating & Epoxy Contracts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Paint Brands</span>
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-lg font-black text-slate-900">Asian Paints / Berger</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Royale, Apex Ultima, Fosroc Epoxy
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">GSTIN & Entity</span>
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-xs font-mono font-black text-slate-800 truncate">
            {company?.gstin || '33AABUP9876G1ZK'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {company?.legal_name || 'Unique Painters & Surface Coatings Pvt Ltd'}
          </div>
        </div>
      </div>

      {/* Interactive Painting & Epoxy Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-purple-500" />
                <span>Painting & Surface Coating Estimator</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate residential, commercial, or epoxy flooring projects with coats and primer options.
              </p>
            </div>
            <span className="text-xs bg-purple-50 text-purple-800 border border-purple-200 font-bold px-2.5 py-1 rounded-lg">
              Square Footage Sizing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Total Wall / Floor Area (Sq.Ft)
              </label>
              <input
                type="number"
                value={wallArea}
                onChange={(e) => setWallArea(Number(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:border-purple-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Number of Finish Coats
              </label>
              <select
                value={coats}
                onChange={(e) => setCoats(Number(e.target.value))}
                className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:border-purple-400 focus:outline-hidden bg-white"
              >
                <option value={1}>1 Coat (Touchup / Refresh)</option>
                <option value={2}>2 Coats (Standard Professional Finish)</option>
                <option value={3}>3 Coats (High-Durability / Deep Shade)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Alkali-Resistant Primer
              </label>
              <div className="flex items-center h-10 px-3 border border-slate-300 rounded-lg">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePrimer}
                    onChange={(e) => setIncludePrimer(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span>Include Primer Coat (+₹3.50/sq.ft)</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Paint System / Coating Specification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { name: 'Premium Interior Royale (2 Coats)', rate: 28.50, desc: 'Luxury emulsion with high sheen & anti-fungal' },
                { name: 'Exterior Apex Weatherproof Acrylic', rate: 34.00, desc: 'Heavy duty rain & UV protection, 5-yr warranty' },
                { name: 'Industrial 1000-Micron Epoxy Flooring', rate: 65.00, desc: 'Diamond grinding, self-leveling aliphatic coat' },
                { name: 'Terrace Elastomeric Waterproofing', rate: 48.00, desc: 'Fiber-mesh reinforced leak-proof barrier' },
              ].map((item) => (
                <div
                  key={item.name}
                  onClick={() => {
                    setSelectedServiceRate(item.rate);
                    setSelectedServiceName(item.name);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedServiceRate === item.rate
                      ? 'border-purple-500 bg-purple-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-xs text-slate-900">{item.name}</span>
                    <span className="text-xs font-black text-purple-700">₹{item.rate}/sq.ft</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-purple-900 uppercase">Total Billable Area</div>
              <div className="text-xl font-black text-slate-900">
                {wallArea.toLocaleString()} <span className="text-xs font-normal text-slate-600">sq.ft</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-purple-900 uppercase">Effective Rate</div>
              <div className="text-xl font-black text-purple-700">
                ₹{effectiveRate.toFixed(2)} <span className="text-xs font-normal text-slate-600">/ sq.ft</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold text-purple-900 uppercase">Estimated Quote (Pre-Tax)</div>
              <div className="text-2xl font-black text-purple-900">
                ₹{estimatedCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Includes surface preparation, minor plaster cracks filling, masking and cleanup.
            </span>
            <button
              onClick={handleLaunchQuote}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all"
            >
              <span>Build Full Official Quotation</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-200" />
            </button>
          </div>
        </div>

        {/* Surface Specifications & Warranty */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-purple-500" />
                <span>Unique Painters Warranty</span>
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>5-Year Exterior Weather Shield</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Protection against fading, algae growth, and peeling for exterior facades.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>24-Month Epoxy Adhesion Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Chemical-resistant industrial floor warranty against tyre wear and delamination.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span>100% Water Leakage Proofing</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Puddle-proof elastomeric acrylic coating for terraces and water tanks.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('quotations')}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-purple-200"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>View All Painting Quotes ({totalQuotes})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Unique Painters Quotations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Recent Unique Painters Quotations</h2>
            <p className="text-xs text-slate-500">Commercial painting proposals and epoxy floor work orders.</p>
          </div>
          <button
            onClick={handleLaunchQuote}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Painting Quote</span>
          </button>
        </div>

        {quotations.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No quotations found for Unique Painters.
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
                      {q.customer?.company_name || 'Commercial Client'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{q.quotation_date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        q.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        q.status === 'issued' ? 'bg-sky-100 text-sky-800' :
                        'bg-purple-100 text-purple-800'
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
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
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
                          className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 rounded-lg transition-colors"
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

export default UniquePaintersDashboard;

