import React from 'react';
import { Terminal, Shield, Zap, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const prompts = [
  { icon: Shield, text: 'Audit recent routing events' },
  { icon: Zap, text: 'Optimize link delivery' },
  { icon: Search, text: 'Scan for anomalies' },
];

export const CopilotWelcome = ({ onPromptSelect }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 h-full bg-[#0a0a0a]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(0,245,160,0.15)] mb-6"
      >
        <Terminal className="w-8 h-8 text-brand-emerald" />
      </motion.div>
      
      <h3 className="text-xl font-bold text-white mb-2 font-mono tracking-tight">System Terminal</h3>
      <p className="text-slate-400 text-center text-sm mb-8 max-w-[250px] font-mono leading-relaxed">
        I am your AI Operations Agent. Type a query or select a routine.
      </p>

      <div className="w-full space-y-3">
        {prompts.map((prompt, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            onClick={() => onPromptSelect(prompt.text)}
            className="w-full flex items-center gap-3 p-3 text-left bg-black border border-white/5 hover:border-brand-emerald/50 hover:bg-brand-emerald/5 rounded-xl transition-all group font-mono text-xs"
          >
            <prompt.icon className="w-4 h-4 text-slate-500 group-hover:text-brand-emerald transition-colors" />
            <span className="text-slate-300 group-hover:text-brand-emerald transition-colors">{prompt.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
