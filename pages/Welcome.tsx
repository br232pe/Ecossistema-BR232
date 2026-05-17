import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, LogIn, MapPin, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#05100a] text-white overflow-x-hidden selection:bg-primary selection:text-black font-display">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto w-full px-6 py-12 flex flex-col min-h-screen relative z-10">
        
        {/* Header Nav */}
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 backdrop-blur-xl">
               <div className="px-2 py-1 bg-white rounded-lg border border-slate-900 shadow-lg shrink-0">
                  <span className="text-[8px] font-black text-slate-900 leading-none block text-center">BR</span>
                  <div className="h-[1px] bg-slate-900/20 w-full my-0.5"></div>
                  <span className="text-[12px] font-black text-slate-900 leading-none block text-center">232</span>
               </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">ECOBR232</h1>
              <p className="text-[8px] font-bold text-primary tracking-[0.3em] uppercase">Eixo Capital-Sertão</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <LogIn size={14} className="shrink-0" /> <span className="hidden xs:inline">Identificar-se</span><span className="xs:hidden">Entrar</span>
          </button>
        </header>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center flex-1">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00e676]"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Rede Geoeconomica Ativa</span>
            </div>

            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-[clamp(4rem,8vw,6rem)] font-black tracking-tighter italic uppercase leading-[0.85] text-white">
              O Portal que <br/>
              <span className="text-primary drop-shadow-[0_0_30px_rgba(0,230,118,0.3)]">Pulsa <br className="lg:hidden" /> Pernambuco.</span>
            </h2>

            <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed italic max-w-xl">
              Do <span className="text-white font-black border-b-4 border-primary pb-1">Cais ao Sertão</span>. 
              A maior malha de serviços, classificados e inteligência regional conectada pela BR-232.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="h-20 px-10 bg-primary hover:bg-primary-dark text-black rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_rgba(0,230,118,0.3)] active:scale-95 group"
              >
                Explorar a Malha <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/patronos')}
                className="h-20 px-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Zap size={18} className="text-primary" /> Patronos BR
              </button>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative group perspective-1000 hidden lg:block">
            <div className="relative h-[600px] w-full rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-1000">
               <img 
                 src="https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=1000" 
                 className="absolute inset-0 w-full h-full object-cover brightness-[0.7] transition-transform duration-[8000ms] group-hover:scale-110"
                 alt="Ecossistema BR232"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#05100a] via-transparent to-transparent"></div>
               
               <div className="absolute bottom-12 left-12 right-12 p-8 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
                      <MapPin size={24} className="text-black" />
                    </div>
                    <div>
                      <h4 className="font-black italic uppercase leading-none">KM 0 ao 500+</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Cobertura Geográfica Total</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-primary animate-progress"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-1">Status do Ecossistema</span>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[12px] font-black uppercase italic">Operação Nominal</span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div className="flex gap-6">
              <FeatureItem icon={<ShieldCheck size={16}/>} text="Verificada" />
              <FeatureItem icon={<Globe size={16}/>} text="Nacional" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/politica-de-privacidade')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Privacidade</button>
            <button onClick={() => navigate('/termos-e-uso')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Termos de Uso</button>
            <button onClick={() => navigate('/central-de-politicas')} className="px-4 py-2 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white border border-white/10 hover:bg-white/10 transition-colors">Central Legal</button>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

const FeatureItem = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-slate-400">
    <span className="text-primary">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-wider">{text}</span>
  </div>
);

export default Welcome;
