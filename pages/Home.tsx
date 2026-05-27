import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { CityType } from '../src/types';

import { 
  Zap, 
  Menu, 
  X,
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  Navigation,
  Bell,
  Search,
  LayoutGrid,
  Store,
  ShoppingCart,
  Wallet,
  Car,
  Wrench,
  Clock,
  Briefcase
} from 'lucide-react';

const Home: React.FC<{ auth?: boolean }> = ({ auth }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const stats = profile?.stats || {
    ip: 0,
    merit: 0,
    associationForce: 0,
    totalKm: 0,
  };

  const currentCity = profile?.currentCity || "Recife";
  const identities = profile?.identities || { 
    isConsumer: true, 
    isPatron: false, 
    isDriver: false, 
    isGuardian: false, 
    isSecretary: false,
    isServiceProvider: false,
    isTravelManager: false,
    isColumnist: false
  };

  const recentAlerts = [
    { id: 1, type: 'Trânsito', location: 'KM 64 - Gravatá', time: '5m', severity: 'low' },
    { id: 2, type: 'Obra', location: 'KM 82 - Bezerros', time: '12m', severity: 'medium' },
  ];

  const hasEliteIdentity = identities.isPatron || identities.isDriver || identities.isGuardian || identities.isSecretary;

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      {/* Header Stat Bar */}
      <header className="sticky top-0 z-50 bg-[#05100a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 px-safe">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4 cursor-pointer select-none active:opacity-80 transition-opacity" onClick={() => navigate('/portal')}>
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shadow-lg shrink-0">
                 <img 
                   src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                   className="size-full object-contain"
                   alt="BR232"
                   referrerPolicy="no-referrer"
                 />
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-widest leading-none">Portal BR232</h1>
              <p className="text-[8px] font-bold text-primary tracking-widest uppercase mt-1">Conectado: {currentCity}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <nav className="hidden lg:flex items-center gap-6 mr-4">
                 <a href="/#/" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Início</a>
                 <button onClick={() => navigate('/mneme')} className="text-[9px] font-black uppercase tracking-widest text-[#ff751f] hover:text-primary transition-colors italic px-2 py-1">Cesta</button>
                <button onClick={() => navigate('/guia-servicos')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Serviços</button>
                <button onClick={() => navigate('/planos')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Planos</button>
                <button onClick={() => navigate('/blog')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Blog</button>
             </nav>
             
             <div className="hidden sm:flex items-center gap-3">
                <button 
                   onClick={() => navigate('/dashboard')}
                   className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-all"
                >
                   Meu Painel
                </button>
                <div className="h-8 w-px bg-white/10 mx-1"></div>
                <button className="relative p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                   <Bell size={18} />
                   <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full animate-pulse border-2 border-[#05100a]"></span>
                </button>
                <div className="h-8 w-px bg-white/10 mx-1"></div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 pr-4 pl-1 py-1 rounded-full shrink-0">
                   <div className="size-6 rounded-full bg-primary flex items-center justify-center text-black">
                      <TrendingUp size={14} />
                   </div>
                   <span className="text-[10px] font-black italic whitespace-nowrap">IP: {stats.ip.toFixed(1)}</span>
                </div>
             </div>

             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-95 transition-all"
             >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[110] bg-[#05100a] lg:hidden p-8 pt-24 space-y-8 flex flex-col items-center text-center overflow-y-auto"
            >
               <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                  <X size={24} />
               </button>
    
               <div className="flex flex-center flex-col items-center gap-4 mb-4">
                  <div className="size-16 rounded-full bg-primary flex items-center justify-center text-black border-4 border-white/5 shadow-xl">
                     <TrendingUp size={32} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Seu Índice de Pertencimento</p>
                     <h3 className="text-3xl font-black italic tracking-tighter text-primary">{stats.ip.toFixed(1)}%</h3>
                  </div>
               </div>
               
               <nav className="flex flex-col gap-6 w-full">
                  <a href="/#/" className="h-16 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300 flex items-center justify-center">Início</a>

                  <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-[#ff751f]/10 border border-[#ff751f]/20 text-lg font-black uppercase tracking-[0.2em] italic text-[#ff751f]">Cesta do Lar</button>
                  <button onClick={() => { navigate('/guia-servicos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Guia de Serviços</button>
                  <button onClick={() => { navigate('/planos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Planos & Patronos</button>
                  <button onClick={() => { navigate('/blog'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Blog da 232</button>
                  <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-primary/10 border border-primary/20 text-lg font-black uppercase tracking-[0.2em] italic text-primary">Meu Painel</button>
               </nav>
    
               <div className="w-full h-px bg-white/5" />
    
               <div className="flex flex-col gap-3 w-full pb-12">
                  <button onClick={() => { navigate('/alertas'); setIsMenuOpen(false); }} className="h-14 rounded-xl border border-red-500/30 text-[10px] font-black uppercase text-red-500 tracking-widest">Alertas da Rodovia</button>
                  <button onClick={() => { navigate('/classificados'); setIsMenuOpen(false); }} className="h-14 rounded-xl border border-emerald-500/30 text-[10px] font-black uppercase text-emerald-500 tracking-widest">A Feira Digital</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        
        {/* Multimodal Registration CTA for new/base users */}
        {!hasEliteIdentity && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/dashboard?sima=true')}
            className="p-6 bg-primary/10 border border-primary/20 rounded-[2rem] flex items-center gap-6 cursor-pointer hover:bg-primary/20 transition-all group"
          >
            <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
               <Zap size={32} fill="currentColor" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-black italic uppercase italic leading-none">Giro Multimodal</h3>
              <p className="text-xs font-bold text-slate-400 uppercase italic">Você é mais que um consumidor. Escolha seu papel na malha.</p>
            </div>
            <ArrowUpRight className="text-primary opacity-50" />
          </motion.section>
        )}

        {/* IP Score Card - Elemento X Reflection */}
        <section className="relative overflow-hidden group">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-[#0c1a14] to-[#05100a] rounded-[1.5rem] sm:rounded-[2.5rem] border border-primary/20 shadow-2xl relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                  <ShieldCheck size={14} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Índice de Pertencimento</span>
                </div>
                <h2 className="text-5xl sm:text-7xl font-black italic uppercase italic tracking-tighter leading-none">
                  {stats.ip.toFixed(1)}<span className="text-xl sm:text-2xl text-primary lowercase tracking-normal pl-1 sm:pl-2">%</span>
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm italic font-medium">Você pulsa no ritmo de {currentCity}.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 max-w-md">
                <MetricBox 
                  label="Mérito Indiv." 
                  value={`${stats.merit.toFixed(1)}%`} 
                  weight="65%" 
                  icon={<TrendingUp size={16} />}
                />
                <MetricBox 
                  label="Associação" 
                  value={`${stats.associationForce.toFixed(1)}%`} 
                  weight="35%" 
                  icon={<ShieldCheck size={16} />}
                />
              </div>
            </div>

            {/* Circular Progress (Abstract) */}
            <div className="absolute -top-20 -right-20 size-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>
          </div>
        </section>

        {/* Seção 1: Transporte Alternativo & Fretamento */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black italic uppercase leading-none">Transporte <span className="text-[#ff751f]">Alternativo</span></h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agilidade regional e fretamento conectado</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard-viagens')}
              className="group flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest"
            >
              Acessar Malha <ArrowUpRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
               icon={<Car />} 
               title="Viagens Ativas" 
               desc="Veja operadores disponíveis para embarque imediato na BR-232." 
               tag="Agilidade"
               color="#ff751f"
               onClick={() => navigate('/dashboard-viagens')}
            />
            <FeatureCard 
               icon={<Clock />} 
               title="Fretamento" 
               desc="Agende deslocamentos coletivos ou transporte de carga fracionada." 
               tag="Logística"
               color="#3b82f6"
               onClick={() => navigate('/dashboard-viagens')}
            />
            <div className="hidden lg:block">
              <FeatureCard 
                 icon={<ShieldCheck />} 
                 title="Segurança" 
                 desc="Operadores verificados e monitoramento por KM de Influência." 
                 tag="Protocolo"
                 color="#00e676"
                 onClick={() => navigate('/fidelidade')}
              />
            </div>
          </div>
        </section>

        {/* Seção 2: Vida das Cidades */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black italic uppercase leading-none">Vida das <span className="text-primary">Cidades</span></h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Infraestrutura Operacional Urbana</p>
            </div>
            <button 
              onClick={() => navigate('/vida-cidades')}
              className="group flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest"
            >
              Ver Detalhes <ArrowUpRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col justify-between items-start gap-8 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => navigate('/vida-cidades')}>
               <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Wrench size={32} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase leading-tight">Serviços Pro</h3>
                  <p className="text-xs text-slate-400 font-medium">De encanadores a técnicos agrícolas. Visibilidade Low Cost real.</p>
               </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-[2.5rem] flex flex-col justify-between items-start gap-8 hover:from-red-500/20 transition-all cursor-pointer group" onClick={() => navigate('/vida-cidades/urgencia')}>
               <div className="size-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <Zap size={32} fill="currentColor" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase leading-tight text-red-500">Urgência 24h</h3>
                  <p className="text-xs text-slate-400 font-medium italic">SLA de resposta prioritária para problemas críticos nas cidades.</p>
               </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col justify-between items-start gap-8 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => navigate('/vida-cidades/prestadores')}>
               <div className="size-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Briefcase size={32} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase leading-tight">Painel Profissional</h3>
                  <p className="text-xs text-slate-400 font-medium">Digitalize sua oferta hoje por apenas R$ 3,00 (Low Cost).</p>
               </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por categoria, serviço ou operador..."
            className="w-full h-16 pl-16 pr-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/10"
          />
        </div>

        {/* Módulos do Ecossistema - Quick Access */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickModuleBtn 
            icon={<Store />} 
            label="A Feira" 
            onClick={() => navigate('/classificados')} 
            color="#00e676"
          />
          <QuickModuleBtn 
            icon={<ShoppingCart />} 
            label="Cesta do Lar" 
            onClick={() => navigate('/mneme')} 
            color="#ff751f"
          />
          <QuickModuleBtn 
            icon={<Wallet />} 
            label="Porta-luvas" 
            onClick={() => navigate('/fidelidade')} 
            color="#00e676"
          />
          <QuickModuleBtn 
            icon={<LayoutGrid />} 
            label="Alertas" 
            onClick={() => navigate('/alertas')} 
            color="#ff4d4d"
          />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Alertas Regionais */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                 <Bell size={14} className="text-primary" /> Incidentes na Rodovia
               </h3>
               <button onClick={() => navigate('/alertas')} className="text-[10px] font-black uppercase tracking-widest text-primary">Monitorar Mapa</button>
            </div>
            
            <div className="grid gap-4">
               {recentAlerts.map(alert => (
                 <motion.div 
                   key={alert.id}
                   whileHover={{ x: 5 }}
                   className="p-5 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between group cursor-pointer"
                 >
                   <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-2xl flex items-center justify-center ${alert.severity === 'medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                         <Navigation size={20} />
                      </div>
                      <div>
                        <h4 className="font-black italic uppercase text-sm leading-none">{alert.type}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{alert.location}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400">{alert.time} atrás</span>
                   </div>
                 </motion.div>
               ))}
            </div>

            {/* Publicidade / Marketplace Destaque */}
            <div 
               onClick={() => navigate('/classificados')}
               className="p-1 px-1 flex bg-white/5 border border-white/10 rounded-2xl sm:rounded-[2.5rem] overflow-hidden group/ad cursor-pointer hover:border-primary/30 transition-all"
            >
               <div className="flex-1 p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Oferta Local</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase leading-none">A Feira <br/> Digital.</h3>
                  <p className="text-slate-400 text-[10px] sm:text-xs italic">Negócios lindeiros verificados com descontos exclusivos no KM 80.</p>
                  <button className="flex items-center gap-2 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest py-2">
                    Explorar Marketplace <ArrowUpRight size={14} />
                  </button>
               </div>
               <div className="w-1/3 min-w-[80px] sm:min-w-[120px] bg-slate-800 relative">
                  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300" className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-[5000ms] group-hover/ad:scale-110" alt="Market" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a14] via-transparent to-transparent"></div>
               </div>
            </div>
          </div>

          {/* Lateral Stats / Geopolítica */}
          <div className="space-y-6">
             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Estrutura da Rodovia</h3>
                
                <div className="space-y-4">
                  <GeopolItem 
                    label="Tronco" 
                    city="Recife" 
                    status="Conectado" 
                    active={currentCity === 'Recife'} 
                  />
                  <GeopolItem 
                    label="Galho" 
                    city={currentCity} 
                    status="Sua Localização" 
                    active={currentCity !== 'Recife' && currentCity !== 'Serra Talhada'} 
                  />
                  <GeopolItem 
                    label="Raiz" 
                    city="Serra Talhada" 
                    status="Aspirante" 
                    active={currentCity === 'Serra Talhada'} 
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase text-slate-500 italic">KM de Influência</span>
                      <span className="text-xs font-black italic">14.2 km</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-primary"></div>
                   </div>
                </div>
             </div>

             <button 
                onClick={() => navigate('/alertas')}
                 className="w-full p-5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-3xl group transition-all"
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-black">
                        <MapPin size={22} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-black uppercase italic leading-none">Modo Co-Piloto</h4>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Navegação Segura</p>
                      </div>
                   </div>
                   <ArrowUpRight size={18} className="text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
             </button>
          </div>

        </div>
      </main>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc, tag, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/10 transition-all group cursor-pointer"
  >
     <div className="flex items-center justify-between">
        <div className="size-10 rounded-xl flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform" style={{ color }}>
           {React.cloneElement(icon, { size: 22 })}
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-full text-slate-500">{tag}</span>
     </div>
     <div>
        <h4 className="text-lg font-black italic uppercase leading-none mb-2">{title}</h4>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{desc}</p>
     </div>
  </div>
);

const QuickModuleBtn = ({ icon, label, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all hover:border-primary/30 group"
  >
    <div className="size-10 sm:size-12 rounded-xl flex items-center justify-center bg-white/5 text-primary group-hover:scale-110 transition-transform" style={{ color }}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{label}</span>
  </button>
);

const MetricBox = ({ label, value, weight, icon }: any) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1 group hover:border-primary/40 transition-colors">
    <div className="flex items-center justify-between text-slate-500">
       <span className="text-primary">{icon}</span>
       <span className="text-[8px] font-black uppercase tracking-widest">{weight}</span>
    </div>
    <div className="text-xl font-black italic leading-none pt-1 transition-transform group-hover:scale-105 origin-left">{value}</div>
    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

const GeopolItem = ({ label, city, status, active }: any) => (
  <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-primary/10 border-primary/40' : 'bg-white/5 border-white/10'}`}>
     <div className="flex items-center justify-between mb-1">
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
        {active && <div className="size-1.5 bg-primary rounded-full animate-pulse"></div>}
     </div>
     <div className="flex items-center justify-between">
        <span className="text-xs font-black italic uppercase">{city}</span>
        <span className={`text-[8px] font-bold uppercase tracking-widest ${active ? 'text-primary/70' : 'text-slate-600'}`}>{status}</span>
     </div>
  </div>
);

export default Home;
