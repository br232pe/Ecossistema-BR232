import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck, Zap, Database } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login();
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Erro no login:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMsg("Acesso cancelado pelo usuário.");
      } else {
        setErrorMsg("Falha na conexão segura com Google. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-dark min-h-screen text-white font-display flex flex-col relative overflow-hidden">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 size-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="p-6 flex items-center justify-between z-10">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-all hover:bg-white/10 border border-white/5"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-slate-300" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto z-10 -mt-10">
        
        {/* Logo e Identidade */}
        <div className="flex flex-col items-center text-center space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-6 bg-white/[0.03] rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,230,118,0.1)]">
            <Logo className="h-16" variant="white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
              Identidade <span className="text-primary">Única</span>
            </h1>
            <p className="text-sm font-medium text-slate-400 max-w-[280px] mx-auto leading-relaxed">
              O Ecossistema BR-232 utiliza tecnologia Google para validar sua identidade automaticamente.
            </p>
          </div>
        </div>

        {/* Área de Ação */}
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold mb-4">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="relative w-full h-20 bg-white text-[#0a0f1d] rounded-[1.8rem] font-black uppercase text-sm flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:scale-100 shadow-2xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin text-[#0a0f1d]" size={24} />
                  <span>Validando Credenciais...</span>
                </>
              ) : (
                <>
                  <div className="p-2 bg-white rounded-full">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span className="tracking-wide">Entrar com Google</span>
                </>
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 opacity-60">
             <FeatureBadge icon={<ShieldCheck size={14}/>} label="Validado Google" />
             <FeatureBadge icon={<Zap size={14}/>} label="Login Instantâneo" />
             <FeatureBadge icon={<Database size={14}/>} label="Dados Protegidos" />
          </div>

        </div>
      </main>

      <footer className="p-6 text-center z-10">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Ao entrar, você concorda com o <span className="text-primary cursor-pointer hover:underline">Protocolo de Discrição</span>.
        </p>
      </footer>
    </div>
  );
};

const FeatureBadge: React.FC<{ icon: any, label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5">
    <div className="text-primary">{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</span>
  </div>
);

export default Login;