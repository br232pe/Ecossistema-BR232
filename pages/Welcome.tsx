import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, LogIn, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { patronService, Patron } from '../src/services/patronService';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nearestPatron, setNearestPatron] = useState<Patron | null>(null);
  const [loadingPatron, setLoadingPatron] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Get user location and fetch nearest patron
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const patron = await patronService.getNearestPatron(
              position.coords.latitude,
              position.coords.longitude
            );
            setNearestPatron(patron);
            setLoadingPatron(false);
          },
          (error) => {
            console.warn("Geolocation denied or failed:", error);
            setLoadingPatron(false);
          },
          { timeout: 10000 }
        );
      } else {
        setLoadingPatron(false);
      }
    };

    init();
  }, []);

  const handleExplore = () => {
    // Forçamos a navegação absoluta para evitar quebras no HashRouter em produção
    navigate('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#050d09] p-6 overflow-x-hidden safe-pb">
      {/* Banner Principal / Spotlight de Patronos */}
      <div className="relative w-full aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl mt-[env(safe-area-inset-top)] mb-10 group border border-white/10">
        <img 
          src={nearestPatron?.coverImage || "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?auto=format&fit=crop&q=80&w=1000"} 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.8] transition-transform duration-[5000ms] group-hover:scale-110"
          alt={nearestPatron?.name || "Rodovia em Pernambuco"}
        />
        
        {/* Overlay Noir-Emerald */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050d09] via-transparent to-black/30"></div>
        
        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center gap-1">
              <div className="px-3 py-1.5 bg-white rounded-xl border-2 border-slate-900 shadow-2xl">
                 <span className="text-[10px] font-black text-slate-900 leading-none block text-center">BR</span>
                 <div className="h-[2px] bg-slate-900 w-full my-0.5 opacity-20"></div>
                 <span className="text-sm font-black text-slate-900 leading-none block text-center">232</span>
              </div>
              <div className="h-10 w-px bg-gradient-to-b from-primary/60 to-transparent"></div>
              <div className="size-3 rounded-full bg-primary shadow-[0_0_20px_#00e676] animate-pulse"></div>
            </div>

            <div className="size-14 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-2xl">
              <Navigation size={26} className="text-primary fill-primary/20" />
            </div>
          </div>

          <div className="space-y-6">
             {nearestPatron ? (
               <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 bg-primary text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,230,118,0.5)]">
                      Destaque em {nearestPatron.city}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
                      {nearestPatron.name}
                    </h2>
                    <div className="flex items-center gap-2 text-primary/80 font-black text-[10px] uppercase tracking-widest">
                      <MapPin size={12} /> KM {nearestPatron.km} • {nearestPatron.tier}
                    </div>
                  </div>
               </div>
             ) : (
               <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                  <div className="px-5 py-2 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
                     <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00e676]"></div>
                     <span className="text-[9px] font-black uppercase text-white tracking-[0.4em]">MALHA ATIVA</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4">
        <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-[0.85] text-white">
          Ecossistema <br/><span className="text-primary drop-shadow-[0_0_30px_rgba(0,230,118,0.3)]">BR232</span>
        </h1>
        <p className="text-slate-400 text-base font-medium leading-relaxed italic max-w-[90%]">
          Conectando o <span className="text-white font-black underline decoration-primary decoration-4 underline-offset-4">Cais ao Sertão</span>. A inteligência regional que pulsa em cada quilômetro de Pernambuco.
        </p>
      </div>

      <div className="mt-auto pt-12 px-2 space-y-4 pb-[env(safe-area-inset-bottom)]">
        <button 
          id="btn-explore-mesh"
          onClick={handleExplore}
          className="w-full h-20 bg-primary hover:bg-primary-dark text-black rounded-[2.5rem] font-black uppercase text-sm flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_rgba(0,230,118,0.4)] active:scale-95 group"
        >
          Explorar a Malha <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
        </button>

        {!user && (
          <button 
            id="btn-identify"
            onClick={() => navigate('/login')}
            className="w-full h-16 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 transition-all border border-white/10 active:scale-95"
          >
            <LogIn size={18} /> Identificar-se
          </button>
        )}
      </div>
    </div>
  );
};

export default Welcome;