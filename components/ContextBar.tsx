
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface ContextAction {
  icon: string;
  label: string;
  action?: () => void;
  to?: string;
  primary?: boolean;
}

const ContextBar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const getActions = (): ContextAction[] => {
    switch (path) {
      case '/':
        return [
          { icon: 'info', label: 'Sobre' },
          { icon: 'help', label: 'Ajuda' }
        ];
      case '/dashboard':
        return [
          { icon: 'search', label: 'KM' },
          { icon: 'tune', label: 'Filtros' }
        ];
      case '/alertas':
        return [
          { icon: 'add_location', label: 'Avisar!', to: '/reportar', primary: true }
        ];
      case '/vida':
        return [
          { icon: 'campaign', label: 'Vozes' }
        ];
      default:
        return [
          { icon: 'share', label: 'Indicar' }
        ];
    }
  };

  const actions = getActions();

  // Esconder em telas de foco total ou formulários
  if (['/reportar', '/anunciar', '/login', '/perfil'].includes(path)) return null;

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-[90] flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5 pointer-events-auto">
        {actions.map((action, idx) => {
          const content = (
            <>
              <span className={`material-symbols-outlined text-[16px] ${action.primary ? 'text-black filled' : 'text-slate-400 group-hover:text-primary'}`}>
                {action.icon}
              </span>
              <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${action.primary ? 'text-black' : 'text-slate-500 group-hover:text-primary'}`}>
                {action.label}
              </span>
            </>
          );
          
          const baseClass = "group flex items-center gap-1.5 px-4 py-2 rounded-full transition-all active:scale-95";
          const variantClass = action.primary 
            ? "bg-primary shadow-[0_5px_15px_rgba(0,230,118,0.3)]" 
            : "hover:bg-white/5";

          return action.to ? (
            <Link key={idx} to={action.to} className={`${baseClass} ${variantClass}`}>
              {content}
            </Link>
          ) : (
            <button key={idx} onClick={action.action} className={`${baseClass} ${variantClass}`}>
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContextBar;
