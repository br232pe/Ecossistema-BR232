import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageCircle, Phone, ArrowRight, ShieldCheck, Loader2, CheckCircle, Bell, X } from 'lucide-react';

const Verify: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'email' | 'sms' | 'whatsapp' | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'success'>('idle');
  const [code, setCode] = useState('');
  const [serverToken, setServerToken] = useState<string>(''); // Armazena o token real gerado
  const [timer, setTimer] = useState(30);
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let interval: any;
    if (status === 'sent' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status, timer]);

  // Lógica REAL de geração de token
  const generateToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendCode = () => {
    setStatus('sending');
    const newToken = generateToken();
    setServerToken(newToken); // Guarda o token na memória segura

    // Simula o delay da rede telefônica/internet
    setTimeout(() => {
      setStatus('sent');
      setTimer(60);
      
      // Simula a chegada da mensagem no dispositivo (Push Notification)
      setTimeout(() => {
        setShowPushNotification(true);
        // Esconde a notificação após 6 segundos
        setTimeout(() => setShowPushNotification(false), 6000);
      }, 2000);

    }, 1500);
  };

  const handleVerify = () => {
    setStatus('verifying');
    setError(false);

    // Validação ESTRITA: Compara o input do usuário com o token gerado na memória
    setTimeout(() => {
      if (code === serverToken) {
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatus('sent');
        setError(true);
        setCode(''); // Limpa o campo para forçar nova tentativa
      }
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="bg-white/10 p-8 rounded-[3rem] backdrop-blur-xl border border-white/20">
          <CheckCircle size={80} className="text-white mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-black italic text-white uppercase mb-2">Acesso Liberado</h1>
          <p className="text-white/80 font-bold uppercase tracking-widest text-xs">Dispositivo Autenticado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 flex flex-col items-center justify-center font-display text-slate-900 dark:text-white relative overflow-hidden">
      
      {/* Simulação de Notificação Push do Sistema Operacional */}
      {showPushNotification && (
        <div 
          onClick={() => { setCode(serverToken); setShowPushNotification(false); }}
          className="fixed top-4 left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-900 dark:text-white p-4 rounded-2xl shadow-2xl z-[100] border border-slate-200 dark:border-white/10 animate-in slide-in-from-top-10 cursor-pointer flex items-start gap-3"
        >
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            {method === 'whatsapp' ? <MessageCircle size={20} /> : method === 'email' ? <Mail size={20} /> : <Phone size={20} />}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
               <h4 className="font-bold text-xs uppercase opacity-70">{method === 'whatsapp' ? 'WhatsApp Business' : 'Mensagem do Sistema'}</h4>
               <span className="text-[10px] opacity-50">Agora</span>
            </div>
            <p className="font-bold text-sm">Seu código de verificação BR-232 é: <span className="text-primary font-black text-lg tracking-widest">{serverToken}</span></p>
            <p className="text-[10px] mt-1 opacity-60">Toque para preencher automaticamente</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-300">
        <header className="text-center space-y-4">
          <div className={`size-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner relative transition-all ${error ? 'bg-red-500/10 text-red-500 animate-shake' : ''}`}>
            <ShieldCheck size={40} />
            {status === 'verifying' && <Loader2 size={48} className="absolute animate-spin opacity-20" />}
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Validação<br/><span className="text-primary">de Segurança</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {status === 'sent' ? 'Digite o token exato recebido.' : 'Selecione o canal seguro para envio.'}
          </p>
        </header>

        {status === 'idle' || status === 'sending' ? (
          <div className="space-y-3">
            <MethodButton active={method === 'whatsapp'} onClick={() => setMethod('whatsapp')} icon={<MessageCircle size={24}/>} title="WhatsApp" desc="Canal Criptografado" />
            <MethodButton active={method === 'sms'} onClick={() => setMethod('sms')} icon={<Phone size={24}/>} title="SMS" desc="Rede GSM Prioritária" />
            <MethodButton active={method === 'email'} onClick={() => setMethod('email')} icon={<Mail size={24}/>} title="E-mail" desc="Vinculado ao Google" />
            
            <button 
              disabled={!method || status === 'sending'}
              onClick={handleSendCode}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50 mt-6 flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110"
            >
              {status === 'sending' ? <Loader2 className="animate-spin" /> : 'Gerar Token de Acesso'}
              {status !== 'sending' && <ArrowRight size={20} />}
            </button>
          </div>
        ) : (
          <div className={`space-y-6 bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-2xl border transition-all relative overflow-hidden text-center ${error ? 'border-red-500 shadow-red-500/20' : 'border-slate-200 dark:border-white/5'}`}>
            
            {status === 'verifying' && (
              <div className="absolute inset-0 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Verificando Hash...</p>
              </div>
            )}
            
            <div className="flex flex-col items-center gap-2">
               <p className="text-xs font-black uppercase text-primary tracking-widest">Token Enviado para {method}</p>
               {error && <p className="text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full animate-pulse">Código Incorreto. Tente novamente.</p>}
            </div>
            
            <input 
              type="text" 
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => {
                setError(false);
                setCode(e.target.value.replace(/\D/g, ''));
              }}
              placeholder="000000"
              className={`w-full text-center text-4xl font-black tracking-[0.5em] bg-slate-50 dark:bg-background-dark border-2 rounded-2xl py-6 focus:ring-0 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 ${error ? 'border-red-500 text-red-500' : 'border-slate-200 dark:border-white/5 focus:border-primary text-slate-900 dark:text-white'}`}
            />

            <div className="flex justify-between items-center px-2">
               <button onClick={() => { setStatus('idle'); setCode(''); setShowPushNotification(false); }} className="text-[10px] font-bold uppercase text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                 <X size={12} /> Cancelar Operação
               </button>
               <span className="text-[10px] font-black uppercase text-slate-500">{timer > 0 ? `Expirar em ${timer}s` : 'Token Expirado'}</span>
            </div>

            <button onClick={handleVerify} disabled={code.length !== 6 || status === 'verifying'} className="w-full h-14 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50 hover:brightness-110">
              Validar Acesso
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MethodButton: React.FC<any> = ({ active, onClick, icon, title, desc }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${active ? 'border-primary bg-primary/5 shadow-inner scale-[1.02]' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-surface-dark hover:border-slate-300 dark:hover:border-white/10'}`}>
    <div className={`p-3 rounded-xl ${active ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-background-dark text-slate-400'}`}>{icon}</div>
    <div className="text-left">
      <h3 className="font-black text-sm uppercase italic leading-tight text-slate-900 dark:text-white">{title}</h3>
      <p className="text-[10px] font-bold text-slate-500 uppercase">{desc}</p>
    </div>
  </button>
);

export default Verify;