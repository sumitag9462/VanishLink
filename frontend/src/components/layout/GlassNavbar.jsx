import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../ui/Button';

export default function GlassNavbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Shrink padding on scroll
  const padding = useTransform(scrollY, [0, 100], ['1.5rem', '0.75rem']);
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const blur = useTransform(scrollY, [0, 100], [0, 16]);
  
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (v) => setIsScrolled(v > 50));
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.nav 
      style={{
        paddingTop: padding,
        paddingBottom: padding,
        backgroundColor: `rgba(2, 6, 23, ${bgOpacity.get()})`,
        backdropFilter: `blur(${blur.get()}px)`,
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent'
      }}
      className="fixed top-0 w-full z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-emerald to-brand-cyan p-1 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,160,0.4)]"
          >
            <Shield className="w-5 h-5 text-base fill-current" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-white">
            Vanish<span className="text-slate-400 font-light">Link</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#api" className="hover:text-white transition-colors">Developers</a>
          <Link to="/admin/login" className="hover:text-brand-cyan transition-colors flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Admin Access
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register">
            <Button variant="glow" className="text-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
