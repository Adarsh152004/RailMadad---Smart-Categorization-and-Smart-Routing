"use client";

import React from 'react';
import { Brain, Headphones, Clock, Activity, Target, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Brain,
    title: "AI Categorization",
    desc: "CLIP-based multimodal neural networks analyze text and images to route issues in milliseconds.",
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    icon: Headphones,
    title: "Direct Routing",
    desc: "Bypass helpdesks. Your issue goes straight to the Department Head's official dashboard.",
    color: "text-secondary",
    bg: "bg-secondary/10"
  },
  {
    icon: Clock,
    title: "SLA Tracking",
    desc: "Strict adherence to Service Level Agreements with automated escalation triggers.",
    color: "text-accent",
    bg: "bg-accent/10"
  },
  {
    icon: Activity,
    title: "Live Monitoring",
    desc: "Watch your grievance status update in real-time as officials take action.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    icon: Target,
    title: "Precise Locating",
    desc: "Zero-confusion reporting with train number, PNR, and coach-level detail integration.",
    color: "text-blue-400",
    bg: "bg-blue-400/10"
  },
  {
    icon: Shield,
    title: "Legal Validity",
    desc: "Every report is timestamped and cryptographically signed for accountability.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-16 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-3 text-text-main">Enterprise Infrastructure</h2>
          <p className="text-text-variant max-w-lg mx-auto font-medium text-sm">
            Powered by CLIP neural networks and decentralized data routing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 rounded-3xl group hover:bg-slate-50 transition-all cursor-default"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon className={f.color} size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2 tracking-tight text-text-main">{f.title}</h3>
              <p className="text-text-variant text-xs leading-relaxed font-medium">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
