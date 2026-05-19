import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  History, 
  MapPin, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoyaltyWallet: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Selo Ativo');

  const stamps = [
    { id: 1, name: 'Posto do Sertão', city: 'Arcoverde', points: 450, total: 1000, color: 'primary' },
    { id: 2, name: 'Churrascaria do Gaucho', city: 'Bezerros', points: 800, total: 1200, color: 'primary' },
  ];

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[50%] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Header */}
      <header className="px-6 py-12 flex flex-col items-center text-center space-y-6 relative z-10">
         <div className="size-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-2xl">
            <span className="material-symbols-outlined text-primary text-3xl filled">confirmation_number</span>
         </div>
         <div className="space-y-1">
            <h1 className="text-4xl font-black italic uppercase italic tracking-tighter leading-none">Porta-Luvas <br/><span className="text-primary italic">Digital.</span></h1>
            <p className="text-[10px] font-black italic uppercase tracking-[0.3em] text-slate-500">Gestão de Selos & Vantagens</p>
         </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 space-y-10">
        
        {/* Wallet Balance Card */}
        <section className="p-8 sm:p-10 bg-gradient-to-br from-[#0c1a14] to-[#05100a] rounded-[2rem] sm:rounded-[3rem] border border-primary/20 relative overflow-hidden group">
           <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={14} className="text-primary" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-primary">Saldo Acumulado BR232</span>
                </div>
                <button className="text-[8px] font-black uppercase text-slate-500 hover:text-white flex items-center gap-1">
                   Histórico <History size={12} />
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 pb-2">KMs de Influência:</span>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter italic">2.480</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button className="h-16 px-6 bg-primary hover:bg-primary-dark text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20">
                    <QrCode size={18} /> Validar Agora
                 </button>
                 <button className="h-16 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all">
                    Ver Catálogo
                 </button>
              </div>
           </div>

           {/* Abstract Pattern */}
           <div className="absolute top-1/2 right-[-10%] translate-y-[-50%] size-64 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
        </section>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/5 pb-4">
           {['Selo Ativo', 'Finalizados'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`text-xs font-black uppercase tracking-[0.2em] italic relative pb-4 transition-colors ${activeTab === tab ? 'text-primary' : 'text-slate-500'}`}
             >
               {tab}
               {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
             </button>
           ))}
        </div>

        {/* Stamp List */}
        <div className="space-y-6">
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               className="grid gap-4"
             >
               {stamps.map(stamp => (
                 <div key={stamp.id} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:border-primary/40 transition-all group flex flex-col sm:flex-row items-center gap-6">
                    <div className="size-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary relative overflow-hidden">
                       <span className="material-symbols-outlined text-4xl filled">verified</span>
                       <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                       <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{stamp.city}</span>
                            <h4 className="text-xl font-black italic uppercase italic leading-none mt-1">{stamp.name}</h4>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-black italic text-primary">{Math.round((stamp.points / stamp.total) * 100)}%</div>
                             <span className="text-[8px] font-black uppercase text-slate-600">Completo</span>
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(stamp.points / stamp.total) * 100}%` }}
                               className="h-full bg-primary"
                             />
                          </div>
                          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                             <span>{stamp.points} KM acumulados</span>
                             <span>Meta: {stamp.total} KM</span>
                          </div>
                       </div>
                    </div>

                    <button className="p-4 bg-white/5 hover:bg-primary hover:text-black border border-white/10 rounded-2xl transition-all">
                       <ArrowUpRight size={20} />
                    </button>
                 </div>
               ))}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Invite/Partner Section */}
        <div className="p-8 bg-[#0c1a14] border border-white/10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer transition-all hover:bg-white/[0.04]">
           <div className="flex items-center gap-6">
              <div className="size-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-black">
                 <Zap size={28} />
              </div>
              <div className="text-left">
                 <h3 className="text-2xl font-black italic uppercase italic leading-tight">Digitalize seu Negócio.</h3>
                 <p className="text-slate-400 text-xs italic">Crie seu selo digital e fidelize viajantes da rodovia.</p>
              </div>
           </div>
           <button onClick={() => navigate('/patronos')} className="h-14 px-8 bg-white/5 group-hover:bg-primary border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all group-hover:text-black">
              Gestor de Patronos
           </button>
        </div>
      </main>
    </div>
  );
};

export default LoyaltyWallet;
