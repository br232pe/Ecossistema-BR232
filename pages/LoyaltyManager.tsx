
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { LoyaltyCampaign, LoyaltyTier } from '../types';
import SmartHeader from '../components/SmartHeader';
import { useAuth } from '../src/contexts/AuthContext';
import { Plus, Users, Crown, Zap, BarChart3, Lock, ScanLine, X, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const LoyaltyManager: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [campaigns, setCampaigns] = useState<LoyaltyCampaign[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('10');
  const [reward, setReward] = useState('');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    loadCampaigns();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const loadCampaigns = async () => {
    const data = await db.loyalty.getMyCampaigns();
    setCampaigns(data);
  };

  const startScanner = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render(async (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.type === 'stamp' && data.cardId) {
            scanner.pause();
            setIsProcessing(true);
            await db.loyalty.addStamp(data.cardId);
            setSuccessMsg("Selo adicionado com sucesso!");
            setTimeout(() => setSuccessMsg(null), 3000);
            scanner.resume();
            setShowScanner(false);
            scanner.clear();
          }
        } catch (e) {
          console.error("Erro ao processar QR Code", e);
        } finally {
          setIsProcessing(false);
        }
      }, (error) => {
        // console.warn(error);
      });
      
      scannerRef.current = scanner;
    }, 100);
  };

  const handleCreate = async () => {
    if (!title || !reward) return;
    await db.loyalty.createCampaign({
      title,
      goal: parseInt(goal),
      reward,
      merchantName: profile?.displayName || 'Meu Negócio',
      tier: LoyaltyTier.FREE,
      rules: 'Regras padrão.',
      color: '#00e676'
    });
    setShowCreate(false);
    loadCampaigns();
  };

  return (
    <div className="bg-background-dark min-h-screen text-white pb-32">
      <SmartHeader 
        title="Painel Fidelidade" 
        subtitle="Gestão de Campanhas"
      />

      <main className="p-6 space-y-8">
        {successMsg && (
          <div className="p-4 bg-primary/20 border border-primary/30 rounded-2xl text-primary text-xs font-bold uppercase text-center animate-in fade-in slide-in-from-top-2">
            {successMsg}
          </div>
        )}
        
        {/* B2B Gamification - KMs de Influência */}
        <div className="p-6 bg-surface-dark border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50"></div>
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <h2 className="text-3xl font-black italic text-white leading-none">350 <span className="text-xs not-italic text-slate-400 font-bold uppercase tracking-wide">KM</span></h2>
                 <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Sua Influência B2B</p>
              </div>
              <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                 <Crown size={24} className="text-yellow-500" fill="currentColor" />
              </div>
           </div>
           <div className="mt-6 pt-4 border-t border-white/5 flex gap-4 overflow-x-auto">
              <MissionPill label="Validar 10 CPFs" done={true} />
              <MissionPill label="Completar Perfil" done={false} />
              <MissionPill label="Convidar Amigo" done={false} />
           </div>
        </div>

        {/* Ação Rápida: Validar Cliente */}
        <button 
          onClick={startScanner}
          className="w-full h-20 bg-primary text-black rounded-[2rem] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(0,230,118,0.2)] active:scale-95 transition-all"
        >
           <ScanLine size={28} />
           <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Validar Cliente</p>
              <p className="text-sm font-black italic uppercase">Escanear QR Code</p>
           </div>
        </button>

        {/* Lista de Campanhas */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Minhas Campanhas</h3>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Plano Free (1/1)</span>
           </div>

           {campaigns.map(camp => (
             <div key={camp.id} className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-start">
                   <div>
                      <h4 className="font-bold text-lg italic uppercase">{camp.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Meta: {camp.goal} Selos</p>
                   </div>
                   <span className="px-2 py-1 bg-primary/20 text-primary text-[9px] font-black uppercase rounded-md border border-primary/20">Ativa</span>
                </div>
                <div className="p-3 bg-black/20 rounded-xl flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Users size={16} />
                      <span className="text-[10px] font-bold uppercase">{camp.activeUsers} Clientes</span>
                   </div>
                   <button className="text-[10px] font-black uppercase text-white hover:text-primary transition-colors">
                      Imprimir QR
                   </button>
                </div>
             </div>
           ))}

           {/* Botão Criar (Bloqueado se já tiver 1 no Free) */}
           {campaigns.length > 0 && (
             <button className="w-full p-4 rounded-2xl border border-dashed border-white/10 text-slate-500 flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                <Lock size={16} />
                <span className="text-[10px] font-black uppercase">Upgrade para criar mais</span>
             </button>
           )}
           
           {campaigns.length === 0 && !showCreate && (
             <button onClick={() => setShowCreate(true)} className="w-full h-16 bg-primary text-black rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                <Plus size={20} /> Criar Campanha
             </button>
           )}
        </div>

        {/* Formulário de Criação Simplificado */}
        {showCreate && (
          <div className="bg-surface-dark border border-white/10 p-6 rounded-[2.5rem] space-y-4 animate-in slide-in-from-bottom-10">
             <h3 className="text-lg font-black italic uppercase">Nova Campanha</h3>
             
             <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500">Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Almoço Grátis" className="w-full h-12 bg-black/20 rounded-xl px-4 text-sm font-bold text-white border border-white/10 focus:border-primary outline-none" />
             </div>

             <div className="flex gap-4">
               <div className="space-y-1 flex-1">
                  <label className="text-[9px] font-black uppercase text-slate-500">Selos p/ Ganhar</label>
                  <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full h-12 bg-black/20 rounded-xl px-4 text-sm font-bold text-white border border-white/10 focus:border-primary outline-none">
                     <option value="5">5 Selos</option>
                     <option value="10">10 Selos</option>
                     <option value="12">12 Selos</option>
                  </select>
               </div>
             </div>

             <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500">Prêmio (Voucher)</label>
                <input value={reward} onChange={e => setReward(e.target.value)} placeholder="Ex: 1 Refeição Completa" className="w-full h-12 bg-black/20 rounded-xl px-4 text-sm font-bold text-white border border-white/10 focus:border-primary outline-none" />
             </div>

             <div className="pt-4 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 h-12 bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                <button onClick={handleCreate} className="flex-1 h-12 bg-primary text-black rounded-xl text-[10px] font-black uppercase">Publicar</button>
             </div>
          </div>
        )}

      </main>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-[150] bg-black flex flex-col">
           <div className="p-6 flex items-center justify-between border-b border-white/10">
              <h3 className="text-lg font-black italic uppercase">Validar Selo</h3>
              <button 
                onClick={() => {
                  if (scannerRef.current) scannerRef.current.clear();
                  setShowScanner(false);
                }}
                className="p-2 bg-white/5 rounded-full"
              >
                <X size={24} />
              </button>
           </div>
           
           <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden border-4 border-primary/30"></div>
              
              <div className="mt-10 text-center space-y-2">
                 <p className="text-sm font-black italic uppercase text-primary">Aponte para o QR Code do Cliente</p>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">A validação será processada instantaneamente</p>
              </div>

              {isProcessing && (
                <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full">
                   <Loader2 className="animate-spin text-primary" size={20} />
                   <span className="text-[10px] font-black uppercase text-primary tracking-widest">Processando Selo...</span>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const MissionPill: React.FC<{ label: string, done: boolean }> = ({ label, done }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase whitespace-nowrap ${done ? 'bg-primary/20 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-slate-500'}`}>
     <div className={`size-2 rounded-full ${done ? 'bg-primary' : 'bg-slate-600'}`}></div>
     {label}
  </div>
);

export default LoyaltyManager;

