import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Activity, 
  Star, 
  UserPlus, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Bike
} from 'lucide-react';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import { useAuth } from '../src/contexts/AuthContext';

const DashboardAssociacao: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [association, setAssociation] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'audit' | 'stats'>('members');

  useEffect(() => {
    if (!profile?.uid) return;

    // Buscar associação onde o usuário é gerente
    const q = query(collection(db, 'associations'), where('managerId', '==', profile.uid));
    
    const unsubscribeAssoc = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setAssociation({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        
        // Buscar membros desta associação
        const membersRef = collection(db, `associations/${snapshot.docs[0].id}/members`);
        const unsubscribeMembers = onSnapshot(membersRef, (memberSnap) => {
          const membersList = memberSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMembers(membersList);
          setLoading(false);
        });
        
        return () => unsubscribeMembers();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAssoc();
  }, [profile?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05100a] flex items-center justify-center">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!association) {
    return (
      <div className="min-h-screen bg-[#05100a] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6">
          <Users size={40} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-black italic uppercase italic mb-2">Sem Associação Ativa</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-8">
          Você ainda não gerencia uma associação registrada no Ecossistema BR232.
        </p>
        <button 
          onClick={() => navigate('/registro-associacao')}
          className="px-8 py-4 bg-primary text-black font-black uppercase text-xs rounded-2xl shadow-[0_10px_30px_rgba(0,230,118,0.2)]"
        >
          Registrar Nova Associação
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100a] text-white font-sans pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#05100a]/90 backdrop-blur-md border-b border-white/5 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Users size={32} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black italic uppercase leading-none">{association.name}</h1>
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded-full border border-primary/20 tracking-widest">
                  {association.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><MapPin size={10} /> {association.city}</span>
                <span className="flex items-center gap-1"><Activity size={10} /> {association.category}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex-1 sm:flex-none h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Configurar <CheckCircle2 size={14} className="text-primary" />
             </button>
             <button className="flex-1 sm:flex-none h-12 px-6 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                Convidar <UserPlus size={14} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        
        {/* Collective Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <MetricCard 
             label="Pertencimento Coletivo" 
             value={`${association.collectiveIp || 0}%`} 
             sub="Média do Grupo" 
             icon={<Activity size={20} />} 
             trend="+2.4%"
           />
           <MetricCard 
             label="Força de Associação" 
             value={members.length} 
             sub="Membros Ativos" 
             icon={<Users size={20} />} 
             trend="LTS"
           />
           <MetricCard 
             label="KM de Influência" 
             value="420" 
             sub="Impacto Regional" 
             icon={<TrendingUp size={20} />} 
             trend="+12km"
           />
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-white/5">
           <TabButton 
             active={activeTab === 'members'} 
             onClick={() => setActiveTab('members')} 
             label="Membros" 
             count={members.length} 
           />
           <TabButton 
             active={activeTab === 'audit'} 
             onClick={() => setActiveTab('audit')} 
             label="Fila de Auditoria" 
             count={0} 
           />
           <TabButton 
             active={activeTab === 'stats'} 
             onClick={() => setActiveTab('stats')} 
             label="Desempenho" 
           />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'members' && (
            <motion.div 
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input 
                     type="text" 
                     placeholder="Buscar membro por nome ou KM..."
                     className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-xs font-medium focus:border-primary/50 outline-none transition-all"
                   />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <button className="flex-1 sm:flex-none h-12 px-6 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                     <Filter size={14} /> Filtros
                   </button>
                </div>
              </div>

              <div className="grid gap-4">
                {members.length > 0 ? members.map((member) => (
                  <MemberRow key={member.id} member={member} />
                )) : (
                  <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center space-y-4">
                    <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                       <AlertCircle size={32} className="text-slate-700" />
                    </div>
                    <p className="text-slate-500 text-sm italic">Nenhum membro vinculado a esta associação ainda.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div 
              key="audit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-primary/20" />
              </div>
              <h3 className="text-xl font-black italic uppercase italic">Tudo em Conformidade</h3>
              <p className="text-slate-500 text-sm mt-2">Nenhuma pendência crítica ou denúncia aguardando auditoria.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const MetricCard = ({ label, value, sub, icon, trend }: any) => (
  <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative group overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
    <div className="relative z-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <div className="text-[10px] font-black text-primary uppercase tracking-widest">{trend}</div>
      </div>
      <div>
        <div className="text-4xl font-black italic uppercase leading-none mb-1">{value}</div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      </div>
      <div className="pt-4 border-t border-white/5">
        <span className="text-[9px] font-medium italic text-slate-600 uppercase tracking-widest">{sub}</span>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all ${
      active ? 'text-primary' : 'text-slate-600 hover:text-slate-400'
    }`}
  >
    <div className="flex items-center gap-2">
      {label}
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[8.5px] ${active ? 'bg-primary text-black' : 'bg-white/5 text-slate-600'}`}>
          {count}
        </span>
      )}
    </div>
    {active && (
      <motion.div 
        layoutId="tab-active"
        className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_10px_#00e676]" 
      />
    )}
  </button>
);

const MemberRow = ({ member }: any) => (
  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all flex items-center justify-between gap-6">
    <div className="flex items-center gap-5">
      <div className="size-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} className="size-full object-cover" alt="Membro" />
      </div>
      <div>
        <h5 className="text-sm font-black italic uppercase tracking-tight">{member.displayName || 'Membro Elite'}</h5>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Activity size={8} /> IP: {member.ip || '--'}%
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Star size={8} className="text-primary" /> {member.role || 'Associado'}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
       <button className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 hover:bg-primary/20 hover:text-primary transition-all">
          <ArrowUpRight size={18} />
       </button>
       <button className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-all">
          <Trash2 size={16} />
       </button>
    </div>
  </div>
);

export default DashboardAssociacao;
