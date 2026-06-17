import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateLinkWizard } from '../../components/links/CreateLinkWizard';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function CreateLink() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/links')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Deploy VanishLink</h1>
            <p className="text-sm text-slate-400">Configure intelligent routing and security rules.</p>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 min-h-0 bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <CreateLinkWizard 
          onSuccess={() => navigate('/dashboard/links')} 
        />
      </motion.div>
    </div>
  );
}
