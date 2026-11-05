import React, { useState, useEffect, useRef } from 'react';
import { Customer, Service, CompanySetting, User } from '../services/types';
import { api } from '../services/api';
import {
  FileText, Download, Eye, Save, Sparkles, Plus, Trash2,
  RefreshCw, CheckCircle2, ArrowLeft, Search, Check,
  ShieldCheck, Lock, X, Layers
} from 'lucide-react';

export interface CleantechGeneratorProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export interface CleantechItem {
  id: string;
  is_header?: boolean;
  item_name: string;
  description?: string;
  qty: number;
  uom: string;
  rate: number;
  total: number;
}

const HEADING_OPTIONS = [
  'SERVICE QUOTATION',
  'SPARES AND SERVICE QUOTATION',
  'SOLAR PANEL CLEANING PROPOSAL',
  'FACADE CLEANING QUOTATION',
  'AMC CONTRACT QUOTATION',
];

const DEFAULT_WHY_CHOOSE_US = [
  'High-quality, performance-tested cleaning equipment.',
  'Reliable and cost-effective solutions for every cleaning requirement.',
  'Customized machine recommendations based on your application.',
  'Competitive pricing with complete transparency.',
  'Prompt delivery and professional installation support.',
  'Dedicated after-sales service and technical assistance.',
  'Genuine spare parts with quick availability.',
  'Preventive maintenance support to maximize machine life.',
  'Basic operator training for safe and efficient machine operation.',
  'Commitment to customer satisfaction with dependable service and long-term support.',
];

const DEFAULT_TERMS = [
  'Price Validity : Quoted prices are valid for 30 days from the date of quotation.',
  'Payment Terms : 100 % ADVANCE',
  'Delivery : Delivery within 1–2 working days from receipt of purchase order and payment confirmation (subject to stock availability).',
  'Transportation Charges : Freight charges are additional unless mentioned otherwise.',
  'Installation : Basic installation/demo will be provided if applicable.',
  'Warranty : Warranty 1 Year.',
];

const OUR_SERVICES = [
  'Rental of wide range of cleaning Equipments.',
  'AMC / CMC Contracts',
  'Sales of New & Used Machines',
  'Housekeeping Material Supply',
  'Commercial Cleaning & Painting Services',
];

// Helper to format Date to DD/MM/YYYY (Indian standard)
export const formatToIndianDate = (dateObj: Date = new Date()): string => {
  const d = String(dateObj.getDate()).padStart(2, '0');
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
};

// Helper to convert DD/MM/YYYY or DD-MM-YYYY to ISO YYYY-MM-DD
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

// Default Cleantech products/spares for instant dropdown matching the PDF
const DEFAULT_CLEANTECH_PRODUCTS: Partial<Service>[] = [
  {
    id: 'cts-hose-seed',
    service_code: 'CTS-SP-HOSE',
    service_name: 'HOSE (30L/70L VACUUM)',
    category: 'spare_parts',
    company_code: 'cleantech',
    default_uom: 'NOS',
    standard_rate: 1400.0,
    is_active: true,
    description: 'Flexible heavy-duty suction hose with machine and cuff connectors',
  },
  {
    id: 'cts-filter-seed',
    service_code: 'CTS-SP-FILTER',
    service_name: 'FITER BAG (DUST COLLECTOR)',
    category: 'spare_parts',
    company_code: 'cleantech',
    default_uom: 'NOS',
    standard_rate: 1100.0,
    is_active: true,
    description: 'High efficiency washable dust filter bag for 30L/70L vacuums',
  },
  {
    id: 'cts-pipe-seed',
    service_code: 'CTS-SP-PIPE',
    service_name: 'STEEL PIPE (EXTENSION WAND)',
    category: 'spare_parts',
    company_code: 'cleantech',
    default_uom: 'NOS',
    standard_rate: 1870.0,
    is_active: true,
    description: 'Two-piece chrome-plated steel suction wand rod',
  },
  {
    id: 'cts-wettool-seed',
    service_code: 'CTS-SP-WETTOOL',
    service_name: 'WET TOOL (SQUEEGEE NOZZLE)',
    category: 'spare_parts',
    company_code: 'cleantech',
    default_uom: 'NOS',
    standard_rate: 1400.0,
    is_active: true,
    description: 'Heavy-duty floor squeegee tool with replaceable rubber blades',
  },
  {
    id: 'cts-drytool-seed',
    service_code: 'CTS-SP-DRYTOOL',
    service_name: 'DRY TOOL (FLOOR BRUSH NOZZLE)',
    category: 'spare_parts',
    company_code: 'cleantech',
    default_uom: 'NOS',
    standard_rate: 1490.0,
    is_active: true,
    description: 'Wide dry floor brush nozzle tool for industrial dust pickup',
  },
  {
    id: 'cts-motor-seed',
    service_code: 'CTS-SP-MOTOR',
    service_name: 'VACUUM SUCTION MOTOR 1200W/1400W',
    category: 'spare_parts',
    company_code: 'cleantech',
    default_uom: 'NOS',
    standard_rate: 3800.0,
    is_active: true,
    description: 'Single-phase bypass copper winding vacuum suction motor',
  },
  {
    id: 'cts-overhaul-seed',
    service_code: 'CTS-SRV-OVERHAUL',
    service_name: 'VACUUM CLEANER COMPLETE SERVICE & OVERHAUL',
    category: 'repair_service',
    company_code: 'cleantech',
    default_uom: 'NOS',
    standard_rate: 1200.0,
    is_active: true,
    description: 'Labor charges for comprehensive electrical & mechanical servicing',
  },
  {
    id: 'cts-solar-wash-seed',
    service_code: 'CTS-SOLAR-WASH',
    service_name: 'DE-IONIZED ROBOTIC SOLAR PANEL ARRAY WASH & DUSTING',
    category: 'cleaning',
    company_code: 'cleantech',
    default_uom: 'NOS',
    standard_rate: 45.0,
    is_active: true,
    description: 'Robotic automated pure water solar washing maximizing yield',
  },
  {
    id: 'cts-fac-glass-seed',
    service_code: 'CTS-FAC-GLASS',
    service_name: 'HIGH-RISE GLASS FACADE & CURTAIN WALL CRADLE CLEANING',
    category: 'cleaning',
    company_code: 'cleantech',
    default_uom: 'SQ_FT',
    standard_rate: 6.5,
    is_active: true,
    description: 'BMU cradle and rope access architectural glass facade maintenance',
  },
  {
    id: 'cts-amc-seed',
    service_code: 'CTS-AMC-FACILITY',
    service_name: 'COMPREHENSIVE FACILITY ANNUAL MAINTENANCE CONTRACT (AMC)',
    category: 'amc',
    company_code: 'cleantech',
    default_uom: 'MONTHS',
    standard_rate: 22000.0,
    is_active: true,
    description: 'Scheduled preventive maintenance and 24x7 emergency service SLA',
  },
];

export const CleantechGenerator: React.FC<CleantechGeneratorProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // 1. Heading Option & Text (Editable)
  const [selectedHeadingOption, setSelectedHeadingOption] = useState<string>('SERVICE QUOTATION');
  const [quotationTitle, setQuotationTitle] = useState<string>('SERVICE QUOTATION');

  // 2. Metadata: Quotation Number & Date (DD/MM/YYYY)
  const [quotationNo, setQuotationNo] = useState<string>('CTS/0001');
  const [quotationDate, setQuotationDate] = useState<string>(formatToIndianDate());

  // 3. "To :" Client Address Details (Editable, matching PDF)
  const [customerName, setCustomerName] = useState<string>('UNIQUE SOLUTIONS');
  const [addressLine1, setAddressLine1] = useState<string>('Guindy Industrial Estate');
  const [addressLine2, setAddressLine2] = useState<string>('Chennai - 600032, Tamil Nadu');
  const [contactPerson, setContactPerson] = useState<string>('Service Operations Head');
  const [phone, setPhone] = useState<string>('+91 98400 98765');
  const [email, setEmail] = useState<string>('operations@uniquesolutions.in');
  const [gstin, setGstin] = useState<string>('33AABCU1234F1Z9');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // 4. Content Blocks
  const [whyChooseUs, setWhyChooseUs] = useState<string[]>(DEFAULT_WHY_CHOOSE_US);
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);

  // 5. Items Table (Matching authentic PDF table: VACUUM CLEANER 30LTRS PARTS + Spares)
  const [items, setItems] = useState<CleantechItem[]>([
    {
      id: 'hdr_1',
      is_header: true,
      item_name: 'VACUUM CLEANER 30LTRS PARTS',
      description: 'Section Header',
      qty: 0,
      uom: '',
      rate: 0,
      total: 0,
    },
    {
      id: 'item_1',
      item_name: 'HOSE',
      description: 'Vacuum cleaner 30L suction hose',
      qty: 1,
      uom: 'NOS',
      rate: 1400.0,
      total: 1400.0,
    },
    {
      id: 'item_2',
      item_name: 'FITER BAG',
      description: 'Dust collector filter bag',
      qty: 1,
      uom: 'NOS',
      rate: 1100.0,
      total: 1100.0,
    },
    {
      id: 'item_3',
      item_name: 'STEEL PIPE',
      description: 'Extension wand chrome steel pipe',
      qty: 1,
      uom: 'NOS',
      rate: 1870.0,
      total: 1870.0,
    },
    {
      id: 'item_4',
      item_name: 'WET TOOL',
      description: 'Floor squeegee wet nozzle tool',
      qty: 1,
      uom: 'NOS',
      rate: 1400.0,
      total: 1400.0,
    },
    {
      id: 'item_5',
      item_name: 'DRY TOOL',
      description: 'Floor brush dry nozzle tool',
      qty: 1,
      uom: 'NOS',
      rate: 1490.0,
      total: 1490.0,
    },
  ]);

  // Tax rates
  const [applyTax, setApplyTax] = useState<boolean>(true);
  const [taxPercent, setTaxPercent] = useState<number>(18);

  // 6. Product Search Bar State
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<Service[]>(DEFAULT_CLEANTECH_PRODUCTS as Service[]);
  const [searchResults, setSearchResults] = useState<Service[]>(DEFAULT_CLEANTECH_PRODUCTS as Service[]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Customers & Company Setting
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);

  // Status & Feedback
  const [saving, setSaving] = useState<boolean>(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [inPagePreviewOpen, setInPagePreviewOpen] = useState<boolean>(false);

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
      // 1. Fetch Next Quotation Number for Cleantech
      try {
        const nextNumRes = await api.quotations.getNextNumber('cleantech', 'short');
        if (nextNumRes && nextNumRes.next_number) {
          setQuotationNo(nextNumRes.next_number);
        }
      } catch (e) {
        console.warn('Fallback quotation number:', e);
      }

      // 2. Fetch Customers & Company Details
      const [custs, comp, services] = await Promise.all([
        api.customers.list(),
        api.company.get('cleantech'),
        api.services.list({ company_code: 'cleantech' }),
      ]);

      setCustomerList(custs);
      setCompany(comp);

      // Merge backend services with default products
      const combinedMap = new Map<string, Service>();
      (DEFAULT_CLEANTECH_PRODUCTS as Service[]).forEach((p) => combinedMap.set(p.service_code, p));
      if (Array.isArray(services) && services.length > 0) {
        services.forEach((s) => combinedMap.set(s.service_code, s));
      }
      const combinedList = Array.from(combinedMap.values());
      setAvailableProducts(combinedList);
      setSearchResults(combinedList);

      if (custs.length > 0) {
        setSelectedCustomerId(custs[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial Cleantech data:', err);
    }
  };

  // Filter products as employee types in search bar
  useEffect(() => {
    if (!productSearchQuery.trim()) {
      setSearchResults(availableProducts);
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
    const newItem: CleantechItem = {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      is_header: false,
      item_name: prod.service_name,
      description: prod.description || '',
      qty: 1,
      uom: prod.default_uom || 'NOS',
      rate: Number(prod.standard_rate || 0),
      total: Number(prod.standard_rate || 0),
    };

    setItems((prev) => [...prev, newItem]);
    setSearchDropdownOpen(false);
    setProductSearchQuery('');
    setToastMsg(`Added "${prod.service_name}" to quotation table.`);
  };

  // Add custom blank item
  const handleAddCustomItem = () => {
    const newItem: CleantechItem = {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      is_header: false,
      item_name: 'CUSTOM SPARE / SERVICE PART',
      description: 'Part details / specification',
      qty: 1,
      uom: 'NOS',
      rate: 1000.0,
      total: 1000.0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Add section/category header row (e.g. VACUUM CLEANER 30LTRS PARTS)
  const handleAddHeaderRow = () => {
    const newHeader: CleantechItem = {
      id: `hdr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      is_header: true,
      item_name: 'NEW SECTION / CATEGORY HEADER',
      description: 'Section Header',
      qty: 0,
      uom: '',
      rate: 0,
      total: 0,
    };
    setItems((prev) => [...prev, newHeader]);
  };

  // Remove row
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof CleantechItem, value: any) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === 'qty' || field === 'rate') {
          const qty = field === 'qty' ? Number(value) : it.qty;
          const rate = field === 'rate' ? Number(value) : it.rate;
          updated.total = (qty || 0) * (rate || 0);
        }
        return updated;
      })
    );
  };

  // Step quantity with +/-
  const handleStepQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id || it.is_header) return it;
        const newQty = Math.max(1, (it.qty || 1) + delta);
        return {
          ...it,
          qty: newQty,
          total: newQty * it.rate,
        };
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.is_header ? 0 : Number(it.total) || 0), 0);
  const cgstRate = applyTax ? taxPercent / 2 : 0;
  const sgstRate = applyTax ? taxPercent / 2 : 0;
  const cgstAmount = applyTax ? (subtotal * cgstRate) / 100 : 0;
  const sgstAmount = applyTax ? (subtotal * sgstRate) / 100 : 0;
  const totalAmount = subtotal + (applyTax ? cgstAmount + sgstAmount : 0);

  // Convert Number to Indian Words
  const numberToWords = (num: number): string => {
    const n = Math.round(num);
    if (n === 0) return 'Zero Rupees Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n < 20) return a[n] + ' ';
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '') + ' ';
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + (n % 100 ? inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 ? inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 ? inWords(n % 10000000) : '');
    };
    return `${inWords(n).trim()} Rupees Only`;
  };

  // Save to Database safely
  const handleSaveToDatabase = async (): Promise<string | null> => {
    const validItems = items.filter((it) => !it.is_header);
    if (validItems.length === 0) {
      alert('Please add at least one spare or service item before saving.');
      return null;
    }

    setSaving(true);
    setToastMsg(null);
    try {
      // Find or create customer
      let targetCustId = selectedCustomerId;
      if (!targetCustId) {
        const newCust = await api.customers.create({
          company_name: customerName || 'UNIQUE SOLUTIONS',
          billing_address_line1: addressLine1 || 'Guindy Industrial Estate',
          billing_address_line2: addressLine2 || undefined,
          contact_person: contactPerson || 'Service Operations Head',
          phone: phone || '+91 98400 98765',
          email: email || undefined,
          gstin: gstin || undefined,
          billing_city: 'Chennai',
          billing_state: 'Tamil Nadu',
          billing_state_code: '33',
          billing_pincode: '600032',
          is_active: true,
        });
        targetCustId = newCust.id;
        setSelectedCustomerId(newCust.id);
      }

      // Convert items to payload
      const payloadItems = items.map((it, idx) => ({
        item_name: it.item_name,
        description: it.is_header ? `HEADER:${it.item_name}` : (it.description || ''),
        quantity: it.is_header ? 0 : (Number(it.qty) || 1),
        uom: it.is_header ? '' : (it.uom || 'NOS'),
        unit_price: it.is_header ? 0 : Number(it.rate),
        applied_rate: it.is_header ? 0 : Number(it.rate),
        rate_source: 'catalogue',
        tax_rate: applyTax ? taxPercent : 0,
        line_total: it.is_header ? 0 : Number(it.total),
        item_order: idx + 1,
      }));

      // Quotation creation payload
      const payload = {
        customer_id: targetCustId,
        company_code: 'cleantech',
        quotation_number: quotationNo.trim() || 'CTS/0001',
        quotation_type: 'repair_service',
        quotation_date: toISODate(quotationDate),
        job_description: quotationTitle,
        notes: whyChooseUs.join('\n'),
        terms_and_conditions: terms.join('\n'),
        items: payloadItems,
        sections: [],
        tax_rate: applyTax ? taxPercent : 0,
        discount_type: 'none',
        discount_value: 0,
      };

      let res;
      if (savedQuoteId) {
        res = await api.quotations.update(savedQuoteId, payload);
      } else {
        res = await api.quotations.create(payload);
        setSavedQuoteId(res.id);
      }
      setToastMsg(`Quotation ${res.quotation_number} saved successfully!`);
      return res.id;
    } catch (err: any) {
      console.error('Save quotation error:', err);
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
        setToastMsg('Generating Word (.docx) document with authentic letterhead...');
        await api.quotations.downloadDocx(quoteId, `${quotationNo.replace(/[\/\\]/g, '_')}_Cleantech.docx`);
        setToastMsg('Word document (.docx) downloaded successfully!');
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
        await api.quotations.downloadPdf(quoteId, `${quotationNo.replace(/[\/\\]/g, '_')}_Cleantech.pdf`);
        setToastMsg('Official PDF downloaded successfully!');
      }
    } catch (err: any) {
      console.error('Download PDF error:', err);
      alert(err.message || 'Failed to download PDF');
    }
  };

  const handleOpenA4Preview = async () => {
    setInPagePreviewOpen(true);
    if (!savedQuoteId) {
      handleSaveToDatabase();
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
            onClick={() => onNavigate('cleantech_quotes')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="View Past Quotations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                Cleantech Services Quotation Generator
              </h1>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive proposal builder matching authentic Cleantech Services letterhead & quotation format.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Word (.docx) */}
          <button
            type="button"
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
            type="button"
            onClick={handleDownloadPdf}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            title="Download official PDF with letterhead"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Download PDF</span>
          </button>

          {/* Preview A4 */}
          <button
            type="button"
            onClick={handleOpenA4Preview}
            disabled={saving}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Preview A4</span>
          </button>

          {/* Save to DB */}
          <button
            type="button"
            onClick={() => handleSaveToDatabase()}
            disabled={saving}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save to DB'}</span>
          </button>
        </div>
      </div>

      {/* Main Quotation Document Sheet (A4 Letterhead Flush Width) */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl overflow-hidden text-slate-800">
        
        {/* 1. Authentic Header Flush to the very ends of the page (Edge-to-Edge) */}
        <div className="w-full bg-white border-b-2 border-teal-600 p-0 m-0">
          <img
            src="/headers/header_cleantech.png"
            alt="Cleantech Services Official Letterhead Header"
            className="w-full h-auto object-cover block select-none"
            style={{ width: '100%', display: 'block' }}
          />
        </div>

        <div className="p-6 md:p-10 space-y-7">
          
          {/* 2. Heading Selector: 5 Options + Directly Editable Title */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
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
                        ? 'bg-teal-600 text-white font-black shadow-xs ring-2 ring-teal-700'
                        : 'bg-white text-slate-700 hover:bg-teal-100 border border-teal-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-teal-800 mb-1">
                Editable Document Heading (Centered on Document):
              </label>
              <input
                type="text"
                value={quotationTitle}
                onChange={(e) => setQuotationTitle(e.target.value.toUpperCase())}
                className="w-full text-center text-lg md:text-xl font-black text-slate-950 bg-white border border-teal-300 rounded-xl py-2 px-3 tracking-wide uppercase focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
            </div>
          </div>

          {/* 3. Metadata & "To :" Client Address Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-4 border-b border-slate-200">
            {/* Left: Client Address ("To :") */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  To :
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
                  placeholder="Client / Company Name (e.g. UNIQUE SOLUTIONS)"
                  className="w-full text-sm font-black text-slate-900 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-teal-500 uppercase tracking-wide bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Address Line 1"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="City, State - Pincode"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
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

            {/* Right: Quotation Number & Date in DD/MM/YYYY (Indian Standard) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Quotation No :-
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quotationNo}
                    onChange={(e) => setQuotationNo(e.target.value.toUpperCase())}
                    className="w-full text-sm font-mono font-black text-slate-900 border border-slate-300 rounded-xl p-2 bg-white uppercase focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await api.quotations.getNextNumber('cleantech', 'short');
                      if (res?.next_number) setQuotationNo(res.next_number);
                    }}
                    className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700"
                    title="Fetch latest sequence from database"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Format: CTS/0001 (auto-increments in DB). Fully editable.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Date :-
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                    placeholder="DD/MM/YYYY (e.g. 29/10/2026)"
                    className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded-xl p-2.5 bg-white pr-9 focus:ring-1 focus:ring-teal-500"
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
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Indian order: DD/MM/YYYY. Directly editable or click calendar icon.
                </span>
              </div>
            </div>
          </div>

          {/* 4. Why Choose Clean Tech? (Authentic 10 bullets from PDF) */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-600" />
                Why Choose Clean Tech?
              </span>
              <span className="text-[10px] text-slate-400 font-mono">10 Key Advantages from Authentic Proposal</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              {whyChooseUs.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <span className="leading-snug">{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Product Search Bar for Cleantech Spares & Services */}
          <div className="space-y-2 relative" ref={searchContainerRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-teal-600" />
                <span>Search & Add Cleantech Spares / Machine Parts / Services:</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddHeaderRow}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>+ Section Header Row</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="text-xs font-bold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Custom Spare Item</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Cleantech parts (e.g. Hose, Filter Bag, Steel Pipe, Wet Tool, Dry Tool, Motor, Solar Wash, Facade)..."
                value={productSearchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setProductSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-white border-2 border-teal-300 rounded-2xl shadow-xs focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
            </div>

            {/* Instant Search Results Dropdown */}
            {searchDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 max-h-72 overflow-y-auto p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 border-b border-slate-100">
                  Select Product / Spare to Add:
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-bold">
                    No matching spares found. Click "+ Custom Spare Item" to add custom line.
                  </div>
                ) : (
                  searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className="p-3 hover:bg-teal-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between border-b border-slate-50 last:border-none"
                    >
                      <div>
                        <div className="font-black text-xs text-slate-900">{p.service_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Code: {p.service_code} • UOM: {p.default_uom}
                          {p.description && ` • ${p.description}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-teal-800">
                          ₹{Number(p.standard_rate).toLocaleString('en-IN')}/{p.default_uom}
                        </div>
                        <span className="text-[10px] bg-teal-500 text-white px-2 py-0.5 rounded font-black uppercase">
                          + Add Item
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 6. Products Line Items Table (Matching PDF: SL NO | DESCRIPTION | QTY | UOM | RATE | TOTAL) */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3 text-center w-14">SL NO</th>
                  <th className="py-3 px-3 text-left">DESCRIPTION</th>
                  <th className="py-3 px-2 text-center w-24">QTY</th>
                  <th className="py-3 px-2 text-center w-20">UOM</th>
                  <th className="py-3 px-3 text-right w-36">RATE (₹)</th>
                  <th className="py-3 px-3 text-right w-36">TOTAL (₹)</th>
                  <th className="py-3 px-2 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                      No items added yet. Use the search bar above to add spares or services.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    if (item.is_header) {
                      return (
                        <tr key={item.id} className="bg-teal-100/70 border-t-2 border-b-2 border-teal-300">
                          <td className="py-2.5 px-3 text-center font-black text-teal-900">
                            I
                          </td>
                          <td colSpan={5} className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.item_name}
                              onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value.toUpperCase())}
                              className="w-full font-black text-xs text-teal-950 bg-transparent border-none focus:outline-none tracking-wider uppercase"
                              placeholder="CATEGORY / SECTION HEADER (e.g. VACUUM CLEANER 30LTRS PARTS)"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 hover:bg-rose-100 text-rose-500 rounded"
                              title="Remove Header"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* SL NO */}
                        <td className="py-3 px-3 text-center font-bold text-slate-600 align-top">
                          {idx}.
                        </td>

                        {/* Description */}
                        <td className="py-3 px-3 align-top space-y-1">
                          <input
                            type="text"
                            value={item.item_name}
                            onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value.toUpperCase())}
                            className="w-full font-black text-xs text-slate-900 border border-slate-300 rounded-lg p-1.5 focus:ring-1 focus:ring-teal-500 uppercase"
                            placeholder="Part / Service Name"
                          />
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            className="w-full text-[11px] text-slate-500 border border-slate-200 rounded px-1.5 py-0.5"
                            placeholder="Specifications / notes"
                          />
                        </td>

                        {/* Qty with + and - steppers */}
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
                              value={item.qty}
                              onChange={(e) => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
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

                        {/* Rate */}
                        <td className="py-3 px-3 text-right align-top">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-28 text-right font-black text-xs border border-slate-300 rounded-lg p-1.5"
                          />
                        </td>

                        {/* Total Amount */}
                        <td className="py-3 px-3 text-right font-black text-slate-900 align-top text-sm">
                          ₹ {Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Box (SUB TOTAL, CGST 9%, SGST 9%, TOTAL) */}
          <div className="flex justify-end">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-300 w-full sm:w-96 space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>SUB TOTAL:</span>
                <span className="font-mono text-slate-900 font-black">
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

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center bg-teal-500/20 p-2.5 rounded-xl">
                <span className="text-sm font-black text-slate-950">TOTAL:</span>
                <span className="text-base font-black text-teal-900 font-mono">
                  ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 font-semibold italic">
                Amount in Words: <strong>{numberToWords(totalAmount)}</strong>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-bold text-slate-700">Include GST (18%) in Calculation</span>
                </label>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* EXACT LAST SECTIONS STACKED: Terms & Conditions -> Our Services -> Bank Details & Signatory */}
          {/* ============================================================== */}

          {/* 7. Terms & Conditions (Matching PDF) */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-black text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Terms & Conditions</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
              {terms.map((term, i) => (
                <li key={i} className="leading-snug">{term}</li>
              ))}
            </ul>
          </div>

          {/* 8. Our Services (Matching PDF) */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-black text-xs text-slate-900 uppercase tracking-wide">
              Our Services
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
              {OUR_SERVICES.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Company's Bank Details & Signatory (Cleantech) */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                <span className="font-black text-xs tracking-wider uppercase text-teal-400">
                  Company's Bank Details & Signatory (Cleantech Services)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Managed by <strong>Unified Admin → Manage 4 Companies</strong>
              </span>
            </div>

            {/* Bank Details Block */}
            <div className="space-y-1.5 text-xs text-slate-200">
              <div className="font-black text-sm text-white mb-2">Company's Bank Details</div>
              <div>• A/c Holder's Name : <strong className="text-white">{company?.bank_account_name || company?.company_name || 'CLEANTECH'}</strong></div>
              <div>• Bank Name : <strong className="text-white">{company?.bank_name || 'IDFC BANK'}</strong></div>
              <div>• A/c No. : <strong className="text-white font-mono">{company?.bank_account_no || '73388820361'}</strong></div>
              <div>• Branch & IFS Code: <strong className="text-white font-mono">{company?.bank_branch || 'Chennai – Iyyapanthangal Branch'} & {company?.bank_ifsc || 'IDFB0081831'}</strong></div>
            </div>

            {/* Signatory ON THE LEFT */}
            <div className="pt-2 text-left space-y-1 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300">
                For {company?.company_name || 'Clean tech'}
              </div>
              <div className="text-base font-black text-white pt-3">
                {company?.bank_account_name || 'Mr. Manikandan Balamurugan'}
              </div>
              <div className="text-xs text-teal-400 font-semibold">
                Sales and Service Head
              </div>
              <div className="text-xs text-slate-300">
                {company?.phone1 || company?.phone2 || '+ 91 7338882036'}
              </div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider pt-2">
                Authorised Signatory
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3 italic text-left">
              This is a computer generated document and authenticated by Cleantech Services. Hence, it can be considered valid even if not signed manually.
            </div>
          </div>

          {/* 10. Authentic Footer Image Flush Edge-to-Edge */}
          <div className="w-full bg-white border-t border-slate-200 p-0 m-0">
            <img
              src="/headers/footer_cleantech.png"
              alt="Cleantech Services Official Footer"
              className="w-full h-auto object-cover block select-none"
              style={{ width: '100%', display: 'block' }}
            />
          </div>

        </div>
      </div>

      {/* Bottom Quick-Action Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500 font-medium">
          Ready to export quotation <strong>{quotationNo}</strong>?
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={saving}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            title="Download formatted Microsoft Word document with letterhead"
          >
            <FileText className="w-4 h-4" />
            <span>Download Word (.docx)</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            title="Download official PDF with letterhead"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            onClick={handleOpenA4Preview}
            disabled={saving}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Preview A4</span>
          </button>
          <button
            type="button"
            onClick={() => handleSaveToDatabase()}
            disabled={saving}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save to DB'}</span>
          </button>
        </div>
      </div>

      {/* Instant A4 Sheet Preview Modal */}
      {inPagePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-400" />
                <span className="font-black text-sm">A4 Document Print Preview — Cleantech Services</span>
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
                  className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
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

            {/* A4 Sheet Preview Body */}
            <div className="p-8 max-h-[80vh] overflow-y-auto space-y-6 bg-slate-100">
              <div className="bg-white p-6 shadow-md rounded-2xl space-y-6 max-w-3xl mx-auto border border-slate-200">
                <img src="/headers/header_cleantech.png" className="w-full block" alt="Header" />
                
                <div className="text-center font-black text-lg text-slate-950 uppercase underline">
                  {quotationTitle}
                </div>

                <div className="flex justify-between text-xs">
                  <div>
                    <div className="font-black text-slate-900">To :</div>
                    <div className="font-black text-sm text-slate-900 uppercase">{customerName}</div>
                    <div>{addressLine1}</div>
                    <div>{addressLine2}</div>
                    {contactPerson && <div>Attn: {contactPerson}</div>}
                    {phone && <div>Ph: {phone}</div>}
                  </div>
                  <div className="text-right">
                    <div>Quotation No :- <strong>{quotationNo}</strong></div>
                    <div>Date :- <strong>{quotationDate}</strong></div>
                  </div>
                </div>

                {/* Why Choose Clean Tech in Preview */}
                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="font-bold mb-1 text-slate-900">Why Choose Clean Tech?</div>
                  <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 list-disc list-inside">
                    {whyChooseUs.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                {/* Table */}
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2 text-center w-12">SL NO</th>
                      <th className="p-2 text-left">DESCRIPTION</th>
                      <th className="p-2 text-center w-16">QTY</th>
                      <th className="p-2 text-center w-16">UOM</th>
                      <th className="p-2 text-right w-24">RATE</th>
                      <th className="p-2 text-right w-24">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      if (it.is_header) {
                        return (
                          <tr key={it.id} className="bg-teal-100 font-bold border-t border-b border-teal-300">
                            <td className="p-1.5 text-center">I</td>
                            <td colSpan={5} className="p-1.5 uppercase text-teal-950">{it.item_name}</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={it.id} className="border-t border-slate-200">
                          <td className="p-2 text-center font-bold">{idx}.</td>
                          <td className="p-2">
                            <div className="font-bold text-slate-900 uppercase">{it.item_name}</div>
                            {it.description && <div className="text-[10px] text-slate-500">{it.description}</div>}
                          </td>
                          <td className="p-2 text-center font-bold">{it.qty}</td>
                          <td className="p-2 text-center">{it.uom}</td>
                          <td className="p-2 text-right">₹{Number(it.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2 text-right font-bold">₹{Number(it.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-slate-300 font-bold bg-slate-50">
                      <td colSpan={5} className="p-2 text-right">SUB TOTAL:</td>
                      <td className="p-2 text-right">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {applyTax && (
                      <>
                        <tr className="border-t border-slate-200 text-slate-700">
                          <td colSpan={5} className="p-1.5 text-right">CGST (9%):</td>
                          <td className="p-1.5 text-right">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="border-t border-slate-200 text-slate-700">
                          <td colSpan={5} className="p-1.5 text-right">SGST (9%):</td>
                          <td className="p-1.5 text-right">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </>
                    )}
                    <tr className="border-t-2 border-slate-900 font-black bg-teal-100 text-sm">
                      <td colSpan={5} className="p-2 text-right">TOTAL:</td>
                      <td className="p-2 text-right">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Terms & Conditions */}
                <div className="text-xs space-y-1">
                  <div className="font-bold">Terms & Conditions:</div>
                  <ul className="list-disc list-inside text-slate-700">
                    {terms.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>

                {/* Our Services */}
                <div className="text-xs space-y-1">
                  <div className="font-bold">Our Services:</div>
                  <ul className="list-disc list-inside text-slate-700">
                    {OUR_SERVICES.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                {/* Bank Details */}
                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="font-bold">Company's Bank Details</div>
                  <div>• A/c Holder's Name : {company?.bank_account_name || company?.company_name || 'CLEANTECH'}</div>
                  <div>• Bank Name : {company?.bank_name || 'IDFC BANK'}</div>
                  <div>• A/c No. : {company?.bank_account_no || '73388820361'}</div>
                  <div>• Branch & IFS Code: {company?.bank_branch || 'Chennai – Iyyapanthangal Branch'} & {company?.bank_ifsc || 'IDFB0081831'}</div>
                </div>

                {/* Signatory on LEFT */}
                <div className="text-left text-xs pt-2">
                  <div className="font-bold">For {company?.company_name || 'Clean tech'}</div>
                  <div className="font-black text-sm pt-4">{company?.bank_account_name || 'Mr. Manikandan Balamurugan'}</div>
                  <div className="text-slate-600">Sales and Service Head</div>
                  <div className="text-slate-600">{company?.phone1 || company?.phone2 || '+ 91 7338882036'}</div>
                  <div className="font-bold pt-1">Authorised Signatory</div>
                </div>

                <img src="/headers/footer_cleantech.png" className="w-full block" alt="Footer" />
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 shrink-0">
              <span className="text-xs text-slate-400">
                Format: Authentic Cleantech Services A4 Letterhead
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInPagePreviewOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
