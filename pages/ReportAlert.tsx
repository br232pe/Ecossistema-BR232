
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, ChevronRight, MapPin, Camera, Send, CheckCircle2, Loader2, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { db } from '../services/db';
import { auth } from '../services/firebase';

const ReportAlert: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('Acidente');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [km, setKm] = useState<number>(145); // Mock KM
  const [location, setLocation] = useState('Gravatá, PE');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReport = async () => {
    setErrorMsg(null);
    if (!auth.currentUser) {
      setErrorMsg("Você precisa estar logado para reportar.");
      return;
    }

    setLoading(true);
    try {
      await db.alerts.save({
        type,
        km,
        location: `${location} (Severidade: ${severity.toUpperCase()})`,
        userId: auth.currentUser.uid,
        severity: severity
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/alertas'), 2000);
    } catch (error) {
      console.error("Erro ao reportar:", error);
      setErrorMsg("Erro ao enviar alerta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-background-dark min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="size-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-black italic uppercase mb-2">Alerta Enviado!</h2>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">A malha BR-232 agradece sua contribuição.</p>
      </div>
    );
  }
  return (
    <div className="bg-background-dark min-h-screen text-white pb-12">
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl"><X size={20}/></button>
        <h2 className="font-black uppercase tracking-tighter italic">Reportar Ocorrência</h2>
        <div className="size-8"></div>
      </header>

      <main className="p-6 space-y-8">
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase text-center animate-in fade-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}
        {/* Aviso */}
        <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-[2rem] flex items-start gap-4">
          <div className="size-10 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-black" />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase text-orange-500 mb-1 italic">Atenção Motorista</h4>
            <p className="text-[10px] text-orange-500/80 font-medium leading-relaxed uppercase">
              Não digite enquanto dirige. Pare em local seguro para reportar.
            </p>
          </div>
        </div>

        {/* Grade de Tipos */}
        <section className="space-y-4">
          <h3 className="text-lg font-black italic uppercase tracking-tight">O que está acontecendo?</h3>
          <div className="grid grid-cols-2 gap-4">
            <TypeItem icon="minor_crash" label="Acidente" active={type === 'Acidente'} onClick={() => setType('Acidente')} />
            <TypeItem icon="traffic" label="Trânsito" active={type === 'Trânsito'} onClick={() => setType('Trânsito')} />
            <TypeItem icon="thunderstorm" label="Chuva Forte" active={type === 'Chuva Forte'} onClick={() => setType('Chuva Forte')} />
            <TypeItem icon="construction" label="Obras" active={type === 'Obras'} onClick={() => setType('Obras')} />
          </div>
        </section>

        {/* Severidade */}
        <section className="space-y-4">
          <h3 className="text-lg font-black italic uppercase tracking-tight">Nível de Impacto</h3>
          <div className="flex gap-3">
            <SeverityBtn 
              active={severity === 'low'} 
              onClick={() => setSeverity('low')} 
              label="Baixo" 
              icon={<Shield size={16} />} 
              color="bg-blue-500" 
            />
            <SeverityBtn 
              active={severity === 'medium'} 
              onClick={() => setSeverity('medium')} 
              label="Médio" 
              icon={<ShieldCheck size={16} />} 
              color="bg-orange-500" 
            />
            <SeverityBtn 
              active={severity === 'high'} 
              onClick={() => setSeverity('high')} 
              label="Crítico" 
              icon={<ShieldAlert size={16} />} 
              color="bg-red-500" 
            />
          </div>
        </section>

        {/* Localização */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black italic uppercase tracking-tight">Localização</h3>
            <button className="text-[10px] font-black uppercase text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">my_location</span> Atualizar GPS
            </button>
          </div>
          <div className="w-full h-18 bg-white/5 border border-white/10 rounded-[2rem] flex items-center px-6 gap-4">
            <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase italic">KM 145 - Gravatá, PE</p>
              <p className="text-[9px] text-slate-500 uppercase font-black">Detectado automaticamente próximo à Serra das Russas</p>
            </div>
          </div>
        </section>

        {/* Evidência */}
        <section className="space-y-4">
          <h3 className="text-lg font-black italic uppercase tracking-tight">Evidência <span className="text-slate-500">(Opcional)</span></h3>
          <div className="w-full h-40 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-white/[0.02] cursor-pointer hover:bg-white/5 transition-all">
            <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500">
              <Camera size={28} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold uppercase italic">Toque para adicionar foto ou vídeo</p>
              <p className="text-[9px] text-slate-600 uppercase font-black">Ajude outros motoristas a visualizar o problema</p>
            </div>
          </div>
        </section>

        {/* Botão Enviar */}
        <div className="pt-4">
          <button 
            onClick={handleReport}
            disabled={loading}
            className="w-full h-20 bg-primary hover:bg-primary-dark text-black rounded-[2rem] font-bold text-base flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(0,230,118,0.3)] active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <>Enviar Alerta <Send size={20} /></>}
          </button>
        </div>
      </main>
    </div>
  );
};

const SeverityBtn = ({ active, onClick, label, icon, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 h-14 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${active ? `border-white ${color} text-white` : 'border-white/5 bg-white/5 text-slate-500'}`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase italic">{label}</span>
  </button>
);

const TypeItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`relative h-32 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-3 ${active ? 'border-primary bg-primary/5' : 'border-white/5 bg-surface-dark'}`}
  >
    {/* Fix: Added missing CheckCircle2 import to lucide-react */}
    {active && <div className="absolute top-4 right-4 text-primary"><CheckCircle2 size={16} /></div>}
    <div className={`size-14 rounded-2xl flex items-center justify-center ${active ? 'bg-primary text-black' : 'bg-white/5 text-slate-500'}`}>
      <span className="material-symbols-outlined text-[32px]">{icon}</span>
    </div>
    <span className={`text-[11px] font-black uppercase tracking-tight italic ${active ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default ReportAlert;
