import React, { useState, useEffect } from 'react';
import { Quotation } from '../../services/types';
import { api } from '../../services/api';
import { Printer, Download, X, Eye, FileText, Edit, FileCode } from 'lucide-react';

interface PdfPreviewModalProps {
  quotationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string, params?: any) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  quotationId,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && quotationId) {
      loadHtml();
    }
  }, [isOpen, quotationId]);

  const loadHtml = async () => {
    if (!quotationId) return;
    setLoading(true);
    setPreviewError(null);
    try {
      const res = await fetch(api.quotations.getHtmlUrl(quotationId), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (!res.ok) {
        let errDesc = `HTTP ${res.status}: ${res.statusText}`;
        try {
          const text = await res.text();
          try {
            const parsed = JSON.parse(text);
            errDesc = parsed.detail || parsed.message || text;
          } catch {
            if (text && text.length < 500) errDesc = text;
          }
        } catch {
          // ignore
        }
        setPreviewError(errDesc);
        return;
      }
      const text = await res.text();
      setHtmlContent(text);
    } catch (err: any) {
      console.error(err);
      setPreviewError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!quotationId) return;
    const printWindow = window.open(api.quotations.getHtmlUrl(quotationId), '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownloadPdf = () => {
    if (!quotationId) return;
    api.quotations.downloadPdf(quotationId);
  };

  const handleDownloadDocx = () => {
    if (!quotationId) return;
    api.quotations.downloadDocx(quotationId);
  };

  const handleEdit = () => {
    if (!quotationId || !onNavigate) return;
    onClose();
    onNavigate('quotation_edit', { id: quotationId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[92vh] border border-slate-200 overflow-hidden flex flex-col">
        {/* Header Actions */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FED10C]" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">
              Official Quotation A4 Preview
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigate && (
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 border border-slate-700 shadow-xs"
                title="Edit this quotation"
              >
                <Edit className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Quotation</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 border border-slate-700 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print A4</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              title="Download editable Microsoft Word document"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Word (.docx)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-[#FED10C] hover:bg-[#E5BC07] text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-white ml-2 p-1 rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe Preview Container */}
        <div className="flex-1 bg-slate-200 overflow-hidden relative p-4 flex justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-500 font-bold">
              Rendering quotation document...
            </div>
          ) : previewError ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md text-center p-6 bg-white rounded-2xl shadow border border-rose-200 space-y-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-black">
                !
              </div>
              <h4 className="text-sm font-bold text-slate-900">Unable to load document preview</h4>
              <p className="text-xs text-slate-500 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-mono">
                {previewError}
              </p>
              <button
                type="button"
                onClick={loadHtml}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Retry Document Render
              </button>
            </div>
          ) : (
            <div className="w-full max-w-[210mm] h-full bg-white shadow-lg overflow-y-auto rounded border border-slate-300">
              <iframe
                title="Quotation Preview"
                srcDoc={htmlContent}
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
