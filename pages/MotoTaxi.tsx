import React from 'react';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Award,
  Phone,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MotoTaxi: React.FC = () => {
  const navigate = useNavigate();

  const rankings = [
    { id: 1, name: 'Beto do Grau', city: 'Arcoverde', rating: 4.9, rides: 1240, status: 'Ouro' },
    { id: 2, name: 'Zé da Twister', city: 'Bezerros', rating: 4.8, rides: 890, status: 'Prata' },
    { id: 3, name: 'Carlos Express', city: 'Caruaru', rating: 4.7, rides: 2100, status: 'Titan' },
  ];

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      {/* Hero */}
      <header className="px-6 py-16 text-center space-y-6 bg-gradient-to-b from-primary/10 to-transparent">
         <div className="size-20 rounded-[2rem] bg-primary flex items-center justify-center text-black mx-auto shadow-[0_0_40px_rgba(0,230,118,0.3)]">
            <span className="material-symbols-outlined text-[40px] filled">two_wheeler</span>
         </div>
         <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter italic leading-none">Moto-Táxi <br/><span className="text-primary italic">Elite.</span></h1>
            <p className="text-slate-400 text-sm md:text-base font-medium italic max-w-xl mx-auto">Os profissionais mais bem avaliados da BR-232, verificados pelo ecossistema.</p>
         </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-12">
        
        {/* Quick Order (Simulated) */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group">
           <div className="flex items-center gap-6">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Navigation size={28} />
              </div>
              <div className="text-left">
                 <h3 className="text-2xl font-black italic uppercase italic leading-tight">Chamar agora</h3>
                 <p className="text-slate-500 text-xs italic italic">Sua localização: Gravatá - KM 80</p>
              </div>
           </div>
           <button className="h-16 px-10 bg-primary hover:bg-primary-dark text-black rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20">
              Solicitar Corrida <Zap size={18} fill="currentColor" />
           </button>
        </div>

        {/* Ranking List */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic">Top 10 da Região</h3>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                 <button className="text-primary">Avaliação</button>
                 <button className="text-slate-500">KMs Rodados</button>
              </div>
           </div>

           <div className="grid gap-4">
              {rankings.map(driver => (
                <div key={driver.id} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between group hover:border-primary/40 transition-all">
                   <div className="flex items-center gap-5">
                      <div className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-primary transition-all relative">
                         <span className="material-symbols-outlined text-3xl">person_pin</span>
                         {driver.status === 'Ouro' && (
                           <div className="absolute -top-1 -right-1 size-5 bg-yellow-500 rounded-full flex items-center justify-center text-black">
                              <Star size={10} fill="currentColor" />
                           </div>
                         )}
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black italic uppercase italic leading-none">{driver.name}</h4>
                            <span className="text-[8px] font-black uppercase text-primary border border-primary/20 px-1.5 py-0.5 rounded italic">{driver.status}</span>
                         </div>
                         <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1 text-primary">
                               <Star size={12} fill="currentColor" />
                               <span className="text-[10px] font-black">{driver.rating}</span>
                            </div>
                            <div className="size-1 bg-slate-800 rounded-full"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{driver.rides} Viagens</span>
                            <div className="size-1 bg-slate-800 rounded-full"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{driver.city}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex gap-2">
                      <button className="size-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400">
                         <Phone size={18} />
                      </button>
                      <button className="size-12 rounded-2xl bg-white/5 hover:bg-primary border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-black transition-all">
                         <ChevronRight size={18} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Informative Grid */}
        <div className="grid md:grid-cols-2 gap-6 pb-12">
            <div className="p-8 bg-[#0c1a14] border border-white/5 rounded-[2.5rem] space-y-4">
               <ShieldCheck size={32} className="text-primary" />
               <h4 className="text-xl font-black italic uppercase italic leading-none">Segurança Operacional</h4>
               <p className="text-slate-400 text-xs italic leading-relaxed">Todos os profissionais passam por verificação de antecedentes e possuem seguro ativo na malha.</p>
            </div>
            <div className="p-8 bg-[#0c1a14] border border-white/5 rounded-[2.5rem] space-y-4">
               <TrendingUp size={32} className="text-primary" />
               <h4 className="text-xl font-black italic uppercase italic leading-none">Ranking de Mérito</h4>
               <p className="text-slate-400 text-xs italic leading-relaxed">Profissionais com maior IP recebem prioridade em chamadas e taxas reduzidas.</p>
            </div>
        </div>
      </main>
    </div>
  );
};

export default MotoTaxi;
