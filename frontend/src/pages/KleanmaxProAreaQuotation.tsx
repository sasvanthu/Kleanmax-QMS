import React, { useState, useEffect, useRef } from 'react';
import { Customer, Service, User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  Download, FileText, Printer, Save, CheckCircle2,
  Calendar, Layers, ShieldCheck, Sparkles, Plus, Trash2, ArrowLeft,
  Search, Lock, Eye, Check, ChevronDown, Building, Phone, Mail, MapPin,
  RefreshCw, Info, HelpCircle
} from 'lucide-react';

interface QuotationProductItem {
  id: string;
  item_name: string;
  description: string;
  days: number;
  uom: string;
  rate: number;
  amount: number;
}

interface KleanmaxProAreaQuotationProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

const HEADING_OPTIONS = [
  'MONTHLY RENTAL QUOTATION',
  'SALES QUOTATION',
  'SERVICE QUOTATION',
];

const DEFAULT_ABOUT_US = `Kleanmax Pro is a leading provider of cleaning machine rental services, offering a wide range of equipment—from vacuum cleaners to ride-on scrubbers—to industries, malls, commercial spaces, and facility management companies across Chennai, Bangalore, Hyderabad and Visakhapatnam.

Our rental machines are well-maintained, ready-to-use, and come with on-site delivery and pickup. We also offer on-call technical support throughout the rental period, ensuring seamless operations.

Machines are equipped with GPS tracking devices to monitor usage, location, and efficiency in real-time. For larger or longer projects, we provide custom rental packages, and where needed, can include standby machines and basic operator training. With flexible rental durations, affordable pricing, and transparent terms, our rental service is designed to deliver both performance and peace of mind.`;

const DEFAULT_NOTES = `1. TRANSPORT IS CUSTOMER SCOPE.
2. TAX WILL BE EXTRA.
3. 2 MONTHS RENTAL AMOUNT DEPOSIT REQUIRED.
4. RENTAL PERIOD MAXIMUM 3 YEARS REQUIRED.`;

const ADVANTAGES = [
  'Access to a wide range of cleaning machines on demand.',
  'Well-maintained, quality-checked equipment every time.',
  'GPS tracking included for real-time usage monitoring.',
  'On-call technical support throughout the rental period.',
  'Zero maintenance worries — we handle all servicing.',
  'Standby machine available (subject to availability).',
  'Operator training support provided when needed.',
  'Transparent pricing with no hidden charges.',
];

const TERMS_AND_CONDITIONS = [
  'Consumables are included in the rental scope.',
  'Machine maintenance and service spares are included in our scope.',
  'Only depreciation parts are covered; broken parts due to misuse are not covered.',
  'Preventive maintenance will be carried out once every two months.',
  'Breakdown service will be provided within 24–48 hours, depending on location.',
  'The renter is fully responsible for any damage or missing parts.',
  'Payment terms: 30 days from the date of invoice submission.',
];

const OTHER_SERVICES = [
  'Repair & Maintenance of Cleaning Equipment',
  'AMC / CMC Contracts',
  'Sales of New & Used Machines',
  'Housekeeping Material Supply',
  'Commercial Cleaning & Painting Services',
];

export const KleanmaxProAreaQuotation: React.FC<KleanmaxProAreaQuotationProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // 1. Heading Option & Text (Editable)
  const [selectedHeadingOption, setSelectedHeadingOption] = useState<string>('MONTHLY RENTAL QUOTATION');
  const [quotationTitle, setQuotationTitle] = useState<string>('MONTHLY RENTAL QUOTATION');

  // 2. Metadata: Quotation Number & Date (Editable & Auto-Incrementing)
  const [quotationNo, setQuotationNo] = useState<string>('KMP/0001');
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 3. "TO :-" Client Address Details (Editable)
  const [customerName, setCustomerName] = useState<string>('ABANS FACILITY MANAGEMENT');
  const [addressLine1, setAddressLine1] = useState<string>('Perungudi Industrial Estate');
  const [addressLine2, setAddressLine2] = useState<string>('Chennai - 600096, Tamil Nadu');
  const [contactPerson, setContactPerson] = useState<string>('Facility Operations Head');
  const [phone, setPhone] = useState<string>('+91 98840 12345');
  const [email, setEmail] = useState<string>('operations@abansfacility.com');
  const [gstin, setGstin] = useState<string>('33AAAAA0000A1Z5');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // 4. Content Blocks
  const [aboutUs, setAboutUs] = useState<string>(DEFAULT_ABOUT_US);
  const [notes, setNotes] = useState<string>(DEFAULT_NOTES);

  // 5. Products & Items Table
  const [items, setItems] = useState<QuotationProductItem[]>([
    {
      id: 'item_1',
      item_name: 'RIDE ON SCRUBBER MACHINE RB-800',
      description: 'BRUSH SCRUBBING WIDTH - 800mm\nSUCTION WIDTH - 1100mm\nCOVERAGE AREA - 4800M.SQ/HR\nWORKING SPEED - 6KM/HR\nAIRFLOW RATE - 33L/SEC\nVACCUM PRESSURE - 1650MM\nPOWER - 24V\nTOTAL POWER - 2400W\nBRUSH MOTOR - 2*550W\nVACCUM MOTOR - 550W\nPERFORMANCE - 1950 m2/hr\nTANK CAPACITY - 120LTRS\nDIAMETRE OF BRUSH - 405MM\nDRIVER MOTOR POWER - 750MM',
      days: 1,
      uom: 'NOS',
      rate: 32000.00,
      amount: 32000.00,
    },
    {
      id: 'item_2',
      item_name: 'RIDE ON SCRUBBER MACHINE RB-650',
      description: 'Scrubbing Width: 650 mm\nSuction / Squeegee Width: 870 mm\nTheoretical Area Coverage: 4,225 m2/hr\nWorking Speed: Up to 6.5 km/hr (Travel speed up to 7 km/hr)\nPower Supply / Battery: 24 V DC / 200 Ah\nTotal Power: 1,600 W\nBrushes: 2 disc brushes, 333 mm diameter each, running at 180 RPM\nBrush Pressure: 25 kg (with additional brush pressure option)\nSolution / Fresh Water Tank: 100 L\nRecovery / Dirty Water Tank: 100 L',
      days: 1,
      uom: 'NOS',
      rate: 27000.00,
      amount: 27000.00,
    },
  ]);

  // Tax rates
  const [applyTax, setApplyTax] = useState<boolean>(true);
  const [taxPercent, setTaxPercent] = useState<number>(18);

  // 6. Product Search Bar State
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<Service[]>([]);
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Customers & Company Setting
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);

  // Status & Feedback
  const [saving, setSaving] = useState<boolean>(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Close search dropdown on click outside
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
      // 1. Fetch Next Quotation Number for Kleanmax Pro (e.g. KMP/0001, KMP/0002)
      try {
        const nextNumRes = await api.quotations.getNextNumber('kleanmaxpro', 'short');
        if (nextNumRes && nextNumRes.next_number) {
          setQuotationNo(nextNumRes.next_number);
        }
      } catch (e) {
        console.warn('Fallback quotation number:', e);
      }

      // 2. Fetch Customers & Company Details
      const [custs, comp, services] = await Promise.all([
        api.customers.list(),
        api.company.get('kleanmaxpro'),
        api.services.list({ company_code: 'kleanmaxpro' }),
      ]);

      setCustomerList(custs);
      setCompany(comp);
      setAvailableProducts(services);

      if (custs.length > 0) {
        setSelectedCustomerId(custs[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial Kleanmax Pro data:', err);
    }
  };

  // Filter products as employee types in search bar
  useEffect(() => {
    if (!productSearchQuery.trim()) {
      setSearchResults(availableProducts.slice(0, 8));
    } else {
      const q = productSearchQuery.toLowerCase();
      const filtered = availableProducts.filter((p) =>
        p.service_name.toLowerCase().includes(q) ||
        p.service_code.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
      setSearchResults(filtered);
    }
  }, [productSearchQuery, availableProducts]);

  // Handle heading selection
  const handleSelectHeadingOption = (opt: string) => {
    setSelectedHeadingOption(opt);
    setQuotationTitle(opt);
  };

  // Handle customer quick pick
  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const found = customerList.find((c) => c.id === custId);
    if (found) {
      setCustomerName(found.company_name);
      setAddressLine1(found.billing_address_line1 || '');
      setAddressLine2(`${found.billing_city || ''} ${found.billing_pincode ? `- ${found.billing_pincode}` : ''}`.trim());
      setContactPerson(found.contact_person || 'Facility Head');
      setPhone(found.phone || '');
      setEmail(found.email || '');
      setGstin(found.gstin || '');
    }
  };

  // Add product from search bar to table
  const handleAddProduct = (prod: Service) => {
    const newItem: QuotationProductItem = {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      item_name: prod.service_name,
      description: prod.description || '',
      days: 1,
      uom: prod.default_uom || 'NOS',
      rate: Number(prod.standard_rate || 0),
      amount: Number(prod.standard_rate || 0),
    };
    setItems((prev) => [...prev, newItem]);
    setProductSearchQuery('');
    setSearchDropdownOpen(false);
  };

  // Add custom manual item row
  const handleAddCustomItem = () => {
    const newItem: QuotationProductItem = {
      id: `item_${Date.now()}`,
      item_name: 'NEW CLEANING EQUIPMENT',
      description: 'Technical specifications, power rating, brush size & tank capacity',
      days: 1,
      uom: 'NOS',
      rate: 15000.00,
      amount: 15000.00,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof QuotationProductItem, val: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'days' || field === 'rate') {
          const d = field === 'days' ? Number(val) : updated.days;
          const r = field === 'rate' ? Number(val) : updated.rate;
          updated.amount = (Number(d) || 0) * (Number(r) || 0);
        }
        return updated;
      })
    );
  };

  // Step quantity (+ or -)
  const handleStepQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newDays = Math.max(1, (Number(item.days) || 1) + delta);
        return {
          ...item,
          days: newDays,
          amount: newDays * Number(item.rate || 0),
        };
      })
    );
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const cgstRate = applyTax ? taxPercent / 2 : 0;
  const sgstRate = applyTax ? taxPercent / 2 : 0;
  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const totalAmount = subtotal + cgstAmount + sgstAmount;

  // Convert numbers to Indian Rupees Words
  const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const n = Math.floor(num);
    if (n === 0) return 'Zero Rupees Only';

    const inWords = (n: number): string => {
      let str = '';
      if (n > 9999999) {
        str += inWords(Math.floor(n / 10000000)) + 'Crore ';
        n %= 10000000;
      }
      if (n > 99999) {
        str += inWords(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
      }
      if (n > 999) {
        str += inWords(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
      }
      if (n > 99) {
        str += inWords(Math.floor(n / 100)) + 'Hundred ';
        n %= 100;
      }
      if (n > 0) {
        if (str !== '') str += 'and ';
        if (n < 20) str += a[n];
        else str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      }
      return str;
    };
    return `${inWords(n).trim()} Rupees Only`;
  };

  // Save to Database
  const handleSaveToDatabase = async (openPreviewAfter = false): Promise<string | null> => {
    setSaving(true);
    setToastMsg(null);
    try {
      // Find or create customer
      let targetCustId = selectedCustomerId;
      if (!targetCustId) {
        const newCust = await api.customers.create({
          company_name: customerName,
          billing_address_line1: addressLine1,
          billing_address_line2: addressLine2,
          contact_person: contactPerson,
          phone: phone || '+91 00000 00000',
          email: email || undefined,
          gstin: gstin || undefined,
          billing_city: 'Chennai',
          billing_state: 'Tamil Nadu',
          billing_state_code: '33',
          billing_pincode: '600001',
          is_active: true,
        });
        targetCustId = newCust.id;
      }

      // Convert products to Quotation Items
      const payloadItems = items.map((it, idx) => ({
        item_name: it.item_name,
        description: it.description,
        quantity: Number(it.days) || 1,
        uom: it.uom,
        unit_price: Number(it.rate),
        applied_rate: Number(it.rate),
        rate_source: 'catalogue',
        tax_rate: applyTax ? taxPercent : 0,
        cgst_amount: applyTax ? (Number(it.amount) * (taxPercent / 2)) / 100 : 0,
        sgst_amount: applyTax ? (Number(it.amount) * (taxPercent / 2)) / 100 : 0,
        line_total: Number(it.amount),
        item_order: idx + 1,
      }));

      // Quotation creation payload
      const payload = {
        customer_id: targetCustId,
        company_code: 'kleanmaxpro',
        quotation_number: quotationNo.trim(),
        quotation_type: 'rental',
        quotation_date: quotationDate,
        job_description: quotationTitle,
        notes: notes,
        terms_and_conditions: TERMS_AND_CONDITIONS.join('\n'),
        items: payloadItems,
        sections: [],
        tax_rate: applyTax ? taxPercent : 0,
        discount_type: 'none',
        discount_value: 0,
      };

      const res = await api.quotations.create(payload);
      setSavedQuoteId(res.id);
      setToastMsg(`Quotation ${res.quotation_number} saved successfully!`);

      if (openPreviewAfter) {
        onOpenPreview(res.id);
      }
      return res.id;
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save quotation');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadDocx = async () => {
    let quoteId = savedQuoteId;
    if (!quoteId) {
      quoteId = await handleSaveToDatabase(false);
    }
    if (quoteId) {
      await api.quotations.downloadDocx(quoteId, `${quotationNo.replace('/', '_')}_KleanmaxPro.docx`);
    }
  };

  const handleDownloadPdf = async () => {
    let quoteId = savedQuoteId;
    if (!quoteId) {
      quoteId = await handleSaveToDatabase(false);
    }
    if (quoteId) {
      await api.quotations.downloadPdf(quoteId, `${quotationNo.replace('/', '_')}_KleanmaxPro.pdf`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl shadow-sm flex items-center justify-between animate-fade-in sticky top-20 z-30">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 font-extrabold text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('kleanmaxpro_quotes')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="View Past Quotations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                Kleanmax Pro Quotation Generator
              </h1>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive proposal builder matching authentic Kleanmax Pro manual quotations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Word (.docx) */}
          <button
            onClick={handleDownloadDocx}
            disabled={saving}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            title="Download formatted Microsoft Word document with letterhead"
          >
            <FileText className="w-4 h-4" />
            <span>Download Word (.docx)</span>
          </button>

          {/* 1-Click PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            title="Download official PDF with letterhead"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download PDF</span>
          </button>

          {/* Preview A4 */}
          <button
            onClick={() => handleSaveToDatabase(true)}
            disabled={saving}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Preview A4</span>
          </button>

          {/* Save to DB */}
          <button
            onClick={() => handleSaveToDatabase(false)}
            disabled={saving}
            className="px-4 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save to DB'}</span>
          </button>
        </div>
      </div>

      {/* Main Quotation Document Sheet (A4 Styled Simulation) */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl overflow-hidden text-slate-800">
        
        {/* 1. Authentic Kleanmax Pro Header Image */}
        <div className="w-full bg-slate-900 border-b border-slate-200">
          <img
            src="/headers/header_kleanmaxpro.png"
            alt="Kleanmax Pro Official Letterhead Header"
            className="w-full h-auto max-h-36 object-contain mx-auto select-none"
            onError={(e) => {
              // fallback if png missing
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <div className="p-6 md:p-10 space-y-7">
          
          {/* 2. Heading Selector: 3 Options + Directly Editable Title */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Select Heading Type:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {HEADING_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectHeadingOption(opt)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedHeadingOption === opt
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs ring-2 ring-amber-500'
                        : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Heading Display */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Editable Document Heading (Centered on Document):
              </label>
              <input
                type="text"
                value={quotationTitle}
                onChange={(e) => setQuotationTitle(e.target.value.toUpperCase())}
                className="w-full text-center text-lg md:text-xl font-black text-slate-950 bg-white border border-amber-300 rounded-xl py-2 px-3 tracking-wide uppercase focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>
          </div>

          {/* 3. Metadata & "To :-" Client Address Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-4 border-b border-slate-200">
            {/* Left: Client Address ("TO :-") */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  TO :-
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
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Client / Company Name (e.g. ABANS FACILITY)"
                  className="w-full text-sm font-black text-slate-900 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-amber-500 uppercase tracking-wide bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Address Line 1"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="City, State - Pincode"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Attn: Person"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone No"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="GSTIN No"
                  className="w-full font-mono border border-slate-300 rounded-lg p-2 uppercase"
                />
              </div>
            </div>

            {/* Right: Quotation Number & Date (Editable & Auto-Incrementing) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Quotation Number (e.g. KMP/0001) :-
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quotationNo}
                    onChange={(e) => setQuotationNo(e.target.value.toUpperCase())}
                    className="w-full text-sm font-mono font-black text-slate-900 border border-slate-300 rounded-xl p-2 bg-white uppercase focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await api.quotations.getNextNumber('kleanmaxpro', 'short');
                      if (res?.next_number) setQuotationNo(res.next_number);
                    }}
                    className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700"
                    title="Fetch latest sequence from database"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Increments in DB automatically. Editable for manual numbering.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Quotation Date :-
                </label>
                <input
                  type="date"
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                  className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded-xl p-2 bg-white"
                />
              </div>
            </div>
          </div>

          {/* 4. About Us (Authentic Kleanmax Pro text from PDF) */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-900">
                About Us:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Official Company Profile</span>
            </div>
            <textarea
              rows={4}
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-xl p-3 leading-relaxed focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* 5. Product Search Bar for Employee */}
          <div className="space-y-2 relative" ref={searchContainerRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-amber-500" />
                <span>Search & Add Equipment / Machine:</span>
              </label>
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Custom Blank Item</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Kleanmax Pro rental products (e.g. RB-800, RB-650, Vacuum, Single Disc, Scrubber)..."
                value={productSearchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setProductSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-white border-2 border-amber-300 rounded-2xl shadow-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Instant Search Results Dropdown */}
            {searchDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 max-h-72 overflow-y-auto p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 border-b border-slate-100">
                  Select Product to Add to Table:
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-bold">
                    No matching machines found. Click "+ Custom Blank Item" to add custom row.
                  </div>
                ) : (
                  searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className="p-3 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between border-b border-slate-50 last:border-none"
                    >
                      <div>
                        <div className="font-black text-xs text-slate-900">{p.service_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Code: {p.service_code} • UOM: {p.default_uom}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-amber-700">
                          ₹{Number(p.standard_rate).toLocaleString('en-IN')}/{p.default_uom}
                        </div>
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                          + Add Item
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 6. Products Line Items Table (Matches PDF Columns) */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3 text-center w-14">SL NO</th>
                  <th className="py-3 px-3 text-left">DESCRIPTION & TECHNICAL SPECIFICATIONS</th>
                  <th className="py-3 px-2 text-center w-28">DAYS / QTY</th>
                  <th className="py-3 px-2 text-center w-20">UOM</th>
                  <th className="py-3 px-3 text-right w-36">MONTHLY RENT (₹)</th>
                  <th className="py-3 px-3 text-right w-36">AMOUNT (₹)</th>
                  <th className="py-3 px-2 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                      No products added yet. Use the search bar above to add machines.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* SL NO */}
                      <td className="py-3 px-3 text-center font-bold text-slate-600 align-top">
                        {idx + 1}.
                      </td>

                      {/* Description & Technical Specs */}
                      <td className="py-3 px-3 align-top space-y-1.5">
                        <input
                          type="text"
                          value={item.item_name}
                          onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value)}
                          className="w-full font-black text-xs text-slate-900 border border-slate-300 rounded-lg p-1.5 focus:ring-1 focus:ring-amber-500 uppercase"
                          placeholder="Machine Name"
                        />
                        <textarea
                          rows={4}
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="Technical Specs (Brush width, suction width, coverage area, battery, tank, etc.)"
                          className="w-full text-[11px] font-mono text-slate-600 border border-slate-200 rounded-lg p-2 leading-relaxed bg-slate-50/50"
                        />
                      </td>

                      {/* Days / Qty with + and - step buttons */}
                      <td className="py-3 px-2 text-center align-top">
                        <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 w-fit mx-auto">
                          <button
                            type="button"
                            onClick={() => handleStepQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-slate-200 font-bold text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.days}
                            onChange={(e) => handleUpdateItem(item.id, 'days', parseInt(e.target.value) || 1)}
                            className="w-10 text-center font-black text-xs bg-transparent border-none focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleStepQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-slate-200 font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* UOM */}
                      <td className="py-3 px-2 text-center align-top">
                        <input
                          type="text"
                          value={item.uom}
                          onChange={(e) => handleUpdateItem(item.id, 'uom', e.target.value.toUpperCase())}
                          className="w-16 text-center font-bold text-xs border border-slate-300 rounded-lg p-1.5 uppercase"
                        />
                      </td>

                      {/* Monthly Rent / Rate */}
                      <td className="py-3 px-3 text-right align-top">
                        <input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-28 text-right font-black text-xs border border-slate-300 rounded-lg p-1.5"
                        />
                      </td>

                      {/* Line Amount */}
                      <td className="py-3 px-3 text-right font-black text-slate-900 align-top text-sm">
                        ₹ {Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-2 text-center align-top">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Remove Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 7. Notes & Financial Totals Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Notes Section */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-slate-900 tracking-wider">
                NOTE :
              </label>
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-3 leading-relaxed focus:ring-1 focus:ring-amber-500 uppercase"
              />
            </div>

            {/* Financial Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-300 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>SUB TOTAL:</span>
                <span className="font-mono text-slate-900">
                  ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {applyTax ? (
                <>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>CGST ({cgstRate}%):</span>
                    <span className="font-mono text-slate-900">
                      ₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>SGST ({sgstRate}%):</span>
                    <span className="font-mono text-slate-900">
                      ₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-amber-700 italic">Tax excluded / Extra</div>
              )}

              <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center bg-[#FED10C]/20 p-2.5 rounded-xl">
                <span className="text-sm font-black text-slate-950">TOTAL:</span>
                <span className="text-lg font-black text-slate-950 font-mono">
                  ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-semibold italic">
                Amount in Words: <strong>{numberToWords(totalAmount)}</strong>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-bold text-slate-700">Include GST (18%) in Calculation</span>
                </label>
              </div>
            </div>
          </div>

          {/* 8. Advantages of Renting & Terms from PDF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            {/* Advantages */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-black text-xs text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Advantages of Renting from Kleanmax Pro</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                {ADVANTAGES.map((adv, i) => (
                  <li key={i} className="leading-snug">{adv}</li>
                ))}
              </ul>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-black text-xs text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Terms & Conditions</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                {TERMS_AND_CONDITIONS.map((term, i) => (
                  <li key={i} className="leading-snug">{term}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 9. Other Services */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="font-black text-xs text-slate-900 uppercase tracking-wide mb-2">
              Other Services
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-slate-700">
              {OTHER_SERVICES.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Company Details & Bank Details (LOCKED for Employee, Editable in Admin Settings) */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="font-black text-xs tracking-wider uppercase text-amber-400">
                  Company's Bank Details & Signatory (Locked by Unified Admin)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                To edit bank details, go to <strong>Unified Admin → Manage 4 Companies</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 text-slate-300">
                <div>• A/c Holder's Name: <strong className="text-white">{company?.bank_account_name || company?.company_name || 'KLEAN MAX PRO'}</strong></div>
                <div>• Bank Name: <strong className="text-white">{company?.bank_name || 'ICICI BANK KMP'}</strong></div>
                <div>• A/c No.: <strong className="text-white font-mono">{company?.bank_account_no || '027505010327'}</strong></div>
                <div>• Branch & IFS Code: <strong className="text-white font-mono">{company?.bank_branch || 'PORUR'} & {company?.bank_ifsc || 'ICIC0000275'}</strong></div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs font-bold text-slate-400">For {company?.company_name || 'Klean max pro'}</div>
                <div className="text-sm font-black text-white pt-2">
                  {company?.signatory_name || 'Mr. Manikandan'}
                </div>
                <div className="text-xs text-amber-400 font-semibold">
                  {company?.signatory_designation || 'Service Head'}
                </div>
                <div className="text-xs text-slate-400">
                  {company?.phone || company?.phone1 || '+ 91 7338882036'}
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-1">
                  Authorised Signatory
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 italic">
              "This is a computer generated document and authenticated by Klean max pro. Hence, it can be considered valid even if not signed manually"
            </div>
          </div>
        </div>

        {/* Bottom Authentic Footer */}
        <div className="w-full bg-slate-900 border-t border-slate-200">
          <img
            src="/headers/footer_kleanmaxpro.png"
            alt="Kleanmax Pro Official Letterhead Footer"
            className="w-full h-auto max-h-12 object-contain mx-auto select-none"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KleanmaxProAreaQuotation;
