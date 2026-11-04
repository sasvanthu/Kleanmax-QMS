import React, { useState, useEffect } from 'react';
import { Customer, Service, QuotationSection, QuotationItem, CalculationResult, User } from '../services/types';
import { api } from '../services/api';
import { SectionRow } from '../components/quotation/SectionRow';
import { OverrideRateModal } from '../components/quotation/OverrideRateModal';
import { CustomerSelectModal } from '../components/quotation/CustomerSelectModal';
import { LiveSummaryBar } from '../components/quotation/LiveSummaryBar';
import { Plus, Building, Calendar, Percent, IndianRupee, Truck, Package, Layers, Info, CheckCircle2, FileText, ArrowLeft } from 'lucide-react';

interface QuotationCreateProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
  initialQuotation?: any;
}

export const QuotationCreate: React.FC<QuotationCreateProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview,
  initialQuotation,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  // Form Fields
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState<number>(30);
  const [customerRef, setCustomerRef] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('Deep cleaning, mechanical rotary scrubbing, degreasing and sanitization.');
  const [paymentTerms, setPaymentTerms] = useState<string>('100% advance along with work order, or 50% advance and 50% upon handover.');
  const [deliveryTerms, setDeliveryTerms] = useState<string>('Work scheduled to commence within 3-4 days of site clearance and advance receipt.');
  const [warrantyTerms, setWarrantyTerms] = useState<string>('30 days standard workmanship warranty on deep cleaned floor areas.');
  const [termsAndConditions, setTermsAndConditions] = useState<string>('1. Electricity and continuous water connection to be made available at site by customer.\n2. Space must be cleared of loose obstacles before work commences.\n3. GST 18% extra as applicable.');
  const [notes, setNotes] = useState<string>('');

  // Discount & Charges
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [packingCharges, setPackingCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18.00);

  // Sections (Multiple rectangular areas)
  const [sections, setSections] = useState<QuotationSection[]>([
    {
      section_name: 'Main Factory Shop Floor',
      section_order: 1,
      service_name: 'Warehouse Deep Floor Scrubbing',
      length: 80,
      breadth: 40,
      measurement_unit: 'ft',
      calculated_area: 3200,
      repetitions: 1,
      billable_area: 3200,
      billable_uom: 'sq_ft',
      rate_source: 'catalogue',
      original_catalogue_rate: 4.50,
      applied_rate: 4.50,
      discount_percent: 0,
      line_total: 14400,
    }
  ]);

  // Rate Override Modal
  const [overrideModalIndex, setOverrideModalIndex] = useState<number | null>(null);

  // Calculation Results
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    loadServices();
    if (initialQuotation?.initialSection) {
      setSections([initialQuotation.initialSection]);
    }
    if (initialQuotation?.customer) {
      setSelectedCustomer(initialQuotation.customer);
    }
  }, [initialQuotation]);

  const loadServices = async () => {
    try {
      const data = await api.services.list();
      setServices(data);

      // Pre-select service on initial section if not assigned
      if (data.length > 0 && sections.length > 0 && !sections[0].service_id) {
        const defaultService = data.find(s => s.quotation_type === 'area_based') || data[0];
        setSections([
          {
            ...sections[0],
            service_id: defaultService.id,
            service_name: defaultService.service_name,
            original_catalogue_rate: Number(defaultService.standard_rate),
            applied_rate: Number(defaultService.standard_rate),
            billable_uom: defaultService.default_uom === 'sq_m' ? 'sq_m' : 'sq_ft',
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recalculate live whenever sections, customer, discount, or charges change
  useEffect(() => {
    runLiveCalculation();
  }, [sections, selectedCustomer, discountType, discountValue, freightCharges, packingCharges, otherCharges, taxRate]);

  const runLiveCalculation = async () => {
    if (sections.length === 0) return;
    setCalculating(true);
    try {
      const payload = {
        sections: sections.map(s => ({
          section_name: s.section_name,
          length: Number(s.length) || 1,
          breadth: Number(s.breadth) || 1,
          measurement_unit: s.measurement_unit,
          repetitions: Number(s.repetitions) || 1,
          rate_uom: s.billable_uom,
          applied_rate: Number(s.applied_rate) || 0,
          discount_percent: Number(s.discount_percent) || 0,
          service_id: s.service_id,
          service_name: s.service_name,
          rate_source: s.rate_source,
          original_catalogue_rate: Number(s.original_catalogue_rate) || 0,
          override_reason: s.override_reason,
        })),
        items: [],
        discount_type: discountType,
        discount_value: Number(discountValue) || 0,
        freight_charges: Number(freightCharges) || 0,
        packing_charges: Number(packingCharges) || 0,
        other_charges: Number(otherCharges) || 0,
        customer_state_code: selectedCustomer?.billing_state_code || '33',
        company_state_code: '33',
        tax_rate: Number(taxRate) || 18.00,
        rounding_policy: 'HALF_UP',
      };

      const res = await api.quotations.calculate(payload);
      setCalculation(res);

      // Update line totals and billable areas in sections state
      setSections(prev =>
        prev.map((sec, idx) => {
          const calcSec = res.sections[idx];
          if (calcSec) {
            return {
              ...sec,
              calculated_area: Number(calcSec.calculated_area),
              billable_area: Number(calcSec.billable_area),
              line_total: Number(calcSec.line_total),
            };
          }
          return sec;
        })
      );
      setErrorMessage('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error running calculation');
    } finally {
      setCalculating(false);
    }
  };

  const addSection = () => {
    const defaultService = services.find(s => s.quotation_type === 'area_based') || services[0];
    const newSec: QuotationSection = {
      section_name: `Section ${sections.length + 1}`,
      section_order: sections.length + 1,
      service_id: defaultService?.id,
      service_name: defaultService?.service_name || 'Standard Scrubbing',
      length: 50,
      breadth: 20,
      measurement_unit: 'ft',
      calculated_area: 1000,
      repetitions: 1,
      billable_area: 1000,
      billable_uom: defaultService?.default_uom === 'sq_m' ? 'sq_m' : 'sq_ft',
      rate_source: 'catalogue',
      original_catalogue_rate: Number(defaultService?.standard_rate || 4.5),
      applied_rate: Number(defaultService?.standard_rate || 4.5),
      discount_percent: 0,
      line_total: 4500,
    };
    setSections([...sections, newSec]);
  };

  const updateSection = (index: number, updated: QuotationSection) => {
    const copy = [...sections];
    copy[index] = updated;
    setSections(copy);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) {
      alert('A quotation must have at least one section.');
      return;
    }
    const copy = sections.filter((_, i) => i !== index);
    setSections(copy);
  };

  const handleApplyOverride = (newRate: number, reason: string) => {
    if (overrideModalIndex === null) return;
    const copy = [...sections];
    copy[overrideModalIndex] = {
      ...copy[overrideModalIndex],
      applied_rate: newRate,
      rate_source: 'manual_override',
      override_reason: reason,
    };
    setSections(copy);
    setOverrideModalIndex(null);
  };

  const handleSaveOrSubmit = async (statusTarget: 'draft' | 'pending_approval') => {
    if (!selectedCustomer) {
      alert('Please select a customer for this quotation.');
      setCustomerModalOpen(true);
      return;
    }

    if (sections.length === 0) {
      alert('Please add at least one section.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      const payload = {
        company_code: initialQuotation?.company_code || 'kleanmaxpro',
        customer_id: selectedCustomer.id,
        quotation_type: initialQuotation?.quotation_type || 'area_based',
        quotation_date: quotationDate,
        customer_ref: customerRef || undefined,
        job_description: jobDescription,
        payment_terms: paymentTerms,
        delivery_terms: deliveryTerms,
        warranty_terms: warrantyTerms,
        terms_and_conditions: termsAndConditions,
        notes: notes || undefined,
        sections: sections.map((s, idx) => ({
          section_name: s.section_name,
          section_order: idx + 1,
          service_id: s.service_id,
          service_name: s.service_name,
          length: Number(s.length),
          breadth: Number(s.breadth),
          measurement_unit: s.measurement_unit,
          calculated_area: Number(s.calculated_area),
          repetitions: Number(s.repetitions),
          billable_area: Number(s.billable_area),
          billable_uom: s.billable_uom,
          rate_source: s.rate_source,
          original_catalogue_rate: Number(s.original_catalogue_rate),
          applied_rate: Number(s.applied_rate),
          override_reason: s.override_reason,
          discount_percent: Number(s.discount_percent),
          line_total: Number(s.line_total),
        })),
        items: [],
        discount_type: discountType,
        discount_value: Number(discountValue),
        freight_charges: Number(freightCharges),
        packing_charges: Number(packingCharges),
        other_charges: Number(otherCharges),
        tax_rate: Number(taxRate),
        rounding_policy: 'HALF_UP',
      };

      const created = await api.quotations.create(payload);

      if (statusTarget === 'pending_approval') {
        await api.quotations.submit(created.id);
      }

      onNavigate('quotation_detail', { id: created.id });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to save quotation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('quotations')}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
              Interactive Estimator
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              New Area-Based Quotation
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomerModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <Building className="w-4 h-4 text-amber-500" />
            <span>{selectedCustomer ? selectedCustomer.company_name : 'Select Client...'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Grid: 2 Columns (Form Content + Sticky Authoritative Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Customer, Sections, Parameters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer & Quotation Meta Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-500" />
                Customer & Project Details
              </h2>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(true)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline"
              >
                {selectedCustomer ? 'Change Client' : 'Choose Client'}
              </button>
            </div>

            {selectedCustomer ? (
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-slate-800 mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {selectedCustomer.company_name}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Attn: <strong>{selectedCustomer.contact_person || 'Facilities Team'}</strong> • Phone: {selectedCustomer.phone}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Site: {selectedCustomer.billing_address_line1}, {selectedCustomer.billing_city} - {selectedCustomer.billing_pincode}
                  </div>
                </div>
                <div>
                  <span className="bg-white text-slate-800 border border-slate-300 font-mono text-[10px] px-2 py-1 rounded">
                    GSTIN: {selectedCustomer.gstin || 'Unregistered'}
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setCustomerModalOpen(true)}
                className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/30 rounded-xl p-4 text-center cursor-pointer transition-all mb-4"
              >
                <div className="text-xs font-bold text-slate-700">
                  Click here to select a client or add a new customer
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Quotation requires billing address, GSTIN and contact details.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Quotation Date
                </label>
                <input
                  type="date"
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Validity Period
                </label>
                <select
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                >
                  <option value={15}>15 Days</option>
                  <option value={30}>30 Days (Standard)</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Client PO / Ref #
                </label>
                <input
                  type="text"
                  placeholder="e.g. RFQ-TN-2026-09"
                  value={customerRef}
                  onChange={(e) => setCustomerRef(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          {/* Area Sections Section (The Core Feature) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  Billable Area Sections ({sections.length})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Multiple rectangular sections are calculated separately and aggregated.
                </p>
              </div>

              <button
                type="button"
                onClick={addSection}
                className="px-3 py-1.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-3">
              {sections.map((section, idx) => (
                <SectionRow
                  key={idx}
                  index={idx}
                  section={section}
                  services={services}
                  currentUser={currentUser}
                  onUpdate={(updated) => updateSection(idx, updated)}
                  onRemove={() => removeSection(idx)}
                  onOpenOverrideModal={() => setOverrideModalIndex(idx)}
                />
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">
                Exact Conversion Applied: 1 m² = 10.76391 sq ft
              </span>
              <button
                type="button"
                onClick={addSection}
                className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Section
              </button>
            </div>
          </div>

          {/* Commercial Terms & Discounts Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Discounts, Charges & Taxes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {discountType !== 'none' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={discountType === 'percentage' ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Freight / Travel (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freightCharges}
                  onChange={(e) => setFreightCharges(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Packing / Equipment Handling (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={packingCharges}
                  onChange={(e) => setPackingCharges(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-semibold"
                />
              </div>
            </div>

            {/* Scope & Terms */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Payment Terms
                </label>
                <textarea
                  rows={2}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Commencement / Delivery Terms
                </label>
                <textarea
                  rows={2}
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Live Calculation Breakdown */}
        <div className="lg:col-span-4">
          <LiveSummaryBar
            calculation={calculation}
            loading={calculating}
            saving={saving}
            onSaveDraft={() => handleSaveOrSubmit('draft')}
            onSubmitForApproval={() => handleSaveOrSubmit('pending_approval')}
            onPreviewPdf={() => {
              if (!selectedCustomer) {
                alert('Please select a client first.');
                setCustomerModalOpen(true);
                return;
              }
              handleSaveOrSubmit('draft');
            }}
          />
        </div>
      </div>

      {/* Customer Selection Modal */}
      <CustomerSelectModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSelectCustomer={(c) => setSelectedCustomer(c)}
      />

      {/* Rate Override Modal */}
      {overrideModalIndex !== null && sections[overrideModalIndex] && (
        <OverrideRateModal
          section={sections[overrideModalIndex]}
          currentUser={currentUser}
          isOpen={true}
          onClose={() => setOverrideModalIndex(null)}
          onApplyOverride={handleApplyOverride}
        />
      )}
    </div>
  );
};
