import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Globe, 
  Settings, 
  Activity,
  Search,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { provisionDemoPromoter } from '../src/utils/createDemoAccounts';

const AdminDashboard: React.FC = () => {
  const [provisionStatus, setProvisionStatus] = useState<{ loading: boolean; message: string | null }>({
    loading: false,
    message: null,
  });

  const handleProvisionDemo = async () => {
    setProvisionStatus({ loading: true, message: null });
    const result = await provisionDemoPromoter();
    setProvisionStatus({ loading: false, message: result.message });
  };
  return (
    <div className="min-h-screen bg-[#05100a] text-white">
      {/* Sidebar (Desktop Only) */}
      <div className="flex h-screen overflow-hidden">
        
        <aside className="hidden lg:flex w-72 bg-[#0c1a14] border-r border-white/5 flex-col p-8 space-y-10">
           <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 backdrop-blur-xl">
                 <img 
                   src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                   className="size-full object-contain"
                   alt="BR232"
                   referrerPolicy="no-referrer"
                 />
              </div>
              <span className="text-sm font-black uppercase italic tracking-widest">Admin Control</span>
           </div>

           <nav className="flex-1 space-y-2">
              <SidebarItem icon={<BarChart3 size={18}/>} label="Overview" active />
              <SidebarItem icon={<Users size={18}/>} label="Usuários" />
              <SidebarItem icon={<ShieldCheck size={18}/>} label="Patronos" />
              <SidebarItem icon={<Zap size={18}/>} label="Gamificação" />
              <SidebarItem icon={<AlertTriangle size={18}/>} label="Alertas Ativos" />
              <SidebarItem icon={<Globe size={18}/>} label="Cidades" />
           </nav>

           <div className="pt-8 border-t border-white/5">
              <SidebarItem icon={<Settings size={18}/>} label="Configurações" />
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
           {/* Top Bar */}
           <header className="sticky top-0 z-50 bg-[#05100a]/80 backdrop-blur-3xl border-b border-white/5 px-8 h-20 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] italic">Comando Central</h2>
              <div className="flex items-center gap-6">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" placeholder="Buscar na malha..." className="h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-primary/50 transition-all" />
                 </div>
                 <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                    <Activity size={14} className="text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sistema Online</span>
                 </div>
              </div>
           </header>

           <div className="p-8 space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <AdminStatCard label="Usuários Ativos" value="12,480" change="+12%" icon={<Users size={20}/>} />
                 <AdminStatCard label="Patronos Verificados" value="482" change="+3" icon={<ShieldCheck size={20}/>} />
                 <AdminStatCard label="Transações Quinzena" value="R$ 1.2M" change="+45%" icon={<TrendingUp size={20}/>} />
                 <AdminStatCard label="Alertas Moderados" value="156" change="-5%" icon={<AlertTriangle size={20}/>} />
              </div>

              {/* Charts area - Placeholder */}
              <div className="grid lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                       <h3 className="text-lg font-black italic uppercase italic leading-none">Crescimento da Malha Geoeconômica</h3>
                       <div className="flex gap-2">
                          {['Dia', 'Mês', 'Ano'].map(t => <button key={t} className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-white/10">{t}</button>)}
                       </div>
                    </div>
                    {/* Simulated Chart */}
                    <div className="h-64 flex items-end justify-between gap-2 relative z-10">
                       {[40, 60, 30, 80, 50, 90, 70, 45, 85, 95, 60, 100].map((h, i) => (
                         <motion.div 
                           key={i}
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           className="flex-1 bg-primary/20 rounded-t-lg group relative"
                         >
                            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg"></div>
                         </motion.div>
                       ))}
                    </div>
                 </div>

                 <div className="lg:col-span-4 p-8 bg-[#0c1a14] border border-white/5 rounded-[3rem] space-y-6">
                    <h3 className="text-sm font-black italic uppercase italic tracking-widest leading-none">Cidades Mais Ativas</h3>
                    <div className="space-y-4">
                       <RankingMini city="Gravatá" val="89.2 IP" />
                       <RankingMini city="Arcoverde" val="86.5 IP" />
                       <RankingMini city="Bezerros" val="84.1 IP" />
                       <RankingMini city="Caruaru" val="82.9 IP" />
                       <RankingMini city="Serra Talhada" val="79.4 IP" />
                    </div>
                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                       Ver Todas as Cidades <ChevronRight size={16} />
                    </button>
                 </div>
              </div>

              {/* Sandbox Provisioner Widget */}
              <div id="sandbox-provisioner" className="bg-[#0b1410] border border-emerald-900/40 p-8 rounded-[2.5rem] space-y-4 text-left my-8">
                 <div className="flex items-center gap-3">
                    <Zap className="text-[#00E676]" size={18} />
                    <h3 className="text-sm font-black uppercase tracking-widest font-mono">Sandbox Comercial: Contas de Demonstração</h3>
                 </div>
                 <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
                    Gere automaticamente as credenciais de homologação comercial e teste para as novas funções de expansão territorial do ecossistema. O provisionamento criará o registro de autenticação no Firebase Auth e o perfil do banco com o papel <strong className="text-white font-mono">promoter_branch</strong>.
                 </p>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                    <button 
                       disabled={provisionStatus.loading}
                       onClick={handleProvisionDemo}
                       className="px-6 py-3.5 bg-[#00E676] hover:bg-[#00c564] disabled:opacity-50 text-black font-black uppercase tracking-widest text-[9.5px] rounded-xl flex items-center gap-2 transition-all cursor-pointer font-sans"
                    >
                       {provisionStatus.loading ? 'Provisionando...' : 'Provisionar Promotor Demo'}
                    </button>
                    {provisionStatus.message && (
                       <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider bg-black/40 border border-emerald-950 px-3 py-1.5 rounded-lg">
                          {provisionStatus.message}
                       </span>
                    )}
                 </div>
              </div>

              {/* Data Table Placeholder */}
              <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                 <div className="p-10 border-b border-white/5">
                    <h3 className="text-xl font-black italic uppercase italic leading-none">Logs de Auditoria Recentes</h3>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-[#0c1a14] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          <tr>
                             <th className="px-10 py-6">Evento</th>
                             <th className="px-10 py-6">Autor</th>
                             <th className="px-10 py-6">KM/Local</th>
                             <th className="px-10 py-6">Impacto IP</th>
                             <th className="px-10 py-6">Status</th>
                          </tr>
                       </thead>
                       <tbody className="text-xs font-medium italic divide-y divide-white/5">
                          <tr className="hover:bg-white/[0.02] transition-colors">
                             <td className="px-10 py-6">Validou Checkpoint Digital</td>
                             <td className="px-10 py-6">@beto_rodas</td>
                             <td className="px-10 py-6">KM 142 (Arcoverde)</td>
                             <td className="px-10 py-6 text-primary">+1.2</td>
                             <td className="px-10 py-6">
                                <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-[8px] font-black uppercase">Concluído</span>
                             </td>
                          </tr>
                          <tr className="hover:bg-white/[0.02] transition-colors">
                             <td className="px-10 py-6">Reportou Radar Ativo</td>
                             <td className="px-10 py-6">@carlos_exp</td>
                             <td className="px-10 py-6">KM 80 (Gravatá)</td>
                             <td className="px-10 py-6 text-primary">+0.5</td>
                             <td className="px-10 py-6">
                                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-[8px] font-black uppercase">Verificando</span>
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }: any) => (
  <button className={`w-full h-12 px-4 rounded-xl flex items-center gap-4 transition-all ${active ? 'bg-primary text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
     {icon}
     <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const AdminStatCard = ({ label, value, change, icon }: any) => (
  <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
     <div className="flex items-center justify-between">
        <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-slate-500">
           {icon}
        </div>
        <div className={`text-[10px] font-black uppercase ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
           {change}
        </div>
     </div>
     <div className="space-y-1">
        <h4 className="text-3xl font-black italic uppercase italic tracking-tighter leading-none">{value}</h4>
        <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{label}</p>
     </div>
  </div>
);

const RankingMini = ({ city, val }: any) => (
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
     <div className="flex items-center gap-3">
        <MapPin size={14} className="text-primary" />
        <span className="text-xs font-black italic uppercase">{city}</span>
     </div>
     <span className="text-[10px] font-black text-primary">{val}</span>
  </div>
);

export default AdminDashboard;
