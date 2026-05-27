import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || user?.email === 'br232pe@gmail.com';

  return (
    <footer className="w-full bg-[#030604] border-t border-white/5 py-16 px-6 relative z-20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Superior: Conteúdo e Colunas de Navegação */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          {/* Lado Esquerdo: Identidade do Ecossistema */}
          <div className="space-y-6 max-w-md text-left">
            <div 
              onClick={() => navigate('/portal')} 
              className="flex items-center gap-4 cursor-pointer select-none active:opacity-80 transition-opacity"
            >
              {/* Box de Logotipo Estilizado */}
              <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2.5 shadow-lg shrink-0">
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                  className="size-full object-contain"
                  alt="BR232"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#00e66b]">ecossistema</span>
                  <span className="text-xs uppercase font-black tracking-widest text-[#ef4444]">BR232</span>
                </div>
                <div className="text-[9px] font-bold text-slate-500 tracking-[0.15em] uppercase mt-0.5">Eixo de Desenvolvimento</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
              ECOBR232 - Conectando Pernambuco. A primeira malha geoeconômica dedicada ao desenvolvimento do Eixo Capital-Sertão.
            </p>
          </div>

          {/* Colunas de Links à Direita */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-12 sm:gap-24 text-left lg:mr-10">
            {/* Coluna Navegação */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00e66b]">
                Navegação
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button 
                    onClick={() => navigate('/portal')}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer outline-none focus:text-white"
                  >
                    Portal Principal
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer outline-none focus:text-white"
                  >
                    Painel do Usuário
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/patronos')}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer outline-none focus:text-white"
                  >
                    Fale com um Patrono
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna Institucional */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00e66b]">
                Institucional
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button 
                    onClick={() => navigate('/politica-de-privacidade')}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer outline-none focus:text-white"
                  >
                    Privacidade
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/termos')}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer outline-none focus:text-white"
                  >
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/central-de-politicas')}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer outline-none focus:text-white"
                  >
                    Central Legal
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divisor Inferior */}
        <div className="h-px w-full bg-white/5" />

        {/* Inferior: Status, Copyright e Indicadores */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Lado Esquerdo: Status & Copyright */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-left">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#00e66b]">
              <span className="size-1.5 rounded-full bg-[#00e66b] animate-pulse"></span>
              Operação Nominal
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              © 2026 ECOBR232 - MALHA GEOECONÔMICA DA BR-232
            </span>
          </div>

          {/* Lado Direito: Certificações */}
          <div className="flex flex-wrap items-center gap-4 text-left md:text-right">
            <div className="inline-flex items-center gap-1.5 text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              <ShieldCheck size={12} className="text-[#00e66b]" />
              Build Sucesso
            </div>
            <span className="hidden sm:inline text-slate-700">|</span>
            <div className="inline-flex items-center gap-1.5 text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              <Globe size={12} className="text-[#00e66b]" />
              Eixo Capital Sertão
            </div>
          </div>
        </div>

        {/* Admin DevMenu (Mapeamento de Rotas Corporativas) */}
        {isAdmin && (
          <div id="admin-dev-menu" className="mt-8 bg-black/60 border border-[#00E676]/30 p-4 font-mono text-xs text-gray-400 space-y-3 rounded-none text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-2">
              <span className="text-[#00E676] font-black uppercase tracking-wider">
                [MODO MASTER / DEV TOOLS] - Auditoria de Dashboards LTS
              </span>
              <span className="text-[10px] text-gray-400 uppercase">
                Operador: {user?.email}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-gray-500 text-[10px] uppercase font-black">Links de Roteamento:</span>
              <Link 
                to="/dashboard-promotor" 
                className="text-[#00E676] hover:underline underline-offset-4 font-bold"
              >
                [ Promotor Galho ]
              </Link>
              <Link 
                to="/dashboard-tronco" 
                className="text-slate-400 hover:text-white hover:underline underline-offset-4"
              >
                [ Promotor Tronco ]
              </Link>
              <Link 
                to="/dashboard-financeiro" 
                className="text-slate-400 hover:text-white hover:underline underline-offset-4"
              >
                [ Financeiro ]
              </Link>
            </div>
            <div className="text-[10px] text-gray-500 border-t border-white/5 pt-2 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1">
              <span>Contas Demo: <strong className="text-gray-300">Promo(daspromo@ecobr232.com | DAs@2026#Mo)</strong></span>
              <span className="text-[9px] bg-[#00E676]/10 text-[#00E676] px-1.5 py-0.5 uppercase tracking-wider font-bold">Ambiente Homologado</span>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};
