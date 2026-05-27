import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  ArrowLeft, 
  FileText, 
  ChevronRight, 
  Lock, 
  Scale,
  ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { POLICIES, Policy } from '../src/constants/policies';
import { Footer } from '../src/components/Footer';

const PolicyCenter: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy>(POLICIES[0]);

  return (
    <div className="w-full text-white font-sans">
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-12 gap-12">
             
             {/* Navigation Sidebar */}
             <div className="lg:col-span-4 space-y-8">
                <div className="space-y-4">
                   <h2 className="text-3xl font-black italic uppercase italic tracking-tighter leading-tight">Documentação <br/> & Governança.</h2>
                   <p className="text-slate-400 text-sm italic">Transparência e segurança na malha geoeconômica da BR-232.</p>
                </div>

                <div className="space-y-2">
                   {POLICIES.map((policy: Policy) => (
                     <button 
                       key={policy.id}
                       onClick={() => setSelectedPolicy(policy)}
                       className={`w-full p-5 rounded-3xl border transition-all text-left flex items-center justify-between group ${
                         selectedPolicy.id === policy.id 
                           ? 'bg-primary/10 border-primary/40 text-primary' 
                           : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                       }`}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`size-10 rounded-xl flex items-center justify-center ${selectedPolicy.id === policy.id ? 'bg-primary text-black' : 'bg-white/10 text-slate-500'}`}>
                              <FileText size={18} />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{policy.title}</span>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${selectedPolicy.id === policy.id ? 'rotate-90 text-primary' : 'text-slate-700'}`} />
                     </button>
                   ))}
                </div>

                {/* Security Badge */}
                <div className="p-6 bg-gradient-to-br from-[#0c1a14] to-[#05100a] border border-white/5 rounded-3xl flex items-center gap-4">
                   <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck size={24} />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Dados Protegidos</h4>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Criptografia AES-256</p>
                   </div>
                </div>
             </div>

             {/* Policy Content Viewer */}
             <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={selectedPolicy.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 prose prose-invert max-w-none"
                  >
                     <div className="space-y-2 border-b border-white/5 pb-8">
                        <div className="flex items-center gap-2 text-primary">
                           <Scale size={16} />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Acordo de Utilização</span>
                        </div>
                        <h2 className="text-4xl font-black italic uppercase leading-tight mt-2">{selectedPolicy.title}</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Última atualização: 15 de Maio, 2026</p>
                     </div>

                     <div className="text-slate-300 font-medium italic text-lg leading-relaxed space-y-6" dangerouslySetInnerHTML={{ __html: selectedPolicy.content }} />

                     <div className="pt-12 flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                          <FileText size={16} /> Baixar PDF
                        </button>
                        <button className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                          <ExternalLink size={16} /> Central de Suporte
                        </button>
                     </div>
                  </motion.div>
                </AnimatePresence>

                {/* Background Glow */}
                <div className="absolute -top-40 -right-40 size-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
             </div>

          </div>
        </main>
    </div>
  );
};

export default PolicyCenter;
