import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Ghost, 
  Activity, 
  Globe, 
  Smartphone, 
  Zap, 
  AlertTriangle,
  Skull,
  EyeOff
} from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-6 rounded-3xl bg-[#111] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl rounded-full bg-${color}-500 group-hover:opacity-40 transition-opacity`} />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl bg-${color}-500/10`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
      <div>
        <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{value}</h3>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      </div>
    </div>
  </motion.div>
);

const GhostAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/ghost');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch ghost analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Ghost className="w-8 h-8 text-purple-500 animate-pulse" />
          <p className="text-sm font-mono text-purple-500 uppercase tracking-widest">Scanning Plausible Deniability Engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-12">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-sm mb-6">
          <ShieldAlert className="w-4 h-4" />
          <span>Stealth Routing Intelligence</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Ghost Mode™ <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-fuchsia-600">Analytics</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl font-light">
          Monitor unauthorized access attempts that were silently deflected by your decoy infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Ghost Redirects" value={data?.totalRedirects || 0} icon={Ghost} color="purple" delay={0.1} />
        <StatCard title="High Risk Vectors" value={data?.highRiskCount || 0} icon={AlertTriangle} color="orange" delay={0.2} />
        <StatCard title="Honeypot Traps" value={data?.honeypotHits || 0} icon={Zap} color="yellow" delay={0.3} />
        <StatCard title="Links Auto-Destroyed" value="0" icon={Skull} color="red" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Top Countries */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#111] border border-white/5 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Attack Origins
          </h3>
          <div className="space-y-4">
            {data?.topCountries?.map(([country, count], i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">{country}</span>
                <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{count}</span>
              </div>
            )) || <p className="text-slate-500 text-sm">No data available.</p>}
          </div>
        </motion.div>

        {/* Top Devices */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-[#111] border border-white/5 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Vector Devices
          </h3>
          <div className="space-y-4">
            {data?.topDevices?.map(([device, count], i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">{device}</span>
                <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{count}</span>
              </div>
            )) || <p className="text-slate-500 text-sm">No data available.</p>}
          </div>
        </motion.div>

        {/* Recent Threat Feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="bg-[#111] border border-white/5 p-6 rounded-3xl lg:row-span-2 overflow-y-auto max-h-[600px] disable-scrollbars">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Live Threat Feed
          </h3>
          <div className="space-y-4">
            {data?.recentVisitors?.length > 0 ? data.recentVisitors.map((visitor, i) => (
              <div key={i} className="p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                    {visitor.ipHash.substring(0, 8)}...
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">
                    {formatDistanceToNow(new Date(visitor.createdAt))} ago
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-white font-bold truncate">Target: {visitor.slug}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <EyeOff className="w-3 h-3" />
                    <span className="truncate">Deflected to: {visitor.decoyUsed}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Ghost className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">Zero stealth breaches detected.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GhostAnalytics;
