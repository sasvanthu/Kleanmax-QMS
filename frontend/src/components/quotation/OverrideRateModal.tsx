import React, { useState } from 'react';
import { QuotationSection, User } from '../../services/types';
import { ShieldAlert, CheckCircle, X } from 'lucide-react';

interface OverrideRateModalProps {
  section: QuotationSection;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyOverride: (newRate: number, reason: string) => void;
}

export const OverrideRateModal: React.FC<OverrideRateModalProps> = ({
  section,
  isOpen,
  onClose,
  onApplyOverride,
}) => {
  const [newRate, setNewRate] = useState<number>(section.applied_rate);
  const [reason, setReason] = useState<string>(section.override_reason || '');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRate <= 0) {
      setError('Overridden rate must be a positive number.');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setError('A descriptive reason (min 5 characters) is required for compliance audit logging.');
      return;
    }

    onApplyOverride(newRate, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              Manual Rate Override Authorization
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Section & Service
            </label>
            <div className="text-xs bg-slate-100 p-2 rounded border border-slate-200">
              <span className="font-bold text-slate-900">{section.section_name}</span>
              <div className="text-slate-600">{section.service_name}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Catalogue Rate
              </label>
              <div className="text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-500 font-semibold">
                ₹ {Number(section.original_catalogue_rate).toFixed(2)} / {section.billable_uom}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                Authorized Override Rate
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newRate}
                  onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-extrabold text-slate-900 bg-white border border-amber-400 rounded p-2 pl-6 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
              Mandatory Justification / Reason *
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Approved bulk contract rate for >50,000 sq ft or negotiated client pricing."
              className="w-full text-xs bg-white border border-slate-300 rounded p-2 focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              This reason is permanently preserved in the database audit log and quotation snapshot.
            </p>
          </div>

          {error && (
            <div className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Apply Authorized Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OverrideRateModal;
