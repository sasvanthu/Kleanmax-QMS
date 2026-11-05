import React, { useState } from 'react';
import { User } from '../services/types';
import { api } from '../services/api';
import {
  Download, Printer, Save, CheckCircle2,
  Calendar, Layers, ShieldCheck, Sparkles, Plus, Trash2, FileText
} from 'lucide-react';

interface KleanmaxSalesQuotationProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const KleanmaxSalesQuotation: React.FC<KleanmaxSalesQuotationProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // Quotation Meta
  const [quotationNo, setQuotationNo] = useState<string>(`KMP/26-27/${Math.floor(2000 + Math.random() * 8000)}`);
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState<string>('TIRUPATHI');
  const [customerLocation, setCustomerLocation] = useState<string>('Industrial Estate');

  // Machine Item Specs & Quantity Input
  const [machineName, setMachineName] = useState<string>('Karcher battery auto scrubber');
  const [qty, setQty] = useState<number>(1);
  const [rate, setRate] = useState<number>(248000);
  const [taxPercent, setTaxPercent] = useState<number>(18);

  const [saving, setSaving] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Financial Calculations
  const subtotal = Number(qty || 0) * Number(rate || 0);
  const cgstRate = taxPercent / 2;
  const sgstRate = taxPercent / 2;
  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const totalAmount = subtotal + cgstAmount + sgstAmount;

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
          billing_city: customerLocation,
          billing_address_line1: customerLocation,
          billing_state: 'Tamil Nadu',
          billing_state_code: '33',
          billing_pincode: '600001',
          phone: '+91 7338882036',
        });
      }

      // 2. Prepare items
      const machineDescription = `Cleaning / Working Width: 500 mm (20 inches) | Squeegee / Suction Width: 850 mm | Fresh / Waste Water Tank Capacity: 50 / 50 liters | Max. Area Performance: Up to 2000 m²/h | Brush Speed: 180 rpm | Brush Contact Pressure: 27.3 - 28.5 g/cm² | Drive Type: Battery operated (24 V) | Rated Input Power: 1100 W | Sound / Noise Level: < 70 dB(A) | Dimensions (L x W x H): 1170 x 570 x 1025 mm`;

      const quotationItems = [
        {
          item_order: 1,
          item_name: machineName,
          description: machineDescription,
          quantity: qty,
          uom: 'NOS',
          unit_price: rate,
          applied_rate: rate,
          line_total: subtotal,
          taxable_value: subtotal,
          tax_rate: taxPercent,
          cgst_amount: cgstAmount,
          sgst_amount: sgstAmount,
          discount_type: 'none',
          discount_value: 0,
        },
      ];

      // 3. Create quotation
      const payload = {
        company_code: 'kleanmax',
        customer_id: customer.id,
        quotation_type: 'item_based',
        quotation_date: quotationDate,
        customer_ref: quotationNo,
        job_description: 'Sales Quotation for Karcher Battery Auto Scrubber & Cleaning Equipment',
        items: quotationItems,
        sections: [],
        tax_rate: taxPercent,
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
      setToastMsg(`Sales Quotation ${created.quotation_number} saved successfully! Ready to download.`);
      setTimeout(() => setToastMsg(null), 5000);
      return created.id;
    } catch (err: any) {
      alert(err.message || 'Failed to save sales quotation');
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
      {/* Top Banner & Quick Download Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#FED10C] text-slate-950 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
              Kleanmax Division
            </span>
            <span className="text-xs text-slate-300 font-bold">
              Cleaning Machine Sales Template
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Automated Equipment Sales Quotation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Top logo, fixed rental/sales 'About Us', machine photo & specs, 9%+9% GST calculation, and advantages are automated.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadDocx}
            disabled={saving}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
            title="Download Word (.docx)"
          >
            <FileText className="w-4 h-4" />
            <span>Download Word (.docx)</span>
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

      {/* The Exact Sales Letterhead Canvas */}
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
            SALES QUOTATION
          </h2>
        </div>

        {/* 3. Meta Table: Customer vs Quotation No & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 mb-4 border-b border-slate-200 text-xs">
          <div>
            <div className="font-bold text-slate-600 uppercase text-[10px] mb-1">TO :-</div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full font-black text-sm text-slate-900 p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none mb-1 uppercase"
              placeholder="CLIENT NAME"
            />
            <input
              type="text"
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              className="w-full text-xs text-slate-700 p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              placeholder="Location / Address"
            />
          </div>

          <div className="md:text-right space-y-2">
            <div className="flex items-center md:justify-end gap-2">
              <span className="font-bold text-slate-600">Quotation Date :-</span>
              <input
                type="text"
                value={quotationNo}
                onChange={(e) => setQuotationNo(e.target.value)}
                className="w-44 font-mono font-bold text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white text-right focus:outline-none"
              />
            </div>
            <div className="flex items-center md:justify-end gap-2">
              <span className="font-bold text-slate-600">DATE :-</span>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-44 font-bold text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white text-right focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Fixed About Us Section (As in WhatsApp Image 3) */}
        <div className="bg-slate-50 border-l-4 border-[#FED10C] p-3.5 rounded mb-6 text-xs text-slate-700 leading-relaxed space-y-2">
          <div className="font-black text-slate-900 uppercase text-[11px] flex items-center justify-between">
            <span>About Us:</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Fixed Content</span>
          </div>
          <p>
            Kleanmax Pro is a leading provider of cleaning machine rental services, offering a wide range of equipment — from vacuum cleaners to ride-on scrubbers — to industries, malls, commercial spaces, and facility management companies across Chennai, Bangalore, Hyderabad and Visakhapatnam.
          </p>
          <p>
            Our rental machines are well-maintained, ready-to-use, and come with on-site delivery and pickup. We also offer on-call technical support throughout the rental period, ensuring seamless operations. Machines are equipped with GPS tracking devices to monitor usage, location, and efficiency in real-time. For larger or longer projects, we provide custom rental packages, and where needed, can include standby machines and basic operator training. With flexible rental durations, affordable pricing, and transparent terms, our rental service is designed to deliver both performance and peace of mind.
          </p>
        </div>

        {/* 5. Sales Item Table with Machine Photo and Specs (As in WhatsApp Images 3 & 4) */}
        <div className="mb-6">
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase font-extrabold text-[10px] border-b border-slate-300">
                <tr>
                  <th className="p-2.5 w-12 text-center">SL NO</th>
                  <th className="p-2.5">DESCRIPTION & SPECIFICATIONS</th>
                  <th className="p-2.5 w-24 text-center bg-amber-50 text-amber-900 border-x border-amber-200">
                    QTY (ENTER)
                  </th>
                  <th className="p-2.5 w-16 text-center">UOM</th>
                  <th className="p-2.5 w-28 text-right">RATE (₹)</th>
                  <th className="p-2.5 w-32 text-right font-black">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 text-center font-bold text-slate-600 align-top">1.</td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={machineName}
                      onChange={(e) => setMachineName(e.target.value)}
                      className="font-black text-sm text-slate-900 w-full mb-2 bg-transparent border-0 focus:ring-1 focus:ring-amber-400 rounded"
                    />

                    {/* Machine Photo and Technical Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                      <div className="text-center">
                        <img
                          src="/karcher_scrubber.png"
                          alt="Karcher battery auto scrubber"
                          className="max-h-36 object-contain mx-auto rounded shadow-2xs"
                        />
                        <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 block">
                          OEM Certified Scrubber
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700 space-y-1">
                        <div>• <strong>Cleaning / Working Width:</strong> 500 mm (20 inches)</div>
                        <div>• <strong>Squeegee / Suction Width:</strong> 850 mm</div>
                        <div>• <strong>Fresh / Waste Water Tank:</strong> 50 / 50 liters</div>
                        <div>• <strong>Max. Area Performance:</strong> Up to 2000 m²/h</div>
                        <div>• <strong>Brush Speed:</strong> 180 rpm</div>
                        <div>• <strong>Brush Contact Pressure:</strong> 27.3 - 28.5 g/cm²</div>
                        <div>• <strong>Drive Type:</strong> Battery operated (24 V)</div>
                        <div>• <strong>Rated Input Power:</strong> 1100 W</div>
                        <div>• <strong>Dimensions:</strong> 1170 x 570 x 1025 mm</div>
                      </div>
                    </div>
                  </td>

                  {/* Quantity input by employee */}
                  <td className="p-3 text-center align-top bg-amber-50/50 border-x border-amber-200">
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 font-black text-base text-center p-1.5 rounded border border-amber-300 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </td>

                  <td className="p-3 text-center font-bold text-slate-600 align-top">NOS</td>

                  <td className="p-3 text-right align-top">
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                      className="w-24 font-bold text-xs text-right p-1 rounded border border-slate-200 bg-white"
                    />
                  </td>

                  <td className="p-3 text-right font-black text-slate-900 text-sm align-top">
                    ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Sub Total */}
                <tr className="bg-slate-50 font-bold text-xs">
                  <td colSpan={5} className="p-2.5 text-right uppercase text-slate-700">SUB TOTAL</td>
                  <td className="p-2.5 text-right font-black text-slate-900">
                    ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* CGST 9% */}
                <tr className="text-xs">
                  <td colSpan={5} className="p-2 text-right text-slate-600">
                    CGST {cgstRate}%
                  </td>
                  <td className="p-2 text-right font-bold text-slate-800">
                    ₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* SGST 9% */}
                <tr className="text-xs">
                  <td colSpan={5} className="p-2 text-right text-slate-600">
                    SGST {sgstRate}%
                  </td>
                  <td className="p-2 text-right font-bold text-slate-800">
                    ₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Grand Total Row */}
                <tr className="bg-slate-900 text-white font-black text-sm border-t-2 border-slate-900">
                  <td colSpan={5} className="p-3 text-right uppercase tracking-wider text-amber-400">
                    TOTAL AMOUNT:
                  </td>
                  <td className="p-3 text-right text-base text-white">
                    ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Fixed After-Table Content (As in WhatsApp Image 4) */}
        <div className="border-t border-slate-200 pt-5 space-y-4 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-black uppercase text-[11px] text-slate-900">Company Terms & Value Add</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Fixed Content</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">
                Advantages of Buying from Kleanmax
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                <li>14+ years of trusted industry experience.</li>
                <li>High-performance, quality-tested machines.</li>
                <li>Customized solutions for various industries.</li>
                <li>Transparent and competitive pricing.</li>
                <li>Fast and reliable delivery service.</li>
                <li>Dedicated after-sales technical support.</li>
                <li>Readily available genuine spare parts.</li>
                <li>Expert consultation for the right machine selection.</li>
                <li>Basic operator training provided.</li>
                <li>Long-term value with reliable performance.</li>
              </ul>
            </div>

            <div>
              <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">
                Other Services
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                <li>Repair & Maintenance of Cleaning Equipment</li>
                <li>AMC / CMC Contracts</li>
                <li>Sales of New & Used Machines</li>
                <li>Housekeeping Material Supply</li>
                <li>Commercial Cleaning & Painting Services</li>
              </ul>
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
export default KleanmaxSalesQuotation;
