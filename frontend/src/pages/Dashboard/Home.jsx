import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Link as LinkIcon, 
  Gauge, 
  ShieldCheck, 
  Sparkles,
  Activity,
  Plus,
  Webhook,
  BarChart,
  ArrowRight,
  ShieldAlert,
  Globe,
  Cpu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';

// Removed fake data simulator to use real analytics API data

const ActionCard = ({ icon: Icon, label, desc, onClick, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
    onClick={onClick}
    className="group relative overflow-hidden glass-panel p-5 rounded-2xl cursor-pointer border border-white/5 hover:border-brand-cyan/30"
  >
    <div className="absolute inset-0 bg-linear-to-br from-brand-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-cyan/20 group-hover:border-brand-cyan/50 transition-all duration-300 shadow-[0_0_15px_rgba(0,217,255,0)] group-hover:shadow-[0_0_15px_rgba(0,217,255,0.3)]">
        <Icon className="w-6 h-6 text-muted group-hover:text-brand-cyan transition-colors duration-300" />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-1 group-hover:text-brand-cyan transition-colors">{label}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  </motion.div>
);

const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const startValue = displayValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * (value - startValue) + startValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <>{prefix}{displayValue.toLocaleString()}{suffix}</>;
};

const StatCard = ({ title, value, subValue, icon: Icon, trend, delay, colorClass, gradientClass }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, rotateX: 2, rotateY: 2 }}
    className="glass-panel p-6 rounded-3xl relative overflow-hidden group perspective-[1000px]"
  >
    <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-125 group-hover:rotate-12 duration-700 ${colorClass}`}>
      <Icon className="w-32 h-32" />
    </div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <div className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <h4 className="text-5xl font-black text-white tracking-tighter">
          <AnimatedCounter value={value} />
        </h4>
        {subValue && <span className="text-sm font-mono text-slate-500">{subValue}</span>}
      </div>
      
      <div className="flex items-center gap-3 mt-6">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: trend || '0%' }}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: "easeOut" }}
            className={`h-full ${gradientClass}`}
          ></motion.div>
        </div>
        <span className={`text-xs font-mono font-bold ${colorClass}`}>{trend}</span>
      </div>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, clicks: 0, blocked: 0, loading: true });
  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [linksRes, analyticsRes] = await Promise.all([
          api.get('/links'),
          api.get('/analytics')
        ]);
        
        const links = Array.isArray(linksRes.data) ? linksRes.data : [];
        const analytics = analyticsRes.data;

        setStats({
          total: links.length,
          active: links.filter((l) => l.status !== 'expired').length,
          clicks: analytics.total || 0,
          blocked: analytics.botClicks || 0,
          loading: false
        });

        if (analytics.timeline && analytics.timeline.length > 0) {
          setTrafficData(analytics.timeline.map(t => ({
            time: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            traffic: t.clicks,
            blocked: 0 
          })));
        } else {
          setTrafficData(Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
              time: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              traffic: 0,
              blocked: 0
            };
          }));
        }
      } catch (error) {
        setStats({ total: 0, active: 0, clicks: 0, blocked: 0, loading: false });
        setTrafficData(Array.from({ length: 7 }).map((_, i) => ({ time: `Day ${i+1}`, traffic: 0, blocked: 0 })));
      }
    };
    loadStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="w-full space-y-10">
      
      {/* 🔮 AI Telemetry Hero */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 glass-panel border border-white/5 p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-emerald/10 border border-brand-emerald/30 rounded-full mb-6 shadow-[0_0_15px_rgba(0,245,160,0.2)]"
          >
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
            <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-widest">Neural Defense Active</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter leading-tight">
            {getGreeting()}, <span className="bg-clip-text text-transparent bg-linear-to-r from-brand-emerald to-brand-cyan">Sumit 👋</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl font-light">
            Your intelligent routing infrastructure is active. Deep packet inspection and heuristic analysis are currently monitoring all inbound global traffic.
          </p>
        </div>

        <div className="flex gap-8 relative z-10 bg-black/40 p-5 rounded-2xl border border-white/5">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Threat Level</p>
            <p className="text-2xl font-black text-brand-emerald">LOW</p>
          </div>
          <div className="w-px h-12 bg-white/10 self-center"></div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">AI Latency</p>
            <p className="text-2xl font-black text-brand-cyan">14ms</p>
          </div>
        </div>
      </motion.div>

      {/* 📊 Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Protected Links" 
          value={stats.loading ? 0 : stats.total} 
          icon={LinkIcon} 
          trend="85%" 
          delay={0.3}
          colorClass="text-brand-emerald"
          gradientClass="bg-linear-to-r from-brand-emerald/20 to-brand-emerald"
        />
        <StatCard 
          title="Active Routing" 
          value={stats.loading ? 0 : stats.active} 
          subValue="Live"
          icon={Activity} 
          trend="92%" 
          delay={0.4}
          colorClass="text-brand-cyan"
          gradientClass="bg-linear-to-r from-brand-cyan/20 to-brand-cyan"
        />
        <StatCard 
          title="Total Requests" 
          value={stats.clicks} 
          icon={Globe} 
          trend="78%" 
          delay={0.5}
          colorClass="text-brand-purple"
          gradientClass="bg-linear-to-r from-brand-purple/20 to-brand-purple"
        />
        <StatCard 
          title="Threats Blocked" 
          value={stats.blocked} 
          icon={ShieldAlert} 
          trend="42%" 
          delay={0.6}
          colorClass="text-brand-danger"
          gradientClass="bg-linear-to-r from-brand-danger/20 to-brand-danger"
        />
      </div>

      {/* 📈 Live Live Analytics Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-panel border border-white/5 rounded-3xl p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-brand-purple" />
            <h2 className="text-xl font-bold text-white">Live Traffic Inspection</h2>
          </div>
          <div className="flex gap-4 items-center text-xs font-mono">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-cyan" /> Allowed</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-danger" /> Blocked</div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(3,7,18,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="traffic" stroke="#00D9FF" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
              <Area type="monotone" dataKey="blocked" stroke="#FF4D6D" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ⚡ Command Center Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 px-2">
          <Zap className="w-5 h-5 text-brand-emerald" /> Command Interface
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard 
            icon={Plus} 
            label="Deploy Link" 
            desc="Generate a new AI-protected endpoint."
            onClick={() => navigate('/dashboard/links?create=true')}
            delay={0.8}
          />
          <ActionCard 
            icon={Sparkles} 
            label="Deep Scan" 
            desc="Run heuristic analysis on all payloads."
            onClick={() => {}}
            delay={0.9}
          />
          <ActionCard 
            icon={Webhook} 
            label="Live Webhooks" 
            desc="Configure real-time event streaming."
            onClick={() => navigate('/dashboard/webhooks')}
            delay={1.0}
          />
          <ActionCard 
            icon={BarChart} 
            label="Global Metrics" 
            desc="View worldwide heatmap distribution."
            onClick={() => navigate('/dashboard/analytics')}
            delay={1.1}
          />
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
