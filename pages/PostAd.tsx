import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Plus, 
  Image as ImageIcon, 
  MapPin, 
  Tag, 
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Award,
  Phone
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { firebaseService } from '../src/services/firebaseService';
import { useAuth } from '../src/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import PlaceAutocomplete from '../src/components/PlaceAutocomplete';

const PostAd: React.FC = () => {
  const navigate = useNavigate();
  const { adId } = useParams();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Veículos',
    price: '',
    description: '',
    phone: '',
    city: profile?.currentCity || 'Recife'
  });

  useEffect(() => {
    if (adId) {
      const fetchAd = async () => {
        const docRef = doc(db, 'classifieds', adId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            title: data.title,
            category: data.category,
            price: data.price,
            description: data.description,
            phone: data.phone || '',
            city: data.city || 'Recife'
          });
        }
      };
      fetchAd();
    }
  }, [adId]);

  const categories = ['Veículos', 'Imóveis', 'Pecuária', 'Serviços', 'Outros'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (adId) {
        await firebaseService.updateAd(adId, {
          ...formData,
          whatsappMessage: `Olá! Vi seu anúncio "${formData.title}" no ECOBR232 por ${formData.price}. Tenho interesse.`
        });
      } else {
        await firebaseService.createAd({
          ...formData,
          whatsappMessage: `Olá! Vi seu anúncio "${formData.title}" no ECOBR232 por ${formData.price}. Tenho interesse.`
        });
      }
      setSuccess(true);
      setTimeout(() => navigate('/meus-anuncios'), 2000);
    } catch (error) {
      console.error("Erro ao processar anúncio:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#05100a] text-white flex flex-col items-center justify-center p-8 text-center">
         <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           style={{ willChange: "transform, opacity" }} className="size-24 rounded-[2rem] bg-primary flex items-center justify-center text-black mb-8 shadow-[0_10px_40px_rgba(0,230,118,0.4)]"
         >
            <CheckCircle2 size={48} />
         </motion.div>
         <h2 className="text-4xl font-black italic uppercase italic tracking-tighter leading-tight mb-4">Anúncio <br/><span className="text-primary italic">Processado!</span></h2>
         <p className="text-slate-400 text-sm italic">Seu classificado está entrando na malha da feira digital.</p>
         <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <Award size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase text-slate-400 leading-none tracking-widest">Aguardando Verificação</span>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      <header className="sticky top-0 z-50 bg-[#05100a]/90 backdrop-blur-3xl border-b border-white/5 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <button 
             onClick={() => navigate(-1)}
             className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
           >
             <ArrowLeft size={20} />
           </button>
           <div className="flex flex-col items-center">
              <h1 className="text-xs font-black uppercase tracking-[0.4em] italic leading-none">
                {adId ? 'Editar Anúncio' : 'Novo Anúncio'}
              </h1>
              <p className="text-[8px] font-bold text-primary tracking-widest uppercase mt-1">A Feira Digital</p>
           </div>
           <div className="size-12 opacity-0"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        <div className="space-y-4">
           <h2 className="text-4xl font-black italic uppercase italic tracking-tighter leading-tight">
             {adId ? 'Atualizar seu' : 'O que você'} <br/> {adId ? 'anúncio' : 'quer vender?'}
           </h2>
           <p className="text-slate-400 text-sm italic">
             {adId ? 'Mantenha seus dados atualizados para melhores negociações.' : 'Anuncie para toda a malha geoeconômica da BR-232 em poucos toques.'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
           {/* Details */}
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block pl-4">Título do Anúncio</label>
                 <input 
                   type="text" 
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   placeholder="Ex: Hilux 2024 Conservada"
                   required
                   className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-slate-700 italic"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block pl-4">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all appearance-none italic"
                    >
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block pl-4">Valor (R$)</label>
                    <input 
                      type="text" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="Ex: 280.000"
                      required
                      className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-black italic focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-slate-700"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block pl-4">WhatsApp para Contato</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-primary">
                       <Phone size={18} />
                    </div>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Ex: 81999999999"
                      required
                      className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-black italic focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-slate-700"
                    />
                 </div>
                 <p className="px-4 text-[9px] font-bold text-slate-500 uppercase italic">Apenas números, com DDD. O contato será direto via WhatsApp.</p>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block pl-4">Descrição e Condição</label>
                 <textarea 
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   placeholder="Detalhe o estado do item, revisões, etc..."
                   required
                   className="w-full h-32 p-6 bg-white/5 border border-white/10 rounded-[2rem] text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-slate-700 resize-none italic"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block pl-4">Cidade / Localização</label>
                 <PlaceAutocomplete 
                   defaultValue={formData.city}
                   onPlaceSelect={(p) => setFormData({...formData, city: p?.displayName || ''})}
                   placeholder="Ex: Gravatá, Caruaru..."
                 />
                 <p className="px-4 text-[9px] font-bold text-slate-600 uppercase italic">Selecione a cidade para que os compradores saibam onde retirar.</p>
              </div>
           </div>

           {/* Submit */}
           <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-18 bg-white text-black hover:bg-slate-100 rounded-[1.5rem] font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {loading ? (adId ? 'Salvando...' : 'Subindo Anúncio...') : (adId ? 'Salvar Alterações' : 'Publicar na Feira Digital')} 
                 {!loading && <ChevronRight size={20} />}
              </button>
           </div>
        </form>

        {/* Gamification Tip */}
        <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex items-center gap-6">
           <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-black shrink-0">
              <TrendingUp size={24} />
           </div>
           <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Dica de Influência</h4>
              <p className="text-xs italic text-slate-400">Anúncios com fotos reais e descrições detalhadas aumentam seu <span className="text-white font-black">Patamar de Confiança</span> na rede.</p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default PostAd;
