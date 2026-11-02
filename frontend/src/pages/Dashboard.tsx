import React, { useState, useEffect } from 'react';
import { Quotation, Customer, Service, User } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Clock, CheckCircle2, Send, PlusCircle, Users,
  ArrowUpRight, Search, Eye, TrendingUp, Calculator,
  Building2, ShieldCheck, Layers, Check, Sparkles,
  AlertCircle, ChevronRight, Download, Wrench, ShoppingCart,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Area Estimator
  const [calcServiceId, setCalcServiceId] = useState<string>('');
  const [calcLength, setCalcLength] = useState<number>(80);
  const [calcBreadth, setCalcBreadth] = useState<number>(40);
  const [calcUnit, setCalcUnit] = useState<'ft' | 'm'>('ft');
  const [calcRepetitions, setCalcRepetitions] = useState<number>(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qList, cList, sList] = await Promise.all([
        api.quotations.list(),
        api.customers.list(),
        api.services.list(),
      ]);
      setQuotations(qList);
      setCustomers(cList);
      setServices(sList);
      if (sList.length > 0 && !calcServiceId) {
        const areaService = sList.find((s) => s.quotation_type === 'area_based') || sList[0];
        setCalcServiceId(areaService.id);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (id: string, quotationNumber: string) => {
    setApprovingId(id);
    try {
      await api.quotations.approve(id);
      setToastMessage(`Quotation ${quotationNumber} approved successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve quotation');
    } finally {
      setApprovingId(null);
    }
  };

  // Staff Quick Estimator calculation
  const selectedService = services.find((s) => s.id === calcServiceId) || services[0];
  const rawArea = Number(calcLength || 0) * Number(calcBreadth || 0) * Number(calcRepetitions || 1);
  const billableAreaSqFt = calcUnit === 'm' ? rawArea * 10.76391 : rawArea;
  const standardRate = Number(selectedService?.standard_rate || 4.5);
  const estimatedAmount = billableAreaSqFt * standardRate;

  // Pipeline calculations
  const totalCount = quotations.length;
  const pendingQuotations = quotations.filter((q) => q.status === 'pending_approval');
  const issuedQuotations = quotations.filter((q) => q.status === 'issued' || q.status === 'approved');
  const totalPipelineValue = quotations.reduce((sum, q) => sum + Number(q.final_amount || 0), 0);

  // Filter recent quotations
  const recentQuotations = quotations.filter((q) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchNum = q.quotation_number.toLowerCase().includes(query);
      const matchCust = q.customer?.company_name?.toLowerCase().includes(query);
      return matchNum || matchCust;
    }
    return true;
  }).slice(0, 8);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl shadow-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-extrabold text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Unified Executive Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-[#FED10C] text-slate-950 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                Automated Quotation Management
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Admin Workspace Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Kleanmax Pro & Kleanmax Operations Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Automated quotations with fixed letterhead banner, pre-filled rates & specs, live quantity calculation, and 1-click ready-to-download official PDF generation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('settings')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Company & Bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Division Cards: KLEANMAX PRO vs KLEANMAX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DIVISION 1: KLEANMAX PRO */}
        <div className="bg-white rounded-2xl border-2 border-amber-300/80 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-[#FED10C] text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                DIVISION: KLEANMAX PRO
              </span>
              <span className="text-[11px] font-bold text-slate-500">Commercial Services</span>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Commercial Floor Scrubbing & Painting
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Area-based commercial scrubbing, industrial rotary degreasing, epoxy coating & warehouse maintenance. Staff enters dimensions (Length x Breadth); billable sq ft and GST calculate dynamically.
            </p>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
              <button
                onClick={() => onNavigate('kleanmaxpro_area')}
                className="p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-700" />
                    <span>Area Quotation</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Length x Breadth calculation</div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-700 transform group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('kleanmaxpro_quotes')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Pro Quotations</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Saved area records & PDF</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </button>

              <button
                onClick={() => onNavigate('services')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    <span>Services Catalogue</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Sq Ft standard rates</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </button>

              <button
                onClick={() => onNavigate('customers')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    <span>Client Master</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Commercial customer directory</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Automated Top Banner & Scope Fixed</span>
            <button
              onClick={() => onNavigate('kleanmaxpro_area')}
              className="text-xs font-black text-slate-900 bg-[#FED10C] hover:bg-[#E5BC07] px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <span>Create Pro Quote</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* DIVISION 2: KLEANMAX */}
        <div className="bg-white rounded-2xl border-2 border-sky-300/80 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-sky-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                DIVISION: KLEANMAX
              </span>
              <span className="text-[11px] font-bold text-slate-500">Equipment & Service</span>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Cleaning Machines, Spares & Servicing
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Automated quotations matching official WhatsApp documents. Employees enter only the quantity; rates, machine photos, technical specs, terms, and ICICI bank details are pre-fixed and ready to download.
            </p>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
              {/* Spares & Service Quote */}
              <button
                onClick={() => onNavigate('kleanmax_spares')}
                className="p-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-300 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-sky-700" />
                    <span>Spares & Service Quote</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Images 1 & 2 • Clearock / Karcher</div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-700 transform group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Equipment Sales Quote */}
              <button
                onClick={() => onNavigate('kleanmax_sales')}
                className="p-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-300 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-700" />
                    <span>Equipment Sales Quote</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Images 3 & 4 • Auto Scrubber Sale</div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-700 transform group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Kleanmax Quotations */}
              <button
                onClick={() => onNavigate('kleanmax_quotes')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Kleanmax Quotations</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Saved spares & sales records</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </button>

              {/* All Master */}
              <button
                onClick={() => onNavigate('quotations')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>All Quotations Master</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Unified status & approval</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-800">
            <span>Mr. Manikandan Signatory & ICICI Bank Fixed</span>
            <button
              onClick={() => onNavigate('kleanmax_spares')}
              className="text-xs font-black text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <span>Create Kleanmax Quote</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Quotations</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across Both Divisions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Commercial Pipeline</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 truncate">
            ₹ {totalPipelineValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Active Quotes Value</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-900">{pendingQuotations.length}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Awaiting Approval</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Issued & Finalized</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{issuedQuotations.length}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Client Ready</div>
        </div>
      </div>

      {/* Recent Quotations with Direct 1-Click PDF Download */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Recent Quotations & Ready Downloads
            </h2>
            <p className="text-xs text-slate-500">
              Download the official formatted A4 PDF immediately or preview onscreen.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by quote #, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {recentQuotations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No quotations found. Use the division buttons above to create your first quotation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Quotation #</th>
                  <th className="p-3">Division</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Instant Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQuotations.map((q) => {
                  const isPro =
                    q.quotation_type === 'area_based' ||
                    (q.job_description && q.job_description.includes('Kleanmax Pro'));

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {q.quotation_number}
                      </td>
                      <td className="p-3">
                        {isPro ? (
                          <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded">
                            KLEANMAX PRO
                          </span>
                        ) : (
                          <span className="bg-sky-100 text-sky-900 font-extrabold text-[10px] px-2 py-0.5 rounded">
                            KLEANMAX
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {q.customer?.company_name || 'Direct Customer'}
                      </td>
                      <td className="p-3 text-slate-500">
                        {q.quotation_date
                          ? new Date(q.quotation_date).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        ₹ {Number(q.final_amount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1-Click Direct PDF Download */}
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

                          <button
                            onClick={() => onOpenPreview(q.id)}
                            className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                            title="Preview Onscreen"
                          >
                            <Eye className="w-4 h-4" />
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

export default Dashboard;
