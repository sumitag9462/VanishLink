import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Lock, Link as LinkIcon, Clock, Flame, ShieldCheck, Zap,
  Globe, Smartphone, Sparkles, CheckCircle2, Search,
  ChevronDown, ChevronRight, Activity, ShieldAlert,
  Fingerprint, Bot, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import confetti from 'canvas-confetti';
import clsx from 'clsx';

// Simulated NLP parsing logic
const parseAIPrompt = (prompt) => {
  const p = prompt.toLowerCase();
  const updates = {};
  if (p.includes('password') || p.includes('secure')) updates.password = 'generated_secret_123';
  if (p.includes('expire') || p.includes('tomorrow')) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    updates.expiresAt = tmrw.toISOString().slice(0, 16);
  }
  if (p.includes('burn') || p.includes('one time')) updates.isOneTime = true;
  if (p.includes('click') || p.includes('clicks')) {
    const match = p.match(/(\d+)\s*click/);
    if (match) updates.maxClicks = parseInt(match[1]);
  }
  if (p.includes('preview')) updates.showPreview = true;
  return updates;
};

const AccordionItem = ({ title, icon: Icon, isOpen, onClick, children }) => (
  <div className="border border-white/5 bg-[#111] rounded-2xl mb-4 overflow-hidden transition-colors hover:border-white/10">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <h3 className="font-bold text-white tracking-tight">{title}</h3>
      </div>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
        <ChevronDown className="w-5 h-5 text-slate-500" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="px-5 pb-5 pt-0 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const CreateLinkWizard = ({ onSuccess, onClose }) => {
  const { user } = useAuth();
  
  // High-level State
  const [step, setStep] = useState(1); // 1 = Basic, 2 = Advanced
  const [openAccordion, setOpenAccordion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deployedData, setDeployedData] = useState(null);
  
  // AI Magic Input
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    url: '', title: '', slug: '', password: '', isOneTime: false, maxClicks: 0,
    expiresAt: '', showPreview: false, collection: 'General', geoFenceEnabled: false,
    allowedCountries: '', blockedCountries: '', otpEnabled: false, otpAllowedEmails: '',
    routingMode: 'single', iosUrl: '', androidUrl: '', gdprMode: false,
    ghostModeEnabled: false, ghostDecoyUrl: '', ghostSecretToken: '', ghostAiDecoy: false, ghostAdaptiveDetection: false, ghostHoneypotMode: false, ghostDestroyAttempts: '', ghostTrackVisitors: true
  });

  const [conditionalRedirectEnabled, setConditionalRedirectEnabled] = useState(false);
  const [deviceRules, setDeviceRules] = useState({ mobileUrl: '', desktopUrl: '' });
  
  // Feature flags for UI
  const [aiMalware, setAiMalware] = useState(true);
  const [aiPhishing, setAiPhishing] = useState(true);
  
  // Active states for visual feedback
  const [safetyScore, setSafetyScore] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Geo Fencing local state
  const availableCountries = ['United States', 'India', 'Japan', 'Germany', 'United Kingdom', 'Canada', 'Australia'];
  const [selectedCountries, setSelectedCountries] = useState([]);

  // Auto-scan URL
  useEffect(() => {
    if (form.url && form.url.startsWith('http')) {
      setIsScanning(true);
      const timer = setTimeout(() => {
        setSafetyScore(98);
        setIsScanning(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setSafetyScore(null);
    }
  }, [form.url]);

  const handleAiFill = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate NLP backend
    const updates = parseAIPrompt(aiPrompt);
    setForm(prev => ({ ...prev, ...updates }));
    setIsAiLoading(false);
    toast.success('Configuration generated by VanishAI', { icon: '✨' });
    setAiPrompt('');
  };

  const handleCountryToggle = (c) => {
    setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  useEffect(() => {
    setForm(prev => ({ ...prev, allowedCountries: selectedCountries.join(',') }));
  }, [selectedCountries]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00F5A0', '#00D9F5'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#00F5A0', '#00D9F5'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const handleSubmit = async () => {
    if (!form.url) return toast.error('Destination URL is required');
    setLoading(true);
    try {
      let conditionalRedirect;
      if (conditionalRedirectEnabled) {
        conditionalRedirect = { enabled: true, deviceRules: { mobileUrl: deviceRules.mobileUrl || null, desktopUrl: deviceRules.desktopUrl || null } };
      }
      const payload = { 
        targetUrl: form.url, slug: form.slug || undefined, title: form.title || form.url, password: form.password || undefined, isOneTime: form.isOneTime, maxClicks: form.maxClicks || 0, expiresAt: form.expiresAt || undefined, showPreview: form.showPreview, geoFenceEnabled: selectedCountries.length > 0, allowedCountries: form.allowedCountries, otpEnabled: form.otpEnabled, otpAllowedEmails: form.otpAllowedEmails, iosUrl: form.iosUrl, androidUrl: form.androidUrl, gdprMode: form.gdprMode, ...(conditionalRedirect ? { conditionalRedirect } : {}),
        ghostMode: form.ghostModeEnabled ? {
          enabled: true,
          decoyUrl: form.ghostDecoyUrl,
          secretToken: form.ghostSecretToken,
          aiDecoy: form.ghostAiDecoy,
          adaptiveDetection: form.ghostAdaptiveDetection,
          honeypotMode: form.ghostHoneypotMode,
          destroyAfterAttempts: form.ghostDestroyAttempts ? parseInt(form.ghostDestroyAttempts) : null,
          analyticsEnabled: form.ghostTrackVisitors
        } : undefined
      };
      Object.keys(payload).forEach(key => { if (payload[key] === undefined) delete payload[key]; });
      
      const res = await api.post('/links', payload);
      setDeployedData(res.data);
      setIsSuccess(true);
      triggerConfetti();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deploy link');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 px-8 bg-[#0a0a0a] rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,160,0.1)_0%,transparent_60%)] pointer-events-none" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 15 }} className="relative z-10 w-full max-w-2xl text-center">
          <div className="w-24 h-24 mx-auto bg-brand-emerald/20 rounded-full flex items-center justify-center mb-8 border border-brand-emerald/40 shadow-[0_0_50px_rgba(0,245,160,0.4)]">
            <CheckCircle2 className="w-12 h-12 text-brand-emerald" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">VanishLink Deployed</h1>
          <p className="text-slate-400 text-lg mb-10 font-light">Your intelligent routing endpoint is globally distributed and active.</p>
          
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 mb-10 text-left shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-slate-500 font-mono text-sm uppercase tracking-widest">Destination</span>
              <span className="text-white font-mono text-sm truncate max-w-[60%]">{form.url}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-slate-500 font-mono text-sm uppercase tracking-widest">Protection</span>
              <div className="flex gap-2">
                {form.password && <span className="px-2 py-1 bg-brand-emerald/10 text-brand-emerald rounded text-xs font-bold">PASSWORD</span>}
                {form.isOneTime && <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-bold">BURN-ON-READ</span>}
                {form.expiresAt && <span className="px-2 py-1 bg-brand-cyan/10 text-brand-cyan rounded text-xs font-bold">AUTO-EXPIRE</span>}
                {!form.password && !form.isOneTime && !form.expiresAt && <span className="text-slate-300 font-bold text-sm">Standard</span>}
              </div>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-slate-500 font-mono text-sm uppercase tracking-widest">AI Security</span>
              <span className="text-brand-emerald font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> 98% Confidence</span>
            </div>
            
            {deployedData?.ghostMode?.enabled && (
              <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">👻</span>
                  <h4 className="text-sm font-bold text-purple-400">Ghost Mode Active</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Unauthorized visitors will be silently redirected to your decoy URL. Share this exact link to bypass the ghost wall:
                </p>
                <div className="p-3 bg-black/50 rounded-lg border border-purple-500/30 flex justify-between items-center">
                  <span className="text-purple-300 font-mono text-sm break-all">
                    {`http://localhost:5173/r/${deployedData.slug}?k=${form.ghostSecretToken}`}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <Button onClick={() => onSuccess(deployedData)} className="bg-white text-black hover:bg-slate-200 px-12 py-6 rounded-2xl text-lg font-bold shadow-xl w-full md:w-auto">
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 h-full min-h-[500px] flex flex-col md:flex-row bg-[#0a0a0a] overflow-hidden font-sans rounded-3xl relative">
      
      {/* Left Column: Form Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-[#0a0a0a] min-w-0">
        
        {/* AI Form Filling Bar */}
        <div className="p-4 md:p-6 border-b border-white/5 bg-[#111] z-20 flex items-center gap-4 shrink-0">
          <div className="relative flex items-center group flex-1">
            <div className="absolute left-4 text-brand-emerald">
              {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-focus-within:animate-pulse" />}
            </div>
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiFill()}
              placeholder="Magic config: e.g., 'Create a secure link that expires tomorrow...'"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 pl-12 pr-24 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-emerald/50 focus:shadow-[0_0_20px_rgba(0,245,160,0.15)] transition-all font-light"
            />
            <Button onClick={handleAiFill} disabled={!aiPrompt || isAiLoading} size="sm" className="absolute right-2 bg-brand-emerald/20 text-brand-emerald hover:bg-brand-emerald hover:text-black">
              Generate
            </Button>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-2 bg-[#1a1a1a] rounded-xl text-slate-400 hover:text-white transition-colors border border-white/10 shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-8 disable-scrollbars pb-32">
          <div className="space-y-8 max-w-2xl mx-auto">
            
            {/* Core Destination */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white tracking-tighter">Target Destination</h2>
              <Input
                placeholder="https://example.com/secret-payload"
                value={form.url}
                onChange={e => setForm({...form, url: e.target.value})}
                className="text-lg py-6 bg-[#111] border-white/10"
                icon={<LinkIcon className="w-5 h-5 text-slate-400" />}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Link Title (Optional)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-[#111] border-white/10" />
                <Input placeholder="Custom Alias (Optional)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="bg-[#111] border-white/10 font-mono" />
              </div>
            </div>

            {/* Quick Protection Cards */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Quick Protection</h2>
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border cursor-pointer transition-all ${form.password ? 'bg-brand-emerald/10 border-brand-emerald/40' : 'bg-[#111] border-white/5 hover:border-white/20'}`} onClick={() => setForm({...form, password: form.password ? '' : 'generated'})}>
                  <Lock className={`w-5 h-5 mb-2 ${form.password ? 'text-brand-emerald' : 'text-slate-400'}`} />
                  <h4 className="text-sm font-bold text-white mb-1">Password</h4>
                  <p className="text-xs text-slate-500">Require secret key</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border cursor-pointer transition-all ${form.expiresAt ? 'bg-brand-emerald/10 border-brand-emerald/40' : 'bg-[#111] border-white/5 hover:border-white/20'}`} onClick={() => {
                  const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
                  setForm({...form, expiresAt: form.expiresAt ? '' : tmrw.toISOString().slice(0, 16)});
                }}>
                  <Clock className={`w-5 h-5 mb-2 ${form.expiresAt ? 'text-brand-emerald' : 'text-slate-400'}`} />
                  <h4 className="text-sm font-bold text-white mb-1">Expiry</h4>
                  <p className="text-xs text-slate-500">Auto-destruct timer</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border cursor-pointer transition-all ${form.isOneTime ? 'bg-orange-500/10 border-orange-500/40' : 'bg-[#111] border-white/5 hover:border-white/20'}`} onClick={() => setForm({...form, isOneTime: !form.isOneTime})}>
                  <Flame className={`w-5 h-5 mb-2 ${form.isOneTime ? 'text-orange-500' : 'text-slate-400'}`} />
                  <h4 className="text-sm font-bold text-white mb-1">Burn on Read</h4>
                  <p className="text-xs text-slate-500">Single-use payload</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border cursor-pointer transition-all ${form.showPreview ? 'bg-brand-cyan/10 border-brand-cyan/40' : 'bg-[#111] border-white/5 hover:border-white/20'}`} onClick={() => setForm({...form, showPreview: !form.showPreview})}>
                  <ShieldCheck className={`w-5 h-5 mb-2 ${form.showPreview ? 'text-brand-cyan' : 'text-slate-400'}`} />
                  <h4 className="text-sm font-bold text-white mb-1">Safe Preview</h4>
                  <p className="text-xs text-slate-500">Interstitial warning</p>
                </motion.div>
              </div>
            </div>

            {/* Advanced Toggle */}
            <div className="pt-4 border-t border-white/5">
              <button onClick={() => setStep(step === 1 ? 2 : 1)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                <ChevronRight className={clsx("w-4 h-4 transition-transform", step === 2 && "rotate-90")} />
                {step === 1 ? 'Show Advanced Configuration' : 'Hide Advanced Configuration'}
              </button>
            </div>

            {/* Advanced Accordion Panel */}
            <AnimatePresence>
              {step === 2 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 mt-4 overflow-hidden">
                  
                  {/* Security Accordion */}
                  <AccordionItem title="Deep Security" icon={ShieldAlert} isOpen={openAccordion === 'security'} onClick={() => setOpenAccordion(openAccordion === 'security' ? null : 'security')}>
                    <div className="space-y-4 pt-2">
                      <Input label="Custom Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="bg-[#0a0a0a]" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Exact Expiry Date" type="datetime-local" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="bg-[#0a0a0a] [&::-webkit-calendar-picker-indicator]:invert" />
                        <Input label="Max Click Limit" type="number" placeholder="0 = Unlimited" value={form.maxClicks} onChange={e => setForm({...form, maxClicks: Number(e.target.value)})} className="bg-[#0a0a0a]" />
                      </div>
                    </div>
                  </AccordionItem>

                  {/* AI Intelligence Accordion */}
                  <AccordionItem title="AI Intelligence" icon={Bot} isOpen={openAccordion === 'ai'} onClick={() => setOpenAccordion(openAccordion === 'ai' ? null : 'ai')}>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-white/5">
                        <span className="text-sm text-slate-300">Active Malware Blocking</span>
                        <input type="checkbox" checked={aiMalware} onChange={e => setAiMalware(e.target.checked)} className="accent-brand-emerald w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-white/5">
                        <span className="text-sm text-slate-300">Phishing Defense Engine</span>
                        <input type="checkbox" checked={aiPhishing} onChange={e => setAiPhishing(e.target.checked)} className="accent-brand-emerald w-4 h-4" />
                      </div>
                    </div>
                  </AccordionItem>

                  {/* Smart Routing Accordion */}
                  <AccordionItem title="Smart Routing" icon={Zap} isOpen={openAccordion === 'routing'} onClick={() => setOpenAccordion(openAccordion === 'routing' ? null : 'routing')}>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">Device-Based Routing</span>
                        <input type="checkbox" checked={conditionalRedirectEnabled} onChange={e => setConditionalRedirectEnabled(e.target.checked)} className="accent-brand-emerald w-4 h-4" />
                      </div>
                      <AnimatePresence>
                        {conditionalRedirectEnabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 p-4 bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
                            <div className="flex flex-col gap-2 relative">
                              <div className="absolute left-4 top-4 bottom-4 w-px bg-white/10 z-0" />
                              <div className="flex items-start gap-4 relative z-10">
                                <div className="w-8 h-8 rounded-lg bg-brand-emerald/20 flex items-center justify-center shrink-0 mt-1"><Smartphone className="w-4 h-4 text-brand-emerald" /></div>
                                <div className="flex-1 bg-[#111] p-3 rounded-lg border border-white/5">
                                  <span className="text-xs text-slate-500 font-mono uppercase font-bold block mb-2">IF Device = Mobile</span>
                                  <Input placeholder="https://m.target.com" value={deviceRules.mobileUrl} onChange={e => setDeviceRules({...deviceRules, mobileUrl: e.target.value})} className="bg-[#0a0a0a] border-none" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </AccordionItem>

                  {/* Geo Fencing Accordion */}
                  <AccordionItem title="Geo Fencing" icon={Globe} isOpen={openAccordion === 'geo'} onClick={() => setOpenAccordion(openAccordion === 'geo' ? null : 'geo')}>
                    <div className="pt-2">
                      <p className="text-xs text-slate-400 mb-3">Select allowed regions. All others will be blocked.</p>
                      <div className="flex flex-wrap gap-2">
                        {availableCountries.map(country => (
                          <button
                            key={country}
                            onClick={() => handleCountryToggle(country)}
                            className={clsx(
                              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                              selectedCountries.includes(country) ? "bg-brand-emerald text-black" : "bg-[#0a0a0a] text-slate-400 border border-white/10 hover:border-white/30"
                            )}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    </div>
                  </AccordionItem>

                  {/* OTP Accordion */}
                  <AccordionItem title="Identity Verification" icon={Fingerprint} isOpen={openAccordion === 'otp'} onClick={() => setOpenAccordion(openAccordion === 'otp' ? null : 'otp')}>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">Require Email OTP</span>
                        <input type="checkbox" checked={form.otpEnabled} onChange={e => setForm({...form, otpEnabled: e.target.checked})} className="accent-brand-emerald w-4 h-4" />
                      </div>
                      <AnimatePresence>
                        {form.otpEnabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <Input label="Allowed Domains/Emails (comma separated)" placeholder="e.g., @company.com, ceo@company.com" value={form.otpAllowedEmails} onChange={e => setForm({...form, otpAllowedEmails: e.target.value})} className="bg-[#0a0a0a]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </AccordionItem>

                  <AccordionItem title="👻 Ghost Mode™ (Deniability)" icon={ShieldAlert} isOpen={openAccordion === 'ghost'} onClick={() => setOpenAccordion(openAccordion === 'ghost' ? null : 'ghost')}>
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-bold text-purple-400">Enable Ghost Mode</h4>
                            <p className="text-xs text-slate-400">Silently route unauthorized visitors to a decoy.</p>
                          </div>
                          <input type="checkbox" checked={form.ghostModeEnabled} onChange={e => setForm({...form, ghostModeEnabled: e.target.checked})} className="accent-purple-500 w-4 h-4" />
                        </div>
                      </div>
                      <AnimatePresence>
                        {form.ghostModeEnabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                            <Input label="Decoy URL (Where attackers go)" placeholder="https://google.com" value={form.ghostDecoyUrl} onChange={e => setForm({...form, ghostDecoyUrl: e.target.value})} className="bg-[#0a0a0a]" />
                            <div className="flex gap-2">
                              <Input label="Secret Access Token" placeholder="e.g. 7af28d91ec3f" value={form.ghostSecretToken} onChange={e => setForm({...form, ghostSecretToken: e.target.value})} className="bg-[#0a0a0a] flex-1 font-mono" />
                              <div className="pt-7">
                                <Button onClick={() => setForm({...form, ghostSecretToken: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)})} className="bg-white/10 hover:bg-white/20 text-white px-4 h-11 rounded-xl">Generate</Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input type="checkbox" checked={form.ghostHoneypotMode} onChange={e => setForm({...form, ghostHoneypotMode: e.target.checked})} className="accent-purple-500 w-4 h-4" />
                                Honeypot Mode
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input type="checkbox" checked={form.ghostAiDecoy} onChange={e => setForm({...form, ghostAiDecoy: e.target.checked})} className="accent-purple-500 w-4 h-4" />
                                AI Generated Decoy
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input type="checkbox" checked={form.ghostAdaptiveDetection} onChange={e => setForm({...form, ghostAdaptiveDetection: e.target.checked})} className="accent-purple-500 w-4 h-4" />
                                Adaptive AI Block
                              </label>
                            </div>
                            
                            <Input label="Destroy After X Failed Attempts" placeholder="e.g. 5" type="number" value={form.ghostDestroyAttempts} onChange={e => setForm({...form, ghostDestroyAttempts: e.target.value})} className="bg-[#0a0a0a]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </AccordionItem>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Deploy Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pointer-events-none">
          <div className="max-w-2xl mx-auto flex justify-end pointer-events-auto">
            <Button onClick={handleSubmit} isLoading={loading} className="w-full md:w-auto bg-brand-emerald text-black hover:bg-brand-emerald/90 px-12 py-5 rounded-2xl text-lg font-black shadow-[0_0_30px_rgba(0,245,160,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
              {loading ? 'Initializing...' : 'Generate Secure Link'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Sticky Live Preview Panel (Desktop Only) */}
      <div className="hidden md:flex w-[320px] shrink-0 bg-[#111] border-l border-white/5 p-8 flex-col relative z-20">
        <div className="flex-1 overflow-y-auto disable-scrollbars space-y-6 pb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest font-bold">Live Configuration</h3>
            {onClose && (
              <button onClick={onClose} className="p-1.5 bg-[#1a1a1a] rounded-lg text-slate-400 hover:text-white transition-colors border border-white/10">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* AI Score Card */}
          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/10 blur-2xl rounded-full pointer-events-none" />
            <h4 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">AI Safety Score</h4>
            <div className="flex items-end gap-2">
              {isScanning ? (
                <div className="flex items-center gap-2 text-brand-emerald">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-lg font-bold">Scanning...</span>
                </div>
              ) : safetyScore ? (
                <>
                  <span className="text-4xl font-black text-white">{safetyScore}%</span>
                  <span className="text-brand-emerald font-bold mb-1">Safe</span>
                </>
              ) : (
                <span className="text-xl font-bold text-slate-500">Waiting for URL</span>
              )}
            </div>
          </div>

          {/* Settings Summary */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs text-slate-400">Target URL</span>
              <span className="text-xs text-white font-mono truncate max-w-[120px]">{form.url || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs text-slate-400">Protection</span>
              <span className={clsx("text-xs font-bold", form.password || form.isOneTime || form.expiresAt ? "text-brand-emerald" : "text-slate-500")}>
                {form.password ? 'Password' : form.isOneTime ? 'Burn-on-Read' : form.expiresAt ? 'Expiring' : 'Standard'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs text-slate-400">Routing</span>
              <span className={clsx("text-xs font-bold", conditionalRedirectEnabled ? "text-brand-purple" : "text-slate-500")}>
                {conditionalRedirectEnabled ? 'Adaptive' : 'Direct'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs text-slate-400">Geo Fencing</span>
              <span className={clsx("text-xs font-bold", selectedCountries.length > 0 ? "text-brand-cyan" : "text-slate-500")}>
                {selectedCountries.length > 0 ? `${selectedCountries.length} Regions` : 'Global'}
              </span>
            </div>
          </div>

          {/* Helper AI Card */}
          <div className="p-4 rounded-xl bg-brand-emerald/5 border border-brand-emerald/20 mt-auto">
            <h4 className="text-xs font-bold text-brand-emerald flex items-center gap-2 mb-2"><Bot className="w-3 h-3" /> AI Assistant</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Try using the magic input bar to configure your link using natural language. For example: "Create a password protected link that burns on read."
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
