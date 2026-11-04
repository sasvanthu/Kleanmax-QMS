import React, { useState } from 'react';
import { User } from '../services/types';
import { api } from '../services/api';
import {
  Paintbrush, Download, Printer, Save, CheckCircle2,
  Calendar, Layers, ShieldCheck, Sparkles, Plus, Trash2,
  FileText, ArrowLeft, Palette, Check
} from 'lucide-react';

interface PaintingScopeItem {
  id: string;
  name: string;
  areaSqFt: number;
  serviceType: string;
  ratePerSqFt: number;
  coats: number;
  includePrimer: boolean;
  notes?: string;
}

const DEFAULT_PAINT_SERVICES = [
  { name: 'Industrial Epoxy Flooring (2mm Self-Leveling)', defaultRate: 48, category: 'Epoxy' },
  { name: 'Heavy Duty Chemical-Resistant PU Floor Coating', defaultRate: 65, category: 'Epoxy' },
  { name: 'Anti-Bacterial Interior Wall Emulsion', defaultRate: 14, category: 'Interior' },
  { name: 'Weather-Proof Silicone Exterior Acrylic Finish', defaultRate: 18, category: 'Exterior' },
  { name: 'Structural Steel Epoxy Anti-Corrosive Primer & Paint', defaultRate: 35, category: 'Industrial' },
];

interface UniquePaintersGeneratorProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const UniquePaintersGenerator: React.FC<UniquePaintersGeneratorProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // Meta
  const [quotationNo, setQuotationNo] = useState<string>(`UNP/2026-27/${Math.floor(1000 + Math.random() * 9000)}`);
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState<string>('SRI BALAJI LOGISTICS & WAREHOUSING');
  const [customerLocation, setCustomerLocation] = useState<string>('Ambattur Industrial Estate, Chennai');

  // Painting Scope Items
  const [items, setItems] = useState<PaintingScopeItem[]>([
    {
      id: '1',
      name: 'Main Shopfloor Epoxy Heavy Duty Flooring',
      areaSqFt: 5000,
      serviceType: 'Industrial Epoxy Flooring (2mm Self-Leveling)',
      ratePerSqFt: 48,
      coats: 2,
      includePrimer: true,
      notes: 'Surface grinding, crack repair, epoxy primer + 2 coats self-leveling topcoat'
    },
    {
      id: '2',
      name: 'Warehouse Internal Side Walls Painting',
      areaSqFt: 8500,
      serviceType: 'Anti-Bacterial Interior Wall Emulsion',
      ratePerSqFt: 14,
      coats: 2,
      includePrimer: true,
      notes: 'Putty touch-up, water-thinnable primer, 2 coats premium washable emulsion'
    }
  ]);

  const [taxPercent, setTaxPercent] = useState<number>(18);
  const [saving, setSaving] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Calculations
  const calculateItemTotal = (item: PaintingScopeItem) => {
    const primerExtra = item.includePrimer ? 3.5 : 0;
    const effectiveRate = item.ratePerSqFt + primerExtra;
    return item.areaSqFt * effectiveRate;
  };

  const totalArea = items.reduce((acc, it) => acc + (Number(it.areaSqFt) || 0), 0);
  const subtotal = items.reduce((acc, it) => acc + calculateItemTotal(it), 0);
  const gstAmount = (subtotal * taxPercent) / 100;
  const finalTotal = subtotal + gstAmount;

  const handleAddItem = () => {
    const defaultSvc = DEFAULT_PAINT_SERVICES[0];
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Work Area ${prev.length + 1}`,
        areaSqFt: 2000,
        serviceType: defaultSvc.name,
        ratePerSqFt: defaultSvc.defaultRate,
        coats: 2,
        includePrimer: true,
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('A quotation must contain at least one area specification.');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof PaintingScopeItem, val: any) => {
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
          billing_pincode: '600058',
          phone: '+91 73388 82036',
        });
      }

      // 2. Prepare sections payload
      const quotationSections = items.map((it, idx) => {
        const lineTot = calculateItemTotal(it);
        const primerExtra = it.includePrimer ? 3.5 : 0;
        const effectiveRate = it.ratePerSqFt + primerExtra;
        return {
          section_order: idx + 1,
          section_name: it.name,
          service_name: it.serviceType,
          length: Number(it.areaSqFt),
          breadth: 1,
          measurement_unit: 'ft',
          calculated_area: Number(it.areaSqFt),
          repetitions: 1,
          billable_area: Number(it.areaSqFt),
          billable_uom: 'sq_ft',
          rate_source: 'catalogue',
          original_catalogue_rate: effectiveRate,
          applied_rate: effectiveRate,
          discount_percent: 0,
          line_total: lineTot,
          notes: `${it.coats} coats. ${it.includePrimer ? 'Primer included.' : 'Without primer.'} ${it.notes || ''}`
        };
      });

      // 3. Create quotation
      const payload = {
        company_code: 'uniquepainters',
        customer_id: customer.id,
        quotation_type: 'area_based',
        quotation_date: quotationDate,
        customer_ref: quotationNo,
        job_description: `Surface coating and painting scope for ${totalArea.toLocaleString()} sq.ft at ${customerLocation}`,
        items: [],
        sections: quotationSections,
        tax_rate: taxPercent,
        discount_type: 'none',
        discount_value: 0,
        freight_charges: 0,
        packing_charges: 0,
        other_charges: 0,
      };

      const created = await api.quotations.create(payload);
      setSavedQuoteId(created.id);
      setToastMsg(`Unique Painters Quotation ${created.quotation_number} saved! Ready to download.`);
      setTimeout(() => setToastMsg(null), 5000);
      return created.id;
    } catch (err: any) {
      alert(err.message || 'Failed to save painting quotation');
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
      <div className="bg-purple-900/10 border border-purple-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
          <span className="text-xs font-black uppercase text-purple-950">
            Unique Painters Employee Hub
          </span>
          <span className="text-xs text-purple-700 font-bold">• Page 1: Quotation Generator</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('uniquepainters_quotes')}
            className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 rounded-lg text-xs font-bold transition-colors"
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
      <div className="bg-gradient-to-r from-purple-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-purple-900 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-purple-600 text-white px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
              Unique Painters Division
            </span>
            <span className="text-xs text-purple-200 font-bold">
              Automated Painting & Coating Generator
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Commercial Painting & Epoxy Estimator
          </h1>
          <p className="text-xs text-purple-200/80 mt-1">
            Authentic letterhead header, surface primer calculations, SBI remittance details and terms are pre-configured.
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
            onClick={() => onNavigate('uniquepainters_quotes')}
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
            src="/headers/header_uniquepainters.png"
            alt="Unique Painters Header"
            className="w-full max-h-28 object-contain mx-auto"
            onError={(e) => {
              (e.target as any).style.display = 'none';
            }}
          />
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide underline">
              SURFACE COATING & PAINTING QUOTATION
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

          {/* Fixed About Us for Unique Painters */}
          <div className="bg-purple-50/50 border-l-4 border-purple-600 p-3 rounded text-xs text-slate-700 leading-relaxed">
            <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">About Unique Painters</div>
            Unique Painters is a leading industrial, commercial and architectural coating contractor serving commercial facilities, warehouses, manufacturing plants, and logistics hubs. We specialize in seamless self-leveling epoxy flooring, heavy-duty polyurethane coatings, exterior elastomeric weather protection, and high-performance repainting with premium surface preparation.
          </div>

          {/* Area & Specification Table */}
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-black text-slate-900 uppercase">
                Work Scope & Painting Areas:
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Painting Scope</span>
              </button>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-900 text-white uppercase text-[10px] font-black">
                <tr>
                  <th className="p-2.5 border border-slate-800 text-center w-10">SL</th>
                  <th className="p-2.5 border border-slate-800">Scope & Service Type</th>
                  <th className="p-2.5 border border-slate-800 text-center w-28">Area (Sq.ft)</th>
                  <th className="p-2.5 border border-slate-800 text-center w-28">Coats & Primer</th>
                  <th className="p-2.5 border border-slate-800 text-right w-24">Rate / Sq.ft</th>
                  <th className="p-2.5 border border-slate-800 text-right w-28">Total (₹)</th>
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
                        <select
                          value={it.serviceType}
                          onChange={(e) => {
                            const svc = DEFAULT_PAINT_SERVICES.find(s => s.name === e.target.value);
                            handleUpdateItem(it.id, 'serviceType', e.target.value);
                            if (svc) handleUpdateItem(it.id, 'ratePerSqFt', svc.defaultRate);
                          }}
                          className="w-full text-[11px] text-slate-600 border border-slate-200 rounded p-1"
                        >
                          {DEFAULT_PAINT_SERVICES.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name} (Std: ₹{s.defaultRate}/sq.ft)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 border border-slate-200 text-center">
                        <input
                          type="number"
                          value={it.areaSqFt}
                          onChange={(e) => handleUpdateItem(it.id, 'areaSqFt', Number(e.target.value))}
                          className="w-24 text-center font-bold border border-slate-300 rounded p-1 text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-bold">{it.coats} Coats</span>
                          <label className="text-[10px] text-slate-600 flex items-center gap-0.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={it.includePrimer}
                              onChange={(e) => handleUpdateItem(it.id, 'includePrimer', e.target.checked)}
                              className="rounded text-purple-600"
                            />
                            <span>Primer</span>
                          </label>
                        </div>
                      </td>
                      <td className="p-2 border border-slate-200 text-right">
                        <input
                          type="number"
                          step="0.5"
                          value={it.ratePerSqFt}
                          onChange={(e) => handleUpdateItem(it.id, 'ratePerSqFt', Number(e.target.value))}
                          className="w-20 text-right font-bold border border-slate-300 rounded p-1 text-xs"
                        />
                        {it.includePrimer && (
                          <div className="text-[9px] text-purple-700 font-bold">+₹3.5 Primer</div>
                        )}
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
                    Sub Total ({totalArea.toLocaleString()} sq.ft)
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
                <tr className="bg-purple-100 font-black text-sm">
                  <td colSpan={5} className="p-3 text-right uppercase border border-slate-300 text-slate-900">
                    Total Amount
                  </td>
                  <td className="p-3 text-right border border-slate-300 text-purple-950 font-black">
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
                <li>Water and electricity connection at work site to be provided by client.</li>
                <li>40% Advance with confirmed purchase order, 40% on primer/base, 20% on completion.</li>
                <li>Surface preparation (cleaning, degreasing, crack repairs) included as quoted.</li>
                <li>Work commences within 3 business days of site handover and clearance.</li>
                <li>Quotation validity: 30 days from date of issue.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">
                Company's Bank Details
              </div>
              <div className="space-y-1 text-slate-700 text-[11px]">
                <div>• A/c Holder: <strong>UNIQUE PAINTERS</strong></div>
                <div>• Bank Name: <strong>STATE BANK OF INDIA</strong></div>
                <div>• A/c No.: <strong>38992019283</strong></div>
                <div>• Branch & IFSC: <strong>Ambattur Industrial Estate & SBIN0001550</strong></div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 text-right">
                <div className="font-bold text-slate-800 text-[11px]">For Unique Painters</div>
                <div className="font-black text-slate-900 text-xs mt-2">Project Estimations Head</div>
                <div className="text-[10px] text-slate-500">+91 73388 82036</div>
                <div className="text-[10px] uppercase font-bold text-slate-700">Authorised Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniquePaintersGenerator;

