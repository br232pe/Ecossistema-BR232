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
  Info
} from 'lucide-react';
import { useAuth, db } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserIdentities } from '../types';

const BR232_CITIES = [
  "Recife",
  "Jaboatão dos Guararapes",
  "Moreno",
  "Vitória de Santo Antão",
  "Pombos",
  "Gravatá",
  "Bezerros",
  "Caruaru",
  "São Caetano",
  "Pesqueira",
  "Arcoverde",
  "Serra Talhada",
  "Salgueiro",
  "Sanharó",
  "Belo Jardim",
  "Sertânia",
  "Custódia",
  "Parnamirim",
  "Ouricuri",
  "Araripina"
];

const SHOWN_SHORTCUTS = [
  { label: "Recife", value: "Recife" },
  { label: "Jaboatão", value: "Jaboatão dos Guararapes" },
  { label: "Vitória", value: "Vitória de Santo Antão" },
  { label: "Gravatá", value: "Gravatá" },
  { label: "Caruaru", value: "Caruaru" },
  { label: "Arcoverde", value: "Arcoverde" },
  { label: "Serra Talhada", value: "Serra Talhada" },
  { label: "Salgueiro", value: "Salgueiro" }
];

interface SimaWizardProps {
  onFinish?: () => void;
}

const SimaWizard: React.FC<SimaWizardProps> = ({ onFinish }) => {
  const { user, profile } = useAuth();
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
  const [citySearch, setCitySearch] = useState("Recife");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Simulator State (for Driver association)
  const [memberEstimate, setMemberEstimate] = useState(100);
  const [planConfig, setPlanConfig] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setIdentities(profile.identities);
      if (profile.currentCity) {
        setCity(profile.currentCity);
        setCitySearch(profile.currentCity);
      }
    }
  }, [profile]);

  useEffect(() => {
    // Fetch plan config for simulation
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'config_plans', 'assoc_custom'));
        if (docSnap.exists()) {
          setPlanConfig(docSnap.data());
        }
      } catch (err) {
        console.error("Erro ao carregar configurações de simulação:", err);
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
    if (key === 'isConsumer') return; // Base identity is permanent
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
      if (onFinish) {
        onFinish();
      }
    } catch (error) {
      console.error("Erro ao sincronizar dados na malha:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-white">
      <div className="max-w-xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="space-y-4 text-center">
          <div className="size-16 rounded-3xl bg-[#00e66b]/10 border border-[#00e66b]/30 flex items-center justify-center text-[#00e66b] mx-auto">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            SIMA <br/>
            <span className="text-[#00e66b] italic">Sua Identidade na Malha.</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium italic">Como você deseja agir dentro do ecossistema ECOBR232?</p>
        </header>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-[#00e66b]' : 'w-4 bg-white/10'}`} 
            />
          ))}
        </div>

        <main className="min-h-[350px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-2 text-left">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#00e66b] italic">Passo 1: Geografia e Identidade</h3>
                  <p className="text-slate-500 text-xs font-bold italic uppercase">Onde você atua e qual seu papel na malha?</p>
                </div>

                {/* City Selection */}
                <div className="space-y-4 text-left relative">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Sua Cidade na Rodovia</label>
                   <div className="relative">
                     <input 
                       type="text"
                       value={citySearch}
                       onChange={(e) => {
                         const val = e.target.value;
                         setCitySearch(val);
                         setShowSuggestions(true);
                         // Auto recognize matching city immediately
                         const match = BR232_CITIES.find(c => c.toLowerCase() === val.trim().toLowerCase());
                         if (match) {
                           setCity(match);
                         } else {
                           setCity(val);
                         }
                       }}
                       onFocus={() => setShowSuggestions(true)}
                       onBlur={() => {
                         // Delay slightly so that onClick/onMouseDown can fire first
                         setTimeout(() => {
                           setShowSuggestions(false);
                         }, 200);
                       }}
                       placeholder="Buscar ou digite sua cidade lindeira..."
                       className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e66b]/40 focus:border-[#00e66b] transition-all"
                     />
                     {showSuggestions && citySearch.trim() !== '' && (
                       <div className="absolute top-[3.75rem] left-0 right-0 max-h-60 overflow-y-auto bg-[#0d1510] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl backdrop-blur-xl">
                         {(() => {
                           const filtered = BR232_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));
                           if (filtered.length > 0) {
                             return filtered.map(c => (
                               <button
                                 key={c}
                                 type="button"
                                 onMouseDown={() => {
                                   setCity(c);
                                   setCitySearch(c);
                                   setShowSuggestions(false);
                                 }}
                                 className="w-full text-left px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center justify-between animate-fade-in"
                               >
                                 <span>{c}</span>
                                 {city === c && <Check size={12} className="text-[#00e66b]" />}
                               </button>
                             ));
                           } else {
                             return <div className="px-4 py-3 text-xs text-slate-500 italic">Nenhuma cidade lindeira oficial encontrada. Armazenando como digitado.</div>;
                           }
                         })()}
                       </div>
                     )}
                   </div>
                   
                   <div className="pt-4 space-y-3">
                     <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest pl-2">Atalhos (8 Polos Geoeconômicos da Malha)</p>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {SHOWN_SHORTCUTS.map(c => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => {
                              setCity(c.value);
                              setCitySearch(c.value);
                              setShowSuggestions(false);
                            }}
                            className={`p-4 rounded-xl border text-center transition-all min-h-12 flex items-center justify-center active:scale-95 ${
                              city === c.value 
                              ? 'bg-[#00e66b]/20 border-[#00e66b]/40 text-[#00e66b]' 
                              : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-300'
                            }`}
                          >
                            <span className="text-[10px] font-black italic uppercase leading-tight">{c.label}</span>
                          </button>
                        ))}
                     </div>
                   </div>
                </div>

                <div className="space-y-4 text-left">
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
                <div className="space-y-2 text-left">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#00e66b] italic">Passo 2: Gestão de Atividade</h3>
                  <p className="text-slate-500 text-xs font-bold italic uppercase">Configurações específicas para seus papéis.</p>
                </div>

                {identities.isDriver && (
                  <section className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 text-left">
                    <div className="flex items-center gap-4">
                      <Calculator className="text-[#00e66b]" />
                      <h4 className="text-lg font-black italic uppercase">Simulador de Associação</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Estimativa de Operadores Autorizados</label>
                      <input 
                        type="range" min="10" max="2000" step="10"
                        value={memberEstimate}
                        onChange={(e) => setMemberEstimate(Number(e.target.value))}
                        className="w-full accent-[#00e66b] bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between items-center mt-2">
                         <span className="text-xl font-black italic">{memberEstimate} <span className="text-[10px] uppercase text-slate-500">Credenciados</span></span>
                      </div>
                    </div>

                    <div className="p-6 bg-[#00e66b]/5 border border-[#00e66b]/20 rounded-2xl flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-[#00e66b] tracking-[0.2em] italic">Custo Operacional</p>
                          <div className="text-3xl font-black italic">R$ {calculateFee().toFixed(2)}</div>
                       </div>
                       <Info size={16} className="text-[#00e66b] opacity-50" />
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                      *Cálculo baseado no modelo cooperativo: base fixa mais bracket de volume por km.
                    </p>
                  </section>
                )}

                {identities.isPatron && (
                  <section className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4 text-left">
                    <div className="flex items-center gap-4">
                      <Store className="text-[#00e66b]" />
                      <h4 className="text-lg font-black italic uppercase">Dados do Negócio</h4>
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
                <div className="size-20 bg-[#00e66b]/20 border-2 border-[#00e66b] rounded-[2rem] flex items-center justify-center text-[#00e66b] mx-auto shadow-[0_0_50px_rgba(0,230,118,0.2)]">
                   <div className="size-10 bg-[#00e66b] rounded-full flex items-center justify-center text-black">
                      <Check size={24} strokeWidth={4} />
                   </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-black italic uppercase leading-tight">Quase tudo pronto!</h2>
                  <p className="text-slate-400 text-sm italic max-w-sm mx-auto leading-normal">
                    Ao confirmar, você aceita a <span className="text-[#00e66b]">Privacidade e Termos de Uso do ECOBR232</span>.
                  </p>
                  <div className="flex justify-center gap-4 text-[9px] font-black uppercase tracking-widest pt-2">
                    <a href="#/central-de-politicas" className="text-slate-500 hover:text-[#00e66b] transition-colors underline">Privacidade</a>
                    <a href="#/termos" className="text-slate-500 hover:text-[#00e66b] transition-colors underline">Termos de Uso</a>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(identities).map(([key, val]) => val && (
                    <span key={key} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-[#00e66b] italic">
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
            type="button"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className={`flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          {step < 3 ? (
            <button 
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="h-16 px-10 bg-white text-black rounded-2xl font-black uppercase text-xs flex items-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              Próximo <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="h-16 px-10 bg-[#00e66b] text-black rounded-2xl font-black uppercase text-xs flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-[#00e66b]/20 disabled:opacity-50"
            >
              {loading ? 'Sincronizando...' : 'Concluir Registro'} <ZapIcon size={18} fill="currentColor" className="text-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ZapIcon = ({ size, fill, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IdentityCard = ({ active, icon, label, desc, onClick, locked }: any) => (
  <motion.button 
    whileTap={!locked ? { scale: 0.98 } : {}}
    type="button"
    onClick={onClick}
    className={`w-full p-6 text-left rounded-[2rem] border transition-all duration-300 flex items-center gap-6 ${
      active 
      ? 'bg-[#00e66b]/10 border-[#00e66b]/40 shadow-[0_10px_30px_rgba(0,230,118,0.05)]' 
      : 'bg-white/5 border-white/5 hover:border-white/20'
    } ${locked ? 'opacity-50 cursor-default' : ''}`}
  >
    <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-[#00e66b] text-black' : 'bg-white/5 text-slate-500'}`}>
      {icon}
    </div>
    <div className="flex-1 space-y-1 p-0">
      <div className="flex items-center justify-between">
        <span className="font-black italic uppercase leading-none text-white text-sm">{label}</span>
        {active && <Check size={16} className="text-[#00e66b]" />}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight italic">{desc}</p>
    </div>
  </motion.button>
);

export default SimaWizard;
