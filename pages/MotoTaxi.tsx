
import React, { useState } from 'react';
import { ShieldCheck, QrCode, Building2, UserCheck, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartHeader from '../components/SmartHeader';

const MotoTaxi: React.FC = () => {
  const [activeTab, setActiveTab] = useState('verificar');
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen max-w-4xl mx-auto text-slate-900 dark:text-white pb-32">
      <SmartHeader 
        title="Ranking" 
        subtitle="IP Score & Pertencimento"
        rightAction={
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-secondary/20">
            <ShieldCheck size={10} />
            Discrição Ativa
          </div>
        }
      />

      <div className="p-4 space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-black leading-tight italic">Ranking de <br/><span className="text-primary">Pertencimento</span></h1>
          <p className="text-slate-500 dark:text-text-muted-dark text-sm">O ranking prioriza o <strong className="text-primary">mérito individual</strong> e a conduta ética, independente da associação.</p>
        </header>

        <div className="bg-primary rounded-3xl p-1 flex shadow-xl shadow-primary/20">
          <button onClick={() => setActiveTab('verificar')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'verificar' ? 'bg-white text-primary shadow-sm' : 'text-white/70'}`}><QrCode size={18} />Validar</button>
          <button onClick={() => setActiveTab('buscar')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'buscar' ? 'bg-white text-primary shadow-sm' : 'text-white/70'}`}><TrendingUp size={18} />Melhores IPs</button>
        </div>

        {activeTab === 'buscar' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-black italic uppercase">Top Pilotos (IP)</h2>
            <PilotCard name="Severino da 232" ip={9.8} assoc="AMTV" badge="Diamante" />
            <PilotCard name="Manoel do Grau" ip={8.4} assoc="Solo" badge="Ouro" />
            <PilotCard name="Chico Silêncio" ip={7.2} assoc="Sindimoto" badge="Prata" />
          </div>
        )}

        {activeTab === 'verificar' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-3xl p-8 text-center space-y-6 shadow-sm">
              <div className="size-48 bg-slate-100 dark:bg-background-dark mx-auto rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 group hover:border-primary transition-all cursor-pointer">
                <QrCode size={48} className="text-slate-300 group-hover:text-primary" />
                <p className="text-[10px] font-black text-slate-400 uppercase">Validar QR Code</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <h3 className="text-lg font-black italic uppercase">Módulo do Parceiro</h3>
              <button onClick={() => navigate('/anunciar', { state: { category: 'Piloto Solo' } })} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl hover:border-primary transition-all text-left">
                <div className="size-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0"><UserCheck size={24} /></div>
                <div><h4 className="font-bold text-sm">Entrar como Solo</h4><p className="text-[10px] text-slate-500 font-bold uppercase">Reputação vinculada ao seu CPF</p></div>
              </button>
              <button onClick={() => navigate('/anunciar', { state: { category: 'Associação' } })} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl hover:border-secondary transition-all text-left">
                <div className="size-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center shrink-0"><Building2 size={24} /></div>
                <div><h4 className="font-bold text-sm">Painel da Associação</h4><p className="text-[10px] text-slate-500 font-bold uppercase">Gestão coletiva e planos PJ</p></div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PilotCard: React.FC<any> = ({ name, ip, assoc, badge }) => (
  <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-4">
    <div className="size-14 bg-primary text-white rounded-xl flex flex-col items-center justify-center shrink-0">
      <span className="text-[10px] font-black uppercase">IP</span>
      <span className="text-xl font-black">{ip}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-sm truncate">{name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[9px] font-black text-slate-400 uppercase">{assoc}</span>
        <span className="size-1 rounded-full bg-slate-300"></span>
        <span className="text-[9px] font-black text-primary uppercase">{badge}</span>
      </div>
    </div>
    <div className="flex flex-col items-end">
       <div className="flex gap-0.5 text-yellow-500"><Star size={14} fill="currentColor" /></div>
       <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Selo Responsa</span>
    </div>
  </div>
);

export default MotoTaxi;
