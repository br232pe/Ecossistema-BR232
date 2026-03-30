import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, StoredAd, StoredAlert } from '../services/db';
import { 
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Users,
  RotateCcw,
  UserCheck,
  ClipboardList,
  BarChart3,
  Settings,
  ShieldCheck,
  Globe,
  Database,
  Loader2
} from 'lucide-react';
import { CONFIG, checkSystemStatus } from '../src/config';
import { seedPatrons } from '../src/services/seedPatrons';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'testadores' | 'ads' | 'alertas' | 'sistema'>('testadores');
  const [ads, setAds] = useState<StoredAd[]>([]);
  const [alerts, setAlerts] = useState<StoredAlert[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [adsData, alertsData, usersData] = await Promise.all([
        db.ads.getAll(),
        db.alerts.getAll(),
        db.users.getAll()
      ]);
      setAds(adsData);
      setAlerts(alertsData);
      setUsers(usersData);
      setSystemStatus(checkSystemStatus());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await seedPatrons();
      setSuccessMsg("Patronos Semente carregados com sucesso na Malha!");
    } catch (e) {
      setErrorMsg("Erro ao semear: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const handleDeleteAd = async (id: string) => {
    setErrorMsg(null);
    try {
      await db.ads.delete(id);
      setConfirmDeleteId(null);
      refreshData();
    } catch (e) {
      setErrorMsg("Erro ao excluir anúncio.");
    }
  };

  const handleReset = async () => {
    // Funcionalidade desativada na migração para Firestore para segurança dos dados reais.
    setErrorMsg("O reset global da malha está desativado por segurança.");
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0a0f1d] min-h-screen text-slate-900 dark:text-white font-display pb-32">
      <header className="p-6 bg-white dark:bg-[#161e31] border-b border-slate-200 dark:border-white/5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/dashboard')} className="size-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"><ArrowLeft size={18}/></button>
           <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter">Portal <span className="text-primary">Admin</span></h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gestão da Malha BR-232</p>
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshData} className="size-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"><RotateCcw size={18}/></button>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase text-center animate-in fade-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-primary/20 border border-primary/30 rounded-2xl text-primary text-xs font-bold uppercase text-center animate-in fade-in slide-in-from-top-2">
            {successMsg}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <SummaryCard label="Usuários Ativos" value={users.length} icon={<Users size={18}/>} color="text-blue-500" />
           <SummaryCard label="Ads Inventário" value={ads.length} icon={<ClipboardList size={18}/>} color="text-primary" />
           <SummaryCard label="Alertas Via" value={alerts.length} icon={<AlertTriangle size={18}/>} color="text-secondary" />
        </div>

        <div className="bg-white dark:bg-[#161e31] rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
           <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <TabBtn active={activeTab === 'testadores'} onClick={() => setActiveTab('testadores')} icon={<UserCheck size={16}/>} label="Usuários" />
              <TabBtn active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} icon={<ClipboardList size={16}/>} label="Anúncios" />
              <TabBtn active={activeTab === 'alertas'} onClick={() => setActiveTab('alertas')} icon={<AlertTriangle size={16}/>} label="Incidentes" />
              <TabBtn active={activeTab === 'sistema'} onClick={() => setActiveTab('sistema')} icon={<Settings size={16}/>} label="Sistema" />
           </div>

           <div className="p-4 min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <RotateCcw className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                <div className="space-y-4">
                   {activeTab === 'testadores' && (
                     <div className="space-y-2">
                       {users.map(u => (
                         <div key={u.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                               {u.displayName?.charAt(0) || '?'}
                             </div>
                             <div>
                               <p className="font-bold text-sm">{u.displayName || 'Sem Nome'}</p>
                               <p className="text-[10px] text-slate-400 uppercase font-bold">{u.email}</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] font-black uppercase text-primary">{u.role}</p>
                             <p className="text-[9px] text-slate-500">{new Date(u.lastLogin).toLocaleDateString()}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}

                   {activeTab === 'ads' && (
                     <div className="space-y-2">
                       {ads.map(ad => (
                         <div key={ad.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <img src={ad.img} className="size-12 rounded-lg object-cover" />
                             <div>
                               <p className="font-bold text-sm">{ad.title}</p>
                               <p className="text-[10px] text-slate-400 uppercase font-bold">{ad.category} • {ad.city}</p>
                             </div>
                           </div>
                           <button onClick={() => setConfirmDeleteId(ad.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                             <Trash2 size={18} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Modal de Confirmação de Exclusão */}
                   {confirmDeleteId && (
                     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                       <div className="bg-white dark:bg-[#161e31] w-full max-w-xs rounded-[2rem] p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                         <div className="size-16 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                           <Trash2 size={32} />
                         </div>
                         <div>
                           <h3 className="text-lg font-black uppercase italic leading-tight dark:text-white">Excluir Anúncio?</h3>
                           <p className="text-xs text-slate-500 font-bold uppercase mt-1">Esta ação removerá o anúncio da malha.</p>
                         </div>
                         <div className="flex flex-col gap-2">
                           <button 
                             onClick={() => handleDeleteAd(confirmDeleteId)}
                             className="w-full h-12 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
                           >
                             Confirmar Exclusão
                           </button>
                           <button 
                             onClick={() => setConfirmDeleteId(null)}
                             className="w-full h-12 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                           >
                             Cancelar
                           </button>
                         </div>
                       </div>
                     </div>
                   )}

                   {activeTab === 'alertas' && (
                     <div className="space-y-2">
                       {alerts.map(alert => (
                         <div key={alert.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="size-10 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                               <AlertTriangle size={18} />
                             </div>
                             <div>
                               <p className="font-bold text-sm">{alert.type}</p>
                               <p className="text-[10px] text-slate-400 uppercase font-bold">KM {alert.km} • {alert.location}</p>
                             </div>
                           </div>
                           <p className="text-[9px] text-slate-500">{new Date(alert.timestamp).toLocaleString()}</p>
                         </div>
                       ))}
                     </div>
                   )}

                    {activeTab === 'sistema' && systemStatus && (
                      <div className="space-y-6 p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <StatusItem 
                            label="Gemini AI (IA)" 
                            status={systemStatus.gemini} 
                            icon={<ShieldCheck size={20}/>}
                            desc={systemStatus.gemini ? "Conectado e Operacional" : "Chave ausente (Modo Mock)"}
                          />
                          <StatusItem 
                            label="Google Maps" 
                            status={systemStatus.maps} 
                            icon={<Globe size={20}/>}
                            desc={systemStatus.maps ? "Chave Detectada" : "Chave ausente"}
                          />
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-white/5">
                          <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings size={14} className="text-primary" /> Configurações de Ambiente
                          </h3>
                          <div className="space-y-3">
                            <EnvRow label="GEMINI_API_KEY" value={CONFIG.GEMINI_API_KEY ? "••••••••" + CONFIG.GEMINI_API_KEY.slice(-4) : "NÃO DEFINIDA"} />
                            <EnvRow label="GOOGLE_MAPS_KEY" value={CONFIG.GOOGLE_MAPS_KEY ? "••••••••" + CONFIG.GOOGLE_MAPS_KEY.slice(-4) : "NÃO DEFINIDA"} />
                            <EnvRow label="VERSÃO DO APP" value={CONFIG.VERSION} />
                            <EnvRow label="MODO" value={CONFIG.IS_DEV ? "DESENVOLVIMENTO" : "PRODUÇÃO"} />
                          </div>
                        </div>

                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                          <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-primary">
                            <Database size={14} /> Carga de Dados (Seed)
                          </h3>
                          <p className="text-[10px] text-slate-400 uppercase font-bold italic mb-6 leading-relaxed">
                            Use esta ferramenta para popular a malha com os Patronos Semente (Rei das Coxinhas, Posto da Serra, etc.) e testar o geofencing.
                          </p>
                          <button 
                            onClick={handleSeed}
                            disabled={seeding}
                            className="w-full h-14 bg-primary text-black rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                          >
                            {seeding ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
                            {seeding ? "Semeando Malha..." : "Carregar Patronos Semente"}
                          </button>
                        </div>
                      </div>
                    )}

                   {((activeTab === 'testadores' && users.length === 0) || 
                     (activeTab === 'ads' && ads.length === 0) || 
                     (activeTab === 'alertas' && alerts.length === 0)) && (
                     <div className="py-20 text-center opacity-40">
                        <BarChart3 size={48} className="mx-auto text-slate-400 mb-4" />
                        <h3 className="font-black uppercase tracking-widest text-xs">Sem dados</h3>
                        <p className="text-[10px] font-medium italic uppercase">Nenhum registro encontrado nesta categoria.</p>
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white dark:bg-[#161e31] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-transform hover:scale-[1.02]">
     <div className={`mb-2 ${color}`}>{icon}</div>
     <p className="text-2xl font-black italic leading-none dark:text-white">{value}</p>
     <p className="text-[9px] font-black text-slate-400 uppercase mt-2 tracking-widest italic">{label}</p>
  </div>
);

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 text-[9px] font-black uppercase transition-all ${active ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
    {icon} {label}
  </button>
);

const StatusItem = ({ label, status, icon, desc }: any) => (
  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
    <div className={`size-12 rounded-xl flex items-center justify-center ${status ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-tight">{label}</p>
      <p className={`text-[10px] font-bold uppercase ${status ? 'text-primary' : 'text-red-500'}`}>{desc}</p>
    </div>
  </div>
);

const EnvRow = ({ label, value }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
    <span className="text-[10px] font-black uppercase text-slate-500">{label}</span>
    <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{value}</span>
  </div>
);

export default AdminDashboard;