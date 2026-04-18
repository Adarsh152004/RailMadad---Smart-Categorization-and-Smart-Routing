"use client";

import React from 'react';
import { TrendingUp, Globe, ExternalLink, Mail } from 'lucide-react';

interface FooterProps {
  stats?: { total: number; resolved: number };
}

const Footer: React.FC<FooterProps> = ({ stats = { total: 0, resolved: 0 } }) => {
  return (
    <footer className="border-t border-white/5 pt-20 pb-10 bg-surface-low/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={18} />
              </div>
              <span className="text-xl font-display font-bold tracking-tight">
                RailMadad<span className="text-secondary"></span>
              </span>
            </div>
            <p className="text-text-variant max-w-sm leading-relaxed">
              Official Technical Cell initiative for Indian Railways. 
              Leveraging decentralized AI to ensure the highest standards 
              of passenger comfort and safety protocols.
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm pt-4">
              <div className="glass-card p-4 rounded-2xl bg-white/5">
                <div className="text-[10px] font-black tracking-widest text-text-variant uppercase mb-1">Live Pulse</div>
                <div className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {stats.total}+
                </div>
              </div>
              <div className="glass-card p-4 rounded-2xl bg-white/5">
                <div className="text-[10px] font-black tracking-widest text-text-variant uppercase mb-1">Res. Rate</div>
                <div className="text-lg font-bold text-primary">
                  {Math.round((stats.resolved / (stats.total || 1)) * 100)}%
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {[Globe, ExternalLink, Mail].map((Icon, i) => (
                <a key={i} href="#" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                  <Icon size={20} className="text-text-variant" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Platform</h4>
            <ul className="space-y-4">
              {['Home', 'Report Issue', 'Admin Panel', 'Security Policy'].map((t, i) => (
                <li key={i}>
                  <a href="#" className="text-text-variant hover:text-primary transition-colors text-sm cursor-pointer">{t}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Resources</h4>
            <ul className="space-y-4">
              {['API Documentation', 'Neural Network v4', 'Case Studies', 'Open Source'].map((t, i) => (
                <li key={i}>
                  <a href="#" className="text-text-variant hover:text-primary transition-colors text-sm cursor-pointer">{t}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-text-variant font-medium">
            © 2026 MINISTRY OF RAILWAYS - TECHNICAL CELL. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-[10px] font-black tracking-widest text-text-variant uppercase">
             <a href="#" className="hover:text-white transition-colors cursor-pointer">Privacy Cloud</a>
             <a href="#" className="hover:text-white transition-colors cursor-pointer">Terms of Service</a>
             <a href="#" className="hover:text-white transition-colors cursor-pointer">Legal AI Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
