import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Map, 
  Layout, 
  ArrowLeft, 
  ChevronRight,
  Target,
  FileText
} from 'lucide-react';

const Manifesto: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-dark min-h-screen text-white font-display pb-20">
      <div className="relative h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center scale-110 brightness-[0.3]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
        
        <div className="absolute inset-0 p-8 flex flex-col justify-end max-w-md mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-8 left-8 size-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <div className="size-2 bg-primary rounded-full animate-ping"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 1</span>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              Planejamento<br/>
              <span className="text-primary">& Escopo</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">A Fundação do Ecossistema</p>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-6 space-y-12 -mt-6 relative z-10">
        
        <section className="space-y-4">
          <div className="p-6 bg-surface-dark/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl">
            <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
              "Esta etapa estabelece a <span className="text-white font-bold">Identidade Operacional</span> e as <span className="text-white font-bold">Funcionalidades Nucleares</span> que regem a malha digital entre o Cais e o Sertão."
            </p>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-center text-slate-500">Definições da Fundação</h2>
          
          <PillarCard 
            icon={<Map className="text-secondary" size={32} />}
            title="Identidade Regional"
            desc="Foco absoluto na taxonomia da BR-232. Cidades do Tronco (contato direto), Galhos (Lindeiras) e Raízes (Influência)."
            tags={["Agreste", "Sertão", "Logística"]}
          />

          <PillarCard 
            icon={<Layout className="text-primary" size={32} />}
            title="Funcionalidades"
            desc="Estrutura modular de serviços: Monitoramento em Tempo Real, Classificados de Serviços Locais e IA Generativa (Gemini)."
            tags={["Monitor", "Marketplace", "IA"]}
          />

          <PillarCard 
            icon={<ShieldCheck className="text-red-500" size={32} />}
            title="Escopo Ético"
            desc="Implementação do Protocolo de Discrição. O App deve servir como ferramenta de apoio operacional, não distração."
            tags={["Safety First", "Ética", "IP Score"]}
          />
        </section>

        <section className="bg-primary/10 border border-primary/20 rounded-[3rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
             <Target className="text-primary" size={24} />
             <h3 className="text-xl font-black italic uppercase">Checklist da Fase 1</h3>
          </div>
          
          <div className="space-y-4">
             <GoalItem label="Definição da Identidade Visual (Noir/Emerald)" done={true} />
             <GoalItem label="Arquitetura de Rotas e Navegação" done={true} />
             <GoalItem label="Integração de Inteligência Artificial (Mock/Real)" done={true} />
             <GoalItem label="Taxonomia de Cidades (Tronco/Galhos)" done={true} />
          </div>
        </section>

        <div className="pt-4">
           <button 
             onClick={() => navigate('/roadmap')}
             className="w-full h-20 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 group shadow-2xl shadow-white/10 active:scale-95 transition-all"
           >
             Ver Roadmap Completo
             <ChevronRight className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>

      </main>
    </div>
  );
};

const PillarCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, tags: string[] }> = ({ icon, title, desc, tags }) => (
  <div className="group space-y-4 p-8 bg-surface-dark/40 border border-white/5 rounded-[3rem] hover:border-primary/40 transition-all">
    <div className="size-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h3>
      <p className="text-xs text-slate-400 font-medium leading-relaxed italic">{desc}</p>
    </div>
    <div className="flex flex-wrap gap-2 pt-2">
      {tags.map(t => (
        <span key={t} className="text-[8px] font-black uppercase tracking-widest text-slate-500 border border-white/10 px-2 py-1 rounded-lg">
          {t}
        </span>
      ))}
    </div>
  </div>
);

const GoalItem: React.FC<{ label: string, done: boolean }> = ({ label, done }) => (
  <div className="flex items-center gap-3">
    <div className={`size-5 rounded-full flex items-center justify-center border ${done ? 'bg-primary border-primary text-white' : 'border-white/10 text-transparent'}`}>
       <Zap size={10} fill="currentColor" />
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${done ? 'text-white' : 'text-white/20'}`}>{label}</span>
  </div>
);

export default Manifesto;