import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  ChevronRight, 
  FileText, 
  Lock, 
  UserPlus, 
  Megaphone, 
  MessageSquare, 
  Image as ImageIcon, 
  RefreshCcw,
  Menu,
  X
} from 'lucide-react';
import { POLICIES, Policy } from '../src/constants/policies';

const PolicyCenter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePolicyId, setActivePolicyId] = useState(POLICIES[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === '/politica-de-privacidade') {
      setActivePolicyId('politica-privacidade');
    } else if (location.pathname === '/termos-e-uso') {
      setActivePolicyId('termos-gerais');
    }
  }, [location.pathname]);

  const activePolicy = POLICIES.find(p => p.id === activePolicyId) || POLICIES[0];

  const getIcon = (id: string) => {
    switch (id) {
      case 'termos-gerais': return <FileText size={18} />;
      case 'politica-privacidade': return <Lock size={18} />;
      case 'termos-registro': return <UserPlus size={18} />;
      case 'termos-anunciantes': return <Megaphone size={18} />;
      case 'termos-comentarios': return <MessageSquare size={18} />;
      case 'termos-direitos': return <ImageIcon size={18} />;
      case 'politica-devolucao': return <RefreshCcw size={18} />;
      default: return <ShieldCheck size={18} />;
    }
  };

  return (
    <div className="bg-background-light dark:bg-[#050d09] min-h-screen text-slate-900 dark:text-white font-display flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-[#050d09]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-black italic uppercase tracking-tighter">Central de Políticas</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-primary">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Componente Lateral Fixo */}
      <aside className={`
        fixed inset-0 z-[100] md:relative md:z-0
        w-full md:w-80 bg-[#0a1610] border-r border-white/5
        transition-transform duration-300 ease-in-out h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6 overflow-hidden">
          <div className="hidden md:flex items-center gap-3 mb-10 shrink-0">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group hover:bg-primary/30 transition-all">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black italic uppercase tracking-tighter leading-none">Central de<br/>Políticas</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            {POLICIES.map((policy) => (
              <button
                key={policy.id}
                onClick={() => {
                  setActivePolicyId(policy.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all group border
                  ${activePolicyId === policy.id 
                    ? 'bg-primary border-primary text-black font-black shadow-[0_10px_20px_rgba(0,230,118,0.2)]' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-400 hover:text-white'}
                `}
              >
                <span className={activePolicyId === policy.id ? 'text-black' : 'text-primary'}>
                  {getIcon(policy.id)}
                </span>
                <span className="text-[10px] uppercase tracking-tight flex-1 leading-tight font-bold">
                  {policy.title.includes('. ') ? policy.title.split('. ')[1] : policy.title}
                </span>
                <ChevronRight size={14} className={activePolicyId === policy.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all'} />
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5 shrink-0">
            <button 
              onClick={() => navigate(-1)}
              className="w-full h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5"
            >
              <ArrowLeft size={16} /> Voltar ao App
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area - Janela de Leitura Central */}
      <main className="flex-1 p-6 md:p-16 overflow-y-auto h-full scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] block">Cânone Legal • ECOBR232</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9] mb-6 text-white text-balance">
              {activePolicy.title}
            </h2>
            <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
               <span>Versão LTS 2026</span>
               <span className="size-1 rounded-full bg-white/20"></span>
               <span>Hermenêutica BR232</span>
            </div>
          </div>

          <div 
            className="prose prose-invert prose-emerald max-w-none 
              prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter
              prose-h2:text-2xl prose-h2:font-black prose-h2:text-white prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-lg prose-h3:font-bold prose-h3:text-primary prose-h3:mt-8
              prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-base prose-p:mb-6
              prose-li:text-slate-400 prose-li:mb-2
              prose-strong:text-white prose-strong:font-bold
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              pb-32
            "
            dangerouslySetInnerHTML={{ __html: activePolicy.content }}
          />

          <div className="mt-20 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 text-center backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <p className="text-xs text-slate-500 mb-6 font-medium italic">
              Dúvidas sobre nossa conformidade ou tratamento de dados?<br/>Entre em contato com nossa Encarregadoria de Dados.
            </p>
            <a 
              href="mailto:br232pe@gmail.com" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all border border-white/10"
            >
              br232pe@gmail.com
            </a>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 230, 118, 0.1);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 230, 118, 0.3);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
};

export default PolicyCenter;
