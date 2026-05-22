import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  Menu, 
  X,
  LogIn, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe,
  Store,
  ShoppingCart,
  Wallet,
  Truck,
  Users,
  ChevronRight,
  ChevronLeft,
  Bike,
  Star,
  Activity,
  UserPlus,
  Crown,
  Search,
  Sparkles
} from 'lucide-react';
import SinapseBackground from '../src/components/SinapseBackground';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth < 640 ? 300 : clientWidth * 0.6;
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#05100a] text-white overflow-x-hidden selection:bg-primary selection:text-black font-sans">
      
      {/* Background Layer */}
      <SinapseBackground />
      
      {/* Background Glows (Sutil) */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto w-full px-6 flex flex-col relative z-10 pt-12">
        
        {/* Header Nav */}
        <header className="flex items-center justify-between mb-20 sm:mb-28">
          <div className="flex items-center gap-3 cursor-pointer select-none active:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 backdrop-blur-xl shrink-0">
               <img 
                 src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                 className="size-full object-contain" 
                 alt="BR232" 
                 referrerPolicy="no-referrer"
               />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase italic leading-none">ECOBR232</h1>
              <p className="text-[7px] sm:text-[8px] font-bold text-primary tracking-[0.2em] sm:tracking-[0.3em] uppercase">Eixo Capital-Sertão</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-8">
            <nav className="hidden md:flex items-center gap-8 mr-4">
              <button onClick={() => navigate('/mneme')} className="text-[9px] font-black uppercase tracking-widest text-[#ff751f] hover:text-primary transition-colors italic">Cesta</button>
              <button onClick={() => navigate('/guia-servicos')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic">Serviços</button>
              <button onClick={() => navigate('/planos')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic">Planos</button>
              <button onClick={() => navigate('/blog')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic">Blog</button>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => navigate('/registrar')}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
                >
                  <UserPlus size={14} className="shrink-0 group-hover:rotate-12 transition-transform" /> 
                  <span>Registrar</span>
                </button>
              </div>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-95 transition-all"
              >
                 {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] bg-[#05100a] md:hidden p-8 pt-32 space-y-8 flex flex-col items-center text-center overflow-y-auto"
            >
               <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                  <X size={24} />
               </button>
               
               <nav className="flex flex-col gap-6 w-full">
                  <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="text-xl font-black uppercase tracking-[0.2em] italic text-[#ff751f]">Cesta</button>
                  <button onClick={() => { navigate('/guia-servicos'); setIsMenuOpen(false); }} className="text-xl font-black uppercase tracking-[0.2em] italic text-slate-300">Serviços</button>
                  <button onClick={() => { navigate('/planos'); setIsMenuOpen(false); }} className="text-xl font-black uppercase tracking-[0.2em] italic text-slate-300">Planos</button>
                  <button onClick={() => { navigate('/blog'); setIsMenuOpen(false); }} className="text-xl font-black uppercase tracking-[0.2em] italic text-slate-300">Blog</button>
               </nav>
    
               <div className="w-full h-px bg-white/5" />
    
               <div className="flex flex-col gap-4 w-full">
                  <button 
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                    className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest italic"
                  >
                    Entrar
                  </button>
                  <button 
                    onClick={() => { navigate('/registrar'); setIsMenuOpen(false); }}
                    className="w-full h-16 rounded-2xl bg-primary text-black text-sm font-black uppercase tracking-widest"
                  >
                    Registrar Conta
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-10">
            <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00e676]"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap">Rede Geoeconomica Ativa</span>
          </div>

          <div className="max-w-4xl space-y-12">
            <h2 className="text-[clamp(2.5rem,10vw,7.5rem)] font-black tracking-tighter italic uppercase leading-[0.85] text-white">
              A Malha que <br />
              <span className="bg-gradient-to-r from-primary via-[#ff4d4d] to-primary bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,230,118,0.2)]">Pulsa Pernambuco.</span>
            </h2>

            {/* Global Search Intent - "Busca por Intenção" */}
            <div className="relative group max-w-3xl">
               <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-[#ff4d4d]/30 rounded-[1.5rem] sm:rounded-[2.2rem] lg:rounded-[2.5rem] blur opacity-75 group-focus-within:opacity-100 transition duration-1000"></div>
               <div className="relative flex flex-col sm:flex-row items-center bg-[#0a1811] border border-white/10 rounded-[1.5rem] sm:rounded-[2.2rem] p-2 sm:pr-4 shadow-2xl backdrop-blur-3xl group-focus-within:border-primary/50 transition-all gap-2 sm:gap-0">
                  <div className="hidden sm:flex size-14 lg:size-16 rounded-full bg-white/5 items-center justify-center text-primary shrink-0">
                     <Search size={24} />
                  </div>
                  <div className="sm:hidden w-full flex items-center justify-center py-2 text-primary">
                     <Search size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="O que você precisa hoje na 232?"
                    className="w-full flex-1 bg-transparent border-none text-sm sm:text-base lg:text-lg font-medium italic placeholder:text-slate-600 focus:ring-0 px-4 sm:px-6 text-center sm:text-left"
                  />
                  <button 
                    onClick={() => navigate('/classificados')}
                    className="w-full sm:w-auto h-12 sm:h-14 px-6 lg:px-8 bg-primary text-black rounded-xl sm:rounded-3xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                     Buscar Intenção
                  </button>
               </div>
            </div>

            <div className="space-y-8">
              <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-primary pl-6">
                Do <span className="text-white font-black underline decoration-primary decoration-4 underline-offset-4">Cais ao Sertão</span>. 
                Conectando residentes, donas de casa e viajantes através da BR-232 com inteligência geolocalizada.
              </p>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                <div className="flex flex-row flex-wrap sm:flex-nowrap gap-4 shrink-0">
                  <button 
                    onClick={() => navigate('/portal')}
                    className="h-16 px-10 bg-primary hover:bg-[#00c865] text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_rgba(0,230,118,0.2)] active:scale-95 group"
                  >
                    Abrir Portal <ArrowRight strokeWidth={3} size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button 
                    onClick={() => navigate('/mneme')}
                    className="h-16 px-10 bg-[#ff751f] hover:bg-[#ff8a3d] text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,117,31,0.2)]"
                  >
                    Acessar Mnēmē <ShoppingCart size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row lg:gap-4 lg:flex-1">
                  <div className="h-20 lg:h-16 px-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex flex-col justify-center group hover:border-primary/40 transition-colors lg:flex-1 lg:min-w-[150px]">
                     <div className="text-2xl font-black italic text-primary leading-none group-hover:scale-110 transition-transform origin-left">500+</div>
                     <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">KM Cobertos</div>
                  </div>
                  <div className="h-20 lg:h-16 px-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex flex-col justify-center group hover:border-primary/40 transition-colors lg:flex-1 lg:min-w-[150px]">
                     <div className="text-2xl font-black italic text-primary leading-none group-hover:scale-110 transition-transform origin-left">24h</div>
                     <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Operação</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modules Section - "O que faz o usuário se apaixonar" */}
        <section className="mb-32">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Estrutura do Ecossistema</h3>
            <h4 className="text-3xl sm:text-5xl font-black italic leading-none uppercase tracking-tighter">Potencializamos a Rodovia.</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModuleCard 
              icon={<Store />} 
              title="A Feira" 
              tag="Marketplace"
              desc="Digitalização de negócios lindeiros. Onde o comércio local encontra visibilidade global."
              color="#00e676"
              onClick={() => navigate('/classificados')}
            />
            <ModuleCard 
              icon={<ShoppingCart />} 
              title="Mnēmē" 
              tag="Gestão"
              desc="Lista de compras inteligente e gestão de suprimentos integrada ao ecossistema regional."
              color="#ff751f"
              onClick={() => navigate('/mneme')}
            />
            <ModuleCard 
              icon={<Wallet />} 
              title="Porta-luvas" 
              tag="Fidelidade"
              desc="Sistema de tickets de parada e fidelidade com validação via QR Code e Geofencing."
              color="#00e676"
              onClick={() => navigate('/fidelidade')}
            />
            <ModuleCard 
              icon={<Truck />} 
              title="Multimodal" 
              tag="Logística"
              desc="Conexão direta com moto-taxistas e associações de transporte em toda a rede."
              color="#ff751f"
              onClick={() => navigate('/moto-taxi')}
            />
          </div>
        </section>

        {/* Novas Seções de Acesso Rápido - Malha Ativa */}
        <section className="mb-32 grid md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/dashboard-viagens')}
            className="relative p-8 sm:p-12 bg-[#0c1a14] border border-white/5 rounded-[3rem] overflow-hidden cursor-pointer group"
          >
             <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff751f]/5 blur-3xl -mr-24 -mt-24 group-hover:bg-[#ff751f]/10 transition-colors"></div>
             <div className="relative z-10 space-y-8">
                <div className="size-20 rounded-3xl bg-[#ff751f]/10 border border-[#ff751f]/20 flex items-center justify-center text-[#ff751f] shadow-[0_0_30px_rgba(255,117,31,0.1)]">
                   <Truck size={48} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl sm:text-[2.5rem] font-black italic uppercase leading-tight tracking-tighter">Transporte <br/><span className="text-[#ff751f]">Alternativo</span></h3>
                   <p className="text-slate-400 font-medium italic text-lg leading-relaxed max-w-sm">Acesse a malha de fretamento e deslocamento regional agilizado.</p>
                </div>
                <div className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#ff751f] group-hover:translate-x-2 transition-transform">
                   Entrar na Malha <ArrowRight size={16} strokeWidth={3} />
                </div>
             </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/vida-cidades')}
            className="relative p-8 sm:p-12 bg-[#0c1a14] border border-white/5 rounded-[3rem] overflow-hidden cursor-pointer group"
          >
             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl -mr-24 -mt-24 group-hover:bg-primary/10 transition-colors"></div>
             <div className="relative z-10 space-y-8">
                <div className="size-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(0,230,118,0.1)]">
                   <Globe size={48} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl sm:text-[2.5rem] font-black italic uppercase leading-tight tracking-tighter">Vida nas <br/><span className="text-primary">Cidades</span></h3>
                   <p className="text-slate-400 font-medium italic text-lg leading-relaxed max-w-sm">Infraestrutura operacional e serviços de proximidade para o dia a dia.</p>
                </div>
                <div className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-primary group-hover:translate-x-2 transition-transform">
                   Acessar Vida nas Cidades <ArrowRight size={16} strokeWidth={3} />
                </div>
             </div>
          </motion.div>
        </section>

        {/* Radar de Atração (Carrossel Magnético) */}
        <section className="mb-32 space-y-12 relative z-20">
           <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 rounded-full">
                    <Sparkles size={12} className="text-[#ff4d4d] animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#ff4d4d]">Rubi Sunrise: Atração do Dia</span>
                 </div>
                 <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
                    Arqueologia da <br/><span className="bg-gradient-to-r from-primary to-[#ff4d4d] bg-clip-text text-transparent tracking-tighter">Atração Regional.</span>
                 </h2>
              </div>
              <button 
                onClick={() => navigate('/classificados')}
                className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all"
              >
                 Explorar Todos os Negócios <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-[3rem] space-y-8">
                 <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary italic">Sua Cidade, Seu Radar</h4>
                    <p className="text-sm font-medium italic text-slate-400">Oportunidades lindeiras filtradas pela sua intenção.</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4">
                       <MapPin size={20} className="text-[#ff4d4d]" />
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-500">Localização</p>
                          <p className="text-xs font-bold italic">Gravatá (Km 84)</p>
                       </div>
                    </div>
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4">
                       <Zap size={20} className="text-primary" />
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-500">Vibe Ativa</p>
                          <p className="text-xs font-bold italic">Cotidiano / Família</p>
                       </div>
                    </div>
                 </div>
                 
                 <button 
                    onClick={() => navigate('/classificados')}
                    className="w-full py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                 >
                    Customizar Radar
                 </button>
              </div>

              {/* O Carrossel de Destaques Magnéticos */}
              <div className="lg:col-span-3 min-h-[400px] relative group/carousel">
                 {/* Floating Left Button */}
                 <button 
                    onClick={() => scroll('left')}
                    className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all shadow-xl active:scale-90 opacity-90 sm:opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 lg:hidden"
                    aria-label="Anterior"
                 >
                    <ChevronLeft size={24} />
                 </button>

                 <div 
                    ref={carouselRef}
                    className="flex lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 snap-x snap-mandatory no-scrollbar scroll-smooth"
                 >
                    {[
                      { 
                        title: "Reserva das Palmeiras", 
                        price: "R$ 450.000", 
                        loc: "Gravatá (Km 84)", 
                        img: "https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=600",
                        tag: "Imóveis",
                        vibe: "Premium",
                        isPatrono: true
                      },
                      { 
                        title: "Especialista Diesel", 
                        price: "Orçamento Local", 
                        loc: "Caruaru (Km 135)", 
                        img: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=600",
                        tag: "Serviços",
                        vibe: "Urgente",
                        isPatrono: true
                      },
                      { 
                        title: "S10 High Country", 
                        price: "R$ 210.000", 
                        loc: "Bezerros (Km 107)", 
                        img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=600",
                        tag: "Veículos",
                        vibe: "Premium",
                        isPatrono: false
                      },
                      { 
                        title: "Alteza Stilettos", 
                        price: "A partir de R$ 380", 
                        loc: "Pesqueira (Km 215)", 
                        img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600",
                        tag: "Moda",
                        vibe: "Premium",
                        isPatrono: true
                      }
                    ].map((ad, i) => (
                       <motion.div 
                         key={i}
                         whileHover={{ scale: 0.98, y: -5 }}
                         onClick={() => navigate('/classificados')}
                         className="min-w-[280px] sm:min-w-[340px] lg:min-w-0 w-full aspect-[4/5] bg-[#0a1811] rounded-[2.5rem] overflow-hidden border border-white/5 snap-center relative cursor-pointer group shadow-2xl"
                       >
                          <img src={ad.img} className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-90 transition-all duration-1000 group-hover:scale-110" alt={ad.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          
                          <div className="absolute top-6 left-6 flex flex-col gap-2">
                             <span className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-lg w-fit">
                                {ad.tag}
                             </span>
                             <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg w-fit">
                                Classificação: {ad.vibe}
                             </span>
                          </div>

                          {ad.isPatrono && (
                             <div className="absolute top-6 right-6">
                                <div className="px-3 py-1.5 bg-[#ff751f] text-black text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-[0_10px_20px_rgba(255,117,31,0.3)]">
                                   <Crown size={12} /> Patrono
                                </div>
                             </div>
                          )}
   
                          <div className="absolute bottom-8 left-8 right-8 space-y-4">
                             <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic uppercase">
                                   <MapPin size={12} className="text-primary" /> {ad.loc}
                                </div>
                                <h4 className="text-2xl font-black italic uppercase leading-none tracking-tighter group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">{ad.title}</h4>
                             </div>
                             <div className="flex items-center justify-between">
                                <p className="text-xl font-black italic text-primary">{ad.price}</p>
                                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                   <ArrowRight size={20} />
                                </div>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                  </div>

                  {/* Floating Right Button */}
                  <button 
                     onClick={() => scroll('right')}
                     className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all shadow-xl active:scale-90 opacity-90 sm:opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 lg:hidden"
                     aria-label="Próximo"
                  >
                     <ChevronRight size={24} />
                  </button>
              </div>
           </div>
        </section>

        {/* CTA Patronos - Engenharia de Valor */}
        <section className="mb-32 relative group cursor-pointer" onClick={() => navigate('/planos')}>
           <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent blur-[120px] rounded-[4rem] group-hover:opacity-40 transition-opacity"></div>
           <motion.div 
             whileHover={{ y: -10 }}
             className="relative p-10 sm:p-16 border border-primary/20 bg-black/60 backdrop-blur-3xl rounded-[4rem] overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-12 text-primary/5 -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-1000">
                 <Crown size={280} />
              </div>

              <div className="max-w-2xl relative z-10 space-y-8">
                 <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                    <ShieldCheck size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Engenharia de Valor</span>
                 </div>
                 <div className="space-y-4">
                    <h2 className="text-4xl sm:text-6xl font-black italic uppercase leading-none tracking-tighter">
                       Acelere sua marca na <br/><span className="text-primary tracking-tighter">Maior Malha</span> do Interior.
                    </h2>
                    <p className="text-slate-400 font-medium italic text-base sm:text-xl leading-relaxed">
                       Seja um Patrono Ouro, Prata ou Bronze. Domine sua cidade, conquiste o radar e aumente seu Índice de Pertencimento (IP).
                    </p>
                 </div>
                 <button className="h-16 px-12 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-primary transition-colors hover:scale-105 duration-300">
                    Ver Tabela de Impacto <ArrowRight size={20} />
                 </button>
              </div>
           </motion.div>
        </section>

        {/* Moto-Taxi Elite Section - O Ativo Mais Forte */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              {/* Mock de Perfil de Prestador Elite */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="p-8 sm:p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-2xl relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16"></div>
                
                <div className="absolute top-6 right-6 px-4 py-2 bg-primary text-black font-black italic uppercase text-[10px] rounded-full shadow-[0_10px_30px_#00e676] flex items-center gap-2">
                  <Star size={12} fill="currentColor" /> Top 1 RANKING
                </div>
                
                <div className="flex items-center gap-6 mb-10">
                  <div className="relative size-20 sm:size-24 rounded-full p-1 border-2 border-primary/30">
                    <div className="size-full rounded-full bg-slate-900 flex items-center justify-center text-primary overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop" className="size-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Beto do Grau" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 size-8 bg-black border border-white/10 rounded-full flex items-center justify-center text-primary">
                      <ShieldCheck size={20} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-black italic uppercase leading-none mb-2">Beto do Grau</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} size={10} className="text-primary" fill="currentColor" />)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gravatá • KM 80</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                    <div className="text-2xl font-black text-primary">2.4k</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Corridas</div>
                  </div>
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                     <div className="text-2xl font-black text-primary">98%</div>
                     <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Taxas Estáveis</div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <Activity size={12} className="text-primary" />
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Índice de Pertencimento (IP)</span>
                      </div>
                      <span className="text-[12px] font-black italic text-primary">98.5%</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '98.5%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full shadow-[0_0_10px_#00e676]"
                      />
                   </div>
                   <p className="text-[8px] font-medium text-slate-600 italic text-center uppercase tracking-widest font-sans">Métrica auditada em tempo real pela malha geoeconômica</p>
                </div>
              </motion.div>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -left-10 size-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                  <Bike size={14} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Ativo de Conectividade</span>
                </div>
                <h4 className="text-4xl sm:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter">
                  Moto-Táxi <br />
                  <span className="text-primary drop-shadow-[0_0_30px_rgba(0,230,118,0.2)]">Elite.</span>
                </h4>
                <p className="text-slate-400 font-medium italic text-lg leading-relaxed border-l-4 border-primary pl-6">
                  O módulo mais dinâmico da rodovia. Não é apenas transporte; é uma <span className="text-white font-bold underline decoration-primary/30">Relação de Confiança Auditada</span> entre prestadores qualificados e usuários protegidos.
                </p>
              </div>

              <div className="space-y-6">
                <BenefitItem 
                  title="Protocolo de Discrição" 
                  desc="Postura ética e silêncio operacional como métricas mandatórias. O prestador elite é invisível no barulho e presente no serviço." 
                  color="#00e676"
                />
                <BenefitItem 
                  title="SafetyGuard Integrado" 
                  desc="Toda corrida é monitorada. Excesso de velocidade ou desvio de rota impacta instantaneamente o IP do profissional." 
                  color="#00e676"
                />
                <BenefitItem 
                  title="Justiça Geopolítica" 
                  desc="Prioridade lógica para associações locais. Fortalecemos o Tronco, os Galhos e as Raízes da nossa economia regional." 
                  color="#00e676"
                />
              </div>

              <div className="pt-4">
                 <button 
                    onClick={() => navigate('/moto-taxi')}
                    className="px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase text-xs transition-all flex items-center gap-4 group"
                 >
                    Ver Ranking de Mérito <ChevronRight size={18} className="text-primary group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Association Force Section - A Diretriz Geoeconômica de Interação Coletiva */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Justiça Geopolítica</h3>
              <h4 className="text-4xl sm:text-6xl font-black italic leading-[0.9] uppercase tracking-tighter">
                A Força da <br /> <span className="text-primary underline decoration-4 underline-offset-8">Associação.</span>
              </h4>
              <p className="text-slate-400 font-medium italic text-lg leading-relaxed pt-2">
                Ninguém prospera sozinho na rodovia. O Ecossistema privilegia entidades organizadas que elevam o padrão de serviço no Tronco, nos Galhos e nas Raízes de Pernambuco.
              </p>
            </div>
            <div className="flex items-center gap-4 text-slate-500 border border-white/10 p-6 rounded-3xl bg-white/2 backdrop-blur-xl">
               <div className="text-center px-4">
                 <div className="text-2xl font-black italic text-white">35%</div>
                 <div className="text-[8px] font-bold uppercase tracking-widest mt-1">Peso do IP Coletivo</div>
               </div>
               <div className="w-px h-10 bg-white/10"></div>
               <div className="px-4">
                 <p className="text-[9px] font-medium italic leading-tight">Métrica auditada que bonifica credenciados de associações verificadas.</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <AssociationCard 
               name="Moto-Elite Gravatá" 
               city="Gravatá • KM 80" 
               members="42" 
               ip="94.5" 
               category="TRANSPORTE"
             />
             <AssociationCard 
               name="Lindeiros do Agreste" 
               city="Bezerros • KM 102" 
               members="86" 
               ip="89.2" 
               category="COMÉRCIO"
             />
             <div className="p-8 border-2 border-dashed border-white/5 rounded-[2.8rem] flex flex-col items-center justify-center text-center space-y-6 group hover:border-primary/20 transition-all">
                <div className="size-16 rounded-full bg-white/5 flex items-center justify-center text-slate-700 group-hover:text-primary/50 transition-colors">
                  <UserPlus size={32} />
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-black uppercase italic">Sua Associação Aqui</h5>
                  <p className="text-[10px] text-slate-500 font-medium italic px-6">Traga sua base para o Ecossistema e potencialize o IP dos seus credenciados.</p>
                </div>
                <button 
                  onClick={() => navigate('/registro')}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  Iniciar Registro Único
                </button>
             </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="mb-32 p-8 sm:p-16 bg-gradient-to-br from-[#0c1a14] to-transparent rounded-[3rem] border border-white/5 overflow-hidden relative group">
           <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-4xl sm:text-6xl font-black italic uppercase leading-[0.9] tracking-tighter">
                  Pertencer é o Maior <span className="text-primary">Ativo.</span>
                </h3>
                <p className="text-slate-400 font-medium italic">
                  Nosso Índice de Pertencimento (IP) não é apenas um número, é o reflexo da sua força na malha. Mérito e Associação em equilíbrio canônico.
                </p>
                <div className="flex items-center gap-6">
                   <div className="text-center">
                      <div className="text-2xl font-black italic">65%</div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Mérito Individual</div>
                   </div>
                   <div className="w-px h-10 bg-white/10"></div>
                   <div className="text-center">
                      <div className="text-2xl font-black italic">35%</div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Força da Associação</div>
                   </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative size-40 sm:size-64">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse"></div>
                   <div className="absolute inset-4 border-2 border-primary/20 rounded-full flex items-center justify-center">
                      <Users size={64} className="text-primary" />
                   </div>
                   <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 bg-primary rounded-full shadow-[0_0_15px_#00e676]"></div>
                   </div>
                </div>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="pb-16 border-t border-white/5">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 pt-16">
            <div className="col-span-1 lg:col-span-2 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-center">
                    <img 
                      src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-5.png?alt=media&token=5992da35-1f53-47bd-b66e-4a4338b450cf" 
                      className="h-10 w-auto object-contain"
                      alt="ECOBR232 Logo"
                      referrerPolicy="no-referrer"
                    />
                  </div>
               </div>
               <p className="text-sm text-slate-500 font-medium italic max-w-sm">
                 ECOBR232 - Conectando Pernambuco. A primeira malha geoeconômica dedicada ao desenvolvimento do Eixo Capital-Sertão.
               </p>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Navegação</h5>
              <div className="flex flex-col gap-3">
                 <FooterLink href="/portal" text="Portal Principal" />
                 <FooterLink href="/dashboard" text="Painel do Usuário" />
                 <FooterLink href="/patronos" text="Fale com um Patrono" />
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Institucional</h5>
              <div className="flex flex-col gap-3">
                 <FooterLink href="/politica-de-privacidade" text="Privacidade" external />
                 <FooterLink href="/termos-uso" text="Termos de Uso" external />
                 <FooterLink href="/central-legal" text="Central Legal" />
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Operação Nominal</span>
              </div>
              <div className="h-4 w-px bg-white/10"></div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">© 2026 ECOBR232 - Malha Geoeconômica da BR-232</p>
            </div>
            <div className="flex gap-4">
               <FeatureItem icon={<ShieldCheck size={14} />} text="Build Sucesso" />
               <FeatureItem icon={<Globe size={14} />} text="Eixo Capital Sertão" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const AssociationCard = ({ name, city, members, ip, category }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-6 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>
    
    <div className="flex items-center justify-between">
      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Users size={24} />
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black text-primary uppercase tracking-widest">{category}</div>
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{city}</div>
      </div>
    </div>

    <div>
      <h5 className="text-lg font-black italic uppercase italic leading-none mb-2">{name}</h5>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xl font-black italic">{members}</div>
          <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Operadores Credenciados</div>
        </div>
        <div>
          <div className="text-xl font-black italic text-primary">{ip}%</div>
          <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">IP Coletivo</div>
        </div>
      </div>
    </div>

    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <div className="h-full bg-primary/30" style={{ width: `${ip}%` }}></div>
    </div>
  </motion.div>
);

const ModuleCard = ({ icon, title, tag, desc, color, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-6 group hover:bg-white/10 transition-all cursor-pointer"
  >
    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500" style={{ color }}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-black italic uppercase leading-none">{title}</h4>
        <span className="text-[8px] font-black uppercase tracking-widest py-1 px-2 bg-white/5 rounded-full text-slate-500">{tag}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium italic leading-relaxed">{desc}</p>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors animate-pulse"
    >
      Saiba Mais <ChevronRight size={12} />
    </button>
  </motion.div>
);

const BenefitItem = ({ title, desc, color }: any) => (
  <motion.div 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    className="flex gap-4 group"
  >
    <div className="mt-1 size-2 rounded-full bg-primary shadow-[0_0_8px_#00e676] group-hover:scale-125 transition-transform" />
    <div className="space-y-1">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-white">{title}</h5>
      <p className="text-xs text-slate-500 font-medium italic leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const FooterLink = ({ href, text, external }: any) => {
  const navigate = useNavigate();
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">{text}</a>;
  return <button onClick={() => navigate(href)} className="text-xs font-bold text-slate-500 hover:text-white transition-colors text-left">{text}</button>;
};

const FeatureItem = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-slate-600">
    <span className="text-primary/50">{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{text}</span>
  </div>
);

export default Welcome;

