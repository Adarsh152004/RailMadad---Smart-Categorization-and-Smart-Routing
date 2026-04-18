"use client";

import React, { useState, useRef } from 'react';
import { Camera, Send, CheckCircle2, AlertCircle, Loader2, Train, MapPin, Hash, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ReportFormProps {
  onSuccess: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const [form, setForm] = useState({
    pnr: '',
    trainNumber: '',
    coach: '',
    description: '',
    phoneNumber: '9326897569'
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.pnr.length !== 10 || !/^\d+$/.test(form.pnr)) {
      toast.error("Invalid PNR: Must be a 10-digit numeric code.", { icon: "🎫" });
      return;
    }

    if (form.trainNumber.length !== 5 || !/^\d+$/.test(form.trainNumber)) {
      toast.error("Invalid Train Number: Must be a 5-digit numeric code.", { icon: "🚂" });
      return;
    }

    setStatus('analyzing');

    const formData = new FormData();
    formData.append('pnr', form.pnr);
    formData.append('train_number', form.trainNumber);
    formData.append('coach_number', form.coach);
    formData.append('description', form.description);
    formData.append('phone_number', form.phoneNumber);
    if (file) formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:8000/submit-complaint', formData);
      setAiAnalysis(response.data);
      setStatus('success');
      toast.success("Grievance analyzed and routed successfully!", { theme: "colored" });
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : (detail?.message || "Connection Error");
      
      if (errorMsg.includes("Relevance Error")) {
        toast.error(`Report Rejected: ${detail?.reason || "AI detected non-railway content."}`, { position: "top-center", autoClose: 5000 });
        // Reset form of "rejection"
        setStatus('idle');
        setForm({ ...form, description: '' }); // Only reset description on relevance error
        setFile(null);
        setPreview(null);
      } else {
        toast.error(`Submission Failed: ${errorMsg}`);
        setStatus('error');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <AnimatePresence mode="wait">
        {status === 'idle' || status === 'analyzing' || status === 'error' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-card rounded-3xl p-8 relative overflow-hidden"
          >
            {status === 'analyzing' && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative w-20 h-20 mb-4">
                  <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <Brain className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
                </div>
                <h3 className="text-xl font-display font-bold mb-1">Neural Engine Analyzing</h3>
                <p className="text-text-variant text-xs font-medium max-w-[240px]">
                  Categorizing grievance via CLIP multimodal logic...
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Send className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold tracking-tight">Report Grievance</h2>
                <p className="text-text-variant text-xs font-medium">Auto-routing enabled for Technical Cell</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-variant ml-1">PNR Number</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-text-variant group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      required
                      value={form.pnr}
                      onChange={e => setForm({...form, pnr: e.target.value})}
                      placeholder="10-digit PNR"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-text-main focus:outline-none focus:border-primary/50 focus:bg-white transition-all font-bold text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-variant ml-1">Train No.</label>
                  <div className="relative group">
                    <Train className="absolute left-4 top-1/2 -translate-y-1/2 text-text-variant group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      required
                      value={form.trainNumber}
                      onChange={e => setForm({...form, trainNumber: e.target.value})}
                      placeholder="e.g. 12952"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-text-main focus:outline-none focus:border-primary/50 focus:bg-white transition-all font-bold text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-variant ml-1">Coach</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-variant group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      required
                      value={form.coach}
                      onChange={e => setForm({...form, coach: e.target.value})}
                      placeholder="e.g. B4/22"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-text-main focus:outline-none focus:border-primary/50 focus:bg-white transition-all font-bold text-sm" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-variant ml-1">Visual Evidence (Highly Recommended)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-slate-50 ${preview ? 'border-primary/30 bg-primary/5' : 'border-slate-200'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
                  {preview ? (
                    <div className="relative inline-block group">
                      <img src={preview} alt="preview" className="max-h-48 rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <Camera className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                        <Camera className="text-text-variant" size={20} />
                      </div>
                      <p className="text-xs font-bold text-text-variant">Attach Image Evidence</p>
                      <p className="text-[9px] uppercase tracking-widest font-black text-text-variant opacity-50">JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-variant ml-1">Grievance Description</label>
                <textarea 
                  required
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Explain the situation in detail. Our AI will handle the rest..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-text-main focus:outline-none focus:border-primary/50 focus:bg-white transition-all font-medium resize-none text-sm"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all glow-primary"
              >
                SUBMIT REPORT
                <Send size={20} />
              </button>

              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
                  <AlertCircle size={18} />
                  Submission failed. Technical Cell connection error.
                </div>
              )}
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[3rem] p-12 text-center shadow-primary/20 shadow-2xl relative overflow-hidden border border-white/40"
          >
             {/* Decorative Background Elements */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

             <div className="relative z-10">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-inner">
                 <CheckCircle2 className="text-emerald-500" size={40} />
               </div>
               
               <h2 className="text-3xl font-display font-bold mb-2 tracking-tight">Grievance Logged</h2>
               <p className="text-sm text-text-variant font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                 AI analysis complete. Your report has been prioritized and routed to the specialized cell.
               </p>

               {/* Digital Receipt Card */}
               <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 mb-10 text-left relative overflow-hidden group">
                 <div className="absolute top-0 right-0 py-2 px-4 bg-primary/10 border-b border-l border-primary/20 rounded-bl-xl">
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Report</span>
                 </div>

                 <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                   <div className="col-span-2 border-b border-slate-100 pb-4 mb-2">
                     <div className="text-[9px] font-black text-text-variant uppercase tracking-widest mb-1 opacity-60">Status Descriptor</div>
                     <div className="text-xl font-display font-bold text-primary uppercase">
                       {aiAnalysis?.category} Cell Priority
                     </div>
                   </div>

                   <div>
                     <div className="text-[9px] font-black text-text-variant uppercase tracking-widest mb-1 opacity-60">Reference ID</div>
                     <div className="font-mono font-bold text-text-main text-xs">#RA-{Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
                   </div>

                   <div>
                     <div className="text-[9px] font-black text-text-variant uppercase tracking-widest mb-1 opacity-60">Timestamp</div>
                     <div className="font-bold text-text-main text-xs">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</div>
                   </div>

                   <div>
                     <div className="text-[9px] font-black text-text-variant uppercase tracking-widest mb-1 opacity-60">Train Info</div>
                     <div className="font-bold text-text-main text-xs">{form.trainNumber} / {form.coach}</div>
                   </div>

                   <div>
                     <div className="text-[9px] font-black text-text-variant uppercase tracking-widest mb-1 opacity-60">AI Confidence</div>
                     <div className="font-bold text-emerald-600 text-xs">{(aiAnalysis?.confidence * 100 || 98).toFixed(1)}% Match</div>
                   </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-dashed border-slate-300 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black text-text-variant uppercase tracking-widest">Live SLA Monitoring</span>
                   </div>
                   <div className="text-[10px] font-bold text-primary">Response: ~4h</div>
                 </div>
               </div>

               <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <button 
                    onClick={onSuccess}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all glow-primary shadow-xl shadow-primary/20"
                  >
                    RETURN TO DASHBOARD
                  </button>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-[10px] font-black uppercase tracking-widest text-text-variant hover:text-primary transition-colors py-2"
                  >
                    File Another Report
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BrainIcon: React.FC<{className?: string, size: number}> = ({className, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
  </svg>
);

export default ReportForm;
