import React from 'react';
import { Shield, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EnterpriseFooter() {
  return (
    <footer className="border-t border-white/10 bg-base py-16 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-emerald to-brand-cyan p-1 flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Vanish<span className="text-slate-400 font-light">Link</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Intelligent, self-destructing links for secure, ephemeral communications and analytics.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Developers</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Webhooks</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 relative z-10">
        <p>© 2026 VanishLink Inc. All rights reserved.</p>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></div>
          <span>All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
