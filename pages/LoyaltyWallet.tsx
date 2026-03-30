
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { LoyaltyCard } from '../types';
import SmartHeader from '../components/SmartHeader';
import { QrCode, Ticket, CheckCircle2, Gift, MapPin, Loader2, ArrowRight, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const LoyaltyWallet: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<LoyaltyCard | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    const data = await db.loyalty.getWallet();
    setCards(data);
  };

  return (
    <div className="bg-background-dark min-h-screen text-white pb-32">
      <SmartHeader 
        title="Porta-Luvas" 
        subtitle="Carteira de Fidelidade"
        rightAction={
           <button onClick={() => navigate('/fidelidade/gerir')} className="text-[10px] font-black uppercase text-primary border border-primary/20 px-3 py-1 rounded-full hover:bg-primary/10 transition-colors">
             Sou Comerciante
           </button>
        }
      />

      <main className="p-6 space-y-8">
        
        {/* Banner Motivacional */}
        <div className="p-6 bg-gradient-to-br from-[#12261d] to-[#050d09] rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-primary">
            <Gift size={80} />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black italic uppercase leading-tight mb-2">Acumule e <br/><span className="text-primary">Ganhe</span></h2>
            <p className="text-xs text-slate-400 font-medium max-w-[70%]">Use o app em suas paradas na BR-232 e troque selos por benefícios reais.</p>
          </div>
        </div>

        {/* Lista de Cartões */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 pl-2">Meus Cartões</h3>
          
          {cards.length === 0 ? (
            <div className="text-center py-10 opacity-50">
               <Ticket size={48} className="mx-auto mb-4" />
               <p className="text-xs font-bold uppercase">Nenhum cartão ativo.</p>
            </div>
          ) : (
            cards.map(card => (
              <LoyaltyCardItem 
                key={card.id} 
                card={card} 
                onShowQR={() => setSelectedCard(card)}
              />
            ))
          )}
        </div>

        {/* Botão Adicionar */}
        <button className="w-full h-16 border-2 border-dashed border-white/10 rounded-[2rem] flex items-center justify-center gap-3 text-slate-500 hover:border-primary/50 hover:text-primary transition-all group">
          <QrCode size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Ler Novo QR Code</span>
        </button>

      </main>

      {/* QR Code Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-sm bg-surface-dark border border-white/10 rounded-[3rem] p-8 relative">
              <button 
                onClick={() => setSelectedCard(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-6">
                 <div>
                    <h3 className="text-xl font-black italic uppercase leading-none mb-2">{selectedCard.merchantName}</h3>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Mostre ao atendente para carimbar</p>
                 </div>

                 <div className="bg-white p-6 rounded-[2rem] inline-block shadow-[0_0_50px_rgba(0,230,118,0.2)]">
                    <QRCodeCanvas 
                      value={JSON.stringify({ type: 'stamp', cardId: selectedCard.id })}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                 </div>

                 <div className="pt-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                       Este código é único para o seu cartão.<br/>
                       A validação é feita via satélite pela Fundação.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const LoyaltyCardItem: React.FC<{ card: LoyaltyCard, onShowQR: () => void }> = ({ card, onShowQR }) => {
  const percentage = (card.currentStamps / card.goal) * 100;

  return (
    <div className={`relative bg-surface-dark border rounded-[2rem] overflow-hidden transition-all duration-500 ${card.isCompleted ? 'border-primary shadow-[0_0_30px_rgba(0,230,118,0.2)]' : 'border-white/5'}`}>
      
      {/* Cabeçalho do Cartão */}
      <div className="p-6 pb-4 flex justify-between items-start">
        <div>
          <h4 className="font-black text-lg italic uppercase leading-none mb-1">{card.merchantName}</h4>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{card.title}</p>
        </div>
        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${card.isCompleted ? 'bg-primary text-black border-primary' : 'bg-white/5 text-slate-400 border-white/10'}`}>
          {card.isCompleted ? 'Resgatar' : `${card.currentStamps}/${card.goal}`}
        </div>
      </div>

      {/* Grid de Selos */}
      <div className="px-6 py-2 flex flex-wrap gap-2">
        {Array.from({ length: card.goal }).map((_, i) => {
          const active = i < card.currentStamps;
          return (
            <div 
              key={i} 
              className={`size-8 rounded-full flex items-center justify-center border transition-all ${active ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-white/10'}`}
              style={{ backgroundColor: active ? card.color : undefined, borderColor: active ? card.color : undefined, color: active ? 'black' : undefined }}
            >
              {active ? <CheckCircle2 size={14} /> : <span className="text-[8px] font-bold">{i + 1}</span>}
            </div>
          );
        })}
      </div>

      {/* Action / Progresso */}
      <div className="p-6 pt-4 mt-2 bg-black/20 border-t border-white/5 flex items-center justify-between">
        {card.isCompleted ? (
           <div className="w-full">
             <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center space-y-2 mb-2">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Voucher Liberado</p>
                <p className="text-xl font-black italic text-white">{card.reward}</p>
             </div>
             <p className="text-[9px] text-center text-slate-500 font-mono">{card.voucherCode}</p>
           </div>
        ) : (
           <>
             <div className="flex flex-col gap-1">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Próxima Meta</span>
               <span className="text-xs font-bold text-white">{card.reward}</span>
             </div>
             <button 
               onClick={onShowQR}
               className="h-10 px-5 bg-white text-black rounded-xl font-black uppercase text-[9px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
             >
               <QrCode size={14} /> Carimbar
             </button>
           </>
        )}
      </div>

      {/* Barra de Progresso Fina */}
      <div className="h-1 w-full bg-white/5 mt-0">
        <div className="h-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: card.color }}></div>
      </div>
    </div>
  );
};

export default LoyaltyWallet;

