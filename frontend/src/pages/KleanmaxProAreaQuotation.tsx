import React, { useState } from 'react';
import { User } from '../services/types';
import { api } from '../services/api';
import {
  Download, Printer, Save, CheckCircle2,
  Calendar, Layers, ShieldCheck, Sparkles, Plus, Trash2, ArrowLeft, FileText
} from 'lucide-react';

interface AreaSection {
  id: string;
  name: string;
  service: string;
  length: number;
  breadth: number;
  unit: string;
  repetitions: number;
  rate: number;
}

const DEFAULT_AREAS: AreaSection[] = [
  {
    id: '1',
    name: 'Main Factory Shop Floor',
    service: 'Industrial Deep Floor Scrubbing & Degreasing',
    length: 100,
    breadth: 50,
    unit: 'ft',
    repetitions: 1,
    rate: 4.50,
  },
  {
    id: '2',
    name: 'High-Traffic Bay & Loading Dock',
    service: 'Heavy-Duty Oil & Stain Removal Rotary Scrubbing',
    length: 60,
    breadth: 40,
    unit: 'ft',
    repetitions: 1,
    rate: 5.50,
  },
  {
    id: '3',
    name: 'Warehouse Corridor & Aisle Area',
    service: 'Mechanical Auto-Scrubber Buffing & Sanitization',
    length: 80,
    breadth: 25,
    unit: 'ft',
    repetitions: 1,
    rate: 4.00,
  },
];

interface KleanmaxProAreaQuotationProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const KleanmaxProAreaQuotation: React.FC<KleanmaxProAreaQuotationProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // Quotation Meta
  const [quotationNo, setQuotationNo] = useState<string>(`KMP/26-27/${Math.floor(3000 + Math.random() * 7000)}`);
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState<string>('TVS LOGISTICS & SUPPLY CHAIN SOLUTIONS');
  const [customerLocation, setCustomerLocation] = useState<string>('Ambattur Industrial Estate, Chennai - 600058');

  // Interactive Area sections
  const [sections, setSections] = useState<AreaSection[]>(DEFAULT_AREAS);
  const [taxPercent, setTaxPercent] = useState<number>(18);

  const [saving, setSaving] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Calculations
  const calculateArea = (s: AreaSection) => {
    return Number(s.length || 0) * Number(s.breadth || 0) * Number(s.repetitions || 1);
  };

  const calculateLineTotal = (s: AreaSection) => {
    return calculateArea(s) * Number(s.rate || 0);
  };

  const totalArea = sections.reduce((sum, s) => sum + calculateArea(s), 0);
  const subtotal = sections.reduce((sum, s) => sum + calculateLineTotal(s), 0);
  const cgstRate = taxPercent / 2;
  const sgstRate = taxPercent / 2;
  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const totalAmount = subtotal + cgstAmount + sgstAmount;

  const handleUpdate = (id: string, field: keyof AreaSection, val: any) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleAddSection = () => {
    const newSec: AreaSection = {
      id: Date.now().toString(),
      name: 'New Commercial Area Section',
      service: 'Mechanical Floor Scrubbing',
      length: 50,
      breadth: 30,
      unit: 'ft',
      repetitions: 1,
      rate: 4.50,
    };
    setSections((prev) => [...prev, newSec]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) {
      alert('Quotation must contain at least one area section.');
      return;
    }
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  // Save to database
  const handleSaveToDatabase = async () => {
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
          phone: '+91 7338882036',
        });
      }

      // 2. Prepare sections payload
      const quotationSections = sections.map((s, idx) => {
        const area = calculateArea(s);
        const lTotal = calculateLineTotal(s);
        return {
          section_order: idx + 1,
          section_name: s.name,
          service_name: s.service,
          length: Number(s.length),
          breadth: Number(s.breadth),
          measurement_unit: s.unit,
          calculated_area: area,
          repetitions: Number(s.repetitions || 1),
          billable_area: area,
          billable_uom: 'sq_ft',
          rate_source: 'catalogue',
          original_catalogue_rate: Number(s.rate),
          applied_rate: Number(s.rate),
          discount_percent: 0,
          line_total: lTotal,
        };
      });

      // 3. Create quotation
      const payload = {
        company_code: 'kleanmaxpro',
        customer_id: customer.id,
        quotation_type: 'area_based',
        quotation_date: quotationDate,
        customer_ref: quotationNo,
        job_description: 'Commercial Area Scrubbing & Cleaning Services - Kleanmax Pro',
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
      setToastMsg(`Kleanmax Pro Quotation ${created.quotation_number} saved! Ready to download.`);
      setTimeout(() => setToastMsg(null), 5000);
      return created.id;
    } catch (err: any) {
      alert(err.message || 'Failed to save area quotation');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
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
      const printWindow = window.open(`/api/quotations/${qId}/html`, '_blank');
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner Navigation & Quick Action Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FED10C] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                KLEANMAX PRO
              </span>
              <span className="text-xs text-slate-400">Commercial Operations</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight">
              Commercial Area Quotation Generator
            </h1>
          </div>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadDocx}
            disabled={saving}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all"
            title="Download Word (.docx)"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? 'Saving...' : 'Save Record'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print A4</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 text-xs font-black rounded-lg shadow-md flex items-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Ready to Download PDF</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2 shadow-xs text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* A4 Document Preview & Interactive Editor */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-8 sm:p-10 font-sans text-slate-800 relative">
        
        {/* 1. Automated Top Letterhead Banner */}
        <div className="border-b-2 border-slate-900 pb-3 mb-6 text-center">
          <img
            src="/letterhead_banner.png"
            alt="Klean Max Pro Letterhead Banner"
            className="w-full max-h-28 object-contain mx-auto"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* 2. Quotation Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide underline decoration-slate-900 underline-offset-4">
            COMMERCIAL CLEANING & SCRUBBING QUOTATION
          </h2>
        </div>

        {/* 3. Meta Information: Client & Quotation Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200 text-xs">
          <div className="space-y-2">
            <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">To :-</div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Customer / Company Name:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full font-black text-sm p-2 rounded border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="Enter client company name"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Site Location / Address:</label>
              <input
                type="text"
                value={customerLocation}
                onChange={(e) => setCustomerLocation(e.target.value)}
                className="w-full font-medium text-xs p-2 rounded border border-slate-300 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="Enter site location"
              />
            </div>
          </div>

          <div className="space-y-3 md:text-right flex flex-col justify-end">
            <div className="flex items-center md:justify-end gap-2">
              <span className="font-bold text-slate-600">Quotation No :-</span>
              <input
                type="text"
                value={quotationNo}
                onChange={(e) => setQuotationNo(e.target.value)}
                className="w-48 font-mono font-bold text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white text-right focus:outline-none"
              />
            </div>
            <div className="flex items-center md:justify-end gap-2">
              <span className="font-bold text-slate-600">Date :-</span>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-48 font-bold text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white text-right focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Fixed About Us Section */}
        <div className="bg-slate-50 border-l-4 border-[#FED10C] p-3.5 rounded mb-6 text-xs text-slate-700 leading-relaxed space-y-2">
          <div className="font-black text-slate-900 uppercase text-[11px] flex items-center justify-between">
            <span>About Us — Kleanmax Pro</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Fixed Automated Content</span>
          </div>
          <p>
            Kleanmax Pro is South India’s premier facility restoration and commercial floor maintenance partner. We specialize in deep industrial rotary scrubbing, epoxy floor restoration, high-bay degreasing, and protective commercial coatings for warehouses, manufacturing plants, logistics hubs, and commercial complexes across Chennai, Bangalore, and Hyderabad.
          </p>
          <p>
            Equipped with state-of-the-art heavy-duty ride-on scrubbers and eco-friendly industrial degreasers, our dedicated site supervisors and trained technicians deliver spotless, non-slip surfaces with zero operational downtime for your business.
          </p>
        </div>

        {/* 5. Interactive Commercial Area Table (Employees enter dimensions & quantity) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Billable Area & Scope of Work</span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Total: {totalArea.toLocaleString('en-IN')} sq ft
              </span>
            </span>
            <button
              onClick={handleAddSection}
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded border border-amber-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Area Section</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase font-extrabold text-[10px] border-b border-slate-300">
                <tr>
                  <th className="p-2.5 w-10 text-center">SL</th>
                  <th className="p-2.5">AREA & SERVICE SCOPE</th>
                  <th className="p-2.5 w-20 text-center bg-amber-50 text-amber-900 border-x border-amber-200">
                    LENGTH (FT)
                  </th>
                  <th className="p-2.5 w-20 text-center bg-amber-50 text-amber-900 border-r border-amber-200">
                    BREADTH (FT)
                  </th>
                  <th className="p-2.5 w-16 text-center">REPS</th>
                  <th className="p-2.5 w-24 text-center font-bold">SQ FT</th>
                  <th className="p-2.5 w-24 text-right">RATE (₹)</th>
                  <th className="p-2.5 w-28 text-right font-black">TOTAL (₹)</th>
                  <th className="p-2.5 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sections.map((sec, idx) => {
                  const area = calculateArea(sec);
                  const lTotal = calculateLineTotal(sec);

                  return (
                    <tr key={sec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={sec.name}
                          onChange={(e) => handleUpdate(sec.id, 'name', e.target.value)}
                          className="w-full font-bold text-xs text-slate-900 bg-transparent border-0 focus:ring-1 focus:ring-amber-400 rounded px-1"
                        />
                        <input
                          type="text"
                          value={sec.service}
                          onChange={(e) => handleUpdate(sec.id, 'service', e.target.value)}
                          className="w-full text-[11px] text-slate-500 bg-transparent border-0 focus:ring-1 focus:ring-amber-400 rounded px-1 mt-0.5"
                        />
                      </td>
                      {/* Length Input */}
                      <td className="p-2 text-center bg-amber-50/50 border-x border-amber-200">
                        <input
                          type="number"
                          min="1"
                          value={sec.length}
                          onChange={(e) => handleUpdate(sec.id, 'length', parseFloat(e.target.value) || 0)}
                          className="w-16 font-black text-xs text-center p-1 rounded border border-amber-300 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      {/* Breadth Input */}
                      <td className="p-2 text-center bg-amber-50/50 border-r border-amber-200">
                        <input
                          type="number"
                          min="1"
                          value={sec.breadth}
                          onChange={(e) => handleUpdate(sec.id, 'breadth', parseFloat(e.target.value) || 0)}
                          className="w-16 font-black text-xs text-center p-1 rounded border border-amber-300 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      {/* Repetitions */}
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={sec.repetitions}
                          onChange={(e) => handleUpdate(sec.id, 'repetitions', parseInt(e.target.value) || 1)}
                          className="w-12 font-bold text-xs text-center p-1 rounded border border-slate-200 bg-white focus:outline-none"
                        />
                      </td>
                      {/* Billable Area in Sq Ft */}
                      <td className="p-2 text-center font-bold text-slate-700 bg-slate-50">
                        {area.toLocaleString('en-IN')}
                      </td>
                      {/* Rate per Sq Ft */}
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[10px] text-slate-400">₹</span>
                          <input
                            type="number"
                            step="0.1"
                            value={sec.rate}
                            onChange={(e) => handleUpdate(sec.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-16 font-bold text-xs text-right p-1 rounded border border-slate-200 bg-white focus:outline-none"
                          />
                        </div>
                      </td>
                      {/* Total */}
                      <td className="p-2 text-right font-black text-slate-900">
                        ₹ {lTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveSection(sec.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Remove Area"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Sub Total */}
                <tr className="bg-slate-100 font-bold text-slate-800 border-t border-slate-300">
                  <td colSpan={7} className="p-2.5 text-right uppercase tracking-wider text-xs">
                    Sub Total ({totalArea.toLocaleString('en-IN')} sq ft):
                  </td>
                  <td className="p-2.5 text-right text-xs font-black text-slate-900">
                    ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>

                {/* CGST */}
                <tr className="text-slate-600 text-xs">
                  <td colSpan={7} className="p-2 text-right">
                    CGST ({cgstRate}%):
                  </td>
                  <td className="p-2 text-right font-bold text-slate-800">
                    ₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>

                {/* SGST */}
                <tr className="text-slate-600 text-xs">
                  <td colSpan={7} className="p-2 text-right">
                    SGST ({sgstRate}%):
                  </td>
                  <td className="p-2 text-right font-bold text-slate-800">
                    ₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>

                {/* Grand Total */}
                <tr className="bg-slate-900 text-white font-black text-sm border-t-2 border-slate-900">
                  <td colSpan={7} className="p-3 text-right uppercase tracking-wider text-amber-400">
                    Total Amount (Incl. 18% GST):
                  </td>
                  <td className="p-3 text-right text-base text-white">
                    ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Fixed After-Table Content */}
        <div className="border-t border-slate-200 pt-5 space-y-4 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-black uppercase text-[11px] text-slate-900">Terms & Specifications</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Fixed Automated Content</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">Scope of Operations</div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                <li>Commercial scrubbing using heavy-duty industrial rotary machines.</li>
                <li>Single-disc scrubbing, slurry extraction & vacuum drying.</li>
                <li>Eco-friendly biodegradable degreasing chemical agents.</li>
                <li>Trained safety-compliant operators with full PPE.</li>
              </ul>
            </div>

            <div>
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">Terms & Conditions</div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                <li>Continuous water supply and 3-phase/single-phase power to be provided by client.</li>
                <li>Floor area must be cleared of loose cartons/obstacles prior to commencement.</li>
                <li>Quotation validity: 30 days from the date of issue.</li>
                <li>Payment: 50% advance along with work order, 50% upon handover.</li>
              </ul>
            </div>
          </div>

          {/* Bank Details Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs">
            <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1.5">Company's Bank Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-700">
              <div>• A/c Holder's Name : <strong>KLEAN MAX PRO</strong></div>
              <div>• Bank Name : <strong>ICICI BANK KMP</strong></div>
              <div>• A/c No. : <strong>027505010327</strong></div>
              <div>• Branch & IFS Code: <strong>PORUR & ICIC0000275</strong></div>
            </div>
          </div>

          {/* Signatory */}
          <div className="flex justify-between items-end pt-3">
            <div className="text-[10px] text-slate-400 italic max-w-sm">
              This is a computer generated document and authenticated by Klean max pro. Hence, it can be considered valid even if not signed manually.
            </div>

            <div className="text-right">
              <div className="font-bold text-xs text-slate-700">For Klean max pro</div>
              <div className="font-black text-sm text-slate-900 mt-4">Mr. Manikandan</div>
              <div className="text-[11px] text-slate-600">Service Head</div>
              <div className="text-[11px] text-slate-600">+91 7338882036</div>
              <div className="font-bold text-[11px] text-slate-800 uppercase mt-0.5">Authorised Signatory</div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t border-slate-300 pt-3 text-center text-[11px] font-black text-slate-800">
            Contact :- 7338882036 / 9710148218 -- Website :- www.kleanmaxpro.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default KleanmaxProAreaQuotation;
