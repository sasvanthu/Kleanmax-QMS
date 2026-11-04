import React, { useState, useEffect } from 'react';
import { Customer, Service, Quotation, User } from '../services/types';
import { api } from '../services/api';
import {
  ArrowLeft, Save, Eye, Download, FileText, Plus, Trash2,
  Building, Calendar, DollarSign, Percent, ShieldCheck, Truck,
  AlertCircle, CheckCircle2, RotateCcw, HelpCircle, Layers
} from 'lucide-react';

interface EditableItem {
  id: string;
  item_name: string;
  description?: string;
  hsn_sac?: string;
  quantity: number;
  uom: string;
  unit_price: number;
  line_total: number;
}

interface EditableSection {
  id: string;
  section_name: string;
  service_name?: string;
  length: number;
  breadth: number;
  measurement_unit: string;
  repetitions: number;
  billable_area: number;
  applied_rate: number;
  line_total: number;
}

interface QuotationEditProps {
  quotationId?: string | null;
  initialCompanyCode?: string;
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

const COMPANIES = [
  { code: 'kleanmaxpro', name: 'Klean Max Pro', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300', hex: '#FED10C' },
  { code: 'kleanmax', name: 'Kleanmax', badgeColor: 'bg-sky-100 text-sky-900 border-sky-300', hex: '#0284C7' },
  { code: 'uniquepainters', name: 'Unique Painters', badgeColor: 'bg-purple-100 text-purple-900 border-purple-300', hex: '#7C3AED' },
  { code: 'cleantech', name: 'Cleantech Services', badgeColor: 'bg-teal-100 text-teal-900 border-teal-300', hex: '#0D9488' },
];

export const QuotationEdit: React.FC<QuotationEditProps> = ({
  quotationId,
  initialCompanyCode = 'kleanmaxpro',
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Source quotation
  const [rawQuote, setRawQuote] = useState<Quotation | null>(null);

  // Form Fields
  const [companyCode, setCompanyCode] = useState<string>(initialCompanyCode);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerNameInput, setCustomerNameInput] = useState<string>('SRI CHANDAAN LOGISTICS');
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [quotationType, setQuotationType] = useState<string>('item_based');
  const [quotationNumber, setQuotationNumber] = useState<string>('');
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validityDate, setValidityDate] = useState<string>('');
  const [customerRef, setCustomerRef] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  // Items and Sections
  const [items, setItems] = useState<EditableItem[]>([]);
  const [sections, setSections] = useState<EditableSection[]>([]);

  // Financial adjustments
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [packingCharges, setPackingCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18.00);

  // Commercial Terms
  const [paymentTerms, setPaymentTerms] = useState<string>('');
  const [deliveryTerms, setDeliveryTerms] = useState<string>('');
  const [warrantyTerms, setWarrantyTerms] = useState<string>('');
  const [termsAndConditions, setTermsAndConditions] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadCustomers();
    if (quotationId) {
      loadQuotation(quotationId);
    } else {
      initNewQuotation(initialCompanyCode);
    }
  }, [quotationId, initialCompanyCode]);

  const loadCustomers = async () => {
    try {
      const list = await api.customers.list();
      setCustomerList(list);
      if (list.length > 0 && !customer) {
        setCustomer(list[0]);
        setCustomerNameInput(list[0].company_name);
      }
    } catch (err) {
      console.warn('Customer list loading error:', err);
    }
  };

  const initNewQuotation = (code: string) => {
    setLoading(true);
    setCompanyCode(code);
    const prefix = code === 'kleanmaxpro' ? 'KMP' : code === 'kleanmax' ? 'KLM' : code === 'uniquepainters' ? 'UNP' : 'CTS';
    setQuotationNumber(`NEW-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
    setQuotationDate(new Date().toISOString().split('T')[0]);
    
    if (code === 'kleanmaxpro') {
      setQuotationType('area_based');
      setJobDescription('Commercial warehouse floor scrubbing, deep sanitization & stain removal');
      setSections([
        {
          id: `sec_1_${Date.now()}`,
          section_name: 'Main Logistics Warehouse Floor Area',
          service_name: 'Deep Floor Scrubbing & De-Greasing',
          length: 100,
          breadth: 50,
          measurement_unit: 'ft',
          repetitions: 1,
          billable_area: 5000,
          applied_rate: 4.5,
          line_total: 22500,
        }
      ]);
      setItems([]);
      setTermsAndConditions('1. 3-Phase power and water supply at site by client.\n2. Work scheduled upon advance confirmation.\n3. GST 18% extra.');
    } else if (code === 'kleanmax') {
      setQuotationType('item_based');
      setJobDescription('Spares & authorized service for industrial cleaning equipment');
      setItems([
        {
          id: `item_1_${Date.now()}`,
          item_name: 'WIPER SQUEEGEE BLADE SET',
          description: 'Original polyurethane oil-resistant squeegee rubber',
          hsn_sac: '8479',
          quantity: 2,
          uom: 'SET',
          unit_price: 3950,
          line_total: 7900,
        },
        {
          id: `item_2_${Date.now()}`,
          item_name: 'SUCTION HOSE ASSEMBLY',
          description: 'Reinforced spiral wire vacuum hose 2.5m',
          hsn_sac: '8479',
          quantity: 1,
          uom: 'NOS',
          unit_price: 1600,
          line_total: 1600,
        }
      ]);
      setSections([]);
      setTermsAndConditions('1. 100% advance payment against proforma invoice.\n2. Parts carry 90-day OEM warranty.\n3. Goods once sold will not be returned.');
    } else if (code === 'uniquepainters') {
      setQuotationType('area_based');
      setJobDescription('Epoxy floor coating & commercial protective painting scope');
      setSections([
        {
          id: `sec_1_${Date.now()}`,
          section_name: 'Shop Floor Epoxy Self-Leveling (2mm)',
          service_name: 'Industrial Epoxy Flooring',
          length: 60,
          breadth: 40,
          measurement_unit: 'ft',
          repetitions: 1,
          billable_area: 2400,
          applied_rate: 48,
          line_total: 115200,
        }
      ]);
      setItems([]);
      setTermsAndConditions('1. Surface preparation & crack repair included.\n2. 40% advance, 40% primer, 20% handover.\n3. 24-month coating performance warranty.');
    } else {
      // Cleantech
      setQuotationType('contract');
      setJobDescription('Periodic solar panel mechanized cleaning & facility AMC');
      setItems([
        {
          id: `item_1_${Date.now()}`,
          item_name: '1.5 MW Rooftop Solar Array Robotic Washing AMC',
          description: 'Monthly de-mineralized pure water mechanized cleaning (12 cycles)',
          hsn_sac: '9985',
          quantity: 12,
          uom: 'cycle',
          unit_price: 10500,
          line_total: 126000,
        }
      ]);
      setSections([]);
      setTermsAndConditions('1. Continuous water point within 50m of roof access.\n2. Bimonthly generation yield reports provided.\n3. Certified safety rope access crew.');
    }
    setLoading(false);
  };

  const loadQuotation = async (id: string) => {
    setLoading(true);
    try {
      const q = await api.quotations.get(id);
      setRawQuote(q);
      setCompanyCode(q.company_code || 'kleanmaxpro');
      setCustomer(q.customer || null);
      if (q.customer?.company_name) setCustomerNameInput(q.customer.company_name);
      setQuotationType(q.quotation_type || (q.items && q.items.length > 0 ? 'item_based' : 'area_based'));
      setQuotationNumber(q.quotation_number);
      setQuotationDate(q.quotation_date || new Date().toISOString().split('T')[0]);
      setValidityDate(q.validity_date || '');
      setCustomerRef(q.customer_ref || '');
      setJobDescription(q.job_description || '');

      setDiscountType((q.discount_type as any) || 'none');
      setDiscountValue(Number(q.discount_value || 0));
      setFreightCharges(Number(q.freight_charges || 0));
      setPackingCharges(Number(q.packing_charges || 0));
      setOtherCharges(Number(q.other_charges || 0));
      setTaxRate(Number(q.cgst_rate || 0) + Number(q.sgst_rate || 0) || (q.igst_rate ? Number(q.igst_rate) : 18));

      setPaymentTerms(q.payment_terms || '');
      setDeliveryTerms(q.delivery_terms || '');
      setWarrantyTerms(q.warranty_terms || '');
      setTermsAndConditions(q.terms_and_conditions || '');
      setNotes(q.notes || '');

      if (q.items && q.items.length > 0) {
        setItems(
          q.items.map((it: any, idx: number) => ({
            id: it.id || `item_${idx}_${Date.now()}`,
            item_name: it.item_name,
            description: it.description || '',
            hsn_sac: it.hsn_sac || '',
            quantity: Number(it.quantity || 1),
            uom: it.uom || 'NOS',
            unit_price: Number(it.unit_price || it.applied_rate || 0),
            line_total: Number(it.line_total || (Number(it.quantity || 1) * Number(it.unit_price || it.applied_rate || 0))),
          }))
        );
      } else {
        setItems([]);
      }

      if (q.sections && q.sections.length > 0) {
        setSections(
          q.sections.map((s: any, idx: number) => ({
            id: s.id || `sec_${idx}_${Date.now()}`,
            section_name: s.section_name,
            service_name: s.service_name || '',
            length: Number(s.length || 0),
            breadth: Number(s.breadth || 0),
            measurement_unit: s.measurement_unit || 'ft',
            repetitions: Number(s.repetitions || 1),
            billable_area: Number(s.billable_area || 0),
            applied_rate: Number(s.applied_rate || 0),
            line_total: Number(s.line_total || 0),
          }))
        );
      } else {
        setSections([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quotation for editing');
    } finally {
      setLoading(false);
    }
  };

  // Item row operations
  const handleItemChange = (index: number, field: keyof EditableItem, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const updated = { ...copy[index], [field]: val };
      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? Number(val) : updated.quantity;
        const price = field === 'unit_price' ? Number(val) : updated.unit_price;
        updated.line_total = Math.round(qty * price * 100) / 100;
      }
      copy[index] = updated;
      return copy;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `new_item_${Date.now()}`,
        item_name: 'New Line Item / Spares / Service',
        description: '',
        hsn_sac: '',
        quantity: 1,
        uom: 'NOS',
        unit_price: 1000,
        line_total: 1000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Section row operations
  const handleSectionChange = (index: number, field: keyof EditableSection, val: any) => {
    setSections((prev) => {
      const copy = [...prev];
      const updated = { ...copy[index], [field]: val };
      if (field === 'length' || field === 'breadth' || field === 'repetitions' || field === 'applied_rate') {
        const l = field === 'length' ? Number(val) : updated.length;
        const b = field === 'breadth' ? Number(val) : updated.breadth;
        const rep = field === 'repetitions' ? Number(val) : updated.repetitions;
        const rate = field === 'applied_rate' ? Number(val) : updated.applied_rate;
        const area = l * b * rep;
        updated.billable_area = area;
        updated.line_total = Math.round(area * rate * 100) / 100;
      }
      copy[index] = updated;
      return copy;
    });
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `new_sec_${Date.now()}`,
        section_name: `Work Area ${prev.length + 1}`,
        service_name: 'Deep Cleaning & Machine Scrubbing',
        length: 50,
        breadth: 20,
        measurement_unit: 'ft',
        repetitions: 1,
        billable_area: 1000,
        applied_rate: 4.5,
        line_total: 4500,
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals calculation
  const subtotal =
    quotationType === 'area_based'
      ? sections.reduce((sum, s) => sum + (Number(s.line_total) || 0), 0)
      : items.reduce((sum, it) => sum + (Number(it.line_total) || 0), 0);

  let discountAmt = 0;
  if (discountType === 'percentage') {
    discountAmt = (subtotal * discountValue) / 100;
  } else if (discountType === 'fixed') {
    discountAmt = discountValue;
  }
  discountAmt = Math.min(discountAmt, subtotal);

  const taxableAmount = Math.max(0, subtotal - discountAmt) + freightCharges + packingCharges + otherCharges;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const cgstAmount = taxAmount / 2;
  const sgstAmount = taxAmount / 2;
  const finalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  // Save changes
  const handleSave = async (andPreview = false) => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload: any = {
        company_code: companyCode,
        quotation_type: quotationType,
        quotation_date: quotationDate,
        validity_date: validityDate || undefined,
        customer_ref: customerRef || undefined,
        job_description: jobDescription || undefined,
        payment_terms: paymentTerms || undefined,
        delivery_terms: deliveryTerms || undefined,
        warranty_terms: warrantyTerms || undefined,
        terms_and_conditions: termsAndConditions || undefined,
        notes: notes || undefined,
        discount_type: discountType,
        discount_value: discountValue,
        freight_charges: freightCharges,
        packing_charges: packingCharges,
        other_charges: otherCharges,
        tax_rate: taxRate,
        rounding_policy: 'HALF_UP',
      };

      if (quotationType === 'area_based') {
        payload.sections = sections.map((s, idx) => ({
          section_name: s.section_name,
          section_order: idx + 1,
          service_name: s.service_name,
          length: Number(s.length),
          breadth: Number(s.breadth),
          measurement_unit: s.measurement_unit,
          repetitions: Number(s.repetitions),
          billable_area: Number(s.billable_area),
          billable_uom: s.measurement_unit === 'm' ? 'sq_m' : 'sq_ft',
          rate_source: 'catalogue',
          original_catalogue_rate: Number(s.applied_rate),
          applied_rate: Number(s.applied_rate),
          line_total: Number(s.line_total),
        }));
        payload.items = [];
      } else {
        payload.items = items.map((it, idx) => ({
          item_order: idx + 1,
          item_name: it.item_name,
          description: it.description || undefined,
          hsn_sac: it.hsn_sac || undefined,
          quotation_type: quotationType,
          quantity: Number(it.quantity),
          uom: it.uom,
          unit_price: Number(it.unit_price),
          rate_source: 'catalogue',
          original_catalogue_rate: Number(it.unit_price),
          applied_rate: Number(it.unit_price),
          line_total: Number(it.line_total),
          taxable_value: Number(it.line_total),
        }));
        payload.sections = [];
      }

      let activeId = quotationId;
      if (quotationId) {
        await api.quotations.update(quotationId, payload);
        setSuccessMsg('Quotation successfully updated and synchronized!');
      } else {
        // Customer resolution
        let custId = customer?.id;
        if (!custId) {
          const list = await api.customers.list(customerNameInput);
          const found = list.find(c => c.company_name.toLowerCase() === customerNameInput.toLowerCase());
          if (found) {
            custId = found.id;
          } else {
            const newCust = await api.customers.create({
              company_name: customerNameInput.trim() || 'Valued Commercial Client',
              billing_city: 'Chennai',
              billing_state: 'Tamil Nadu',
              billing_state_code: '33',
              billing_pincode: '600001',
              phone: '+91 73388 82036',
            });
            custId = newCust.id;
          }
        }
        payload.customer_id = custId;
        const created = await api.quotations.create(payload);
        activeId = created.id;
        setQuotationNumber(created.quotation_number);
        setSuccessMsg(`Quotation ${created.quotation_number} successfully generated!`);
      }

      if (andPreview && activeId) {
        onOpenPreview(activeId);
      } else if (activeId) {
        setTimeout(() => {
          onNavigate('quotation_detail', { id: activeId });
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update quotation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-500 font-bold text-sm">
        Loading quotation for editing...
      </div>
    );
  }

  const isImmutable = rawQuote?.status === 'issued' || rawQuote?.status === 'cancelled';

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('quotation_detail', { id: quotationId })}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
                Live Quotation Editor
              </span>
              <span className="font-mono text-xl font-black text-slate-900">
                {quotationNumber}
              </span>
              {rawQuote?.revision_number ? (
                <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2 py-0.5 rounded border border-purple-200">
                  REV {rawQuote.revision_number}
                </span>
              ) : null}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Client: <strong>{customer?.company_name || 'Direct Client'}</strong> • Prepared By: {rawQuote?.prepared_by_name || 'Estimations'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {quotationId && (
            <>
              <button
                onClick={() => quotationId && api.quotations.downloadDocx(quotationId)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                title="Download Word Document"
              >
                <FileText className="w-4 h-4" />
                <span>Word (.docx)</span>
              </button>

              <button
                onClick={() => quotationId && api.quotations.downloadPdf(quotationId)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                title="Download Official PDF"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleSave(true)}
            disabled={saving || isImmutable}
            className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Save & Preview</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving || isImmutable}
            className="px-5 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {isImmutable && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              This quotation is <strong>{rawQuote?.status?.toUpperCase()}</strong> and locked against direct edits.
              To make modifications, create a new revision.
            </span>
          </div>
          <button
            onClick={() => onNavigate('quotation_detail', { id: quotationId })}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700"
          >
            Go to Revision Tool
          </button>
        </div>
      )}

      {/* 1. Company Selection & Meta */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-2">
            Select Company Brand / Letterhead Header
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COMPANIES.map((c) => {
              const active = companyCode === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCompanyCode(c.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    active
                      ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="font-extrabold text-xs text-slate-900">{c.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${c.badgeColor}`}>
                    {c.code.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quotation Type</label>
            <select
              value={quotationType}
              onChange={(e) => setQuotationType(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
            >
              <option value="item_based">Line Items / Spares / Products</option>
              <option value="area_based">Area-Based Floor / Painting (Sq.ft)</option>
              <option value="repair_service">Equipment Repair & Service</option>
              <option value="rental">Monthly Rental Contract</option>
              <option value="contract">Periodic AMC Maintenance Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quotation Date</label>
            <input
              type="date"
              value={quotationDate}
              onChange={(e) => setQuotationDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Validity Date</label>
            <input
              type="date"
              value={validityDate}
              onChange={(e) => setValidityDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer PO / Ref</label>
            <input
              type="text"
              placeholder="e.g. PO/2026/089"
              value={customerRef}
              onChange={(e) => setCustomerRef(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
            />
          </div>
        </div>

        {/* Customer Directory / Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Client Name</label>
            <input
              type="text"
              value={customerNameInput}
              onChange={(e) => setCustomerNameInput(e.target.value)}
              placeholder="e.g. SRI CHANDAAN LOGISTICS"
              className="w-full text-xs font-extrabold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select from Registered Clients</label>
            <select
              value={customer?.id || ''}
              onChange={(e) => {
                const found = customerList.find(c => c.id === e.target.value);
                if (found) {
                  setCustomer(found);
                  setCustomerNameInput(found.company_name);
                }
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white text-slate-700 font-semibold"
            >
              <option value="">-- Select Registered Client or Type Name on Left --</option>
              {customerList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.billing_city || 'Chennai'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Job Scope / Detailed Description
          </label>
          <textarea
            rows={2}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Scope of work, machine model, surface specifications..."
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white"
          />
        </div>
      </div>

      {/* 2. Interactive Line Items OR Area Sections */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FED10C]" />
            <h3 className="font-extrabold text-xs uppercase tracking-wide">
              {quotationType === 'area_based' ? 'Billable Area Sections' : 'Quotation Line Items & Spares'}
            </h3>
          </div>

          <button
            type="button"
            onClick={quotationType === 'area_based' ? handleAddSection : handleAddItem}
            className="px-3 py-1.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{quotationType === 'area_based' ? 'Add Section' : 'Add Item'}</span>
          </button>
        </div>

        <div className="p-4 overflow-x-auto">
          {quotationType === 'area_based' ? (
            /* Area Sections Table */
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
                  <th className="p-2.5 w-12 text-center">#</th>
                  <th className="p-2.5">Section Name</th>
                  <th className="p-2.5">Service Name</th>
                  <th className="p-2.5 w-24 text-center">Length</th>
                  <th className="p-2.5 w-24 text-center">Breadth</th>
                  <th className="p-2.5 w-20 text-center">Reps</th>
                  <th className="p-2.5 w-28 text-right">Billable Area</th>
                  <th className="p-2.5 w-28 text-right">Rate (₹)</th>
                  <th className="p-2.5 w-32 text-right">Total (₹)</th>
                  <th className="p-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sections.map((sec, idx) => (
                  <tr key={sec.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={sec.section_name}
                        onChange={(e) => handleSectionChange(idx, 'section_name', e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={sec.service_name || ''}
                        onChange={(e) => handleSectionChange(idx, 'service_name', e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs text-slate-600"
                        placeholder="Service Type"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        value={sec.length}
                        onChange={(e) => handleSectionChange(idx, 'length', e.target.value)}
                        className="w-20 p-1.5 border border-slate-300 rounded text-xs text-center"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        value={sec.breadth}
                        onChange={(e) => handleSectionChange(idx, 'breadth', e.target.value)}
                        className="w-20 p-1.5 border border-slate-300 rounded text-xs text-center"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        value={sec.repetitions}
                        onChange={(e) => handleSectionChange(idx, 'repetitions', e.target.value)}
                        className="w-16 p-1.5 border border-slate-300 rounded text-xs text-center"
                      />
                    </td>
                    <td className="p-2.5 text-right font-extrabold text-slate-900">
                      {sec.billable_area.toLocaleString()} sq.ft
                    </td>
                    <td className="p-2.5 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={sec.applied_rate}
                        onChange={(e) => handleSectionChange(idx, 'applied_rate', e.target.value)}
                        className="w-24 p-1.5 border border-slate-300 rounded text-xs text-right font-bold"
                      />
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-900">
                      ₹ {sec.line_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Items Table */
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
                  <th className="p-2.5 w-12 text-center">#</th>
                  <th className="p-2.5">Item Name & Description</th>
                  <th className="p-2.5 w-24 text-center">HSN/SAC</th>
                  <th className="p-2.5 w-24 text-center">Qty</th>
                  <th className="p-2.5 w-24 text-center">UOM</th>
                  <th className="p-2.5 w-32 text-right">Rate (₹)</th>
                  <th className="p-2.5 w-36 text-right">Line Total (₹)</th>
                  <th className="p-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={it.item_name}
                        onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                        placeholder="Item or Spare Name"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-bold text-slate-900 mb-1"
                      />
                      <input
                        type="text"
                        value={it.description || ''}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Optional specifications, model compatibility, remarks"
                        className="w-full p-1 border border-slate-200 rounded text-[11px] text-slate-500"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="text"
                        value={it.hsn_sac || ''}
                        onChange={(e) => handleItemChange(idx, 'hsn_sac', e.target.value)}
                        placeholder="8479"
                        className="w-20 p-1.5 border border-slate-300 rounded text-xs text-center"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 p-1.5 border border-slate-300 rounded text-xs text-center font-bold"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <select
                        value={it.uom}
                        onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                        className="p-1.5 border border-slate-300 rounded text-xs font-bold"
                      >
                        <option value="NOS">NOS</option>
                        <option value="SET">SET</option>
                        <option value="MTR">MTR</option>
                        <option value="LOT">LOT</option>
                        <option value="HRS">HRS</option>
                        <option value="DAYS">DAYS</option>
                        <option value="MONTH">MONTH</option>
                        <option value="contract">CONTRACT</option>
                      </select>
                    </td>
                    <td className="p-2.5 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={it.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                        className="w-28 p-1.5 border border-slate-300 rounded text-xs text-right font-bold"
                      />
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-900">
                      ₹ {it.line_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 3. Financial Summary & Extra Charges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Discounts & Surcharges */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-amber-500" />
            <span>Discount, Freight & Taxes</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
              >
                <option value="none">No Discount</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount Value</label>
              <input
                type="number"
                disabled={discountType === 'none'}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GST Tax Rate</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
              >
                <option value={18}>18% GST (9% CGST + 9% SGST)</option>
                <option value={12}>12% GST</option>
                <option value={5}>5% GST</option>
                <option value={0}>0% Tax Exempted</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Freight / Transport (₹)</label>
              <input
                type="number"
                value={freightCharges}
                onChange={(e) => setFreightCharges(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">Terms & Conditions</label>
            <textarea
              rows={3}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-sans"
              placeholder="1. Water and 3-phase electricity to be supplied by client..."
            />
          </div>
        </div>

        {/* Right: Live Calculation Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-amber-400 mb-3">
              Commercial Summary
            </h4>

            <div className="space-y-2 text-xs border-b border-slate-800 pb-3">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-bold">₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {discountAmt > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-bold">- ₹ {discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {freightCharges > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Freight Charges:</span>
                  <span className="font-bold">+ ₹ {freightCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Taxable Amount:</span>
                <span className="font-bold">₹ {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {taxRate > 0 && (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>CGST ({taxRate / 2}%):</span>
                    <span>₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SGST ({taxRate / 2}%):</span>
                    <span>₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-3">
              <span className="font-black text-sm uppercase text-amber-400">Final Total:</span>
              <span className="text-2xl font-black text-white">
                ₹ {finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving || isImmutable}
              className="w-full py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Quotation Updates'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || isImmutable}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Save & View A4 Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationEdit;

