import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, Globe, Zap, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();
  const location = useLocation();
  const isRegistering = location.pathname.includes('registrar');

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed", error);
      // In a real app, show a toast here
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#05100a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] size-[80%] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] size-[80%] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 space-y-12 text-center"
      >
        {/* Branding */}
        <div className="flex flex-col items-center gap-6">
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
             <h1 className="text-4xl font-black italic uppercase italic tracking-tighter leading-none">ECOBR232</h1>
             <p className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">Eixo Capital-Sertão</p>
           </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
           <h2 className="text-2xl font-black italic uppercase italic tracking-tight">
             {isRegistering ? 'Crie sua conta na Malha.' : 'Acesse a Rede Geoeconômica.'}
           </h2>
           <p className="text-slate-400 text-sm font-medium italic">Sincronize seu perfil para gerenciar anúncios, salvar alertas e acessar o Porta-Luvas Digital.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full h-14 sm:h-18 bg-white text-black hover:bg-slate-100 rounded-2xl sm:rounded-3xl font-black uppercase text-xs flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 group"
            >
              <img src="https://www.google.com/favicon.ico" className="size-5" alt="Google" />
              Entrar com Google
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full h-14 sm:h-18 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl sm:rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              Voltar ao Portal <ArrowRight size={14} className="text-slate-500" />
            </button>
          </div>

          {!isRegistering && (
            <div className="pt-4 space-y-4">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Ainda não criou conta?</p>
               <button 
                 onClick={() => navigate('/registrar')}
                 className="px-8 py-4 bg-primary/10 border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-all"
               >
                  Registrar Agora
               </button>
            </div>
          )}
        </div>

        {/* Policies / Footer */}
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 max-w-[280px] mx-auto leading-relaxed">
           Ao entrar, você aceita nossos <br/>
           <a href="/termos-uso.html" target="_blank" className="text-primary hover:underline">Termos de Uso</a> e 
           <a href="/politica-de-privacidade.html" target="_blank" className="text-primary hover:underline ml-1">Privacidade</a>.
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
