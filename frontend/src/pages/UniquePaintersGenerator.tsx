import React, { useState, useEffect, useRef } from 'react';
import { Customer, Service, User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  Download, FileText, Printer, Save, CheckCircle2,
  Calendar, Layers, ShieldCheck, Sparkles, Plus, Trash2, ArrowLeft,
  Search, Eye, Check, ChevronDown, Building, Phone, Mail, MapPin,
  RefreshCw, Info, HelpCircle, Image as ImageIcon, X, Paintbrush
} from 'lucide-react';

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
  quotationId?: string | null;
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
  quotationId,
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
  const [gstin, setGstin] = useState<string>('33AAAAU1234F1Z5');
  const [salutation, setSalutation] = useState<string>('DEAR SIR;');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerList, setCustomerList] = useState<Customer[]>([]);

  // 4. Content Blocks (Directly Editable)
  const [introText1, setIntroText1] = useState<string>(DEFAULT_INTRO_1);
  const [introText2, setIntroText2] = useState<string>(DEFAULT_INTRO_2);

  // 5. Scope Rows (Table: S.No, Description, Area sqft, Rate, Amount in INR)
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

  // Signatory (Dynamic from DB Company Settings)
  const [sigCompany, setSigCompany] = useState<string>('Unique Painters');
  const [sigName, setSigName] = useState<string>('Mr. Manikandan Balamurugan');
  const [sigTitle, setSigTitle] = useState<string>('Sales and Service Head');
  const [sigPhones, setSigPhones] = useState<string>('9710148218 / 7338882034');
  const [company, setCompany] = useState<CompanySetting | null>(null);

  // Search & Catalog
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const [availableProducts, setAvailableProducts] = useState<Partial<Service>[]>(DEFAULT_PAINT_CATALOG);
  const [searchResults, setSearchResults] = useState<Partial<Service>[]>(DEFAULT_PAINT_CATALOG);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // State & Feedback
  const [saving, setSaving] = useState<boolean>(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(quotationId || null);
  const [isEditMode, setIsEditMode] = useState<boolean>(!!quotationId);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(!!quotationId);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [inPagePreviewOpen, setInPagePreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, [quotationId]);

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
      const [comp, custs, services] = await Promise.all([
        api.company.get('uniquepainters').catch(() => null),
        api.customers.list().catch(() => []),
        api.services.list({ company_code: 'uniquepainters' }).catch(() => []),
      ]);

      if (comp) {
        setCompany(comp);
        if (comp.company_name) setSigCompany(comp.company_name);
        if (comp.signatory_name) setSigName(comp.signatory_name);
        else if (comp.bank_account_name) setSigName(comp.bank_account_name);
        if (comp.signatory_designation) setSigTitle(comp.signatory_designation);
        const phones = [comp.phone1, comp.phone2].filter(Boolean).join(' / ');
        if (phones) {
          setSigPhones(phones);
          setCallNotice(`Looking forward for your favourable orders. Please call - ${phones}.`);
        }
        if (comp.terms_and_conditions) {
          setTerms(comp.terms_and_conditions.split('\n').filter(Boolean));
        }
      }

      setCustomerList(custs);

      // Merge backend services with default paint products
      const combinedMap = new Map<string, Partial<Service>>();
      DEFAULT_PAINT_CATALOG.forEach((p) => combinedMap.set(p.service_code || '', p));
      if (Array.isArray(services) && services.length > 0) {
        services.forEach((s) => combinedMap.set(s.service_code, s));
      }
      const combinedList = Array.from(combinedMap.values());
      setAvailableProducts(combinedList);
      setSearchResults(combinedList);

      // If quotationId is provided, load existing quotation
      if (quotationId) {
        setLoadingEdit(true);
        try {
          const q = await api.quotations.get(quotationId);
          if (q) {
            setSavedQuoteId(q.id);
            setIsEditMode(true);
            if (q.quotation_number) setQuotationNo(q.quotation_number);
            if (q.quotation_date) setQuotationDate(fromISODate(q.quotation_date));

            let snap: any = q.snapshot_json;
            if (typeof snap === 'string') {
              try { snap = JSON.parse(snap); } catch (e) {}
            }

            if (snap && typeof snap === 'object') {
              if (snap.quotationTitle) setQuotationTitle(snap.quotationTitle);
              if (snap.customerName) setCustomerName(snap.customerName);
              if (snap.addressLine1) setAddressLine1(snap.addressLine1);
              if (snap.addressLine2) setAddressLine2(snap.addressLine2);
              if (snap.contactPerson) setContactPerson(snap.contactPerson);
              if (snap.phone) setPhone(snap.phone);
              if (snap.gstin) setGstin(snap.gstin);
              if (snap.salutation) setSalutation(snap.salutation);
              if (snap.introText1) setIntroText1(snap.introText1);
              if (snap.introText2) setIntroText2(snap.introText2);
              if (Array.isArray(snap.rows) && snap.rows.length > 0) setRows(snap.rows);
              if (Array.isArray(snap.machineries) && snap.machineries.length > 0) setMachineries(snap.machineries);
              if (Array.isArray(snap.terms) && snap.terms.length > 0) setTerms(snap.terms);
              if (snap.callNotice) setCallNotice(snap.callNotice);
              if (snap.satisfactionGoal) setSatisfactionGoal(snap.satisfactionGoal);
              if (snap.sigCompany) setSigCompany(snap.sigCompany);
              if (snap.sigName) setSigName(snap.sigName);
              if (snap.sigTitle) setSigTitle(snap.sigTitle);
              if (snap.sigPhones) setSigPhones(snap.sigPhones);
              if (snap.applyTax !== undefined) setApplyTax(snap.applyTax);
              if (snap.taxPercent !== undefined) setTaxPercent(snap.taxPercent);
            }
            if (q.signatory_name) setSigName(q.signatory_name);
            if (q.signatory_designation) setSigTitle(q.signatory_designation);
            if (!snap) {
              // Direct restore from database columns
              if (q.customer) {
                setCustomerName(q.customer.company_name || '');
                setAddressLine1(q.customer.billing_address_line1 || '');
                setAddressLine2(`${q.customer.billing_city || ''}${q.customer.billing_pincode ? ` - ${q.customer.billing_pincode}` : ''}`);
                setContactPerson(q.customer.contact_person || '');
                setPhone(q.customer.phone || '');
                if (q.customer.gstin) setGstin(q.customer.gstin);
                setSelectedCustomerId(q.customer.id);
              }
              if (Array.isArray(q.sections) && q.sections.length > 0) {
                const parsedRows: PaintingScopeRow[] = q.sections.map((s: any, idx: number) => ({
                  id: s.id || `row_${idx}_${Date.now()}`,
                  name: s.section_name || `PAINTING WORK AREA ${idx + 1}`,
                  service_type: s.service_name || 'ASIAN PAINTS',
                  description: s.notes || '',
                  area_sqft: Number(s.billable_area || s.calculated_area || 1000),
                  rate_per_sqft: Number(s.applied_rate || s.original_catalogue_rate || 25),
                  amount: Number(s.line_total || 25000),
                }));
                setRows(parsedRows);
              } else if (Array.isArray(q.items) && q.items.length > 0) {
                const parsedRows: PaintingScopeRow[] = q.items.map((it: any, idx: number) => ({
                  id: it.id || `row_${idx}_${Date.now()}`,
                  name: it.item_name || `PAINTING WORK AREA ${idx + 1}`,
                  service_type: 'ASIAN PAINTS',
                  description: it.description || '',
                  area_sqft: Number(it.quantity || 1000),
                  rate_per_sqft: Number(it.unit_price || 25),
                  amount: Number(it.line_total || 25000),
                }));
                setRows(parsedRows);
              }
              if (q.terms_and_conditions) {
                const lines = q.terms_and_conditions.split('\n').map((l: string) => l.trim()).filter(Boolean);
                if (lines.length > 0) setTerms(lines);
              }
              if (q.notes) setCallNotice(q.notes);
              setApplyTax(Number(q.tax_rate || 0) > 0 || Number(q.total_tax || 0) > 0);
              if (q.tax_rate) setTaxPercent(Number(q.tax_rate));
            }
          }
        } catch (e) {
          console.error('Failed to load existing Unique Painters quote:', e);
        } finally {
          setLoadingEdit(false);
        }
      } else {
        try {
          const nextNumRes = await api.quotations.getNextNumber('uniquepainters', 'short');
          if (nextNumRes && nextNumRes.next_number) {
            setQuotationNo(nextNumRes.next_number);
          }
        } catch (e) {
          console.warn('Fallback sequence number:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load initial Unique Painters data:', err);
    }
  };

  // Filter products as user types in search
  useEffect(() => {
    if (!productSearchQuery.trim()) {
      setSearchResults(availableProducts);
    } else {
      const q = productSearchQuery.toLowerCase();
      const filtered = availableProducts.filter((p) =>
        (p.service_name || '').toLowerCase().includes(q) ||
        (p.service_code || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
      setSearchResults(filtered);
    }
  }, [productSearchQuery, availableProducts]);

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const target = customerList.find((c) => c.id === custId);
    if (target) {
      setCustomerName(target.company_name);
      setAddressLine1(target.billing_address_line1 || '');
      setAddressLine2(`${target.billing_city || ''}${target.billing_pincode ? ` - ${target.billing_pincode}` : ''}`);
      setContactPerson(target.contact_person || '');
      setPhone(target.phone || '');
      if (target.gstin) setGstin(target.gstin);
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
    const rate = Number(item.standard_rate) || 25;
    const defaultArea = 2000;
    const newRow: PaintingScopeRow = {
      id: `row_${Date.now()}`,
      name: (item.service_name || 'PAINTING SCOPE').toUpperCase(),
      service_type: item.service_code || 'ASIAN PAINTS',
      description: item.description || '',
      area_sqft: defaultArea,
      rate_per_sqft: rate,
      amount: Math.round(defaultArea * rate),
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
          if (a >= 0 && rt >= 0) {
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
    if (rows.length === 0) {
      alert('Please have at least one painting specification row.');
      return null;
    }

    setSaving(true);
    setToastMsg(null);
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
            gstin: gstin.trim() || undefined,
            is_active: true,
          });
          targetCustId = createdCust.id;
          setSelectedCustomerId(createdCust.id);
          setCustomerList((prev) => [...prev, createdCust]);
        }
      }

      // Payload sections
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

      // Payload items
      const payloadItems = rows.map((r, idx) => ({
        item_name: `${r.name}: ${r.service_type}`,
        description: `${r.description} | Area: ${r.area_sqft} sq.ft @ Rs.${r.rate_per_sqft}/sq.ft`,
        quantity: 1,
        uom: 'SQ_FT',
        unit_price: Number(r.amount) || 0,
        applied_rate: Number(r.amount) || 0,
        rate_source: 'catalogue',
        tax_rate: applyTax ? taxPercent : 0,
        line_total: Number(r.amount) || 0,
        item_order: idx + 1,
      }));

      // Snapshot JSON for complete state restore
      const snapshot = {
        quotationTitle,
        customerName,
        addressLine1,
        addressLine2,
        contactPerson,
        phone,
        gstin,
        salutation,
        introText1,
        introText2,
        rows,
        machineries,
        terms,
        callNotice,
        satisfactionGoal,
        sigCompany,
        sigName,
        sigTitle,
        sigPhones,
        applyTax,
        taxPercent,
        quotationDate,
        quotationNo,
      };

      const payload = {
        customer_id: targetCustId,
        company_code: 'uniquepainters',
        quotation_number: quotationNo.trim() || 'UNP/2026/001',
        quotation_type: 'area_based',
        quotation_date: toISODate(quotationDate),
        job_description: `${introText1}\n\n${introText2}`,
        notes: callNotice,
        terms_and_conditions: terms.join('\n'),
        items: payloadItems,
        sections: payloadSections,
        tax_rate: applyTax ? taxPercent : 0,
        discount_type: 'none',
        discount_value: 0,
        snapshot_json: snapshot,
        client_name: customerName,
        client_address: addressLine1,
        client_phone: phone,
        client_gstin: gstin,
        attention_person: contactPerson,
        signatory_name: sigName,
        signatory_designation: sigTitle,
      };

      let res;
      if (savedQuoteId) {
        res = await api.quotations.update(savedQuoteId, payload);
        setToastMsg(`Quotation ${res.quotation_number} updated and saved to DB successfully!`);
      } else {
        res = await api.quotations.create(payload);
        setSavedQuoteId(res.id);
        setIsEditMode(true);
        setToastMsg(`Quotation ${res.quotation_number} saved to DB successfully!`);
      }
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
      const quoteId = await handleSaveToDatabase();
      if (quoteId) {
        setToastMsg('Generating authentic Word (.docx) proposal...');
        await api.quotations.downloadDocx(quoteId, `${quotationNo.replace(/[\/\\]/g, '_')}_UniquePainters.docx`);
        setToastMsg('Word (.docx) proposal downloaded successfully!');
      }
    } catch (err: any) {
      console.error('Download docx error:', err);
      alert(err.message || 'Failed to download Word document');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const quoteId = await handleSaveToDatabase();
      if (quoteId) {
        setToastMsg('Generating official PDF with authentic letterhead...');
        await api.quotations.downloadPdf(quoteId, `${quotationNo.replace(/[\/\\]/g, '_')}_UniquePainters.pdf`);
        setToastMsg('Official PDF downloaded successfully!');
      }
    } catch (err: any) {
      console.error('Download PDF error:', err);
      alert(err.message || 'Failed to download PDF');
    }
  };

  const handleOpenA4Preview = () => {
    // Immediate React live preview without latency or caching
    setInPagePreviewOpen(true);
  };

  const handlePrint = async () => {
    const quoteId = await handleSaveToDatabase();
    if (quoteId) {
      const printWindow = window.open(api.quotations.getHtmlUrl(quoteId), '_blank');
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
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

      {/* Top Action Bar (Identical Layout to Cleantech) */}
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
                {isEditMode ? 'Unique Painters Quotation Editor' : 'Unique Painters Quotation Generator'}
              </h1>
            </div>
            <p className="text-[11px] text-slate-500">
              {isEditMode
                ? `Editing official quotation ${quotationNo} with live authentic letterhead preview.`
                : 'Interactive proposal builder matching authentic Unique Painters letterhead & quotation format.'}
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

          {/* Preview A4 (Instant Live Preview Modal) */}
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
            <span>{saving ? 'Saving...' : (isEditMode ? 'Update Quotation in DB' : 'Save to DB')}</span>
          </button>
        </div>
      </div>

      {/* Editing State Banner */}
      {isEditMode && (
        <div className="bg-purple-50 border border-purple-300 text-purple-950 px-4 py-3 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-black uppercase tracking-wider">
              EDITING MODE
            </span>
            <span className="text-xs font-bold text-purple-900">
              Quotation: <strong className="font-mono text-purple-950">{quotationNo}</strong> &bull; Client: <strong>{customerName || 'Selected Customer'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('uniquepainters_quotes')}
              className="px-2.5 py-1 text-xs font-bold text-purple-800 hover:text-purple-950 hover:bg-purple-100/60 rounded-lg transition-colors"
            >
              Back to Quotes
            </button>
            <button
              onClick={() => {
                setSavedQuoteId(null);
                setIsEditMode(false);
                onNavigate('uniquepainters_generator');
              }}
              className="px-3 py-1 bg-white border border-purple-300 hover:bg-purple-100 text-purple-900 text-xs font-extrabold rounded-lg shadow-2xs transition-all"
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

      {/* Authentic 3-Page A4 Proposal Sheets (Matching Preview Exactly) */}
      <div className="space-y-8 text-slate-800">
        
        {/* ==================== PAGE 1 A4 SHEET ==================== */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl overflow-hidden">
          {/* Header Banner - Full Width Edge-to-Edge with Purple Border */}
          <div className="w-full bg-white border-b-2 border-purple-600 p-0 m-0">
            <img
              src="/headers/header_uniquepainters.png"
              alt="Unique Painters Official Letterhead Header"
              className="w-full h-auto object-cover block select-none"
              style={{ width: '100%', display: 'block' }}
            />
          </div>

          <div className="p-6 md:p-10 space-y-6">
            {/* Heading Selector & Editable Document Title */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
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
                          ? 'bg-purple-700 text-white font-black shadow-xs ring-2 ring-purple-800'
                          : 'bg-white text-slate-700 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-800 mb-1">
                  Editable Document Heading (Centered on Proposal):
                </label>
                <input
                  type="text"
                  value={quotationTitle}
                  onChange={(e) => setQuotationTitle(e.target.value.toUpperCase())}
                  className="w-full text-center text-lg md:text-xl font-black text-slate-950 bg-white border border-purple-300 rounded-xl py-2 px-3 tracking-wide uppercase focus:ring-2 focus:ring-purple-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Metadata & "To :" Client Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-4 border-b border-slate-200">
              {/* Left: Client Address */}
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
                    placeholder="Client / Company Name (e.g. TRUE NUTRITION)"
                    className="w-full text-sm font-black text-slate-900 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500 uppercase tracking-wide bg-slate-50/50"
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

              {/* Right: Quotation Number & Date in DD/MM/YYYY */}
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
                      className="w-full text-sm font-mono font-black text-slate-900 border border-slate-300 rounded-xl p-2 bg-white uppercase focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await api.quotations.getNextNumber('uniquepainters', 'short');
                        if (res?.next_number) setQuotationNo(res.next_number);
                      }}
                      className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700"
                      title="Fetch latest sequence from database"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
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
                      placeholder="DD/MM/YYYY (e.g. 21/10/2025)"
                      className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded-xl p-2.5 bg-white pr-9 focus:ring-1 focus:ring-purple-500"
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
              </div>
            </div>

            {/* Introductory Survey & Context */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                <input
                  type="text"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value.toUpperCase())}
                  className="font-black text-slate-900 border border-slate-300 rounded px-2 py-1 w-36 uppercase bg-white"
                />
              </div>

              <textarea
                rows={2}
                value={introText1}
                onChange={(e) => setIntroText1(e.target.value)}
                className="w-full text-xs text-slate-700 border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-1 focus:ring-purple-500 leading-relaxed"
              />

              <textarea
                rows={2}
                value={introText2}
                onChange={(e) => setIntroText2(e.target.value)}
                className="w-full text-xs text-slate-700 border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-1 focus:ring-purple-500 leading-relaxed"
              />
            </div>

            {/* Product / Scope Search Bar & Add Button */}
            <div className="space-y-2 relative" ref={searchContainerRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-purple-600" />
                  <span>Search & Add Painting Scope / Coatings / Epoxy Flooring:</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddBlankRow}
                    className="text-xs font-bold text-purple-800 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Blank Specification Row</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search painting catalog (e.g. Tractor Emulsion, Royale, Apex Weatherproof, Epoxy Flooring, Waterproofing, Texture)..."
                  value={productSearchQuery}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onChange={(e) => {
                    setProductSearchQuery(e.target.value);
                    setSearchDropdownOpen(true);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-white border-2 border-purple-300 rounded-2xl shadow-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              {/* Instant Search Results Dropdown */}
              {searchDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-purple-400 rounded-2xl shadow-2xl z-40 max-h-72 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400 text-center">
                      No matching painting specifications found. Click "+ Add Blank Specification Row" above.
                    </div>
                  ) : (
                    searchResults.map((item, i) => (
                      <div
                        key={item.service_code || i}
                        onClick={() => handleAddCatalogItem(item)}
                        className="p-3 hover:bg-purple-50/80 cursor-pointer border-b border-slate-100 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{item.service_name}</span>
                            <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                              {item.service_code}
                            </span>
                          </div>
                          {item.description && (
                            <div className="text-[11px] text-slate-500 line-clamp-1">{item.description}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-purple-700">
                            ₹{Number(item.standard_rate || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/ {item.default_uom || 'sq_ft'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 3-Column Proposal Scope Table (Matching Preview Exactly) */}
            <div className="overflow-x-auto border-2 border-slate-300 rounded-2xl shadow-xs">
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2.5 text-center w-12">S. No</th>
                    <th className="p-2.5 text-left">Description</th>
                    <th className="p-2.5 text-right w-44">Amount in INR</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r.id} className="border-t border-slate-200 hover:bg-slate-50/70 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-600 align-top">
                        {idx + 1}.
                      </td>
                      <td className="p-2.5 space-y-1.5 align-top">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={r.name}
                            onChange={(e) => handleUpdateRow(r.id, 'name', e.target.value.toUpperCase())}
                            placeholder="Item Title (e.g. INTERIOR WALL PAINTING)"
                            className="font-black text-xs text-slate-900 uppercase border border-slate-200 rounded-lg p-1.5 focus:ring-1 focus:ring-purple-500 bg-white"
                          />
                          <input
                            type="text"
                            value={r.service_type}
                            onChange={(e) => handleUpdateRow(r.id, 'service_type', e.target.value.toUpperCase())}
                            placeholder="Service Type (e.g. ASIAN PAINT TRACTOR EMULSION)"
                            className="text-[11px] font-bold text-purple-700 uppercase border border-slate-200 rounded-lg p-1.5 bg-white"
                          />
                        </div>

                        <textarea
                          rows={2}
                          value={r.description}
                          onChange={(e) => handleUpdateRow(r.id, 'description', e.target.value)}
                          placeholder="Application specifications (e.g. APPLY TWO COAT PREMIER EMULSION...)"
                          className="w-full text-[11px] text-slate-600 border border-slate-200 rounded-lg p-1.5 focus:ring-1 focus:ring-purple-500 bg-white"
                        />

                        {/* Calculation Bar with Area, Rate, and Delete */}
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-600">Area:</span>
                              <input
                                type="number"
                                value={r.area_sqft}
                                onChange={(e) => handleUpdateRow(r.id, 'area_sqft', Number(e.target.value))}
                                className="w-24 text-center font-bold text-slate-900 border border-slate-300 rounded p-1 text-xs bg-white"
                              />
                              <span className="text-[11px] text-slate-500">sq.ft</span>
                            </div>
                            <span className="text-slate-400">@</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-600">Rate:</span>
                              <input
                                type="number"
                                step="0.01"
                                value={r.rate_per_sqft}
                                onChange={(e) => handleUpdateRow(r.id, 'rate_per_sqft', Number(e.target.value))}
                                className="w-20 text-center font-bold text-slate-900 border border-slate-300 rounded p-1 text-xs bg-white"
                              />
                              <span className="text-[11px] text-slate-500">/ sq.ft</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveRow(r.id)}
                            disabled={rows.length <= 1}
                            className="p-1 text-slate-400 hover:text-red-600 rounded flex items-center gap-1 text-[11px]"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>

                      <td className="p-2.5 text-right font-black text-slate-900 align-top">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-500 font-bold">Rs.</span>
                          <input
                            type="number"
                            value={r.amount}
                            onChange={(e) => handleUpdateRow(r.id, 'amount', Number(e.target.value))}
                            className="w-28 text-right font-black text-slate-900 border border-slate-300 rounded p-1 text-xs bg-purple-50/50"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Sub Total */}
                  <tr className="border-t-2 border-slate-300 font-bold bg-slate-50">
                    <td colSpan={2} className="p-2.5 text-right font-bold text-slate-700">
                      SUB TOTAL:
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-900">
                      Rs.{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {/* Tax Option Toggle */}
                  <tr className="border-t border-slate-200 text-slate-700">
                    <td colSpan={2} className="p-2 text-right">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={applyTax}
                          onChange={(e) => setApplyTax(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                        />
                        <span>Apply GST (18% Extra):</span>
                      </label>
                    </td>
                    <td className="p-2 text-right font-bold text-slate-700">
                      {applyTax ? `Rs.${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>

                  {/* Total Project Value Row */}
                  <tr className="border-t-2 border-purple-900 font-black bg-purple-100 text-sm">
                    <td colSpan={2} className="p-2.5 text-right text-purple-950 font-black">
                      TOTAL PROJECT VALUE :
                    </td>
                    <td className="p-2.5 text-right text-purple-950 font-black text-base">
                      Rs.{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-right text-[11px] text-slate-400 font-bold pt-2">Page 1 of 3</div>
          </div>
        </div>

        {/* PAGE BREAK 1 TO 2 */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-px bg-slate-300 w-24"></div>
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full shadow-2xs">
            Page 2 (Machineries, Terms & Conditions, Signatures)
          </span>
          <div className="h-px bg-slate-300 w-24"></div>
        </div>

        {/* ==================== PAGE 2 A4 SHEET ==================== */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl p-6 md:p-10 space-y-6">
          <div className="flex justify-between items-center border-b-2 border-purple-900 pb-2">
            <input
              type="text"
              value={sigCompany}
              onChange={(e) => setSigCompany(e.target.value)}
              className="font-black text-sm text-purple-900 uppercase border-0 bg-transparent p-0 focus:ring-1 focus:ring-purple-500 rounded"
            />
            <span className="text-xs font-mono font-bold text-slate-600">
              Quotation No: {quotationNo} • Page 2
            </span>
          </div>

          {/* Machineries */}
          <div className="text-xs space-y-2 pt-1">
            <div className="font-bold text-slate-900">List of Machineries and consumables:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] text-slate-700">
              {machineries.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                  <span>• {m}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMachinery(idx)}
                    className="text-slate-400 hover:text-red-500 text-xs px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add machinery or consumable item..."
                value={newMachineryInput}
                onChange={(e) => setNewMachineryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMachinery()}
                className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white flex-1 focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddMachinery}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Call Notice */}
          <div className="text-xs bg-purple-50 p-2.5 rounded-lg border border-purple-200">
            <label className="block text-[10px] font-black uppercase text-purple-800 mb-1">
              Call Notice Box:
            </label>
            <input
              type="text"
              value={callNotice}
              onChange={(e) => setCallNotice(e.target.value)}
              className="w-full text-xs font-bold text-purple-950 bg-white border border-purple-300 rounded p-1.5 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Terms */}
          <div className="text-xs space-y-2">
            <div className="font-bold text-slate-900">Terms & Conditions:</div>
            <ul className="space-y-1 text-[11px] text-slate-700">
              {terms.map((t, idx) => (
                <li key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                  <span>• {t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(idx)}
                    className="text-slate-400 hover:text-red-500 text-xs px-1"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add new term & condition..."
                value={newTermInput}
                onChange={(e) => setNewTermInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTerm()}
                className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white flex-1 focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddTerm}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Term</span>
              </button>
            </div>
          </div>

          {/* Satisfaction */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Satisfaction Statement:
            </label>
            <input
              type="text"
              value={satisfactionGoal}
              onChange={(e) => setSatisfactionGoal(e.target.value)}
              className="w-full text-xs italic text-slate-700 border border-slate-300 rounded-lg p-2 bg-white"
            />
          </div>

          {/* Signatory */}
          <div className="pt-4 border-t border-slate-200 text-xs flex flex-wrap justify-between items-end gap-4">
            <div className="text-slate-500 italic max-w-xs text-[11px]">
              This is a computer generated quotation authenticated by {sigCompany}.
            </div>
            <div className="text-right space-y-1">
              <div className="text-slate-600">Regards</div>
              <input
                type="text"
                value={sigCompany}
                onChange={(e) => setSigCompany(e.target.value)}
                className="text-right font-black text-sm text-purple-900 border border-slate-200 rounded p-1 bg-white"
              />
              <div>
                <input
                  type="text"
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                  className="text-right font-bold text-xs text-slate-800 border border-slate-200 rounded p-1 bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={sigTitle}
                  onChange={(e) => setSigTitle(e.target.value)}
                  className="text-right text-xs text-slate-600 border border-slate-200 rounded p-1 bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={sigPhones}
                  onChange={(e) => setSigPhones(e.target.value)}
                  className="text-right text-xs text-slate-600 font-mono border border-slate-200 rounded p-1 bg-white"
                />
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400 font-bold">Page 2 of 3</div>
        </div>

        {/* PAGE BREAK 2 TO 3 */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-px bg-slate-300 w-24"></div>
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full shadow-2xs">
            Page 3 (Next-Gen Mechanized Equipment Showcase)
          </span>
          <div className="h-px bg-slate-300 w-24"></div>
        </div>

        {/* ==================== PAGE 3 A4 SHEET ==================== */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl p-6 md:p-10 space-y-6">
          <div className="flex justify-between items-center border-b-2 border-purple-900 pb-2">
            <span className="font-black text-sm text-purple-900 uppercase">
              Upcoming Technology Showcase
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">
              Unique Painters • Page 3
            </span>
          </div>

          {/* Technology Showcase with Generated Images */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="font-black text-xs uppercase text-purple-800 border-b border-purple-100 pb-1">
                UPCOMING OUR FUTURE TECHNOLOGY; 3D WALL PRINTING MACHINE:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 shadow-2xs">
                  <img src="/unique_painters/wall_printing_machine_1.jpeg" className="h-36 mx-auto object-contain rounded-lg" alt="3D Wall Printer" />
                  <div className="text-[11px] font-bold mt-2 text-slate-800">High-Precision 3D Vertical Wall Printer</div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 shadow-2xs">
                  <img src="/unique_painters/wall_printing_machine_2.jpeg" className="h-36 mx-auto object-contain rounded-lg" alt="3D Sample" />
                  <div className="text-[11px] font-bold mt-2 text-slate-800">Direct-on-Wall Architectural Graphic</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="font-black text-xs uppercase text-purple-800 border-b border-purple-100 pb-1">
                ROBOTIC PLASTERING AND PAINTING MACHINE :
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 shadow-2xs">
                  <img src="/unique_painters/robotic_plastering_1.jpeg" className="h-36 mx-auto object-contain rounded-lg" alt="Robotic Plastering" />
                  <div className="text-[11px] font-bold mt-2 text-slate-800">Robotic Surface Leveling & Plastering Unit</div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 shadow-2xs">
                  <img src="/unique_painters/robotic_plastering_2.jpeg" className="h-36 mx-auto object-contain rounded-lg" alt="Robotic Spray" />
                  <div className="text-[11px] font-bold mt-2 text-slate-800">Automated Mechanized Spray Coating</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400 font-bold">Page 3 of 3</div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* INSTANT LIVE A4 SHEET PREVIEW MODAL (Identical Experience to Cleantech)   */}
      {/* ========================================================================= */}
      {inPagePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col font-sans">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <span className="font-black text-sm">A4 Document Print Preview — Unique Painters</span>
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
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
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

            {/* A4 Sheet Preview Body (Immediate Live Reflection) */}
            <div className="p-8 max-h-[80vh] overflow-y-auto space-y-6 bg-slate-100">
              <div className="bg-white p-8 shadow-md rounded-2xl space-y-6 max-w-3xl mx-auto border border-slate-200 text-slate-800">
                {/* Header Banner - Full Width Edge-to-Edge */}
                <div className="w-full -mx-8 -mt-8 mb-6 overflow-hidden border-b-2 border-purple-600">
                  <img
                    src="/headers/header_uniquepainters.png"
                    className="w-full block"
                    alt="Unique Painters Letterhead Header"
                  />
                </div>
                
                <div className="text-center font-black text-lg text-slate-950 uppercase underline">
                  {quotationTitle}
                </div>

                <div className="flex justify-between text-xs">
                  <div>
                    <div className="font-black text-slate-900">To,</div>
                    <div className="font-black text-sm text-slate-900 uppercase">{customerName || 'TRUE NUTRITION'}</div>
                    <div>{addressLine1}</div>
                    <div>{addressLine2}</div>
                    {contactPerson && <div>Attn: {contactPerson}</div>}
                    {phone && <div>Ph: {phone}</div>}
                    <div className="font-black mt-2">{salutation}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div>DATE: <strong>{quotationDate}</strong></div>
                    <div>QUOTATION NO: <strong>{quotationNo}</strong></div>
                  </div>
                </div>

                {/* Intro Paragraphs */}
                <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                  <p>{introText1}</p>
                  <p>{introText2}</p>
                </div>

                {/* Table */}
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2 text-center w-12">S. No</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right w-36">Amount in INR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => (
                      <tr key={r.id} className="border-t border-slate-200">
                        <td className="p-2 text-center font-bold">{idx + 1}.</td>
                        <td className="p-2">
                          <div className="font-bold text-slate-900 uppercase">
                            {r.name}{r.service_type ? `: ${r.service_type}` : ''}
                          </div>
                          {r.description && <div className="text-[10px] text-slate-500 mt-0.5">{r.description}</div>}
                          {r.area_sqft > 0 && (
                            <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                              Area: {r.area_sqft.toLocaleString('en-IN')} sq.ft @ Rs.{Number(r.rate_per_sqft).toFixed(2)} / sq.ft
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-right font-black text-slate-900">
                          Rs.{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-300 font-bold bg-slate-50">
                      <td colSpan={2} className="p-2 text-right">SUB TOTAL:</td>
                      <td className="p-2 text-right">Rs.{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {applyTax && (
                      <tr className="border-t border-slate-200 text-slate-700">
                        <td colSpan={2} className="p-1.5 text-right">GST (18%):</td>
                        <td className="p-1.5 text-right">Rs.{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-purple-900 font-black bg-purple-100 text-sm">
                      <td colSpan={2} className="p-2 text-right text-purple-950">TOTAL PROJECT VALUE :</td>
                      <td className="p-2 text-right text-purple-950">Rs.{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-right text-[10px] text-slate-400 font-bold">Page 1 of 3</div>
              </div>

              {/* PAGE BREAK 1 TO 2 */}
              <div className="flex items-center justify-center gap-3 my-2">
                <div className="h-px bg-slate-300 w-24"></div>
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full shadow-2xs">
                  Page 2 (Machineries, Terms & Conditions, Signatures)
                </span>
                <div className="h-px bg-slate-300 w-24"></div>
              </div>

              {/* PAGE 2 A4 SHEET */}
              <div className="bg-white p-8 shadow-md rounded-2xl space-y-6 max-w-3xl mx-auto border border-slate-200 text-slate-800">
                <div className="flex justify-between items-center border-b-2 border-purple-900 pb-2">
                  <span className="font-black text-sm text-purple-900 uppercase">
                    {sigCompany || 'Unique Painters'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Quotation No: {quotationNo} • Page 2
                  </span>
                </div>

                {/* Machineries */}
                <div className="text-xs space-y-1 pt-1">
                  <div className="font-bold text-slate-900">List of Machineries and consumables:</div>
                  <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 list-disc list-inside">
                    {machineries.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>

                {/* Call Notice */}
                <div className="text-xs bg-purple-50 p-2.5 rounded-lg border border-purple-200 font-bold text-purple-900">
                  {callNotice}
                </div>

                {/* Terms */}
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">Terms & Conditions:</div>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                    {terms.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>

                {/* Satisfaction */}
                <div className="text-xs italic text-slate-600">
                  {satisfactionGoal}
                </div>

                {/* Signatory (NO CLIENT SIGNATURE) */}
                <div className="pt-4 border-t border-slate-200 text-xs flex justify-between items-end">
                  <div className="text-slate-500 italic max-w-xs text-[11px]">
                    This is a computer generated quotation authenticated by {sigCompany}.
                  </div>
                  <div className="text-right">
                    <div className="text-slate-600">Regards</div>
                    <div className="font-black text-sm text-purple-900">{sigCompany}</div>
                    <div className="font-bold text-slate-800">{sigName}</div>
                    <div className="text-slate-600">{sigTitle}</div>
                    <div className="text-slate-600 font-mono">{sigPhones}</div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-bold">Page 2 of 3</div>
              </div>

              {/* PAGE BREAK 2 TO 3 */}
              <div className="flex items-center justify-center gap-3 my-2">
                <div className="h-px bg-slate-300 w-24"></div>
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full shadow-2xs">
                  Page 3 (Next-Gen Mechanized Equipment Showcase)
                </span>
                <div className="h-px bg-slate-300 w-24"></div>
              </div>

              {/* PAGE 3 A4 SHEET */}
              <div className="bg-white p-8 shadow-md rounded-2xl space-y-6 max-w-3xl mx-auto border border-slate-200 text-slate-800">
                <div className="flex justify-between items-center border-b-2 border-purple-900 pb-2">
                  <span className="font-black text-sm text-purple-900 uppercase">
                    Upcoming Technology Showcase
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Unique Painters • Page 3
                  </span>
                </div>

                {/* Technology Showcase with New Generated Images */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="font-black text-xs uppercase text-purple-800 border-b border-purple-100 pb-1">
                      UPCOMING OUR FUTURE TECHNOLOGY; 3D WALL PRINTING MACHINE:
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 shadow-2xs">
                        <img src="/unique_painters/wall_printing_machine_1.jpeg" className="h-36 mx-auto object-contain rounded-lg" alt="3D Wall Printer" />
                        <div className="text-[11px] font-bold mt-2 text-slate-800">High-Precision 3D Vertical Wall Printer</div>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 shadow-2xs">
                        <img src="/unique_painters/wall_printing_machine_2.jpeg" className="h-36 mx-auto object-contain rounded-lg" alt="3D Sample" />
                        <div className="text-[11px] font-bold mt-2 text-slate-800">Direct-on-Wall Architectural Graphic</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="font-black text-xs uppercase text-purple-800 border-b border-purple-100 pb-1">
                      ROBOTIC PLASTERING AND PAINTING MACHINE :
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 shadow-2xs">
                        <img src="/unique_painters/robotic_plastering_1.jpeg" className="h-36 mx-auto object-contain rounded-lg" alt="Robotic Plastering" />
                        <div className="text-[11px] font-bold mt-2 text-slate-800">Robotic Surface Leveling & Plastering Unit</div>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 shadow-2xs">
                        <img src="/unique_painters/robotic_plastering_2.jpeg" className="h-36 mx-auto object-contain rounded-lg" alt="Robotic Spray" />
                        <div className="text-[11px] font-bold mt-2 text-slate-800">Automated Mechanized Spray Coating</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-bold">Page 3 of 3</div>
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 shrink-0">
              <span className="text-xs text-slate-400">
                Format: Authentic Unique Painters A4 Letterhead
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInPagePreviewOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
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
