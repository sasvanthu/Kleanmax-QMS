import React, { useState, useEffect, useRef } from 'react';
import { Customer, Service, Quotation, User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Download, Eye, Save, Sparkles, Plus, Trash2,
  RefreshCw, CheckCircle2, ArrowLeft, Search, Check,
  ShieldCheck, Lock, X, Layers, AlignLeft, Calculator,
  Wrench, Building2
} from 'lucide-react';

export interface QuotationEditProps {
  quotationId?: string | null;
  initialCompanyCode?: string;
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export interface EditableItem {
  id: string;
  is_header?: boolean;
  item_name: string;
  description?: string;
  quantity: number;
  uom: string;
  rate: number;
  total: number;
  hsn_sac?: string;
}

const COMPANIES = [
  { code: 'kleanmaxpro', name: 'Klean Max Pro', badge: 'bg-amber-400 text-slate-950', border: 'border-amber-400', banner: '/headers/header_kleanmaxpro.png', prefix: 'KMP' },
  { code: 'kleanmax', name: 'Kleanmax', badge: 'bg-sky-500 text-slate-950', border: 'border-sky-400', banner: '/headers/header_kleanmax.png', prefix: 'KLM' },
  { code: 'cleantech', name: 'Cleantech Services', badge: 'bg-teal-500 text-slate-950', border: 'border-teal-400', banner: '/headers/header_cleantech.png', prefix: 'CTS' },
  { code: 'uniquepainters', name: 'Unique Painters', badge: 'bg-purple-600 text-white', border: 'border-purple-400', banner: '/headers/header_uniquepainters.png', prefix: 'UNP' },
];

const HEADING_PRESETS: Record<string, string[]> = {
  kleanmaxpro: [
    'MONTHLY RENTAL QUOTATION',
    'SALES QUOTATION',
    'SERVICE QUOTATION',
    'COMMERCIAL CLEANING QUOTATION'
  ],
  kleanmax: [
    'COMMERCIAL CLEANING PROPOSAL',
    'SPARES AND SERVICE QUOTATION',
    'EQUIPMENT SALES QUOTATION',
    'REPAIR & OVERHAUL QUOTATION'
  ],
  cleantech: [
    'SERVICE QUOTATION',
    'SPARES AND SERVICE QUOTATION',
    'SOLAR PANEL CLEANING PROPOSAL',
    'FACADE CLEANING QUOTATION',
    'AMC CONTRACT QUOTATION'
  ],
  uniquepainters: [
    'SURFACE COATING & PAINTING QUOTATION',
    'EPOXY FLOORING PROPOSAL',
    'INDUSTRIAL REPAINTING QUOTATION',
    'COMMERCIAL EXTERIOR COATING'
  ]
};

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

export const QuotationEdit: React.FC<QuotationEditProps> = ({
  quotationId,
  initialCompanyCode = 'kleanmaxpro',
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  const [companyCode, setCompanyCode] = useState<string>(initialCompanyCode);
  const [currentCompany, setCurrentCompany] = useState<CompanySetting | null>(null);

  // Document Heading & Metadata
  const [headingText, setHeadingText] = useState('MONTHLY RENTAL QUOTATION');
  const [quotationNumber, setQuotationNumber] = useState('KMP/0001');
  const [quotationDate, setQuotationDate] = useState(formatToIndianDate());

  // Client Details
  const [clientName, setClientName] = useState('ABANS FACILITY MANAGEMENT');
  const [clientAddress, setClientAddress] = useState('Chennai');
  const [attentionPerson, setAttentionPerson] = useState('Att : Mr. Rajesh');
  const [clientGstin, setClientGstin] = useState('33AABCT9988Z1Z5');
  const [clientPhone, setClientPhone] = useState('+91 98401 22334');

  // Customer Search & Directory
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Products Search & Catalogue
  const [catalogueServices, setCatalogueServices] = useState<Service[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Items Table
  const [items, setItems] = useState<EditableItem[]>([]);

  // Word-style Continuous Flow Text (For Cleaning Proposals / Kleanmax)
  const [mode, setMode] = useState<'table' | 'word_scope'>('table');
  const [scopeText, setScopeText] = useState('');
  const [cleanableSqft, setCleanableSqft] = useState('1,38,000 SQFT');
  const [lumpSumValue, setLumpSumValue] = useState<number>(480000.0);
  const [specialNotes, setSpecialNotes] = useState('THIS PRICE NOT INCLUDING OF BOOM LIFT. ITS CUSTOMER SCOPE. WHAT CHARGES WILL BE ADDED WE WILL RAISE THE INVOICE SEPARATELY.');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Taxes & Totals
  const [applyGst, setApplyGst] = useState(true);
  const [gstRate, setGstRate] = useState(18); // 9% CGST + 9% SGST

  // Terms & Conditions
  const [terms, setTerms] = useState<string[]>([
    'Price Validity : Quoted prices are valid for 30 days from quotation date.',
    'Payment Terms : As agreed mutually.',
    'Delivery & Service : Prompt on-site mobilization.',
    'Warranty : Standard replacement warranty for equipment/spares.'
  ]);

  // State Management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeQuotationId, setActiveQuotationId] = useState<string | null>(quotationId || null);

  // Auto-resize textarea when scopeText changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(500, textareaRef.current.scrollHeight)}px`;
    }
  }, [scopeText]);

  // Load existing quote if quotationId passed, or initialize
  useEffect(() => {
    initEditor();
  }, [quotationId, companyCode]);

  const initEditor = async () => {
    setLoading(true);
    try {
      const [compRes, custList, servList] = await Promise.all([
        api.company.get(companyCode).catch(() => null),
        api.customers.list().catch(() => []),
        api.services.list({ company_code: companyCode }).catch(() => []),
      ]);

      if (compRes) setCurrentCompany(compRes);
      if (custList) setCustomers(custList);
      if (servList) setCatalogueServices(servList);

      if (quotationId) {
        // Load existing quotation data
        const quote = await api.quotations.get(quotationId);
        if (quote) {
          setActiveQuotationId(quote.id);
          if (quote.company_code && quote.company_code !== companyCode) {
            setCompanyCode(quote.company_code);
          }
          setQuotationNumber(quote.quotation_number || 'QUOTE-001');
          setHeadingText(quote.job_description || 'QUOTATION');
          if (quote.quotation_date) {
            setQuotationDate(fromISODate(String(quote.quotation_date).split('T')[0]));
          }

          if (quote.customer) {
            setClientName(quote.customer.company_name);
            setClientAddress(
              [quote.customer.billing_address_line1, quote.customer.billing_city]
                .filter(Boolean)
                .join(', ') || quote.customer.billing_city || 'Chennai'
            );
            if (quote.customer.contact_person) setAttentionPerson(`Att : ${quote.customer.contact_person}`);
            if (quote.customer.gstin) setClientGstin(quote.customer.gstin);
            if (quote.customer.phone) setClientPhone(quote.customer.phone);
          }

          // Items or Scope text
          if (quote.items && quote.items.length > 0) {
            setItems(
              quote.items.map((it: any, idx: number) => ({
                id: it.id || `item-${idx}`,
                is_header: it.description?.startsWith('HEADER:'),
                item_name: it.item_name,
                description: it.description?.replace(/^HEADER:\s*/, '') || '',
                quantity: Number(it.quantity) || 1,
                uom: it.uom || 'NOS',
                rate: Number(it.applied_rate ?? it.unit_price ?? 0),
                total: Number(it.line_total) || 0,
                hsn_sac: it.hsn_sac_code || '8479',
              }))
            );
            setMode('table');
          } else if (quote.notes) {
            setScopeText(quote.notes);
            setLumpSumValue(Number(quote.final_amount || quote.subtotal || 480000));
            setMode('word_scope');
          }

          if (quote.terms_and_conditions) {
            setTerms(quote.terms_and_conditions.split('\n').filter(Boolean));
          }

          if (quote.snapshot_json) {
            try {
              const snap = JSON.parse(quote.snapshot_json);
              if (snap.cleanable_sqft) setCleanableSqft(snap.cleanable_sqft);
              if (snap.special_notes) setSpecialNotes(snap.special_notes);
            } catch (e) {
              // ignore
            }
          }
        }
      } else {
        // Fetch next sequential quotation number
        try {
          const nextNo = await api.quotations.getNextNumber(companyCode);
          const numStr = typeof nextNo === 'object' && (nextNo as any)?.next_number
            ? (nextNo as any).next_number
            : String(nextNo);
          setQuotationNumber(numStr);
        } catch (e) {
          // fallback
          const prefix = COMPANIES.find(c => c.code === companyCode)?.prefix || 'QMS';
          setQuotationNumber(`${prefix}/0001`);
        }

        // Set default heading based on company
        const presets = HEADING_PRESETS[companyCode] || [];
        if (presets.length > 0) setHeadingText(presets[0]);
      }
    } catch (err) {
      console.error('Error loading editor:', err);
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
    if (c.contact_person) setAttentionPerson(`Att : ${c.contact_person}`);
    if (c.phone) setClientPhone(c.phone);
    if (c.gstin) setClientGstin(c.gstin);
    setShowCustomerDropdown(false);
  };

  const handleAddProductFromCatalogue = (svc: Service) => {
    const newItem: EditableItem = {
      id: `item-${Date.now()}`,
      item_name: svc.service_name,
      description: svc.description || '',
      quantity: 1,
      uom: svc.default_uom || 'NOS',
      rate: Number(svc.standard_rate) || 0,
      total: Number(svc.standard_rate) || 0,
      hsn_sac: svc.hsn_sac_code || '8479',
    };
    setItems(prev => [...prev, newItem]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleAddCustomItem = () => {
    const newItem: EditableItem = {
      id: `custom-${Date.now()}`,
      item_name: 'New Product / Spare / Service',
      description: '',
      quantity: 1,
      uom: 'NOS',
      rate: 1000.0,
      total: 1000.0,
      hsn_sac: '8479',
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof EditableItem, val: any) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: val };
        if (field === 'quantity' || field === 'rate') {
          updated.total = Number(updated.quantity || 0) * Number(updated.rate || 0);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  // Calculations
  const tableSubtotal = items.reduce((sum, it) => sum + (it.is_header ? 0 : Number(it.total || 0)), 0);
  const subtotal = mode === 'table' ? tableSubtotal : Number(lumpSumValue || 0);
  const cgstAmount = applyGst ? (subtotal * (gstRate / 2)) / 100 : 0;
  const sgstAmount = applyGst ? (subtotal * (gstRate / 2)) / 100 : 0;
  const totalAmount = subtotal + cgstAmount + sgstAmount;
  const amountWords = numberToWords(totalAmount);

  // Build Payload
  const buildPayload = () => {
    const payloadItems = mode === 'table'
      ? items.map(it => ({
          item_name: it.item_name,
          description: it.is_header ? `HEADER: ${it.description || ''}` : it.description,
          quantity: it.quantity,
          uom: it.uom,
          unit_price: it.rate,
          line_total: it.total,
          hsn_sac_code: it.hsn_sac || '8479',
        }))
      : [
          {
            item_name: `${headingText} - ${cleanableSqft || 'AREA SCOPE'}`,
            description: scopeText.slice(0, 150) + '...',
            quantity: 1,
            uom: 'JOB',
            unit_price: subtotal,
            line_total: subtotal,
            hsn_sac_code: '998533',
          },
        ];

    return {
      company_code: companyCode,
      quotation_number: quotationNumber.trim() || 'QMS-0001',
      job_description: headingText.trim(),
      quotation_date: toISODate(quotationDate),
      status: 'APPROVED',
      client_name: clientName.trim(),
      client_address: clientAddress.trim(),
      client_gstin: clientGstin.trim(),
      client_phone: clientPhone.trim(),
      attention_person: attentionPerson.trim(),
      notes: mode === 'word_scope' ? scopeText.trim() : '',
      subtotal: subtotal,
      taxable_amount: subtotal,
      cgst_rate: applyGst ? gstRate / 2 : 0,
      cgst_amount: cgstAmount,
      sgst_rate: applyGst ? gstRate / 2 : 0,
      sgst_amount: sgstAmount,
      igst_rate: 0,
      igst_amount: 0,
      total_tax: cgstAmount + sgstAmount,
      final_amount: totalAmount,
      amount_in_words: amountWords,
      terms_and_conditions: terms.join('\n'),
      snapshot_json: JSON.stringify({
        cleanable_sqft: cleanableSqft,
        special_notes: specialNotes,
        mode: mode,
      }),
      items: payloadItems,
    };
  };

  // 1. Save / Update to Database
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
          // ignore
        }
      }

      const payload = {
        ...buildPayload(),
        customer_id: targetCust?.id || customers[0]?.id || 'default-customer-id',
      };

      let res;
      if (activeQuotationId) {
        res = await api.quotations.update(activeQuotationId, payload);
      } else {
        res = await api.quotations.create(payload);
        setActiveQuotationId(res.id);
      }

      setSuccessMessage('Quotation updated and saved to database successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      return res.id;
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`Save failed: ${err.message || 'Error updating database record'}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // 2. Download PDF
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      let qId = activeQuotationId;
      if (!qId) {
        qId = await handleSaveToDb();
      }
      if (!qId) return;

      const filename = `${quotationNumber.replace(/[\/\\]/g, '_')}_${companyCode}_Quotation.pdf`;
      await api.quotations.downloadPdf(qId, filename);
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert(`PDF download failed: ${err.message || 'Error generating PDF'}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Download Word (.docx)
  const handleDownloadDocx = async () => {
    try {
      setLoading(true);
      let qId = activeQuotationId;
      if (!qId) {
        qId = await handleSaveToDb();
      }
      if (!qId) return;

      const filename = `${quotationNumber.replace(/[\/\\]/g, '_')}_${companyCode}_Quotation.docx`;
      await api.quotations.downloadDocx(qId, filename);
    } catch (err: any) {
      console.error('DOCX download error:', err);
      alert(`Word download failed: ${err.message || 'Error generating Word file'}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Preview A4
  const handlePreviewA4 = async () => {
    let qId = activeQuotationId;
    if (!qId) {
      qId = await handleSaveToDb();
    }
    if (qId) {
      onOpenPreview(qId);
    }
  };

  const activeCompany = COMPANIES.find(c => c.code === companyCode) || COMPANIES[0];

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('quotations')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="Back to Quotations List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeCompany.badge} animate-pulse`} />
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Quotation Editor ({activeCompany.name})
              </h1>
              {activeQuotationId && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                  Editing #{quotationNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Interactive WYSIWYG editor matching official company letterhead & real-time A4 calculations.
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
            <span>{saving ? 'Updating...' : activeQuotationId ? 'Update & Save' : 'Save to DB'}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* COMPANY SWITCHER STRIP (CHOOSE FROM ALL 4 SUBSIDIARIES) */}
      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Active Subsidiary Template:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {COMPANIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setCompanyCode(c.code);
                const presets = HEADING_PRESETS[c.code] || [];
                if (presets.length > 0) setHeadingText(presets[0]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                companyCode === c.code
                  ? `${c.badge} shadow-md scale-105`
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENT PREVIEW & WYSIWYG EDITOR CANVAS */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden">
        {/* TOP LETTERHEAD BANNER FLUSH */}
        <div className="w-full bg-white border-b border-slate-200 text-center">
          <img
            src={activeCompany.banner}
            alt={`${activeCompany.name} Letterhead Banner`}
            className="w-full h-auto max-h-36 object-contain block mx-auto"
          />
        </div>

        <div className="p-8 md:p-12 space-y-8 max-w-4xl mx-auto">
          {/* HEADING PRESETS & DOCUMENT TITLE */}
          <div className="space-y-4 border-b border-slate-200 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Heading:
              </span>
              {(HEADING_PRESETS[companyCode] || []).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHeadingText(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    headingText === preset
                      ? 'bg-slate-900 text-amber-400 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Centered Document Title */}
            <div className="text-center">
              <input
                type="text"
                value={headingText}
                onChange={e => setHeadingText(e.target.value)}
                className="w-full text-center text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight border-b-2 border-transparent hover:border-slate-300 focus:border-amber-400 focus:outline-none transition-all py-1"
                placeholder="QUOTATION HEADING"
              />
              <div className="w-32 h-1 bg-amber-400 mx-auto rounded-full mt-1" />
            </div>
          </div>

          {/* META SECTION: CLIENT INFO & PROPOSAL NUMBER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
            {/* Left: Client Details (TO:) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  TO (Client Information):
                </span>
                {/* Search customer button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs"
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
                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg mb-2 focus:outline-none focus:border-blue-500"
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
                              className="w-full text-left text-xs p-1.5 hover:bg-blue-50 rounded font-semibold text-slate-800 flex items-center justify-between"
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
                  className="w-full font-black text-slate-900 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 uppercase"
                  placeholder="CLIENT / COMPANY NAME"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
                  placeholder="Address, Plant, City"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={attentionPerson}
                  onChange={e => setAttentionPerson(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
                  placeholder="Att : Person Name"
                />
                <input
                  type="text"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  className="w-full text-xs font-mono text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
                  placeholder="Phone No"
                />
              </div>
            </div>

            {/* Right: Proposal Ref & Date */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Quotation / Ref No:</span>
                <input
                  type="text"
                  value={quotationNumber}
                  onChange={e => setQuotationNumber(e.target.value)}
                  className="font-mono font-black text-slate-900 bg-white border border-slate-300 px-3 py-1 rounded-lg text-sm w-36 text-center focus:outline-none focus:border-amber-400"
                  placeholder="KMP/0001"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Quotation Date:</span>
                <input
                  type="text"
                  value={quotationDate}
                  onChange={e => setQuotationDate(e.target.value)}
                  className="font-mono font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1 rounded-lg text-xs w-36 text-center focus:outline-none focus:border-amber-400"
                  placeholder="DD/MM/YYYY"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-bold">GSTIN:</span>
                <input
                  type="text"
                  value={clientGstin}
                  onChange={e => setClientGstin(e.target.value)}
                  className="font-mono font-bold text-slate-700 bg-white border border-slate-300 px-2 py-1 rounded text-xs w-44 text-right"
                  placeholder="33XXXXX..."
                />
              </div>

              {/* Mode Switcher: Products Table vs. Word Scope */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">Content Format:</span>
                <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMode('table')}
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                      mode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Items Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('word_scope')}
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                      mode === 'word_scope' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Word Scope Text
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC CONTENT AREA: ITEMS TABLE OR WORD SCOPE CANVAS */}
          {mode === 'table' ? (
            <div className="space-y-4">
              {/* Product Search & Quick Add Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[260px]">
                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-2 shadow-2xs">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => {
                        setProductSearch(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      placeholder={`Search ${activeCompany.name} products, spares, machines...`}
                      className="w-full text-xs bg-transparent focus:outline-none"
                    />
                  </div>

                  {showProductDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-56 overflow-y-auto">
                      {catalogueServices
                        .filter(s =>
                          s.service_name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          s.service_code.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleAddProductFromCatalogue(s)}
                            className="w-full text-left p-2 hover:bg-slate-50 rounded-lg flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{s.service_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{s.service_code}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-900">₹ {Number(s.standard_rate).toLocaleString('en-IN')}</div>
                              <div className="text-[10px] text-slate-400 uppercase">{s.default_uom}</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>+ Add Custom Row</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0F172A] text-white uppercase text-[11px] font-black tracking-wider">
                    <tr>
                      <th className="p-3 text-center w-12">#</th>
                      <th className="p-3">Description / Machine Specifications</th>
                      <th className="p-3 text-center w-20">Qty</th>
                      <th className="p-3 text-center w-20">UOM</th>
                      <th className="p-3 text-right w-28">Rate (₹)</th>
                      <th className="p-3 text-right w-32">Total (₹)</th>
                      <th className="p-3 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50/70">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 space-y-1">
                          <input
                            type="text"
                            value={it.item_name}
                            onChange={e => handleUpdateItem(it.id, 'item_name', e.target.value)}
                            className="w-full font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-400 focus:outline-none"
                            placeholder="Item name"
                          />
                          <textarea
                            rows={2}
                            value={it.description || ''}
                            onChange={e => handleUpdateItem(it.id, 'description', e.target.value)}
                            placeholder="Specifications / features (optional)"
                            className="w-full text-[11px] text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-400 focus:outline-none resize-none"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={e => handleUpdateItem(it.id, 'quantity', parseFloat(e.target.value) || 1)}
                            className="w-16 text-center font-bold text-slate-900 bg-slate-100 rounded p-1"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={it.uom}
                            onChange={e => handleUpdateItem(it.id, 'uom', e.target.value)}
                            className="w-16 text-center font-bold text-slate-700 bg-slate-100 rounded p-1 uppercase"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={it.rate}
                            onChange={e => handleUpdateItem(it.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-24 text-right font-bold text-slate-900 bg-slate-100 rounded p-1"
                          />
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">
                          ₹ {Number(it.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                          No items added yet. Use the search bar above or click "+ Add Custom Row".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* WORD-STYLE EXPANDING TEXT CANVAS */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4 text-sky-600" />
                  <span>Cleaning Scope / Work Specifications (Continuous Natural Flow):</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {scopeText.length} chars • {scopeText.split('\n').length} lines
                </span>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300">
                <textarea
                  ref={textareaRef}
                  value={scopeText}
                  onChange={e => setScopeText(e.target.value)}
                  placeholder="Type scope of work here. Content expands naturally downwards just like MS Word..."
                  className="w-full resize-none font-mono text-xs md:text-sm text-slate-800 leading-relaxed border-0 bg-transparent focus:outline-none"
                  style={{ minHeight: '480px', lineHeight: '1.65' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Cleanable SQFT (Approx):
                  </label>
                  <input
                    type="text"
                    value={cleanableSqft}
                    onChange={e => setCleanableSqft(e.target.value)}
                    className="w-full text-xs font-bold p-2 bg-white border border-amber-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Total Lump Sum Value (₹):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lumpSumValue}
                    onChange={e => setLumpSumValue(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-black p-2 bg-white border border-amber-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FINANCIAL SUMMARY & GST BREAKDOWN */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="applyGst"
                  checked={applyGst}
                  onChange={e => setApplyGst(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="applyGst" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Apply GST (CGST 9% + SGST 9% = 18%)
                </label>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs text-slate-500">
                  Subtotal: <strong className="text-slate-900">₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
                {applyGst && (
                  <>
                    <div className="text-xs text-slate-500">
                      CGST (9%): <strong className="text-slate-900">₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="text-xs text-slate-500">
                      SGST (9%): <strong className="text-slate-900">₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-amber-100/70 p-4 rounded-xl">
              <div>
                <div className="text-xs font-bold text-amber-900 uppercase">Grand Total Amount :</div>
                <div className="text-xs font-medium text-slate-600 italic">{amountWords}</div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* BANK DETAILS (MATCHING THE SUBSIDIARY) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Company's Official Bank Details :
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Corporate Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">A/C HOLDER'S NAME</span>
                <span className="font-extrabold text-slate-900">
                  {currentCompany?.bank_account_name || currentCompany?.company_name || activeCompany.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">BANK NAME</span>
                <span className="font-extrabold text-slate-900">
                  {currentCompany?.bank_name || 'HDFC Bank'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">ACCOUNT NUMBER</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {currentCompany?.bank_account_no || '73388820361'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">BRANCH & IFS CODE</span>
                <span className="font-extrabold text-slate-900">
                  {currentCompany?.bank_branch || 'Chennai'} & {currentCompany?.bank_ifsc || 'HDFC0001234'}
                </span>
              </div>
            </div>
          </div>

          {/* TERMS AND CONDITIONS */}
          <div className="space-y-3 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Terms and Conditions:
              </span>
              <button
                type="button"
                onClick={() => setTerms(prev => [...prev, 'New condition...'])}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                + Add Term
              </button>
            </div>
            <div className="space-y-2">
              {terms.map((term, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <span className="text-amber-500 font-bold">•</span>
                  <input
                    type="text"
                    value={term}
                    onChange={e => {
                      const updated = [...terms];
                      updated[index] = e.target.value;
                      setTerms(updated);
                    }}
                    className="w-full bg-transparent hover:bg-slate-50 focus:bg-white border-b border-transparent focus:border-amber-400 focus:outline-none py-0.5 text-xs font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setTerms(prev => prev.filter((_, i) => i !== index))}
                    className="text-slate-400 hover:text-rose-500 p-0.5"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SIGNATORY & FOOTER NOTICE */}
          <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700">For {activeCompany.name}</div>
              <div className="h-10" />
              <div className="text-xs font-black text-slate-900">
                {companyCode === 'cleantech'
                  ? 'Mr. Manikandan Balamurugan'
                  : companyCode === 'kleanmax'
                  ? 'Mr. Manikandan'
                  : 'Authorised Signatory'}
              </div>
              <div className="text-[11px] text-slate-500">
                {companyCode === 'cleantech' ? 'Sales and Service Head' : 'Project Estimations Head'} • +91 7338882036
              </div>
              <div className="text-[11px] font-bold text-slate-700">Authorised Signatory</div>
            </div>

            <div className="text-right text-[10px] text-slate-400 max-w-xs leading-relaxed">
              This is a computer generated document and authenticated by {activeCompany.name}. Hence, it is valid even if not signed manually.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationEdit;
