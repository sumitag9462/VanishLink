import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link2, ShieldCheck, Lock, Share2, LineChart, Webhook, BrainCircuit, Timer, Flame } from 'lucide-react';
import { cn } from '../../utils/cn';

const steps = [
  { id: 'create', icon: Link2, label: 'Link Generation', desc: 'Secure endpoint is instantly provisioned.', color: 'text-brand-emerald', bg: 'bg-brand-emerald/10', border: 'border-brand-emerald/30' },
  { id: 'scan', icon: ShieldCheck, label: 'Deep AI Scan', desc: 'URL is analyzed for malware and phishing signatures.', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/30' },
  { id: 'encrypt', icon: Lock, label: 'Payload Encryption', desc: 'Military-grade encryption applied to routing rules.', color: 'text-brand-purple', bg: 'bg-brand-purple/10', border: 'border-brand-purple/30' },
  { id: 'route', icon: Share2, label: 'Adaptive Routing', desc: 'Traffic dynamically routed based on geolocation & intent.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  { id: 'prediction', icon: BrainCircuit, label: 'Behavior Prediction', desc: 'AI predicts bot-nets and blocks malicious ingress.', color: 'text-brand-emerald', bg: 'bg-brand-emerald/10', border: 'border-brand-emerald/30' },
  { id: 'destruct', icon: Flame, label: 'Self Destruct', desc: 'Link physically incinerates from the database upon expiry.', color: 'text-brand-danger', bg: 'bg-brand-danger/10', border: 'border-brand-danger/30' },
];

export default function LiveDemoFlow() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-32 px-6 relative z-10 bg-base">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <BrainCircuit className="w-3 h-3 text-brand-purple" /> AI Pipeline
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter"
          >
            How <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-emerald to-brand-cyan">AI Works.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg md:text-xl font-light"
          >
            From generation to incineration. A visual representation of the VanishLink lifecycle.
          </motion.p>
        </div>
        
        <div className="relative pl-8 md:pl-0">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 md:-translate-x-1/2 rounded-full overflow-hidden">
            <motion.div 
              style={{ height: lineHeight }}
              className="w-full bg-linear-to-b from-brand-emerald via-brand-cyan to-brand-danger shadow-[0_0_15px_#00F5A0]"
            />
          </div>

          <div className="space-y-24 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              return (
                <div key={step.id} className={cn("relative flex flex-col md:flex-row items-center gap-8", isEven ? "md:flex-row-reverse" : "")}>
                  
                  {/* Content Box */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                    className={cn(
                      "w-full md:w-1/2 flex",
                      isEven ? "md:justify-start" : "md:justify-end"
                    )}
                  >
                    <div className="glass-panel-heavy border border-white/10 p-6 rounded-2xl w-full max-w-sm group hover:border-white/20 transition-colors shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-xl font-bold text-white mb-2">{step.label}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>

                  {/* Icon Node */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                    className={cn(
                      "absolute left-0 md:left-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl border flex items-center justify-center backdrop-blur-xl shadow-2xl",
                      step.bg, step.border
                    )}
                  >
                    <Icon className={cn("w-8 h-8", step.color)} />
                  </motion.div>
                  
                  {/* Empty space for grid balancing */}
                  <div className="hidden md:block w-1/2" />

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
