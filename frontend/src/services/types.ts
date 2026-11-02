export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
}

export interface Customer {
  id: string;
  customer_code?: string;
  company_name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  gstin?: string;
  pan?: string;
  billing_address_line1: string;
  billing_address_line2?: string;
  billing_city: string;
  billing_state: string;
  billing_state_code: string;
  billing_pincode: string;
  delivery_address_line1?: string;
  delivery_address_line2?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_state_code?: string;
  delivery_pincode?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRate {
  id: string;
  service_id: string;
  uom: string;
  rate: number;
  effective_from: string;
  effective_to?: string;
  is_current: boolean;
  min_area?: number;
  max_area?: number;
  created_at: string;
}

export interface Service {
  id: string;
  service_code: string;
  service_name: string;
  category: 'cleaning' | 'painting' | 'equipment_sales' | 'spare_parts' | 'repair_service' | 'rental' | 'amc';
  quotation_type: 'area_based' | 'item_based' | 'repair_service' | 'rental' | 'contract';
  description?: string;
  default_uom: string;
  hsn_sac_code?: string;
  standard_rate: number;
  tax_category: string;
  default_tax_rate: number;
  is_active: boolean;
  internal_notes?: string;
  rates?: ServiceRate[];
  created_at: string;
  updated_at: string;
}

export interface QuotationSection {
  id?: string;
  section_name: string;
  section_order: number;
  service_id?: string;
  service_name?: string;
  length: number;
  breadth: number;
  measurement_unit: 'ft' | 'm' | 'sq_ft' | 'sq_m';
  calculated_area: number;
  repetitions: number;
  billable_area: number;
  billable_uom: 'sq_ft' | 'sq_m';
  rate_source: 'catalogue' | 'manual_override';
  original_catalogue_rate: number;
  applied_rate: number;
  override_reason?: string;
  discount_percent: number;
  line_total: number;
  notes?: string;
}

export interface QuotationItem {
  id?: string;
  item_order: number;
  service_id?: string;
  item_code?: string;
  item_name: string;
  description?: string;
  hsn_sac?: string;
  quotation_type: string;
  quantity: number;
  uom: string;
  unit_price: number;
  rate_source: 'catalogue' | 'manual_override';
  original_catalogue_rate: number;
  applied_rate: number;
  override_reason?: string;
  discount_type: string;
  discount_value: number;
  taxable_value: number;
  tax_rate: number;
  line_total: number;
  notes?: string;
}

export type QuotationStatus = 'draft' | 'pending_approval' | 'approved' | 'issued' | 'revised' | 'cancelled';

export interface QuotationRevision {
  id: string;
  revision_number: number;
  revision_reason: string;
  created_at: string;
  revised_by_name?: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  revision_number: number;
  parent_quotation_id?: string;
  customer_id: string;
  quotation_type: string;
  status: QuotationStatus;
  quotation_date: string;
  validity_date: string;
  customer_ref?: string;
  job_description?: string;
  payment_terms?: string;
  delivery_terms?: string;
  warranty_terms?: string;
  terms_and_conditions?: string;
  notes?: string;
  
  subtotal: number;
  discount_type: 'none' | 'percentage' | 'fixed';
  discount_value: number;
  total_discount: number;
  freight_charges: number;
  packing_charges: number;
  other_charges: number;
  taxable_amount: number;
  is_interstate: boolean;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_tax: number;
  rounding_adjustment: number;
  final_amount: number;
  amount_in_words?: string;
  
  prepared_by_id?: string;
  prepared_by_name?: string;
  approved_by_id?: string;
  approved_by_name?: string;
  approved_at?: string;
  issued_at?: string;
  
  customer?: Customer;
  sections: QuotationSection[];
  items: QuotationItem[];
  revisions: QuotationRevision[];
  created_at: string;
  updated_at: string;
}

export interface CompanySetting {
  id?: string;
  company_name: string;
  legal_name: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  state_code: string;
  pincode: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  website?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_ifsc?: string;
  bank_branch?: string;
  logo_url?: string;
  quotation_prefix: string;
  default_validity_days: number;
  rounding_policy: string;
  default_payment_terms?: string;
  default_delivery_terms?: string;
  default_warranty_terms?: string;
  terms_and_conditions?: string;
}

export interface CalculationResult {
  sections: QuotationSection[];
  items: QuotationItem[];
  subtotal: number;
  discount_type: string;
  discount_value: number;
  total_discount: number;
  freight_charges: number;
  packing_charges: number;
  other_charges: number;
  taxable_amount: number;
  is_interstate: boolean;
  tax_rate: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_tax: number;
  rounding_adjustment: number;
  final_amount: number;
  amount_in_words: string;
}
