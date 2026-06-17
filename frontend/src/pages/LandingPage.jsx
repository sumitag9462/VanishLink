import React from 'react';
import SmoothScroll from '../components/layout/SmoothScroll';
import GlassNavbar from '../components/layout/GlassNavbar';
import HeroSection from '../components/landing/HeroSection';
import DashboardPreview from '../components/landing/DashboardPreview';
import BentoFeatures from '../components/landing/BentoFeatures';
import AIVisualization from '../components/landing/AIVisualization';
import LiveDemoFlow from '../components/landing/LiveDemoFlow';
import GhostModeShowcase from '../components/landing/GhostModeShowcase';
import AnalyticsShowcase from '../components/landing/AnalyticsShowcase';
import EnterpriseFooter from '../components/layout/EnterpriseFooter';

export default function LandingPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-base text-slate-200 font-sans selection:bg-brand-emerald/30 overflow-x-hidden">
        <GlassNavbar />
        
        <main>
          <HeroSection />
          <DashboardPreview />
          <LiveDemoFlow />
          <GhostModeShowcase />
          <BentoFeatures />
          <AIVisualization />
          <AnalyticsShowcase />
        </main>

        <EnterpriseFooter />
      </div>
    </SmoothScroll>
  );
}