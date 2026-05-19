import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Store, 
  Bike, 
  Shield, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Calculator,
  Info,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useAuth } from '../src/contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import { UserIdentities } from '../src/types';
import PlaceAutocomplete from '../src/components/PlaceAutocomplete';

const API_KEY = import.meta.env.VITE_GOOGLE_MAP || '';

const MultimodalRegistration: React.FC = () => {
  return <MultimodalRegistrationContent />;
};

const MultimodalRegistrationContent: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Selected Identities
  const [identities, setIdentities] = useState<UserIdentities>({
    isConsumer: true,
    isPatron: false,
    isDriver: false,
    isGuardian: false,
    isSecretary: false,
    isAssociationManager: false,
    isTravelManager: false,
    isServiceProvider: false,
    isColumnist: false
  });

  const [city, setCity] = useState("Recife");

  // Simulator State (for Driver association)
  const [memberEstimate, setMemberEstimate] = useState(100);
  const [planConfig, setPlanConfig] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setIdentities(profile.identities);
      if (profile.currentCity) setCity(profile.currentCity);
    }
  }, [profile]);

  useEffect(() => {
    // Fetch plan config for simulation
    const fetchConfig = async () => {
      const docSnap = await getDoc(doc(db, 'config_plans', 'assoc_custom'));
      if (docSnap.exists()) {
        setPlanConfig(docSnap.data());
      }
    };
    fetchConfig();
  }, []);

  const calculateFee = () => {
    if (!planConfig) return 0;
    const { base_price, bracket_1_price, bracket_2_price, bracket_3_price } = planConfig;
    
    let bracketPrice = bracket_1_price;
    if (memberEstimate > 500) bracketPrice = bracket_2_price;
    if (memberEstimate > 1000) bracketPrice = bracket_3_price;

    return base_price + (memberEstimate * bracketPrice);
  };

  const handleIdentityToggle = (key: keyof UserIdentities) => {
    if (key === 'isConsumer') return; // Cannot toggle off base identity
    setIdentities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        identities,
        currentCity: city,
        updatedAt: serverTimestamp()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error updating identities:", error);
    } finally {
      setLoading(false);
    }
  };

  const cities = [
    { name: "Recife", type: "Tronco" },
    { name: "Jaboatão", type: "Tronco" },
    { name: "Vitória", type: "Galho" },
    { name: "Gravatá", type: "Galho" },
    { name: "Bezerros", type: "Galho" },
    { name: "Caruaru", type: "Galho" },
    { name: "São Caetano", type: "Galho" },
    { name: "Belo Jardim", type: "Galho" },
    { name: "Arcoverde", type: "Galho" },
    { name: "Salgueiro", type: "Raiz" },
    { name: "Serra Talhada", type: "Raiz" },
    { name: "Parnamirim", type: "Raiz" }
  ];

  return (
    <div className="min-h-screen bg-[#05100a] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 space-y-12">
        
        {/* Header */}
        <header className="space-y-4 text-center">
          <div className="size-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-black italic uppercase italic tracking-tighter">Sua Identidade <br/><span className="text-primary italic">na Malha.</span></h1>
          <p className="text-slate-400 text-sm font-medium italic">Como você deseja agir dentro do ecossistema ECOBR232?</p>
        </header>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-primary' : 'w-4 bg-white/10'}`} 
            />
          ))}
        </div>

        <main className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary italic">Passo 1: Geografia e Identidade</h3>
                  <p className="text-slate-500 text-xs font-bold italic uppercase">Onde você atua e qual seu papel na malha?</p>
                </div>

                {/* City Selection */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Sua Cidade na Rodovia</label>
                   <PlaceAutocomplete 
                     defaultValue={city}
                     onPlaceSelect={(p) => p && setCity(p.displayName || '')}
                     placeholder="Buscar sua cidade..."
                   />
                   
                   <div className="pt-4 space-y-2">
                     <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest pl-2">Atalhos (Cidades Tronco)</p>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {cities.filter(c => c.type === 'Tronco').map(c => (
                          <button
                            key={c.name}
                            onClick={() => setCity(c.name)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              city === c.name 
                              ? 'bg-primary/20 border-primary/40' 
                              : 'bg-white/5 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="text-[10px] font-black italic uppercase italic">{c.name}</div>
                          </button>
                        ))}
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Selecione suas Vocações</label>
                   <div className="grid gap-4">
                      <IdentityCard 
                        active={identities.isConsumer} 
                        icon={<User size={24}/>} 
                        label="Consumidor" 
                        desc="Acesso base a alertas e marketplace." 
                        locked 
                      />
                      <IdentityCard 
                        active={identities.isPatron} 
                        onClick={() => handleIdentityToggle('isPatron')}
                        icon={<Store size={24}/>} 
                        label="Patrono (Negócio)" 
                        desc="Anuncie sua empresa e fidelize clientes lindeiros." 
                      />
                      <IdentityCard 
                        active={identities.isDriver} 
                        onClick={() => handleIdentityToggle('isDriver')}
                        icon={<Bike size={24}/>} 
                        label="Moto-Táxi Elite" 
                        desc="Atendimento profissional e ranking de mérito." 
                      />
                      <IdentityCard 
                        active={identities.isGuardian} 
                        onClick={() => handleIdentityToggle('isGuardian')}
                        icon={<Shield size={24}/>} 
                        label="Guardião de Trecho" 
                        desc="Agente de segurança e reporte de alta precisão." 
                      />
                   </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary italic">Passo 2: Gestão Canônica</h3>
                  <p className="text-slate-500 text-xs font-bold italic uppercase">Configurações específicas para seus papéis.</p>
                </div>

                {identities.isDriver && (
                  <section className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-4">
                      <Calculator className="text-primary" />
                      <h4 className="text-lg font-black italic uppercase italic">Simulador de Associação</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Estimativa de Membros</label>
                      <input 
                        type="range" min="10" max="2000" step="10"
                        value={memberEstimate}
                        onChange={(e) => setMemberEstimate(Number(e.target.value))}
                        className="w-full accent-primary bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between items-center mt-2">
                         <span className="text-xl font-black italic">{memberEstimate} <span className="text-[10px] uppercase text-slate-500">Membros</span></span>
                      </div>
                    </div>

                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] italic">Custo Operacional</p>
                          <div className="text-3xl font-black italic">R$ {calculateFee().toFixed(2)}</div>
                       </div>
                       <Info size={16} className="text-primary opacity-50" />
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                      *Cálculo baseado no Elemento X: Base R$ 600 + brackets de volume.
                    </p>
                  </section>
                )}

                {identities.isPatron && (
                  <section className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                    <div className="flex items-center gap-4">
                      <Store className="text-primary" />
                      <h4 className="text-lg font-black italic uppercase italic">Dados do Negócio</h4>
                    </div>
                    <p className="text-slate-400 text-xs italic">Seu perfil será encaminhado para a Secretaria de Verificação.</p>
                    <div className="grid gap-3">
                       <div className="h-14 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-slate-500 text-sm italic">Nome Fantasia</div>
                       <div className="h-14 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-slate-500 text-sm italic">Localização (KM sugerido)</div>
                    </div>
                  </section>
                )}

                {!identities.isDriver && !identities.isPatron && (
                   <div className="p-12 text-center space-y-4">
                      <div className="size-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700 mx-auto">
                         <Check size={40} />
                      </div>
                      <p className="text-slate-400 text-xs italic">Você escolheu continuar como um consumidor base. Suas permissões serão padrão.</p>
                   </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center py-10"
              >
                <div className="size-20 bg-primary/20 border-2 border-primary rounded-[2rem] flex items-center justify-center text-primary mx-auto shadow-[0_0_50px_rgba(0,230,118,0.2)]">
                   <div className="size-10 bg-primary rounded-full flex items-center justify-center text-black">
                      <Check size={24} strokeWidth={4} />
                   </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-black italic uppercase italic leading-tight">Quase tudo pronto!</h2>
                  <p className="text-slate-400 text-sm italic max-w-sm mx-auto">
                    Ao confirmar, você aceita o <span className="text-primary underline">Pacto de Estabilidade ECOBR232</span> e as diretrizes do Elemento X.
                  </p>
                  <div className="flex justify-center gap-4 text-[9px] font-black uppercase tracking-widest">
                    <a href="/politica-de-privacidade.html" target="_blank" className="text-slate-500 hover:text-primary transition-colors underline">Privacidade</a>
                    <a href="/termos-uso.html" target="_blank" className="text-slate-500 hover:text-primary transition-colors underline">Termos de Uso</a>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(identities).map(([key, val]) => val && (
                    <span key={key} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-primary italic">
                      {key.replace('is', '')}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-10">
          <button 
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className={`flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          {step < 3 ? (
            <button 
              onClick={() => setStep(prev => prev + 1)}
              className="h-16 px-10 bg-white text-black rounded-2xl font-black uppercase text-xs flex items-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              Próximo <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              disabled={loading}
              className="h-16 px-10 bg-primary text-black rounded-2xl font-black uppercase text-xs flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? 'Sincronizando...' : 'Concluir Registro'} <Zap size={18} fill="currentColor" className="text-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Zap = ({ size, fill, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IdentityCard = ({ active, icon, label, desc, onClick, locked }: any) => (
  <motion.button 
    whileTap={!locked ? { scale: 0.98 } : {}}
    onClick={onClick}
    className={`w-full p-6 text-left rounded-[2rem] border transition-all duration-300 flex items-center gap-6 ${
      active 
      ? 'bg-primary/10 border-primary/40 shadow-[0_10px_30px_rgba(0,230,118,0.05)]' 
      : 'bg-white/5 border-white/5 hover:border-white/20'
    } ${locked ? 'opacity-50 cursor-default' : ''}`}
  >
    <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-primary text-black' : 'bg-white/5 text-slate-500'}`}>
      {icon}
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="font-black italic uppercase italic leading-none">{label}</h4>
        {active && <Check size={16} className="text-primary" />}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight italic">{desc}</p>
    </div>
  </motion.button>
);

export default MultimodalRegistration;
