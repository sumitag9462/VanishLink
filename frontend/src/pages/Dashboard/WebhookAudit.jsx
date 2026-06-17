import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, Clock, RefreshCw, Webhook } from 'lucide-react';
import toast from 'react-hot-toast';

const WebhookAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/webhooks');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
      toast.error('Failed to load webhook audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin-slow" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5 relative">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            <Webhook className="w-8 h-8 text-primary" /> Webhook Audit
          </h1>
          <p className="text-muted">Real-time delivery telemetry for external event streaming.</p>
        </div>
        <button
          onClick={fetchWebhooks}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          Refresh Stream
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none opacity-50"></div>
        
        {loading ? (
          <div className="w-full">
            <div className="p-4 border-b border-white/5 flex gap-6">
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div>
              <div className="h-4 w-40 bg-white/5 rounded animate-pulse"></div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 p-5 border-b border-white/5">
                <div className="h-5 w-5 bg-white/10 rounded-full animate-pulse shrink-0"></div>
                <div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-white/5 rounded-full animate-pulse shrink-0"></div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="w-full py-20 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent animate-scan opacity-50"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20"></div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Zero Webhook Events Detected</h3>
              <p className="text-muted max-w-md mx-auto">
                No external delivery payloads have been logged. Configure outbound webhooks in the Advanced Routing settings when generating new VanishLinks.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Delivery Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">VanishLink ID</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Trigger Event</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Target Endpoint</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Retries</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <span className="capitalize font-medium text-slate-200">{log.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg font-mono text-xs">
                        /{log.linkId?.slug || 'deleted'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300">
                        {log.event}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[200px]" title={log.url}>
                      {log.url}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.attempts >= log.maxRetries ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                        {log.attempts} / {log.maxRetries || 3}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {new Date(log.updatedAt || log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WebhookAudit;
