import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, ShieldAlert, ArrowRight, Zap, EyeOff, Lock } from 'lucide-react';

export default function GhostModeShowcase() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#0a0a0a] border-y border-white/5">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* Left Text Content */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-sm"
            >
              <Ghost className="w-4 h-4" />
              <span>Ghost Mode™ Plausible Deniability</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-white tracking-tighter"
            >
              Hide your secrets in <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-fuchsia-600">plain sight.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 font-light leading-relaxed"
            >
              Traditional "Access Denied" pages reveal that a secret exists. Ghost Mode completely hides your payload by silently redirecting unauthorized visitors to an intelligent decoy. Only those with the cryptographic magic key know the payload is there.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-4 text-slate-300">
                <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-brand-emerald" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Silent Decoy Routing</h4>
                  <p className="text-sm text-slate-500">Attackers are routed to Wikipedia or Google.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center shrink-0">
                  <EyeOff className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Honeypot Traps</h4>
                  <p className="text-sm text-slate-500">Serve a fake payload to gather deep attack analytics.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Silent Self-Destruct</h4>
                  <p className="text-sm text-slate-500">Link destroys itself after X failed ghost attempts.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Visualizer */}
          <div className="flex-1 w-full max-w-lg relative">
            <div className="absolute inset-0 bg-linear-to-tr from-purple-500/20 to-transparent rounded-3xl blur-2xl" />
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 overflow-hidden">
              
              {/* Traffic Node - Source */}
              <div className="flex justify-center mb-8 relative z-10">
                <div className="bg-[#111] border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-mono text-white">Incoming Traffic</span>
                </div>
              </div>

              {/* Routing Path */}
              <div className="relative h-48">
                {/* Lines */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <motion.path 
                    d="M 50% 0 Q 80% 50 80% 100" 
                    fill="none" 
                    stroke="rgba(168,85,247,0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                  <motion.path 
                    d="M 50% 0 Q 20% 50 20% 100" 
                    fill="none" 
                    stroke="rgba(0,245,160,0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                </svg>

                {/* Packet Animations */}
                <motion.div 
                  initial={{ top: 0, left: '50%', opacity: 0 }}
                  animate={{ top: '100%', left: '80%', opacity: [0, 1, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7] -translate-x-1/2"
                />
                <motion.div 
                  initial={{ top: 0, left: '50%', opacity: 0 }}
                  animate={{ top: '100%', left: '20%', opacity: [0, 1, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1, ease: "easeInOut" }}
                  className="absolute w-3 h-3 bg-brand-emerald rounded-full shadow-[0_0_15px_#00f5a0] -translate-x-1/2"
                />

                {/* Middle Router */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-[#111] border border-white/20 flex items-center justify-center relative z-10">
                    <Ghost className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Destinations */}
              <div className="flex justify-between relative z-10 mt-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-brand-emerald/10 border border-brand-emerald/30 w-16 h-16 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-brand-emerald" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-brand-emerald font-bold">Valid Token</span>
                  <span className="text-xs text-white">True Payload</span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-purple-500/10 border border-purple-500/30 w-16 h-16 rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">No Token</span>
                  <span className="text-xs text-white">Decoy Site</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
