import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  BarChart2, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  Shield,
  Video,
  Globe,
  Flag,
  Webhook,
  Sparkles,
  Command,
  Bell,
  Ghost
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { CopilotContainer } from '../copilot/CopilotContainer';

const SidebarItem = ({ icon: Icon, label, to, active, onClick, collapsed }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 mb-1.5",
      active 
        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(0,245,160,0.1)]" 
        : "text-muted hover:text-text-main hover:bg-white/5 border border-transparent"
    )}
  >
    <Icon className={cn("shrink-0 transition-transform duration-300", active ? "w-5 h-5" : "w-4 h-4 group-hover:scale-110")} />
    
    <AnimatePresence>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>

    {active && (
      <motion.div
        layoutId="active-sidebar-pill"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,245,160,0.8)]"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle header blur on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-base text-text-main font-sans relative selection:bg-primary/30 selection:text-primary">
      
      {/* 🌌 Cinematic Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="mesh-bg"></div>
        <div className="noise-bg"></div>
        <div className="cyber-grid-bg opacity-30"></div>
        
        {/* Aurora Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-base/80 backdrop-blur-md z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 🚀 Dynamic Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 glass-panel-heavy border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0 w-[260px]" : "-translate-x-full"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3 text-primary font-bold text-xl tracking-tight">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 relative z-10" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            {!isCollapsed && <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">VanishLink</span>}
          </div>
          <button 
            className="hidden md:block text-muted hover:text-white transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto overflow-x-hidden disable-scrollbars">
          
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4">
                Intelligence
              </p>
            )}
            <SidebarItem icon={LayoutDashboard} label="AI Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={LinkIcon} label="Smart Links" to="/dashboard/links" active={location.pathname.startsWith('/dashboard/links')} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={BarChart2} label="Deep Analytics" to="/dashboard/analytics" active={location.pathname.startsWith('/dashboard/analytics')} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={Ghost} label="Ghost Analytics" to="/dashboard/ghost-analytics" active={location.pathname.startsWith('/dashboard/ghost-analytics')} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
          </div>

          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4">
                Ecosystem
              </p>
            )}
            <SidebarItem icon={Globe} label="Community" to="/dashboard/browse" active={location.pathname.startsWith('/dashboard/browse')} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={Video} label="Watch Party" to="/dashboard/watch" active={location.pathname.startsWith('/dashboard/watch')} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={Webhook} label="Webhook Audit" to="/dashboard/webhooks" active={location.pathname.startsWith('/dashboard/webhooks')} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={Flag} label="Threat Reports" to="/dashboard/my-reports" active={location.pathname.startsWith('/dashboard/my-reports')} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
          </div>

          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4">
                System
              </p>
            )}
            <SidebarItem icon={Settings} label="Settings" to="/dashboard/settings" active={location.pathname === '/dashboard/settings'} collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="group w-full flex items-center justify-center gap-3 px-3 py-3 text-sm font-medium text-danger/80 hover:text-danger hover:bg-danger/10 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span>End Session</span>}
          </button>
        </div>
      </motion.aside>

      {/* 🔮 MAIN CONTENT UNIFIED SCROLL */}
      <motion.div 
        layout
        className={cn(
          "flex flex-col min-h-screen relative z-10 transition-all duration-300",
          isCollapsed ? "md:ml-20" : "md:ml-[260px]"
        )}
      >
        
        {/* 🛸 Sticky Premium Header */}
        <header className={cn(
          "sticky top-0 z-40 flex items-center justify-between px-6 h-20 transition-all duration-500",
          scrolled ? "glass-panel border-b border-white/5" : "bg-transparent border-transparent"
        )}>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-muted hover:text-white">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            
            {/* Command Palette Trigger */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group">
              <Command className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
              <span className="text-sm text-muted group-hover:text-white transition-colors">Search or jump to...</span>
              <kbd className="ml-4 text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-muted">⌘K</kbd>
            </div>

            {/* Live Header Metrics */}
            <div className="hidden lg:flex items-center gap-6 ml-8 pl-8 border-l border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Network Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                  <span className="text-sm font-semibold text-brand-emerald">Optimal</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Active Threats</span>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-brand-cyan" />
                  <span className="text-sm font-mono text-brand-cyan">0 Blocked</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-muted hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            </button>

            <div className="h-8 w-px bg-white/10"></div>

            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-primary tracking-widest uppercase">Pro Plan</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-emerald-300 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-base flex items-center justify-center text-sm font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 🌟 SCROLLING BODY */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10 pb-32">
          <Outlet />
        </main>

        {/* 🤖 Floating AI Assistant */}
        <div className="fixed bottom-8 right-8 z-50 group">
          <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full group-hover:bg-accent/40 transition-colors duration-500"></div>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="relative flex items-center justify-center w-14 h-14 bg-linear-to-br from-accent to-purple-600 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 border border-white/20"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* AI Chat Window */}
        <CopilotContainer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      </motion.div>
    </div>
  );
};

export default DashboardLayout;
