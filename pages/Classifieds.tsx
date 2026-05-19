import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  MapPin, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Tag,
  Truck,
  Building2,
  Gem,
  Search,
  Filter,
  Plus,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'veiculos', name: 'Veículos', icon: <Truck size={14} />, color: '#ff751f' },
  { id: 'imoveis', name: 'Imóveis', icon: <Building2 size={14} />, color: '#00e676' },
  { id: 'servicos', name: 'Serviços', icon: <Zap size={14} />, color: '#00b0ff' },
  { id: 'agro', name: 'Agro & Pecuária', icon: <Gem size={14} />, color: '#ffea00' },
];

const mockAds = [
  {
    id: '1',
    title: 'Toyota Hilux 2024 - Diesel',
    price: 'R$ 295.000',
    location: 'Caruaru (Km 130)',
    category: 'Veículos',
    vibe: 'Premium',
    image: 'https://images.unsplash.com/photo-1594052065306-799f93922572?q=80&w=800&auto=format&fit=crop',
    tag: 'Destaque Malha',
    isPatrono: true,
    trustScore: 98
  },
  {
    id: '2',
    title: 'Terreno Industrial BR-232',
    price: 'Sob Consulta',
    location: 'Gravatá (Km 84)',
    category: 'Imóveis',
    vibe: 'Investimento',
    image: 'https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=800&auto=format&fit=crop',
    tag: 'Oportunidade Agro',
    isPatrono: true,
    trustScore: 94
  },
  {
    id: '3',
    title: 'Serviço de Guincho 24h',
    price: 'A partir de R$ 150',
    location: 'Bezerros (Km 107)',
    category: 'Serviços',
    vibe: 'Urgente',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop',
    tag: 'Urgência',
    isPatrono: false,
    trustScore: 82
  }
];

const Classifieds: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Tudo');

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % mockAds.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050806] text-white pb-32 overflow-x-hidden">
      {/* Floating System Menu Button */}
      <div className="fixed top-8 right-8 z-[100] flex items-center gap-3">
         <button 
           onClick={() => navigate(-1)}
           className="size-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 active:scale-95 transition-all"
         >
           <ArrowLeft size={24} />
         </button>
         <button 
           onClick={() => setIsMenuOpen(!isMenuOpen)}
           className="size-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-primary active:scale-95 transition-all"
         >
           {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-[#050806] p-8 pt-24 space-y-8 flex flex-col items-center text-center overflow-y-auto"
          >
             <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                <X size={24} />
             </button>
             
             <nav className="flex flex-col gap-6 w-full">
                <button onClick={() => { navigate('/portal'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Portal BR232</button>
                <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Central Mnēmē</button>
                <button onClick={() => { navigate('/guia-servicos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Guia de Serviços</button>
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

      {/* Cinematic Header / Search */}
      <section className="relative pt-24 pb-20 px-6 border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-20" />
        
        <div className="max-w-7xl mx-auto relative z-10 space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4 text-center md:text-left">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mx-auto md:mx-0">
                    <ShoppingBag size={12} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">A Feira Digital Regional</span>
                 </div>
                 <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none">
                    Arqueologia da <br/><span className="text-primary italic">Atração.</span>
                 </h1>
              </div>
              
              <div className="w-full md:max-w-md relative group">
                 <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search size={20} className="text-slate-500 group-focus-within:text-primary transition-colors" />
                 </div>
                 <input 
                   type="text" 
                   placeholder="O que você busca na malha?"
                   className="w-full h-16 pl-16 pr-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/50 transition-all"
                 />
              </div>
           </div>

           {/* Categorias Dinâmicas */}
           <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              <button 
                onClick={() => setSelectedCategory('Tudo')}
                className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 ${selectedCategory === 'Tudo' ? 'bg-primary text-black' : 'bg-white/5 border border-white/10 text-slate-400'}`}
              >
                 <Zap size={14} /> <span>Tudo</span>
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 ${selectedCategory === cat.name ? 'bg-primary text-black' : 'bg-white/5 border border-white/10 text-slate-400'}`}
                >
                   {cat.icon}
                   <span>{cat.name}</span>
                </button>
              ))}
           </div>
        </div>
      </section>

      {/* Super Seção de Destaque - Radar Magnético */}
      <section className="max-w-7xl mx-auto px-6 mt-16 group">
         <div className="relative aspect-[21/9] sm:aspect-[21/6] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent z-10" />
                 <img 
                   src={mockAds[activeSlide].image} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                   alt="Ad Highlight"
                 />
                 
                 <div className="absolute inset-y-0 left-0 p-12 sm:p-20 z-20 flex flex-col justify-center space-y-8 max-w-2xl">
                    <div className="flex items-center gap-3">
                       <span className="px-4 py-1.5 bg-primary/20 backdrop-blur-xl border border-primary/40 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary">
                          {mockAds[activeSlide].tag}
                       </span>
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
                          {mockAds[activeSlide].title}
                       </h2>
                       <div className="flex items-center gap-6 text-slate-400 font-bold italic">
                          <span className="flex items-center gap-1.5"><MapPin size={16} className="text-primary line-through group-hover:no-underline" /> {mockAds[activeSlide].location}</span>
                          <span className="text-white text-2xl tracking-tighter">{mockAds[activeSlide].price}</span>
                       </div>
                    </div>
                    <button className="h-16 px-10 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-primary transition-all shadow-2xl group/btn">
                       Explorar Negócio <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                 </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav Indicators */}
            <div className="absolute bottom-12 right-12 flex gap-3 z-30">
               {mockAds.map((_, i) => (
                 <button 
                   key={i}
                   onClick={() => setActiveSlide(i)}
                   className={`h-1.5 rounded-full transition-all duration-700 ${activeSlide === i ? 'bg-primary w-12' : 'bg-white/20 w-4'}`}
                 />
               ))}
            </div>
         </div>
      </section>

      {/* Feed Arqueológico */}
      <section className="max-w-7xl mx-auto px-6 mt-24 space-y-12">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-500 italic">Oportunidades em Destaque</h3>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
               <Filter size={14} /> Filtro da Malha
            </button>
         </div>

         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockAds.map(ad => (
              <motion.div 
                key={ad.id}
                whileHover={{ y: -10 }}
                className="group bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col cursor-pointer hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
              >
                 <div className="h-64 relative overflow-hidden">
                    <img src={ad.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={ad.title} />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                       <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10">
                          {ad.category}
                       </div>
                       {ad.vibe && (
                          <div className="px-3 py-1 bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg w-fit border border-primary/20">
                             Vibe: {ad.vibe}
                          </div>
                       )}
                    </div>
                    {ad.isPatrono && (
                       <div className="absolute top-6 right-6">
                          <div className="px-3 py-1.5 bg-[#ff751f] text-black text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-2xl">
                             <Building2 size={12} /> Patrono
                          </div>
                       </div>
                    )}
                 </div>
                 <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                       <div className="flex justify-between items-start">
                          <h4 className="text-2xl font-black italic uppercase leading-none tracking-tight group-hover:text-primary transition-colors">{ad.title}</h4>
                          {ad.trustScore && (
                             <div className="text-right">
                                <p className="text-[8px] font-black text-slate-500 uppercase">Trust Factor</p>
                                <p className="text-xs font-black text-primary">{ad.trustScore}%</p>
                             </div>
                          )}
                       </div>
                       <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase italic">
                          <MapPin size={12} className="text-primary" />
                          <span>{ad.location}</span>
                       </div>
                    </div>
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Valor Local</p>
                          <span className="text-xl font-black text-white italic">{ad.price}</span>
                       </div>
                       <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all rotate-3 group-hover:rotate-0">
                          <ArrowRight size={24} />
                       </div>
                    </div>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Floating CTA - Adicionar Anúncio */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => navigate('/anunciar')}
           className="h-16 px-10 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-[0_20px_50px_rgba(0,230,118,0.3)] animate-bounce-subtle"
         >
            <Plus size={20} strokeWidth={3} />
            Publicar na Malha
         </motion.button>
      </div>
    </div>
  );
};

export default Classifieds;
