import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Lock, 
  Zap, 
  Download, 
  BrainCircuit,
  ShoppingBag,
  Target,
  ArrowUpRight,
  Menu,
  X,
  Users
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { mnemeService } from '../src/services/mnemeService';
import { useAuth } from '../src/contexts/AuthContext';
import { MnemeList } from '../src/types';

const COLORS = ['#ff751f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MnemeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lists, setLists] = useState<MnemeList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = mnemeService.subscribeToLists(user.uid, user.email, (data: MnemeList[]) => {
      setLists(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Mock data for charts while history is building
  const spendHistory = [
    { month: 'Jan', value: 1200, economy: 150 },
    { month: 'Fev', value: 1100, economy: 120 },
    { month: 'Mar', value: 1400, economy: 200 },
    { month: 'Abr', value: 1350, economy: 180 },
    { month: 'Mai', value: 1280, economy: 210 },
  ];

  const categoryData = [
    { name: 'Hortifruti', value: 45 },
    { name: 'Mercearia', value: 30 },
    { name: 'Carnes', value: 15 },
    { name: 'Limpeza', value: 10 },
  ];

  const totalSpent = lists.filter(l => l.status === 'archived').reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);
  const activeLists = lists.filter(l => l.status !== 'archived').length;

  const ProFeature: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <div className="relative group overflow-hidden">
       <div className="absolute inset-0 bg-[#0a1811]/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center border border-white/5 rounded-[2rem]">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
             <Lock size={18} />
          </div>
          <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Mnēmē PRO</h5>
          <h4 className="text-sm font-black italic uppercase italic tracking-tighter text-white mb-2">{title}</h4>
          <p className="text-[9px] font-bold text-slate-500 uppercase leading-none opacity-0 group-hover:opacity-100 transition-opacity">
             {desc}
          </p>
       </div>
       <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 grayscale">
          <div className="h-24 w-full bg-slate-900/50 rounded-xl animate-pulse" />
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      <header className="p-8 pb-32 bg-gradient-to-b from-[#ff751f]/10 to-transparent relative overflow-hidden">
        <div className="flex items-center justify-between mb-12 relative z-20">
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
           <div className="text-right">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Dashboard</h2>
              <p className="text-2xl font-black italic uppercase italic tracking-tighter">Gestão Consolidada</p>
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

        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem]">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                 <ShoppingBag size={20} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Auditado</p>
              <h3 className="text-2xl font-black italic tracking-tighter">R$ {totalSpent.toFixed(2)}</h3>
           </div>
           <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem]">
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                 <TrendingDown size={20} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Economia Regional</p>
              <h3 className="text-2xl font-black italic tracking-tighter text-blue-400">R$ 412,50</h3>
           </div>
        </div>
      </header>

      <main className="px-6 -mt-20 space-y-8">
        
        {/* Gráfico de Tendência (Free) */}
        <div className="p-8 bg-[#050e09] border border-white/5 rounded-[3rem] shadow-2xl space-y-8">
           <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-sm font-black italic uppercase italic tracking-tighter">Nutribilidade Histórica</h4>
                 <p className="text-[8px] font-black text-slate-500 uppercase">Economia vs Investimento Mensal</p>
              </div>
              <BarChart3 size={20} className="text-slate-700" />
           </div>

           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={spendHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#475569' }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a1811', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                      itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ff751f" 
                      strokeWidth={4} 
                      dot={{ fill: '#ff751f', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="economy" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Distribuição por Categoria */}
        <div className="grid md:grid-cols-2 gap-6">
           <div className="p-8 bg-black/20 border border-white/5 rounded-[3rem] items-center flex flex-col justify-center">
              <div className="text-center mb-6">
                 <h4 className="text-sm font-black italic uppercase italic tracking-tighter">Market Share Familiar</h4>
                 <p className="text-[8px] font-black text-slate-500 uppercase">Distribuição por Categoria</p>
              </div>
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={categoryData}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                 {categoryData.map((c, i) => (
                   <div key={i} className="flex items-center gap-2">
                      <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-[8px] font-black uppercase text-slate-400">{c.name}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-black/20 border border-white/5 rounded-[3rem] space-y-6">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Target size={20} />
                 </div>
                 <h4 className="text-sm font-black italic uppercase italic tracking-tighter">Metas de Consumo</h4>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objetivo Saudável</p>
                       <span className="text-xs font-black text-emerald-400">72%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="h-full bg-emerald-500" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget Mensal</p>
                       <span className="text-xs font-black text-primary">R$ 1.500 / R$ 2.000</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-primary" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sessão PRO Travada */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 italic">Módulos Malha Pro</h2>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6">
              <ProFeature 
                title="Análise de Arbitragem Deep" 
                desc="O Mnēmē var calcular automaticamente o lucro de parar em Sanharó para comprar queijo vs comprar no Recife."
              />
              <ProFeature 
                title="Sincronia Regional Plus" 
                desc="Compartilhe listas com até 10 familiares e tenha sincronia de tempo real via geofencing na 232."
              />
              <ProFeature 
                title="Exportação de Balanço" 
                desc="Relatórios mensais em PDF para gestão de caixa da residência ou prestação de contas familiar."
              />
              <ProFeature 
                title="IA Predição de Safra" 
                desc="Receba alertas de quando os produtos dos Patronos estarão com o melhor preço e qualidade."
              />
           </div>
        </div>

        {/* CTA de Assinatura */}
        <section className="pt-12">
           <motion.div 
             whileHover={{ scale: 1.02 }}
             className="relative p-1 rounded-[3rem] bg-gradient-to-r from-primary via-blue-500 to-purple-500"
           >
              <div className="p-10 bg-[#101010] rounded-[2.9rem] flex flex-col md:flex-row items-center gap-8 justify-between">
                 <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                       <Zap size={14} className="text-primary" />
                       <span className="text-[10px] font-black uppercase text-primary">Próximo Nível</span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">Eleve sua Economia.</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md">
                       Desbloqueie o potencial máximo da sua "Cesta" com análises preditivas e arbitragem de preços avançada.
                    </p>
                 </div>
                 <button className="h-16 px-10 bg-primary text-black rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_10px_30px_rgba(255,117,31,0.3)] hover:scale-105 transition-all">
                    Seja Mnēmē PRO
                 </button>
              </div>
           </motion.div>
        </section>

      </main>
    </div>
  );
};

export default MnemeDashboard;
