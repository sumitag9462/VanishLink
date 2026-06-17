import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2, Database, ShieldCheck } from 'lucide-react';

export const Table = ({ columns, data, isLoading, onRowClick }) => {
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl shadow-xl">
        <div className="p-4 border-b border-slate-700/50 flex gap-6">
          <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse"></div>
          <div className="h-4 w-40 bg-slate-700/50 rounded animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 p-5 border-b border-slate-700/30">
            <div className="h-10 w-10 bg-slate-700/40 rounded-full animate-pulse shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 bg-slate-700/40 rounded animate-pulse"></div>
              <div className="h-3 w-1/4 bg-slate-700/30 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-24 bg-slate-700/40 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-700/40 rounded-lg animate-pulse shrink-0"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-20 text-center glass-panel rounded-3xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent animate-scan opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 relative group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20"></div>
            <Database className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Zero Telemetry Detected</h3>
          <p className="text-muted max-w-md mx-auto">
            This data stream is currently empty. Awaiting new network requests or configuration events.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-700/50 bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl shadow-xl">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800/80 text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-700/50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={cn("px-6 py-4", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {data.map((row, rowIndex) => (
            <tr 
              key={row._id || rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                "group transition-all duration-200 hover:bg-slate-700/30 hover:shadow-lg",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-slate-200">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};