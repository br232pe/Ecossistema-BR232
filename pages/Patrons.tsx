import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Zap, 
  Search, 
  Filter,
  ArrowUpRight,
  TrendingUp,
  Award,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { CityType } from '../src/types';
import { useNavigate } from 'react-router-dom';

const Patrons: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const patrons = [
    { 
      id: '1', 
      name: 'Posto do Sertão', 
      category: 'Combustível', 
      city: 'Serra Talhada', 
      type: CityType.RAIZ, 
      influence: 450, 
      rating: 4.9, 
      isVerified: true,
      image: "https://images.unsplash.com/photo-1545459720-aac273a2778a?auto=format&fit=crop&q=80&w=400"
    },
    { 
      id: '2', 
      name: 'Churrascaria do Gaucho', 
      category: 'Gastronomia', 
      city: 'Arcoverde', 
      type: CityType.GALHO, 
      influence: 280, 
      rating: 4.7, 
      isVerified: true,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400"
    },
    { 
      id: '3', 
      name: 'Hotel Central', 
      category: 'Hotelaria', 
      city: 'Gravatá', 
      type: CityType.GALHO, 
      influence: 310, 
      rating: 4.8, 
      isVerified: true,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400"
    },
  ];

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
              <p className="text-[8px] font-bold text-primary tracking-widest uppercase mt-1">Conectado: Gravatá</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <nav className="hidden lg:flex items-center gap-6 mr-4">
                 <button onClick={() => navigate('/mneme')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Cesta</button>
                 <button onClick={() => navigate('/guia-servicos')} className="text-[9px] font-black uppercase tracking-widest text-[#00e676] hover:text-primary transition-colors italic px-2 py-1">Serviços</button>
                 <button onClick={() => navigate('/planos')} className="text-[9px] font-black uppercase tracking-widest text-[#00e676] hover:text-primary transition-colors italic px-2 py-1 font-black">Planos</button>
                 <button onClick={() => navigate('/blog')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Blog</button>
             </nav>
             
             <div className="hidden sm:flex items-center gap-3">
                <button 
                   onClick={() => navigate('/dashboard')}
                   className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-all"
                >
                   Meu Painel
                </button>
             </div>

             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-95 transition-all"
             >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>
      </header>

      {/* Header */}
      <div className="absolute top-24 right-6 z-20">
         <button 
           onClick={() => navigate('/patronos/registrar')}
           className="h-12 px-6 bg-primary text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform"
         >
           <Plus size={16} /> Seja um Patrono
         </button>
      </div>
      
      <div className="relative h-[300px] overflow-hidden flex flex-col items-center justify-center text-center px-6 border-b border-white/5">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -top-40 pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <Award size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Rede de Patronos Verificados</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            Patronos <br/><span className="text-primary italic">da BR-232</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium italic max-w-xl mx-auto">
            A elite do comércio regional conectada por KMs de influência e excelência em serviços.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar patrono pelo nome ou cidade..."
              className="w-full h-16 pl-16 pr-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="h-16 px-8 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest">
            <Filter size={18} /> Filtrar Por Tipo
          </button>
        </div>

        {/* Featured Patron Card */}
        <section className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic pb-2 border-b border-white/5">Destaque da Quinzena</h3>
           <div className="relative rounded-[3rem] overflow-hidden border border-primary/30 group cursor-pointer bg-[#0c1a14]">
              <div className="grid md:grid-cols-2">
                 <div className="p-10 space-y-6 flex flex-col justify-center">
                    <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-black shadow-[0_10px_30px_rgba(0,230,118,0.3)]">
                       <Zap size={32} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black tracking-widest uppercase text-primary">Nível Factor</span>
                         <div className="h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-primary animate-pulse"></div>
                         </div>
                      </div>
                      <h2 className="text-4xl font-black italic uppercase leading-tight">Posto do Sertão <br/><span className="text-slate-500">Unidade Arcoverde</span></h2>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Influência</span>
                          <span className="text-2xl font-black italic">450 KM</span>
                       </div>
                       <div className="w-px h-10 bg-white/10"></div>
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Avaliação</span>
                          <div className="flex items-center gap-1">
                             <span className="text-2xl font-black italic text-primary">4.9</span>
                             <Star size={16} fill="currentColor" className="text-primary mb-1" />
                          </div>
                       </div>
                    </div>
                    <button className="h-14 px-8 bg-primary hover:bg-primary-dark text-black rounded-2xl font-black uppercase text-xs transition-all w-fit flex items-center gap-3">
                       Ver Perfil Completo <ArrowUpRight size={18} />
                    </button>
                 </div>
                 <div className="relative min-h-[400px]">
                    <img 
                      src="https://images.unsplash.com/photo-1545459720-aac273a2778a?auto=format&fit=crop&q=80&w=1000" 
                      className="absolute inset-0 w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-[5000ms]"
                      alt="Featured Patron"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a14] via-transparent to-transparent"></div>
                 </div>
              </div>
           </div>
        </section>

        {/* Patrons Grid */}
        <section className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic">Rede de Parceiros</h3>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                 <button className="text-primary">Recentes</button>
                 <button className="text-slate-500 hover:text-white transition-colors">Mais Influentes</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patrons.map((patron) => (
                <PatronCard key={patron.id} patron={patron} />
              ))}
           </div>
        </section>
      </main>

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

               <nav className="flex flex-col gap-6 w-full">
                  <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-[#ff751f]/10 border border-[#ff751f]/20 text-lg font-black uppercase tracking-[0.2em] italic text-[#ff751f]">Cesta do Lar</button>
                  <button onClick={() => { navigate('/guia-servicos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Guia de Serviços</button>
                  <button onClick={() => { navigate('/planos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-primary/10 border border-primary/20 text-lg font-black uppercase tracking-[0.2em] italic text-primary">Planos & Patronos</button>
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
    </div>
  );
};

const PatronCard = ({ patron }: any) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:border-primary/30 transition-all shadow-xl"
  >
    <div className="relative h-48">
       <img src={patron.image} className="absolute inset-0 w-full h-full object-cover brightness-[0.7] group-hover:scale-110 transition-transform duration-500" alt={patron.name} />
       <div className="absolute top-4 left-4 p-2 px-3 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
          <MapPin size={12} className="text-primary" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white">{patron.city}</span>
       </div>
       {patron.isVerified && (
         <div className="absolute top-4 right-4 size-8 bg-primary rounded-full flex items-center justify-center text-black shadow-lg">
            <ShieldCheck size={18} />
         </div>
       )}
       <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05100a] to-transparent"></div>
    </div>
    <div className="p-6 pt-2 space-y-4 relative">
       <div>
         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/80">{patron.category}</span>
         <h4 className="text-xl font-black italic uppercase leading-none mt-1">{patron.name}</h4>
       </div>
       
       <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
             <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest">Influência</span>
             <span className="text-sm font-black italic">{patron.influence} KM</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest">Ranking</span>
             <div className="flex items-center gap-1">
                <Star size={12} fill="currentColor" className="text-primary" />
                <span className="text-sm font-black italic">{patron.rating}</span>
             </div>
          </div>
       </div>
       
       <button className="w-full py-4 bg-white/5 group-hover:bg-primary group-hover:text-black transition-all rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          Ver Unidade <ArrowUpRight size={14} />
       </button>
    </div>
  </motion.div>
);

export default Patrons;
