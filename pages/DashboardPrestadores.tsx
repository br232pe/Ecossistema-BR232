import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  ChevronRight, 
  BarChart3, 
  Target, 
  Zap, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Wallet,
  Settings,
  X,
  CreditCard
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import { useAuth } from '../src/contexts/AuthContext';

const DashboardPrestadores: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Announcement State
  const [newAd, setNewAd] = useState({
    title: "",
    category: "Residenciais",
    subCategory: "",
    description: "",
    whatsapp: "",
    city: profile?.currentCity || "Gravatá",
    neighborhood: "",
    pricingModel: "free",
    isUrgent: false
  });

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'services'),
      where('providerId', '==', profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(adsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    try {
      await addDoc(collection(db, 'services'), {
        ...newAd,
        providerId: profile.uid,
        rating: 5.0,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      setIsModalOpen(false);
      setNewAd({
        title: "",
        category: "Residenciais",
        subCategory: "",
        description: "",
        whatsapp: "",
        city: profile?.currentCity || "Gravatá",
        neighborhood: "",
        pricingModel: "free",
        isUrgent: false
      });
    } catch (err) {
      console.error("Erro ao criar anúncio:", err);
    }
  };

  const promoteAd = async (id: string, model: 'top' | 'emergency' | 'free') => {
    try {
      await updateDoc(doc(db, 'services', id), {
        pricingModel: model,
        isUrgent: model === 'emergency'
      });
    } catch (err) {
      console.error("Erro ao promover:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05100a] flex items-center justify-center">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100a] text-white font-sans pb-32">
      <header className="sticky top-0 z-50 bg-[#05100a]/90 backdrop-blur-md border-b border-white/5 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <TrendingUp size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase leading-none mb-1">Painel do Prestador</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Target size={10} /> Vida das Cidades • Gestão de Anúncios
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                Carteira <Wallet size={14} />
             </button>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-6 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_10px_30px_#00e676]/20"
              >
                Novo Anúncio <Plus size={14} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        
        {/* Insights do Prestador */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard label="Visualizações" value="1.4k" icon={<Eye size={18} />} color="#3b82f6" />
           <StatCard label="Contatos (Zap)" value="86" icon={<MessageSquare size={18} />} color="#00e676" />
           <StatCard label="Taxa Retenção" value="92%" icon={<Star size={18} />} color="#f59e0b" />
           <StatCard label="IP Prestador" value="680" icon={<TrendingUp size={18} />} color="#00e676" />
        </section>

        {/* Seção Low Cost Promocional */}
        <section className="p-8 bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-primary/20 rounded-[2.5rem]">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <Zap size={20} className="fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Ofertas Low Cost</span>
                 </div>
                 <h2 className="text-3xl font-black italic uppercase italic leading-tight">Impulsione por <span className="text-primary underline decoration-primary/30">R$ 3,00</span></h2>
                 <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                   Inspirado no modelo europeu: Apareça no topo da sua cidade por 24h ou vire destaque emergencial agora mesmo.
                 </p>
              </div>
              <div className="flex flex-wrap gap-4">
                 <PromoOption icon={<Target size={18} />} price="R$ 3" label="Topo da Cidade" />
                 <PromoOption icon={<Zap size={18} />} price="R$ 10" label="Destaque Urgente" />
              </div>
           </div>
        </section>

        {/* Lista de Anúncios Ativos */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Meus Serviços Cadastrados</h3>
           </div>

           <div className="grid gap-4">
              {announcements.length > 0 ? announcements.map(ad => (
                <AdItem key={ad.id} ad={ad} onPromote={(model: string) => promoteAd(ad.id, model as any)} onDelete={() => deleteDoc(doc(db, 'services', ad.id))} />
              )) : (
                <div className="p-20 bg-white/2 border border-dashed border-white/10 rounded-[2.5rem] text-center space-y-4">
                   <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                     <Plus size={32} />
                   </div>
                   <p className="text-slate-500 text-sm italic font-medium">Você ainda não possui anúncios. Comece agora!</p>
                </div>
              )}
           </div>
        </section>

      </main>

      {/* Modal Novo Anúncio */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a1a12] border border-white/10 rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh]"
            >
               <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                  <X />
               </button>
               
               <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black italic uppercase leading-none">Novo <span className="text-primary">Anúncio</span></h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digitalização da Vida Regional</p>
                  </div>

                  <form onSubmit={handleCreateAd} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Título do Serviço</label>
                           <input 
                             required
                             className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-primary/50 transition-all"
                             placeholder="Ex: Pedreiro Especialista em Bezerros"
                             value={newAd.title}
                             onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">WhatsApp</label>
                           <input 
                             required
                             className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-primary/50 transition-all font-mono"
                             placeholder="(81) 9...."
                             value={newAd.whatsapp}
                             onChange={(e) => setNewAd({...newAd, whatsapp: e.target.value})}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Categoria</label>
                           <select 
                             className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-primary/50 transition-all appearance-none text-sm"
                             value={newAd.category}
                             onChange={(e) => setNewAd({...newAd, category: e.target.value})}
                           >
                              <option value="Residenciais">Residenciais</option>
                              <option value="Emergenciais">Emergenciais</option>
                              <option value="Técnicos">Técnicos</option>
                              <option value="Urbanos">Urbanos</option>
                              <option value="Rurais">Rurais</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Bairro</label>
                           <input 
                             required
                             className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-primary/50 transition-all"
                             placeholder="Ex: Centro"
                             value={newAd.neighborhood}
                             onChange={(e) => setNewAd({...newAd, neighborhood: e.target.value})}
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Descrição Curta</label>
                        <textarea 
                           className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-primary/50 transition-all resize-none text-sm"
                           placeholder="Descreva seu serviço de forma clara e objetiva..."
                           value={newAd.description}
                           onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                        />
                     </div>

                     <div className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
                        <div className="flex-1 space-y-1">
                           <h4 className="text-[10px] font-black uppercase tracking-widest">Disponibilidade 24h?</h4>
                           <p className="text-[9px] font-bold text-slate-500 uppercase">Você atende chamados urgentes agora?</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setNewAd({...newAd, isUrgent: !newAd.isUrgent})}
                          className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${newAd.isUrgent ? 'bg-primary' : 'bg-white/10'}`}
                        >
                           <motion.div 
                              animate={{ x: newAd.isUrgent ? 24 : 0 }}
                              className="size-6 bg-white rounded-full shadow-lg"
                           />
                        </button>
                     </div>

                     <button 
                        type="submit"
                        className="w-full h-16 bg-primary text-black rounded-2xl font-black uppercase text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                     >
                       Publicar Agora
                     </button>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3 group hover:border-white/20 transition-all">
    <div className="flex items-center justify-between">
      <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110" style={{ color }}>
         {icon}
      </div>
      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Painel EcoBR</div>
    </div>
    <div>
      <div className="text-3xl font-black italic uppercase leading-none mb-1">{value}</div>
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);

const PromoOption = ({ icon, price, label }: any) => (
  <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl p-4 pr-6 hover:border-primary/30 transition-all cursor-pointer group">
     <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        {icon}
     </div>
     <div>
        <div className="text-xs font-black italic">{price}</div>
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
     </div>
  </div>
);

const AdItem = ({ ad, onPromote, onDelete }: any) => (
  <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-10">
     <div className="flex items-center gap-8">
        <div className="size-20 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center text-primary/40 shrink-0 group-hover:text-primary transition-colors">
           {ad.pricingModel === 'top' ? <Target size={32} /> : ad.isUrgent ? <Zap size={32} /> : <TrendingUp size={32} />}
        </div>
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <h4 className="text-xl font-black italic uppercase leading-none">{ad.title}</h4>
              <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase border ${
                 ad.pricingModel === 'top' ? 'border-primary/30 text-primary bg-primary/10' : 
                 ad.isUrgent ? 'border-red-500/30 text-red-500 bg-red-500/10' : 'border-white/10 text-slate-500 bg-white/5'
              }`}>
                 {ad.pricingModel === 'free' ? 'Básico' : ad.pricingModel === 'top' ? 'Destaque' : 'Urgente'}
              </span>
           </div>
           <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1"><MapPin size={10} /> {ad.city}</span>
              <span className="flex items-center gap-1"><Phone size={10} /> {ad.whatsapp}</span>
              <span className="flex items-center gap-1 text-primary"><Eye size={10} /> 124 views</span>
           </div>
        </div>
     </div>

     <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2">
           <button 
             onClick={() => onPromote(ad.pricingModel === 'top' ? 'free' : 'top')}
             className="h-12 px-6 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-primary/50 transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-black"
           >
              Impulsionar <CreditCard size={14} />
           </button>
           <button 
             onClick={onDelete}
             className="text-[8px] font-black uppercase tracking-widest text-slate-600 hover:text-red-500 transition-colors text-center"
           >
             Excluir Anúncio
           </button>
        </div>
        <button className="h-12 w-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all">
           <Settings size={18} />
        </button>
     </div>
  </div>
);

export default DashboardPrestadores;
