import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function DashboardPreview() {
  const { scrollYProgress } = useScroll();
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.9, 1]);

  return (
    <section className="pb-24 pt-10 px-6 relative z-10 perspective-[2000px] flex justify-center overflow-hidden">
      <motion.div 
        style={{ rotateX, scale }}
        className="relative w-full max-w-5xl mx-auto -mt-10 md:-mt-24 shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
      >
        {/* MacBook Frame */}
        <div className="relative rounded-t-3xl border-t-8 border-l-8 border-r-8 border-slate-800 bg-slate-900 aspect-16/10 overflow-hidden flex flex-col ring-1 ring-white/10">
          
          {/* Inner Screen Header (Simulating App Header) */}
          <div className="h-10 border-b border-white/5 bg-surface flex items-center px-4 gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <div className="mx-auto w-48 h-5 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
              <span className="text-[10px] text-slate-500 font-mono">vanishlink.io/dashboard</span>
            </div>
          </div>

          {/* Inner Screen Content */}
          <div className="flex-1 bg-[#050505] p-6 flex relative">
            {/* Sidebar Simulation */}
            <div className="w-48 hidden md:flex flex-col border-r border-white/5 pr-4 mr-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-brand-emerald flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-white font-bold text-sm tracking-tight">VanishLink</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white text-xs font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Overview
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  My Links
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Security Logs
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Analytics
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/5">
                 <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-linear-to-tr from-brand-emerald to-brand-cyan" />
                    <span className="text-xs text-white font-medium">Admin User</span>
                 </div>
              </div>
            </div>
            
            {/* Main Content Simulation */}
            <div className="flex-1 flex flex-col space-y-6 min-w-0">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Overview</h2>
                  <p className="text-xs text-slate-400 mt-1">Live traffic and security analytics.</p>
                </div>
                <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                  + Create Link
                </button>
              </div>

              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-28 rounded-xl bg-linear-to-b from-white/5 to-transparent border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <svg className="w-4 h-4 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Total Ingress
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white tracking-tight">1.2M</div>
                      <div className="text-xs text-brand-emerald mt-1 flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                         +14.5% this week
                      </div>
                    </div>
                  </div>

                  <div className="h-28 rounded-xl bg-linear-to-b from-white/5 to-transparent border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <svg className="w-16 h-16 text-brand-cyan" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <svg className="w-4 h-4 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Threats Blocked
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white tracking-tight">84.2K</div>
                      <div className="text-xs text-brand-cyan mt-1 flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                         +5.2% bot traffic
                      </div>
                    </div>
                  </div>

                  <div className="h-28 rounded-xl bg-linear-to-b from-white/5 to-transparent border border-white/10 p-5 hidden md:flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <svg className="w-16 h-16 text-brand-purple" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <svg className="w-4 h-4 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Avg. Latency
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white tracking-tight">42ms</div>
                      <div className="text-xs text-brand-purple mt-1 flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                         -12ms optimized
                      </div>
                    </div>
                  </div>
              </div>

              {/* Main Chart */}
              <div className="flex-1 min-h-[200px] rounded-xl bg-linear-to-b from-white/5 to-transparent border border-white/10 p-5 relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <div className="text-sm font-semibold text-white">Live Traffic Analysis</div>
                   <div className="flex gap-2">
                     <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
                     <span className="text-[10px] text-brand-emerald uppercase tracking-wider font-bold">Live Stream</span>
                   </div>
                </div>
                
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-0 bg-linear-to-br from-brand-emerald/5 to-brand-cyan/5 opacity-50 rounded-lg" />
                  <div className="absolute bottom-0 left-0 w-full h-2/3 bg-linear-to-t from-brand-emerald/20 to-transparent" />
                  <svg className="absolute bottom-0 left-0 w-full h-full drop-shadow-[0_0_15px_rgba(0,245,160,0.6)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0 100 L0 50 Q 15 40 30 70 T 70 30 T 100 20 L100 100 Z" fill="rgba(0,245,160,0.15)" stroke="#00F5A0" strokeWidth="2.5" />
                  </svg>
                  {/* Simulated Data Points */}
                  <div className="absolute top-[20%] right-0 w-3 h-3 border-2 border-brand-emerald rounded-full bg-black shadow-[0_0_10px_#00F5A0] animate-pulse" />
                  <div className="absolute top-[30%] left-[70%] w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_10px_#22d3ee] animate-pulse delay-75" />
                </div>
              </div>
            </div>
            
            {/* Scanning Overlay Simulation */}
            <div className="absolute top-0 right-0 w-1/4 h-full bg-linear-to-l from-[#050505] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* MacBook Base */}
        <div className="relative h-6 md:h-8 bg-slate-800 rounded-b-3xl border-t border-slate-700 flex justify-center items-start shadow-2xl shadow-black">
          <div className="w-1/4 h-2 bg-slate-900 rounded-b-md" />
        </div>
      </motion.div>
    </section>
  );
}
