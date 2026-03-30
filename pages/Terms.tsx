import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowLeft, CheckCircle2, Zap } from 'lucide-react';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white pb-12 font-display">
      <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 p-4">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-600 dark:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black italic uppercase tracking-tighter">Protocolo de Uso</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-10">
        
        {/* Seção de Propósito */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck size={28} fill="currentColor" className="text-black dark:text-background-dark" />
            <h2 className="text-xl font-black italic uppercase leading-none text-slate-900 dark:text-white">Protocolo de<br/>Discrição</h2>
          </div>

          <div className="bg-white dark:bg-surface-dark p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-6 shadow-sm">
            <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              O Ecossistema BR-232 é uma ferramenta de apoio operacional. Para garantir a segurança e a integridade da malha, todos os usuários devem seguir regras estritas de conduta.
            </p>
            
            <div className="space-y-4">
              <RuleItem 
                num="01" 
                title="Segurança Viária" 
                desc="Nunca utilize o aplicativo enquanto o veículo estiver em movimento. Reporte apenas em locais seguros."
              />
              <RuleItem 
                num="02" 
                title="Veracidade" 
                desc="Todas as informações reportadas (acidentes, serviços, perfis) devem ser reais e verificáveis."
              />
              <RuleItem 
                num="03" 
                title="Respeito à Comunidade" 
                desc="O espaço 'Vida da 232' é para construção de valor local. Discursos de ódio ou spam resultarão em banimento."
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <FileText size={24} />
            <h2 className="text-xl font-black italic uppercase leading-none">Termos de Serviço</h2>
          </div>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-xs leading-relaxed space-y-3 text-slate-600 dark:text-slate-400">
            <p>1. O uso da plataforma é gratuito para visualização de alertas e notícias.</p>
            <p>2. Anúncios e destaques podem estar sujeitos a taxas conforme a categoria escolhida.</p>
            <p>3. A administração se reserva o direito de remover conteúdo que viole as diretrizes da comunidade.</p>
            <p>4. Seus dados de localização são usados anonimamente para cálculo de fluxo e alertas.</p>
          </div>
        </section>

        <div className="pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full h-16 bg-primary text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <CheckCircle2 size={20} /> Concordar e Voltar
          </button>
        </div>
      </main>
    </div>
  );
};

const RuleItem: React.FC<{ num: string; title: string; desc: string }> = ({ num, title, desc }) => (
  <div className="flex gap-4 relative z-10">
    <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center text-[10px] font-black shrink-0 border border-slate-200 dark:border-white/10">
      {num}
    </div>
    <div className="space-y-1">
      <h4 className="font-black text-xs uppercase italic text-slate-900 dark:text-white">
        {title}
      </h4>
      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-normal">{desc}</p>
    </div>
  </div>
);

export default Terms;