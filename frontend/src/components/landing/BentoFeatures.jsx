import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield, Activity, Globe, Eye, Code, Lock, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

const BentoCard = ({ title, description, icon: Icon, className, color, children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 group flex flex-col shadow-2xl",
        className
      )}
    >
      {/* Dynamic Flashlight Hover Effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${color}15, transparent 40%)`
        }}
      />
      
      {/* Ambient static glow */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 opacity-20 blur-[80px] pointer-events-none z-0 mix-blend-screen"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10 p-8 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-md"
            style={{ backgroundColor: `${color}10`, color: color }}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        <div className="mb-8 relative flex-1">
          {children}
        </div>

        <div className="mt-auto">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-slate-400 transition-colors">
            {title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed font-light">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function BentoFeatures() {
  return (
    <section id="features" className="py-32 px-6 relative z-10 bg-base">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Lock className="w-3 h-3 text-brand-emerald" /> Core Infrastructure
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter"
          >
            Engineered for <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-emerald to-brand-cyan">Security.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light"
          >
            A cohesive suite of capabilities designed to protect your data in transit, verify intent, and ensure absolute deniability.
          </motion.p>
        </div>

        {/* 12-Column Modern Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
          
          {/* Card 1: Large Threat Detection */}
          <BentoCard 
            title="AI Threat Detection"
            description="Real-time scanning of destination URLs for phishing, malware, and illegal content before redirect."
            icon={Shield}
            color="#00F5A0"
            className="md:col-span-8 min-h-[400px]"
          >
            <div className="absolute inset-0 bg-[#0f172a] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center p-6">
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="font-mono text-xs text-slate-400 truncate">https://suspicious-domain.com/login</span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase">Blocked</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 opacity-70">
                  <span className="font-mono text-xs text-slate-400 truncate">https://trusted-app.io/oauth</span>
                  <span className="px-2 py-1 bg-brand-emerald/20 text-brand-emerald text-[10px] font-bold rounded uppercase">Verified</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 opacity-50">
                  <span className="font-mono text-xs text-slate-400 truncate">https://internal-api.corp.net</span>
                  <span className="px-2 py-1 bg-brand-cyan/20 text-brand-cyan text-[10px] font-bold rounded uppercase">Scanned</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-[#0f172a] to-transparent z-10" />
            </div>
          </BentoCard>
          
          {/* Card 2: Burn After Reading */}
          <BentoCard 
            title="Burn After Reading"
            description="Enforce strict single-use access. Links invalidate instantaneously."
            icon={Flame}
            color="#FF3D5A"
            className="md:col-span-4 min-h-[400px]"
          >
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="relative w-32 h-32 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                 <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                 <Eye className="w-16 h-16 text-red-500 relative z-10" />
                 <div className="absolute inset-0 border-2 border-red-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
                 <div className="absolute -inset-2.5 border border-red-500/10 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
               </div>
             </div>
          </BentoCard>

          {/* Card 3: Global Edge Analytics */}
          <BentoCard 
            title="Global Edge Analytics"
            description="Track visitor ingress with millisecond latency. View geofenced data points, bot detection, and deep device metadata."
            icon={Globe}
            color="#00D9FF"
            className="md:col-span-6 min-h-[350px]"
          >
            <div className="absolute inset-0 bg-[#0f172a] rounded-2xl border border-white/5 overflow-hidden p-6">
              <div className="absolute inset-0 cyber-grid-bg opacity-20" />
              <div className="h-full w-full flex items-end relative z-10 gap-2">
                {[40, 70, 45, 90, 60, 100, 80, 50, 75, 40].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="flex-1 bg-linear-to-t from-brand-cyan/20 to-brand-cyan/80 rounded-t-sm"
                  />
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Card 4: Developer API */}
          <BentoCard 
            title="Developer API"
            description="Integrate seamlessly with our robust REST interface. Programmatic link generation via SDKs."
            icon={Code}
            color="#FACC15"
            className="md:col-span-6 min-h-[350px]"
          >
            <div className="absolute inset-0 bg-[#050505] rounded-2xl border border-white/5 overflow-hidden p-6 font-mono text-xs text-brand-emerald">
              <pre className="leading-loose">
                <code>
{`POST /v1/links
Host: api.vanishlink.io
Authorization: Bearer vl_prod_***

{
  "target": "https://secret.com",
  "expiresIn": "24h",
  "burnOnRead": true,
  "password": "auto-generate"
}`}
                </code>
              </pre>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
