"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ReportForm from '@/components/ReportForm';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [view, setView] = useState<'landing' | 'report' | 'admin'>('landing');
  const [stats, setStats] = useState({ total: 0, resolved: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/complaints');
        const data = response.data;
        setStats({
          total: data.length,
          resolved: data.filter((c: any) => c.status === 'Resolved').length
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen">
      <Navbar view={view} setView={setView} />
      
      <div className="pt-20">
        {view === 'landing' && (
          <>
            <Hero onStart={() => setView('report')} stats={stats} />
            <Features />
          </>
        )}
        
        {view === 'report' && (
          <ReportForm onSuccess={() => setView('landing')} />
        )}
        
        {view === 'admin' && (
          <Dashboard />
        )}
      </div>

      <Footer stats={stats} />
      
      {/* Global Background Elements */}
      <div className="fixed inset-0 -z-20 bg-background" />
      <div className="fixed inset-0 -z-10 mesh-bg opacity-30" />
      <ToastContainer position="bottom-right" theme="light" />
    </div>
  );
}
