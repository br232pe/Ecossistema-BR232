
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BR232_TAXONOMY, InfluenceZone } from '../types';
import { performCommunityScreening } from '../geminiService';
import { 
  Heart, 
  Briefcase, 
  Store, 
  Users, 
  Search, 
  TrendingUp, 
  MapPin, 
  Zap, 
  Loader2,
  Sparkles,
  ArrowRight,
  UserPlus
} from 'lucide-react';

const CommunityLife: React.FC<{ auth?: boolean }> = ({ auth = false }) => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(BR232_TAXONOMY[0].name);
  const [screening, setScreening] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cityData = BR232_TAXONOMY.find(c => c.name === selectedCity);

  const runScreening = async (city: string) => {
    setLoading(true);
    const data = await performCommunityScreening(city);
    setScreening(data);
    setLoading(false);
  };

  useEffect(() => {
    runScreening(selectedCity);
  }, [selectedCity]);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white pb-32">
      <header className="p-6 space-y-4 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-secondary">
              <Heart size={24} fill="currentColor" />
              <h1 className="text-xl font-black italic uppercase tracking-tighter">Vida da 232</h1>
           </div>
           <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase border border-primary/20">
              4.6M de Pessoas
           </div>
        </div>
        
        <div className="relative">
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-2xl px-12 text-sm font-black uppercase appearance-none focus:ring-2 focus:ring-secondary transition-all"
          >
            {BR232_TAXONOMY.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <MapPin className="absolute left-4 top-4 text-slate-400" size={20} />
          <Search className="absolute right-4 top-4 text-slate-400" size={20} />
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Guest Invite Banner */}
        {!auth && (
          <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center space-y-4">
             <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <UserPlus size={28} />
             </div>
             <div>
                <h3 className="text-base font-black italic uppercase">Participe da conversa</h3>
                <p className="text-xs text-slate-500 font-medium uppercase mt-1 px-4">Logado, você pode postar avisos, comentar notícias e fortalecer seu comércio local.</p>
             </div>
             <button onClick={() => navigate('/login')} className="h-12 px-8 bg-primary text-black rounded-xl font-black uppercase text-[10px] italic shadow-lg shadow-primary/10">
                Criar Perfil
             </button>
          </section>
        )}

        {/* Radar da Cidade */}
        <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <TrendingUp size={120} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black italic uppercase leading-none">{selectedCity}</h2>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1">
                    {cityData?.zone} • {cityData?.region}
                  </p>
               </div>
               <button onClick={() => runScreening(selectedCity)} className="p-3 bg-secondary/10 text-secondary rounded-2xl hover:bg-secondary/20 transition-all">
                  <Zap size={20} fill={loading ? 'none' : 'currentColor'} className={loading ? 'animate-pulse' : ''} />
               </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                 <Loader2 className="animate-spin text-secondary" size={48} />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rodando Screening na Malha...</p>
              </div>
            ) : screening ? (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PulseCard icon={<Store className="text-blue-500"/>} title="Dimensão Empresarial" content={screening.economy} />
                <PulseCard icon={<Users className="text-green-500"/>} title="Dimensão Pessoas" content={screening.events} />
                <PulseCard icon={<Sparkles className="text-yellow-500"/>} title="Pulsação Social" content={screening.pulse} />
                <PulseCard icon={<Briefcase className="text-primary"/>} title="Oportunidades" content={screening.opportunities} />
              </div>
            ) : null}
          </div>
        </section>

        {/* Mosaico de Vida Local */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Vozes da Região</h3>
          <div className="grid grid-cols-2 gap-3">
             <LifeAction icon="local_mall" label="Feiras Locais" color="bg-orange-500" />
             <LifeAction icon="groups" label="Ajuda Comunitária" color="bg-red-500" />
             <LifeAction icon="campaign" label="Vagas e Bizus" color="bg-blue-600" />
             <LifeAction icon="celebration" label="Cultura e Lazer" color="bg-purple-600" />
          </div>
        </section>

        {/* Banner de Anúncio Inteligente */}
        <div className="bg-gradient-to-br from-primary to-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between group cursor-pointer" onClick={() => navigate('/anunciar')}>
           <div className="space-y-2">
              <h4 className="text-lg font-black italic uppercase leading-tight">Sua empresa na <br/>vida de {selectedCity}?</h4>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Anuncie onde as pessoas estão.</p>
           </div>
           <div className="size-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
              <ArrowRight size={24} />
           </div>
        </div>
      </main>
    </div>
  );
};

const PulseCard: React.FC<{ icon: React.ReactNode, title: string, content: string }> = ({ icon, title, content }) => (
  <div className="p-4 bg-slate-50 dark:bg-background-dark/50 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
    <div className="flex items-center gap-2">
       {icon}
       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</h4>
    </div>
    <p className="text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300 italic">
       "{content}"
    </p>
  </div>
);

const LifeAction: React.FC<{ icon: string, label: string, color: string }> = ({ icon, label, color }) => (
  <button className={`flex flex-col items-center justify-center p-6 rounded-3xl ${color} text-white shadow-lg active:scale-95 transition-all gap-3`}>
     <span className="material-symbols-outlined text-[32px]">{icon}</span>
     <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight">{label}</span>
  </button>
);

export default CommunityLife;
