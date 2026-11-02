import React from 'react';
import { QuotationSection, Service, User } from '../../services/types';
import { Trash2, Edit3, ShieldAlert, Sparkles } from 'lucide-react';

interface SectionRowProps {
  index: number;
  section: QuotationSection;
  services: Service[];
  currentUser: User | null;
  onUpdate: (updated: QuotationSection) => void;
  onRemove: () => void;
  onOpenOverrideModal: () => void;
}

export const SectionRow: React.FC<SectionRowProps> = ({
  index,
  section,
  services,
  currentUser,
  onUpdate,
  onRemove,
  onOpenOverrideModal,
}) => {
  const areaServices = services.filter(s => s.quotation_type === 'area_based' || s.category === 'cleaning' || s.category === 'painting');

  const handleServiceChange = (serviceId: string) => {
    const selected = services.find(s => s.id === serviceId);
    if (selected) {
      onUpdate({
        ...section,
        service_id: selected.id,
        service_name: selected.service_name,
        original_catalogue_rate: Number(selected.standard_rate),
        applied_rate: Number(selected.standard_rate),
        rate_source: 'catalogue',
        override_reason: undefined,
        billable_uom: selected.default_uom === 'sq_m' ? 'sq_m' : 'sq_ft',
      });
    }
  };

  const handleDimensionChange = (field: 'length' | 'breadth' | 'repetitions', val: number) => {
    const updated = {
      ...section,
      [field]: val > 0 ? val : 1,
    };
    onUpdate(updated);
  };

  const isAuthorized = true;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#FED10C] text-slate-950 font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <input
            type="text"
            value={section.section_name}
            onChange={(e) => onUpdate({ ...section, section_name: e.target.value })}
            placeholder="Section Name (e.g. Ground Floor Main Bay)"
            className="font-bold text-slate-800 text-sm border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none px-1 py-0.5 rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          {section.rate_source === 'manual_override' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Overridden (Reason: {section.override_reason})
            </span>
          ) : (
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              Catalogue Rate
            </span>
          )}

          <button
            type="button"
            onClick={onRemove}
            className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
            title="Remove Section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Service Picker */}
        <div className="md:col-span-4">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Service Required
          </label>
          <select
            value={section.service_id || ''}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:bg-white"
          >
            <option value="">Select Service...</option>
            {areaServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.service_name} (₹{s.standard_rate}/{s.default_uom})
              </option>
            ))}
          </select>
        </div>

        {/* Length */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Length
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.1"
              value={section.length || ''}
              onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 pr-7 focus:ring-1 focus:ring-amber-500"
              placeholder="0.00"
            />
            <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 uppercase">
              {section.measurement_unit}
            </span>
          </div>
        </div>

        {/* Breadth */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Breadth
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.1"
              value={section.breadth || ''}
              onChange={(e) => handleDimensionChange('breadth', parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 pr-7 focus:ring-1 focus:ring-amber-500"
              placeholder="0.00"
            />
            <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 uppercase">
              {section.measurement_unit}
            </span>
          </div>
        </div>

        {/* Unit Selection */}
        <div className="md:col-span-1">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Unit
          </label>
          <select
            value={section.measurement_unit}
            onChange={(e) => onUpdate({ ...section, measurement_unit: e.target.value as any })}
            className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
          >
            <option value="ft">Feet</option>
            <option value="m">Metres</option>
          </select>
        </div>

        {/* Repetitions / Identical Areas */}
        <div className="md:col-span-1">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1" title="Number of identical areas">
            Reps
          </label>
          <input
            type="number"
            min="1"
            value={section.repetitions || 1}
            onChange={(e) => handleDimensionChange('repetitions', parseInt(e.target.value) || 1)}
            className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 text-center focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Rate & Override */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">
              Rate / {section.billable_uom}
            </label>
            <button
              type="button"
              onClick={onOpenOverrideModal}
              className="text-[10px] font-bold flex items-center gap-0.5 text-amber-600 hover:text-amber-700 underline"
              title="Override Catalogue Rate"
            >
              <Edit3 className="w-2.5 h-2.5" /> Override
            </button>
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 justify-between">
            <span className="text-xs font-bold text-slate-800">
              ₹ {Number(section.applied_rate).toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              /{section.billable_uom}
            </span>
          </div>
        </div>
      </div>

      {/* Calculated Metrics Row */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-4 text-slate-500">
          <div>
            Single Area: <strong className="text-slate-800">{(section.length * section.breadth).toFixed(2)}</strong> {section.measurement_unit}²
          </div>
          <div>
            Billable Area: <strong className="text-slate-900 font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
              {Number(section.billable_area || (section.length * section.breadth * (section.repetitions || 1))).toFixed(2)} {section.billable_uom}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Line Total:</span>
          <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            ₹ {Number(section.line_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
