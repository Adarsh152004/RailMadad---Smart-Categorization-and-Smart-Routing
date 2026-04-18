"use client";

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  view: string;
  setView: (view: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ view, setView }) => {
  return (
    <nav className="fixed top-0 w-full z-50 glass-nav px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setView('landing')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-primary">
            <TrendingUp className="text-white" size={18} />
          </div>
          <span className="text-lg font-display font-bold tracking-tight text-text-main">
            RailMadad<span className="text-secondary"></span>
          </span>
        </motion.div>
        
        <div className="flex gap-8 items-center">
          <button 
            onClick={() => setView('landing')}
            className={`text-xs font-bold tracking-wide transition-colors cursor-pointer ${view === 'landing' ? 'text-primary' : 'text-text-variant hover:text-text-main'}`}
          >
            HOME
          </button>
          <button 
            onClick={() => setView('report')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${view === 'report' ? 'bg-primary text-white glow-primary' : 'bg-slate-100 text-text-variant hover:bg-slate-200 hover:text-text-main'}`}
          >
            REPORT ISSUE
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`text-xs font-bold tracking-wide transition-colors cursor-pointer ${view === 'admin' ? 'text-primary' : 'text-text-variant hover:text-text-main'}`}
          >
            DASHBOARD
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
