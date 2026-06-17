import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Globe, MousePointer2, Smartphone, TrendingUp, TrendingDown, Shield, ShieldAlert, Download, Sparkles, Clock, AlertTriangle, Bot, Monitor, Loader2 } from 'lucide-react';
import { StatsCard } from '../../components/analytics/StatsCard';
import { ClickChart } from '../../components/analytics/ClickChart';
import { GeoMap } from '../../components/analytics/GeoMap';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';

const insightIcons = {
  'clock': Clock,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-triangle': AlertTriangle,
  'globe': Globe,
  'bot': Bot,
  'smartphone': Smartphone,
  'monitor': Monitor,
  'sparkles': Sparkles,
};

const insightColors = {
  info: { bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/30', text: 'text-brand-cyan', metric: 'text-brand-cyan' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', metric: 'text-amber-400' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', metric: 'text-red-400' },
};

const InsightCard = ({ insight, index }) => {
  const Icon = insightIcons[insight.icon] || Sparkles;
  const colors = insightColors[insight.type] || insightColors.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, type: 'spring', damping: 20 }}
      className={`p-5 rounded-2xl border ${colors.border} ${colors.bg} relative overflow-hidden group hover:scale-[1.01] transition-transform`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start gap-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} border ${colors.border}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white mb-1">{insight.title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-2xl font-black ${colors.metric}`}>{insight.metric}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{insight.metricLabel}</div>
        </div>
      </div>
    </motion.div>
  );
};

const Analytics = () => {
  const { data, loading, error } = useFetch('/analytics');
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const res = await api.get('/analytics/insights');
        setInsights(res.data?.insights || []);
      } catch (err) {
        console.error('Failed to fetch AI insights:', err);
        setInsights([{
          id: 'error',
          type: 'info',
          icon: 'sparkles',
          title: 'Gathering Intelligence',
          description: 'Not enough traffic data yet to generate insights. Share your links and check back once clicks start flowing in.',
          metric: '—',
          metricLabel: 'Waiting',
        }]);
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const totalClicks   = typeof data?.total === 'number' ? data.total : 0;
  const activeLinks   = typeof data?.activeLinks === 'number' ? data.activeLinks : 0;
  const mobilePercent = typeof data?.mobile === 'number' ? data.mobile : 0;
  const topLocation   = data?.topLocation || 'Unknown';
  const botClicks     = typeof data?.botClicks === 'number' ? data.botClicks : 0;
  const anomalies     = typeof data?.anomaliesCount === 'number' ? data.anomaliesCount : 0;

  const timeline = Array.isArray(data?.timeline) ? data.timeline : [];
  const geo      = Array.isArray(data?.geo) ? data.geo : [];

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/analytics/export/csv', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download CSV');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-4 border-b border-white/5 relative">
        <div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Live Telemetry</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Analytics</h1>
          <p className="text-muted">Global traffic overview and deep insights.</p>
        </div>
        
        {!loading && data && (
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExportCSV}
              className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300"
            >
              <Download className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium">
          Error initializing telemetry array: {error.message || 'Connection lost'}
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Escorted" value={loading ? '…' : totalClicks.toLocaleString()} icon={MousePointer2} delay={0.1} />
        <StatsCard title="Active Relays" value={loading ? '…' : activeLinks.toString()} icon={BarChart3} delay={0.2} />
        <StatsCard title="Primary Origin" value={loading ? '…' : topLocation} icon={Globe} delay={0.3} />
        <StatsCard title="Mobile Vectors" value={loading ? '…' : `${mobilePercent}%`} icon={Smartphone} delay={0.4} />
        <StatsCard title="Bots Neutralized" value={loading ? '…' : botClicks.toLocaleString()} icon={Shield} delay={0.5} />
        <StatsCard title="Threat Anomalies" value={loading ? '…' : anomalies.toLocaleString()} icon={ShieldAlert} delay={0.6} />
      </div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-emerald" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Insights</h2>
            <p className="text-xs text-slate-500">Interpreted intelligence from your traffic data</p>
          </div>
        </div>
        
        {insightsLoading ? (
          <div className="flex items-center justify-center p-12 glass-panel rounded-2xl border border-white/5">
            <Loader2 className="w-6 h-6 text-brand-emerald animate-spin mr-3" />
            <span className="text-slate-400 text-sm font-medium">Analyzing traffic patterns...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {insights.map((insight, idx) => (
                <InsightCard key={insight.id} insight={insight} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Chart + Geo map */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5">
          <ClickChart data={timeline} loading={loading} />
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/5">
          <GeoMap data={geo} loading={loading} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
