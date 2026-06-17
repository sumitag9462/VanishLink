import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Fingerprint, Network, ScanFace, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AIVisualization() {
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      elementsRef.current.forEach((el, index) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: index * 0.1
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-40 px-6 relative border-y border-white/5 bg-[#010309] overflow-hidden">
      {/* Heavy Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-danger/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center mb-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-danger/30 bg-brand-danger/10 text-brand-danger text-sm font-semibold uppercase tracking-widest mb-8"
        >
          <AlertTriangle className="w-4 h-4" /> Zero-Trust Architecture
        </motion.div>
        
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6">
          Real-Time <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-danger to-brand-warning">Threat Detection.</span>
        </h2>
        <p className="text-xl text-slate-400 font-light max-w-2xl">
          Our AI constantly monitors traffic patterns, analyzes payloads, and isolates malicious actors before they ever reach your destination.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Core Scanner Window */}
        <div 
          ref={el => elementsRef.current[0] = el}
          className="lg:col-span-2 relative h-[500px] rounded-3xl glass-panel-heavy border border-white/10 overflow-hidden flex flex-col p-8"
        >
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <ScanFace className="w-6 h-6 text-brand-emerald" />
              <span className="font-mono text-white tracking-widest">DEEP_SCAN_ACTIVE</span>
            </div>
            <span className="text-brand-emerald font-mono animate-pulse">Scanning...</span>
          </div>

          <div className="flex-1 relative flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-black/40 overflow-hidden">
            <motion.div 
              animate={{ rotateZ: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute w-[800px] h-[800px] rounded-full border border-brand-emerald/10 border-t-brand-emerald/40"
            />
            <motion.div 
              animate={{ rotateZ: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-[600px] h-[600px] rounded-full border border-brand-cyan/10 border-b-brand-cyan/40"
            />
            
            <div className="relative z-10 text-center">
              <div className="text-7xl font-black text-white mb-2">99.9%</div>
              <div className="text-brand-emerald font-mono text-sm tracking-widest">AI CONFIDENCE SCORE</div>
            </div>

            {/* Scanner Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              className="absolute left-0 w-full h-1 bg-brand-emerald shadow-[0_0_20px_#00F5A0]"
            />
          </div>
        </div>

        {/* Side Metrics */}
        <div className="flex flex-col gap-8">
          
          <div ref={el => elementsRef.current[1] = el} className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-danger/5 group-hover:bg-brand-danger/10 transition-colors" />
            <ShieldAlert className="w-8 h-8 text-brand-danger mb-4" />
            <div className="text-3xl font-bold text-white mb-1">12,403</div>
            <div className="text-sm text-slate-400">Malware Payloads Blocked</div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '85%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-brand-danger shadow-[0_0_10px_#FF4D6D]"
              />
            </div>
          </div>

          <div ref={el => elementsRef.current[2] = el} className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-warning/5 group-hover:bg-brand-warning/10 transition-colors" />
            <Fingerprint className="w-8 h-8 text-brand-warning mb-4" />
            <div className="text-3xl font-bold text-white mb-1">8,921</div>
            <div className="text-sm text-slate-400">Phishing Attempts Prevented</div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '60%' }}
                transition={{ duration: 1.5, delay: 0.7 }}
                className="h-full bg-brand-warning shadow-[0_0_10px_#F59E0B]"
              />
            </div>
          </div>

          <div ref={el => elementsRef.current[3] = el} className="glass-panel p-6 rounded-3xl border border-brand-emerald/30 bg-brand-emerald/5 relative overflow-hidden group">
            <ShieldCheck className="w-8 h-8 text-brand-emerald mb-4" />
            <div className="text-xl font-bold text-white mb-1">Safe Destination</div>
            <div className="text-xs font-mono text-brand-emerald truncate">https://secure.destination.com/...</div>
          </div>

        </div>
      </div>
    </section>
  );
}
