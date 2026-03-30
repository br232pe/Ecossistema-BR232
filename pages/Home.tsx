
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MapPin, CheckCircle2, ChevronRight, ShieldCheck, LogIn, UserPlus, Gift, ShoppingCart } from 'lucide-react';
import { getRealTimeRoadNews } from '../geminiService';
import { useAuth } from '../src/contexts/AuthContext';

const Home: React.FC<{ auth?: boolean }> = ({ auth: authProp = false }) => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const user = authContext?.user;
  const profile = authContext?.profile;
  const [news, setNews] = useState<{ summary: string; sources: any[] } | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    getRealTimeRoadNews()
      .then(setNews)
      .catch(err => console.error("Erro ao carregar notícias:", err));
  }, []);

  return (
    <div className="bg-[#050d09] min-h-screen text-white safe-pb relative overflow-x-hidden">
      {/* Header Premium */}
      <header className="px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative group cursor-pointer" onClick={() => navigate('/perfil')}>
              <div className="size-14 rounded-[1.5rem] border-2 border-primary/30 p-1 bg-gradient-to-br from-primary/10 to-transparent transition-all group-hover:border-primary">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    className="w-full h-full rounded-[1.1rem] object-cover" 
                    alt="Perfil" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-[1.1rem] bg-primary/20 flex items-center justify-center text-primary font-black">
                    {user?.displayName?.charAt(0) || 'V'}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 size-5 bg-primary border-[3px] border-[#050d09] rounded-lg flex items-center justify-center">
                <ShieldCheck size={10} className="text-black" />
              </div>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="size-14 rounded-[1.5rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 active:scale-95 transition-all group"
            >
              <UserPlus size={20} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase text-white/60">Entrar</span>
            </button>
          )}
          
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5 italic">Bem-vindo à malha</p>
            <h2 className="text-xl font-black tracking-tighter leading-none italic">
              {isAuthenticated ? `Olá, ${user?.displayName?.split(' ')[0] || 'Viajante'}` : 'Visitante'}
            </h2>
          </div>
        </div>
        <button className="size-12 rounded-2xl bg-[#12261d] flex items-center justify-center relative border border-white/5 active:scale-90 transition-all">
          <Bell size={22} className="text-white/80" />
          <div className="absolute top-3.5 right-3.5 size-2.5 bg-red-500 rounded-full border-2 border-[#12261d] animate-pulse"></div>
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Procurar no Eixo Luiz Gonzaga..." 
            className="w-full h-14 bg-[#0c1a14] border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-semibold outline-none placeholder:text-slate-600 focus:border-primary/30 focus:bg-[#12261d] transition-all shadow-2xl"
          />
        </div>
      </div>

      <main className="space-y-10">
        
        {/* ATALHOS PREMIUM */}
        <section className="px-5 grid grid-cols-2 gap-3">
           <div 
             onClick={() => navigate('/fidelidade')}
             className="bg-surface-dark border border-white/10 p-5 rounded-[2.5rem] flex flex-col justify-between h-32 relative overflow-hidden active:scale-95 transition-all shadow-lg group cursor-pointer"
           >
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/5 to-transparent"></div>
              <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-primary/30 transition-colors z-10">
                 <Gift size={20} className="text-primary" />
              </div>
              <div className="z-10">
                 <h3 className="text-base font-black italic uppercase leading-none mb-1">Porta-Luvas</h3>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Fidelidade & Vouchers</p>
              </div>
           </div>

           <div 
             onClick={() => navigate('/mneme')}
             className="bg-white text-slate-900 border border-white/10 p-5 rounded-[2.5rem] flex flex-col justify-between h-32 relative overflow-hidden active:scale-95 transition-all shadow-lg group cursor-pointer"
           >
              <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 z-10">
                 <ShoppingCart size={20} className="text-slate-900" />
              </div>
              <div className="z-10">
                 <h3 className="text-base font-black italic uppercase leading-none mb-1">Mnēmē</h3>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Mercado & Listas</p>
              </div>
           </div>
        </section>

        {/* Card Monitoramento Ao Vivo */}
        <section className="px-5">
          <div className="relative rounded-[2.8rem] overflow-hidden bg-[#0c1a14] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)] group">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover opacity-40 grayscale-[0.3] group-hover:scale-105 transition-transform duration-[4000ms]"
                alt="BR232 Real"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a14] via-[#0c1a14]/70 to-transparent"></div>
            </div>

            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
                  <div className="size-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#00e676]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white italic">AO VIVO</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black text-primary italic tracking-widest leading-none">STATUS VERDE</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">KM 71 • Gravatá</span>
                </div>
              </div>

              <h3 className="text-3xl font-black tracking-tighter mb-1 italic">BR-232 Agora</h3>
              <p className="text-[12px] text-slate-400 font-bold mb-8 uppercase tracking-widest">Trecho: Serra das Russas</p>

              <div className="flex items-start gap-5 mb-10 bg-white/5 p-5 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <CheckCircle2 size={28} className="fill-primary text-[#0c1a14]" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-black text-base italic leading-none">Fluxo Monitorado</h4>
                  <p className="text-[13px] text-slate-400 leading-snug font-medium italic line-clamp-2">
                    {news ? news.summary : "Conectando ao satélite da Fundação..."}
                  </p>
                </div>
              </div>

              <button onClick={() => navigate('/alertas')} className="w-full h-14 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl flex items-center justify-center gap-3 text-primary text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 italic">
                Painel Completo do Trecho <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* Acesso Rápido */}
        <section className="px-7 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight italic uppercase">Acesso Rápido</h3>
            <div className="h-px flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <QuickCard 
              onClick={() => navigate('/classificados')}
              title="Serviços" 
              sub="Postos, Pátios" 
              img="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=400&q=80" 
              icon="local_gas_station" 
            />
            <QuickCard 
              onClick={() => navigate('/blog')}
              title="Notícias" 
              sub="Destaques Regional" 
              img="https://images.unsplash.com/photo-1512428559083-a400a3b23c5a?auto=format&fit=crop&w=400&q=80" 
              icon="newspaper" 
            />
            <QuickCard 
              onClick={() => navigate('/roadmap')}
              title="Roadmap" 
              sub="O Futuro da Via" 
              img="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80" 
              icon="alt_route" 
            />
            <QuickCard 
              onClick={() => navigate('/reportar')}
              title="SOS" 
              sub="Guincho 24h" 
              img="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80" 
              icon="emergency" 
              isEmergency
            />
          </div>
        </section>
      </main>

      {/* FAB */}
      <button 
        onClick={() => navigate('/reportar')}
        className="fixed bottom-28 right-6 z-[110] size-16 bg-primary text-black rounded-[1.8rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,230,118,0.4)] active:scale-90 transition-all border border-white/20 hover:brightness-110 group"
        aria-label="Reportar Alerta"
      >
        <div className="group-hover:rotate-12 transition-transform">
          <span className="material-symbols-outlined text-[28px] font-bold">warning</span>
        </div>
        <div className="absolute -top-1.5 -right-1.5 size-5 bg-red-600 rounded-lg border-2 border-[#050d09] animate-pulse flex items-center justify-center text-[8px] font-black">!</div>
      </button>
    </div>
  );
};

const QuickCard = ({ title, sub, img, icon, isEmergency, onClick }: any) => (
  <div onClick={onClick} className="relative h-32 rounded-[2.2rem] overflow-hidden group cursor-pointer border border-white/5 shadow-xl active:scale-95 transition-all">
    <img src={img} className={`absolute inset-0 w-full h-full object-cover brightness-[0.4] transition-transform duration-700 group-hover:scale-110 ${isEmergency ? 'sepia-[0.4] hue-rotate-[320deg]' : 'grayscale-[0.5]'}`} alt={title} />
    <div className="absolute inset-0 bg-gradient-to-t from-[#050d09] via-transparent to-transparent"></div>
    <div className="relative h-full p-5 flex flex-col justify-between">
      <div className={`size-10 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 ${isEmergency ? 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-primary'}`}>
        <span className={`material-symbols-outlined text-[22px] filled`}>{icon}</span>
      </div>
      <div>
        <h4 className="font-black text-[15px] leading-none mb-1.5 italic uppercase">{title}</h4>
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none italic">{sub}</p>
      </div>
    </div>
  </div>
);

export default Home;