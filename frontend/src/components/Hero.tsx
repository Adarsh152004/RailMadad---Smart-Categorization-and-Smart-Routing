"use client";

import React from 'react';
import { ChevronRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStart: () => void;
  stats: { total: number; resolved: number };
}

const Hero: React.FC<HeroProps> = ({ onStart, stats }) => {
  return (
    <div className="relative pt-24 pb-12 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-variant">AI Engine v4.0 is Live</span>
        </motion.div>

        <motion.h1 
          className="text-4xl md:text-6xl font-display font-bold mb-6 leading-[1.1] tracking-tight text-text-main"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Your Journey, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-gradient">Reimagined.</span>
        </motion.h1>

        <motion.p 
          className="text-base text-text-variant max-w-xl mx-auto mb-8 leading-relaxed font-medium"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Experience the future of Indian Railways with RailMadad. 
          Instant AI grievance categorization, 24/7 technical cell routing, 
          and real-time resolution tracking.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={onStart}
            className="group px-6 py-3 bg-primary text-white rounded-xl font-bold text-base flex items-center gap-2 hover:scale-105 active:scale-95 transition-all glow-primary"
          >
            REPORT AN ISSUE
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </button>
          
          <div className="flex -space-x-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
              </div>
            ))}
            <div className="pl-4 text-left">
              <div className="text-xs font-bold text-text-main">{stats.total + 4200000}+ Active Reports</div>
              <div className="text-[10px] text-secondary font-black">{stats.resolved}+ ISSUES RESOLVED</div>
            </div>
          </div>
        </motion.div>

        {/* Feature Tags */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { icon: ShieldCheck, label: "Secure Auth" },
            { icon: Zap, label: "0.2s Response" },
            { icon: Globe, label: "Multi-Region" },
            { icon: ShieldCheck, label: "Cloud Backup" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-text-variant font-bold text-xs uppercase tracking-widest">
              <item.icon size={14} className="text-primary" />
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
