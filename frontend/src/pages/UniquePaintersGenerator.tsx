import React, { useState, useEffect, useRef } from 'react';
import { Customer, Service, User } from '../services/types';
import { api } from '../services/api';
import {
  Download, FileText, Printer, Save, CheckCircle2,
  Calendar, Layers, ShieldCheck, Sparkles, Plus, Trash2, ArrowLeft,
  Search, Eye, Check, ChevronDown, Building, Phone, Mail, MapPin,
  RefreshCw, Info, HelpCircle, Image as ImageIcon, X, Paintbrush
} from 'lucide-react';
import { PdfPreviewModal } from '../components/quotation/PdfPreviewModal';

interface PaintingScopeRow {
  id: string;
  name: string;
  service_type: string;
  description: string;
  area_sqft: number;
  rate_per_sqft: number;
  amount: number;
}

interface UniquePaintersGeneratorProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

const HEADING_OPTIONS = [
  'SURFACE COATING & PAINTING PROPOSAL',
  'INTERIOR & EXTERIOR PAINTING QUOTATION',
  'EPOXY FLOORING & INDUSTRIAL COATING QUOTATION',
];

const DEFAULT_INTRO_1 = `We are glad to inform you that we are in the Painting and Cleaning industry for the past 12 years and we do Interior and exterior painting, wall graphics, 3D paintings, starting from 900 to 100000 Sq. using traditional and latest technology Unifying Expertise.`;

const DEFAULT_INTRO_2 = `After a through survey of your site we are herewith submitting our proposal for the painting of your above property.`;

const DEFAULT_MACHINERIES = [
  'Airless Sprayer with latest technology',
  'Sanding Machine',
  'Vacuum Cleaner',
  'Putty blades',
  'Sanding paper',
  'Leveling tool',
  'Ladders or Scissor Lift',
  'Banian waste',
  'Metal paste',
  'Wall putty',
  'Primer',
  'Thinner',
  'Brush and rollers',
  'Masking papers',
  'Safety equipment.',
];

const DEFAULT_TERMS = [
  'GST 18% Extra',
  '50% Payment in Advance and the balance on completion of work.',
  'Water and power supply to be provided by you.',
  'Apart from the above mentioned jobs, if yours require additional services Please inform before the issuing work order.',
  'Scaffolding charges will Extra',
];

const DEFAULT_PAINT_CATALOG: Partial<Service>[] = [
  {
    service_code: 'PNT-ASIAN-TRACTOR',
    service_name: 'ASIAN PAINT TRACTOR EMULSION',
    category: 'painting',
    company_code: 'uniquepainters',
    default_uom: 'sq_ft',
    standard_rate: 22.14,
    description: 'APPLY TWO CODE PREMIER EMULSION SHYNE INTERIOR WALLS CEILING WALL PUTTY AREA TWO CODE',
  },
  {
    service_code: 'PNT-INT-ROYALE',
    service_name: 'Premium Interior Royale Luxury Emulsion (2 Coats + Primer)',
    category: 'painting',
    company_code: 'uniquepainters',
    default_uom: 'sq_ft',
    standard_rate: 28.50,
    description: 'High-sheen anti-fungal luxury emulsion paint with surface putty smoothing and alkali-resistant primer.',
  },
  {
    service_code: 'PNT-EXT-APEX',
    service_name: 'Exterior Apex Weatherproof Acrylic Protective Coating',
    category: 'painting',
    company_code: 'uniquepainters',
    default_uom: 'sq_ft',
    standard_rate: 34.00,
    description: 'Heavy duty exterior facade weather-guard elastomeric coating with 5-year anti-fading warranty.',
  },
  {
    service_code: 'PNT-EPOXY-IND',
    service_name: 'Industrial 1000-Micron Self-Leveling Epoxy Floor System',
    category: 'painting',
    company_code: 'uniquepainters',
    default_uom: 'sq_ft',
    standard_rate: 65.00,
    description: 'Diamond floor grinding, high-adhesion epoxy primer, screed coat, and 1000-micron self-leveling aliphatic polyurethane topcoat.',
  },
  {
    service_code: 'PNT-DAMP-PROOF',
    service_name: 'Terrace & Parapet Elastomeric Waterproofing Membrane',
    category: 'painting',
    company_code: 'uniquepainters',
    default_uom: 'sq_ft',
    standard_rate: 48.00,
    description: '3-coat fiber-mesh reinforced elastomeric waterproofing coating resistant to standing water and UV.',
  },
  {
    service_code: 'PNT-TEX-STENCIL',
    service_name: 'Architectural Texture & Metallic Stencil Accent Finish',
    category: 'painting',
    company_code: 'uniquepainters',
    default_uom: 'sq_ft',
    standard_rate: 75.00,
    description: 'Custom decorative textured plaster finish, roller patterns, and metallic glaze finish.',
  },
];

// Helper to format Date to DD/MM/YYYY
export const formatToIndianDate = (dateObj: Date = new Date()): string => {
  const d = String(dateObj.getDate()).padStart(2, '0');
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
};

// Helper to convert DD/MM/YYYY to ISO YYYY-MM-DD
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

// Helper to convert ISO YYYY-MM-DD to DD/MM/YYYY
export const fromISODate = (isoStr: string): string => {
  if (!isoStr) return formatToIndianDate();
  const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return isoStr;
};

export const UniquePaintersGenerator: React.FC<UniquePaintersGeneratorProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // 1. Heading Option & Title (Directly Editable)
  const [selectedHeadingOption, setSelectedHeadingOption] = useState<string>('SURFACE COATING & PAINTING PROPOSAL');
  const [quotationTitle, setQuotationTitle] = useState<string>('SURFACE COATING & PAINTING PROPOSAL');

  // 2. Metadata: Quotation No & Date (Indian DD/MM/YYYY)
  const [quotationNo, setQuotationNo] = useState<string>('UNP/2026/001');
  const [quotationDate, setQuotationDate] = useState<string>(formatToIndianDate());

  // 3. Customer Details ("TO :-") (Directly Editable)
  const [customerName, setCustomerName] = useState<string>('TRUE NUTRITION');
  const [addressLine1, setAddressLine1] = useState<string>('KODUNGAIYUR');
  const [addressLine2, setAddressLine2] = useState<string>('Chennai - 600118, Tamil Nadu');
  const [contactPerson, setContactPerson] = useState<string>('Mr. Dinesh (Avadi Site)');
  const [phone, setPhone] = useState<string>('07676131368');
  const [salutation, setSalutation] = useState<string>('DEAR SIR;');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerList, setCustomerList] = useState<Customer[]>([]);

  // 4. Content Blocks (Directly Editable)
  const [introText1, setIntroText1] = useState<string>(DEFAULT_INTRO_1);
  const [introText2, setIntroText2] = useState<string>(DEFAULT_INTRO_2);

  // 5. Scope Rows (Table: S.No, Description, Amount in INR)
  const [rows, setRows] = useState<PaintingScopeRow[]>([
    {
      id: 'row_1',
      name: 'INTERIOR WALL PAINTING',
      service_type: 'ASIAN PAINT TRACTOR EMULSION',
      description: 'APPLY TWO CODE PREMIER EMULSION SHYNE INTERIOR WALLS CEILING WALL PUTTY AREA TWO CODE',
      area_sqft: 4200,
      rate_per_sqft: 22.14,
      amount: 93000,
    }
  ]);

  // Tax
  const [applyTax, setApplyTax] = useState<boolean>(false);
  const [taxPercent, setTaxPercent] = useState<number>(18);

  // 6. Machineries and consumables List (Editable)
  const [machineries, setMachineries] = useState<string[]>(DEFAULT_MACHINERIES);
  const [newMachineryInput, setNewMachineryInput] = useState<string>('');

  // 7. Terms & Conditions (Editable)
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);
  const [newTermInput, setNewTermInput] = useState<string>('');

  // Call notice & Satisfaction
  const [callNotice, setCallNotice] = useState<string>('Looking forward for your favourable orders. Please call - 9500065813 / 9710148218.');
  const [satisfactionGoal, setSatisfactionGoal] = useState<string>('Your satisfaction is our Goal. Looking forward for your favourable orders.');

  // Signatory
  const [sigCompany, setSigCompany] = useState<string>('Unique Painters');
  const [sigName, setSigName] = useState<string>('K. SRIDHAR');
  const [sigTitle, setSigTitle] = useState<string>('Operations Head');
  const [sigPhones, setSigPhones] = useState<string>('9710148218 / 7338882034');

  // Search & Catalog
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // State & Feedback
  const [saving, setSaving] = useState<boolean>(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [inPagePreviewOpen, setInPagePreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInitialData = async () => {
    try {
      try {
        const nextNumRes = await api.quotations.getNextNumber('uniquepainters', 'short');
        if (nextNumRes && nextNumRes.next_number) {
          setQuotationNo(nextNumRes.next_number);
        }
      } catch (e) {
        console.warn('Fallback sequence number:', e);
      }
      const custs = await api.customers.list();
      setCustomerList(custs);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const target = customerList.find((c) => c.id === custId);
    if (target) {
      setCustomerName(target.company_name);
      setAddressLine1(target.billing_address_line1 || '');
      setAddressLine2(`${target.billing_city || ''}${target.billing_pincode ? ` - ${target.billing_pincode}` : ''}`);
      setContactPerson(target.contact_person || '');
      setPhone(target.phone || '');
    }
  };

  const handleSelectHeadingOption = (opt: string) => {
    setSelectedHeadingOption(opt);
    setQuotationTitle(opt);
  };

  // Calculations
  const subtotal = rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const gstAmount = applyTax ? Math.round((subtotal * taxPercent) / 100) : 0;
  const finalTotal = subtotal + gstAmount;

  // Add Scope Row from Catalog
  const handleAddCatalogItem = (item: Partial<Service>) => {
    const newRow: PaintingScopeRow = {
      id: `row_${Date.now()}`,
      name: (item.service_name || 'PAINTING SCOPE').toUpperCase(),
      service_type: item.service_code || 'ASIAN PAINTS',
      description: item.description || '',
      area_sqft: 2000,
      rate_per_sqft: Number(item.standard_rate) || 25,
      amount: Math.round(2000 * (Number(item.standard_rate) || 25)),
    };
    setRows((prev) => [...prev, newRow]);
    setProductSearchQuery('');
    setSearchDropdownOpen(false);
  };

  const handleAddBlankRow = () => {
    const newRow: PaintingScopeRow = {
      id: `row_${Date.now()}`,
      name: `PAINTING WORK AREA ${rows.length + 1}`,
      service_type: 'ASIAN PAINT TRACTOR EMULSION',
      description: 'APPLY TWO COAT PREMIER EMULSION SHYNE INTERIOR WALLS CEILING WALL PUTTY AREA TWO COAT',
      area_sqft: 1500,
      rate_per_sqft: 22,
      amount: 33000,
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      alert('A quotation must contain at least one specification row.');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof PaintingScopeRow, val: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: val };
        if (field === 'area_sqft' || field === 'rate_per_sqft') {
          const a = field === 'area_sqft' ? Number(val) : r.area_sqft;
          const rt = field === 'rate_per_sqft' ? Number(val) : r.rate_per_sqft;
          if (a > 0 && rt > 0) {
            updated.amount = Math.round(a * rt);
          }
        }
        return updated;
      })
    );
  };

  // Machineries
  const handleAddMachinery = () => {
    if (!newMachineryInput.trim()) return;
    setMachineries((prev) => [...prev, newMachineryInput.trim()]);
    setNewMachineryInput('');
  };

  const handleRemoveMachinery = (index: number) => {
    setMachineries((prev) => prev.filter((_, i) => i !== index));
  };

  // Terms
  const handleAddTerm = () => {
    if (!newTermInput.trim()) return;
    setTerms((prev) => [...prev, newTermInput.trim()]);
    setNewTermInput('');
  };

  const handleRemoveTerm = (index: number) => {
    setTerms((prev) => prev.filter((_, i) => i !== index));
  };

  // Save to DB
  const handleSaveToDatabase = async (): Promise<string | null> => {
    setSaving(true);
    try {
      let targetCustId = selectedCustomerId;
      if (!targetCustId) {
        const found = customerList.find(
          (c) => c.company_name.toLowerCase().trim() === customerName.toLowerCase().trim()
        );
        if (found) {
          targetCustId = found.id;
        } else {
          const createdCust = await api.customers.create({
            company_name: customerName.trim() || 'TRUE NUTRITION',
            billing_address_line1: addressLine1.trim() || 'KODUNGAIYUR',
            billing_city: addressLine2.split(',')[0].trim() || 'Chennai',
            billing_state: 'Tamil Nadu',
            billing_state_code: '33',
            billing_pincode: '600118',
            contact_person: contactPerson,
            phone: phone.trim() || '07676131368',
          });
          targetCustId = createdCust.id;
          setCustomerList((prev) => [...prev, createdCust]);
        }
      }

      const payloadSections = rows.map((r, idx) => ({
        section_order: idx + 1,
        section_name: r.name,
        service_name: r.service_type,
        length: Number(r.area_sqft) || 1,
        breadth: 1,
        measurement_unit: 'ft',
        calculated_area: Number(r.area_sqft) || 1,
        repetitions: 1,
        billable_area: Number(r.area_sqft) || 1,
        billable_uom: 'sq_ft',
        rate_source: 'catalogue',
        original_catalogue_rate: Number(r.rate_per_sqft) || 0,
        applied_rate: Number(r.rate_per_sqft) || 0,
        discount_percent: 0,
        line_total: Number(r.amount) || 0,
        notes: r.description,
      }));

      const payload = {
        customer_id: targetCustId,
        company_code: 'uniquepainters',
        quotation_number: quotationNo.trim() || 'UNP/2026/001',
        quotation_type: 'area_based',
        quotation_date: toISODate(quotationDate),
        job_description: `${introText1}\n\n${introText2}`,
        notes: callNotice,
        terms_and_conditions: terms.join('\n'),
        items: [],
        sections: payloadSections,
        tax_rate: applyTax ? taxPercent : 0,
        discount_type: 'none',
        discount_value: 0,
      };

      const res = await api.quotations.create(payload);
      setSavedQuoteId(res.id);
      setToastMsg(`Quotation ${res.quotation_number} saved successfully!`);
      return res.id;
    } catch (err: any) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to save quotation');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      let quoteId = savedQuoteId;
      if (!quoteId) {
        quoteId = await handleSaveToDatabase();
      }
      if (quoteId) {
        setToastMsg('Generating authentic Word (.docx) proposal matching sample...');
        await api.quotations.downloadDocx(quoteId, `${quotationNo.replace('/', '_')}_UniquePainters.docx`);
        setToastMsg('Word (.docx) proposal downloaded successfully!');
      }
    } catch (err: any) {
      console.error('Download docx error:', err);
      alert(err.message || 'Failed to download Word document');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      let quoteId = savedQuoteId;
      if (!quoteId) {
        quoteId = await handleSaveToDatabase();
      }
      if (quoteId) {
        setToastMsg('Generating official PDF with authentic letterhead...');
        await api.quotations.downloadPdf(quoteId, `${quotationNo.replace('/', '_')}_UniquePainters.pdf`);
        setToastMsg('Official PDF downloaded successfully!');
      }
    } catch (err: any) {
      console.error('Download PDF error:', err);
      alert(err.message || 'Failed to download PDF');
    }
  };

  const handleOpenA4Preview = async () => {
    let quoteId = savedQuoteId;
    if (!quoteId) {
      quoteId = await handleSaveToDatabase();
    }
    if (quoteId) {
      setInPagePreviewOpen(true);
    }
  };

  const handlePrint = async () => {
    let quoteId = savedQuoteId;
    if (!quoteId) {
      quoteId = await handleSaveToDatabase();
    }
    if (quoteId) {
      const printWindow = window.open(api.quotations.getHtmlUrl(quoteId), '_blank');
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div className="bg-purple-50 border border-purple-300 text-purple-950 px-4 py-3 rounded-2xl shadow-sm flex items-center justify-between animate-fade-in sticky top-20 z-30">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-purple-700 font-extrabold text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('uniquepainters_quotes')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="View Past Quotations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                Unique Painters Quotation Generator
              </h1>
            </div>
            <p className="text-[11px] text-slate-500">
              Direct in-sheet editing with balanced margins & clean quotation table.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Word (.docx) */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={saving}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            title="Download Word (.docx) matching authentic format"
          >
            <FileText className="w-4 h-4" />
            <span>Download Word (.docx)</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            title="Download official PDF with letterhead"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Download PDF</span>
          </button>

          {/* Preview A4 */}
          <button
            type="button"
            onClick={handleOpenA4Preview}
            disabled={saving}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-purple-600" />
            <span>Preview A4</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={saving}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print</span>
          </button>

          {/* Save to DB */}
          <button
            type="button"
            onClick={() => handleSaveToDatabase()}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save to DB'}</span>
          </button>
        </div>
      </div>

      {/* Main Quotation Document Sheets: Balanced Equal Corners */}
      <div className="space-y-10">

        {/* ========================================================================= */}
        {/* SHEET 1: PROPOSAL TABLE & SCOPE (WITH HEADER BANNER)                     */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-300 rounded-2xl shadow-lg p-8 md:p-10 text-slate-800 space-y-6 transition-all">
          
          {/* Header Banner - Page 1 ALONE, balanced inside equal corners */}
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 text-center shadow-xs">
            <img
              src="/headers/header_uniquepainters.png"
              alt="Unique Painters Official Letterhead Header"
              className="w-full max-h-28 object-contain mx-auto block select-none"
            />
          </div>

          {/* Heading Selector + In-place Editable Heading */}
          <div className="bg-purple-50/50 border border-purple-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Quotation Type Heading:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {HEADING_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectHeadingOption(opt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedHeadingOption === opt
                        ? 'bg-purple-700 text-white font-black shadow-xs ring-2 ring-purple-400'
                        : 'bg-white text-slate-700 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <input
                type="text"
                value={quotationTitle}
                onChange={(e) => setQuotationTitle(e.target.value.toUpperCase())}
                className="w-full text-center text-base md:text-lg font-black text-slate-900 bg-white border border-purple-300 rounded-lg py-2 px-3 tracking-wide uppercase focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Metadata & "To :-" Client Address Grid (Equal Balanced Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 pb-4 border-b border-slate-200">
            {/* Left: Client Address ("TO :-") */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase text-slate-900 tracking-wider">
                  To,
                </span>
                {customerList.length > 0 && (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <option value="">Quick Pick Existing Client...</option>
                    {customerList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
                  placeholder="CLIENT / COMPANY NAME (e.g. TRUE NUTRITION)"
                  className="w-full text-sm font-black text-slate-900 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-500 uppercase tracking-wide bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Address Line 1 (e.g. KODUNGAIYUR)"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="City, State - Pincode"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone No (e.g. 07676131368)"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Attn: Person (e.g. Mr. Dinesh)"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-1">
                <input
                  type="text"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value.toUpperCase())}
                  placeholder="DEAR SIR;"
                  className="w-36 font-black text-xs text-slate-900 border border-slate-300 rounded-lg p-1.5 uppercase"
                />
              </div>
            </div>

            {/* Right: Quotation Number & Date in DD/MM/YYYY */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-center space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  DATE:
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                    placeholder="DD/MM/YYYY (e.g. 21/10/2025)"
                    className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded-lg p-2.5 bg-white pr-9 focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="date"
                    tabIndex={-1}
                    value={toISODate(quotationDate)}
                    onChange={(e) => setQuotationDate(fromISODate(e.target.value))}
                    className="absolute right-2 opacity-60 hover:opacity-100 cursor-pointer w-6 h-6 border-none bg-transparent"
                    title="Select date from calendar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  QUOTATION NO:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quotationNo}
                    onChange={(e) => setQuotationNo(e.target.value.toUpperCase())}
                    className="w-full text-sm font-mono font-black text-slate-900 border border-slate-300 rounded-lg p-2 bg-white uppercase focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await api.quotations.getNextNumber('uniquepainters', 'short');
                      if (res?.next_number) setQuotationNo(res.next_number);
                    }}
                    className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700"
                    title="Fetch latest sequence from database"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Intro Textboxes (Directly Editable) */}
          <div className="space-y-2">
            <textarea
              rows={2}
              value={introText1}
              onChange={(e) => setIntroText1(e.target.value)}
              className="w-full text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg p-3 leading-relaxed focus:ring-1 focus:ring-purple-500 text-justify"
            />
            <textarea
              rows={2}
              value={introText2}
              onChange={(e) => setIntroText2(e.target.value)}
              className="w-full text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg p-3 leading-relaxed focus:ring-1 focus:ring-purple-500 text-justify"
            />
          </div>

          {/* Product / Paint System Search Bar */}
          <div className="space-y-2 relative" ref={searchContainerRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-purple-600" />
                <span>Search & Add Painting Service / System:</span>
              </label>
              <button
                type="button"
                onClick={handleAddBlankRow}
                className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Custom Blank Row</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search painting catalog (e.g. Asian Paint Tractor Emulsion, Royale Emulsion, Epoxy Flooring, Exterior Apex)..."
                value={productSearchQuery}
                onChange={(e) => {
                  setProductSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                onFocus={() => setSearchDropdownOpen(true)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
            </div>

            {/* Dropdown Results */}
            {searchDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl z-40 max-h-64 overflow-y-auto divide-y divide-slate-100">
                {DEFAULT_PAINT_CATALOG.filter(
                  (p) =>
                    !productSearchQuery ||
                    p.service_name?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                    p.description?.toLowerCase().includes(productSearchQuery.toLowerCase())
                ).map((prod) => (
                  <div
                    key={prod.service_code}
                    onClick={() => handleAddCatalogItem(prod)}
                    className="p-3 hover:bg-purple-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900 uppercase">
                        {prod.service_name}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {prod.description}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-purple-900">
                        ₹{prod.standard_rate?.toFixed(2)} / sq.ft
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                        + Add
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Neat Proposal Table: Elegant Alignment & Borders */}
          <div className="rounded-xl overflow-hidden border border-slate-300 shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
                  <th className="p-3 text-center w-14 border-r border-slate-800">S. No</th>
                  <th className="p-3 border-r border-slate-800">Description</th>
                  <th className="p-3 text-right w-44 border-r border-slate-800">Amount in INR</th>
                  <th className="p-3 text-center w-12">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                    <td className="p-3.5 text-center font-bold text-slate-500 align-top border-r border-slate-200">
                      {idx + 1}.
                    </td>
                    <td className="p-3.5 space-y-2 align-top border-r border-slate-200">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => handleUpdateRow(r.id, 'name', e.target.value.toUpperCase())}
                        placeholder="SCOPE TITLE (e.g. INTERIOR WALL PAINTING)"
                        className="w-full font-black text-slate-900 border border-slate-300 rounded-md p-1.5 text-xs uppercase focus:ring-1 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        value={r.service_type}
                        onChange={(e) => handleUpdateRow(r.id, 'service_type', e.target.value.toUpperCase())}
                        placeholder="BRAND / SPECIFICATION (e.g. ASIAN PAINT TRACTOR EMULSION)"
                        className="w-full font-bold text-purple-900 border border-purple-200 rounded-md p-1.5 text-xs uppercase bg-purple-50/30"
                      />
                      <textarea
                        rows={2}
                        value={r.description}
                        onChange={(e) => handleUpdateRow(r.id, 'description', e.target.value)}
                        placeholder="Detailed coating specification (e.g. APPLY TWO CODE PREMIER EMULSION...)"
                        className="w-full text-[11px] text-slate-700 border border-slate-200 rounded-md p-1.5 leading-relaxed"
                      />
                      <div className="flex items-center gap-4 text-[11px] text-slate-600 bg-white border border-slate-200 p-2 rounded-md">
                        <label className="flex items-center gap-1 font-semibold">
                          <span>Area:</span>
                          <input
                            type="number"
                            value={r.area_sqft}
                            onChange={(e) => handleUpdateRow(r.id, 'area_sqft', Number(e.target.value))}
                            className="w-20 font-bold border border-slate-300 rounded p-1 text-center bg-slate-50"
                          />
                          <span>sq.ft</span>
                        </label>
                        <label className="flex items-center gap-1 font-semibold">
                          <span>Rate: ₹</span>
                          <input
                            type="number"
                            step="0.1"
                            value={r.rate_per_sqft}
                            onChange={(e) => handleUpdateRow(r.id, 'rate_per_sqft', Number(e.target.value))}
                            className="w-20 font-bold border border-slate-300 rounded p-1 text-center bg-slate-50"
                          />
                          <span>/ sq.ft</span>
                        </label>
                      </div>
                    </td>
                    <td className="p-3.5 text-right align-top border-r border-slate-200">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Line Amount</span>
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-bold text-slate-700">RS.</span>
                          <input
                            type="number"
                            value={r.amount}
                            onChange={(e) => handleUpdateRow(r.id, 'amount', Number(e.target.value))}
                            className="w-32 font-black text-sm text-right border border-slate-300 rounded-md p-1.5 bg-white text-slate-900 focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center align-top">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(r.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Optional Tax Checkbox Row */}
                <tr className="bg-slate-50 border-t border-slate-200 text-xs">
                  <td colSpan={2} className="p-3 text-right font-bold text-slate-600 border-r border-slate-200">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyTax}
                        onChange={(e) => setApplyTax(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Apply 18% GST Extra to Total Value</span>
                    </label>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-700 border-r border-slate-200">
                    {applyTax ? `RS.${gstAmount.toLocaleString('en-IN')}` : 'GST 18% Extra (As Quoted)'}
                  </td>
                  <td></td>
                </tr>

                {/* TOTAL PROJECT VALUE Row */}
                <tr className="bg-purple-100/90 font-black text-sm border-t-2 border-purple-900">
                  <td colSpan={2} className="p-3.5 text-right uppercase tracking-wider text-slate-900 border-r border-purple-200">
                    TOTAL PROJECT VALUE :
                  </td>
                  <td className="p-3.5 text-right text-purple-950 font-black text-base whitespace-nowrap border-r border-purple-200">
                    RS.{finalTotal.toLocaleString('en-IN')}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SHEET 2: MACHINERIES, CONSUMABLES, TERMS & SIGNATURE (NO HEADER BANNER)  */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-300 rounded-2xl shadow-lg p-8 md:p-10 text-slate-800 space-y-6 transition-all">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 pb-1">
            — Page 2 of 3: Machineries & Consumables Specification —
          </div>

          {/* List of Machineries and consumables (Directly Editable) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase underline tracking-wide">
                List of Machineries and consumables:
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add item..."
                  value={newMachineryInput}
                  onChange={(e) => setNewMachineryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMachinery()}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 w-48"
                />
                <button
                  type="button"
                  onClick={handleAddMachinery}
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded-lg"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {machineries.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                    <span>{m}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMachinery(idx)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Call Notice (Directly Editable) */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Call Order Notice:</label>
            <input
              type="text"
              value={callNotice}
              onChange={(e) => setCallNotice(e.target.value)}
              className="w-full text-xs font-black text-slate-900 border border-slate-300 rounded-lg p-2.5 bg-purple-50/40"
            />
          </div>

          {/* Terms & Conditions (Directly Editable) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase underline tracking-wide">
                Terms & Conditions:
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add term..."
                  value={newTermInput}
                  onChange={(e) => setNewTermInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTerm()}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 w-48"
                />
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded-lg"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {terms.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                    <span>{t}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(idx)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Closing */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Satisfaction Statement:</label>
            <input
              type="text"
              value={satisfactionGoal}
              onChange={(e) => setSatisfactionGoal(e.target.value)}
              className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 bg-white"
            />
          </div>

          {/* Signatory Block (Direct In-Sheet Editing) */}
          <div className="flex flex-wrap justify-between items-end pt-8 border-t border-slate-300 gap-6">
            <div className="space-y-1.5 text-xs">
              <div className="text-slate-600 font-bold">Regards</div>
              <input
                type="text"
                value={sigCompany}
                onChange={(e) => setSigCompany(e.target.value)}
                className="font-black text-sm text-purple-900 border border-slate-300 rounded p-1 w-48 block"
              />
              <input
                type="text"
                value={sigName}
                onChange={(e) => setSigName(e.target.value)}
                className="font-bold text-xs text-slate-800 border border-slate-300 rounded p-1 w-48 block"
              />
              <input
                type="text"
                value={sigTitle}
                onChange={(e) => setSigTitle(e.target.value)}
                className="text-xs text-slate-600 border border-slate-300 rounded p-1 w-48 block"
              />
              <input
                type="text"
                value={sigPhones}
                onChange={(e) => setSigPhones(e.target.value)}
                className="text-xs text-slate-600 border border-slate-300 rounded p-1 w-48 block font-mono"
              />
            </div>

            <div className="text-right space-y-10">
              <div className="text-xs font-black text-slate-900">Client Signature</div>
              <div className="w-56 border-t-2 border-slate-400 ml-auto"></div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SHEET 3: FUTURE TECHNOLOGY SHOWCASE (NO HEADER BANNER)                    */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-300 rounded-2xl shadow-lg p-8 md:p-10 text-slate-800 space-y-6 transition-all">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 pb-1">
            — Page 3 of 3: Future Painting & Wall-Tech Innovation —
          </div>

          {/* 3D Wall Printing Machine */}
          <div className="space-y-3">
            <h3 className="text-xs md:text-sm font-black text-purple-700 uppercase underline tracking-wide">
              UPCOMING OUR FUTURE TECHNOLOGY; 3D WALL PRINTING MACHINE:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center shadow-xs">
                <img
                  src="/unique_painters/wall_printing_machine_1.jpeg"
                  alt="3D Wall Printing Machine"
                  className="max-h-56 mx-auto rounded-lg object-contain"
                />
                <div className="text-xs font-bold text-slate-700 mt-2">
                  High-Precision 3D Vertical Wall Printer
                </div>
                <div className="text-[10px] text-slate-400">
                  Industrial direct-to-wall automated UV inkjet system
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center shadow-xs">
                <img
                  src="/unique_painters/wall_printing_machine_2.jpeg"
                  alt="3D Wall Printing Sample"
                  className="max-h-56 mx-auto rounded-lg object-contain"
                />
                <div className="text-xs font-bold text-slate-700 mt-2">
                  Direct-on-Wall Architectural Graphic Application
                </div>
                <div className="text-[10px] text-slate-400">
                  High-resolution 3D murals for corporate and luxury spaces
                </div>
              </div>
            </div>
          </div>

          {/* Robotic Plastering and Painting Machine */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs md:text-sm font-black text-purple-700 uppercase underline tracking-wide">
              ROBOTIC PLASTERING AND PAINTING MACHINE ;
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center shadow-xs">
                <img
                  src="/unique_painters/robotic_plastering_1.jpeg"
                  alt="Robotic Plastering Machine"
                  className="max-h-56 mx-auto rounded-lg object-contain"
                />
                <div className="text-xs font-bold text-slate-700 mt-2">
                  Robotic Surface Leveling & Plastering Unit
                </div>
                <div className="text-[10px] text-slate-400">
                  High-efficiency automated plaster render & smoothing
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center shadow-xs">
                <img
                  src="/unique_painters/robotic_plastering_2.jpeg"
                  alt="Robotic Spraying System"
                  className="max-h-56 mx-auto rounded-lg object-contain"
                />
                <div className="text-xs font-bold text-slate-700 mt-2">
                  Automated Mechanized Spray Coating System
                </div>
                <div className="text-[10px] text-slate-400">
                  Uniform micron-controlled paint & protective finish
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Official In-Page A4 Preview Modal (Matches Kleanmax Pro) */}
      <PdfPreviewModal
        quotationId={savedQuoteId}
        isOpen={inPagePreviewOpen}
        onClose={() => setInPagePreviewOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default UniquePaintersGenerator;
