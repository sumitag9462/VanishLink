import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidthClass = "max-w-2xl", hideHeader = false }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => (document.body.style.overflow = 'unset');
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-99999 overflow-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl w-full ${maxWidthClass} max-h-[95vh] overflow-hidden flex flex-col relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0a]">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto disable-scrollbars flex flex-col relative">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};