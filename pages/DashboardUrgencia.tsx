import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Zap, 
  Clock, 
  Navigation, 
  Phone, 
  ChevronLeft,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';

const DashboardUrgencia: React.FC = () => {
  const navigate = useNavigate();
  const [urgentServices, setUrgentServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'services'),
      where('isUrgent', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUrgentServices(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#05100a] text-white font-sans pb-32">
       <header className="px-6 py-12 border-b border-red-500/10 bg-gradient-to-down from-red-500/10 to-transparent">
          <div className="max-w-4xl mx-auto space-y-8">
             <button 
               onClick={() => navigate('/vida-cidades')}
               className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
             >
                <ChevronLeft size={14} /> Voltar para o Hub
             </button>
             
             <div className="flex items-start gap-6">
                <div className="size-20 rounded-3xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                   <Zap size={40} className="fill-red-500" />
                </div>
                <div className="space-y-2">
                   <h1 className="text-4xl md:text-5xl font-black italic uppercase italic tracking-tighter leading-none">Canal de <span className="text-red-500">Urgência</span></h1>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">SLA de Resposta Imediata • Disponibilidade 24h</p>
                </div>
             </div>
          </div>
       </header>

       <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
          <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl">
             <div className="flex items-center gap-4">
                <div className="size-3 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Monitoramento Satélite Ativo</span>
             </div>
             <div className="flex items-center gap-2 text-slate-500">
                <Activity size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Normal</span>
             </div>
          </div>

          <div className="grid gap-6">
             {loading ? (
               <div className="p-20 flex items-center justify-center">
                  <div className="size-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
               </div>
             ) : urgentServices.length > 0 ? urgentServices.map(service => (
               <UrgentCard key={service.id} service={service} />
             )) : (
               <div className="p-20 bg-white/2 border border-dashed border-white/10 rounded-[2.5rem] text-center space-y-4">
                  <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                    <ShieldCheck size={32} />
                  </div>
                  <p className="text-slate-500 text-sm italic font-medium">Nenhum serviço de urgência ativo nesta região agora.</p>
               </div>
             )}
          </div>
       </main>
    </div>
  );
};

const UrgentCard = ({ service }: any) => (
  <div className="p-8 bg-black/40 border border-red-500/20 rounded-[2.5rem] hover:border-red-500/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-10">
     <div className="flex items-center gap-8">
        <div className="size-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
           <Zap size={32} />
        </div>
        <div className="space-y-3">
           <div className="space-y-1">
              <h3 className="text-2xl font-black italic uppercase leading-none">{service.title}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{service.category} • {service.neighborhood}</p>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-[8px] tracking-[0.2em]">
                 <Clock size={12} /> Responde em ~5 min
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-black uppercase text-[8px] tracking-[0.2em]">
                 <Navigation size={12} /> No Bairro
              </div>
           </div>
        </div>
     </div>

     <a 
       href={`https://wa.me/${service.whatsapp.replace(/\D/g, '')}`}
       target="_blank"
       rel="noopener noreferrer"
       className="h-16 px-10 bg-red-500 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-4 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 group"
     >
       Chamar Agora <Phone size={18} />
     </a>
  </div>
);

export default DashboardUrgencia;
