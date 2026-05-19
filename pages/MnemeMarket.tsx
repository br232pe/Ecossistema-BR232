import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowLeft, 
  ShoppingCart, 
  MapPin, 
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MnemeMarket: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const priceAlerts = [
    { city: 'Gravatá', item: 'Arroz 5kg', price: 'R$ 24,90', change: '-12%', trend: 'down' },
    { city: 'Caruaru', item: 'Óleo de Soja', price: 'R$ 6,50', change: '-5%', trend: 'down' },
    { city: 'Vitória', item: 'Feijão Carioca', price: 'R$ 8,20', change: '+2%', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
       {/* Header */}
       <header className="px-6 pt-12 pb-20 relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
          <div className="max-w-6xl mx-auto space-y-8 relative z-10">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <button onClick={() => navigate('/mneme')} className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <ArrowLeft size={24} />
                   </button>
                   <button 
                     onClick={() => setIsMenuOpen(!isMenuOpen)}
                     className="lg:hidden size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-95 transition-all"
                   >
                     {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                   </button>
                </div>
                <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Auditoria Ativa</span>
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
                   className="fixed inset-0 z-[100] bg-[#05100a] lg:hidden p-8 pt-24 space-y-8 flex flex-col items-center text-center overflow-y-auto"
                 >
                    <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                       <X size={24} />
                    </button>
                    
                    <nav className="flex flex-col gap-6 w-full">
                       <button onClick={() => { navigate('/portal'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Portal BR232</button>
                       <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Central Mnēmē</button>
                       <button onClick={() => { navigate('/mneme/dashboard'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-[#ff751f]/10 border border-[#ff751f]/20 text-lg font-black uppercase tracking-[0.2em] italic text-[#ff751f]">Dashboard Mnēmē</button>
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

             <div className="space-y-4">
                <h1 className="text-5xl font-black italic uppercase italic tracking-tighter leading-none">Consultor de <br/><span className="text-primary italic">Gôndola.</span></h1>
                <p className="text-slate-400 font-medium italic max-w-lg">Arqueologia de preços em tempo real nos Patronos da BR-232. A inteligência de mercado no seu bolso.</p>
             </div>

             {/* Search */}
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Pesquisar preço na malha..."
                  className="w-full h-16 pl-16 pr-6 bg-black/40 border border-white/10 rounded-3xl text-sm font-medium focus:outline-none focus:border-primary/40 transition-all shadow-2xl"
                />
             </div>
          </div>
       </header>

       <main className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 space-y-12">
          
          {/* Radar Section */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic">Radar de Baixa (Ofertas)</h3>
                <TrendingUp size={16} className="text-primary" />
             </div>

             <div className="grid gap-4">
                {priceAlerts.map((alert, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 0.99, x: 5 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-white/[0.08]"
                  >
                     <div className="flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-primary">
                           <ShoppingCart size={24} />
                        </div>
                        <div>
                           <h4 className="text-lg font-black italic uppercase italic leading-none">{alert.item}</h4>
                           <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold italic text-slate-500 uppercase">
                              <MapPin size={10} className="text-primary" />
                              <span>{alert.city} (Km 84)</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xl font-black italic text-white leading-none">{alert.price}</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${alert.trend === 'down' ? 'text-primary' : 'text-orange-500'}`}>
                           {alert.change}
                        </span>
                     </div>
                  </motion.div>
                ))}
             </div>
          </section>

          {/* Integration with A Feira */}
          <section className="p-10 bg-gradient-to-br from-[#ff751f]/20 via-black to-black border border-[#ff751f]/30 rounded-[3rem] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 text-[#ff751f]/5 -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700">
                <Zap size={240} />
             </div>
             <div className="relative z-10 space-y-6 max-w-md">
                <div className="space-y-2">
                   <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">Diálogo com <br/><span className="text-[#ff751f] tracking-tighter">A Feira.</span></h3>
                   <p className="text-slate-400 font-medium italic text-sm leading-relaxed">
                      Transforme sua lista do Mnēmē em pedidos diretos nos Patronos de cada cidade. Logística reversa de alta performance.
                   </p>
                </div>
                <button 
                  onClick={() => navigate('/guia-servicos')}
                  className="h-14 px-8 bg-[#ff751f] text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
                >
                   Ir para A Feira <ArrowRight size={18} />
                </button>
             </div>
          </section>

          {/* Placeholder for future mapping */}
          <div className="py-20 text-center space-y-4">
             <Sparkles size={32} className="mx-auto text-slate-800" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic font-medium">Expandindo Malha de Preços...</p>
          </div>
       </main>
    </div>
  );
};

export default MnemeMarket;
