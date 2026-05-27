import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Plus,
  Package,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../src/services/firebaseService';
import { Classified } from '../src/types';
import { useAuth } from '../src/contexts/AuthContext';

const MyAds: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ads, setAds] = useState<Classified[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMyAds();
  }, [user]);

  const fetchMyAds = async () => {
    setLoading(true);
    try {
      const data = await firebaseService.getMyClassifieds();
      setAds(data || []);
    } catch (error) {
      console.error("Erro ao carregar seus anúncios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (adId: string, status: 'active' | 'sold' | 'expired') => {
    try {
      await firebaseService.updateAd(adId, { status });
      setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, status } : ad));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!window.confirm("Deseja realmente remover este anúncio da malha?")) return;
    try {
      await firebaseService.deleteAd(adId);
      setAds(prev => prev.filter(ad => ad.id !== adId));
    } catch (error) {
      console.error("Erro ao excluir anúncio:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
       <header className="px-6 py-12 md:py-16 space-y-4 max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={14} /> Voltar ao Painel
          </button>
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <h1 className="text-4xl font-black italic uppercase italic tracking-tighter">Meus <br/><span className="text-primary italic">Anúncios.</span></h1>
                <p className="text-slate-400 text-xs italic font-medium uppercase tracking-tight">Gestão de ofertas na Feira Digital.</p>
             </div>
             <button 
               onClick={() => navigate('/anunciar')}
               className="size-16 rounded-2xl bg-primary text-black flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
             >
                <Plus size={32} />
             </button>
          </div>
       </header>

       <main className="max-w-4xl mx-auto px-6 space-y-6">
          {loading ? (
             <div className="space-y-4">
                {[1,2].map(i => <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse" />)}
             </div>
          ) : ads.length > 0 ? (
             <div className="grid gap-4">
                {ads.map(ad => (
                   <div key={ad.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col md:flex-row gap-6 relative group hover:border-primary/30 transition-all">
                      <div className="size-24 rounded-2xl bg-[#0c1a14] flex items-center justify-center text-slate-700">
                         <Package size={32} />
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border italic ${
                               ad.status === 'active' ? 'bg-primary/10 border-primary/20 text-primary' :
                               ad.status === 'sold' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                               'bg-slate-500/10 border-slate-500/20 text-slate-400'
                            }`}>
                               {ad.status === 'active' ? 'Ativo' : ad.status === 'sold' ? 'Vendido' : 'Expirado'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase italic">{ad.category}</span>
                         </div>
                         <h4 className="text-xl font-black italic uppercase italic leading-none">{ad.title}</h4>
                         <p className="text-2xl font-black italic text-white flex items-end gap-1">
                            <span className="text-[10px] text-primary lowercase mb-1">R$</span> {ad.price}
                         </p>
                      </div>

                      <div className="flex md:flex-col gap-2 justify-center">
                         <div className="flex gap-2">
                            {ad.status === 'active' && (
                               <ActionButton 
                                 onClick={() => navigate(`/anunciar/${ad.id}`)}
                                 icon={<Edit3 size={16} />} 
                                 label="Editar" 
                                 color="text-white hover:bg-white/10" 
                               />
                            )}
                            {ad.status === 'active' && (
                               <ActionButton 
                                 onClick={() => handleUpdateStatus(ad.id, 'sold')}
                                 icon={<CheckCircle size={16} />} 
                                 label="Vendido" 
                                 color="text-primary hover:bg-primary/10" 
                               />
                            )}
                            <ActionButton 
                              onClick={() => handleDelete(ad.id)}
                              icon={<Trash2 size={16} />} 
                              label="Excluir" 
                              color="text-red-500 hover:bg-red-500/10" 
                            />
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          ) : (
             <div className="py-20 text-center space-y-4">
                <div className="size-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700 mx-auto">
                   <ShoppingBag size={40} />
                </div>
                <p className="text-slate-500 italic max-w-xs mx-auto text-sm font-bold uppercase tracking-tight">Você ainda não publicou nenhum anúncio nesta jornada.</p>
                <button 
                  onClick={() => navigate('/anunciar')}
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Criar Primeiro Anúncio
                </button>
             </div>
          )}
       </main>
    </div>
  );
};

const ActionButton = ({ icon, label, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`h-12 px-4 rounded-xl border border-white/5 flex items-center gap-3 transition-all ${color}`}
  >
     {icon}
     <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default MyAds;
