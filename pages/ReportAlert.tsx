import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  AlertTriangle, 
  Navigation, 
  Send, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlaceAutocomplete from '../src/components/PlaceAutocomplete';
import { firebaseService } from '../src/services/firebaseService';
import { SafetyGuardOverlay } from '../src/components/SafetyGuard';

const ReportAlert: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [speedExceeded, setSpeedExceeded] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const speed = position.coords.speed; // Speed in m/s
        setCurrentSpeed(speed);
        if (speed !== null && speed > 4.16) {
          setSpeedExceeded(true);
        } else {
          setSpeedExceeded(false);
        }
      },
      (error) => {
        console.warn("Erro ao obter velocidade via GPS:", error);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const categories = [
    { id: 'transito', name: 'Trânsito', icon: <Navigation size={20} />, color: 'primary' },
    { id: 'acidente', name: 'Acidente', icon: <AlertCircle size={20} />, color: 'red' },
    { id: 'obra', name: 'Obra na Pista', icon: <AlertTriangle size={20} />, color: 'orange' },
    { id: 'seguranca', name: 'Segurança', icon: <ShieldCheck size={20} />, color: 'blue' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (speedExceeded) return;
    setLoading(true);
    
    try {
      const lat = selectedPlace?.location
        ? (typeof selectedPlace.location.lat === 'function' ? selectedPlace.location.lat() : selectedPlace.location.lat)
        : undefined;
      const lng = selectedPlace?.location
        ? (typeof selectedPlace.location.lng === 'function' ? selectedPlace.location.lng() : selectedPlace.location.lng)
        : undefined;

      const kmRegex = /km\s*(\d+)/i;
      const match = description.match(kmRegex);
      const kmVal = match ? parseInt(match[1]) : 0;

      await firebaseService.createAlert({
        category,
        description,
        city: selectedPlace?.name || 'Caruaru',
        km: kmVal,
        lat,
        lng
      } as any);

      setSuccess(true);
      setTimeout(() => navigate('/alertas'), 2000);
    } catch (error) {
      console.error("Erro ao reportar ocorrência:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#05100a] text-white flex flex-col items-center justify-center p-8 text-center">
         <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="size-24 rounded-[2rem] bg-primary flex items-center justify-center text-black mb-8 shadow-[0_10px_40px_rgba(0,230,118,0.4)]"
         >
            <CheckCircle2 size={48} />
         </motion.div>
         <h2 className="text-4xl font-black italic uppercase italic tracking-tighter leading-tight mb-4">Alerta Enviado <br/><span className="text-primary italic">Com Sucesso!</span></h2>
         <p className="text-slate-400 text-sm italic">Sua contribuição fortalece a segurança de todos no KM.</p>
         <div className="mt-8 flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <Zap size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase text-primary leading-none">+10 KM de Influência</span>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#05100a]/90 backdrop-blur-3xl border-b border-white/5 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <button 
             onClick={() => navigate(-1)}
             className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
           >
             <ArrowLeft size={20} />
           </button>
           <div className="flex flex-col items-center">
              <h1 className="text-xs font-black uppercase tracking-[0.4em] italic leading-none text-red-500">Novo Reporte</h1>
              <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase mt-1">Tempo Real • BR232</p>
           </div>
           <div className="size-12 opacity-0"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        <div className="space-y-4">
           <h2 className="text-4xl font-black italic uppercase italic tracking-tighter leading-tight">O que você viu <br/> na pista?</h2>
           <p className="text-slate-400 text-sm italic">Seja preciso. Sua informação impacta centenas de motoristas em tempo real.</p>
        </div>

        {speedExceeded && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ willChange: "transform, opacity" }}
            className="p-6 bg-red-950/40 border border-red-500/50 rounded-3xl flex flex-col gap-3 items-center text-center shadow-[0_0_30px_rgba(239,68,68,0.2)]"
          >
             <AlertTriangle size={36} className="text-red-500 animate-bounce" />
             <h3 className="text-sm font-black uppercase tracking-widest text-red-500 leading-none">Safety Guard Ativo</h3>
             <p className="text-xs font-bold text-slate-300">
               Operação bloqueada por segurança. Estacione o veículo para reportar ocorrências.
             </p>
             {currentSpeed !== null && (
               <span className="text-[10px] bg-red-500 text-black px-4 py-1.5 rounded-full font-black uppercase tracking-wider">
                 Velocidade Atual: {Math.round(currentSpeed * 3.6)} km/h
               </span>
             )}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
           {/* Category Selection */}
           <div className="grid grid-cols-2 gap-4">
              {categories.map(cat => (
                <label key={cat.id} className={`relative group cursor-pointer ${speedExceeded ? 'pointer-events-none opacity-45' : ''}`}>
                   <input 
                     type="radio" 
                     name="category" 
                     checked={category === cat.id}
                     onChange={() => !speedExceeded && setCategory(cat.id)}
                     disabled={speedExceeded}
                     className="peer sr-only" 
                     required 
                   />
                   <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center gap-3 transition-all peer-checked:bg-primary/10 peer-checked:border-primary/50 group-hover:bg-white/[0.08]">
                      <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white transition-all">
                         {cat.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                   </div>
                </label>
              ))}
           </div>

           {/* Location & Details */}
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block pl-4">Localização Georeferenciada</label>
                 <div className={speedExceeded ? 'pointer-events-none opacity-45' : ''}>
                   <PlaceAutocomplete 
                     onPlaceSelect={(p) => !speedExceeded && setSelectedPlace(p)}
                     placeholder="Buscar ponto na BR-232 ou KM..."
                   />
                 </div>
                 <p className="text-[9px] font-bold text-slate-600 uppercase pl-4 italic">A tecnologia Google Maps garante a precisão do seu reporte.</p>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block pl-4">Descrição curta</label>
                 <textarea 
                   value={description}
                   onChange={(e) => !speedExceeded && setDescription(e.target.value)}
                   disabled={speedExceeded}
                   placeholder="Ex: Animal na pista atravessando pro canteiro central..."
                   required
                   className="w-full h-32 p-6 bg-white/5 border border-white/10 rounded-[2rem] text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-slate-700 resize-none italic disabled:opacity-50"
                 />
              </div>
           </div>

           {/* Submit */}
           <div className="pt-4">
              <button 
                type="submit"
                disabled={loading || speedExceeded}
                className="w-full h-18 bg-primary hover:bg-primary-dark text-black rounded-[1.5rem] font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_rgba(0,230,118,0.2)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                 {loading ? 'Processando...' : speedExceeded ? 'Operação Bloqueada' : 'Publicar Alerta Agora'} 
                 {!loading && !speedExceeded && <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> }
              </button>
           </div>
        </form>

        {/* Informative Footer */}
        <div className="p-6 bg-[#0c1a14] border border-white/10 rounded-3xl flex items-center gap-4">
           <ShieldCheck size={24} className="text-primary shrink-0" />
           <p className="text-[10px] font-medium italic text-slate-500">Reportar informações falsas pode impactar negativamente seu <span className="text-primary font-black uppercase">Índice de Pertencimento</span>.</p>
        </div>
      </main>
      <SafetyGuardOverlay />
    </div>
  );
};

export default ReportAlert;
