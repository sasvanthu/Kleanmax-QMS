import React, { useState, useEffect } from 'react';
import { User } from '../services/types';
import { api } from '../services/api';
import { ShieldCheck, Search, Filter, Clock, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

interface AuditLogsProps {
  currentUser: User | null;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [filterType]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.auditLogs.list(filterType !== 'all' ? filterType : undefined);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
          Compliance & Traceability
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Audit Trail & Rate Override Log
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable log of all user activities, quotation transitions, and authorized price overrides.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilterType('quotation_section')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            filterType === 'quotation_section' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rate Overrides Only</span>
        </button>
        <button
          onClick={() => setFilterType('quotation')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filterType === 'quotation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Quotation Status Changes
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-200 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Details & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      {log.performed_by_name || 'System Operator'}
                    </td>

                    <td className="p-3.5">
                      {log.action === 'rate_override' ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-1 w-fit">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Rate Override
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">
                          {log.action}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-600 uppercase">
                      {log.entity_type}
                    </td>

                    <td className="p-3.5 text-slate-700 text-xs">
                      {log.action === 'rate_override' && log.changes_json ? (
                        <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200/80 text-[11px] space-y-0.5">
                          <div>
                            Quote: <strong>{log.changes_json.quotation_number}</strong> • Section: <strong>{log.changes_json.section_name}</strong>
                          </div>
                          <div>
                            Original Rate: <span className="line-through text-slate-400">₹{log.changes_json.original_rate}</span> →
                            <strong className="text-amber-900 ml-1">₹{log.changes_json.overridden_rate}</strong>
                          </div>
                          <div className="text-slate-600 italic">
                            Reason: "{log.changes_json.reason}"
                          </div>
                        </div>
                      ) : (
                        <pre className="text-[10px] font-mono text-slate-500 max-w-md truncate">
                          {JSON.stringify(log.changes_json || {})}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
