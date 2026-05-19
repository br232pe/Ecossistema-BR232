import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  ChevronRight, 
  History, 
  Settings,
  Plus,
  Search,
  Activity,
  Bus,
  Car,
  Bell,
  Users
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import { useAuth } from '../src/contexts/AuthContext';

const DashboardViagens: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'curto' | 'longo'>('curto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'travel_routes'), 
      where('operatorId', '==', profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const routesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRoutes(routesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const filteredRoutes = routes.filter(r => {
    if (activeTab === 'curto') return r.type === 'curto' || r.type === 'interbairros';
    return r.type === 'longo';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05100a] flex items-center justify-center">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100a] text-white font-sans pb-32">
      {/* Header Estético */}
      <header className="sticky top-0 z-50 bg-[#05100a]/90 backdrop-blur-md border-b border-white/5 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Truck size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase leading-none mb-1">Gestão de Viagens</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Navigation size={10} /> Transporte Alternativo • Ativo
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                Alertas <Bell size={14} />
             </button>
             <button className="h-12 px-6 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_10px_30px_#00e676]/20">
                Nova Rota <Plus size={14} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        
        {/* Camada de Insights */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <TravelStatCard label="Viagens Hoje" value={routes.length} icon={<Bus size={18} />} color="#00e676" />
           <TravelStatCard label="IP Operacional" value="98.2%" icon={<Activity size={18} />} color="#00e676" />
           <TravelStatCard label="Taxa Ocupação" value="74%" icon={<Users size={18} />} color="#ff751f" />
           <TravelStatCard label="KM Rodados" value="1.2k" icon={<Navigation size={18} />} color="#00e676" />
        </section>

        {/* Navegação Sub-Dashboard */}
        <div className="flex items-center gap-10 border-b border-white/5 overflow-x-auto no-scrollbar">
           <SubDashTab 
             active={activeTab === 'curto'} 
             onClick={() => setActiveTab('curto')}
             icon={<Car size={16} />}
             label="Sub Dashboard Curto"
             desc="Vans e Lotação (Dia-a-dia)"
           />
           <SubDashTab 
             active={activeTab === 'longo'} 
             onClick={() => setActiveTab('longo')}
             icon={<Bus size={16} />}
             label="Sub Dashboard Longo"
             desc="Fretamento e Ônibus"
           />
        </div>

        {/* Lista de Rotas em Tempo Real */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Operação em Tempo Real</h3>
             <div className="flex items-center gap-2 text-primary">
                <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00e676]" />
                <span className="text-[8px] font-black uppercase tracking-widest">Live Satélite Antigravity</span>
             </div>
          </div>

          <div className="grid gap-4">
             {filteredRoutes.length > 0 ? filteredRoutes.map(route => (
               <RouteItem key={route.id} route={route} />
             )) : (
               <div className="p-20 bg-white/2 border border-dashed border-white/10 rounded-[2.5rem] text-center space-y-4">
                  <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                    <Navigation size={32} />
                  </div>
                  <p className="text-slate-500 text-sm italic font-medium">Nenhuma rota ativa no {activeTab === 'curto' ? 'sistema de agilidade' : 'sistema de fretamento'}.</p>
               </div>
             )}
          </div>
        </section>

      </main>
    </div>
  );
};

const TravelStatCard = ({ label, value, icon, color }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3 group hover:border-primary/40 transition-all">
    <div className="flex items-center justify-between">
      <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center" style={{ color }}>
         {icon}
      </div>
      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ECO-BR232</div>
    </div>
    <div>
      <div className="text-3xl font-black italic uppercase leading-none mb-1">{value}</div>
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);

const SubDashTab = ({ active, onClick, icon, label, desc }: any) => (
  <button 
    onClick={onClick}
    className={`pb-6 px-2 min-w-fit text-left relative group transition-all ${active ? '' : 'opacity-40 hover:opacity-100'}`}
  >
    <div className="flex items-center gap-4">
       <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-primary text-black' : 'bg-white/5 text-slate-400'}`}>
          {icon}
       </div>
       <div className="space-y-0.5">
          <h4 className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-slate-400'}`}>{label}</h4>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">{desc}</p>
       </div>
    </div>
    {active && (
      <motion.div 
        layoutId="tab-viagem-active"
        className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_15px_#00e676]" 
      />
    )}
  </button>
);

const RouteItem = ({ route }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8">
     <div className="flex items-center gap-6">
        <div className="size-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
           {route.type === 'longo' ? <Bus size={24} /> : <Car size={24} />}
        </div>
        <div>
           <div className="flex items-center gap-2 mb-1">
              <h5 className="text-lg font-black italic uppercase italic leading-none">{route.origin} → {route.destination}</h5>
              <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase border ${
                route.type === 'interbairros' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-primary/30 text-primary bg-primary/10'
              }`}>
                {route.type}
              </span>
           </div>
           <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Clock size={10} /> {route.schedule || 'Contínuo'}</span>
              <span className="flex items-center gap-1 text-primary"><Activity size={10} /> Localização Ativa</span>
           </div>
        </div>
     </div>

     <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
           <div className="text-xs font-black italic">R$ {route.price || '0,00'}</div>
           <div className="text-[7px] font-bold text-slate-600 uppercase tracking-widest mt-0.5 text-right">Tarifa Base</div>
        </div>
        <button className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-primary/50 transition-all flex items-center gap-2 group-hover:bg-primary group-hover:text-black">
           Rastrear <Navigation size={14} />
        </button>
     </div>
  </div>
);

export default DashboardViagens;
