import React, { useState, useEffect } from 'react';
import { Customer, User } from '../services/types';
import { api } from '../services/api';
import { Users, Search, Plus, MapPin, Phone, Mail, Building, Edit2, X, Check } from 'lucide-react';

interface CustomersProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
}

export const Customers: React.FC<CustomersProps> = ({ currentUser, onNavigate }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('Chennai');
  const [billingState, setBillingState] = useState('Tamil Nadu');
  const [billingStateCode, setBillingStateCode] = useState('33');
  const [billingPincode, setBillingPincode] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [searchTerm]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.customers.list(searchTerm);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setGstin('');
    setBillingAddress('');
    setBillingCity('Chennai');
    setBillingState('Tamil Nadu');
    setBillingStateCode('33');
    setBillingPincode('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setCompanyName(c.company_name);
    setContactPerson(c.contact_person || '');
    setPhone(c.phone);
    setEmail(c.email || '');
    setGstin(c.gstin || '');
    setBillingAddress(c.billing_address_line1);
    setBillingCity(c.billing_city);
    setBillingState(c.billing_state);
    setBillingStateCode(c.billing_state_code);
    setBillingPincode(c.billing_pincode);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim() || !billingAddress.trim() || !billingPincode.trim()) {
      setFormError('Company name, phone, address and pincode are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer) {
        await api.customers.update(editingCustomer.id, {
          company_name: companyName.trim(),
          contact_person: contactPerson.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          gstin: gstin.trim() || undefined,
          billing_address_line1: billingAddress.trim(),
          billing_city: billingCity,
          billing_state: billingState,
          billing_state_code: billingStateCode,
          billing_pincode: billingPincode.trim(),
        });
      } else {
        await api.customers.create({
          company_name: companyName.trim(),
          contact_person: contactPerson.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          gstin: gstin.trim() || undefined,
          billing_address_line1: billingAddress.trim(),
          billing_city: billingCity,
          billing_state: billingState,
          billing_state_code: billingStateCode,
          billing_pincode: billingPincode.trim(),
        });
      }
      setModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
            Directory & CRM
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Accounts & Work Sites
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, contact, phone, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-400 font-bold">
            Loading customers directory...
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-400">
            No customer accounts found. Click "Add New Customer" above.
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-black text-base text-slate-900 leading-tight">
                    {c.company_name}
                  </div>
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1 text-slate-400 hover:text-slate-900 rounded"
                    title="Edit Customer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {c.contact_person && (
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    Attn: {c.contact_person}
                  </div>
                )}

                <div className="space-y-1 text-xs text-slate-500 mt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {c.billing_address_line1}, {c.billing_city}, {c.billing_state} - {c.billing_pincode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="font-mono text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                  GSTIN: {c.gstin || 'Unregistered'}
                </span>

                <button
                  onClick={() => onNavigate('quotations', { customer_id: c.id })}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700"
                >
                  View Quotations →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#FED10C]" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  {editingCustomer ? 'Edit Client Record' : 'Add New Client Profile'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caterpillar India Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. S. Sundaram"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98400 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="admin@client.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    GSTIN (15 Characters)
                  </label>
                  <input
                    type="text"
                    placeholder="33AAAAA0000A1Z5"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => {
                      setGstin(e.target.value.toUpperCase());
                      if (e.target.value.length >= 2) {
                        setBillingStateCode(e.target.value.substring(0, 2));
                      }
                    }}
                    className="w-full text-xs font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Billing Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot No / Industrial Complex"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={billingState}
                    onChange={(e) => setBillingState(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="600001"
                    value={billingPincode}
                    onChange={(e) => setBillingPincode(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
