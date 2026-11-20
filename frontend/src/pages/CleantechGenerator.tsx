import React, { useState, useEffect, useRef } from 'react';
import { Customer, Service, CompanySetting, User } from '../services/types';
import { api } from '../services/api';
import { uploadImageToSupabase } from '../services/supabase';
import {
  FileText, Download, Eye, Save, Sparkles, Plus, Trash2,
  RefreshCw, CheckCircle2, ArrowLeft, Search, Check,
  ShieldCheck, Lock, X, Layers, Edit3, Building, Printer,
  Upload, Image as ImageIcon
} from 'lucide-react';

export interface CleantechGeneratorProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
  quotationId?: string | null;
}

export interface CleantechItem {
  id: string;
  is_header?: boolean;
  item_name: string;
  image_url?: string;
  description?: string;
  qty: number;
  uom: string;
  rate: number;
  total: number;
}

const HEADING_OPTIONS = [
  'SERVICE QUOTATION',
  'DAY RENTAL QUOTATION',
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
  quotationId,
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

  // Tax rates (Independent CGST, SGST, IGST with checkboxes & editable rates)
  const [applyCgst, setApplyCgst] = useState<boolean>(true);
  const [cgstRate, setCgstRate] = useState<number>(9);
  const [applySgst, setApplySgst] = useState<boolean>(true);
  const [sgstRate, setSgstRate] = useState<number>(9);
  const [applyIgst, setApplyIgst] = useState<boolean>(false);
  const [igstRate, setIgstRate] = useState<number>(18);

  // Toggleable Note
  const DEFAULT_CLEANTECH_NOTE = `NOTE :
1. All cleaning chemicals, consumables, and machine tools will be deployed by Cleantech Services.
2. Continuous power supply and clean water to be provided by the client free of cost.
3. Safe covered storage space for equipment and materials to be provided at the premises.`;
  const [notes, setNotes] = useState<string>(DEFAULT_CLEANTECH_NOTE);
  const [includeNote, setIncludeNote] = useState<boolean>(true);

  // Table Layout Style: 'standard' (compact without images) or 'with_images' (Kleanmax Pro style with machine photos and specs)
  const [tableLayout, setTableLayout] = useState<'standard' | 'with_images'>('standard');
  const [equipmentModalOpen, setEquipmentModalOpen] = useState<boolean>(false);
  const [modalSearch, setModalSearch] = useState<string>('');
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [columnHeaders, setColumnHeaders] = useState({
    slNo: 'SL NO',
    photo: 'MACHINE PHOTO',
    description: 'DESCRIPTION & TECHNICAL SPECIFICATIONS',
    qty: 'QTY',
    uom: 'UOM',
    rate: 'RATE (₹)',
    total: 'TOTAL (₹)',
  });

  // 6. Product Search Bar State
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<Service[]>(DEFAULT_CLEANTECH_PRODUCTS as Service[]);
  const [searchResults, setSearchResults] = useState<Service[]>(DEFAULT_CLEANTECH_PRODUCTS as Service[]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Customers & Company Setting
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [company, setCompany] = useState<CompanySetting | null>(null);

  // Directly Editable Company, Bank & Signatory Details
  const [companyName, setCompanyName] = useState<string>('Cleantech Services');
  const [companyAddress, setCompanyAddress] = useState<string>('NO 6, B6, Jayam Industrial Estate, Chettiyar agaram first main Road, Near Porur Toll Plaza, Vanagaram, Chennai - 600077');
  const [companyGstin, setCompanyGstin] = useState<string>('33BWHPM8908H2ZP9');
  const [companyPhone, setCompanyPhone] = useState<string>('+91 7338882036');
  const [bankAccountName, setBankAccountName] = useState<string>('CLEANTECH');
  const [bankName, setBankName] = useState<string>('IDFC BANK');
  const [bankAccountNo, setBankAccountNo] = useState<string>('73388820361');
  const [bankBranch, setBankBranch] = useState<string>('Chennai – Iyyapanthangal Branch');
  const [bankIfsc, setBankIfsc] = useState<string>('IDFB0081831');
  const [signatoryName, setSignatoryName] = useState<string>('Mr. Manikandan Balamurugan');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>('Sales and Service Head');
  const [editCompanyDetails, setEditCompanyDetails] = useState<boolean>(false);
  const [editTermsDetails, setEditTermsDetails] = useState<boolean>(false);

  // Status & Feedback
  const [saving, setSaving] = useState<boolean>(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(quotationId || null);
  const [isEditMode, setIsEditMode] = useState<boolean>(!!quotationId);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(!!quotationId);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [inPagePreviewOpen, setInPagePreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, [quotationId]);

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
      // 1. Fetch Customers & Company Details and full catalogue
      const [custs, comp, services, allServices] = await Promise.all([
        api.customers.list(),
        api.company.get('cleantech'),
        api.services.list({ company_code: 'cleantech' }),
        api.services.list({ is_active: true }),
      ]);

      setCustomerList(custs);
      setCompany(comp);

      if (comp) {
        if (comp.company_name) setCompanyName(comp.company_name);
        if (comp.address_line1) setCompanyAddress([comp.address_line1, comp.address_line2, comp.city, comp.state, comp.pincode].filter(Boolean).join(', '));
        if (comp.gstin) setCompanyGstin(comp.gstin);
        if (comp.signatory_phone) setCompanyPhone(comp.signatory_phone);
        else if (comp.phone1) setCompanyPhone(comp.phone1);
        if (comp.bank_account_name) setBankAccountName(comp.bank_account_name);
        if (comp.bank_name) setBankName(comp.bank_name);
        if (comp.bank_account_no) setBankAccountNo(comp.bank_account_no);
        if (comp.bank_branch) setBankBranch(comp.bank_branch);
        if (comp.bank_ifsc) setBankIfsc(comp.bank_ifsc);
        if (comp.signatory_name) setSignatoryName(comp.signatory_name);
        if (comp.signatory_designation) setSignatoryDesignation(comp.signatory_designation);
      }

      // Merge backend services with default products & all machines
      const combinedMap = new Map<string, Service>();
      (DEFAULT_CLEANTECH_PRODUCTS as Service[]).forEach((p) => combinedMap.set(p.service_code, p));
      if (Array.isArray(allServices) && allServices.length > 0) {
        allServices.forEach((s) => combinedMap.set(s.service_code, s));
      }
      if (Array.isArray(services) && services.length > 0) {
        services.forEach((s) => combinedMap.set(s.service_code, s));
      }
      const combinedList = Array.from(combinedMap.values());
      setAvailableProducts(combinedList);
      setSearchResults(combinedList);

      // If editing an existing quotation, fetch and restore full state
      if (quotationId) {
        setLoadingEdit(true);
        try {
          const q = await api.quotations.get(quotationId);
          if (q) {
            setSavedQuoteId(q.id);
            setIsEditMode(true);
            if (q.quotation_number) setQuotationNo(q.quotation_number);
            if (q.quotation_date) setQuotationDate(fromISODate(q.quotation_date));
            if (q.job_description) {
              setQuotationTitle(q.job_description);
              setSelectedHeadingOption(q.job_description);
            }

            // Restore from snapshot_json if available
            let snap: any = q.snapshot_json;
            if (typeof snap === 'string') {
              try { snap = JSON.parse(snap); } catch (e) {}
            }

            if (snap && typeof snap === 'object') {
              if (snap.quotationTitle) setQuotationTitle(snap.quotationTitle);
              if (snap.selectedHeadingOption) setSelectedHeadingOption(snap.selectedHeadingOption);
              if (snap.customerName) setCustomerName(snap.customerName);
              if (snap.addressLine1) setAddressLine1(snap.addressLine1);
              if (snap.addressLine2) setAddressLine2(snap.addressLine2);
              if (snap.contactPerson) setContactPerson(snap.contactPerson);
              if (snap.phone) setPhone(snap.phone);
              if (snap.email) setEmail(snap.email);
              if (snap.gstin) setGstin(snap.gstin);
              if (Array.isArray(snap.items) && snap.items.length > 0) {
                setItems(snap.items);
              }
              if (Array.isArray(snap.whyChooseUs) && snap.whyChooseUs.length > 0) {
                setWhyChooseUs(snap.whyChooseUs);
              }
              if (Array.isArray(snap.terms) && snap.terms.length > 0) {
                setTerms(snap.terms);
              }
              if (snap.companyName) setCompanyName(snap.companyName);
              if (snap.companyAddress) setCompanyAddress(snap.companyAddress);
              if (snap.companyGstin) setCompanyGstin(snap.companyGstin);
              if (snap.companyPhone) setCompanyPhone(snap.companyPhone);
              if (snap.bankAccountName) setBankAccountName(snap.bankAccountName);
              if (snap.bankName) setBankName(snap.bankName);
              if (snap.bankAccountNo) setBankAccountNo(snap.bankAccountNo);
              if (snap.bankBranch) setBankBranch(snap.bankBranch);
              if (snap.bankIfsc) setBankIfsc(snap.bankIfsc);
              if (snap.signatoryName) setSignatoryName(snap.signatoryName);
              if (snap.signatoryDesignation) setSignatoryDesignation(snap.signatoryDesignation);
              if (snap.applyCgst !== undefined || snap.applySgst !== undefined || snap.applyIgst !== undefined) {
                setApplyCgst(Boolean(snap.applyCgst));
                if (snap.cgstRate !== undefined) setCgstRate(Number(snap.cgstRate));
                setApplySgst(Boolean(snap.applySgst));
                if (snap.sgstRate !== undefined) setSgstRate(Number(snap.sgstRate));
                setApplyIgst(Boolean(snap.applyIgst));
                if (snap.igstRate !== undefined) setIgstRate(Number(snap.igstRate));
              } else if (snap.applyTax !== undefined) {
                const taxOn = Boolean(snap.applyTax);
                setApplyCgst(taxOn);
                setApplySgst(taxOn);
                setApplyIgst(false);
              }
              if (snap.include_note !== undefined) setIncludeNote(Boolean(snap.include_note));
              if (snap.notes_text) setNotes(snap.notes_text);
              if (snap.tableLayout) setTableLayout(snap.tableLayout);
              if (snap.columnHeaders) setColumnHeaders(snap.columnHeaders);
            } else {
              // Direct restore from database columns
              if (q.signatory_name) setSignatoryName(q.signatory_name);
              if (q.signatory_designation) setSignatoryDesignation(q.signatory_designation);
              if (q.customer) {
                setCustomerName(q.customer.company_name || '');
                setAddressLine1(q.customer.billing_address_line1 || '');
                setAddressLine2(`${q.customer.billing_city || ''} ${q.customer.billing_pincode ? `- ${q.customer.billing_pincode}` : ''}`.trim());
                setContactPerson(q.customer.contact_person || '');
                setPhone(q.customer.phone || '');
                setEmail(q.customer.email || '');
                setGstin(q.customer.gstin || '');
                setSelectedCustomerId(q.customer.id);
              }
              if (Array.isArray(q.items) && q.items.length > 0) {
                const parsedItems: CleantechItem[] = q.items.map((it: any, idx: number) => {
                  const isHeader = (it.description && it.description.startsWith('HEADER:')) || Number(it.quantity) === 0;
                  return {
                    id: it.id || `item_${idx}_${Date.now()}`,
                    is_header: isHeader,
                    item_name: it.item_name || '',
                    image_url: it.image_url || undefined,
                    description: isHeader ? 'Section Header' : (it.description || ''),
                    qty: isHeader ? 0 : (Number(it.quantity) || 1),
                    uom: isHeader ? '' : (it.uom || 'NOS'),
                    rate: isHeader ? 0 : Number(it.unit_price || it.applied_rate || 0),
                    total: isHeader ? 0 : Number(it.line_total || 0),
                  };
                });
                setItems(parsedItems);
              }
              if (q.notes) {
                setNotes(q.notes);
              }
              if (q.terms_and_conditions) {
                const lines = q.terms_and_conditions.split('\n').map((l: string) => l.trim()).filter(Boolean);
                if (lines.length > 0) setTerms(lines);
              }
              const hasCgst = Number(q.cgst_rate || 0) > 0 || Number(q.cgst_amount || 0) > 0;
              const hasSgst = Number(q.sgst_rate || 0) > 0 || Number(q.sgst_amount || 0) > 0;
              const hasIgst = Number(q.igst_rate || 0) > 0 || Number(q.igst_amount || 0) > 0;
              if (hasCgst || hasSgst || hasIgst) {
                setApplyCgst(hasCgst);
                if (q.cgst_rate) setCgstRate(Number(q.cgst_rate));
                setApplySgst(hasSgst);
                if (q.sgst_rate) setSgstRate(Number(q.sgst_rate));
                setApplyIgst(hasIgst);
                if (q.igst_rate) setIgstRate(Number(q.igst_rate));
              } else if (Number(q.tax_rate || 0) > 0 || Number(q.total_tax || 0) > 0) {
                setApplyCgst(true);
                setApplySgst(true);
                setApplyIgst(false);
              }
            }
          }
        } catch (err) {
          console.error('Failed to load existing quotation for editing:', err);
        } finally {
          setLoadingEdit(false);
        }
      } else {
        // New quotation: fetch next sequence number
        try {
          const nextNumRes = await api.quotations.getNextNumber('cleantech', 'short');
          if (nextNumRes && nextNumRes.next_number) {
            setQuotationNo(nextNumRes.next_number);
          }
        } catch (e) {
          console.warn('Fallback quotation number:', e);
        }
        if (custs.length > 0) {
          setSelectedCustomerId(custs[0].id);
        }
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

  // Helper to resolve product image or fallback
  const getProductImage = (name: string, code?: string) => {
    const upper = `${name} ${code || ''}`.toUpperCase();
    if (upper.includes('RB-800') || upper.includes('800')) return '/products/rb800.png';
    if (upper.includes('RB-650') || upper.includes('650')) return '/products/rb650.png';
    if (upper.includes('BD') || upper.includes('SCRUBBER')) return '/products/bd5050.png';
    return '/products/rb800.png';
  };

  // Upload row image to Supabase
  const handleImageUpload = async (id: string, file: File) => {
    setUploadingItemId(id);
    try {
      const publicUrl = await uploadImageToSupabase(file, 'cleantech');
      handleUpdateItem(id, 'image_url', publicUrl);
    } catch (err: any) {
      alert(err.message || 'Failed to upload image');
    } finally {
      setUploadingItemId(null);
    }
  };

  // Switch or populate existing row with selected catalogue product/machine
  const handleSelectProductForRow = (id: string, prod: Service) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const rate = Number(prod.standard_rate || item.rate || 0);
        return {
          ...item,
          item_name: prod.service_name,
          image_url: prod.image_url || getProductImage(prod.service_name, prod.service_code),
          description: prod.description || item.description,
          uom: prod.default_uom || item.uom,
          rate: rate,
          total: rate * (item.qty || 1),
        };
      })
    );
  };

  // Add product from search bar or modal to table
  const handleAddProduct = (prod: Service) => {
    const newItem: CleantechItem = {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      is_header: false,
      item_name: prod.service_name,
      image_url: prod.image_url || getProductImage(prod.service_name, prod.service_code),
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
      item_name: 'NEW CLEANING MACHINE / SPARE PART',
      image_url: '/products/rb800.png',
      description: 'Technical specifications, power rating, brush size & tank capacity',
      qty: 1,
      uom: 'NOS',
      rate: 15000.0,
      total: 15000.0,
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

  // Calculations (Independent CGST, SGST, IGST)
  const subtotal = items.reduce((acc, it) => acc + (it.is_header ? 0 : Number(it.total) || 0), 0);
  const activeCgstRate = applyCgst ? Number(cgstRate || 0) : 0;
  const activeSgstRate = applySgst ? Number(sgstRate || 0) : 0;
  const activeIgstRate = applyIgst ? Number(igstRate || 0) : 0;
  const cgstAmount = applyCgst ? (subtotal * activeCgstRate) / 100 : 0;
  const sgstAmount = applySgst ? (subtotal * activeSgstRate) / 100 : 0;
  const igstAmount = applyIgst ? (subtotal * activeIgstRate) / 100 : 0;
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const totalAmount = subtotal + totalTax;
  const combinedTaxRate = (applyCgst ? activeCgstRate : 0) + (applySgst ? activeSgstRate : 0) + (applyIgst ? activeIgstRate : 0);

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
        tax_rate: combinedTaxRate,
        line_total: it.is_header ? 0 : Number(it.total),
        item_order: idx + 1,
        image_url: it.image_url || null,
      }));

      // Snapshot JSON for full fidelity UI restore
      const snapshot = {
        tableLayout,
        columnHeaders,
        quotationTitle,
        selectedHeadingOption,
        customerName,
        addressLine1,
        addressLine2,
        contactPerson,
        phone,
        email,
        gstin,
        quotationNo,
        quotationDate,
        items,
        subtotal,
        applyCgst,
        cgstRate: activeCgstRate,
        cgstAmount,
        cgst: cgstAmount,
        applySgst,
        sgstRate: activeSgstRate,
        sgstAmount,
        sgst: sgstAmount,
        applyIgst,
        igstRate: activeIgstRate,
        igstAmount,
        igst: igstAmount,
        totalTax,
        totalAmount,
        finalTotal: totalAmount,
        include_note: includeNote,
        notes_text: notes,
        whyChooseUs,
        terms,
        applyTax: (applyCgst || applySgst || applyIgst),
        taxPercent: combinedTaxRate,
        companyName,
        companyAddress,
        companyGstin,
        companyPhone,
        bankAccountName,
        bankName,
        bankAccountNo,
        bankBranch,
        bankIfsc,
        signatoryName,
        signatoryDesignation,
        signatoryPhone: companyPhone,
        sigPhone: companyPhone,
      };

      // Quotation creation payload
      const payload = {
        customer_id: targetCustId,
        company_code: 'cleantech',
        quotation_number: quotationNo.trim() || 'CTS/0001',
        quotation_type: 'repair_service',
        quotation_date: toISODate(quotationDate),
        job_description: quotationTitle,
        notes: includeNote ? notes : '',
        terms_and_conditions: terms.join('\n'),
        items: payloadItems,
        sections: [],
        subtotal: subtotal,
        taxable_amount: subtotal,
        cgst_rate: activeCgstRate,
        cgst_amount: cgstAmount,
        sgst_rate: activeSgstRate,
        sgst_amount: sgstAmount,
        igst_rate: activeIgstRate,
        igst_amount: igstAmount,
        total_tax: totalTax,
        final_amount: totalAmount,
        tax_rate: combinedTaxRate,
        discount_type: 'none',
        discount_value: 0,
        snapshot_json: snapshot,
        client_name: customerName,
        client_address: addressLine1,
        client_phone: phone,
        client_gstin: gstin,
        attention_person: contactPerson,
        signatory_name: signatoryName,
        signatory_designation: signatoryDesignation,
        signatory_phone: companyPhone,
      };

      let res;
      if (savedQuoteId) {
        res = await api.quotations.update(savedQuoteId, payload);
        setToastMsg(`Quotation ${res.quotation_number} updated and saved to DB successfully!`);
      } else {
        res = await api.quotations.create(payload);
        setSavedQuoteId(res.id);
        setIsEditMode(true);
        setToastMsg(`Quotation ${res.quotation_number} created and saved to DB successfully!`);
      }
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

  const handleOpenA4Preview = () => {
    setInPagePreviewOpen(true);
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
                {isEditMode ? 'Cleantech Quotation Editor' : 'Cleantech Services Quotation Generator'}
              </h1>
            </div>
            <p className="text-[11px] text-slate-500">
              {isEditMode
                ? `Editing official quotation ${quotationNo} with live authentic letterhead preview.`
                : 'Interactive proposal builder matching authentic Cleantech Services letterhead & quotation format.'}
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
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : (isEditMode ? 'Update Quotation in DB' : 'Save to DB')}</span>
          </button>
        </div>
      </div>

      {/* Editing State Banner */}
      {isEditMode && (
        <div className="bg-teal-50 border border-teal-300 text-teal-950 px-4 py-3 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 bg-teal-600 text-white rounded text-[10px] font-black uppercase tracking-wider">
              EDITING MODE
            </span>
            <span className="text-xs font-bold text-teal-900">
              Quotation: <strong className="font-sans text-teal-950 font-black">{quotationNo}</strong> &bull; Client: <strong>{customerName || 'Selected Customer'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('cleantech_quotes')}
              className="px-2.5 py-1 text-xs font-bold text-teal-800 hover:text-teal-950 hover:bg-teal-100/60 rounded-lg transition-colors"
            >
              Back to Quotes
            </button>
            <button
              onClick={() => {
                setSavedQuoteId(null);
                setIsEditMode(false);
                onNavigate('cleantech_generator');
              }}
              className="px-3 py-1 bg-white border border-teal-300 hover:bg-teal-100 text-teal-900 text-xs font-extrabold rounded-lg shadow-2xs transition-all"
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
                  className="w-full font-sans font-bold border border-slate-300 rounded-lg p-2 uppercase"
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
                    className="w-full text-sm font-sans font-black text-slate-900 border border-slate-300 rounded-xl p-2 bg-white uppercase focus:ring-1 focus:ring-teal-500"
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
              <span className="text-[10px] text-slate-400 font-sans">10 Key Advantages from Authentic Proposal</span>
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

          {/* Table Layout Selector Bar & Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-teal-50 via-slate-50 to-teal-50 border border-teal-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5">
              <label className="text-xs font-black uppercase text-teal-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Table Layout Style:</span>
              </label>
              <select
                value={tableLayout}
                onChange={(e) => setTableLayout(e.target.value as any)}
                className="text-xs font-black bg-white text-teal-950 border-2 border-teal-400 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
              >
                <option value="standard">Standard (Compact Without Images)</option>
                <option value="with_images">With Machine Photos & Specs (Kleanmax Pro Style)</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setEquipmentModalOpen(true)}
                className="text-xs font-black text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Item / Product</span>
              </button>
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Custom Line</span>
              </button>
              <button
                type="button"
                onClick={handleAddHeaderRow}
                className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>+ Header Row</span>
              </button>
            </div>
          </div>

          {/* 5. Product Search Bar for Cleantech Spares & Services */}
          <div className="space-y-2 relative" ref={searchContainerRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-teal-600" />
                <span>Search & Add Cleantech Spares / Machine Parts / Services:</span>
              </label>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Cleantech products (e.g. RB-800, RB-650, Hose, Filter Bag, Steel Pipe, Wet Tool, Dry Tool, Motor)..."
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
                    No matching items found. Click "+ Custom Line" to add custom line.
                  </div>
                ) : (
                  searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className="p-3 hover:bg-teal-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between border-b border-slate-50 last:border-none"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url || getProductImage(p.service_name, p.service_code)}
                          alt={p.service_name}
                          className="w-10 h-10 object-contain bg-white rounded-lg border border-slate-200 p-0.5 shrink-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <div>
                          <div className="font-black text-xs text-slate-900">{p.service_name}</div>
                          <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                            Code: {p.service_code} • UOM: {p.default_uom}
                            {p.description && ` • ${p.description}`}
                          </div>
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

          {/* 6. Products Line Items Table (Conditional Layout: 'standard' or 'with_images') */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3 text-center w-14">{columnHeaders.slNo}</th>
                  {tableLayout === 'with_images' && (
                    <th className="py-3 px-3 text-center w-48 md:w-56">{columnHeaders.photo}</th>
                  )}
                  <th className="py-3 px-3 text-left">
                    {tableLayout === 'with_images' ? columnHeaders.description : 'DESCRIPTION'}
                  </th>
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
                    <td colSpan={tableLayout === 'with_images' ? 8 : 7} className="py-8 text-center text-slate-400 font-bold">
                      No items added yet. Click "+ Add Item / Product" or use the search bar above.
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
                          <td colSpan={tableLayout === 'with_images' ? 6 : 5} className="py-2.5 px-3">
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
                              className="p-1 hover:bg-rose-100 text-rose-500 rounded cursor-pointer"
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
                          {items.slice(0, idx + 1).filter(x => !x.is_header).length}.
                        </td>

                        {/* MACHINE PHOTO COLUMN (When tableLayout === 'with_images') */}
                        {tableLayout === 'with_images' && (
                          <td className="py-4 px-3 align-top text-center w-48 md:w-56 bg-slate-50/40">
                            <div className="w-full h-36 md:h-44 bg-white border-2 border-slate-200 rounded-2xl p-2.5 flex items-center justify-center overflow-hidden shadow-xs hover:border-teal-400 transition-colors">
                              <img
                                src={item.image_url || getProductImage(item.item_name)}
                                alt={item.item_name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="mt-2 space-y-1">
                              <label className="flex items-center justify-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-teal-800 transition-colors">
                                {uploadingItemId === item.id ? (
                                  <span className="animate-pulse">Uploading...</span>
                                ) : (
                                  <>
                                    <Upload className="w-3 h-3" />
                                    <span>Upload Image</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingItemId === item.id}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(item.id, file);
                                  }}
                                />
                              </label>
                              {item.image_url && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(item.id, 'image_url', '')}
                                  className="flex items-center justify-center gap-1 cursor-pointer bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2 py-1 text-[10px] font-bold text-rose-700 transition-colors w-full"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove Image</span>
                                </button>
                              )}
                              <input
                                type="text"
                                value={item.image_url || ''}
                                onChange={(e) => handleUpdateItem(item.id, 'image_url', e.target.value)}
                                className="text-[10px] text-slate-500 border border-slate-200 rounded-lg px-2 py-1 w-full text-center bg-white"
                                placeholder="Or paste image URL"
                                title="Product Photo URL or Supabase Path"
                              />
                            </div>
                          </td>
                        )}

                        {/* Description & Technical Specifications */}
                        <td className="py-3 px-3 align-top space-y-2">
                          {tableLayout === 'with_images' && (
                            <div>
                              <select
                                aria-label="Select machine from catalogue"
                                className="w-full text-[11px] font-bold text-slate-800 bg-teal-50/70 hover:bg-teal-100/60 border border-teal-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    const prod = availableProducts.find(p => p.id === val);
                                    if (prod) handleSelectProductForRow(item.id, prod);
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>-- Quick Select Product / Machine Option from Catalogue --</option>
                                {availableProducts.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.service_name} ({p.service_code}) - ₹{Number(p.standard_rate || 0).toLocaleString('en-IN')}/{p.default_uom || 'NOS'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <input
                              type="text"
                              value={item.item_name}
                              onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value.toUpperCase())}
                              className="w-full font-black text-xs md:text-sm text-slate-900 border border-slate-300 rounded-xl p-2 focus:ring-1 focus:ring-teal-500 uppercase tracking-wide bg-slate-50/40"
                              placeholder="Product / Machine / Part Name"
                            />
                          </div>

                          {tableLayout === 'with_images' ? (
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Technical Specifications & Details:
                              </label>
                              <textarea
                                rows={6}
                                value={item.description || ''}
                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                placeholder="Technical specifications, features, capacity, power, warranty..."
                                className="w-full text-[11px] font-sans text-slate-800 bg-white border border-slate-300 rounded-xl p-2.5 leading-relaxed focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                          ) : (
                            <div>
                              <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                className="w-full text-[11px] text-slate-600 border border-slate-200 rounded-lg px-2 py-1 font-sans"
                                placeholder="Specifications / notes"
                              />
                            </div>
                          )}
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
                            className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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

            {/* Table Footer Actions: Add Item, Reset Column Headers, Total Item Count */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEquipmentModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Item / Product</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>+ Custom Line</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddHeaderRow}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  <span>+ Header Row</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setColumnHeaders({
                      slNo: 'SL NO',
                      photo: 'MACHINE PHOTO',
                      description: 'DESCRIPTION & TECHNICAL SPECIFICATIONS',
                      qty: 'QTY',
                      uom: 'UOM',
                      rate: 'RATE (₹)',
                      total: 'TOTAL (₹)',
                    });
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  title="Reset column headers to default"
                >
                  Reset Headers
                </button>
              </div>
              <div className="text-xs text-slate-500 font-bold">
                Total Line Items: <span className="text-slate-900 font-black">{items.filter(x => !x.is_header).length}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary Box (SUB TOTAL, CGST, SGST, IGST, TOTAL) */}
          <div className="flex justify-end">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-300 w-full sm:w-96 space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>SUB TOTAL:</span>
                <span className="font-sans text-slate-900 font-black">
                  ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {applyCgst && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>CGST ({cgstRate}%):</span>
                  <span className="font-sans text-slate-900 font-bold">
                    ₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {applySgst && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>SGST ({sgstRate}%):</span>
                  <span className="font-sans text-slate-900 font-bold">
                    ₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {applyIgst && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>IGST ({igstRate}%):</span>
                  <span className="font-sans text-slate-900 font-bold">
                    ₹ {igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {!applyCgst && !applySgst && !applyIgst && (
                <div className="text-[11px] text-amber-700 italic">Taxes excluded / Extra</div>
              )}

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center bg-teal-500/20 p-2.5 rounded-xl">
                <span className="text-sm font-black text-slate-950">TOTAL:</span>
                <span className="text-base font-black text-teal-900 font-sans">
                  ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 font-semibold italic">
                Amount in Words: <strong>{numberToWords(totalAmount)}</strong>
              </div>

              {/* Independent GST Checkboxes with rate inputs (Kleanmax Pro style) */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                  GST Settings (Independent Checkboxes):
                </div>

                {/* CGST */}
                <div className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={applyCgst}
                      onChange={(e) => setApplyCgst(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>CGST</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      disabled={!applyCgst}
                      value={cgstRate}
                      onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
                      className="w-14 text-center text-xs font-bold border border-slate-300 rounded p-1 disabled:bg-slate-100"
                    />
                    <span className="text-xs text-slate-500 font-bold">%</span>
                  </div>
                </div>

                {/* SGST */}
                <div className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={applySgst}
                      onChange={(e) => setApplySgst(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>SGST</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      disabled={!applySgst}
                      value={sgstRate}
                      onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
                      className="w-14 text-center text-xs font-bold border border-slate-300 rounded p-1 disabled:bg-slate-100"
                    />
                    <span className="text-xs text-slate-500 font-bold">%</span>
                  </div>
                </div>

                {/* IGST */}
                <div className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={applyIgst}
                      onChange={(e) => setApplyIgst(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>IGST</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      disabled={!applyIgst}
                      value={igstRate}
                      onChange={(e) => setIgstRate(parseFloat(e.target.value) || 0)}
                      className="w-14 text-center text-xs font-bold border border-slate-300 rounded p-1 disabled:bg-slate-100"
                    />
                    <span className="text-xs text-slate-500 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* EXACT LAST SECTIONS STACKED: Note -> Terms & Conditions -> Our Services -> Bank Details & Signatory */}
          {/* ============================================================== */}

          {/* Toggleable Note Section with Checkbox */}
          <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeNote}
                  onChange={(e) => setIncludeNote(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="font-black text-xs text-slate-900 uppercase tracking-wide">
                  Include Note in Quotation
                </span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${includeNote ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                {includeNote ? 'Note Visible in Quotation' : 'Note Hidden in Final Format'}
              </span>
            </div>

            {includeNote ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Enter notes..."
                className="w-full text-xs font-medium text-slate-800 bg-white border border-amber-300 rounded-lg p-3 focus:outline-none focus:border-teal-500 leading-relaxed shadow-2xs"
              />
            ) : (
              <div className="text-xs text-slate-500 italic p-2 bg-white/60 rounded-lg border border-slate-200">
                Note is disabled and will be omitted completely from the preview, PDF, and DOCX exports.
              </div>
            )}
          </div>

          {/* 7. Terms & Conditions (Directly Editable) */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-black text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Terms & Conditions</span>
              </div>
              <button
                type="button"
                onClick={() => setEditTermsDetails(!editTermsDetails)}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-teal-50"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editTermsDetails ? 'Done Editing' : 'Edit Terms'}</span>
              </button>
            </div>

            {editTermsDetails ? (
              <div className="space-y-2 pt-1">
                {terms.map((term, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-5 text-right">{i + 1}.</span>
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => {
                        const newTerms = [...terms];
                        newTerms[i] = e.target.value;
                        setTerms(newTerms);
                      }}
                      className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:border-teal-500 focus:outline-none bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setTerms(terms.filter((_, idx) => idx !== i))}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                      title="Delete term"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTerms([...terms, ''])}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1 bg-teal-50 rounded-lg border border-teal-200"
                  >
                    + Add New Term
                  </button>
                  <button
                    type="button"
                    onClick={() => setTerms(DEFAULT_TERMS)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-1 bg-slate-100 rounded-lg"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                {terms.map((term, i) => (
                  <li key={i} className="leading-snug">{term}</li>
                ))}
              </ul>
            )}
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

          {/* 9. Company's Bank Details & Signatory (Cleantech - Directly Editable) */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-400" />
                <span className="font-black text-xs tracking-wider uppercase text-teal-400">
                  Company's Bank Details & Signatory (Cleantech Services)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditCompanyDetails(!editCompanyDetails)}
                className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editCompanyDetails ? 'Done Editing' : 'Edit Company Details'}</span>
              </button>
            </div>

            {editCompanyDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">A/c Holder Name</label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">A/c Number</label>
                  <input
                    type="text"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-sans font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">IFS Code</label>
                  <input
                    type="text"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-sans font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Branch Name</label>
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-teal-400 font-bold">Authorised Signatory Name</label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full bg-slate-800 border border-teal-500 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-teal-400 font-bold">Designation</label>
                  <input
                    type="text"
                    value={signatoryDesignation}
                    onChange={(e) => setSignatoryDesignation(e.target.value)}
                    className="w-full bg-slate-800 border border-teal-500 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs text-slate-200">
                <div className="font-black text-sm text-white mb-2">Company's Bank Details</div>
                <div>• A/c Holder's Name : <strong className="text-white">{bankAccountName}</strong></div>
                <div>• Bank Name : <strong className="text-white">{bankName}</strong></div>
                <div>• A/c No. : <strong className="text-white font-sans">{bankAccountNo}</strong></div>
                <div>• Branch & IFS Code: <strong className="text-white font-sans">{bankBranch} & {bankIfsc}</strong></div>
              </div>
            )}

            {/* Signatory ON THE LEFT (Directly In-Place Editable) */}
            <div className="pt-3 text-left space-y-2 border-t border-slate-800 max-w-sm">
              <div className="text-xs font-bold text-slate-300">
                For {companyName}
              </div>
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full text-sm font-black text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 focus:border-teal-400 rounded-lg px-2.5 py-1 focus:outline-none"
                  placeholder="Signatory Name (e.g. Mr. Manikandan Balamurugan)"
                  title="Click to edit signatory name"
                />
                <input
                  type="text"
                  value={signatoryDesignation}
                  onChange={(e) => setSignatoryDesignation(e.target.value)}
                  className="w-full text-xs font-bold text-teal-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 focus:border-teal-400 rounded-lg px-2.5 py-1 focus:outline-none"
                  placeholder="Signatory Designation (e.g. Sales and Service Head)"
                  title="Click to edit position / designation"
                />
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full text-xs font-sans text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 focus:border-teal-400 rounded-lg px-2.5 py-1 focus:outline-none"
                  placeholder="Signatory Phone (e.g. +91 7338882036)"
                  title="Click to edit phone number"
                />
              </div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider pt-1">
                Authorised Signatory
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3 italic text-left">
              This is a computer generated document and authenticated by {companyName}. Hence, it can be considered valid even if not signed manually.
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
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Print document"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
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
            <div className="p-4 md:p-8 max-h-[80vh] overflow-y-auto space-y-6 bg-slate-100">
              {/* PAGE 1 A4 SHEET (Flush Edge-to-Edge Header) */}
              <div className="bg-white shadow-md rounded-2xl max-w-3xl mx-auto border border-slate-200 overflow-hidden">
                <img
                  src="/headers/header_cleantech.png"
                  className="w-full block select-none border-b-2 border-teal-600 m-0 p-0"
                  alt="Cleantech Official Header"
                />
                
                <div className="p-6 md:p-8 space-y-6">
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
                        {tableLayout === 'with_images' && (
                          <th className="p-2 text-center w-28">MACHINE PHOTO</th>
                        )}
                        <th className="p-2 text-left">
                          {tableLayout === 'with_images' ? 'DESCRIPTION & TECHNICAL SPECIFICATIONS' : 'DESCRIPTION'}
                        </th>
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
                              <td colSpan={tableLayout === 'with_images' ? 6 : 5} className="p-1.5 uppercase text-teal-950 font-black">{it.item_name}</td>
                            </tr>
                          );
                        }
                        const img = it.image_url || getProductImage(it.item_name);
                        return (
                          <tr key={it.id} className="border-t border-slate-200">
                            <td className="p-2 text-center font-bold align-top">{items.slice(0, idx + 1).filter(x => !x.is_header).length}.</td>
                            {tableLayout === 'with_images' && (
                              <td className="p-2 text-center align-top w-28">
                                <div className="w-24 h-20 mx-auto bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center overflow-hidden">
                                  <img src={img} alt={it.item_name} className="w-full h-full object-contain" />
                                </div>
                              </td>
                            )}
                            <td className="p-2 align-top">
                              <div className="font-bold text-slate-900 uppercase">{it.item_name}</div>
                              {it.description && <div className="text-[10px] text-slate-600 whitespace-pre-line mt-1">{it.description}</div>}
                            </td>
                            <td className="p-2 text-center font-bold align-top">{it.qty}</td>
                            <td className="p-2 text-center align-top">{it.uom}</td>
                            <td className="p-2 text-right align-top">₹{Number(it.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-2 text-right font-bold align-top">₹{Number(it.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        );
                      })}
                      <tr className="border-t-2 border-slate-300 font-bold bg-slate-50">
                        <td colSpan={tableLayout === 'with_images' ? 6 : 5} className="p-2 text-right">SUB TOTAL:</td>
                        <td className="p-2 text-right">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      {applyCgst && (
                        <tr className="border-t border-slate-200 text-slate-700">
                          <td colSpan={tableLayout === 'with_images' ? 6 : 5} className="p-1.5 text-right font-medium">CGST ({cgstRate}%):</td>
                          <td className="p-1.5 text-right font-medium">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      {applySgst && (
                        <tr className="border-t border-slate-200 text-slate-700">
                          <td colSpan={tableLayout === 'with_images' ? 6 : 5} className="p-1.5 text-right font-medium">SGST ({sgstRate}%):</td>
                          <td className="p-1.5 text-right font-medium">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      {applyIgst && (
                        <tr className="border-t border-slate-200 text-slate-700">
                          <td colSpan={tableLayout === 'with_images' ? 6 : 5} className="p-1.5 text-right font-medium">IGST ({igstRate}%):</td>
                          <td className="p-1.5 text-right font-medium">₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      <tr className="border-t-2 border-slate-900 font-black bg-teal-100 text-sm">
                        <td colSpan={tableLayout === 'with_images' ? 6 : 5} className="p-2 text-right">TOTAL:</td>
                        <td className="p-2 text-right">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-right text-[10px] text-slate-400 font-bold">Page 1 of 2</div>
                </div>
              </div>

              {/* PAGE BREAK INDICATOR */}
              <div className="flex items-center justify-center gap-3 my-2">
                <div className="h-px bg-slate-300 w-24"></div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-200 px-3 py-1 rounded-full shadow-2xs">
                  Page 2 (Terms & Conditions, Bank Details, Signatures)
                </span>
                <div className="h-px bg-slate-300 w-24"></div>
              </div>

              {/* PAGE 2 A4 SHEET (Flush Edge-to-Edge Footer) */}
              <div className="bg-white shadow-md rounded-2xl max-w-3xl mx-auto border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
                    <span className="font-black text-sm text-slate-900 uppercase">
                      {companyName}
                    </span>
                    <span className="text-xs font-sans font-bold text-slate-600">
                      Quotation No: {quotationNo} • Page 2
                    </span>
                  </div>

                  {/* Toggleable Note in Preview (Completely disappears when off) */}
                  {includeNote && notes && (
                    <div className="text-xs bg-amber-50/80 p-3.5 rounded-lg border border-amber-300">
                      <div className="font-black text-slate-900 text-xs mb-1">NOTE :</div>
                      <div className="text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">{notes}</div>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <div className="text-xs space-y-2">
                    <div className="font-black text-slate-900 text-sm uppercase">Terms & Conditions:</div>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {terms.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>

                  {/* Our Services */}
                  <div className="text-xs space-y-2 pt-2">
                    <div className="font-black text-slate-900 text-sm uppercase">Our Services:</div>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {OUR_SERVICES.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  {/* Bank Details (Live from Editable State) */}
                  <div className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-black text-slate-900 mb-1">Company's Bank Details</div>
                    <div>• A/c Holder's Name : <strong>{bankAccountName}</strong></div>
                    <div>• Bank Name : <strong>{bankName}</strong></div>
                    <div>• A/c No. : <strong className="font-sans">{bankAccountNo}</strong></div>
                    <div>• Branch & IFS Code: <strong className="font-sans">{bankBranch} & {bankIfsc}</strong></div>
                  </div>

                  {/* Signatory ON LEFT (Mr. Manikandan Balamurugan above Sales and Service Head) */}
                  <div className="flex justify-between items-end pt-4">
                    <div className="text-left text-xs space-y-1">
                      <div className="font-bold text-slate-800">For {companyName}</div>
                      <div className="text-sm font-black text-slate-950 pt-2">{signatoryName}</div>
                      <div className="text-xs text-teal-700 font-bold">{signatoryDesignation}</div>
                      <div className="text-xs text-slate-500">{companyPhone}</div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 border-t border-slate-300 pt-1 mt-2 inline-block">Authorised Signatory</div>
                    </div>
                    <div className="text-xs text-slate-400 italic max-w-xs text-right">
                      This is a computer generated document authenticated by {companyName}.
                    </div>
                  </div>
                </div>

                {/* Footer Flush Edge-to-Edge */}
                <img
                  src="/headers/footer_cleantech.png"
                  className="w-full block select-none border-t border-slate-200 m-0 p-0"
                  alt="Cleantech Official Footer"
                />
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
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Print document"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
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

      {/* Equipment / Product Selection Modal */}
      {equipmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 md:p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-black tracking-wide flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-400" />
                  <span>Select Product / Machine / Spare from Catalogue</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Choose an item to automatically populate photo, technical specifications, and price.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEquipmentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar & Custom Option */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products (RB-800, RB-650, Vacuum, Hose, Pipe, Tool, Motor)..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleAddCustomItem();
                    setEquipmentModalOpen(false);
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-400" />
                  <span>+ Custom Line</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddHeaderRow();
                    setEquipmentModalOpen(false);
                  }}
                  className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-teal-200 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  <span>+ Header Row</span>
                </button>
              </div>
            </div>

            {/* Modal Products List */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-3">
              {availableProducts.filter(p => {
                if (!modalSearch.trim()) return true;
                const q = modalSearch.toLowerCase();
                return (
                  p.service_name.toLowerCase().includes(q) ||
                  p.service_code.toLowerCase().includes(q) ||
                  (p.category && p.category.toLowerCase().includes(q)) ||
                  (p.description && p.description.toLowerCase().includes(q))
                );
              }).length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold text-xs">
                  No items found matching "{modalSearch}". Click "+ Custom Line" to add a custom item.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableProducts
                    .filter(p => {
                      if (!modalSearch.trim()) return true;
                      const q = modalSearch.toLowerCase();
                      return (
                        p.service_name.toLowerCase().includes(q) ||
                        p.service_code.toLowerCase().includes(q) ||
                        (p.category && p.category.toLowerCase().includes(q)) ||
                        (p.description && p.description.toLowerCase().includes(q))
                      );
                    })
                    .map((p) => {
                      const img = p.image_url || getProductImage(p.service_name, p.service_code);
                      return (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all bg-white flex flex-col justify-between group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={img}
                                alt={p.service_name}
                                className="w-full h-full object-contain"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-xs text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                                {p.service_name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                                Code: {p.service_code} • {p.default_uom || 'NOS'}
                              </div>
                              <div className="text-xs font-black text-teal-700 mt-1">
                                ₹{Number(p.standard_rate || 0).toLocaleString('en-IN')}/{p.default_uom || 'NOS'}
                              </div>
                            </div>
                          </div>
                          {p.description && (
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-2 border-t border-slate-100 pt-1.5 font-sans">
                              {p.description}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              handleAddProduct(p);
                              setEquipmentModalOpen(false);
                            }}
                            className="mt-3 w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add to Quotation</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
