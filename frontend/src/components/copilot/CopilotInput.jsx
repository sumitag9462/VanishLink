import React from 'react';
import { Send, TerminalSquare } from 'lucide-react';
import clsx from 'clsx';

export const CopilotInput = ({ input, setInput, handleSend, isLoading }) => {
  return (
    <div className="p-4 bg-[#0a0a0a] border-t border-white/5 relative z-10">
      <div className="relative flex items-center bg-[#111] border border-white/10 rounded-xl overflow-hidden focus-within:border-brand-emerald/50 focus-within:shadow-[0_0_15px_rgba(0,245,160,0.1)] transition-all">
        <div className="pl-4 pr-2 text-slate-500">
          <TerminalSquare className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Execute command..."
          disabled={isLoading}
          className="flex-1 bg-transparent border-none text-slate-300 py-4 outline-none placeholder:text-slate-600 font-mono text-xs"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className={clsx(
            "p-2 mr-2 rounded-lg transition-all",
            input.trim() && !isLoading
              ? "bg-brand-emerald text-black hover:bg-brand-emerald/80"
              : "text-slate-600 bg-transparent"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="text-center mt-2">
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
          AI may hallucinate. Verify security findings.
        </p>
      </div>
    </div>
  );
};
