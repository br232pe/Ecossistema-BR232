import React from 'react';
import { CheckCircle2, Circle, Cloud, Database, Zap, Map } from 'lucide-react';
import SmartHeader from '../components/SmartHeader';

const Roadmap: React.FC = () => {
  const modules = [
    {
      id: "FASE 1",
      title: "Planejamento e Escopo (A Fundação)",
      status: "Em Execução",
      progress: 95,
      active: true,
      items: [
        { label: "Identidade Visual e UX (Noir/Emerald)", done: true },
        { label: "Arquitetura e Rotas", done: true },
        { label: "Taxonomia da BR-232", done: true },
        { label: "Fallback e Segurança de API (Mock)", done: true },
      ]
    },
    {
      id: "FASE 2",
      title: "Desenvolvimento do MVP",
      status: "Próximo",
      progress: 15,
      active: false,
      items: [
        { label: "Persistência Real (Firebase)", done: false },
        { label: "Cadastro de Usuários", done: false },
        { label: "Feed de Notícias Automatizado", done: false },
        { label: "Geolocalização Ativa", done: false },
      ]
    },
    {
      id: "INFRA",
      title: "Escalabilidade",
      status: "Pendente",
      progress: 0,
      active: false,
      items: [
        { label: "Banco de Dados Distribuído", done: false },
        { label: "Autenticação OAuth Completa", done: true },
        { label: "Regras de Segurança", done: false },
      ]
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32 font-display">
      <SmartHeader 
        title="Roadmap" 
        subtitle="Evolução do Produto"
        rightAction={
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
            <Map size={10} fill="currentColor" />
            FUNDAÇÃO
          </div>
        }
      />

      <div className="p-4 space-y-6">
        <div className="p-6 bg-surface-dark border border-white/10 rounded-3xl mb-8">
           <h1 className="text-xl font-black italic uppercase leading-none text-white">Status do Projeto</h1>
           <p className="text-xs text-slate-400 mt-2 font-medium">Estamos na fase de Fundação, garantindo que a identidade e as funcionalidades principais operem mesmo em condições adversas.</p>
        </div>

        {modules.map((m) => (
          <div key={m.id} className={`bg-white dark:bg-surface-dark rounded-3xl p-6 border shadow-sm transition-all ${m.active ? 'border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/5' : 'border-slate-200 dark:border-white/5 opacity-80'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase tracking-tighter ${m.active ? 'text-primary' : 'text-slate-400'}`}>{m.id}</span>
                <h2 className="font-bold text-lg leading-tight dark:text-white italic uppercase">{m.title}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${m.status === 'Em Execução' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                {m.status}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-background-dark rounded-full mb-6 overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${m.active ? 'bg-primary' : 'bg-slate-600'}`} style={{ width: `${m.progress}%` }}></div>
            </div>

            <ul className="space-y-3">
              {m.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className={m.active ? 'text-primary' : 'text-slate-500'} size={16} />
                  ) : (
                    <Circle className="text-slate-300 dark:text-slate-700 shrink-0" size={16} />
                  )}
                  <span className={`text-xs font-bold ${item.done ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 italic'}`}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-2xl mt-8">
          <h3 className="font-black italic flex items-center gap-2 uppercase text-secondary">
            <Zap size={18} fill="currentColor" /> Próximos Passos
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <BacklogItem icon={<Cloud size={14}/>} label="Deploy da Infraestrutura" />
            <BacklogItem icon={<Database size={14}/>} label="Testes de Carga" />
          </div>
        </div>
      </div>
    </div>
  );
};

const BacklogItem: React.FC<any> = ({ icon, label }) => (
  <div className="flex items-center gap-3 text-[11px] font-black uppercase text-white/70">
    <div className="size-6 bg-white/10 rounded flex items-center justify-center">{icon}</div>
    {label}
  </div>
);

export default Roadmap;