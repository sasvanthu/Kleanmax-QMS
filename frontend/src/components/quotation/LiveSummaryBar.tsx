import React from 'react';
import { CalculationResult } from '../../services/types';
import { Calculator, ArrowRight, ShieldCheck, IndianRupee } from 'lucide-react';

interface LiveSummaryBarProps {
  calculation: CalculationResult | null;
  loading: boolean;
  onSaveDraft: () => void;
  onSubmitForApproval: () => void;
  onPreviewPdf: () => void;
  saving?: boolean;
}

export const LiveSummaryBar: React.FC<LiveSummaryBarProps> = ({
  calculation,
  loading,
  onSaveDraft,
  onSubmitForApproval,
  onPreviewPdf,
  saving,
}) => {
  if (!calculation) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
        Add area sections to view authoritative financial totals.
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] text-white rounded-2xl p-5 shadow-xl border border-slate-800 sticky top-20">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#FED10C]" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">
            Authoritative Live Quotation Total
          </h3>
        </div>
        {loading && (
          <span className="text-[10px] text-amber-400 animate-pulse font-semibold">
            Recalculating...
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal (Gross Base Value):</span>
          <span className="font-bold text-slate-200">
            ₹ {Number(calculation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {calculation.total_discount > 0 && (
          <div className="flex justify-between text-red-400">
            <span>Discount ({calculation.discount_type === 'percentage' ? `${calculation.discount_value}%` : 'Fixed'}):</span>
            <span className="font-bold">
              - ₹ {Number(calculation.total_discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {(calculation.freight_charges > 0 || calculation.packing_charges > 0 || calculation.other_charges > 0) && (
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Additional Site / Freight Charges:</span>
            <span>
              + ₹ {(Number(calculation.freight_charges) + Number(calculation.packing_charges) + Number(calculation.other_charges)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800/80 font-semibold">
          <span>Taxable Value:</span>
          <span className="font-bold text-white">
            ₹ {Number(calculation.taxable_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* GST Breakdown */}
        {!calculation.is_interstate ? (
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px]">
            <div className="text-slate-400">
              CGST ({calculation.cgst_rate}%):<br/>
              <strong className="text-slate-200">
                ₹ {Number(calculation.cgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="text-slate-400 text-right">
              SGST ({calculation.sgst_rate}%):<br/>
              <strong className="text-slate-200">
                ₹ {Number(calculation.sgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px] flex justify-between text-slate-400">
            <span>Integrated GST (IGST {calculation.igst_rate}%):</span>
            <strong className="text-slate-200">
              ₹ {Number(calculation.igst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        )}

        {calculation.rounding_adjustment !== 0 && (
          <div className="flex justify-between text-slate-500 text-[10px]">
            <span>Rounding Adjustment:</span>
            <span>₹ {Number(calculation.rounding_adjustment).toFixed(2)}</span>
          </div>
        )}

        {/* Final Payable Amount */}
        <div className="bg-[#FED10C] text-slate-950 p-3 rounded-xl mt-3 shadow-md">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800">
            Final Amount Payable
          </div>
          <div className="text-2xl font-black tracking-tight mt-0.5">
            ₹ {Number(calculation.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Words */}
        {calculation.amount_in_words && (
          <div className="text-[10.5px] italic text-slate-400 mt-2 bg-slate-900/60 p-2 rounded border border-slate-800/60 leading-tight">
            <strong>Words:</strong> {calculation.amount_in_words}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={onPreviewPdf}
          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-1.5 shadow-sm"
        >
          Preview Official A4 Quotation
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onSaveDraft}
            className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onSubmitForApproval}
            className="py-2.5 px-3 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-extrabold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <span>Submit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
