import React from 'react';
import { motion } from 'framer-motion';

export const StatsCard = ({ title, value, icon: Icon, trend, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="glass-panel p-6 rounded-3xl relative overflow-hidden group cursor-default"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
        {Icon && <Icon className="w-24 h-24 text-primary" />}
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">
            {title}
          </p>
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        
        <div className="text-4xl font-bold text-white mb-2 tracking-tight">
          {value ?? '0'}
        </div>
        
        {trend && (
          <div className="text-xs text-emerald-400 mt-2 font-mono bg-emerald-500/10 w-fit px-2 py-1 rounded border border-emerald-500/20">
            ↑ {trend}%
            <span className="text-slate-500 ml-1 font-sans">vs last week</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
