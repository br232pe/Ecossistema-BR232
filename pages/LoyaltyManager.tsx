import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  MapPin, 
  Zap, 
  Timer, 
  CheckCircle2, 
  ChevronRight, 
  Lock, 
  Smartphone,
  Star,
  Activity,
  Navigation,
  Gift,
  QrCode
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { loyaltyService } from '../src/services/loyaltyService';
import { Patron, LoyaltyTransaction } from '../src/types';
import { calculateDistance } from '../src/lib/geo';

const LoyaltyManager: React.FC = () => {
  const { user } = useAuth();
  const [nearbyPatron, setNearbyPatron] = useState<Patron | null>(null);
  const [activeTx, setActiveTx] = useState<LoyaltyTransaction | null>(null);
  const [timer, setTimer] = useState(0);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [txs, setTxs] = useState<LoyaltyTransaction[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Telemetry (Proof-of-Presence)
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    loyaltyService.seedInitialPatrons();
    if (user) {
      loadHistory();
    }
  }, [user]);

  // GPS Watcher
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Seu navegador não suporta geolocalização.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoError(null);
      },
      (err) => {
        console.error("GPS Error:", err);
        setGeoError("Acesso ao GPS negado ou sinal fraco. Ative para registrar checkpoints.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Update distance whenever location or patron changes
  useEffect(() => {
    if (userLocation && nearbyPatron?.location) {
      const d = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        nearbyPatron.location.lat, 
        nearbyPatron.location.lng
      );
      setDistance(d);
    }
  }, [userLocation, nearbyPatron]);

  const loadHistory = async () => {
    if (!user) return;
    const history = await loyaltyService.getRecentTransactions(user.uid);
    setTxs(history || []);
  };

  // Scan Nearby Patrons
  const handleScan = async () => {
    if (!userLocation) {
      alert("Aguardando sinal de GPS...");
      return;
    }
    setLoading(true);
    try {
      const results = await loyaltyService.findNearbyPatrons(userLocation.lat, userLocation.lng);
      if (results.length > 0) {
        setNearbyPatron(results[0]);
      } else {
        alert("Nenhum Patrono verificado em um raio de 1km. Tente novamente em Gravatá ou Bezerros (Área de Teste).");
      }
    } catch (err) {
      console.error("Erro ao buscar patronos:", err);
    } finally {
      setLoading(false);
    }
  };

  const startLoyaltySession = async () => {
    if (!user || !nearbyPatron || distance === null) return;
    
    // BARREIRA DE SEGURANÇA: 100m
    if (distance > 100) {
      alert(`Você está fora do raio de presença (Distância: ${distance}m). Aproxime-se a menos de 100m para validar.`);
      return;
    }

    setLoading(true);
    try {
      const docRef = await loyaltyService.startTransition(user.uid, nearbyPatron.id);
      if (docRef) {
        setActiveTx({
          id: docRef.id,
          userId: user.uid,
          patronId: nearbyPatron.id,
          weights: { proximity: true, entry: false, permanence: false, conversion: false },
          status: 'pending',
          kmEarned: 0,
          timeSpentSeconds: 0,
          createdAt: new Date()
        } as any);
      }
    } catch (e: any) {
       console.error("Erro ao iniciar sessão:", e);
       alert("Erro de permissão ou conexão com a malha. Verifique sua conta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (activeTx && distance !== null && distance < 30) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTx, distance]);

  // Update telemetry when timer hits 90s
  useEffect(() => {
    if (timer === 90 && activeTx) {
      loyaltyService.updateTelemetry(activeTx.id, true, true, 90).catch(console.error);
      setActiveTx(prev => prev ? {
        ...prev,
        weights: { ...prev.weights, entry: true, permanence: true }
      } : null);
    }
  }, [timer, activeTx]);

  const finalizeConversion = async () => {
    if (!activeTx || !nearbyPatron || distance === null) return;
    
    // BARREIRA DE SEGURANÇA: 100m na conversão final
    if (distance > 100) {
      alert(`Validação Bloqueada: Você se afastou do local (Distância: ${distance}m). Aproxime-se para concluir.`);
      return;
    }

    setLoading(true);
    try {
      await loyaltyService.confirmPurchase(
        activeTx.id, 
        inputCode, 
        nearbyPatron.loyaltyConfig?.dailyCode || '', 
        nearbyPatron.loyaltyConfig?.pointsPerPurchase || 0
      );
      alert("✅ Checkpoint Rubi Confirmado! +5 KMs de Influência.");
      setActiveTx(null);
      setNearbyPatron(null);
      setTimer(0);
      setInputCode('');
      loadHistory();
    } catch (e: any) {
      alert("Erro na validação: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="loyalty-manager-page" className="min-h-screen bg-[#05100a] text-white pb-32">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        
        <header id="loyalty-header" className="space-y-4 text-center">
           <div className="size-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
              <Shield size={32} />
           </div>
           <h1 className="text-4xl font-black italic uppercase italic tracking-tighter">Porta-Luvas <br/><span className="text-primary italic">Digital.</span></h1>
           <p className="text-slate-400 text-sm font-medium italic">Fidelidade e Mérito com Geofencing Ativo.</p>
           
           {geoError && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
               className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest italic"
             >
               ⚠️ {geoError}
             </motion.div>
           )}
        </header>

        {!nearbyPatron && !activeTx && (
          <motion.div 
            id="scan-section"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-12 bg-white/5 border border-dashed border-white/10 rounded-[3rem] text-center space-y-8"
          >
             <div className="size-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-[0_0_50px_rgba(0,230,118,0.1)]">
                <QrCode size={48} className="group-hover:scale-110 transition-transform" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black italic uppercase italic">Identifique-se no Local</h3>
                <p className="text-slate-500 text-xs italic leading-relaxed">Clique abaixo para escanear a malha BR-232 e detectar o estabelecimento Patrono próximo a você.</p>
             </div>
             <button 
               id="btn-scan-loyalty"
               onClick={handleScan}
               disabled={!!geoError || loading}
               className="h-16 px-12 bg-primary text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 flex items-center gap-3 mx-auto"
             >
               <QrCode size={20} />
               Ler QR Code do Checkpoint
             </button>
          </motion.div>
        )}

        {nearbyPatron && !activeTx && (
          <motion.div 
            id="patron-detected-section"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-6"
          >
            <div className="flex items-center gap-4">
               <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-black">
                  <Zap size={24} fill="currentColor" />
               </div>
               <div>
                  <h3 className="text-2xl font-black italic uppercase italic">{nearbyPatron.name}</h3>
                  <p className={`text-xs font-bold uppercase tracking-widest ${(distance !== null && distance > 100) ? 'text-red-500' : 'text-primary'}`}>
                    {distance !== null ? `A ${distance} metros de você` : 'Calculando distância...'}
                  </p>
               </div>
            </div>
            
            <div className="p-6 bg-black/40 rounded-2xl space-y-4">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Recompensa Disponível</span>
                  <span className="text-primary">+5 KMs de Influência</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[3%] bg-primary" />
               </div>
               <p className="text-[10px] text-slate-400 italic">
                 {(distance !== null && distance > 100) 
                  ? "❌ VOCÊ ESTÁ FORA DO RAIO. Aproxime-se a menos de 100m."
                  : "✅ Presença detectada. Telemetria de 90s iniciará ao clicar."
                 }
               </p>
            </div>

            <button 
              id="btn-confirm-arrival"
              onClick={startLoyaltySession}
              disabled={loading || (distance !== null && distance > 100)}
              className="w-full h-16 bg-primary text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:bg-slate-800 disabled:text-slate-500"
            >
              <CheckCircle2 size={20} />
              Confirmar Chegada (Resgate)
            </button>
          </motion.div>
        )}

        {activeTx && (
          <motion.div 
             id="active-session-section"
             initial={{ scale: 0.95, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }}
             className="space-y-8"
          >
             {/* Progress Circles */}
             <div className="grid grid-cols-3 gap-4">
                <WeightCircle label="Proximidade" active={activeTx.weights.proximity} value="3%" />
                <WeightCircle label="Permanência" active={activeTx.weights.permanence} value="10%" timer={timer} />
                <WeightCircle label="Conversão" active={activeTx.weights.conversion} value="80%" />
             </div>

             <section className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8 text-center">
                <div className="space-y-2">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary">
                      <Activity size={12} className="animate-spin" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Telemetria Ativa</span>
                   </div>
                   <h3 className="text-2xl font-black italic uppercase italic">Conversão Rubi</h3>
                   <p className="text-slate-500 text-xs italic">Solicite ao comerciante o código de validação da compra.</p>
                </div>

                <div className={`space-y-4 max-w-xs mx-auto transition-all duration-500 ${timer >= 90 ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none'}`}>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-6 flex items-center text-slate-700">
                         <Lock size={20} />
                      </div>
                      <input 
                        id="loyalty-input-code"
                        type="text" 
                        maxLength={4}
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="CÓDIGO"
                        className="w-full h-20 bg-black border-2 border-white/5 rounded-3xl text-center text-3xl font-black tracking-[0.5em] focus:border-primary transition-all placeholder:text-slate-800 focus:outline-none"
                      />
                   </div>
                   <button 
                     id="btn-validate-loyalty"
                     onClick={finalizeConversion}
                     disabled={loading || inputCode.length < 4}
                     className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-xs disabled:opacity-50 transition-all hover:bg-primary"
                   >
                     Validar Aquisição
                   </button>
                </div>

                {timer < 90 && (
                  <p className="text-[9px] text-center text-slate-500 font-black uppercase tracking-widest mt-4 animate-pulse">
                    Aguarde a telemetria de presença: {90 - timer}s restantes
                  </p>
                )}

                <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <Timer size={14} />
                   <span>{timer}s de Parada Registrada</span>
                </div>
             </section>
          </motion.div>
        )}

        {/* Visual do Cartão de Fidelidade (Slots) */}
        <section id="loyalty-card-visual" className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-xl font-black italic uppercase italic leading-none">Registro de Rota</h3>
                 <p className="text-[9px] font-bold text-primary uppercase tracking-widest leading-relaxed">Registre 10 checkpoints lindeiros para destravar o Benefício Elite</p>
              </div>
              <div className="text-right">
                 <span className="text-3xl font-black italic text-primary">{txs.length % 10}/10</span>
              </div>
           </div>

           <div className="grid grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => {
                 const isFilled = i < (txs.length % 10);
                 const isNext = i === (txs.length % 10);
                 
                 return (
                   <div 
                     key={i} 
                     className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                       isFilled 
                       ? 'bg-primary border-primary shadow-[0_0_15px_rgba(0,230,118,0.3)] text-black' 
                       : isNext 
                       ? 'bg-white/5 border-primary/30 border-dashed animate-pulse text-slate-700' 
                       : 'bg-black/40 border-white/5 text-slate-800'
                     }`}
                   >
                      {isFilled ? <Star size={20} fill="currentColor" /> : <div className="size-2 bg-current rounded-full" />}
                   </div>
                 );
              })}
           </div>

           <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                 <Gift size={14} className="text-primary" />
                 Prêmio Atual: <span className="text-white">Café Regional + 50 KMs de Influência</span>
              </div>
           </div>
        </section>

        {/* Recent History / Selos Colecionados */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary italic">Porta-Luvas (Checkpoints Validados)</h3>
              <span className="text-[9px] font-black uppercase text-slate-500">{txs.length} Checkpoints</span>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {txs.map(tx => (
                <motion.div 
                  key={tx.id} 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-white/5 border border-white/5 rounded-[2rem] text-center space-y-4 relative overflow-hidden group"
                >
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="size-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-lg shadow-primary/10">
                      <Star size={24} fill="currentColor" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Checkpoint Confirmado</p>
                      <p className="text-[8px] text-primary font-black uppercase mt-1 italic">+{tx.kmEarned} KMs de Influência</p>
                   </div>
                   <div className="pt-2 border-t border-white/5">
                      <p className="text-[8px] text-slate-500 uppercase font-black">{new Date(tx.completedAt?.seconds * 1000).toLocaleDateString() || 'Recent'}</p>
                   </div>
                </motion.div>
              ))}
              
              {txs.length === 0 && (
                <div className="col-span-2 py-12 text-center border border-dashed border-white/10 rounded-[2rem]">
                   <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Nenhum checkpoint validado ainda.</p>
                </div>
              )}
           </div>
        </section>

      </div>
    </div>
  );
};

const WeightCircle = ({ label, active, value, timer }: any) => (
  <div className="flex flex-col items-center gap-3">
     <div className={`size-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${active ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(0,230,118,0.2)]' : 'bg-white/5 border-white/10 opacity-30'}`}>
        {active ? <CheckCircle2 size={24} className="text-primary" /> : <div className="text-[10px] font-black">{value}</div>}
     </div>
     <div className="text-center">
        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        {timer !== undefined && timer > 0 && timer < 90 && (
          <p className="text-[10px] font-black italic text-primary">{timer}s</p>
        )}
     </div>
  </div>
);

export default LoyaltyManager;
