import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Crown, 
  Check, 
  ArrowRight, 
  Users, 
  Briefcase, 
  Building2, 
  Globe,
  Navigation,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Nature = 'PF' | 'PJ';

const PatronPlans: React.FC = () => {
  const [nature, setNature] = useState<Nature>('PJ');
  const navigate = useNavigate();

  const plans = [
    {
      id: 'bronze',
      name: 'Bronze',
      tag: 'O Alicerce',
      icon: <ShieldCheck size={32} />,
      color: '#CD7F32',
      ip: 10,
      influence: '15km',
      cycle: 'Anual',
      features: [
        'Validação de Checkpoint de Identidade',
        'Página Comercial Estável (PF/PJ)',
        'Localização Exata no Radar',
        'Bio e Links de Contato',
        '1 Alerta de Oferta Mensal'
      ]
    },
    {
      id: 'prata',
      name: 'Prata',
      tag: 'A Fluidez',
      icon: <Zap size={32} />,
      color: '#C0C0C0',
      ip: 35,
      influence: '100km',
      cycle: 'Anual',
      featured: true,
      features: [
        'Destaque Regional (Radar Ativo)',
        'Galeria de Itens/Serviços',
        'Prioridade em Buscas Locais',
        'Banner Rotativo na Cidade',
        '5 Alertas de Oferta Mensais',
        'Suporte Prioritário'
      ]
    },
    {
      id: 'ouro',
      name: 'Ouro',
      tag: 'A Autoridade',
      icon: <Crown size={32} />,
      color: '#FFD700',
      ip: 85,
      influence: 'Toda a Malha',
      cycle: 'Anual',
      features: [
        'Exclusividade de Segmento (Opcional)',
        'Branding Institucional na Home',
        'Notificação Push para Toda a Malha',
        'Dashboard de KMs de Influência',
        'Disparos Ilimitados de Alertas',
        'Gerente de Conta Dedicado'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050806] text-white pb-24 overflow-x-hidden">
      {/* Header / Intro */}
      <section className="relative pt-24 pb-16 px-6 text-center border-b border-white/5">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -top-48 opacity-20" />
        
        <div className="max-w-4x1 mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8"
          >
            <div className="size-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Engenharia de Pertencimento</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-7xl font-black italic uppercase italic tracking-tighter leading-none mb-6">
            Torne-se um <br/><span className="text-primary italic">Patrono</span> da Rodovia.
          </h1>
          <p className="max-w-xl mx-auto text-slate-400 font-medium italic text-sm sm:text-lg">
            Escolha sua estatura no ecossistema e transforme seu mérito em visibilidade automática ao longo de toda a BR-232.
          </p>
        </div>
      </section>

      {/* Nature Switcher */}
      <div className="flex justify-center -mt-8 relative z-20 px-6">
         <div className="p-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl flex gap-1">
            <button 
              onClick={() => setNature('PF')}
              className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-500 ${nature === 'PF' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <Briefcase size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">Segmento PF</span>
            </button>
            <button 
              onClick={() => setNature('PJ')}
              className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-500 ${nature === 'PJ' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <Building2 size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">Estatura PJ</span>
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20">
         <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative p-10 rounded-[3rem] border transition-all duration-500 overflow-hidden group ${
                  plan.featured 
                  ? 'bg-gradient-to-br from-primary/10 via-black to-black border-primary/30 shadow-[0_0_80px_rgba(0,230,118,0.15)]' 
                  : 'bg-black/40 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Visual Impact Accents */}
                <div className="absolute top-0 right-0 p-8 text-white/5 -mr-4 -mt-4">
                   {React.cloneElement(plan.icon as React.ReactElement, { size: 120, className: 'rotate-12' })}
                </div>

                <div className="relative z-10 space-y-8">
                  <header className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                         {plan.icon}
                      </div>
                      <div>
                         <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase italic">{plan.tag}</p>
                         <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">{plan.name}</h3>
                      </div>
                    </div>
                  </header>

                  {/* Impact Stats */}
                  <div className="p-6 bg-black/60 border border-white/5 rounded-3xl space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                           <span>IP (Índice de Pertencimento)</span>
                           <span className="text-primary">+{plan.ip} Pontos</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${plan.ip}%` }}
                             className="h-full bg-primary"
                           />
                        </div>
                     </div>
                     <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Alcance de Radar</p>
                        <p className="text-[11px] font-black uppercase text-white tracking-widest">{plan.influence}</p>
                     </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex gap-4 group/item">
                         <div className="size-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-primary group-hover/item:text-black transition-colors">
                            <Check size={12} strokeWidth={4} />
                         </div>
                         <span className="text-sm font-medium italic text-slate-400 group-hover/item:text-white transition-colors">
                           {feature}
                         </span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => navigate('/contato')}
                    className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
                      plan.featured 
                      ? 'bg-primary text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(0,230,118,0.2)]' 
                      : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{plan.cycle} — Consultar Investimento</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Outras Verticais - Footer do Comparador */}
      <section className="max-w-7xl mx-auto px-6 mt-32 space-y-8">
         <h3 className="text-xl font-black italic uppercase italic tracking-tighter text-slate-500">Planos de Fluxo Rodoviário</h3>
         <div className="grid md:grid-cols-2 gap-8">
            {/* Expresso 232 Card */}
            <div className="p-8 bg-white/5 border border-white/5 rounded-[3rem] flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
               <div className="flex gap-6 items-center">
                  <div className="size-16 rounded-3xl bg-[#ff751f]/10 flex items-center justify-center text-[#ff751f]">
                     <Navigation size={32} />
                  </div>
                  <div>
                     <h4 className="text-lg font-black italic uppercase italic tracking-tighter">Expresso 232 (Transporte)</h4>
                     <p className="text-xs text-slate-400 font-medium italic mb-2">Vans, Ônibus e Moto-Taxi</p>
                     <div className="flex gap-2">
                        <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded-full font-black uppercase tracking-widest">Trimestral</span>
                        <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded-full font-black uppercase tracking-widest">Anual</span>
                     </div>
                  </div>
               </div>
               <div className="size-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowRight size={20} />
               </div>
            </div>

            {/* Central de Serviços Card */}
            <div className="p-8 bg-white/5 border border-white/5 rounded-[3rem] flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
               <div className="flex gap-6 items-center">
                  <div className="size-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                     <Smartphone size={32} />
                  </div>
                  <div>
                     <h4 className="text-lg font-black italic uppercase italic tracking-tighter">Central de Serviços</h4>
                     <p className="text-xs text-slate-400 font-medium italic mb-2">Profissionais e Assistência</p>
                     <div className="flex gap-2">
                        <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded-full font-black uppercase tracking-widest">Mensal</span>
                        <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded-full font-black uppercase tracking-widest">Trimestral</span>
                     </div>
                  </div>
               </div>
               <div className="size-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowRight size={20} />
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default PatronPlans;
