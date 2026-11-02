import React, { useState, useEffect } from 'react';
import { Quotation, User } from '../services/types';
import { api } from '../services/api';
import {
  ArrowLeft, Printer, Download, Eye, Lock, RotateCcw, CheckCircle,
  Clock, ShieldAlert, AlertTriangle, FileText, Building, Calendar,
  CreditCard, Sparkles, X, Check, Send
} from 'lucide-react';

interface QuotationDetailProps {
  quotationId: string;
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const QuotationDetail: React.FC<QuotationDetailProps> = ({
  quotationId,
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  // Revision modal
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [revising, setRevising] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuotation();
  }, [quotationId]);

  const loadQuotation = async () => {
    setLoading(true);
    try {
      const data = await api.quotations.get(quotationId);
      setQuotation(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'submit' | 'approve' | 'issue' | 'cancel') => {
    try {
      if (action === 'submit') await api.quotations.submit(quotationId);
      if (action === 'approve') await api.quotations.approve(quotationId);
      if (action === 'issue') await api.quotations.issue(quotationId);
      if (action === 'cancel') await api.quotations.cancel(quotationId);
      loadQuotation();
    } catch (err: any) {
      alert(err.message || `Failed to perform ${action}`);
    }
  };

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionReason.trim() || revisionReason.trim().length < 5) {
      alert('Please provide a descriptive reason for creating this revision.');
      return;
    }
    setRevising(true);
    try {
      const revised = await api.quotations.revise(quotationId, revisionReason.trim());
      setRevisionModalOpen(false);
      onNavigate('quotation_detail', { id: revised.id });
    } catch (err: any) {
      alert(err.message || 'Failed to branch revision');
    } finally {
      setRevising(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-xs text-slate-500 font-bold">Loading quotation details...</div>;
  }

  if (!quotation) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div>Quotation not found.</div>
        <button onClick={() => onNavigate('quotations')} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold">
          Back to Quotations
        </button>
      </div>
    );
  }

  const isIssued = quotation.status === 'issued';
  const isApproved = quotation.status === 'approved';
  const isDraft = quotation.status === 'draft';
  const isPending = quotation.status === 'pending_approval';
  const isAuthorized = true; // Unified Admin & Staff has full access

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('quotations')}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-slate-900">
                {quotation.quotation_number}
              </span>
              {quotation.revision_number > 0 && (
                <span className="bg-purple-100 text-purple-900 border border-purple-200 text-xs font-extrabold px-2 py-0.5 rounded">
                  Revision {quotation.revision_number}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Created on {quotation.quotation_date} • Prepared by: <strong>{quotation.prepared_by_name || 'Estimations'}</strong>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Official Preview */}
          <button
            onClick={() => onOpenPreview(quotation.id)}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Official A4 Preview</span>
          </button>

          {/* Direct Print */}
          <button
            onClick={() => window.open(`/api/quotations/${quotation.id}/html`, '_blank')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={() => window.open(`/api/quotations/${quotation.id}/pdf`, '_blank')}
            className="px-3.5 py-2 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {/* State Machine Transition Buttons */}
          {isDraft && (
            <button
              onClick={() => handleAction('submit')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          )}

          {isPending && (
            <button
              onClick={() => handleAction('approve')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Approve Quotation</span>
            </button>
          )}

          {(isApproved || isDraft) && (
            <button
              onClick={() => handleAction('issue')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Issue & Freeze</span>
            </button>
          )}

          {/* Create Revision from Issued/Approved quote */}
          {(isIssued || isApproved) && (
            <button
              onClick={() => setRevisionModalOpen(true)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Create Revision</span>
            </button>
          )}
        </div>
      </div>

      {/* Immutability Callout when Issued */}
      {isIssued && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold uppercase tracking-wide block text-emerald-900 text-sm">
              Issued & Immutable Record
            </span>
            This quotation has been officially issued to the client. In accordance with financial compliance rules, this record and its figures are frozen and cannot be modified. If requirements change, please click <strong>"Create Revision"</strong> to branch a new numbered revision.
          </div>
        </div>
      )}

      {/* Main Grid: Details & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sections & Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-500 font-semibold">Entity Name:</div>
                <div className="text-sm font-extrabold text-slate-900">{quotation.customer?.company_name}</div>
                <div className="text-slate-600 mt-1">
                  Attn: {quotation.customer?.contact_person} • {quotation.customer?.phone}
                </div>
                <div className="text-slate-500 text-[11px]">
                  {quotation.customer?.email}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Billing Address:</div>
                <div className="text-slate-800">
                  {quotation.customer?.billing_address_line1}, {quotation.customer?.billing_city}, {quotation.customer?.billing_state} - {quotation.customer?.billing_pincode}
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-700">
                  GSTIN: <strong>{quotation.customer?.gstin || 'Unregistered'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Area Sections Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center justify-between">
              <span>Billable Area Sections ({quotation.sections.length})</span>
              <span className="text-slate-400 font-normal">Pricing based on exact dimensions</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Section & Service</th>
                    <th className="p-3 text-center">Dimensions</th>
                    <th className="p-3 text-center">Single Area</th>
                    <th className="p-3 text-center">Reps</th>
                    <th className="p-3 text-center">Billable Area</th>
                    <th className="p-3 text-right">Applied Rate</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.sections.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{s.section_name}</div>
                        <div className="text-slate-500 text-[11px]">{s.service_name}</div>
                        {s.rate_source === 'manual_override' && (
                          <div className="text-amber-700 text-[10px] mt-0.5 flex items-center gap-1 font-semibold">
                            <Sparkles className="w-2.5 h-2.5" />
                            Overridden Rate (Justification: {s.override_reason})
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-700">
                        {s.length} × {s.breadth} {s.measurement_unit}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {Number(s.calculated_area).toFixed(2)} {s.measurement_unit}²
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {s.repetitions}
                      </td>
                      <td className="p-3 text-center font-extrabold text-slate-900">
                        <span className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                          {Number(s.billable_area).toFixed(2)} {s.billable_uom}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-800">
                        ₹ {Number(s.applied_rate).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-extrabold text-slate-900">
                        ₹ {Number(s.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Commercial Terms & Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-slate-500 font-bold uppercase text-[10px]">Payment Terms:</div>
                <div className="text-slate-800 mt-0.5">{quotation.payment_terms || 'Standard 100% advance'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold uppercase text-[10px]">Delivery / Commencement:</div>
                <div className="text-slate-800 mt-0.5">{quotation.delivery_terms || 'Standard schedule'}</div>
              </div>
            </div>
            {quotation.notes && (
              <div className="pt-2 border-t border-slate-100">
                <div className="text-slate-500 font-bold uppercase text-[10px]">Internal Notes:</div>
                <div className="text-slate-700 mt-0.5">{quotation.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financial Totals Card & Revision History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Financial Breakdown */}
          <div className="bg-[#0F172A] text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3 text-xs">
            <div className="font-extrabold text-sm uppercase tracking-wider text-slate-100 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Financial Snapshot</span>
              <span className="text-[10px] text-amber-400 font-bold uppercase bg-slate-800 px-2 py-0.5 rounded">
                {quotation.status}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-200">
                ₹ {Number(quotation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {quotation.total_discount > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Total Discount:</span>
                <span className="font-bold">
                  - ₹ {Number(quotation.total_discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {(quotation.freight_charges > 0 || quotation.packing_charges > 0 || quotation.other_charges > 0) && (
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Charges (Freight/Packing):</span>
                <span>
                  + ₹ {(Number(quotation.freight_charges) + Number(quotation.packing_charges) + Number(quotation.other_charges)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800 font-semibold">
              <span>Taxable Value:</span>
              <span className="font-bold text-white">
                ₹ {Number(quotation.taxable_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {!quotation.is_interstate ? (
              <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <div className="text-slate-400">
                  CGST ({quotation.cgst_rate}%):<br/>
                  <strong className="text-slate-200">
                    ₹ {Number(quotation.cgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="text-slate-400 text-right">
                  SGST ({quotation.sgst_rate}%):<br/>
                  <strong className="text-slate-200">
                    ₹ {Number(quotation.sgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px] flex justify-between text-slate-400">
                <span>IGST ({quotation.igst_rate}%):</span>
                <strong className="text-slate-200">
                  ₹ {Number(quotation.igst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            )}

            {quotation.rounding_adjustment !== 0 && (
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Rounding Adjustment:</span>
                <span>₹ {Number(quotation.rounding_adjustment).toFixed(2)}</span>
              </div>
            )}

            <div className="bg-[#FED10C] text-slate-950 p-3 rounded-xl shadow-md mt-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800">
                Final Total Payable
              </div>
              <div className="text-2xl font-black tracking-tight mt-0.5">
                ₹ {Number(quotation.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {quotation.amount_in_words && (
              <div className="text-[10.5px] italic text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/60 leading-tight">
                <strong>Words:</strong> {quotation.amount_in_words}
              </div>
            )}
          </div>

          {/* Revision History Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              Revision History
            </h2>

            {quotation.revisions && quotation.revisions.length > 0 ? (
              <div className="space-y-3">
                {quotation.revisions.map((rev) => (
                  <div key={rev.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Revision {rev.revision_number}</span>
                      <span className="text-[10px] text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-slate-600 italic">
                      "{rev.revision_reason}"
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Original document (Rev 0). No revisions have been branched yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revision Reason Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  Create New Revision
                </h3>
              </div>
              <button onClick={() => setRevisionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRevision} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase mb-1">
                  Revision Justification / Scope Change *
                </label>
                <textarea
                  required
                  rows={3}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="e.g. Client requested 2 additional storage bays and 10% volume discount."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revising}
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{revising ? 'Branching...' : 'Branch Revision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
