import React, { useState, useEffect, useRef } from 'react';
import { Customer, CompanySetting, User } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Download, Eye, Save, Sparkles, RefreshCw, Edit3, Building, Trash2,
  CheckCircle2, ArrowLeft, Search, Check, ShieldCheck,
  Lock, X, Layers, Plus, Eraser, FileCode, AlignLeft
} from 'lucide-react';

export interface KleanmaxGeneratorProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
  quotationId?: string | null;
}

// Authentic Sri Chandaan Logistics Scope Template from reference PDF
const CHANDAAN_SAMPLE_SCOPE = `FLOOR SCRUBBING:
• Vacuum cleaner will be used for dusting the entire floor area.
• A single-disc machine with TASKI chemicals will be used to scrub the entire floor and staircase.
• Wet and dry vacuum cleaners will then be used to remove water and residue from the cleaned surfaces.

WALL & PARTITION CLEANING
• Stickers, adhesive residue, and visible marks will be completely removed.
• Surfaces will be washed using TASKI R2 chemical.
• TASKI R3 will then be applied, followed by wiping with a glass wiper for a clean, streak-free finish.
• All partition glass surfaces will be thoroughly cleaned.

CEILING DUSTING & SOFA/INTERIOR DUSTING
• After vacuuming, all ceiling surfaces will be wiped with microfiber cloths to ensure thorough removal of remaining dust particles.
• Cobwebs and accumulated dust will be removed using a heavy-duty vacuum cleaner with the required manpower.
• Cleaning of chairs, tables, doors, windows, cupboards, and all other interior areas is included in the quoted price.

SHEET CLEANING :
• DEPLOYMENT OF HEAVY-DUTY HIGH-PRESSURE JET WASHER MACHINES TO DEEPLY CLEAN EXTERIOR WALL SURFACES.
• THIS PROCESS REMOVES STUBBORN GRIME, POLLUTION STAINS, MOLD, ALGAE, AND WEATHER-RELATED DEPOSITS.
• CLEANING OF EXTERIOR GLASS USING TASKI R3 CHEMICAL, FOLLOWED BY THOROUGH WIPING WITH A GLASS WIPER TO ACHIEVE A CLEAN, STREAK-FREE FINISH.`;

const DEFAULT_TERMS = [
  '1. GST: PRICES ARE EXCLUSIVE OF GST (18%). GST WILL BE CHARGED EXTRA.',
  '2. RECLEANING POLICY: ONCE THE FLOOR IS HANDED OVER, ANY REQUEST FOR RECLEANING WILL BE SUBJECT TO ADDITIONAL CHARGES.',
  '3. UTILITIES: THE CLIENT MUST ARRANGE FOR A WATER AND ELECTRICITY SUPPLY DURING THE SERVICE.',
  '4. WORKING AREA CLEARANCE: THE CLIENT IS RESPONSIBLE FOR CLEARING THE WORKING AREA. CARE MUST BE TAKEN DURING SERVICE HOURS TO AVOID SPOILING THE CLEANED SURFACES.',
  '5. PAYMENT TERMS: A 50% ADVANCE PAYMENT IS REQUIRED. THE REMAINING BALANCE IS DUE UPON COMPLETION OF THE WORK. NO CREDIT TERMS ARE OFFERED.',
  '6. ADDITIONAL SERVICES: INFORM US IN ADVANCE IF ANY ADDITIONAL SERVICES ARE REQUIRED BEYOND THE SCOPE MENTIONED..',
];

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

export const fromISODate = (isoStr: string): string => {
  if (!isoStr) return formatToIndianDate();
  const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return isoStr;
};

export const KleanmaxGenerator: React.FC<KleanmaxGeneratorProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
  quotationId,
}) => {
  // Document Metadata
  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(formatToIndianDate());
  const [docTitle, setDocTitle] = useState('Commercial Cleaning Proposal');
  const [docSubtitle, setDocSubtitle] = useState('Elevating cleanliness for Business success');

  // Page 1: Client TO Details (Directly Editable)
  const [customerName, setCustomerName] = useState('SRI CHANDAAN LOGISTICS');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [attentionPerson, setAttentionPerson] = useState('MR.RONAK BOTHRA ( 99419 09090)');
  const [clientPhone, setClientPhone] = useState('9941909090');
  const [clientGstin, setClientGstin] = useState('');

  // Page 3: Scope of Work & Project Value (Directly Editable Text Box)
  const [scopeTitle, setScopeTitle] = useState('DEEP CLEANING SERVICE :');
  const [scopeText, setScopeText] = useState(CHANDAAN_SAMPLE_SCOPE);
  const [cleanableSqft, setCleanableSqft] = useState('36,000 SQFT');
  const [ratePerSqft, setRatePerSqft] = useState<number>(12.0);
  const [projectValue, setProjectValue] = useState<number>(432000.0);

  // Page 4: Bank Details, Terms & Conditions (Directly Editable)
  const [bankAccountName, setBankAccountName] = useState('KLEAN MAX BANK');
  const [bankName, setBankName] = useState('KVB BANK');
  const [bankAccountNo, setBankAccountNo] = useState('1278135000007113');
  const [bankBranch, setBankBranch] = useState('ASHOK NAGAR');
  const [bankIfsc, setBankIfsc] = useState('KVBL000127');
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);
  const [satisfactionGoal, setSatisfactionGoal] = useState('YOUR SATISFACTION IS OUR GOAL. LOOKING FORWARD TO YOUR FAVORABLE ORDERS.');

  // Customer List & Search
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [company, setCompany] = useState<CompanySetting | null>(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(quotationId || null);
  const [isEditMode, setIsEditMode] = useState<boolean>(!!quotationId);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(!!quotationId);
  const [inPagePreviewOpen, setInPagePreviewOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const minH = 340;
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(minH, scrollH)}px`;
    }
  }, [scopeText]);

  // Auto-calculate project value if sqft and rate are numbers
  const handleSqftChange = (val: string) => {
    setCleanableSqft(val);
    const numMatch = val.replace(/,/g, '').match(/\d+(\.\d+)?/);
    if (numMatch && ratePerSqft > 0) {
      const sqft = parseFloat(numMatch[0]);
      if (!isNaN(sqft)) {
        setProjectValue(Math.round(sqft * ratePerSqft));
      }
    }
  };

  const handleRateChange = (val: number) => {
    setRatePerSqft(val);
    const numMatch = cleanableSqft.replace(/,/g, '').match(/\d+(\.\d+)?/);
    if (numMatch && val > 0) {
      const sqft = parseFloat(numMatch[0]);
      if (!isNaN(sqft)) {
        setProjectValue(Math.round(sqft * val));
      }
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [quotationId]);

  const fetchNextQuotationNumber = async () => {
    try {
      const res = await api.quotations.getNextNumber('kleanmax', 'short');
      if (res && res.next_number) {
        setQuotationNumber(res.next_number);
        return res.next_number;
      }
    } catch (e) {
      console.warn('Could not fetch next quotation number:', e);
    }
    setQuotationNumber(prev => prev || 'KM/0310');
    return 'KM/0310';
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [compRes, custRes] = await Promise.all([
        api.company.get('kleanmax').catch(() => null),
        api.customers.list().catch(() => []),
      ]);

      if (compRes) {
        setCompany(compRes);
      }
      if (custRes && custRes.length > 0) setCustomers(custRes);

      if (quotationId) {
        setLoadingEdit(true);
        try {
          const q = await api.quotations.get(quotationId);
          if (q) {
            setSavedQuotationId(q.id);
            setIsEditMode(true);
            if (q.quotation_number) setQuotationNumber(q.quotation_number);
            if (q.quotation_date) setQuotationDate(fromISODate(q.quotation_date));
            if (q.job_description) setDocTitle(q.job_description);
            if (q.notes) setScopeText(q.notes);
            if (q.final_amount) setProjectValue(Number(q.final_amount));

            let snap: any = q.snapshot_json;
            if (typeof snap === 'string') {
              try { snap = JSON.parse(snap); } catch (e) {}
            }

            if (snap && typeof snap === 'object') {
              if (snap.customerName) setCustomerName(snap.customerName);
              if (snap.addressLine1) setAddressLine1(snap.addressLine1);
              if (snap.addressLine2) setAddressLine2(snap.addressLine2);
              if (snap.attentionPerson) setAttentionPerson(snap.attentionPerson);
              if (snap.scopeTitle) setScopeTitle(snap.scopeTitle);
              if (snap.cleanableSqft || snap.cleanable_sqft) setCleanableSqft(snap.cleanableSqft || snap.cleanable_sqft);
              if (snap.ratePerSqft) setRatePerSqft(Number(snap.ratePerSqft));
              if (snap.scopeText) setScopeText(snap.scopeText);
              if (snap.bankAccountName) setBankAccountName(snap.bankAccountName);
              if (snap.bankName) setBankName(snap.bankName);
              if (snap.bankAccountNo) setBankAccountNo(snap.bankAccountNo);
              if (snap.bankBranch) setBankBranch(snap.bankBranch);
              if (snap.bankIfsc) setBankIfsc(snap.bankIfsc);
              if (snap.satisfactionGoal) setSatisfactionGoal(snap.satisfactionGoal);
              if (Array.isArray(snap.terms) && snap.terms.length > 0) setTerms(snap.terms);
            }

            if (q.customer) {
              if (!snap?.customerName) setCustomerName(q.customer.company_name || '');
              if (!snap?.addressLine1) setAddressLine1(q.customer.billing_address_line1 || '');
              if (!snap?.addressLine2) setAddressLine2(q.customer.billing_city || '');
              if (!snap?.attentionPerson && q.customer.contact_person) {
                setAttentionPerson(`ATT: ${q.customer.contact_person.toUpperCase()}`);
              }
              if (q.customer.phone) setClientPhone(q.customer.phone);
              if (q.customer.gstin) setClientGstin(q.customer.gstin);
            }
          }
        } catch (e) {
          console.error('Failed to load existing Kleanmax quote:', e);
        } finally {
          setLoadingEdit(false);
        }
      } else {
        await fetchNextQuotationNumber();
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (c: Customer) => {
    setCustomerName(c.company_name);
    setAddressLine1(c.billing_address_line1 || '');
    setAddressLine2(c.billing_city || '');
    if (c.contact_person) setAttentionPerson(`ATT: ${c.contact_person.toUpperCase()} (${c.phone || ''})`);
    if (c.phone) setClientPhone(c.phone);
    if (c.gstin) setClientGstin(c.gstin);
    setShowCustomerDropdown(false);
  };

  // Preset Scope Helpers
  const insertChandaanTemplate = () => {
    setScopeTitle('DEEP CLEANING SERVICE :');
    setScopeText(CHANDAAN_SAMPLE_SCOPE);
    setCleanableSqft('36,000 SQFT');
    setRatePerSqft(12.0);
    setProjectValue(432000.0);
  };

  const clearToBlankBox = () => {
    setScopeText('');
  };

  const appendScopeSection = (title: string, bullets: string[]) => {
    const sectionStr = `\n\n${title.toUpperCase()}:\n` + bullets.map(b => `• ${b}`).join('\n');
    setScopeText(prev => prev.trim() + sectionStr);
  };

  // Build Payload
  const buildQuotationPayload = () => {
    const total = Number(projectValue || 0);
    return {
      company_code: 'kleanmax',
      quotation_number: quotationNumber.trim() || 'KM/0309',
      job_description: docTitle.trim() || 'Commercial Cleaning Proposal',
      quotation_date: toISODate(quotationDate),
      status: 'APPROVED',
      client_name: customerName.trim() || 'SRI CHANDAAN LOGISTICS',
      client_address: [addressLine1, addressLine2].filter(Boolean).join(', ') || 'Chennai',
      client_gstin: clientGstin.trim(),
      client_phone: clientPhone.trim(),
      attention_person: attentionPerson.trim(),
      notes: scopeText.trim(),
      subtotal: total,
      taxable_amount: total,
      cgst_rate: 0,
      cgst_amount: 0,
      sgst_rate: 0,
      sgst_amount: 0,
      igst_rate: 0,
      igst_amount: 0,
      total_tax: 0,
      final_amount: total,
      payment_terms: '50% advance payment required. Remaining balance due upon completion.',
      terms_and_conditions: terms.join('\n'),
      signatory_name: 'Mr. Manikandan Balamurugan',
      signatory_designation: 'Sales and Service Head',
      snapshot_json: JSON.stringify({
        quotationTitle: docTitle,
        docSubtitle,
        customerName,
        addressLine1,
        addressLine2,
        attentionPerson,
        scopeTitle,
        scopeText,
        cleanableSqft,
        ratePerSqft,
        subtotal: total,
        finalTotal: total,
        bankAccountName,
        bankName,
        bankAccountNo,
        bankBranch,
        bankIfsc,
        terms,
        satisfactionGoal,
      }),
      items: [
        {
          item_name: `${docTitle.toUpperCase()} - ${cleanableSqft || '36,000 SQFT'}`,
          description: scopeText.slice(0, 150) + '...',
          quantity: 1,
          uom: 'JOB',
          unit_price: total,
          line_total: total,
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
        c => c.company_name.toLowerCase() === customerName.trim().toLowerCase()
      );
      if (!targetCust && customerName.trim()) {
        try {
          targetCust = await api.customers.create({
            company_name: customerName.trim(),
            billing_address_line1: addressLine1.trim() || 'Chennai',
            billing_city: addressLine2.trim() || 'Chennai',
            billing_state: 'Tamil Nadu',
            billing_state_code: '33',
            billing_pincode: '600001',
            phone: clientPhone.trim() || '9941909090',
            gstin: clientGstin.trim() || undefined,
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
        setSuccessMessage(`Quotation ${res.quotation_number} updated and saved to DB!`);
      } else {
        res = await api.quotations.create(payload);
        setSavedQuotationId(res.id);
        setIsEditMode(true);
        setSuccessMessage(`Quotation ${res.quotation_number} created and saved to DB!`);
      }

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

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP ACTION BAR (Sticky with Clean Action Buttons)                     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30">
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
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse" />
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                {isEditMode ? 'Kleanmax Quotation Editor' : 'Kleanmax Commercial Cleaning Proposal Generator'}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Authentic 4-page proposal format matching Sri Chandaan Logistics specification.
            </p>
          </div>
        </div>

        {/* 4 Action Buttons */}
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
            <Download className="w-4 h-4 text-lime-400" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => setInPagePreviewOpen(true)}
            disabled={loading || saving}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Preview A4 Document"
          >
            <Eye className="w-4 h-4 text-lime-600" />
            <span>Preview A4</span>
          </button>

          <button
            onClick={handleSaveToDb}
            disabled={saving}
            className="px-4 py-2 bg-[#92D050] hover:bg-[#82bd44] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : (isEditMode ? 'Update in DB' : 'Save to DB')}</span>
          </button>
        </div>
      </div>

      {/* Editing State Banner */}
      {isEditMode && (
        <div className="bg-lime-50 border border-lime-300 text-lime-950 px-4 py-3 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 bg-lime-600 text-white rounded text-[10px] font-black uppercase tracking-wider">
              EDITING MODE
            </span>
            <span className="text-xs font-bold text-lime-950">
              Quotation: <strong className="font-mono text-lime-950">{quotationNumber}</strong> &bull; Client: <strong>{customerName || 'Selected Client'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('kleanmax_quotes')}
              className="px-2.5 py-1 text-xs font-bold text-lime-800 hover:text-lime-950 hover:bg-lime-100/60 rounded-lg transition-colors"
            >
              Back to Quotes
            </button>
            <button
              onClick={async () => {
                setSavedQuotationId(null);
                setIsEditMode(false);
                await fetchNextQuotationNumber();
                onNavigate('kleanmax_generator');
              }}
              className="px-3 py-1 bg-white border border-lime-300 hover:bg-lime-100 text-lime-900 text-xs font-extrabold rounded-lg shadow-2xs transition-all"
            >
              + Create New Quotation
            </button>
          </div>
        </div>
      )}

      {loadingEdit && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Loading quotation {quotationId} details from database...</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. QUICK HELPER TOOLS BAR (Presets & Scope Helpers)                       */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-lime-950 to-slate-900 text-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-lime-400" />
          <span className="text-xs font-black uppercase tracking-wider text-lime-300">
            Kleanmax Proposal Presets & Tools:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={insertChandaanTemplate}
            className="px-3 py-1.5 bg-lime-500/20 hover:bg-lime-500/30 text-lime-200 border border-lime-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-lime-400" />
            <span>Load Sri Chandaan Logistics Scope</span>
          </button>

          <button
            type="button"
            onClick={clearToBlankBox}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Eraser className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear to Empty Content Box</span>
          </button>

          <button
            type="button"
            onClick={() =>
              appendScopeSection('HIGH-PRESSURE JET WASHING & FACADE CLEANING', [
                'Heavy-duty high pressure jet wash for concrete and exterior wall surfaces.',
                'Remove moss, mold, grime, algae and industrial residue.',
                'Exterior glass wash with streak-free glass chemical and squeegee.',
              ])
            }
            className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Add Jet Wash Scope</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. AUTHENTIC 4-PAGE A4 EDITOR CANVAS                                      */}
      {/* ========================================================================= */}
      <div className="space-y-12">

        {/* ----------------------------------------------------------------------- */}
        {/* PAGE 1: COVER PAGE                                                      */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden relative" style={{ minHeight: '920px' }}>
          {/* Top Row: Logo left, WWW.KLEANMAX.COM box right */}
          <div className="flex items-center justify-between pt-10 px-10">
            <div className="w-64">
              <img
                src="/kleanmax/kleanmax_butterfly_logo.jpeg"
                alt="Klean Max"
                className="w-56 h-auto object-contain block"
                onError={(e: any) => { e.target.src = '/headers/header_kleanmax.png'; }}
              />
            </div>
            <div className="bg-[#92D050] text-black font-extrabold text-sm px-6 py-3 tracking-wider select-none shadow-xs">
              WWW.KLEANMAX.COM
            </div>
          </div>

          {/* Proposal Title Block */}
          <div className="pt-16 px-12 space-y-4">
            <div className="font-serif font-black text-5xl leading-tight text-black tracking-tight">
              <div>Commercial</div>
              <div>Cleaning</div>
              <div
                style={{
                  color: '#fed10c',
                  WebkitTextStroke: '1.5px black',
                  textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
                }}
              >
                Proposal
              </div>
            </div>

            <div className="pt-3 font-sans font-extrabold text-lg text-black leading-snug">
              <div>Elevating cleanliness for</div>
              <div>Business success</div>
            </div>

            {/* Editable TO: Client Section (User: "in 1st page the to address should be edittable") */}
            <div className="pt-6 font-sans space-y-2 max-w-xl">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                  Client Details (Editable):
                </span>
                {/* Search existing customer */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                    className="text-[11px] font-bold text-lime-800 bg-lime-100 hover:bg-lime-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  >
                    <Search className="w-3 h-3" />
                    <span>Search Saved Clients</span>
                  </button>
                  {showCustomerDropdown && (
                    <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={e => setCustomerSearch(e.target.value)}
                        placeholder="Search client name..."
                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg mb-2 focus:outline-none focus:border-lime-500"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {customers
                          .filter(c => c.company_name.toLowerCase().includes(customerSearch.toLowerCase()))
                          .map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectCustomer(c)}
                              className="w-full text-left text-xs p-1.5 hover:bg-lime-50 rounded font-semibold text-slate-800 flex items-center justify-between"
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

              <div className="flex items-center gap-2">
                <span className="font-black text-base text-black">TO:</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value.toUpperCase())}
                  placeholder="SRI CHANDAAN LOGISTICS"
                  className="flex-1 font-black text-base text-black bg-lime-50/50 border border-lime-300 focus:bg-white focus:border-lime-600 rounded px-2.5 py-1 focus:outline-none uppercase"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-600 w-8">ADDR:</span>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={e => setAddressLine1(e.target.value)}
                  placeholder="Address Line (optional, e.g. Chennai - 600095)"
                  className="flex-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 focus:bg-white focus:border-lime-500 rounded px-2.5 py-1 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-black">ATT:</span>
                <input
                  type="text"
                  value={attentionPerson}
                  onChange={e => setAttentionPerson(e.target.value.toUpperCase())}
                  placeholder="MR.RONAK BOTHRA ( 99419 09090)"
                  className="flex-1 font-black text-sm text-black bg-lime-50/50 border border-lime-300 focus:bg-white focus:border-lime-600 rounded px-2.5 py-1 focus:outline-none uppercase"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-bold">Quotation No:</span>
                  <input
                    type="text"
                    value={quotationNumber}
                    onChange={e => setQuotationNumber(e.target.value)}
                    className="w-24 font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center"
                    placeholder="KM/0310"
                  />
                  <button
                    type="button"
                    onClick={fetchNextQuotationNumber}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                    title="Auto-increment / fetch latest sequence number"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-bold">Date:</span>
                  <input
                    type="text"
                    value={quotationDate}
                    onChange={e => setQuotationDate(e.target.value)}
                    className="w-24 font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Lime-Green Banner (#92D050) Flush Across Bottom */}
          <div className="absolute bottom-0 left-0 right-0 w-full bg-[#92D050] text-black text-center py-6 px-4">
            <div className="font-black text-base tracking-wide mb-0.5">KLEAN MAX</div>
            <div className="font-bold text-xs mb-0.5">NO.06, JAYAM INDUSTRIAL ESTATE,</div>
            <div className="font-bold text-xs mb-3">VANAGRAM, CHENNAI – 600095.</div>
            <div className="flex justify-center items-center gap-10 font-bold text-xs">
              <span>CONTACT – 97101 48218</span>
              <span>INFO@KLEANMAX.COM</span>
            </div>
          </div>
          <div className="absolute bottom-1 right-3 text-[10px] text-slate-600 font-bold">Page 1 of 4</div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PAGE 2: ABOUT US & TEAM SUPPORT (Exact Reference Graphic)              */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden relative">
          <img
            src="/kleanmax/kleanmax_team_page.jpeg"
            alt="About Us & Team Support"
            className="w-full h-auto block object-cover"
          />
          <div className="absolute bottom-2 right-4 text-[11px] text-slate-400 font-bold bg-white/80 px-2 py-0.5 rounded">
            Page 2 of 4
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PAGE 3: SCOPE OF WORK & PROJECT VALUE (Content Filling Text Box)        */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-300 p-10 md:p-12 space-y-6 relative" style={{ minHeight: '920px' }}>
          {/* Header */}
          <div className="border-b-2 border-black pb-2 flex items-center justify-between">
            <input
              type="text"
              value={scopeTitle}
              onChange={e => setScopeTitle(e.target.value.toUpperCase())}
              placeholder="DEEP CLEANING SERVICE :"
              className="text-xl md:text-2xl font-black text-black uppercase underline tracking-tight border-none focus:outline-none w-full bg-transparent"
            />
          </div>

          {/* Dynamic Content Filling Text Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-lime-600" />
                <span>Scope of Work Content Box (Editable text expands naturally):</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {scopeText.length} characters &bull; {scopeText.split('\n').length} lines
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={scopeText}
              onChange={e => setScopeText(e.target.value)}
              placeholder="Type cleaning scope, sections, machinery guidelines and specifications here..."
              className="w-full resize-none font-mono text-xs md:text-sm text-black leading-relaxed p-4 rounded-xl border border-slate-300 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none bg-slate-50/50"
              style={{ minHeight: '380px' }}
            />
          </div>

          {/* Total Project Value Card (Teal Bar #205B73) */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <div className="font-black text-base text-black underline uppercase">
              TOTAL PROJECT VALUE:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-black whitespace-nowrap">
                  TOTAL CLEANABLE SQFT – APPROX:
                </span>
                <input
                  type="text"
                  value={cleanableSqft}
                  onChange={e => handleSqftChange(e.target.value)}
                  placeholder="36,000 SQFT"
                  className="font-black text-xs text-black bg-slate-50 border border-slate-300 rounded px-2 py-1 w-32 text-center focus:outline-none focus:border-lime-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-black whitespace-nowrap">
                  TOTAL CLEANABLE VALUE SQFT – RS.:
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={ratePerSqft}
                  onChange={e => handleRateChange(parseFloat(e.target.value) || 0)}
                  placeholder="12.00"
                  className="font-black text-xs text-black bg-slate-50 border border-slate-300 rounded px-2 py-1 w-24 text-center focus:outline-none focus:border-lime-600"
                />
              </div>
            </div>

            {/* Teal Bar #205B73 */}
            <div className="bg-[#205B73] text-white p-4 rounded-lg flex items-center justify-between shadow-md">
              <span className="font-black text-base md:text-lg tracking-wide uppercase">
                TOTAL CLEANABLE VALUE – RS. {projectValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-cyan-200">Manual Override ₹:</span>
                <input
                  type="number"
                  value={projectValue}
                  onChange={e => setProjectValue(parseFloat(e.target.value) || 0)}
                  className="w-28 bg-white/20 border border-white/40 text-white font-mono font-bold text-xs px-2 py-1 rounded text-right focus:outline-none focus:bg-white focus:text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-bold pt-4">Page 3 of 4</div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PAGE 4: BANK DETAILS, TERMS & CONDITIONS, THANK YOU                     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-300 p-10 md:p-12 space-y-8 relative" style={{ minHeight: '920px' }}>
          {/* Company's Bank Details */}
          <div className="space-y-3">
            <div className="font-black text-lg text-black underline">
              Company's Bank Details:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-black font-semibold bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-36 text-slate-500">• A/c Holder's Name:</span>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={e => setBankAccountName(e.target.value)}
                  className="flex-1 font-bold text-black bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-lime-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-36 text-slate-500">• Bank Name:</span>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="flex-1 font-bold text-black bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-lime-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-36 text-slate-500">• A/c No:</span>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={e => setBankAccountNo(e.target.value)}
                  className="flex-1 font-mono font-bold text-black bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-lime-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-36 text-slate-500">• Branch & IFS Code:</span>
                <div className="flex-1 flex gap-1">
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={e => setBankBranch(e.target.value)}
                    placeholder="ASHOK NAGAR"
                    className="w-1/2 font-bold text-black bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-lime-600"
                  />
                  <input
                    type="text"
                    value={bankIfsc}
                    onChange={e => setBankIfsc(e.target.value)}
                    placeholder="KVBL000127"
                    className="w-1/2 font-mono font-bold text-black bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-lime-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TERMS AND CONDITIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-black text-base text-black uppercase">
                TERMS AND CONDITIONS:
              </div>
              <button
                type="button"
                onClick={() => setTerms([...terms, `${terms.length + 1}. NEW TERM POLICY.`])}
                className="text-[11px] font-bold text-lime-800 bg-lime-100 hover:bg-lime-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Term</span>
              </button>
            </div>

            <div className="space-y-2">
              {terms.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
                  <span className="font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={t.replace(/^\d+\.\s*/, '')}
                    onChange={e => {
                      const updated = [...terms];
                      updated[idx] = `${idx + 1}. ${e.target.value}`;
                      setTerms(updated);
                    }}
                    className="flex-1 font-bold text-slate-800 bg-transparent border-none focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTerms(terms.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Remove term"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction statement */}
          <div className="text-center pt-6">
            <input
              type="text"
              value={satisfactionGoal}
              onChange={e => setSatisfactionGoal(e.target.value)}
              className="w-full text-center font-black text-sm md:text-base text-black bg-transparent border-none focus:outline-none uppercase"
            />
          </div>

          {/* T H A N K   Y O U... */}
          <div className="text-center pt-8 pb-4">
            <div className="font-black text-3xl md:text-4xl tracking-widest text-black uppercase select-none">
              T H A N K &nbsp; Y O U...
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-bold">Page 4 of 4</div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. INSTANT LIVE A4 PREVIEW MODAL                                          */}
      {/* ========================================================================= */}
      {inPagePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col font-sans">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-lime-400" />
                <span className="font-black text-sm">A4 Document Print Preview — Klean Max</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Download editable Microsoft Word document (.docx)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-1.5 bg-lime-600 hover:bg-lime-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Download official PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInPagePreviewOpen(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Multi-page Preview Body */}
            <div className="p-8 max-h-[82vh] overflow-y-auto space-y-8 bg-slate-100">
              {/* Preview Page 1 */}
              <div className="bg-white shadow-md rounded-2xl max-w-3xl mx-auto border border-slate-200 overflow-hidden relative" style={{ minHeight: '800px' }}>
                <div className="flex items-center justify-between pt-8 px-8">
                  <img src="/kleanmax/kleanmax_butterfly_logo.jpeg" alt="Klean Max" className="w-48 h-auto object-contain" />
                  <div className="bg-[#92D050] text-black font-extrabold text-xs px-5 py-2.5 tracking-wider">
                    WWW.KLEANMAX.COM
                  </div>
                </div>
                <div className="pt-12 px-10 space-y-3">
                  <div className="font-serif font-black text-4xl text-black leading-tight">
                    <div>Commercial</div>
                    <div>Cleaning</div>
                    <div style={{ color: '#fed10c', WebkitTextStroke: '1.2px black' }}>Proposal</div>
                  </div>
                  <div className="pt-2 font-sans font-extrabold text-sm text-black">
                    <div>Elevating cleanliness for</div>
                    <div>Business success</div>
                  </div>
                  <div className="pt-4 font-sans space-y-1 text-sm font-extrabold text-black">
                    <div>TO: &nbsp;{customerName}</div>
                    {addressLine1 && <div className="text-xs font-semibold text-slate-700">{addressLine1} {addressLine2}</div>}
                    <div>ATT: {attentionPerson}</div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-[#92D050] text-black text-center py-5 px-4">
                  <div className="font-black text-sm mb-0.5">KLEAN MAX</div>
                  <div className="font-bold text-[11px]">NO.06, JAYAM INDUSTRIAL ESTATE,</div>
                  <div className="font-bold text-[11px] mb-2">VANAGRAM, CHENNAI – 600095.</div>
                  <div className="flex justify-center gap-8 font-bold text-[11px]">
                    <span>CONTACT – 97101 48218</span>
                    <span>INFO@KLEANMAX.COM</span>
                  </div>
                </div>
                <div className="absolute bottom-1 right-3 text-[9px] text-slate-600 font-bold">Page 1 of 4</div>
              </div>

              {/* Preview Page 2 */}
              <div className="bg-white shadow-md rounded-2xl max-w-3xl mx-auto border border-slate-200 overflow-hidden relative">
                <img src="/kleanmax/kleanmax_team_page.jpeg" alt="About Us" className="w-full h-auto block" />
                <div className="absolute bottom-2 right-4 text-[10px] text-slate-400 font-bold bg-white/80 px-2 py-0.5 rounded">
                  Page 2 of 4
                </div>
              </div>

              {/* Preview Page 3 */}
              <div className="bg-white p-8 shadow-md rounded-2xl max-w-3xl mx-auto border border-slate-200 space-y-6 relative" style={{ minHeight: '800px' }}>
                <div className="font-black text-xl text-black underline uppercase border-b border-black pb-1">
                  {scopeTitle}
                </div>
                <div className="font-mono text-xs text-black whitespace-pre-line leading-relaxed">
                  {scopeText}
                </div>
                <div className="pt-6 border-t border-slate-200 space-y-2">
                  <div className="font-black text-sm text-black underline">TOTAL PROJECT VALUE:</div>
                  <div className="font-extrabold text-xs text-black">TOTAL CLEANABLE SQFT – APPROX {cleanableSqft}.</div>
                  <div className="font-extrabold text-xs text-black">TOTAL CLEANABLE VALUE SQFT – RS.{Number(ratePerSqft).toFixed(2)}</div>
                  <div className="bg-[#205B73] text-white p-3 rounded font-black text-sm uppercase">
                    TOTAL CLEANABLE VALUE – RS. {projectValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-bold pt-4">Page 3 of 4</div>
              </div>

              {/* Preview Page 4 */}
              <div className="bg-white p-8 shadow-md rounded-2xl max-w-3xl mx-auto border border-slate-200 space-y-6 relative" style={{ minHeight: '800px' }}>
                <div className="space-y-2">
                  <div className="font-black text-base text-black underline">Company's Bank Details:</div>
                  <div className="text-xs text-black space-y-1 font-medium">
                    <div>• A/c Holder's Name: <strong>{bankAccountName}</strong></div>
                    <div>• Name: <strong>{bankName} A/C – {bankAccountNo}</strong></div>
                    <div>• A/c No: <strong>{bankAccountNo}</strong></div>
                    <div>• Branch & IFS Code: <strong>{bankBranch} & {bankIfsc}</strong></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-black text-sm text-black uppercase">TERMS AND CONDITIONS:</div>
                  <ol className="list-decimal pl-5 text-xs text-black space-y-1 font-bold">
                    {terms.map((t, i) => (
                      <li key={i}>{t.replace(/^\d+\.\s*/, '')}</li>
                    ))}
                  </ol>
                </div>
                <div className="text-center font-black text-xs text-black pt-6 uppercase">
                  {satisfactionGoal}
                </div>
                <div className="text-center font-black text-2xl tracking-widest text-black uppercase pt-8">
                  T H A N K &nbsp; Y O U...
                </div>
                <div className="text-right text-[10px] text-slate-400 font-bold pt-6">Page 4 of 4</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
