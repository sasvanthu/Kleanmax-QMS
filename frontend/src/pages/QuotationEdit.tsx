import React, { useState, useEffect } from 'react';
import { User } from '../services/types';
import { api } from '../services/api';
import { CleantechGenerator } from './CleantechGenerator';
import { UniquePaintersGenerator } from './UniquePaintersGenerator';
import { KleanmaxGenerator } from './KleanmaxGenerator';
import { KleanmaxProAreaQuotation } from './KleanmaxProAreaQuotation';
import { RefreshCw, ArrowLeft, Building2 } from 'lucide-react';

export interface QuotationEditProps {
  quotationId?: string | null;
  initialCompanyCode?: string;
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const QuotationEdit: React.FC<QuotationEditProps> = ({
  quotationId,
  initialCompanyCode,
  currentUser,
  onNavigate,
  onOpenPreview,
}) => {
  const [resolvedCompany, setResolvedCompany] = useState<string | null>(
    initialCompanyCode && initialCompanyCode !== 'all' ? initialCompanyCode : null
  );
  const [loading, setLoading] = useState<boolean>(!resolvedCompany && !!quotationId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resolveCompany = async () => {
      if (initialCompanyCode && initialCompanyCode !== 'all') {
        setResolvedCompany(initialCompanyCode);
        return;
      }

      if (!quotationId) {
        // Fallback to current user company or default
        const fallback = currentUser?.company_code && currentUser.company_code !== 'all'
          ? currentUser.company_code
          : 'cleantech';
        setResolvedCompany(fallback);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const q = await api.quotations.get(quotationId);
        if (isMounted) {
          const compCode = (q.company_code || (q.company as any)?.company_code || 'cleantech').toLowerCase();
          setResolvedCompany(compCode);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to resolve quotation company:', err);
          setError(err.message || 'Failed to locate quotation.');
          // Default to Cleantech or user company
          setResolvedCompany(currentUser?.company_code !== 'all' ? currentUser?.company_code || 'cleantech' : 'cleantech');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    resolveCompany();

    return () => {
      isMounted = false;
    };
  }, [quotationId, initialCompanyCode, currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-bold">Loading authentic company quotation editor...</p>
      </div>
    );
  }

  if (error && !resolvedCompany) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
        <div className="text-red-700 font-bold text-sm">{error}</div>
        <button
          onClick={() => onNavigate('quotations')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </button>
      </div>
    );
  }

  // Route to the authentic Generator for that company
  switch (resolvedCompany) {
    case 'cleantech':
      return (
        <CleantechGenerator
          currentUser={currentUser}
          onNavigate={onNavigate}
          onOpenPreview={onOpenPreview}
          quotationId={quotationId}
        />
      );

    case 'uniquepainters':
      return (
        <UniquePaintersGenerator
          currentUser={currentUser}
          onNavigate={onNavigate}
          onOpenPreview={onOpenPreview}
          quotationId={quotationId}
        />
      );

    case 'kleanmax':
      return (
        <KleanmaxGenerator
          currentUser={currentUser}
          onNavigate={onNavigate}
          onOpenPreview={onOpenPreview}
          quotationId={quotationId}
        />
      );

    case 'kleanmaxpro':
      return (
        <KleanmaxProAreaQuotation
          currentUser={currentUser}
          onNavigate={onNavigate}
          onOpenPreview={onOpenPreview}
          quotationId={quotationId}
        />
      );

    default:
      // Fallback selector or default to Cleantech
      return (
        <CleantechGenerator
          currentUser={currentUser}
          onNavigate={onNavigate}
          onOpenPreview={onOpenPreview}
          quotationId={quotationId}
        />
      );
  }
};

export default QuotationEdit;
