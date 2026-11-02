import React, { useState, useEffect } from 'react';
import { Customer } from '../../services/types';
import { api } from '../../services/api';
import { Search, Plus, UserPlus, Building, Phone, Mail, MapPin, X, Check } from 'lucide-react';

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New customer form state
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Chennai');
  const [newState, setNewState] = useState('Tamil Nadu');
  const [newStateCode, setNewStateCode] = useState('33');
  const [newPincode, setNewPincode] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen, searchTerm]);

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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newPhone.trim() || !newAddress.trim() || !newPincode.trim()) {
      setFormError('Company name, phone, address and pincode are required.');
      return;
    }

    try {
      const created = await api.customers.create({
        company_name: newCompany.trim(),
        contact_person: newContact.trim() || undefined,
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
        gstin: newGstin.trim() || undefined,
        billing_address_line1: newAddress.trim(),
        billing_city: newCity,
        billing_state: newState,
        billing_state_code: newStateCode,
        billing_pincode: newPincode.trim(),
      });
      onSelectCustomer(created);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create customer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#FED10C]" />
            <h3 className="font-extrabold text-base tracking-wide">
              {showAddForm ? 'Add New Client Profile' : 'Select Customer / Client'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!showAddForm ? (
          <div className="p-6 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by company name, contact, phone, GSTIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-3.5 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>New Customer</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="text-center py-8 text-xs text-slate-500">Loading customers...</div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No customers found matching "{searchTerm}".
                </div>
              ) : (
                customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCustomer(c);
                      onClose();
                    }}
                    className="p-3.5 border border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 group-hover:text-amber-900">
                        {c.company_name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        {c.contact_person && (
                          <span>Attn: <strong>{c.contact_person}</strong></span>
                        )}
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                        </span>
                        {c.gstin && (
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono text-[10px]">
                            GSTIN: {c.gstin}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {c.billing_city}, {c.billing_state} - {c.billing_pincode}
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded shadow-xs transition-opacity flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 overflow-y-auto flex-1">
            {formError && (
              <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Company / Entity Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Tyres Manufacturing Unit"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. S. Ramanathan"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
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
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="procurement@client.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  placeholder="33AAAAA0000A1Z5"
                  maxLength={15}
                  value={newGstin}
                  onChange={(e) => {
                    setNewGstin(e.target.value.toUpperCase());
                    if (e.target.value.length >= 2) {
                      setNewStateCode(e.target.value.substring(0, 2));
                    }
                  }}
                  className="w-full text-xs font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Billing Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot No / Street Address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
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
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Back to Search
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Save & Select Client
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
