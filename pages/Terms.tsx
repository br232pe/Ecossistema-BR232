import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Scale, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { Footer } from '../src/components/Footer';
import { POLICIES } from '../src/constants/policies';

const Terms: React.FC = () => {
  const navigate = useNavigate();
  // Obtém especificamente os Termos Gerais de Uso (ID: 'termos-gerais' ou o primeiro)
  const termsPolicy = POLICIES.find(p => p.id === 'termos-gerais') || POLICIES[0];

  return (
    <div className="w-full text-white font-sans">
      <div className="relative overflow-hidden py-16 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00e66b]/5 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00e66b]/10 border border-[#00e66b]/20 rounded-full text-[9px] font-black uppercase tracking-wider text-[#00e66b]">
              <Scale size={12} />
              Requisitos Regulatórios e Jurídicos
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight">
              Termos e Condições <br className="hidden sm:inline"/> Gerais de Serviço.
            </h1>
            <p className="text-slate-400 text-sm md:text-base italic max-w-2xl mx-auto leading-relaxed">
              Consulte os direitos, responsabilidades e os limites de cooperação que definem a presença e a operação civil na malha geoeconômica da rodovia BR-232.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <main className="max-w-4xl mx-auto px-6 pb-24 relative">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-8">
              <div className="space-y-1 text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#00e66b]">Malha Ativa</span>
                <h2 className="text-2xl font-black uppercase leading-tight italic">{termsPolicy.title}</h2>
              </div>
              <div className="inline-flex items-center gap-2 text-slate-500 font-mono text-[9px] font-bold uppercase tracking-wider bg-white/2 border border-white/5 rounded-xl px-3 py-1.5 shrink-0 self-start sm:self-center">
                <Clock size={12} className="text-[#00e66b]" />
                LTS: MAIO/2026
              </div>
            </div>

            {/* Document body rendered safely */}
            <div 
              className="text-slate-300 font-medium italic text-sm md:text-base leading-relaxed space-y-8 text-left prose prose-invert max-w-none prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tight prose-h2:text-xl prose-h2:border-l-4 prose-h2:pl-4 prose-h2:border-[#00e66b]/40 prose-ul:list-disc prose-ul:pl-6 prose-li:my-2"
              dangerouslySetInnerHTML={{ __html: termsPolicy.content }} 
            />

            <div className="h-px bg-white/5 w-full my-8" />

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 h-14 bg-white/5 border border-white/10 hover:border-[#00e66b]/30 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all text-white hover:text-[#00e66b]">
                <FileText size={16} /> Baixar Cópia em PDF
              </button>
              <button 
                onClick={() => navigate('/central-de-politicas')}
                className="flex-1 h-14 bg-white/5 border border-white/10 hover:border-[#00e66b]/30 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all text-white hover:text-[#00e66b]"
              >
                <ExternalLink size={16} /> Ver Outras Políticas
              </button>
            </div>
            
            {/* Security Badge Container */}
            <div className="mt-8 p-6 bg-gradient-to-br from-[#0c1a14] to-[#05100a] border border-white/5 rounded-3xl flex items-center gap-4 text-left">
               <div className="size-12 rounded-xl bg-[#00e66b]/10 border border-[#00e66b]/20 flex items-center justify-center text-[#00e66b] shrink-0">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest leading-none text-white">Conteúdo Certificado</h4>
                  <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-[0.2em] mt-1.5">Ecossistema Sopertek BR-232 LTS</p>
               </div>
            </div>
          </div>

          {/* Background Glows */}
          <div className="absolute -top-40 -left-40 size-80 bg-[#00e66b]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 size-80 bg-[#00e66b]/5 blur-[120px] rounded-full pointer-events-none" />
        </main>
    </div>
  );
};

export default Terms;
