import React, { useState, useEffect } from 'react';
import { CompanySetting, User } from '../services/types';
import { api } from '../services/api';
import {
  Building2, Save, CheckCircle2, ShieldAlert, Sparkles,
  ArrowRight, ExternalLink, RefreshCw, Check, Layers,
  CreditCard, FileText, Phone, Mail, Globe, MapPin, Palette
} from 'lucide-react';

interface CompanySettingsProps {
  currentUser: User | null;
  initialTab?: string;
  onNavigate?: (page: string, params?: any) => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  currentUser,
  initialTab = 'kleanmaxpro',
  onNavigate,
}) => {
  const [companies, setCompanies] = useState<CompanySetting[]>([]);
  const [activeCode, setActiveCode] = useState<string>(initialTab);
  const [activeCompany, setActiveCompany] = useState<CompanySetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadAllCompanies();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      const match = companies.find((c) => c.company_code === activeCode) || companies[0];
      setActiveCompany(match);
      if (match.company_code) {
        setActiveCode(match.company_code);
      }
    }
  }, [activeCode, companies]);

  const loadAllCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.company.getAll();
      setCompanies(data);
      if (data.length > 0) {
        const found = data.find((c) => c.company_code === activeCode) || data[0];
        setActiveCompany(found);
        if (found.company_code) setActiveCode(found.company_code);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveActive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !activeCompany.company_code) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const updated = await api.company.updateByIdentifier(activeCompany.company_code, activeCompany);
      // Update in local state
      setCompanies(companies.map((c) => (c.company_code === updated.company_code ? updated : c)));
      setActiveCompany(updated);
      setSuccessMsg(`Settings for "${updated.company_name}" saved successfully!`);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err: any) {
      alert(err.message || 'Failed to update company settings');
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="text-center py-16 text-xs text-slate-500 font-bold flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        <span>Loading 4 Companies Configuration...</span>
      </div>
    );
  }

  const companyMeta: Record<string, { label: string; tag: string; color: string; dashPage: string }> = {
    kleanmaxpro: {
      label: 'Klean Max Pro',
      tag: 'Floor Scrubbing',
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      dashPage: 'kleanmaxpro_dash',
    },
    kleanmax: {
      label: 'Kleanmax',
      tag: 'Spares & Sales',
      color: 'border-sky-400 bg-sky-50 text-sky-900',
      dashPage: 'kleanmax_dash',
    },
    uniquepainters: {
      label: 'Unique Painters',
      tag: 'Coating & Epoxy',
      color: 'border-purple-400 bg-purple-50 text-purple-900',
      dashPage: 'uniquepainters_dash',
    },
    cleantech: {
      label: 'Cleantech Services',
      tag: 'Solar & AMC',
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      dashPage: 'cleantech_dash',
    },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
            Unified Admin Center
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Manage 4 Companies (All Parameters Editable)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure legal entities, GSTIN, bank remittance coordinates, prefixes, and quotation terms per subsidiary.
          </p>
        </div>

        {!isAdmin && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Admin privileges required to save changes</span>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Company Tabs Pill Bar */}
      <div className="bg-slate-900 p-2 rounded-2xl flex flex-wrap gap-2 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {companies.map((c) => {
            const code = c.company_code || 'kleanmaxpro';
            const meta = companyMeta[code] || {
              label: c.company_name,
              tag: 'Commercial',
              color: 'bg-slate-800 text-slate-200',
              dashPage: 'dashboard',
            };
            const isSelected = activeCode === code;

            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setActiveCode(code);
                  setSuccessMsg('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  isSelected
                    ? 'bg-[#FED10C] text-slate-950 shadow-md transform scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{c.company_name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {c.quotation_prefix || code.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        {onNavigate && activeCompany && activeCompany.company_code && (
          <button
            type="button"
            onClick={() => onNavigate(companyMeta[activeCompany.company_code!]?.dashPage || 'dashboard')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <span>Go to {activeCompany.company_name} Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Company Form */}
      {activeCompany && (
        <form onSubmit={handleSaveActive} className="space-y-6">
          {/* Identity & Legal Entity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Company Identity & Legal Registration</span>
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded font-bold">
                ID: {activeCompany.company_code}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Brand Display Name
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.company_name}
                  onChange={(e) => setActiveCompany({ ...activeCompany, company_name: e.target.value })}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Registered Legal Entity Name
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.legal_name}
                  onChange={(e) => setActiveCompany({ ...activeCompany, legal_name: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Company Tagline / Subtitle
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.tagline || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, tagline: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50 focus:border-amber-400 focus:outline-hidden"
                  placeholder="e.g. Commercial Floor Scrubbing & Deep Facility Care"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Brand Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    disabled={!isAdmin}
                    value={activeCompany.brand_color || '#FED10C'}
                    onChange={(e) => setActiveCompany({ ...activeCompany, brand_color: e.target.value })}
                    className="w-10 h-10 p-1 rounded-lg border border-slate-300 cursor-pointer disabled:bg-slate-50"
                  />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.brand_color || '#FED10C'}
                    onChange={(e) => setActiveCompany({ ...activeCompany, brand_color: e.target.value })}
                    className="w-full text-xs font-mono uppercase border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Company GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.gstin || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, gstin: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-mono uppercase font-bold border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  PAN / Corporate Identification (CIN)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={!isAdmin}
                    placeholder="PAN"
                    value={activeCompany.pan || ''}
                    onChange={(e) => setActiveCompany({ ...activeCompany, pan: e.target.value.toUpperCase() })}
                    className="w-1/2 text-xs font-mono uppercase border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                  />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    placeholder="CIN"
                    value={activeCompany.cin || ''}
                    onChange={(e) => setActiveCompany({ ...activeCompany, cin: e.target.value.toUpperCase() })}
                    className="w-1/2 text-xs font-mono uppercase border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registered Office & Contact Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span>Registered Office & Contact Coordinates</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Address Line 1 & Line 2
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.address_line1}
                    onChange={(e) => setActiveCompany({ ...activeCompany, address_line1: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                    placeholder="Address Line 1"
                  />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.address_line2 || ''}
                    onChange={(e) => setActiveCompany({ ...activeCompany, address_line2: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                    placeholder="Address Line 2 (Optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City & Pincode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.city}
                    onChange={(e) => setActiveCompany({ ...activeCompany, city: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                  />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.pincode}
                    onChange={(e) => setActiveCompany({ ...activeCompany, pincode: e.target.value })}
                    className="w-32 text-xs font-mono border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  State & State Code (GST)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.state}
                    onChange={(e) => setActiveCompany({ ...activeCompany, state: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                  />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.state_code}
                    onChange={(e) => setActiveCompany({ ...activeCompany, state_code: e.target.value })}
                    className="w-20 text-xs font-mono text-center font-bold border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Primary & Secondary Phone
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.phone1 || ''}
                    onChange={(e) => setActiveCompany({ ...activeCompany, phone1: e.target.value })}
                    className="w-1/2 text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                    placeholder="Phone 1"
                  />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.phone2 || ''}
                    onChange={(e) => setActiveCompany({ ...activeCompany, phone2: e.target.value })}
                    className="w-1/2 text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                    placeholder="Phone 2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Official Email & Website
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    disabled={!isAdmin}
                    value={activeCompany.email || ''}
                    onChange={(e) => setActiveCompany({ ...activeCompany, email: e.target.value })}
                    className="w-1/2 text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={activeCompany.website || ''}
                    onChange={(e) => setActiveCompany({ ...activeCompany, website: e.target.value })}
                    className="w-1/2 text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                    placeholder="Website"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Remittance Details (Printed on PDFs) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Bank Remittance Details (Printed on Quotation PDFs)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.bank_name || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, bank_name: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.bank_account_no || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, bank_account_no: e.target.value })}
                  className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.bank_ifsc || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, bank_ifsc: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-mono uppercase font-bold border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Branch Location
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.bank_branch || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, bank_branch: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Quotation Rules & Prefixes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>Quotation Numbering & Validity Rules</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quotation Prefix
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={activeCompany.quotation_prefix}
                  onChange={(e) => setActiveCompany({ ...activeCompany, quotation_prefix: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-mono font-black uppercase border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  e.g. {activeCompany.quotation_prefix || 'PREFIX'}/2026-27/0001
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Default Validity (Days)
                </label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={activeCompany.default_validity_days}
                  onChange={(e) => setActiveCompany({ ...activeCompany, default_validity_days: parseInt(e.target.value) || 30 })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Rounding Policy
                </label>
                <select
                  disabled={!isAdmin}
                  value={activeCompany.rounding_policy}
                  onChange={(e) => setActiveCompany({ ...activeCompany, rounding_policy: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50 font-semibold"
                >
                  <option value="HALF_UP">ROUND_HALF_UP (Standard India)</option>
                  <option value="ROUND_UP">ROUND_UP (Ceiling)</option>
                  <option value="ROUND_DOWN">ROUND_DOWN (Floor)</option>
                  <option value="NONE">Exact Paise (No Rounding)</option>
                </select>
              </div>
            </div>

            {/* Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Default Payment Terms
                </label>
                <textarea
                  rows={2}
                  disabled={!isAdmin}
                  value={activeCompany.default_payment_terms || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, default_payment_terms: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Default Warranty Terms
                </label>
                <textarea
                  rows={2}
                  disabled={!isAdmin}
                  value={activeCompany.default_warranty_terms || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, default_warranty_terms: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Terms & Conditions Printed on PDFs
                </label>
                <textarea
                  rows={3}
                  disabled={!isAdmin}
                  value={activeCompany.terms_and_conditions || ''}
                  onChange={(e) => setActiveCompany({ ...activeCompany, terms_and_conditions: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {isAdmin && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Changes will take effect immediately across all PDF prints, calculations, and active quotes.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : `Save ${activeCompany.company_name} Settings`}</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CompanySettings;
