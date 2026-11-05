import React, { useState, useEffect } from 'react';
import { User, CompanySetting } from '../services/types';
import { api } from '../services/api';
import {
  Sun,
  FileText,
  Edit,
  Building2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield
} from 'lucide-react';

interface CleantechDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview: (quotationId: string) => void;
}

export const CleantechDashboard: React.FC<CleantechDashboardProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [company, setCompany] = useState<CompanySetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const comp = await api.company.get('cleantech');
      setCompany(comp);
    } catch (err) {
      console.error('Failed to load Cleantech info:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Top Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Companies</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="bg-teal-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Company 4 • CTS
            </span>
            <span className="bg-teal-100 text-teal-900 text-xs font-bold px-2.5 py-1 rounded-full">
              Prefix: {company?.quotation_prefix || 'CTS'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2.5">
            <span>{company?.company_name || 'Cleantech Services'}</span>
            <span className="text-2xl">🌿</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rooftop & industrial solar panel cleaning, glass facade wash & comprehensive AMC maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('settings', { tab: 'cleantech' })}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Company Settings</span>
          </button>
        </div>
      </div>

      {/* Big Navigation Cards for Cleantech Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Quotation Generator */}
        <div
          onClick={() => onNavigate('cleantech_generator')}
          className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-5 group-hover:scale-110 transition-transform">
              <Sun className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
              Quotation Generator
            </h2>
            <p className="text-xs font-bold text-teal-700 mt-1 uppercase tracking-wider">
              Solar, Facade & AMC Contracts
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Generate proposals for solar panel wash, glass facade restoration, and periodic maintenance contracts with instant Word and PDF preview & download.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-teal-500 text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
              <span>Open Solar/AMC Generator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 2: Past Records */}
        <div
          onClick={() => onNavigate('cleantech_quotes')}
          className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-5 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
              Past Records
            </h2>
            <p className="text-xs font-bold text-teal-700 mt-1 uppercase tracking-wider">
              View, Word (.docx) & PDF
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Browse all historical Cleantech Services proposals. Export directly to Microsoft Word (.docx) or PDF, view previews, and edit records.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-teal-500 text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
              <span>View Past Records</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 3: Quotation Editor */}
        <div
          onClick={() => onNavigate('quotation_edit', { company_code: 'cleantech' })}
          className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-5 group-hover:scale-110 transition-transform">
              <Edit className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
              Quotation Editor
            </h2>
            <p className="text-xs font-bold text-teal-700 mt-1 uppercase tracking-wider">
              Custom Rates, Items & Terms
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Open visual proposal editor preset for Cleantech Services. Customize cleaning frequencies, equipment allocations, taxes, and service terms.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button className="w-full py-3 px-4 bg-slate-900 group-hover:bg-teal-500 text-white group-hover:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all">
              <span>Open Quotation Editor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Quick Action: Company Info */}
        <div
          onClick={() => onNavigate('settings', { tab: 'cleantech' })}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group md:col-span-2"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm group-hover:text-teal-600 transition-colors">
                Company Letterhead & Info
              </h3>
              <p className="text-xs text-slate-500">
                Update letterhead banner, GSTIN ({company?.gstin || '33AABCT9988Z1Z5'}), bank details, and registered address.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default CleantechDashboard;
