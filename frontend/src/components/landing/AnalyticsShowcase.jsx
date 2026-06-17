import React from 'react';
import { motion } from 'framer-motion';

export default function AnalyticsShowcase() {
  return (
    <section className="py-32 px-6 relative z-10 border-t border-white/5 bg-linear-to-b from-slate-950 to-surface">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Enterprise-Grade <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-purple to-brand-cyan">Telemetry.</span>
            </h2>
            <p className="text-lg text-slate-400 font-light leading-relaxed">
              Monitor traffic spikes, track geographic ingress, and analyze device metadata in real-time. Our Redis-backed analytics engine scales flawlessly to handle millions of data points without dropping a single event.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl glass-panel-heavy border-white/10">
                <p className="text-slate-400 text-sm mb-2">Total Ingress Events</p>
                <div className="text-4xl font-bold text-white font-mono">1.2M+</div>
              </div>
              <div className="p-6 rounded-2xl glass-panel-heavy border-white/10">
                <p className="text-slate-400 text-sm mb-2">Avg. Resolution</p>
                <div className="text-4xl font-bold text-brand-emerald font-mono">14ms</div>
              </div>
            </div>
          </div>

          {/* Right: Abstract Chart UI */}
          <div className="relative h-[400px] w-full rounded-3xl glass-panel border-white/10 p-8 flex flex-col justify-end overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-brand-purple/10 to-transparent" />
            
            {/* Animated Bar Chart */}
            <div className="flex items-end gap-3 h-full relative z-10 w-full">
              {[40, 25, 60, 30, 80, 45, 95, 60, 40, 75, 50, 100].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.05, type: "spring", bounce: 0.2 }}
                  className="w-full bg-linear-to-t from-brand-purple/80 to-brand-cyan/80 rounded-t-sm"
                />
              ))}
            </div>

            {/* Floating Metric */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 glass-panel-heavy px-4 py-3 rounded-xl border-white/20 shadow-2xl"
            >
              <div className="text-xs text-slate-400 mb-1">Active Visitors</div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                4,092
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
