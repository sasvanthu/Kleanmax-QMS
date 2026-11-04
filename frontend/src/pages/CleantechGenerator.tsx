import React, { useState } from 'react';
import { User } from '../services/types';
import { api } from '../services/api';
import {
  Sun, Shield, Download, Printer, Save, CheckCircle2,
  Calendar, Layers, ShieldCheck, Sparkles, Plus, Trash2,
  FileText, ArrowLeft, Droplets, RotateCw, Check
} from 'lucide-react';

interface CleantechScopeItem {
  id: string;
  name: string;
  category: 'solar' | 'facade' | 'duct' | 'amc';
  capacityOrQty: number;
  unit: string;
  cycleFrequency: string; // 'Monthly', 'Bi-Monthly', 'Quarterly', 'Annual'
  ratePerCycle: number;
  totalAnnualCycles: number;
  notes?: string;
}

const DEFAULT_CLEANTECH_SERVICES = [
  { name: 'Rooftop Solar Array Mechanized Robotic Cleaning', defaultRate: 8500, unit: 'MW Array', category: 'solar' as const },
  { name: 'Ground-Mounted Solar Farm Panel Washing & Yield Optimization', defaultRate: 14000, unit: 'MW Farm', category: 'solar' as const },
  { name: 'High-Rise Architectural Glass Facade Cradle Washing', defaultRate: 18500, unit: 'Facade Block', category: 'facade' as const },
  { name: 'Commercial Kitchen Industrial Exhaust Duct & Hood Degreasing', defaultRate: 12000, unit: 'Kitchen Duct Set', category: 'duct' as const },
  { name: 'Comprehensive Facility Mechanical Sanitization & Washing AMC', defaultRate: 22000, unit: 'Campus Block', category: 'amc' as const },
];

interface CleantechGeneratorProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const CleantechGenerator: React.FC<CleantechGeneratorProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // Meta
  const [quotationNo, setQuotationNo] = useState<string>(`CTS/2026-27/${Math.floor(1000 + Math.random() * 9000)}`);
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState<string>('CHENNAI TECH PARK SOLAR INITIATIVE');
  const [customerLocation, setCustomerLocation] = useState<string>('Mount Poonamallee Road, Porur, Chennai');

  // Contract Items
  const [items, setItems] = useState<CleantechScopeItem[]>([
    {
      id: '1',
      name: '1.2 MW Rooftop Solar Array Mechanized De-Ionized Washing',
      category: 'solar',
      capacityOrQty: 1.2,
      unit: 'MW',
      cycleFrequency: 'Monthly (12 Cycles/Year)',
      ratePerCycle: 10500,
      totalAnnualCycles: 12,
      notes: 'De-ionized pure water wash, zero-abrasion soft rotating brushes, safety harness lines'
    },
    {
      id: '2',
      name: 'Glass Facade High-Level BMU Cradle Washing & Sealing',
      category: 'facade',
      capacityOrQty: 2,
      unit: 'Blocks',
      cycleFrequency: 'Quarterly (4 Cycles/Year)',
      ratePerCycle: 18500,
      totalAnnualCycles: 4,
      notes: 'Certified rope access crew, spider cradle rigging, spot-free streakless glass clean'
    }
  ]);

  const [taxPercent, setTaxPercent] = useState<number>(18);
  const [saving, setSaving] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Calculations
  const calculateItemTotal = (item: CleantechScopeItem) => {
    return item.ratePerCycle * item.totalAnnualCycles;
  };

  const subtotal = items.reduce((acc, it) => acc + calculateItemTotal(it), 0);
  const gstAmount = (subtotal * taxPercent) / 100;
  const finalTotal = subtotal + gstAmount;

  const handleAddItem = () => {
    const defaultSvc = DEFAULT_CLEANTECH_SERVICES[0];
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Service Scope ${prev.length + 1}`,
        category: defaultSvc.category,
        capacityOrQty: 1,
        unit: 'Array',
        cycleFrequency: 'Monthly (12 Cycles/Year)',
        ratePerCycle: defaultSvc.defaultRate,
        totalAnnualCycles: 12,
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('A quotation must contain at least one service specification.');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof CleantechScopeItem, val: any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const handleSaveToDatabase = async (): Promise<string | null> => {
    setSaving(true);
    try {
      // 1. Ensure customer exists
      const existingCustomers = await api.customers.list(customerName);
      let customer = existingCustomers.find(
        (c) => c.company_name.toLowerCase().trim() === customerName.toLowerCase().trim()
      );
      if (!customer) {
        customer = await api.customers.create({
          company_name: customerName,
          billing_city: 'Chennai',
          billing_address_line1: customerLocation,
          billing_state: 'Tamil Nadu',
          billing_state_code: '33',
          billing_pincode: '600116',
          phone: '+91 73388 82036',
        });
      }

      // 2. Prepare items payload
      const quotationItems = items.map((it, idx) => ({
        item_order: idx + 1,
        item_name: it.name,
        description: `${it.capacityOrQty} ${it.unit} • ${it.cycleFrequency} • Rate: ₹${it.ratePerCycle}/cycle • ${it.notes || ''}`,
        quantity: it.totalAnnualCycles,
        uom: 'cycle',
        unit_price: it.ratePerCycle,
        applied_rate: it.ratePerCycle,
        line_total: calculateItemTotal(it),
        taxable_value: calculateItemTotal(it),
        quotation_type: 'contract',
      }));

      // 3. Create quotation
      const payload = {
        company_code: 'cleantech',
        customer_id: customer.id,
        quotation_type: 'contract',
        quotation_date: quotationDate,
        customer_ref: quotationNo,
        job_description: `Cleantech Periodic Solar Array Cleaning & Facility AMC Services at ${customerLocation}`,
        items: quotationItems,
        sections: [],
        tax_rate: taxPercent,
        discount_type: 'none',
        discount_value: 0,
        freight_charges: 0,
        packing_charges: 0,
        other_charges: 0,
      };

      const created = await api.quotations.create(payload);
      setSavedQuoteId(created.id);
      setToastMsg(`Cleantech Services Quotation ${created.quotation_number} saved! Ready to download.`);
      setTimeout(() => setToastMsg(null), 5000);
      return created.id;
    } catch (err: any) {
      alert(err.message || 'Failed to save Cleantech quotation');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    let qId = savedQuoteId;
    if (!qId) {
      qId = await handleSaveToDatabase();
    }
    if (qId) {
      api.quotations.downloadPdf(qId);
    }
  };

  const handleDownloadDocx = async () => {
    let qId = savedQuoteId;
    if (!qId) {
      qId = await handleSaveToDatabase();
    }
    if (qId) {
      api.quotations.downloadDocx(qId);
    }
  };

  const handlePrint = async () => {
    let qId = savedQuoteId;
    if (!qId) {
      qId = await handleSaveToDatabase();
    }
    if (qId) {
      const printWindow = window.open(api.quotations.getHtmlUrl(qId), '_blank');
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 3-Page Employee Context Banner */}
      <div className="bg-teal-900/10 border border-teal-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
          <span className="text-xs font-black uppercase text-teal-950">
            Cleantech Services Employee Hub
          </span>
          <span className="text-xs text-teal-700 font-bold">• Page 1: Quotation Generator</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('cleantech_quotes')}
            className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-900 border border-teal-300 rounded-lg text-xs font-bold transition-colors"
          >
            Go to Past Quotations →
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Admin Dashboard
          </button>
        </div>
      </div>

      {/* Top Banner & 1-Click Action Bar */}
      <div className="bg-gradient-to-r from-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-teal-900 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-teal-600 text-white px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
              Cleantech Services Division
            </span>
            <span className="text-xs text-teal-200 font-bold">
              Automated Solar & Facility AMC Generator
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Solar Panel Cleaning & Periodic AMC Estimator
          </h1>
          <p className="text-xs text-teal-200/80 mt-1">
            Authentic Cleantech letterhead banner, IDFC Bank coordinates, Mr. Manikandan Balamurugan signatory and safety specs.
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadDocx}
            disabled={saving}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            title="Download Word (.docx)"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? 'Saving...' : 'Save Record'}</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print A4</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => onNavigate('cleantech_quotes')}
            className="underline hover:text-emerald-950 ml-4 font-black"
          >
            View in Past Quotations →
          </button>
        </div>
      )}

      {/* Live Preview Paper Container */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden">
        {/* Authentic Header Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-center">
          <img
            src="/headers/header_cleantech.png"
            alt="Cleantech Services Header"
            className="w-full max-h-28 object-contain mx-auto"
            onError={(e) => {
              (e.target as any).style.display = 'none';
            }}
          />
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide underline">
              SOLAR PANEL CLEANING & FACILITY AMC PROPOSAL
            </h2>
          </div>

          {/* Meta Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                To / Customer Details:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs font-extrabold bg-white border border-slate-300 rounded-lg p-2 mb-1.5 uppercase text-slate-900"
                placeholder="CLIENT / COMPANY NAME"
              />
              <input
                type="text"
                value={customerLocation}
                onChange={(e) => setCustomerLocation(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 text-slate-600"
                placeholder="Site location / city"
              />
            </div>

            <div className="text-right">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Quotation Ref & Date:
              </label>
              <input
                type="text"
                value={quotationNo}
                onChange={(e) => setQuotationNo(e.target.value)}
                className="w-full md:w-64 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 mb-1.5 text-right"
              />
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full md:w-64 text-xs bg-white border border-slate-300 rounded-lg p-1.5 text-right"
              />
            </div>
          </div>

          {/* Fixed About Us for Cleantech Services */}
          <div className="bg-teal-50/50 border-l-4 border-teal-600 p-3 rounded text-xs text-slate-700 leading-relaxed">
            <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">About Cleantech Services</div>
            Cleantech Services is an ISO-certified environmental and facility upkeep specialist focusing on utility-scale solar arrays, rooftop commercial solar plants, high-rise architectural glass facade cleaning, and kitchen grease duct sanitization. We utilize specialized solar robots and demineralized pressurized washing systems that eliminate panel micro-cracks and restore power generation yield up to 99.2%.
          </div>

          {/* AMC Items & Specifications Table */}
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-black text-slate-900 uppercase">
                Contract Services & Periodic Maintenance Schedule:
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contract Scope</span>
              </button>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-900 text-white uppercase text-[10px] font-black">
                <tr>
                  <th className="p-2.5 border border-slate-800 text-center w-10">SL</th>
                  <th className="p-2.5 border border-slate-800">Scope & Maintenance Description</th>
                  <th className="p-2.5 border border-slate-800 text-center w-28">Frequency</th>
                  <th className="p-2.5 border border-slate-800 text-center w-20">Cycles</th>
                  <th className="p-2.5 border border-slate-800 text-right w-28">Rate / Cycle</th>
                  <th className="p-2.5 border border-slate-800 text-right w-32">Annual Total (₹)</th>
                  <th className="p-2.5 border border-slate-800 text-center w-10">Act</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const lineTot = calculateItemTotal(it);
                  return (
                    <tr key={it.id} className="hover:bg-slate-50 border-b border-slate-200">
                      <td className="p-2 border border-slate-200 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="p-2 border border-slate-200">
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) => handleUpdateItem(it.id, 'name', e.target.value)}
                          className="w-full font-bold text-slate-900 border border-slate-300 rounded p-1 mb-1 text-xs"
                        />
                        <input
                          type="text"
                          value={it.notes || ''}
                          onChange={(e) => handleUpdateItem(it.id, 'notes', e.target.value)}
                          placeholder="Technical specifications, water pressure, safety harnesses..."
                          className="w-full text-[11px] text-slate-500 border border-slate-200 rounded p-1"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 text-center">
                        <select
                          value={it.cycleFrequency}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cycles = val.includes('Monthly') ? 12 : val.includes('Bi-Monthly') ? 6 : val.includes('Quarterly') ? 4 : 1;
                            handleUpdateItem(it.id, 'cycleFrequency', val);
                            handleUpdateItem(it.id, 'totalAnnualCycles', cycles);
                          }}
                          className="text-[11px] font-bold border border-slate-300 rounded p-1"
                        >
                          <option value="Monthly (12 Cycles/Year)">Monthly (12x)</option>
                          <option value="Bi-Monthly (6 Cycles/Year)">Bi-Monthly (6x)</option>
                          <option value="Quarterly (4 Cycles/Year)">Quarterly (4x)</option>
                          <option value="One-Time Maintenance (1x)">One-Time (1x)</option>
                        </select>
                      </td>
                      <td className="p-2 border border-slate-200 text-center">
                        <input
                          type="number"
                          value={it.totalAnnualCycles}
                          onChange={(e) => handleUpdateItem(it.id, 'totalAnnualCycles', Number(e.target.value))}
                          className="w-14 text-center font-bold border border-slate-300 rounded p-1 text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 text-right">
                        <input
                          type="number"
                          step="100"
                          value={it.ratePerCycle}
                          onChange={(e) => handleUpdateItem(it.id, 'ratePerCycle', Number(e.target.value))}
                          className="w-24 text-right font-bold border border-slate-300 rounded p-1 text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 text-right font-black text-slate-900">
                        ₹{lineTot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 border border-slate-200 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Sub Total */}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={5} className="p-2.5 text-right uppercase border border-slate-200">
                    Annual Contract Sub Total
                  </td>
                  <td className="p-2.5 text-right border border-slate-200 font-extrabold">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-slate-200"></td>
                </tr>

                {/* GST */}
                <tr>
                  <td colSpan={5} className="p-2 text-right border border-slate-200 font-medium">
                    GST (18%)
                  </td>
                  <td className="p-2 text-right border border-slate-200">
                    ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-slate-200"></td>
                </tr>

                {/* Final Total */}
                <tr className="bg-teal-100 font-black text-sm">
                  <td colSpan={5} className="p-3 text-right uppercase border border-slate-300 text-slate-900">
                    Total Contract Value
                  </td>
                  <td className="p-3 text-right border border-slate-300 text-teal-950 font-black">
                    ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-slate-300"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms & Conditions & Bank Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">
                Terms & Conditions
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                <li>Water tap point within 50 meters of roof ladder to be provided by client.</li>
                <li>Payment: Invoiced per completed cleaning cycle, payable within 15 days of cycle report.</li>
                <li>Pre-cleaning and post-cleaning solar string generation logs shared after every cycle.</li>
                <li>All technicians equipped with EN 361 certified full-body safety harnesses.</li>
                <li>Quotation validity: 30 days from date of issue.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">
                Company's Bank Details
              </div>
              <div className="space-y-1 text-slate-700 text-[11px]">
                <div>• A/c Holder: <strong>CLEANTECH SERVICES</strong></div>
                <div>• Bank Name: <strong>IDFC BANK</strong></div>
                <div>• A/c No.: <strong>73388820361</strong></div>
                <div>• Branch & IFSC: <strong>Chennai – Iyyapanthangal Branch & IDFB0081831</strong></div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 text-right">
                <div className="font-bold text-slate-800 text-[11px]">For Cleantech Services</div>
                <div className="font-black text-slate-900 text-xs mt-2">Mr. Manikandan Balamurugan</div>
                <div className="text-[10px] text-slate-500">Sales & Service Head • +91 73388 82036</div>
                <div className="text-[10px] uppercase font-bold text-slate-700">Authorised Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleantechGenerator;

