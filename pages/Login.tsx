import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  ShieldCheck, 
  Globe, 
  Zap, 
  ArrowRight, 
  MapPin, 
  Mail, 
  Lock, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

const translateAuthError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já possui cadastro.';
    case 'auth/weak-password':
      return 'A senha fornecida é muito fraca (mínimo de 6 caracteres).';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/popup-closed-by-user':
      return 'A autenticação por conta Google foi interrompida antes do final.';
    case 'auth/popup-blocked':
      return 'O popup de autenticação foi bloqueado pelo seu navegador.';
    case 'auth/network-request-failed':
      return 'Erro de conexão na BR-232. Verifique o sinal da sua rede.';
    case 'auth/too-many-requests':
      return 'Acesso temporariamente bloqueado devido a múltiplas tentativas. Aguarde um instante.';
    case 'auth/user-disabled':
      return 'Esta credencial foi desativada temporariamente.';
    default:
      return 'Falha inesperada na autenticação. Tente novamente.';
  }
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();
  const location = useLocation();
  const isRegistering = location.pathname.includes('registrar');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate(isRegistering ? '/dashboard?sima=true' : '/dashboard');
    } catch (error: any) {
      console.error("Login failed", error);
      setErrorMsg(translateAuthError(error?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate(isRegistering ? '/dashboard?sima=true' : '/dashboard');
    }
  }, [user, navigate, isRegistering]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#05100a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] size-[80%] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] size-[80%] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10 space-y-10 text-center"
      >
        {/* Branding */}
        <div className="flex flex-col items-center gap-5">
           <motion.div 
             whileHover={{ rotate: 10 }}
             transition={{ duration: 0.5 }}
             className="size-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center p-4 backdrop-blur-3xl shadow-2xl"
           >
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                className="size-full object-contain"
                alt="BR232"
                referrerPolicy="no-referrer"
              />
           </motion.div>
           <div className="space-y-1">
             <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">ECOBR232</h1>
             <p className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">Eixo Capital-Sertão</p>
           </div>
        </div>

        {/* Content */}
        <div className="space-y-3 px-4">
           <h2 className="text-2xl font-black italic uppercase tracking-tight">
             Acesso Seguro
           </h2>
           <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
             Utilize sua conta Google para sincronizar seu perfil na rodovia.
           </p>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] font-bold text-red-400 flex items-start gap-2 text-left"
              >
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-500" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <button 
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-white text-black hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 duration-200 shadow-lg shadow-white/5"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" className="size-4" alt="Google" />
                  <span>Entrar com Google</span>
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/')}
              disabled={isLoading}
              className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Voltar ao Portal <ArrowRight size={12} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Policies / Footer */}
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 max-w-[280px] mx-auto leading-relaxed">
           Ao entrar, você aceita nossos <br/>
           <a href="#/termos-uso" className="text-primary hover:underline">Termos de Uso</a> e 
           <a href="#/politica-de-privacidade" className="text-primary hover:underline ml-1">Privacidade</a>.
        </p>
      </motion.div>

      {/* Featured Metric Overlay (Abstract) */}
      <div className="absolute bottom-12 left-12 hidden lg:flex items-center gap-6">
         <MetricMini label="Cidades" value="56+" icon={<Globe size={14} />} />
         <MetricMini label="Patronos" value="480+" icon={<Zap size={14} />} />
         <MetricMini label="Seguro" value="LTS 2026" icon={<ShieldCheck size={14} />} />
      </div>

    </div>
  );
};

const MetricMini = ({ label, value, icon }: any) => (
  <div className="flex flex-col gap-1 opacity-40 hover:opacity-100 transition-opacity">
    <div className="flex items-center gap-2 text-primary">
       {icon} <span className="text-sm font-black italic">{value}</span>
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</span>
  </div>
);

export default Login;
