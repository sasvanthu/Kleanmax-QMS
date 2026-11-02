import React, { useState, useEffect } from 'react';
import { CompanySetting, User } from '../services/types';
import { api } from '../services/api';
import { Building2, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CompanySettingsProps {
  currentUser: User | null;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ currentUser }) => {
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.company.get();
      setCompany(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const updated = await api.company.update(company);
      setCompany(updated);
      setSuccessMsg('Company settings and quotation configuration updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return <div className="text-center py-12 text-xs text-slate-500 font-bold">Loading settings...</div>;
  }

  if (!company) return null;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
            Enterprise Configuration
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Company Settings & Quotation Defaults
          </h1>
        </div>

        {!isAdmin && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Admin privileges required to save changes</span>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Identity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Company Identity & Registered Office
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Display Brand Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.company_name}
                onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Registered Legal Entity Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.legal_name}
                onChange={(e) => setCompany({ ...company, legal_name: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Company GSTIN (India)
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.gstin || ''}
                onChange={(e) => setCompany({ ...company, gstin: e.target.value.toUpperCase() })}
                className="w-full text-xs font-mono uppercase border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                PAN / Tax ID
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.pan || ''}
                onChange={(e) => setCompany({ ...company, pan: e.target.value.toUpperCase() })}
                className="w-full text-xs font-mono uppercase border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.address_line1}
                onChange={(e) => setCompany({ ...company, address_line1: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                City & Pincode
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={company.city}
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={company.pincode}
                  onChange={(e) => setCompany({ ...company, pincode: e.target.value })}
                  className="w-32 text-xs font-mono border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                State & State Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={company.state}
                  onChange={(e) => setCompany({ ...company, state: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={company.state_code}
                  onChange={(e) => setCompany({ ...company, state_code: e.target.value })}
                  className="w-20 text-xs font-mono text-center border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Direct Bank Details for PDF Footer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Bank Remittance Coordinates (Printed on Quotation PDFs)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Bank Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.bank_name || ''}
                onChange={(e) => setCompany({ ...company, bank_name: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.bank_account_no || ''}
                onChange={(e) => setCompany({ ...company, bank_account_no: e.target.value })}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.bank_ifsc || ''}
                onChange={(e) => setCompany({ ...company, bank_ifsc: e.target.value.toUpperCase() })}
                className="w-full text-xs font-mono uppercase border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Branch Location
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.bank_branch || ''}
                onChange={(e) => setCompany({ ...company, bank_branch: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Quotation Rules & Numbering Prefix */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Quotation Numbering & System Policies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quotation Prefix
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={company.quotation_prefix}
                onChange={(e) => setCompany({ ...company, quotation_prefix: e.target.value.toUpperCase() })}
                className="w-full text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
              <p className="text-[10px] text-slate-400 mt-1">e.g. KMP yields KMP/2026-27/0001</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Default Validity (Days)
              </label>
              <input
                type="number"
                disabled={!isAdmin}
                value={company.default_validity_days}
                onChange={(e) => setCompany({ ...company, default_validity_days: parseInt(e.target.value) || 30 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Rounding Policy
              </label>
              <select
                disabled={!isAdmin}
                value={company.rounding_policy}
                onChange={(e) => setCompany({ ...company, rounding_policy: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-50 font-semibold"
              >
                <option value="HALF_UP">ROUND_HALF_UP (Standard India)</option>
                <option value="ROUND_UP">ROUND_UP (Ceiling)</option>
                <option value="ROUND_DOWN">ROUND_DOWN (Floor)</option>
                <option value="NONE">Exact Paise (No Rounding)</option>
              </select>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-extrabold text-sm rounded-xl shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
