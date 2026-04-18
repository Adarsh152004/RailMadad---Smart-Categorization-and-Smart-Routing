"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Shield, Clock, AlertCircle, CheckCircle2, RefreshCw, Filter, Download, ArrowUpRight, Search, MessageSquare, X, ExternalLink, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    enhm: 0
  });
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All Sectors');
  const [showAllReports, setShowAllReports] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/complaints');
      setComplaints(response.data);
      
      const res = response.data;
      setStats({
        total: res.length,
        resolved: res.filter((c: any) => c.status === 'Resolved').length,
        pending: res.filter((c: any) => c.status !== 'Resolved').length,
        enhm: res.filter((c: any) => c.category === 'EnHM').length
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Dashboard Sync Failed: Technical Cell unreachable.", { theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await axios.patch(`http://localhost:8000/complaints/${id}/resolve`);
      toast.success("Grievance Resolved Successfully", { icon: "✅" });
      setSelectedComplaint(null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
      toast.error("Failed to resolve grievance.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getInfluxData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: Record<string, number> = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
    
    complaints.forEach(c => {
      const date = new Date(c.created_at);
      const dayName = days[date.getDay()];
      counts[dayName]++;
    });

    // Reorder starting from Mon for the chart
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return orderedDays.map(day => ({ name: day, value: counts[day] }));
  };

  const getCategoryData = () => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });

    const total = complaints.length || 1;
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100)
    })).sort((a, b) => b.value - a.value);
  };

  const chartData = getInfluxData();
  const categoryData = getCategoryData();
  const COLORS = ['#2563eb', '#f59e0b', '#7c3aed', '#64748b', '#10b981', '#ef4444'];

  return (
    <div className="pt-24 pb-12 px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-md">
              Live Command Center
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 animate-pulse">
              <span className="w-1 h-1 bg-emerald-500 rounded-full" />
              Real-time Sync
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold mb-1">Technical Cell Dashboard</h1>
          <p className="text-text-variant text-sm font-medium">Monitoring Indian Railways grievance routing infrastructure.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchData} className="p-3 glass-card rounded-xl text-text-variant hover:text-primary transition-colors cursor-pointer">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-variant" size={16} />
            <input 
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-100/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-text-main focus:outline-none focus:border-primary/50 w-56 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs glow-primary hover:scale-105 transition-all cursor-pointer">
            <Download size={16} />
            EXPORT
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Grievances', val: stats.total, icon: AlertCircle, color: 'text-text-main' },
          { label: 'Resolved (Avg. 4h)', val: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Escalated/Pending', val: stats.pending, icon: Clock, color: 'text-secondary' },
          { label: 'EnHM Specialized', val: stats.enhm, icon: Shield, color: 'text-accent' }
        ].map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 rounded-2xl relative group overflow-hidden cursor-default"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform`}>
              <s.icon size={48} />
            </div>
            <div className="text-[9px] font-black text-text-variant uppercase tracking-widest mb-2">{s.label}</div>
            <div className={`text-3xl font-display font-bold ${s.color} mb-1`}>{s.val}</div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block">
               <ArrowUpRight size={8} /> +12.5%
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold mb-1">Influx Intelligence</h3>
              <p className="text-xs text-text-variant font-medium">Weekly trend analysis of incoming grievances</p>
            </div>
            <div className="flex gap-2">
               {['7D', '30D', '90D'].map(t => (
                 <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest cursor-pointer ${t === '7D' ? 'bg-primary text-white' : 'bg-slate-100 text-text-variant hover:bg-slate-200'}`}>
                   {t}
                 </button>
               ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 9, fontWeight: 700}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 9, fontWeight: 700}}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-0.5">Sector Distribution</h3>
          <p className="text-[10px] text-text-variant font-medium mb-8 uppercase tracking-widest">AI Categorization</p>
          
          <div className="h-[300px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <XAxis dataKey="name" hide />
                <Tooltip contentStyle={{ display: 'none' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {categoryData.map((d, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{d.name}</span>
                </div>
                <div className="text-[10px] font-black text-text-variant">{d.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="glass-card rounded-3xl overflow-hidden mb-12">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold mb-1">Grievance Intelligence Feed</h3>
            <p className="text-xs text-text-variant font-medium">Live monitoring of incoming routed alerts</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
              <Filter size={14} className="text-text-variant" />
              <select 
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="text-[10px] font-bold bg-transparent outline-none cursor-pointer"
              >
                <option>All Sectors</option>
                <option>EnHM</option>
                <option>Security</option>
                <option>Electrical</option>
                <option>Catering</option>
                <option>Mechanical</option>
              </select>
            </div>
          </div>
        </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter rounded">
                      #RA-{selectedComplaint.id?.toString().substr(-8).toUpperCase()}
                    </span>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedComplaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedComplaint.status}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold">Issue Intelligence Report</h2>
                </div>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-text-variant" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Location Intelligence */}
                    <div>
                      <h4 className="text-[10px] font-black text-text-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MapPin size={12} /> Location Intelligence
                      </h4>
                      <div className="glass-card p-4 rounded-2xl bg-slate-50 border-slate-100">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-text-variant font-medium">Train Number</span>
                          <span className="text-xs font-bold">{selectedComplaint.train_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-text-variant font-medium">Coach / PNR</span>
                          <span className="text-xs font-bold">{selectedComplaint.coach_number} / {selectedComplaint.pnr || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div>
                      <h4 className="text-[10px] font-black text-text-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Shield size={12} /> AI Categorization
                      </h4>
                      <div className={`p-4 rounded-2xl border ${
                        selectedComplaint.category === 'EnHM' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                        selectedComplaint.category === 'Security' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                        'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                        <div className="flex justify-between items-end">
                          <div className="text-xl font-black">{selectedComplaint.category}</div>
                          <div className="text-[10px] font-black opacity-60 bg-white/40 px-2 py-1 rounded-lg">
                            {Math.round((selectedComplaint.confidence || 0.92) * 100)}% Match
                          </div>
                        </div>
                        <div className="text-[10px] font-bold opacity-70">Routed to specialized department</div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-[10px] font-black text-text-variant uppercase tracking-widest mb-3">Narrative Description</h4>
                      <p className="text-sm text-text-main leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {selectedComplaint.description || "No textual description provided for this intelligence report."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Visual Evidence */}
                    <div>
                      <h4 className="text-[10px] font-black text-text-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                        Visual Evidence
                      </h4>
                      {selectedComplaint.image_url ? (
                        <div className="relative group rounded-3xl overflow-hidden border-4 border-slate-100 shadow-lg">
                          <img 
                            src={selectedComplaint.image_url} 
                            alt="Evidence" 
                            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => window.open(selectedComplaint.image_url, '_blank')}
                              className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2"
                            >
                              <ExternalLink size={12} /> Expand
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-square bg-slate-100 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                          <AlertCircle size={32} className="text-slate-300 mb-2" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Visual Data</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <div className="text-[10px] text-text-variant font-bold">
                  Captured: {new Date(selectedComplaint.created_at).toLocaleString()}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      const msg = `RailMadad Alert: Complaint #RA-${selectedComplaint.id?.toString().substr(-8).toUpperCase()} requires attention. Dept: ${selectedComplaint.category}. Train: ${selectedComplaint.train_number}. Description: ${selectedComplaint.description}`;
                      window.open(`https://wa.me/${selectedComplaint.phone_number || '919326897569'}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <MessageSquare size={14} /> Alert Department
                  </button>
                  <button 
                    onClick={() => handleResolve(selectedComplaint.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:scale-105 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Mark Resolved
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-text-variant uppercase tracking-widest">ID / Timestamp</th>
                <th className="px-6 py-6 text-[10px] font-black text-text-variant uppercase tracking-widest">Train / Coach</th>
                <th className="px-6 py-6 text-[10px] font-black text-text-variant uppercase tracking-widest">Sector (AI)</th>
                <th className="px-6 py-6 text-[10px] font-black text-text-variant uppercase tracking-widest">Status / SLA</th>
                <th className="px-8 py-4 text-[10px] font-black text-text-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length > 0 ? complaints
                .filter(c => {
                  const matchesSearch = 
                    c.train_number?.includes(searchTerm) || 
                    c.pnr?.includes(searchTerm) || 
                    c.description?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesSector = sectorFilter === 'All Sectors' || c.category === sectorFilter;
                  return matchesSearch && matchesSector;
                })
                .slice(0, showAllReports ? undefined : 5)
                .map((c, i) => (
                <motion.tr 
                  key={c.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-slate-50 transition-colors text-text-main"
                >
                  <td className="px-8 py-6">
                    <div className="font-bold mb-1 text-sm">#RA-{c.id?.toString().substr(-8).toUpperCase()}</div>
                    <div className="text-[10px] text-text-variant font-bold">
                      {new Date(c.created_at).toLocaleDateString()} | {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="font-bold mb-1 text-sm">Train {c.train_number}</div>
                    <div className="text-[10px] text-primary font-black uppercase tracking-widest">COACH {c.coach_number}</div>
                  </td>
                  <td className="px-6 py-8">
                    <div className={`px-4 py-1.5 rounded-xl border w-fit text-[10px] font-black tracking-widest uppercase shadow-sm ${
                      c.category === 'EnHM' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                      c.category === 'Security' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                      c.category === 'Electrical' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600' :
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                    }`}>
                      {c.category}
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${c.status === 'Resolved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      <span className="font-bold text-text-main text-xs">{c.status || 'Routing...'}</span>
                    </div>
                    <div className="text-[10px] text-text-variant font-bold">Priority: {c.status === 'Pending' ? 'High' : 'Normal'}</div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          const msg = `RailMadad Alert: Complaint #RA-${c.id?.toString().substr(-8).toUpperCase()} routed to ${c.category}. Train: ${c.train_number}, Coach: ${c.coach_number}. Description: ${c.description}`;
                          window.open(`https://wa.me/${c.phone_number || '919326897569'}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        <MessageSquare size={12} />
                        Alert Cell
                      </button>
                      <button 
                        onClick={() => setSelectedComplaint(c)}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-black tracking-widest uppercase hover:scale-105 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-text-variant" />
                      </div>
                      <p className="text-text-variant font-bold uppercase tracking-widest text-xs">Awaiting Sector Intelligence...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* See More Toggle */}
        {complaints.length > 5 && (
          <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex justify-center">
            <button 
              onClick={() => setShowAllReports(!showAllReports)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all cursor-pointer"
            >
              {showAllReports ? "Show Less" : "See All Intelligence Feed"}
              <ArrowUpRight size={14} className={showAllReports ? "rotate-180" : ""} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Loader2: React.FC<{className?: string}> = ({className}) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Dashboard;
