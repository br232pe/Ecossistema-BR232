import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home, Navigation } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in module:', this.props.moduleName, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#05100a] text-white">
          <div className="size-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8 animate-pulse">
            <AlertCircle size={40} />
          </div>
          
          <div className="space-y-4 mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 italic">Interrupção na Malha</h2>
            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-tight">
              O Módulo {this.props.moduleName || 'Ecossistema'} <br/> Teve um Problema.
            </h3>
            <p className="text-slate-500 text-sm italic max-w-sm mx-auto">
              Nossa equipe de manutenção já foi notificada. Tente recarregar ou voltar para a rota segura.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 h-14 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
            >
              <RefreshCcw size={16} /> Recarregar
            </button>
            <button 
              onClick={() => window.location.hash = '#/'}
              className="flex-1 h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <Home size={16} /> Início
            </button>
          </div>

          <div className="mt-12 flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <div className="size-1.5 bg-red-500 rounded-full animate-ping"></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none">Erro Crítico de Renderização</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
