import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, StoredAlert } from '../services/db';
import { 
  AlertTriangle, 
  Bike, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Info, 
  ArrowLeft,
  Layers,
  Filter,
  Navigation,
  Zap,
  Bell,
  BellOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapPoint {
  id: string;
  km: number;
  type: 'incident' | 'moto' | 'service';
  label: string;
  desc: string;
  time: string;
  status: string;
  severity?: 'low' | 'medium' | 'high';
}

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [showMotoTaxi, setShowMotoTaxi] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [realAlerts, setRealAlerts] = useState<MapPoint[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }

    // Subscribe to real-time alerts
    const unsubscribe = db.alerts.subscribe((alerts) => {
      const mappedAlerts: MapPoint[] = alerts.map(a => ({
        id: a.id,
        km: a.km,
        type: 'incident',
        label: a.type,
        desc: a.location,
        time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Ativo',
        severity: a.severity || 'medium'
      }));

      // Service points (fixed)
      const servicePoints: MapPoint[] = [
        { id: 's1', km: 80, type: 'service', label: 'Posto Gravatá', desc: 'Recarga elétrica rápida disponível.', time: 'Aberto', status: 'Destaque' },
        { id: 's2', km: 135, type: 'service', label: 'Pátio Caruaru', desc: 'Ponto de apoio para motoristas.', time: '24h', status: 'Apoio' }
      ];

      const allPoints = [...mappedAlerts, ...servicePoints];
      setRealAlerts(allPoints);

      // Check for new critical alerts
      if (alerts.length > 0) {
        const newest = alerts[0];
        if (newest.id !== lastAlertId) {
          setLastAlertId(newest.id);
          if (newest.severity === 'high' && soundEnabled) {
            playAlertSound();
            triggerVibration();
          }
        }
      }
    });

    return () => unsubscribe();
  }, [lastAlertId, soundEnabled]);

  const playAlertSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  };

  const triggerVibration = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  };

  const filteredPoints = realAlerts.filter(p => {
    if (p.type === 'moto' && !showMotoTaxi) return false;
    if (p.type === 'incident' && !showTraffic) return false;
    return true;
  });

  // Função para rolar o carrossel até o card específico
  const scrollToPoint = (id: string) => {
    setActivePointId(id);
    const element = document.getElementById(`card-${id}`);
    if (element && carouselRef.current) {
      carouselRef.current.scrollTo({
        left: element.offsetLeft - 24, // Padding inicial
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-background-dark min-h-screen text-white flex flex-col font-display overflow-hidden">
      {/* Header Tecnológico */}
      <header className="sticky top-0 z-30 bg-background-dark/80 backdrop-blur-xl px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:text-primary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black uppercase tracking-tighter italic leading-none">Monitor 232</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Status da Malha ao Vivo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`size-11 rounded-2xl flex items-center justify-center border-2 transition-all ${soundEnabled ? 'bg-white/5 border-white/10 text-primary' : 'bg-white/5 border-white/10 text-slate-600'}`}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={requestNotifications}
            className={`size-11 rounded-2xl flex items-center justify-center border-2 transition-all ${notificationsEnabled ? 'bg-white/5 border-white/10 text-primary' : 'bg-white/5 border-white/10 text-slate-600'}`}
          >
            {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </button>
          <FilterButton active={showMotoTaxi} onClick={() => setShowMotoTaxi(!showMotoTaxi)} icon="two_wheeler" />
          <FilterButton active={showTraffic} onClick={() => setShowTraffic(!showTraffic)} icon="warning" color="secondary" />
        </div>
      </header>

      <main className="flex-1 relative flex flex-col">
        {/* Mapa da Rodovia (Linha Tronco Digital) */}
        <div className="flex-1 bg-background-dark relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent flex flex-col items-center py-10">
             <div className="h-full w-px border-r border-dashed border-primary/20"></div>
             
             {/* Marcadores de KM */}
             {[0, 100, 250, 400, 553].map(km => (
               <div key={km} className="absolute w-full flex items-center justify-center gap-4" style={{ top: `${(km / 553) * 90 + 5}%` }}>
                  <div className="w-6 h-px bg-white/10"></div>
                  <span className="text-[8px] font-black text-slate-600 bg-background-dark px-2 rounded-full tracking-widest italic border border-white/5">KM {km}</span>
               </div>
             ))}
          </div>

          {/* Incidentes Interativos */}
          <AnimatePresence>
            {filteredPoints.map(p => (
              <motion.div 
                key={p.id} 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -translate-x-1/2 cursor-pointer transition-all duration-500 z-10" 
                style={{ top: `${(p.km / 553) * 90 + 5}%`, left: '50%' }}
                onClick={() => scrollToPoint(p.id)}
              >
                 <div className={`relative group`}>
                    <div className={`size-12 rounded-2xl flex items-center justify-center shadow-2xl border-2 transition-all duration-300 ${activePointId === p.id ? 'scale-125 ring-4 ring-primary/20 z-20' : 'scale-100'} ${p.type === 'moto' ? 'bg-primary border-white text-black' : p.type === 'incident' ? (
                      p.severity === 'high' ? 'bg-red-600 border-white text-white animate-ping' : 
                      p.severity === 'medium' ? 'bg-orange-500 border-white text-white animate-pulse' : 
                      'bg-yellow-500 border-white text-white'
                    ) : 'bg-blue-500 border-white text-white'}`}>
                       <span className="material-symbols-outlined text-[20px] filled">
                         {p.type === 'moto' ? 'two_wheeler' : p.type === 'incident' ? 'warning' : 'local_gas_station'}
                       </span>
                    </div>
                    
                    {/* Pulsar extra para críticos */}
                    {p.type === 'incident' && p.severity === 'high' && (
                      <div className="absolute inset-0 bg-red-600 rounded-2xl animate-ping opacity-20 -z-10"></div>
                    )}

                    {/* Tooltip rápido no mapa */}
                    {activePointId === p.id && (
                      <div className="absolute -right-24 top-1/2 -translate-y-1/2 bg-white text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-2xl border border-white/20 whitespace-nowrap animate-in slide-in-from-left-2">
                         KM {p.km} • {p.status}
                      </div>
                    )}
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Carrossel de Detalhes Inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
          <div 
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pointer-events-auto pb-6"
          >
            {filteredPoints.map(p => (
              <div 
                key={p.id} 
                id={`card-${p.id}`}
                className="snap-start shrink-0 w-[85%] max-w-[320px]"
              >
                <div 
                  onClick={() => setActivePointId(p.id)}
                  className={`p-5 rounded-[2.5rem] bg-surface-dark border-2 transition-all duration-500 shadow-2xl ${activePointId === p.id ? 'border-primary' : 'border-white/5 opacity-80'} ${
                    p.severity === 'high' ? 'ring-2 ring-red-500/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <div className={`size-8 rounded-xl flex items-center justify-center ${p.type === 'moto' ? 'bg-primary/20 text-primary' : p.type === 'incident' ? (
                         p.severity === 'high' ? 'bg-red-500/20 text-red-500' : 
                         p.severity === 'medium' ? 'bg-orange-500/20 text-orange-500' : 
                         'bg-yellow-500/20 text-yellow-500'
                       ) : 'bg-blue-500/20 text-blue-500'}`}>
                         <span className="material-symbols-outlined text-[16px] filled">
                           {p.type === 'moto' ? 'two_wheeler' : p.type === 'incident' ? 'warning' : 'local_gas_station'}
                         </span>
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">KM {p.km}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border border-white/5 ${
                      p.severity === 'high' ? 'bg-red-500 text-white' : 'bg-white/5 text-primary'
                    }`}>
                      {p.status}
                    </div>
                  </div>

                  <h3 className="text-base font-black italic uppercase leading-tight mb-2">{p.label}</h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic line-clamp-2 mb-4">"{p.desc}"</p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-600">
                        <Clock size={12} /> {p.time}
                     </div>
                     <button className="flex items-center gap-1 text-[10px] font-black uppercase text-primary tracking-widest">
                       Ver Mais <ChevronRight size={14} />
                     </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Card final de incentivo */}
            <div className="snap-start shrink-0 w-[85%] max-w-[320px]">
              <Link to="/reportar" className="block h-full p-8 rounded-[2.5rem] bg-primary text-black border-2 border-primary shadow-2xl">
                 <div className="flex flex-col h-full justify-between">
                    <Zap size={32} fill="currentColor" />
                    <div>
                      <h3 className="text-xl font-black italic uppercase leading-none mb-2">Viu algo no caminho?</h3>
                      <p className="text-xs font-bold uppercase leading-relaxed opacity-70">Reporte agora e ajude a malha.</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mt-4">
                       Reportar Agora <ChevronRight size={16} />
                    </div>
                 </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Margem para não sobrepor a BottomNav se necessário */}
      <div className="h-20"></div>
    </div>
  );
};

const FilterButton: React.FC<any> = ({ active, onClick, icon, color = 'primary' }) => (
  <button 
    onClick={onClick}
    className={`size-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${active ? (color === 'primary' ? 'bg-primary border-primary text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]' : 'bg-[#e31d24] border-[#e31d24] text-white shadow-[0_0_15px_rgba(227,29,36,0.3)]') : 'bg-white/5 border-white/10 text-slate-600'}`}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
  </button>
);

export default Alerts;
