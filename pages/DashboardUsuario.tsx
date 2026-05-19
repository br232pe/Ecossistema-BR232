import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Store, 
  ShoppingCart, 
  Wallet, 
  Bike, 
  Star, 
  Activity,
  ArrowRight,
  Settings,
  Bell,
  Lock,
  Users,
  Search,
  Truck,
  Wrench,
  Building2
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

const DashboardUsuario: React.FC = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  const stats = profile?.stats || {
    ip: 0,
    merit: 0,
    associationForce: 0,
    totalKm: 0,
  };

  const identities = profile?.identities || {
    isConsumer: true,
    isPatron: false,
    isDriver: false,
    isGuardian: false,
    isSecretary: false,
    isAssociationManager: false,
    isTravelManager: false,
    isServiceProvider: false
  };

  // Módulos e seus estados baseados nas identidades
  const modules = [
    {
      id: 'feira',
      title: 'A Feira',
      tag: 'Marketplace',
      desc: 'Gestão de seus anúncios e negócios lindeiros.',
      icon: <Store />,
      active: true, // Sempre ativo para consumidores verem, mas painel de gestão depende de ads
      route: '/classificados',
      color: '#00e676'
    },
    {
      id: 'mneme',
      title: 'Mnēmē',
      tag: 'Gestão Inteligente',
      desc: 'Organização de compras e memória doméstica.',
      icon: <ShoppingCart />,
      active: true,
      route: '/mneme',
      color: '#ff751f'
    },
    {
      id: 'fidelidade',
      title: 'Porta-Luvas',
      tag: 'Fidelidade',
      desc: 'Seus selos, cupons e histórico de paragens.',
      icon: <Wallet />,
      active: true,
      route: '/fidelidade',
      color: '#00e676'
    },
    {
      id: 'moto-taxi',
      title: 'Moto-Táxi',
      tag: 'Profissional',
      desc: 'Painel de prestador elite e ranking de mérito.',
      icon: <Bike />,
      active: identities.isDriver,
      route: '/moto-taxi',
      color: '#ff751f'
    },
    {
      id: 'patronos',
      title: 'Patronatos',
      tag: 'Influência',
      desc: 'Dashboard de KMs de influência e bacia comercial.',
      icon: <Zap />,
      active: identities.isPatron,
      route: '/patronos',
      color: '#00e676'
    },
    {
      id: 'associacao',
      title: 'Associação',
      tag: 'Gestão Core',
      desc: 'Painel de gestão de membros e força de associação.',
      icon: <Users size={30} />,
      active: identities.isAssociationManager,
      route: '/dashboard-associacao',
      color: '#00e676'
    },
    {
      id: 'viagens',
      title: 'Viagens',
      tag: 'Transporte',
      desc: 'Gestão de vans, fretamento e lotação regional.',
      icon: <Truck size={30} />,
      active: identities.isTravelManager,
      route: '/dashboard-viagens',
      color: '#ff751f'
    },
    {
      id: 'vida-cidades',
      title: 'Vida das Cidades',
      tag: 'Serviços',
      desc: 'Encontre profissionais e serviços locais na palma da mão.',
      icon: <Wrench size={30} />,
      active: true,
      route: '/vida-cidades',
      color: '#3b82f6'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32 font-sans">
      
      {/* Header Operacional */}
      <header className="sticky top-0 z-50 bg-[#05100a]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <Users size={20} className="text-primary" />
             </div>
             <div>
                <h1 className="text-xs font-black uppercase tracking-widest leading-none">Painel do Usuário</h1>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">Identidade: {profile?.displayName}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                <Bell size={18} />
             </button>
             <button onClick={() => navigate('/perfil')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                <Settings size={18} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        
        {/* Camada Superior: IP (O Cânone do Pertencimento) */}
        <section className="relative">
          <div className="p-8 bg-gradient-to-br from-[#0c1a14] to-black rounded-[2.5rem] border border-primary/20 overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                  <Activity size={12} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Status de Pertencimento</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                  {stats.ip.toFixed(1)}<span className="text-2xl text-primary font-sans lowercase items-baseline">%</span>
                </h2>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-1.5 grayscale opacity-50">
                    <Star size={12} className="text-primary" fill="currentColor" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Nível Titan</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                 <StatBox label="Mérito Individual" value={stats.merit} weight="65%" />
                 <StatBox label="Associação BR" value={stats.associationForce} weight="35%" />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
               <p className="text-[10px] text-slate-500 font-medium italic max-w-sm text-center sm:text-left">
                 "O IP equilibra seu esforço individual com a força da união na bacia do KM {profile?.currentCity === 'Recife' ? '0' : '80'}."
               </p>
               <button onClick={() => navigate('/registro')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                 Explorar Vocação
               </button>
            </div>
          </div>
        </section>

        {/* Grid Operacional de Módulos */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Central de Operações</h3>
             <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Multi-Persona Ativo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(mod => (
              <ModuleCard 
                key={mod.id}
                {...mod}
                onClick={() => navigate(mod.route)}
              />
            ))}
          </div>
        </section>

        {/* Proto-Lógica: Avaliação e Atividade (Standby de Eventos) */}
        <section className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                 <h4 className="text-2xl font-black italic uppercase leading-none">Interações Recentes</h4>
                 <p className="text-xs text-slate-500 font-medium italic">Nenhuma atividade pendente de avaliação no momento.</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 bg-black/40 rounded-3xl border border-white/5 opacity-40">
                 <Star size={32} className="text-slate-700" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Aguardando Evento</span>
              </div>
           </div>
        </section>

      </main>
    </div>
  );
};

const StatBox = ({ label, value, weight }: any) => (
  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-1 group hover:border-primary/40 transition-all">
    <div className="flex items-center justify-between text-slate-500">
       <span className="text-[8px] font-black uppercase tracking-widest">{weight}</span>
    </div>
    <div className="text-2xl font-black italic leading-none pt-1">{value.toFixed(1)}%</div>
    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

const ModuleCard = ({ title, tag, desc, icon, active, color, onClick }: any) => (
  <motion.div 
    whileHover={active ? { y: -5 } : {}}
    onClick={active ? onClick : undefined}
    className={`p-8 border rounded-[2rem] flex flex-col justify-between h-64 transition-all relative overflow-hidden ${
      active 
        ? 'bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 group' 
        : 'bg-black/60 border-white/5 opacity-50 cursor-not-allowed'
    }`}
  >
    {!active && (
      <div className="absolute top-4 right-4 text-slate-500">
        <Lock size={16} />
      </div>
    )}
    
    <div className="space-y-6">
      <div className={`size-14 rounded-2xl flex items-center justify-center transition-transform duration-500 ${active ? 'bg-white/5 group-hover:scale-110' : 'bg-white/2'}`} style={{ color: active ? color : '#444' }}>
        {React.cloneElement(icon, { size: 30 })}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-black italic uppercase leading-none">{title}</h4>
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{tag}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium italic leading-relaxed">{desc}</p>
      </div>
    </div>

    {active ? (
      <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
        Gerir Módulo <ArrowRight size={14} />
      </div>
    ) : (
      <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
        Aguardando Ativação
      </div>
    )}
  </motion.div>
);

export default DashboardUsuario;
