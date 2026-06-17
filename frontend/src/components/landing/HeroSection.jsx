import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ShieldCheck, ChevronRight, Activity, Zap } from 'lucide-react';
import AICore3D from './AICore3D';

export default function HeroSection() {
  return (
    <section className="relative pt-32 lg:pt-48 pb-24 px-6 overflow-hidden">
      {/* 🌌 Cinematic Background Layers */}
      <div className="absolute inset-0 bg-base z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,160,0.1)_0%,transparent_50%)]" />
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-brand-purple/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse-glow" />
        <div className="mesh-bg opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left: Typography & CTAs */}
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(0,245,160,0.15)]">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald"></span>
            </div>
            VanishLink Intelligence V2.0 Active
          </div>

          <h1 className="text-6xl md:text-[90px] font-black text-white tracking-tighter leading-none mb-8">
            Smart Links That <br/>
            Think, Adapt & <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-emerald via-brand-cyan to-brand-purple drop-shadow-[0_0_30px_rgba(0,245,160,0.3)]">
              Disappear.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed font-light max-w-xl">
            The world's first AI-powered URL infrastructure. 
            Protect sensitive data through intelligent dynamic routing, deep threat analysis, and self-destruction.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link to="/register" className="w-full sm:w-auto">
              <button className="group relative w-full sm:w-auto flex justify-center items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10">Start Building</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <a href="#features" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto flex justify-center items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold text-lg border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-xl">
                Explore Features
              </button>
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center gap-8 text-sm md:text-base text-slate-400 font-medium">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="p-2 rounded-lg bg-brand-emerald/10 text-brand-emerald group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="group-hover:text-white transition-colors">AI Threat Scan</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <span className="group-hover:text-white transition-colors">Adaptive Routing</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <span className="group-hover:text-white transition-colors">Zero-Latency Edge</span>
            </div>
          </div>
        </div>

        {/* Right: 3D Visualization */}
        <div className="relative hidden lg:flex items-center justify-center w-full h-[600px] animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
          <AICore3D />
        </div>

      </div>
    </section>
  );
}
