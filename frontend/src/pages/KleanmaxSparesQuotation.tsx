import React, { useState } from 'react';
import { User } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Download, Printer, Save, Plus, Trash2, CheckCircle2,
  Building, Calendar, Wrench, ShieldCheck, ArrowLeft, RefreshCw
} from 'lucide-react';

interface SparesItem {
  id: string;
  isHeader?: boolean;
  headerTitle?: string;
  name: string;
  qty: number;
  uom: string;
  rate: number;
}

const DEFAULT_SPARES_ITEMS: SparesItem[] = [
  // Machine Group I
  { id: 'h1', isHeader: true, headerTitle: 'CLEAROCK AUTO SCRUBBER MACHINE', name: '', qty: 0, uom: '', rate: 0 },
  { id: '1', name: 'WIPER ROPE', qty: 1, uom: 'NOS', rate: 790 },
  { id: '2', name: 'WIPER SQUEEGEE SET', qty: 1, uom: 'NOS', rate: 3950 },
  { id: '3', name: 'DRAIN HOSE', qty: 1, uom: 'NOS', rate: 1350 },
  { id: '4', name: 'SUCTION HOSE - 1', qty: 1, uom: 'NOS', rate: 1600 },
  { id: '5', name: 'SUCTION HOSE - 2', qty: 1, uom: 'NOS', rate: 1600 },

  // Machine Group II
  { id: 'h2', isHeader: true, headerTitle: 'CLEAROCK AUTO SCRUBBER MACHINE', name: '', qty: 0, uom: '', rate: 0 },
  { id: '6', name: 'VACCUM MOTOR', qty: 1, uom: 'NOS', rate: 4800 },
  { id: '7', name: 'BRUSH MOTOR GEAR BOX SERVICING', qty: 1, uom: 'NOS', rate: 2800 },
  { id: '8', name: 'HANDLE KIT PVC', qty: 1, uom: 'NOS', rate: 4650 },
  { id: '9', name: 'FILTER KIT', qty: 1, uom: 'NOS', rate: 1950 },

  // Machine Group III
  { id: 'h3', isHeader: true, headerTitle: 'KARCHER 43/40 C AUTO SCRUBBER', name: '', qty: 0, uom: '', rate: 0 },
  { id: '10', name: 'RELAY KIT', qty: 1, uom: 'NOS', rate: 8100 },
  { id: '11', name: 'WIRING KIT', qty: 1, uom: 'NOS', rate: 3900 },
  { id: '12', name: 'VACCUM MOTOR', qty: 1, uom: 'NOS', rate: 5100 },

  // Group IV: Service Charges
  { id: 'h4', isHeader: true, headerTitle: 'SERVICE CHARGES', name: '', qty: 0, uom: '', rate: 0 },
  { id: '13', name: 'SERVICE CHARGES', qty: 4, uom: 'NOS', rate: 1100 },
];

interface KleanmaxSparesQuotationProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const KleanmaxSparesQuotation: React.FC<KleanmaxSparesQuotationProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // Quotation Meta
  const [quotationNo, setQuotationNo] = useState<string>(`KM/26-27/${Math.floor(1000 + Math.random() * 9000)}`);
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState<string>('SRINACSS ENVIRO PRIVATE LIMITED');
  const [customerCity, setCustomerCity] = useState<string>('Chennai.');

  // Spares table items
  const [items, setItems] = useState<SparesItem[]>(DEFAULT_SPARES_ITEMS);
  const [saving, setSaving] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Live total calculation
  const totalAmount = items.reduce((sum, item) => {
    if (item.isHeader) return sum;
    return sum + (Number(item.qty || 0) * Number(item.rate || 0));
  }, 0);

  const handleQtyChange = (id: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(0, newQty) } : item))
    );
  };

  const handleRateChange = (id: string, newRate: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rate: Math.max(0, newRate) } : item))
    );
  };

  const handleAddItem = (headerTitle?: string) => {
    const newItem: SparesItem = {
      id: Date.now().toString(),
      name: 'NEW SPARE PART / SERVICE',
      qty: 1,
      uom: 'NOS',
      rate: 1000,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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
          billing_city: customerCity,
          billing_address_line1: customerCity,
          billing_state: 'Tamil Nadu',
          billing_state_code: '33',
          billing_pincode: '600001',
          phone: '+91 7338882036',
        });
      }

      // 2. Prepare quotation items
      const quotationItems = items
        .filter((it) => (it.isHeader ? true : it.qty > 0))
        .map((it, idx) => ({
          item_order: idx + 1,
          item_name: it.isHeader ? it.headerTitle || '' : it.name,
          description: it.isHeader ? 'HEADER:SECTION' : undefined,
          quantity: it.isHeader ? 1 : it.qty,
          uom: it.isHeader ? 'NOS' : it.uom,
          unit_price: it.isHeader ? 0 : it.rate,
          applied_rate: it.isHeader ? 0 : it.rate,
          line_total: it.isHeader ? 0 : it.qty * it.rate,
          taxable_value: it.isHeader ? 0 : it.qty * it.rate,
          cgst_amount: 0,
          sgst_amount: 0,
          discount_type: 'none',
          discount_value: 0,
        }));

      // 3. Create quotation
      const payload = {
        company_code: 'kleanmax',
        customer_id: customer.id,
        quotation_type: 'repair_service',
        quotation_date: quotationDate,
        customer_ref: quotationNo,
        job_description: 'Spares and Service Quotation for Industrial Cleaning Equipment',
        items: quotationItems,
        sections: [],
        tax_rate: 0,
        discount_type: 'none',
        discount_value: 0,
        freight_charges: 0,
        packing_charges: 0,
        other_charges: 0,
      };

      let created;
      if (savedQuoteId) {
        created = await api.quotations.update(savedQuoteId, payload);
      } else {
        created = await api.quotations.create(payload);
        setSavedQuoteId(created.id);
      }
      setToastMsg(`Quotation ${created.quotation_number} saved successfully! Ready to download.`);
      setTimeout(() => setToastMsg(null), 5000);
      return created.id;
    } catch (err: any) {
      alert(err.message || 'Failed to save quotation');
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
      {/* Top Banner & Action Deck */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#FED10C] text-slate-950 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
              Kleanmax Division
            </span>
            <span className="text-xs text-slate-300 font-bold">
              Spares & Maintenance Template
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Automated Spares and Service Quotation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Top logo, fixed 'About Us', fixed terms & bank details are automated. Employees only need to enter quantities.
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadDocx}
            disabled={saving}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
            title="Download Word (.docx)"
          >
            <FileText className="w-4 h-4" />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={saving}
            className="px-4 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={saving}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print A4</span>
          </button>

          <button
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Record'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={handleDownload} className="text-emerald-800 font-black underline hover:text-emerald-950">
            Open PDF Now →
          </button>
        </div>
      )}

      {/* The Exact Letterhead Quotation Preview & Input Canvas */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden p-6 md:p-8">
        {/* 1. Exact Cropped Top Letterhead Banner */}
        <div className="border-b-2 border-slate-900 pb-3 mb-6 text-center">
          <img
            src="/letterhead_banner.png"
            alt="Klean Max Pro Letterhead Banner"
            className="w-full max-h-28 object-contain mx-auto"
          />
        </div>

        {/* 2. Quotation Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase underline tracking-wider">
            SPARES AND SERVICE QUOTATION
          </h2>
        </div>

        {/* 3. Quotation Meta Table: Customer vs Quotation No & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 mb-4 border-b border-slate-200 text-xs">
          <div>
            <div className="font-bold text-slate-600 uppercase text-[10px] mb-1">To :-</div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full font-black text-sm text-slate-900 p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none mb-1 uppercase"
              placeholder="CLIENT COMPANY NAME"
            />
            <input
              type="text"
              value={customerCity}
              onChange={(e) => setCustomerCity(e.target.value)}
              className="w-full text-xs text-slate-700 p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              placeholder="City / Address"
            />
          </div>

          <div className="md:text-right space-y-2">
            <div className="flex items-center md:justify-end gap-2">
              <span className="font-bold text-slate-600">Revised Quotation No :-</span>
              <input
                type="text"
                value={quotationNo}
                onChange={(e) => setQuotationNo(e.target.value)}
                className="w-44 font-mono font-bold text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white text-right focus:outline-none"
              />
            </div>
            <div className="flex items-center md:justify-end gap-2">
              <span className="font-bold text-slate-600">Date :-</span>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-44 font-bold text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white text-right focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Fixed About Us Section (As in WhatsApp Image 1) */}
        <div className="bg-slate-50 border-l-4 border-[#FED10C] p-3.5 rounded mb-6 text-xs text-slate-700 leading-relaxed space-y-2">
          <div className="font-black text-slate-900 uppercase text-[11px] flex items-center justify-between">
            <span>About us</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Fixed Content</span>
          </div>
          <p>
            Kleanmax is a trusted name in the repair and maintenance of all types of cleaning equipment — from vacuum cleaners to ride-on scrubbers. With 12+ years of experience since 2013, we serve clients across Chennai, Bangalore, Hyderabad, and Visakhapatnam.
          </p>
          <p>
            We operate a large, fully equipped service center with a skilled technical team capable of handling both mechanical and electronic issues, including motherboard-level troubleshooting. We also offer custom fabrication of high-cost spare parts to reduce downtime and cost.
          </p>
          <p>
            We provide AMC (Annual Maintenance Contracts) and CMC (Comprehensive Maintenance Contracts) to ensure consistent machine performance and hassle-free upkeep.
          </p>
        </div>

        {/* 5. Interactive Spares Table (Employee Enters Quantity) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-xs text-slate-900 uppercase tracking-wider">
              Spares & Maintenance Itemized Table
            </span>
            <button
              onClick={() => handleAddItem()}
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded border border-amber-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Spare Line</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase font-extrabold text-[10px] border-b border-slate-300">
                <tr>
                  <th className="p-2.5 w-12 text-center">SL NO</th>
                  <th className="p-2.5">DESCRIPTION</th>
                  <th className="p-2.5 w-24 text-center bg-amber-50 text-amber-900 border-x border-amber-200">
                    QTY (ENTER)
                  </th>
                  <th className="p-2.5 w-16 text-center">UOM</th>
                  <th className="p-2.5 w-24 text-right">RATE (₹)</th>
                  <th className="p-2.5 w-28 text-right font-black">TOTAL (₹)</th>
                  <th className="p-2.5 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => {
                  if (item.isHeader) {
                    return (
                      <tr key={item.id} className="bg-slate-200/90 font-black text-slate-900">
                        <td className="p-2 text-center text-xs">
                          {idx === 0 ? 'I' : idx === 6 ? 'II' : idx === 11 ? 'III' : 'IV'}
                        </td>
                        <td colSpan={6} className="p-2 text-xs uppercase tracking-wide">
                          {item.headerTitle}
                        </td>
                      </tr>
                    );
                  }

                  const lineTotal = (Number(item.qty || 0) * Number(item.rate || 0));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2 text-center font-bold text-slate-500">
                        {idx}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, name: val } : it))
                            );
                          }}
                          className="w-full font-bold text-xs text-slate-800 bg-transparent border-0 focus:ring-1 focus:ring-amber-400 rounded px-1"
                        />
                      </td>
                      <td className="p-2 text-center bg-amber-50/50 border-x border-amber-200">
                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 font-black text-sm text-center p-1 rounded border border-amber-300 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      <td className="p-2 text-center font-bold text-slate-600">
                        {item.uom}
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleRateChange(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 font-bold text-xs text-right p-1 rounded border border-slate-200 bg-white focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-right font-black text-slate-900">
                        ₹ {lineTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Remove Line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="bg-slate-900 text-white font-black text-sm border-t-2 border-slate-900">
                  <td colSpan={4} className="p-3 text-right uppercase tracking-wider text-amber-400">
                    Grand Total:
                  </td>
                  <td colSpan={2} className="p-3 text-right text-base text-white">
                    ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Fixed After-Table Content (As in WhatsApp Image 2) */}
        <div className="border-t border-slate-200 pt-5 space-y-4 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-black uppercase text-[11px] text-slate-900">After-Table Specifications</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Fixed Content</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">Other Services</div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                <li>Cleaning Machine Rentals & Sales</li>
                <li>Housekeeping Material Supply</li>
                <li>Commercial Cleaning & Painting Services</li>
              </ul>
            </div>

            <div>
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">Terms & Conditions</div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                <li>Quotation valid for 15 days from the date of issue.</li>
                <li>Service will be provided within 24–48 hours of confirmation.</li>
                <li>All replaced parts will be returned to the client on request.</li>
                <li>Any additional repair will be done after client approval.</li>
                <li>Only listed services and parts are covered in this quotation.</li>
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

          <div className="text-[11px] font-bold text-slate-800">
            Kleanmax Pro — Your trusted service partner for complete cleaning equipment solutions across South India.
          </div>

          {/* Signatory */}
          <div className="flex justify-between items-end pt-3">
            <div className="text-[10px] text-slate-400 italic max-w-sm">
              This is a computer generated document and authenticated by Klean max pro. Hence, it can be considered valid even if not signed manually.
            </div>

            <div className="text-right">
              <div className="font-bold text-xs text-slate-700">For Klean max pro</div>
              <div className="font-black text-sm text-slate-900 mt-4">Mr. Manikandan Balamurugan</div>
              <div className="text-[11px] font-bold text-amber-700">Sales and Service Head</div>
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
export default KleanmaxSparesQuotation;
