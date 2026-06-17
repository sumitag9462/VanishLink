import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Terminal, User, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const analysisSteps = [
  "Initializing secure sandbox...",
  "Analyzing payload heuristics...",
  "Simulating target execution...",
  "Verifying SSL and domain reputation...",
  "Cross-referencing global threat DB...",
  "Synthesizing response..."
];

export const CopilotMessageList = ({ messages, isLoading }) => {
  const endRef = useRef(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, currentStepIndex]);

  // Simulate terminal steps progressing when loading
  useEffect(() => {
    if (isLoading) {
      setCurrentStepIndex(0);
      const interval = setInterval(() => {
        setCurrentStepIndex(prev => Math.min(prev + 1, analysisSteps.length - 1));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  return (
    <div 
      className="flex-1 h-full overflow-y-auto p-4 space-y-6 bg-[#0a0a0a] text-slate-300 font-sans text-sm disable-scrollbars overscroll-contain"
      data-lenis-prevent="true"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => (
          <motion.div
            key={msg._id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              'flex flex-col gap-2',
              msg.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest px-2">
              {msg.role === 'user' ? (
                <>User <User className="w-3 h-3" /></>
              ) : (
                <><Terminal className="w-3 h-3 text-brand-emerald" /> VanishLink AI</>
              )}
            </div>

            {/* Message Bubble */}
            <div className={clsx(
              'px-4 py-3 max-w-[90%] text-sm leading-relaxed rounded-xl',
              msg.role === 'user'
                ? 'bg-[#1a1a1a] text-slate-200 border border-white/5'
                : 'bg-transparent text-slate-300'
            )}>
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/5 prose-pre:shadow-inner prose-code:text-brand-emerald prose-code:bg-brand-emerald/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 items-start w-full"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest px-2">
              <Terminal className="w-3 h-3 text-brand-emerald" /> VanishLink AI
            </div>
            
            {/* Terminal Steps Simulation */}
            <div className="w-full pl-2 pr-4 space-y-2 mt-2">
              {analysisSteps.slice(0, currentStepIndex + 1).map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs font-mono text-slate-400"
                >
                  {index === currentStepIndex ? (
                    <Loader2 className="w-3 h-3 animate-spin text-brand-cyan" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-brand-emerald" />
                  )}
                  <span className={index === currentStepIndex ? "text-slate-300" : "text-slate-500"}>{step}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={endRef} className="h-4" />
    </div>
  );
};
