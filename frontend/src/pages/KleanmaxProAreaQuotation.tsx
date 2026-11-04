import React, { useState, useEffect, useRef } from 'react';
import { Customer, Service, User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  Download, FileText, Printer, Save, CheckCircle2,
  Calendar, Layers, ShieldCheck, Sparkles, Plus, Trash2, ArrowLeft,
  Search, Lock, Eye, Check, ChevronDown, Building, Phone, Mail, MapPin,
  RefreshCw, Info, HelpCircle, Image as ImageIcon, X
} from 'lucide-react';

interface QuotationProductItem {
  id: string;
  item_name: string;
  image_url?: string;
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

const DEFAULT_NOTES = `NOTE :
1. TRANSPORT IS CUSTOMER SCOPE.
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

// Default Kleanmax Pro rental products ready immediately in search bar
const DEFAULT_KLEANMAXPRO_PRODUCTS: Partial<Service>[] = [
  {
    id: 'kmp-rb800-seed',
    service_code: 'KMP-RENT-RB800',
    service_name: 'RIDE ON SCRUBBER MACHINE RB-800',
    category: 'rental',
    company_code: 'kleanmaxpro',
    default_uom: 'NOS',
    standard_rate: 32000.0,
    is_active: true,
    description: `BRUSH SCRUBBING WIDTH - 800mm
SUCTION WIDTH - 1100mm
COVERAGE AREA - 4800M.SQ/HR
WORKING SPEED - 6KM/HR
AIRFLOW RATE - 33L/SEC
VACCUM PRESSURE - 1650MM
POWER - 24V
TOTAL POWER - 2400W
BRUSH MOTOR - 2*550W
VACCUM MOTOR - 550W
PERFORMANCE - 1950 m2/hr
TANK CAPACITY - 120LTRS
DIAMETRE OF BRUSH - 405MM
DRIVER MOTOR POWER - 750MM`,
  },
  {
    id: 'kmp-rb650-seed',
    service_code: 'KMP-RENT-RB650',
    service_name: 'RIDE ON SCRUBBER MACHINE RB-650',
    category: 'rental',
    company_code: 'kleanmaxpro',
    default_uom: 'NOS',
    standard_rate: 27000.0,
    is_active: true,
    description: `Scrubbing Width: 650 mm
Suction / Squeegee Width: 870 mm
Theoretical Area Coverage: 4,225 m2/hr
Working Speed: Up to 6.5 km/hr (Travel speed up to 7 km/hr)
Power Supply / Battery: 24 V DC / 200 Ah
Total Power: 1,600 W
Brushes: 2 disc brushes, 333 mm diameter each, running at 180 RPM
Brush Pressure: 25 kg (with additional brush pressure option)
Solution / Fresh Water Tank: 100 L
Recovery / Dirty Water Tank: 100 L`,
  },
  {
    id: 'kmp-bd5050-seed',
    service_code: 'KMP-RENT-BD5050',
    service_name: 'WALK BEHIND SCRUBBER DRYER BD-50/50',
    category: 'rental',
    company_code: 'kleanmaxpro',
    default_uom: 'NOS',
    standard_rate: 18000.0,
    is_active: true,
    description: `Working Width: 510 mm
Suction Width: 850 mm
Fresh / Dirty Water Tank: 50L / 50L
Theoretical Area Performance: 2000 m2/hr
Power: 24V Battery Operated`,
  },
  {
    id: 'kmp-bds43150-seed',
    service_code: 'KMP-RENT-BDS43150',
    service_name: 'SINGLE DISC SCRUBBER MACHINE BDS 43/150',
    category: 'rental',
    company_code: 'kleanmaxpro',
    default_uom: 'NOS',
    standard_rate: 8500.0,
    is_active: true,
    description: `Working Width: 430 mm
Brush Speed: 150 RPM
Power Rating: 1500 W
Cable Length: 15 m
Ideal for floor scrubbing, buffing, and crystallizing`,
  },
  {
    id: 'kmp-nt702-seed',
    service_code: 'KMP-RENT-NT702',
    service_name: 'INDUSTRIAL WET & DRY VACUUM CLEANER NT 70/2',
    category: 'rental',
    company_code: 'kleanmaxpro',
    default_uom: 'NOS',
    standard_rate: 6500.0,
    is_active: true,
    description: `Container Capacity: 70 L Stainless Steel
Motors: 2 x 1200 W Heavy Duty Bypass Motors
Air Flow: 2 x 74 L/s
Vacuum: 254 mbar`,
  },
  {
    id: 'kmp-hd615-seed',
    service_code: 'KMP-RENT-HD615',
    service_name: 'HIGH PRESSURE WASHER HD 6/15',
    category: 'rental',
    company_code: 'kleanmaxpro',
    default_uom: 'NOS',
    standard_rate: 9000.0,
    is_active: true,
    description: `Operating Pressure: 150 Bar
Max Pressure: 190 Bar
Flow Rate: 560 L/hr
Power Rating: 3.1 kW single phase`,
  },
];

export const KleanmaxProAreaQuotation: React.FC<KleanmaxProAreaQuotationProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  // 1. Heading Option & Text (Editable)
  const [selectedHeadingOption, setSelectedHeadingOption] = useState<string>('MONTHLY RENTAL QUOTATION');
  const [quotationTitle, setQuotationTitle] = useState<string>('MONTHLY RENTAL QUOTATION');

  // 2. Metadata: Quotation Number & Date in DD/MM/YYYY (Indian Format)
  const [quotationNo, setQuotationNo] = useState<string>('KMP/0001');
  const [quotationDate, setQuotationDate] = useState<string>(formatToIndianDate());

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

  // 5. Products & Items Table (With Machine Images)
  const [items, setItems] = useState<QuotationProductItem[]>([
    {
      id: 'item_1',
      item_name: 'RIDE ON SCRUBBER MACHINE RB-800',
      image_url: '/products/rb800.png',
      description: `BRUSH SCRUBBING WIDTH - 800mm
SUCTION WIDTH - 1100mm
COVERAGE AREA - 4800M.SQ/HR
WORKING SPEED - 6KM/HR
AIRFLOW RATE - 33L/SEC
VACCUM PRESSURE - 1650MM
POWER - 24V
TOTAL POWER - 2400W
BRUSH MOTOR - 2*550W
VACCUM MOTOR - 550W
PERFORMANCE - 1950 m2/hr
TANK CAPACITY - 120LTRS
DIAMETRE OF BRUSH - 405MM
DRIVER MOTOR POWER - 750MM`,
      days: 1,
      uom: 'NOS',
      rate: 32000.0,
      amount: 32000.0,
    },
    {
      id: 'item_2',
      item_name: 'RIDE ON SCRUBBER MACHINE RB-650',
      image_url: '/products/rb650.png',
      description: `Scrubbing Width: 650 mm
Suction / Squeegee Width: 870 mm
Theoretical Area Coverage: 4,225 m2/hr
Working Speed: Up to 6.5 km/hr (Travel speed up to 7 km/hr)
Power Supply / Battery: 24 V DC / 200 Ah
Total Power: 1,600 W
Brushes: 2 disc brushes, 333 mm diameter each, running at 180 RPM
Brush Pressure: 25 kg (with additional brush pressure option)
Solution / Fresh Water Tank: 100 L
Recovery / Dirty Water Tank: 100 L`,
      days: 1,
      uom: 'NOS',
      rate: 27000.0,
      amount: 27000.0,
    },
  ]);

  // Tax rates
  const [applyTax, setApplyTax] = useState<boolean>(true);
  const [taxPercent, setTaxPercent] = useState<number>(18);

  // 6. Product Search Bar State (Pre-populated with Kleanmax Pro products)
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<Service[]>(DEFAULT_KLEANMAXPRO_PRODUCTS as Service[]);
  const [searchResults, setSearchResults] = useState<Service[]>(DEFAULT_KLEANMAXPRO_PRODUCTS as Service[]);
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
      // 1. Fetch Next Quotation Number for Kleanmax Pro
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

      // Merge backend services with default machines, keeping RB-800 & RB-650 prioritized at top
      const combinedMap = new Map<string, Service>();
      (DEFAULT_KLEANMAXPRO_PRODUCTS as Service[]).forEach((p) => combinedMap.set(p.service_code, p));
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
      console.error('Failed to load initial Kleanmax Pro data:', err);
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

  // Associate product image automatically based on name/code
  const getProductImage = (name: string, code?: string): string => {
    const upper = (name + ' ' + (code || '')).toUpperCase();
    if (upper.includes('800')) return '/products/rb800.png';
    if (upper.includes('650')) return '/products/rb650.png';
    if (upper.includes('BD') || upper.includes('SCRUBBER')) return '/products/bd5050.png';
    return '/products/rb800.png';
  };

  // Add product from search bar to table
  const handleAddProduct = (prod: Service) => {
    const newItem: QuotationProductItem = {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      item_name: prod.service_name,
      image_url: getProductImage(prod.service_name, prod.service_code),
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
      image_url: '/products/rb800.png',
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

  // Save to Database safely
  const handleSaveToDatabase = async (): Promise<string | null> => {
    if (items.length === 0) {
      alert('Please add at least one product before saving or exporting.');
      return null;
    }

    setSaving(true);
    setToastMsg(null);
    try {
      // Find or create customer
      let targetCustId = selectedCustomerId;
      if (!targetCustId) {
        const newCust = await api.customers.create({
          company_name: customerName || 'ABANS FACILITY MANAGEMENT',
          billing_address_line1: addressLine1 || 'Perungudi Industrial Estate',
          billing_address_line2: addressLine2 || undefined,
          contact_person: contactPerson || 'Facility Head',
          phone: phone || '+91 98840 12345',
          email: email || undefined,
          gstin: gstin || undefined,
          billing_city: 'Chennai',
          billing_state: 'Tamil Nadu',
          billing_state_code: '33',
          billing_pincode: '600096',
          is_active: true,
        });
        targetCustId = newCust.id;
        setSelectedCustomerId(newCust.id);
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
        quotation_number: quotationNo.trim() || 'KMP/0001',
        quotation_type: 'rental',
        quotation_date: toISODate(quotationDate),
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
        await api.quotations.downloadDocx(quoteId, `${quotationNo.replace('/', '_')}_KleanmaxPro.docx`);
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
        await api.quotations.downloadPdf(quoteId, `${quotationNo.replace('/', '_')}_KleanmaxPro.pdf`);
        setToastMsg('Official PDF downloaded successfully!');
      }
    } catch (err: any) {
      console.error('Download PDF error:', err);
      alert(err.message || 'Failed to download PDF');
    }
  };

  const handleOpenA4Preview = async () => {
    setInPagePreviewOpen(true);
    // Also save in background if not yet saved so server side preview is ready
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
            <Download className="w-4 h-4 text-amber-400" />
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
            className="px-4 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save to DB'}</span>
          </button>
        </div>
      </div>

      {/* Main Quotation Document Sheet (A4 Letterhead Flush Width) */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl overflow-hidden text-slate-800">
        
        {/* 1. Authentic Header Flush to the very ends of the page (Edge-to-Edge) */}
        <div className="w-full bg-white border-b-2 border-slate-900 p-0 m-0">
          <img
            src="/headers/header_kleanmaxpro.png"
            alt="Kleanmax Pro Official Letterhead Header"
            className="w-full h-auto object-cover block select-none"
            style={{ width: '100%', display: 'block' }}
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

            {/* Right: Quotation Number & Date in DD/MM/YYYY (Indian Standard) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Revised Quotation No :-
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
                  Format: KMP/0001 (auto-increments in DB). Fully editable.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  DATE :-
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                    placeholder="DD/MM/YYYY (e.g. 04/11/2026)"
                    className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded-xl p-2.5 bg-white pr-9 focus:ring-1 focus:ring-amber-500"
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
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImage(p.service_name, p.service_code)}
                          alt={p.service_name}
                          className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-200 p-1 shrink-0"
                        />
                        <div>
                          <div className="font-black text-xs text-slate-900">{p.service_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Code: {p.service_code} • UOM: {p.default_uom}
                          </div>
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

          {/* 6. Products Line Items Table (With Machine Photos, Specs, Days, Monthly Rent) */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3 text-center w-12">SL NO</th>
                  <th className="py-3 px-3 text-center w-48 md:w-56">MACHINE PHOTO</th>
                  <th className="py-3 px-3 text-left">DESCRIPTION & TECHNICAL SPECIFICATIONS</th>
                  <th className="py-3 px-2 text-center w-24">DAYS / QTY</th>
                  <th className="py-3 px-2 text-center w-20">UOM</th>
                  <th className="py-3 px-3 text-right w-36">PER MONTHLY RENT (₹)</th>
                  <th className="py-3 px-3 text-right w-36">AMOUNT (₹)</th>
                  <th className="py-3 px-2 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                      No products added yet. Use the search bar above to add machines.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* SL NO */}
                      <td className="py-4 px-3 text-center font-bold text-slate-600 align-top">
                        {idx + 1}.
                      </td>

                      {/* MACHINE PHOTO - Prominent and filling the column */}
                      <td className="py-4 px-3 align-top text-center w-48 md:w-56 bg-slate-50/40">
                        <div className="w-full h-36 md:h-44 bg-white border-2 border-slate-200 rounded-2xl p-2.5 flex items-center justify-center overflow-hidden shadow-xs hover:border-amber-400 transition-colors">
                          <img
                            src={item.image_url || getProductImage(item.item_name)}
                            alt={item.item_name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={item.image_url || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'image_url', e.target.value)}
                            className="text-[10px] text-slate-500 border border-slate-200 rounded-lg px-2 py-1 w-full text-center bg-white"
                            placeholder="Image URL (/products/rb800.png)"
                            title="Machine Photo URL or Path"
                          />
                        </div>
                      </td>

                      {/* Description & Technical Specifications */}
                      <td className="py-4 px-3 align-top space-y-2">
                        <div>
                          <input
                            type="text"
                            value={item.item_name}
                            onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value)}
                            className="w-full font-black text-xs md:text-sm text-slate-900 border border-slate-300 rounded-xl p-2 focus:ring-1 focus:ring-amber-500 uppercase tracking-wide bg-slate-50/40"
                            placeholder="Machine Name / Title"
                          />
                        </div>

                        {/* Technical Specifications Textarea */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Technical Specifications:
                          </label>
                          <textarea
                            rows={7}
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            placeholder="Technical Specs (Brush width, suction width, coverage area, battery, tank, etc.)"
                            className="w-full text-[11px] font-mono text-slate-800 bg-white border border-slate-300 rounded-xl p-2.5 leading-relaxed focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
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

          {/* Financial Summary Box */}
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

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center bg-[#FED10C]/25 p-2.5 rounded-xl">
                <span className="text-sm font-black text-slate-950">TOTAL:</span>
                <span className="text-base font-black text-slate-950 font-mono">
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
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-bold text-slate-700">Include GST (18%) in Calculation</span>
                </label>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* EXACT LAST SECTION: ORDERED ONE BY ONE STACKED BELOW EACH OTHER */}
          {/* 1. NOTE -> 2. Advantages -> 3. Terms -> 4. Other Services -> 5. Company Details & Signatory (ON LEFT) */}
          {/* ============================================================== */}

          {/* 1. NOTE */}
          <div className="space-y-1.5 pt-4 border-t border-slate-200">
            <label className="block text-xs font-black uppercase text-slate-900 tracking-wider">
              NOTE :
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-3 leading-relaxed focus:ring-1 focus:ring-amber-500 uppercase"
            />
          </div>

          {/* 2. Advantages of Renting from Kleanmax Pro */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-black text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Advantages of Renting from Kleanmax Pro</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
              {ADVANTAGES.map((adv, i) => (
                <li key={i} className="leading-snug">{adv}</li>
              ))}
            </ul>
          </div>

          {/* 3. Terms & Conditions */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-black text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Terms & Conditions</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
              {TERMS_AND_CONDITIONS.map((term, i) => (
                <li key={i} className="leading-snug">{term}</li>
              ))}
            </ul>
          </div>

          {/* 4. Other Services */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-black text-xs text-slate-900 uppercase tracking-wide">
              Other Services
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
              {OTHER_SERVICES.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Company's Bank Details & Signatory ON THE LEFT LIKE A LETTER */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-5">
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

            {/* Bank Details Block */}
            <div className="space-y-1.5 text-xs text-slate-200">
              <div className="font-black text-sm text-white mb-2">Company's Bank Details</div>
              <div>• A/c Holder's Name : <strong className="text-white">{company?.bank_account_name || company?.company_name || 'KLEAN MAX PRO'}</strong></div>
              <div>• Bank Name : <strong className="text-white">{company?.bank_name || 'ICICI BANK KMP'}</strong></div>
              <div>• A/c No. : <strong className="text-white font-mono">{company?.bank_account_no || '027505010327'}</strong></div>
              <div>• Branch & IFS Code: <strong className="text-white font-mono">{company?.bank_branch || 'PORUR'} & {company?.bank_ifsc || 'ICIC0000275'}</strong></div>
            </div>

            {/* Partner Statement */}
            <div className="text-xs font-semibold text-slate-300 border-t border-slate-800 pt-3">
              {company?.company_name || 'Kleanmax Pro'} — Your trusted service partner for complete cleaning equipment solutions across South India.
            </div>

            {/* Klean Max Pro Signatory ON THE LEFT LIKE A LETTER */}
            <div className="pt-2 text-left space-y-1">
              <div className="text-xs font-bold text-slate-300">
                For {company?.company_name || 'Klean max pro'}
              </div>
              <div className="text-base font-black text-white pt-3">
                {company?.signatory_name || 'Mr. Manikandan'}
              </div>
              <div className="text-xs text-amber-400 font-semibold">
                {company?.signatory_designation || 'Service Head'}
              </div>
              <div className="text-xs text-slate-300">
                {company?.phone || company?.phone1 || '+ 91 7338882036'}
              </div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider pt-2">
                Authorised Signatory
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3 italic text-left">
              This is a computer generated document and authenticated by {company?.company_name || 'Klean max pro'}. Hence, it can be considered valid even if not signed manually.
            </div>
          </div>
        </div>

        {/* Bottom Authentic Footer Flush to Edges */}
        <div className="w-full bg-white border-t border-slate-200 p-0 m-0">
          <img
            src="/headers/footer_kleanmaxpro.png"
            alt="Kleanmax Pro Official Letterhead Footer"
            className="w-full h-auto object-cover block select-none"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      </div>

      {/* In-Page Instant A4 Preview Modal */}
      {inPagePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm tracking-wide">
                  A4 Proposal Live Preview — {quotationNo}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleDownloadDocx}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Word</span>
                </button>
                <button onClick={() => setInPagePreviewOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Sheet Preview Body */}
            <div className="p-8 max-h-[80vh] overflow-y-auto space-y-6 bg-slate-100">
              <div className="bg-white p-6 shadow-md rounded-2xl space-y-6 max-w-3xl mx-auto border border-slate-200">
                <img src="/headers/header_kleanmaxpro.png" className="w-full block" alt="Header" />
                
                <div className="text-center font-black text-lg text-slate-950 uppercase underline">
                  {quotationTitle}
                </div>

                <div className="flex justify-between text-xs">
                  <div>
                    <div className="font-black text-slate-900">TO :-</div>
                    <div className="font-black text-sm text-slate-900 uppercase">{customerName}</div>
                    <div>{addressLine1}</div>
                    <div>{addressLine2}</div>
                    {contactPerson && <div>Attn: {contactPerson}</div>}
                    {phone && <div>Ph: {phone}</div>}
                  </div>
                  <div className="text-right">
                    <div>Revised Quotation No :- <strong>{quotationNo}</strong></div>
                    <div>DATE :- <strong>{quotationDate}</strong></div>
                  </div>
                </div>

                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="font-bold mb-1">About Us:</div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{aboutUs}</p>
                </div>

                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2 text-center w-12">SL NO</th>
                      <th className="p-2 text-center w-36">MACHINE PHOTO</th>
                      <th className="p-2 text-left">DESCRIPTION & SPECIFICATIONS</th>
                      <th className="p-2 text-center w-16">Days</th>
                      <th className="p-2 text-center w-16">UOM</th>
                      <th className="p-2 text-right w-28">PER MONTHLY RENT</th>
                      <th className="p-2 text-right w-28">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={it.id} className="border-t border-slate-200">
                        <td className="p-2 text-center align-top font-bold">{idx + 1}.</td>
                        <td className="p-2 text-center align-top w-36 bg-slate-50/50">
                          {it.image_url && (
                            <div className="w-32 h-28 mx-auto bg-white border border-slate-200 rounded-xl p-1.5 flex items-center justify-center overflow-hidden">
                              <img src={it.image_url} alt={it.item_name} className="w-full h-full object-contain" />
                            </div>
                          )}
                        </td>
                        <td className="p-2 align-top">
                          <div className="font-bold text-slate-900 text-sm uppercase">{it.item_name}</div>
                          <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap mt-1 leading-snug">{it.description}</pre>
                        </td>
                        <td className="p-2 text-center font-bold align-top">{it.days}</td>
                        <td className="p-2 text-center align-top">{it.uom}</td>
                        <td className="p-2 text-right align-top">₹{Number(it.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 text-right font-bold align-top">₹{Number(it.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-300 font-bold bg-slate-50">
                      <td colSpan={6} className="p-2 text-right">SUB TOTAL:</td>
                      <td className="p-2 text-right">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {applyTax && (
                      <>
                        <tr className="border-t border-slate-200 text-slate-700">
                          <td colSpan={6} className="p-1.5 text-right">CGST (9%):</td>
                          <td className="p-1.5 text-right">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="border-t border-slate-200 text-slate-700">
                          <td colSpan={6} className="p-1.5 text-right">SGST (9%):</td>
                          <td className="p-1.5 text-right">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </>
                    )}
                    <tr className="border-t-2 border-slate-900 font-black bg-amber-100 text-sm">
                      <td colSpan={6} className="p-2 text-right">TOTAL:</td>
                      <td className="p-2 text-right">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-xs font-mono font-bold whitespace-pre-wrap">{notes}</div>

                <div className="text-xs space-y-1">
                  <div className="font-bold">Advantages of Renting from Kleanmax Pro:</div>
                  <ul className="list-disc list-inside text-slate-700">
                    {ADVANTAGES.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-bold">Terms & Conditions:</div>
                  <ul className="list-disc list-inside text-slate-700">
                    {TERMS_AND_CONDITIONS.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>

                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="font-bold">Company's Bank Details</div>
                  <div>• A/c Holder's Name : KLEAN MAX PRO</div>
                  <div>• Bank Name : ICICI BANK KMP</div>
                  <div>• A/c No. : 027505010327</div>
                  <div>• Branch & IFS Code: PORUR & ICIC0000275</div>
                </div>

                {/* Signatory on LEFT */}
                <div className="text-left text-xs pt-2">
                  <div className="font-bold">For Klean max pro</div>
                  <div className="font-black text-sm pt-4">Mr. Manikandan</div>
                  <div className="text-slate-600">Service Head</div>
                  <div className="text-slate-600">+ 91 7338882036</div>
                  <div className="font-bold pt-1">Authorised Signatory</div>
                </div>

                <img src="/headers/footer_kleanmaxpro.png" className="w-full block" alt="Footer" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KleanmaxProAreaQuotation;
