import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ZapOff } from 'lucide-react';

export const useSpeedGuard = (limitKmH = 15) => {
  const [speed, setSpeed] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const speedMs = position.coords.speed || 0; // m/s
        const speedKmh = speedMs * 3.6;
        setSpeed(speedKmh);
        setIsBlocked(speedKmh > limitKmH);
      },
      (error) => console.error('Speed Guard Error:', error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [limitKmH]);

  return { speed, isBlocked };
};

export const SafetyGuardOverlay: React.FC = () => {
  const { isBlocked, speed } = useSpeedGuard();

  return (
    <AnimatePresence>
      {isBlocked && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#05100a]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center space-y-8"
        >
          <div className="size-32 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 animate-pulse">
             <ShieldAlert size={64} />
          </div>
          
          <div className="space-y-4">
             <h2 className="text-4xl font-black italic uppercase italic tracking-tighter text-white">Segurança Ativada.</h2>
             <p className="text-slate-400 font-medium italic text-sm leading-relaxed max-w-sm">
                Velocidade detectada: <span className="text-red-500 font-black">{speed.toFixed(0)} km/h</span>.<br/> 
                O ECOBR232 bloqueia a interação manual acima de 15km/h para proteger sua vida na rodovia.
             </p>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
             <ZapOff size={16} className="text-slate-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aproveite a Viagem, Use o Viva-Voz</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
