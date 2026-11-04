import React, { useState, useEffect, useRef } from 'react';
import { Customer, CompanySetting, User } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Download, Eye, Save, Sparkles, RefreshCw,
  CheckCircle2, ArrowLeft, Search, Check, ShieldCheck,
  Lock, X, Layers, Plus, Eraser, FileCode, AlignLeft
} from 'lucide-react';

export interface KleanmaxGeneratorProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

// Authentic Wilston Power Plant Scope Template from PDF
const WILSTON_SAMPLE_SCOPE = `HAND OVER DEEP CLEANING PROJECT :
PLANT - I

STORE AREA CLEANING SCOPE
• Structural Elements, Sheets, Bars and AC Duct Area: Thoroughly remove dust using an industrial vacuum cleaner, followed by wet wiping wherever applicable.
• Wall Cladding: Remove dust from all wall cladding surfaces using a clean microfiber cloth.
• Storage Racks: Thoroughly dust all storage racks using a clean microfiber cloth.

WINDING AREA CLEANING SCOPE
• Structural Elements, Sheets, Bars and AC Duct Area: Thoroughly remove dust using an industrial vacuum cleaner, followed by wet wiping wherever applicable.
• Wall Cladding: Remove dust from all wall cladding surfaces using a clean microfiber cloth.
• Storage Racks: Thoroughly dust all storage racks using a clean microfiber cloth.

PLANT BAY (1, 2 AND 3) CLEANING SCOPE
• Structural Elements, Sheets, Bars and AC Duct Area: Thoroughly remove dust from all structural elements, sheets, bars and AC duct areas using an industrial vacuum cleaner, followed by wet wiping wherever applicable.
• Wall Cladding: Remove dust from all wall cladding surfaces using a clean microfiber cloth.
• Storage Racks: Thoroughly dust all storage racks using a clean microfiber cloth.

OFFICE SURFACE CLEANING & EQUIPMENT ROOM CLEANING SCOPE
• Surface Dusting: Thoroughly remove dust from all office surfaces and equipment room surfaces using an industrial vacuum cleaner.
• Glass Cleaning: Clean all glass surfaces using TASKI R3 glass-cleaning chemical and a clean microfiber cloth to ensure a spotless, streak-free finish.

WALL CLEANING & REST ROOM CLEANING SCOPE
• Wall Cleaning: Remove dust from all wall surfaces using suitable manual cleaning equipment.
• Restroom Floor Scrubbing: Scrub the entire restroom floor using a single-disc machine with TASKI R6 chemical, following the recommended dilution and usage instructions.
• Floor Drying: Finally, remove the remaining water and cleaning solution using a wet vacuum cleaner to ensure the floor is clean and dry.

GLASS CLEANING CLEANING SCOPE
• Sticker and Mark Removal: Completely remove stickers, adhesive residue, stains, and marks from all glass surfaces using suitable tools and cleaning methods.
• Glass Washing: Clean the glass surfaces using TASKI R2 chemical, following the recommended dilution and usage instructions.
• Glass Wiping: Apply TASKI R3 glass-cleaning chemical and wipe using a professional glass wiper to achieve a clean, clear, and streak-free finish.
• Partition Glass Cleaning: Thoroughly clean all glass partitions on both sides, removing dust, fingerprints, smudges, and stains for a spotless appearance.

WINDOW CLEANING CLEANING SCOPE
• Window Cleaning: Thoroughly wash all window glass surfaces using TASKI R2 chemical, following the recommended dilution and usage instructions. Then apply TASKI R3 glass-cleaning chemical and wipe with a professional glass wiper to achieve a clean, clear, and streak-free finish.
• Doors Cleaning: Clean all door surfaces, including glass panels, frames, and handles, removing dust, stains, and fingerprints.
• Cupboards Cleaning: Remove dust, stains, and marks from all cupboard surfaces using suitable cleaning equipment and a microfiber cloth.
• Staircase Cleaning: Thoroughly clean staircase steps, handrails, side surfaces, and associated areas to remove dust, dirt, and stains.

OUTDOOR CLEANING GLASS CLEANING & HIGH-LEVEL CLEANING SCOPE
• Sticker and Mark Removal: Completely remove stickers, adhesive residue, stains, and marks from all exterior glass surfaces using suitable tools and cleaning methods.
• Glass Washing: Thoroughly wash all exterior glass surfaces using TASKI R2 chemical, following the recommended dilution and usage instructions.
• Glass Wiping: Apply TASKI R3 glass-cleaning chemical and wipe the glass surfaces using a professional glass wiper to achieve a clean, clear, and streak-free finish.
• Glass Cleaning Applicator: Use a suitable glass-cleaning applicator to apply the cleaning solution evenly and effectively across the glass surfaces.
• High-Level Glass Cleaning: Clean exterior glass panels and other elevated surfaces using appropriate access equipment and safe working practices.
• Access Equipment Customer Scope: Boom lifts and scaffolding shall be provided by the customer to facilitate high-level and elevated glass cleaning activities.

FLOOR SCRUBBING & BUFFING CLEANING SCOPE
• Dust Removal: Thoroughly remove loose dust and debris from the floor using a heavy-duty industrial vacuum cleaner.
• Floor Scrubbing: Apply a suitable TASKI concrete floor-cleaning chemical and scrub the entire floor using a single-disc machine to remove dirt, stains, and accumulated grime.
• Water Collection: Collect the wastewater and cleaning solution using an industrial wet vacuum cleaner.
• Floor Drying: Allow the floor to dry completely before proceeding with buffing.
• Floor Buffing: Buff the dry floor using a single-disc machine fitted with a white polishing pad to enhance the floor's appearance and achieve a clean, smooth, glossy finish wherever the floor surface permits.`;

const DEFAULT_TERMS = [
  '1. GST: PRICES ARE EXCLUSIVE OF GST (18%). GST WILL BE CHARGED EXTRA.',
  '2. RECLEANING POLICY: ONCE THE FLOOR IS HANDED OVER, ANY REQUEST FOR RECLEANING WILL BE SUBJECT TO ADDITIONAL CHARGES.',
  '3. UTILITIES: THE CLIENT MUST ARRANGE FOR A WATER AND ELECTRICITY SUPPLY DURING THE SERVICE.',
  '4. WORKING AREA CLEARANCE: THE CLIENT IS RESPONSIBLE FOR CLEARING THE WORKING AREA. CARE MUST BE TAKEN DURING SERVICE HOURS TO AVOID SPOILING THE CLEANED SURFACES.',
  '5. PAYMENT TERMS: A 50% ADVANCE PAYMENT IS REQUIRED. THE REMAINING BALANCE IS DUE UPON COMPLETION OF THE WORK. NO CREDIT TERMS ARE OFFERED.',
  '6. ADDITIONAL SERVICES: INFORM US IN ADVANCE IF ANY ADDITIONAL SERVICES ARE REQUIRED BEYOND THE SCOPE MENTIONED..',
];

const DEFAULT_SPECIAL_NOTES =
  'THIS PRICE NOT INCLUDING OF BOOM LIFT. ITS CUSTOMER SCOPE. WHAT CHARGES WILL ADDED WE WILL RAISE THE INVOICE SEPARATELY.';

// Helper to format Date to DD/MM/YYYY
export const formatToIndianDate = (dateObj: Date = new Date()): string => {
  const d = String(dateObj.getDate()).padStart(2, '0');
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
};

export const toISODate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const cleaned = dateStr.trim();
  const match = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

// Convert number to Indian currency words
function numberToWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';

  function convertTwoDigits(v: number): string {
    if (v < 20) return a[v];
    const tens = b[Math.floor(v / 10)];
    const units = a[v % 10];
    return tens + (units ? ' ' + units : '');
  }

  function convertThreeDigits(v: number): string {
    const hundred = Math.floor(v / 100);
    const rest = v % 100;
    let res = '';
    if (hundred > 0) res += a[hundred] + ' Hundred';
    if (rest > 0) res += (res ? ' and ' : '') + convertTwoDigits(rest);
    return res;
  }

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  let parts: string[] = [];
  if (crore > 0) parts.push(convertThreeDigits(crore) + ' Crore');
  if (lakh > 0) parts.push(convertThreeDigits(lakh) + ' Lakh');
  if (thousand > 0) parts.push(convertThreeDigits(thousand) + ' Thousand');
  if (remainder > 0) parts.push(convertThreeDigits(remainder));

  return 'Rupees ' + parts.join(' ') + ' Only';
}

export const KleanmaxGenerator: React.FC<KleanmaxGeneratorProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // Document Title & Taglines
  const [docTitle, setDocTitle] = useState('Commercial Cleaning');
  const [docSubtitle, setDocSubtitle] = useState('Elevating cleanliness for Business success');
  const [quotationNumber, setQuotationNumber] = useState('KM/0299');
  const [quotationDate, setQuotationDate] = useState(formatToIndianDate());

  // Client Details
  const [clientName, setClientName] = useState('WILSTON POWER SOLUTIONS');
  const [clientAddress, setClientAddress] = useState('SHOLAVARAM, CHENNAI');
  const [attentionPerson, setAttentionPerson] = useState('ATT : PLANT HEAD / COMMERCIAL MANAGER');
  const [clientPhone, setClientPhone] = useState('8122282034');
  const [clientGstin, setClientGstin] = useState('33AAACW9911P1Z9');

  // Scope of Work Text (Auto-expanding text area like MS Word)
  const [scopeText, setScopeText] = useState(WILSTON_SAMPLE_SCOPE);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Commercials & Project Value
  const [cleanableSqft, setCleanableSqft] = useState('1,38,000 SQFT');
  const [projectValue, setProjectValue] = useState<number>(480000.0);
  const [specialNotes, setSpecialNotes] = useState(DEFAULT_SPECIAL_NOTES);

  // Terms & Conditions
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);

  // Customers & Company Settings
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [company, setCompany] = useState<CompanySetting | null>(null);

  // State Management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);

  // Auto-resize textarea when text changes (natural MS Word flow)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Minimum 1 full A4 page height (around 620px) to start with
      const minHeight = 620;
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(minHeight, scrollH)}px`;
    }
  }, [scopeText]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [compRes, custRes, nextNo] = await Promise.all([
        api.company.get('kleanmax').catch(() => null),
        api.customers.list().catch(() => []),
        api.quotations.getNextNumber('kleanmax').catch(() => 'KLM/0001'),
      ]);

      if (compRes) setCompany(compRes);
      if (custRes && custRes.length > 0) setCustomers(custRes);
      if (nextNo) {
        const numStr = typeof nextNo === 'object' && (nextNo as any)?.next_number
          ? (nextNo as any).next_number
          : String(nextNo);
        setQuotationNumber(numStr);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (c: Customer) => {
    setClientName(c.company_name);
    setClientAddress(
      [c.billing_address_line1, c.billing_address_line2, c.billing_city, c.billing_pincode]
        .filter(Boolean)
        .join(', ') || c.billing_city || 'Chennai'
    );
    if (c.phone) setClientPhone(c.phone);
    if (c.gstin) setClientGstin(c.gstin);
    if (c.contact_person) setAttentionPerson(`ATT : ${c.contact_person.toUpperCase()}`);
    setShowCustomerDropdown(false);
  };

  // Quick Scope Helpers
  const insertWilstonTemplate = () => {
    setScopeText(WILSTON_SAMPLE_SCOPE);
    setCleanableSqft('1,38,000 SQFT');
    setProjectValue(480000.0);
    setSpecialNotes(DEFAULT_SPECIAL_NOTES);
  };

  const clearToBlankPage = () => {
    setScopeText('');
  };

  const appendScopeSection = (title: string, bullets: string[]) => {
    const sectionStr = `\n\n${title.toUpperCase()} CLEANING SCOPE\n` + bullets.map(b => `• ${b}`).join('\n');
    setScopeText(prev => prev.trim() + sectionStr);
  };

  // Financial calculations
  const totalAmount = Number(projectValue || 0);
  const amountWords = numberToWords(totalAmount);

  // Build Payload
  const buildQuotationPayload = () => {
    return {
      company_code: 'kleanmax',
      quotation_number: quotationNumber.trim() || 'KM/0299',
      job_description: docTitle.trim() || 'Commercial Cleaning',
      quotation_date: toISODate(quotationDate),
      status: 'APPROVED',
      client_name: clientName.trim() || 'WILSTON POWER SOLUTIONS',
      client_address: clientAddress.trim(),
      client_gstin: clientGstin.trim(),
      client_phone: clientPhone.trim(),
      attention_person: attentionPerson.trim(),
      notes: scopeText.trim(),
      subtotal: totalAmount,
      taxable_amount: totalAmount,
      cgst_rate: 0,
      cgst_amount: 0,
      sgst_rate: 0,
      sgst_amount: 0,
      igst_rate: 0,
      igst_amount: 0,
      total_tax: 0,
      final_amount: totalAmount,
      payment_terms: '50% advance payment required. Remaining balance due upon completion.',
      terms_and_conditions: terms.join('\n'),
      snapshot_json: JSON.stringify({
        cleanable_sqft: cleanableSqft,
        special_notes: specialNotes,
        subtitle: docSubtitle,
        attention_person: attentionPerson,
      }),
      items: [
        {
          item_name: `${docTitle.toUpperCase()} - ${cleanableSqft || 'AREA SCOPE'}`,
          description: scopeText.slice(0, 150) + '...',
          quantity: 1,
          uom: 'JOB',
          unit_price: totalAmount,
          line_total: totalAmount,
          hsn_sac_code: '998533',
        },
      ],
    };
  };

  // 1. Save to Database
  const handleSaveToDb = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      let targetCust = customers.find(
        c => c.company_name.toLowerCase() === clientName.trim().toLowerCase()
      );
      if (!targetCust && clientName.trim()) {
        try {
          targetCust = await api.customers.create({
            company_name: clientName.trim(),
            billing_address_line1: clientAddress.trim(),
            billing_city: 'Chennai',
            phone: clientPhone.trim(),
            gstin: clientGstin.trim(),
          });
          setCustomers(prev => [...prev, targetCust!]);
        } catch (e) {
          console.warn('Customer auto-create warning:', e);
        }
      }

      const payload = {
        ...buildQuotationPayload(),
        customer_id: targetCust?.id || customers[0]?.id || 'default-customer-id',
      };

      let res;
      if (savedQuotationId) {
        res = await api.quotations.update(savedQuotationId, payload);
      } else {
        res = await api.quotations.create(payload);
        setSavedQuotationId(res.id);
      }

      setSuccessMessage('Quotation successfully saved to database!');
      setTimeout(() => setSuccessMessage(''), 4000);
      return res.id;
    } catch (err: any) {
      console.error('Error saving quotation:', err);
      alert(`Save failed: ${err.message || 'Unknown database error'}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // 2. Download PDF
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      let qId = savedQuotationId;
      if (!qId) {
        qId = await handleSaveToDb();
      }
      if (!qId) return;

      const filename = `${quotationNumber.replace(/[\/\\]/g, '_')}_Kleanmax_Cleaning_Proposal.pdf`;
      await api.quotations.downloadPdf(qId, filename);
    } catch (err: any) {
      console.error('PDF download failed:', err);
      alert(`PDF download failed: ${err.message || 'Error communicating with document engine'}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Download Word (.docx)
  const handleDownloadDocx = async () => {
    try {
      setLoading(true);
      let qId = savedQuotationId;
      if (!qId) {
        qId = await handleSaveToDb();
      }
      if (!qId) return;

      const filename = `${quotationNumber.replace(/[\/\\]/g, '_')}_Kleanmax_Cleaning_Proposal.docx`;
      await api.quotations.downloadDocx(qId, filename);
    } catch (err: any) {
      console.error('DOCX download failed:', err);
      alert(`Word download failed: ${err.message || 'Error communicating with document engine'}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Preview A4
  const handlePreviewA4 = async () => {
    let qId = savedQuotationId;
    if (!qId) {
      qId = await handleSaveToDb();
    }
    if (qId) {
      onOpenPreview(qId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('kleanmax_dash')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="Back to Kleanmax Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Kleanmax Commercial Cleaning Proposal Generator
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Multi-page proposal builder matching Wilston Power Plant specification with continuous MS Word-like flow.
            </p>
          </div>
        </div>

        {/* 4 Working Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadDocx}
            disabled={loading || saving}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50"
            title="Download Word (.docx)"
          >
            <FileText className="w-4 h-4" />
            <span>Download Word (.docx)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={loading || saving}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50"
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePreviewA4}
            disabled={loading || saving}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Preview A4 Document"
          >
            <Eye className="w-4 h-4 text-sky-600" />
            <span>Preview A4</span>
          </button>

          <button
            onClick={handleSaveToDb}
            disabled={saving}
            className="px-4 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save to DB'}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* QUICK SCOPE TOOLS BAR */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-black uppercase tracking-wider text-sky-300">
            Word-Style Cleaning Scope Tools:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={insertWilstonTemplate}
            className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Load Wilston Power Plant Scope</span>
          </button>

          <button
            type="button"
            onClick={clearToBlankPage}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Eraser className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear to 1 Blank Page</span>
          </button>

          <button
            type="button"
            onClick={() =>
              appendScopeSection('Bay Scrubbing & Polishing', [
                'Vacuum loose dust and surface debris thoroughly.',
                'Apply TASKI concrete cleaner and scrub with single-disc machine.',
                'Extract liquid and dry completely with industrial wet vac.',
                'Buff with white pad for glossy protective finish.',
              ])
            }
            className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Insert Bay Scrubbing Scope</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW & LIVE EDITOR CONTAINER */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden">
        {/* STARTING PAGE (COVER PAGE WITH AUTHENTIC KLEANMAX HEADER) */}
        <div className="border-b-4 border-slate-100 bg-white">
          {/* Flush Header Banner */}
          <div className="w-full bg-white border-b border-slate-200 text-center">
            <img
              src="/headers/header_kleanmax.png"
              alt="Kleanmax Official Letterhead Banner"
              className="w-full h-auto max-h-36 object-contain block mx-auto"
            />
          </div>

          <div className="p-8 md:p-12 space-y-8 max-w-4xl mx-auto">
            {/* Tagline & Document Heading */}
            <div className="space-y-3 text-center sm:text-left border-b border-slate-200 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="text-2xl md:text-3xl font-black text-slate-900 border-b-2 border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none transition-all w-full sm:w-auto"
                  placeholder="COMMERCIAL CLEANING"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Proposal No:
                  </span>
                  <input
                    type="text"
                    value={quotationNumber}
                    onChange={e => setQuotationNumber(e.target.value)}
                    className="font-mono font-black text-sky-700 bg-sky-50 border border-sky-300 px-3 py-1 rounded-lg text-sm w-32 text-center"
                    placeholder="KM/0299"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                  type="text"
                  value={docSubtitle}
                  onChange={e => setDocSubtitle(e.target.value)}
                  className="text-sm font-semibold text-sky-600 italic border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none w-full sm:w-80"
                  placeholder="Elevating cleanliness for Business success"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Date:</span>
                  <input
                    type="text"
                    value={quotationDate}
                    onChange={e => setQuotationDate(e.target.value)}
                    className="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs w-28 text-center"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>
            </div>

            {/* Client (TO:) Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-sky-800 tracking-wider flex items-center gap-1.5">
                    <span>TO (Client Details):</span>
                  </span>
                  {/* Customer Quick Search */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-sky-200 shadow-2xs"
                    >
                      <Search className="w-3 h-3" />
                      <span>Search Clients</span>
                    </button>
                    {showCustomerDropdown && (
                      <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in">
                        <input
                          type="text"
                          value={customerSearch}
                          onChange={e => setCustomerSearch(e.target.value)}
                          placeholder="Search existing customer..."
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg mb-2 focus:outline-none focus:border-sky-500"
                        />
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {customers
                            .filter(c =>
                              c.company_name.toLowerCase().includes(customerSearch.toLowerCase())
                            )
                            .map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelectCustomer(c)}
                                className="w-full text-left text-xs p-1.5 hover:bg-sky-50 rounded font-semibold text-slate-800 flex items-center justify-between"
                              >
                                <span>{c.company_name}</span>
                                <span className="text-[10px] text-slate-400">{c.billing_city}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full font-black text-slate-900 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 uppercase"
                    placeholder="WILSTON POWER SOLUTIONS"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={e => setClientAddress(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500"
                    placeholder="SHOLAVARAM, CHENNAI"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={attentionPerson}
                    onChange={e => setAttentionPerson(e.target.value)}
                    className="w-full text-xs font-bold text-sky-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 uppercase"
                    placeholder="ATT : MR. SHANMUGAM - PLANT HEAD"
                  />
                </div>
              </div>

              {/* Kleanmax Official Details (Locked for employee) */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Kleanmax Head Office (System Locked):</span>
                </div>
                <div className="font-black text-slate-900 text-sm">KLEAN MAX</div>
                <div className="leading-relaxed">
                  NO 6, B6, JAYAM INDUSTRIAL ESTATE,<br />
                  CHETTIYAR AGARAM FIRST MAIN ROAD,<br />
                  VANAGARAM, CHENNAI – 600077
                </div>
                <div className="pt-1 text-slate-700 font-medium">
                  <strong>CONTACT :</strong> 8122282034 / 7338882036<br />
                  <strong>EMAIL :</strong> info@kleanmax.com<br />
                  <strong>WEB :</strong> www.kleanmax.com<br />
                  <strong>GST NO :</strong> 33DZPPS3614K1ZW
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: WORD-PROCESSOR SCOPE EDITOR ("1 PAGE EMPTY AND TEXT BOX IN BETWEEN THAT AUTOMATICALLY EXPANDS DOWNWARDS LIKE MS WORD") */}
        <div className="p-8 md:p-12 bg-slate-100/60 border-b border-slate-200">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-sky-600" />
                  <span>Scope of Work / Cleaning Specifications (Dynamic Document Area)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Type freely. The text box automatically grows downward and splits across pages like Microsoft Word with zero artificial gap.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                {scopeText.length} characters • {scopeText.split('\n').length} lines
              </span>
            </div>

            {/* Dynamic Word Canvas */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-10 transition-all relative">
              <textarea
                ref={textareaRef}
                value={scopeText}
                onChange={e => setScopeText(e.target.value)}
                placeholder="Type cleaning scope, elements, structural specs, chemical guidelines, machinery usage here... Content expands naturally as you type."
                className="w-full resize-none font-mono text-xs md:text-sm text-slate-800 leading-relaxed border-0 focus:outline-none focus:ring-0 bg-transparent"
                style={{
                  minHeight: '620px',
                  lineHeight: '1.65',
                  overflow: 'hidden',
                }}
              />
            </div>
          </div>
        </div>

        {/* FINAL SECTION: COMMERCIALS, NOTES, BANK DETAILS & TERMS (EXACTLY MATCHING PAGE 6 OF PDF) */}
        <div className="p-8 md:p-12 bg-white space-y-8 max-w-4xl mx-auto">
          {/* 1. Commercials & Notes Card */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Commercial Terms & Approximate Cleanable Area</span>
            </div>

            {/* Special Notes (Boom lift, etc.) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Special Notes (Customer Scope / Invoicing):
              </label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-amber-300 rounded-lg p-2.5 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Total Cleanable SQFT (Approx):
                </label>
                <input
                  type="text"
                  value={cleanableSqft}
                  onChange={e => setCleanableSqft(e.target.value)}
                  className="w-full font-black text-slate-900 text-sm bg-white border border-amber-300 rounded-lg p-2 focus:outline-none focus:border-sky-500"
                  placeholder="1,38,000 SQFT"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Total Project Value (₹):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={projectValue}
                  onChange={e => setProjectValue(parseFloat(e.target.value) || 0)}
                  className="w-full font-black text-slate-900 text-sm bg-white border border-amber-300 rounded-lg p-2 focus:outline-none focus:border-sky-500"
                  placeholder="480000.00"
                />
              </div>
            </div>

            {/* Total Display */}
            <div className="pt-3 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3 bg-amber-100/70 p-4 rounded-xl">
              <div>
                <div className="text-xs font-bold text-amber-900 uppercase">Total Project Value :</div>
                <div className="text-xs font-medium text-slate-600 italic">{amountWords}</div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* 2. Company's Bank Details (KVB Bank - Authentic from PDF) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Company's Bank Details :
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified KVB Corporate Account
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">A/C HOLDER'S NAME</span>
                <span className="font-extrabold text-slate-900">KLEAN MAX BANK</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">BANK NAME</span>
                <span className="font-extrabold text-slate-900">KVB BANK A/C 1278135000007113</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">ACCOUNT NUMBER</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">1278135000007113</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">BRANCH & IFS CODE</span>
                <span className="font-extrabold text-slate-900">ASHOK NAGAR & KVBL0001278</span>
              </div>
            </div>
          </div>

          {/* 3. Terms and Conditions (6 Points Authentic to PDF) */}
          <div className="space-y-3 border-t border-slate-200 pt-6">
            <div className="text-xs font-black uppercase tracking-wider text-slate-900">
              TERMS AND CONDITIONS :
            </div>
            <div className="space-y-2">
              {terms.map((term, index) => (
                <div key={index} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <span className="text-sky-600 font-bold">•</span>
                  <input
                    type="text"
                    value={term}
                    onChange={e => {
                      const updated = [...terms];
                      updated[index] = e.target.value;
                      setTerms(updated);
                    }}
                    className="w-full bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent focus:border-sky-400 focus:outline-none py-0.5 text-xs font-medium text-slate-800"
                  />
                </div>
              ))}
            </div>
            <div className="pt-2 text-xs font-bold text-sky-800 italic">
              YOUR SATISFACTION IS OUR GOAL. LOOKING FORWARD TO YOUR FAVORABLE ORDERS.
            </div>
          </div>

          {/* 4. Thank You & Signatory */}
          <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700">For KLEAN MAX</div>
              <div className="h-10" />
              <div className="text-xs font-black text-slate-900">Mr. Manikandan</div>
              <div className="text-[11px] text-slate-500">Service Head • +91 8122282034</div>
              <div className="text-[11px] font-bold text-slate-700">Authorised Signatory</div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-xl md:text-2xl font-black tracking-widest text-slate-800 uppercase">
                T H A N K &nbsp; Y O U
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Kleanmax Professional Cleaning Services • Commercial & Industrial Division
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
