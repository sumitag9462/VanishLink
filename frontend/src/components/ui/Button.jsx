import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  size = 'md',
  className, 
  ...props 
}) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseStyles = "relative font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-xl";
  
  const sizes = {
    sm: "py-2 px-4 text-xs",
    md: "py-2.5 px-6 text-sm",
    lg: "py-3 px-8 text-base",
    xl: "py-4 px-10 text-lg",
  };
  
  const variants = {
    primary: "bg-white text-black hover:bg-slate-200 transition-colors",
    secondary: "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-colors",
    danger: "bg-brand-danger/10 text-brand-danger border border-brand-danger/20 hover:bg-brand-danger/20 transition-colors",
    ghost: "bg-transparent text-slate-400 hover:text-white transition-colors",
    outline: "bg-transparent border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-colors",
    glow: "bg-linear-to-r from-brand-emerald to-brand-cyan text-slate-950 shadow-[0_0_20px_rgba(0,245,160,0.4)] hover:shadow-[0_0_35px_rgba(0,217,255,0.6)] font-semibold transition-all duration-300",
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x * 0.1, y: position.y * 0.1 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn(baseStyles, sizes[size], variants[variant], className)}
      disabled={isLoading}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </motion.button>
  );
};