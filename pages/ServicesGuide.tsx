import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Store, 
  Ticket, 
  Car, 
  Wrench, 
  ShieldCheck, 
  Zap, 
  LayoutPanelLeft,
  Navigation,
  Activity,
  Heart,
  TrendingUp,
  Map,
  ArrowRight
} from 'lucide-react';

const ServicesGuide: React.FC = () => {
  const [activeService, setActiveService] = useState('marketplace');

  const services = [
    {
      id: 'marketplace',
      title: 'A Feira (Marketplace)',
      tag: 'B2B & B2C',
      icon: <Store size={22} />,
      content: {
        what: 'A vitrine digital dos negócios lindeiros ao longo da BR-232.',
        where: 'Pode ser acessado pelo menu "Marketplace" ou via QR Codes nos estabelecimentos físicos.',
        how: 'Comerciantes listam seus produtos e serviços; viajantes encontram o que precisam em cada KM.',
        benefits: ['Visibilidade para pequenos negócios', 'Preços regionais competitivos', 'Reserva antecipada de produtos'],
        color: '#ff751f'
      }
    },
    {
      id: 'fidelidade',
      title: 'Porta-Luvas (Fidelidade)',
      tag: 'Gamificação',
      icon: <Ticket size={22} />,
      content: {
        what: 'Sistema de selos digitais e recompensas por frequência na malha.',
        where: 'Ícone central "Porta-Luvas" no menu inferior.',
        how: 'Valide sua presença via CDV (Código Dinâmico de Voz) ou Geofencing ao chegar em um parceiro.',
        benefits: ['KMs de Influência', 'Benefícios exclusivos em Patrons', 'Progressão de Nível (Titan, Factor, etc)'],
        color: '#00e676'
      }
    },
    {
      id: 'transporte',
      title: 'Transporte Alternativo',
      tag: 'Mobilidade',
      icon: <Car size={22} />,
      content: {
        what: 'Conexão segura entre passageiros e operadores de transporte regional.',
        where: 'Módulo de viagens e fretamento.',
        how: 'Filtre por origem/destino, veja o IP do motorista e reserve seu lugar.',
        benefits: ['Segurança verificada', 'Preços justos', 'Monitoramento em tempo real'],
        color: '#3b82f6'
      }
    },
    {
      id: 'vida-cidades',
      title: 'Vida das Cidades',
      tag: 'Operacional',
      icon: <Wrench size={22} />,
      content: {
        what: 'Infraestrutura operacional urbana para serviços do dia a dia.',
        where: 'Hub Vida das Cidades.',
        how: 'Busque profissionais especializados (pedreiros, técnicos, etc) com anúncios low cost.',
        benefits: ['Atendimento emergencial 24h', 'Custo acessível para anunciantes', 'Geolocalização precisa'],
        color: '#a855f7'
      }
    },
    {
      id: 'alertas',
      title: 'Monitoramento & Alertas',
      tag: 'Segurança',
      icon: <ShieldCheck size={22} />,
      content: {
        what: 'Mapa vivo de incidentes, condições da pista e fiscalização.',
        where: 'Mapa central e feed de alertas.',
        how: 'Colabore reportando problemas ou receba notificações inteligentes no raio de 50km.',
        benefits: ['Prevenção de acidentes', 'Economia de tempo', 'Suporte comunitário'],
        color: '#ff4d4d'
      }
    }
  ];

  const current = services.find(s => s.id === activeService) || services[0];

  return (
    <div className="min-h-screen bg-[#050d09] text-white font-sans flex flex-col md:flex-row shadow-2xl">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 lg:w-96 bg-[#0a1510] border-r border-white/5 p-8 flex flex-col gap-10 shrink-0">
         <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
               <LayoutPanelLeft size={20} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Guia de Utilização</span>
            </div>
            <h1 className="text-3xl font-black italic uppercase italic leading-tight">Serviços <br/><span className="text-primary italic">ECOBR232</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Entenda como extrair o máximo do ecossistema regional.</p>
         </div>

         <nav className="flex flex-col gap-3">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`group flex items-center gap-5 p-5 rounded-[1.5rem] transition-all border text-left ${
                  activeService === service.id 
                  ? 'bg-white/5 border-primary shadow-lg shadow-primary/5' 
                  : 'bg-transparent border-transparent hover:bg-white/2 hover:border-white/10'
                }`}
              >
                 <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
                   activeService === service.id ? 'bg-primary text-black scale-110' : 'bg-white/5 text-slate-500 group-hover:text-white'
                 }`} style={{ backgroundColor: activeService === service.id ? current.content.color : '' }}>
                    {service.icon}
                 </div>
                 <div className="flex-1">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${activeService === service.id ? 'text-primary' : 'text-slate-500'}`}>{service.tag}</div>
                    <div className={`text-sm font-bold transition-colors ${activeService === service.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{service.title}</div>
                 </div>
                 <ChevronRight size={16} className={`transition-all ${activeService === service.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
              </button>
            ))}
         </nav>

         <div className="mt-auto pt-10 border-t border-white/5 space-y-4">
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
               <div className="flex items-center gap-2 text-primary mb-2">
                  <TrendingUp size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Dica de IP</span>
               </div>
               <p className="text-[10px] text-slate-400 font-medium italic">O uso regular destes serviços aumenta seu Índice de Pertencimento (IP) e destrava níveis exclusivos.</p>
            </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">
         <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-down from-primary/5 to-transparent opacity-50" style={{ backgroundImage: `linear-gradient(to bottom, ${current.content.color}05, transparent)` }} />
         
         <AnimatePresence mode="wait">
            <motion.div
              key={activeService}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 max-w-4xl mx-auto px-10 py-24 space-y-20"
            >
               {/* Hero Detail */}
               <section className="space-y-8">
                  <div className="size-20 rounded-3xl flex items-center justify-center text-black shadow-2xl" style={{ backgroundColor: current.content.color }}>
                     {React.cloneElement(current.icon as React.ReactElement, { size: 40 })}
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">{current.title}</h2>
                     <p className="text-2xl font-medium text-slate-400 leading-relaxed max-w-2xl italic border-l-4 border-primary/20 pl-8" style={{ borderLeftColor: `${current.content.color}40` }}>
                        {current.content.what}
                     </p>
                  </div>
               </section>

               {/* Grid Details */}
               <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <DetailBox 
                    title="Onde Encontrar?" 
                    text={current.content.where} 
                    icon={<Navigation size={20} />} 
                    color={current.content.color}
                  />
                  <DetailBox 
                    title="Como Funciona?" 
                    text={current.content.how} 
                    icon={<Zap size={20} />} 
                    color={current.content.color}
                  />
               </section>

               {/* Benefits List */}
               <section className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Principais Benefícios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {current.content.benefits.map((benefit, idx) => (
                        <div key={idx} className="p-8 bg-white/2 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all flex flex-col gap-6">
                           <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-primary" style={{ color: current.content.color }}>
                              <Heart size={20} />
                           </div>
                           <p className="text-sm font-bold uppercase tracking-widest text-slate-300 leading-snug">{benefit}</p>
                        </div>
                     ))}
                  </div>
               </section>

               {/* CTA */}
               <section className="p-10 bg-white/5 border border-white/10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-2 text-center md:text-left">
                     <h4 className="text-2xl font-black italic uppercase leading-none">Pronto para utilizar?</h4>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Siga para o módulo agora mesmo.</p>
                  </div>
                  <button className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-primary transition-all group">
                     Acessar Módulo <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
               </section>
            </motion.div>
         </AnimatePresence>
      </main>
    </div>
  );
};

const DetailBox = ({ title, text, icon, color }: any) => (
  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6 group hover:bg-white/10 transition-all">
     <div className="size-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center transition-transform group-hover:scale-110" style={{ color }}>
        {icon}
     </div>
     <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</h4>
        <p className="text-lg font-bold text-white leading-relaxed">{text}</p>
     </div>
  </div>
);

export default ServicesGuide;
