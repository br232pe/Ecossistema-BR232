import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Menu, 
  X, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Calendar,
  Zap,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Search,
  LayoutGrid,
  Users,
  BrainCircuit,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  Edit2,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mnemeService } from '../src/services/mnemeService';
import { useAuth } from '../src/contexts/AuthContext';
import { MnemeList } from '../src/types';

const Mneme: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lists, setLists] = useState<MnemeList[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for List Rename Module
  const [editingList, setEditingList] = useState<MnemeList | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);

  // States for Deletion and Alerta de Segurança friction workflow
  const [listToDelete, setListToDelete] = useState<MnemeList | null>(null);
  const [itemsCountToDelete, setItemsCountToDelete] = useState(0);
  const [isCheckingItems, setIsCheckingItems] = useState(false);
  const [confirmWord, setConfirmWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom high-contrast responsive status notifications (Toast)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Deep clone operation safety state tracking
  const [cloningListId, setCloningListId] = useState<string | null>(null);

  const handleCloneList = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    if (cloningListId) return; // Prevent concurrent requests & double tap
    setCloningListId(listId);
    try {
      const newListId = await mnemeService.cloneSupplyList(listId);
      showToast('Lista duplicada com todos os itens com sucesso!', 'success');
      // Sincronizar atrasos para evitar Race Conditions durante o push
      setTimeout(() => {
        navigate(`/mneme/lista/${newListId}`);
      }, 300);
    } catch (err) {
      console.error('Deep cloning failed:', err);
      showToast('Erro ao realizar a clonagem profunda da lista.', 'error');
    } finally {
      setCloningListId(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const safeGetTime = (timestamp: any): number => {
    if (!timestamp) return Date.now();
    if (typeof timestamp.toMillis === 'function') {
      try {
        return timestamp.toMillis();
      } catch (e) {}
    }
    if (typeof timestamp.toDate === 'function') {
      try {
        return timestamp.toDate().getTime();
      } catch (e) {}
    }
    if (timestamp.seconds !== undefined) {
      return timestamp.seconds * 1000 + (timestamp.nanoseconds ? timestamp.nanoseconds / 1000000 : 0);
    }
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      const parse = Date.parse(timestamp);
      return isNaN(parse) ? Date.now() : parse;
    }
    return Date.now();
  };

  const formatBrazilianDate = (timestamp: any): string => {
    if (!timestamp) return '';
    let date: Date;
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp.seconds !== undefined) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      const parsed = Date.parse(timestamp);
      if (!isNaN(parsed)) {
        date = new Date(parsed);
      } else {
        return '';
      }
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDeleteClick = async (e: React.MouseEvent, list: MnemeList) => {
    e.stopPropagation();
    setIsCheckingItems(true);
    try {
      let count = 0;
      if (!list.id.startsWith('temp_') && !list.id.startsWith('local_')) {
        const { getDocs, query, where, collection, getFirestore } = await import('firebase/firestore');
        const dbInstance = getFirestore();
        const itemsQuery = query(collection(dbInstance, 'mneme_items'), where('listId', '==', list.id));
        const itemsSnap = await getDocs(itemsQuery);
        count = itemsSnap.size;
      } else {
        const currentUid = user?.uid || 'default';
        try {
          const val = localStorage.getItem(`mneme_backup_items_${currentUid}_${list.id}`);
          const items = val ? JSON.parse(val) : [];
          count = items.length;
        } catch (err) {
          count = 0;
        }
      }
      setListToDelete(list);
      setItemsCountToDelete(count);
      setConfirmWord('');
    } catch (err) {
      console.error(err);
      showToast('Erro ao checar itens da lista.', 'error');
    } finally {
      setIsCheckingItems(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!listToDelete) return;
    
    if (itemsCountToDelete > 0 && confirmWord.trim().toUpperCase() !== 'APAGAR') {
      showToast('Para confirmar, digite APAGAR', 'error');
      return;
    }

    setIsDeleting(true);
    const targetId = listToDelete.id;
    try {
      await mnemeService.deleteListCascade(targetId, itemsCountToDelete);
      setLists((prevLists) => prevLists.filter((list) => list.id !== targetId));
      showToast('Lista excluída com sucesso.', 'success');
      setListToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir lista do banco.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenRename = (e: React.MouseEvent, list: MnemeList) => {
    e.stopPropagation();
    setEditingList(list);
    setEditingListName(list.name);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingList || !editingListName.trim() || isUpdatingMetadata) return;

    const targetId = editingList.id;
    const targetCollection = 'mneme_lists';
    const payload = { name: editingListName.trim() };

    console.warn('--- RAIO-X SALVAMENTO ---');
    console.warn('ID do Documento Alvo:', targetId);
    console.warn('Coleção Alvo:', targetCollection);
    console.warn('Payload a ser enviado:', payload);

    if (!targetId || targetId.startsWith('temp_') || targetId.startsWith('local_')) {
      showToast('Falha: ID da lista é inválido ou temporário.', 'error');
      throw new Error('ID Inválido ou Perdido');
    }

    setIsUpdatingMetadata(true);
    try {
      await mnemeService.updateListMetadata(targetId, editingListName.trim());
      showToast('Nome da lista atualizado síncronamente.', 'success');
      setEditingList(null);
    } catch (err: any) {
      console.error('Falha FATAL no Firebase. Código:', err.code, 'Mensagem:', err.message);
      console.error("Erro completo ao renomear lista:", err);
      showToast('Falha ao atualizar nome da lista.', 'error');
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Gatilho de Autolimpeza (Garbage Collection) assíncrono e silencioso (background)
    mnemeService.cleanupOldLists(user.uid).catch((err) => {
      console.warn("Silent background cleanup warning:", err);
    });

    const unsubscribe = mnemeService.subscribeToLists(user.uid, user.email, (data: MnemeList[]) => {
      setLists(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredLists = lists.filter(l => 
    activeTab === 'active' 
      ? (!l.status || l.status === 'active') 
      : l.status === 'archived'
  );

  const handleDeleteHistory = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    const found = lists.find(l => l.id === listId);
    if (found) {
      handleDeleteClick(e, found);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !user || isSaving) return;
    
    setIsSaving(true);
    try {
      const docRef = await mnemeService.createList(user.uid, newListName);
      setNewListName('');
      setIsSaving(false);
      setIsCreating(false);
      
      if (docRef && docRef.id) {
        navigate(`/mneme/lista/${docRef.id}`);
      }
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      {/* Header Stat Bar */}
      <header className="sticky top-0 z-50 bg-[#05100a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 px-safe">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4 cursor-pointer select-none active:opacity-80 transition-opacity" onClick={() => navigate('/portal')}>
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shadow-lg shrink-0">
                 <img 
                   src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                   className="size-full object-contain"
                   alt="BR232"
                   referrerPolicy="no-referrer"
                 />
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-widest leading-none">Portal BR232</h1>
              <p className="text-[8px] font-bold text-primary tracking-widest uppercase mt-1">Conectado: Recife</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <nav className="hidden lg:flex items-center gap-6 mr-4">
                  <button onClick={() => navigate('/')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Início</button>
                  <button onClick={() => navigate('/mneme')} className="text-[9px] font-black uppercase tracking-widest text-[#ff751f] hover:text-primary transition-colors italic px-2 py-1">Cesta</button>
                  <button onClick={() => navigate('/guia-servicos')} className="text-[9px] font-black uppercase tracking-widest text-[#00e676] hover:text-primary transition-colors italic px-2 py-1">Serviços</button>
                  <button onClick={() => navigate('/planos')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Planos</button>
                  <button onClick={() => navigate('/blog')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Blog</button>
             </nav>
             
             <div className="hidden sm:flex items-center gap-3">
                <button 
                   onClick={() => navigate('/dashboard')}
                   className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-all"
                >
                   Meu Painel
                </button>
             </div>

             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-95 transition-all"
             >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>
      </header>

      {/* Header Contextual */}
      <div className="px-6 py-10 sm:py-16 space-y-8 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50" />
         
         <div className="flex items-center justify-between max-w-6xl mx-auto relative z-20">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                  <BrainCircuit size={12} className="text-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Lista de Compras Inteligente</span>
               </div>
               <h1 className="text-4xl sm:text-6xl font-black italic uppercase leading-none">Cesta do Lar.</h1>
               <p className="text-slate-400 text-xs sm:text-sm font-medium italic max-w-md hidden sm:block">Criação prática de listas de compras integradas com inteligência nutricional, radar de preços e sincronia da casa.</p>
            </div>
            
            <div className="flex items-center gap-3 animate-fade-in">
               <button 
                 onClick={() => setIsCreating(true)}
                 className="size-14 sm:size-20 rounded-[1.5rem] sm:rounded-[2.2rem] bg-primary flex items-center justify-center text-black shadow-[0_20px_50px_rgba(0,230,118,0.3)] hover:scale-105 active:scale-95 transition-all group"
               >
                  <Plus size={24} className="sm:hidden" />
                  <Plus size={40} className="hidden sm:block group-hover:rotate-90 transition-transform duration-500" />
               </button>
            </div>
         </div>

         <p className="text-slate-400 text-xs font-medium italic sm:hidden relative z-10 px-0.5">Criação prática de listas de compras com inteligência nutricional, radar de preços e sincronia da casa.</p>

         {/* Mobile Menu Overlay */}
         <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[100] bg-[#05100a] lg:hidden p-8 pt-24 space-y-8 flex flex-col items-center text-center overflow-y-auto"
              >
                 <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                    <X size={24} />
                 </button>
                 
                 <nav className="flex flex-col gap-6 w-full">
                    <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Início</button>
                    <button onClick={() => { navigate('/portal'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Portal BR232</button>
                    <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-[#ff751f]/10 border border-[#ff751f]/20 text-lg font-black uppercase tracking-[0.2em] italic text-[#ff751f]">Cesta do Lar</button>
                    <button onClick={() => { navigate('/guia-servicos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Guia de Serviços</button>
                    <button onClick={() => { navigate('/planos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Planos & Patronos</button>
                    <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-primary/10 border border-primary/20 text-lg font-black uppercase tracking-[0.2em] italic text-primary">Meu Painel</button>
                 </nav>
     
                 <div className="w-full h-px bg-white/5" />
     
                 <div className="flex flex-col gap-3 w-full pb-12">
                    <button onClick={() => { navigate('/alertas'); setIsMenuOpen(false); }} className="h-14 rounded-xl border border-red-500/30 text-[10px] font-black uppercase text-red-500 tracking-widest">Alertas da Rodovia</button>
                    <button onClick={() => { navigate('/classificados'); setIsMenuOpen(false); }} className="h-14 rounded-xl border border-emerald-500/30 text-[10px] font-black uppercase text-emerald-500 tracking-widest">A Feira Digital</button>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>

         {/* Stats Row */}
         <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 relative z-10">
            <StatCard label="Listas Ativas" value={lists.length.toString()} icon={<LayoutGrid size={14} />} />
            <StatCard label="PRODUTOS MONITORADOS" value="24" icon={<ShoppingCart size={14} />} />
            <StatCard label="Economia IA" value="R$ 152" icon={<TrendingUp size={14} />} color="text-primary" />
         </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 space-y-12">
         
         {/* List Feed */}
         <section className="space-y-8">
            <div className="flex items-center justify-between">
               <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`text-xs font-black uppercase tracking-[0.4em] italic transition-all ${activeTab === 'active' ? 'text-primary' : 'text-slate-600'}`}
                  >
                     Listas Ativas
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`text-xs font-black uppercase tracking-[0.4em] italic transition-all ${activeTab === 'history' ? 'text-primary' : 'text-slate-600'}`}
                  >
                     Histórico
                  </button>
                  <button 
                    onClick={() => navigate('/mneme/dashboard')}
                    className="text-xs font-black uppercase tracking-[0.4em] italic text-slate-600 hover:text-primary transition-all flex items-center gap-2"
                  >
                     Dashboard <BarChart3 size={14} className="text-primary" />
                  </button>
               </div>
               <div className="flex gap-2">
                  <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500"><Search size={18} /></button>
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <AnimatePresence mode="wait">
                  {filteredLists.length > 0 ? (
                     <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                        {filteredLists.map(list => (
                           <motion.div 
                             key={list.id}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             onClick={() => navigate(`/mneme/lista/${list.id}`)}
                             className="p-8 bg-white/5 border border-white/10 rounded-[3rem] hover:border-primary/40 hover:bg-white/[0.08] transition-all cursor-pointer group relative overflow-hidden hover:shadow-2xl"
                           >
                              {activeTab === 'active' ? (
                                 <>
                                   <div className="absolute top-0 right-0 p-8 text-white/[0.01] -mr-4 -mt-4 transition-all group-hover:opacity-0">
                                      <ShoppingCart size={80} />
                                   </div>
                                   <div className="absolute top-6 right-6 z-20 flex gap-2">
                                      <button 
                                        onClick={(e) => handleCloneList(e, list.id)}
                                        disabled={cloningListId !== null}
                                        className="size-10 rounded-xl bg-white/5 text-slate-400 hover:text-primary hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                                        title="Duplicar/Clonar Lista"
                                      >
                                        {cloningListId === list.id ? (
                                          <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#00e676" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                        ) : (
                                          <Copy size={16} />
                                        )}
                                      </button>
                                      <button 
                                        onClick={(e) => handleOpenRename(e, list)}
                                        className="size-10 rounded-xl bg-white/5 text-slate-400 hover:text-primary hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
                                        title="Renomear Lista"
                                      >
                                         <Edit2 size={16} />
                                      </button>
                                      <button 
                                        onClick={(e) => handleDeleteClick(e, list)}
                                        className="size-10 rounded-xl bg-red-500/10 text-[#ff3d71] hover:bg-[#ff3d71]/20 flex items-center justify-center transition-all active:scale-95"
                                        title="Excluir Lista"
                                      >
                                         <Trash2 size={16} />
                                      </button>
                                   </div>
                                 </>
                              ) : (
                                 <div className="absolute top-6 right-6 z-20">
                                    <button 
                                      onClick={(e) => handleDeleteClick(e, list)}
                                      className="size-10 rounded-xl bg-red-500/10 text-[#ff3d71] hover:bg-[#ff3d71]/20 flex items-center justify-center transition-all active:scale-95"
                                      title="Excluir Registro"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              )}

                              <div className="space-y-6 relative z-10 pr-24">
                                 <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                       <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">{list.name}</h4>
                                       <div className="flex items-center gap-2 text-[10px] font-bold uppercase italic text-slate-500">
                                          <MapPin size={10} className="text-primary" />
                                          <span>{list.supermarketName || 'Multimarcas Regional'}</span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-wrap">
                                       <div className="space-y-0.5">
                                          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Criada em</p>
                                          <div className="flex items-center gap-1.5 text-[10px] font-bold italic text-slate-300">
                                             <Calendar size={12} className="text-primary/70" />
                                             <span>{formatBrazilianDate(list.createdAt)}</span>
                                          </div>
                                       </div>

                                       {(() => {
                                         const timeCreated = safeGetTime(list.createdAt);
                                         const timeUpdated = safeGetTime(list.updatedAt);
                                         const isEdited = timeUpdated > timeCreated && (timeUpdated - timeCreated) > 2000;
                                         if (isEdited) {
                                            return (
                                              <div className="space-y-0.5">
                                                 <p className="text-[8px] font-black uppercase text-primary tracking-widest">Status</p>
                                                 <div className="flex items-center gap-1.5 text-[10px] font-bold italic text-primary">
                                                    <Clock size={12} className="text-primary/70" />
                                                    <span>Editado em: {formatBrazilianDate(list.updatedAt)}</span>
                                                 </div>
                                              </div>
                                            );
                                         }
                                         return null;
                                       })()}

                                       {activeTab === 'history' && (
                                         <div className="space-y-0.5">
                                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Valor</p>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">R$ {list.totalSpent?.toFixed(2) || '0,00'}</span>
                                         </div>
                                       )}
                                    </div>
                                    <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                       <ChevronRight size={24} />
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  ) : (
                     !isLoading && (
                        <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] space-y-6">
                           <LayoutGrid size={48} className="mx-auto text-slate-800" />
                           <div className="space-y-2">
                              <p className="text-slate-400 font-medium italic">
                                 {activeTab === 'active' ? 'Nenhuma lista de compras ativa no momento.' : 'Nenhum registro no histórico.'}
                              </p>
                              {activeTab === 'active' && (
                                 <button onClick={() => setIsCreating(true)} className="text-primary font-black uppercase text-[10px] tracking-widest">Criar minha primeira lista</button>
                              )}
                           </div>
                        </div>
                     )
                  )}
               </AnimatePresence>
            </div>
         </section>

         {/* Ad: Consultor de Gôndola */}
         <section className="relative group cursor-pointer" onClick={() => navigate('/mneme/mercado')}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-10 bg-white/5 border border-white/10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 group-hover:border-primary/30 transition-all overflow-hidden">
               <div className="absolute top-0 right-0 p-12 text-white/5 -mr-12 -mt-12 group-hover:rotate-12 transition-transform duration-1000">
                  <ShoppingCart size={240} />
               </div>
               
               <div className="space-y-6 relative z-10 flex-1">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black italic uppercase tracking-tighter">Consultor de Gôndola</h3>
                     <p className="text-slate-400 font-medium italic text-sm sm:text-base leading-relaxed">
                        Economize em cada KM. A Cesta do Lar compara os preços de estabelecimentos lindeiros na rodovia para indicar as melhores ofertas de mercado.
                     </p>
                  </div>
                  <button className="h-14 px-8 bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-primary hover:text-black transition-all">
                     Consultar Preços <TrendingUp size={18} />
                  </button>
               </div>
               
               <div className="hidden lg:flex gap-4 relative z-10">
                  <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex flex-col items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Gravatá</span>
                     <span className="text-lg font-black text-primary">-12%</span>
                  </div>
                  <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex flex-col items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Caruaru</span>
                     <span className="text-lg font-black text-primary">-18%</span>
                  </div>
               </div>
            </div>
         </section>

         {/* Policy Section */}
         <section className="pt-20 border-t border-white/5">
            <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
               <Clock size={40} className="text-blue-500/50" />
               <div className="space-y-1 flex-1">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Política de Retenção Cesta do Lar Free</h5>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                     Para garantir a sustentabilidade do ecossistema, listas com mais de 12 meses são automaticamente recicladas. 
                     Mantenha-se no controle arquivando apenas o necessário. <span className="text-blue-500 font-bold">Em breve: Cesta do Lar PRO para histórico ilimitado.</span>
                  </p>
               </div>
            </div>
         </section>
      </main>

      {/* Create List Modal */}
      <AnimatePresence>
         {isCreating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setIsCreating(false)}
                 className="absolute inset-0 bg-black/80 backdrop-blur-xl"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-lg bg-[#0a1811] border border-white/10 p-12 rounded-[3.5rem] shadow-3xl space-y-10"
               >
                  <div className="space-y-2 text-center">
                     <h3 className="text-4xl font-black italic uppercase tracking-tighter">Nova Lista.</h3>
                     <p className="text-slate-500 text-sm italic font-medium">Dê um nome para a sua lista de compras.</p>
                  </div>

                  <form onSubmit={handleCreateList} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-2">Nome da Lista</label>
                        <input 
                          autoFocus
                          type="text" 
                          disabled={isSaving}
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          placeholder={isSaving ? "Sincronizando com a nuvem..." : "Ex: Compras da Semana ou Feira de Sábado"}
                          className="w-full h-20 px-8 bg-white/5 border border-white/10 rounded-3xl text-xl font-black italic uppercase tracking-tight focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          type="button" 
                          disabled={isSaving}
                          onClick={() => setIsCreating(false)}
                          className="h-16 rounded-2xl border border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all disabled:opacity-30"
                         >
                           Cancelar
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSaving || !newListName.trim()}
                          className="h-16 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                         >
                           {isSaving ? (
                             <>
                               <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               <span>Salvando...</span>
                             </>
                           ) : (
                             "Criar Lista"
                           )}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Edit List Name Modal */}
      <AnimatePresence>
         {editingList && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => !isUpdatingMetadata && setEditingList(null)}
                 className="absolute inset-0 bg-black/80 backdrop-blur-xl"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-lg bg-[#0a1811] border border-white/10 p-12 rounded-[3.5rem] shadow-3xl space-y-10"
               >
                  <div className="space-y-2 text-center">
                     <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Renomear Lista.</h3>
                     <p className="text-slate-500 text-sm italic font-medium">Modifique o nome da lista de suprimentos.</p>
                  </div>

                  <form onSubmit={handleSaveRename} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-2">Título da Lista</label>
                        <input 
                          autoFocus
                          type="text" 
                          disabled={isUpdatingMetadata}
                          value={editingListName}
                          onChange={(e) => setEditingListName(e.target.value)}
                          placeholder="Ex: Rancho Mensal ou Feira"
                          className="w-full h-20 px-8 bg-white/5 border border-white/10 rounded-3xl text-xl font-black italic uppercase tracking-tight focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          type="button" 
                          disabled={isUpdatingMetadata}
                          onClick={() => setEditingList(null)}
                          className="h-16 rounded-2xl border border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all disabled:opacity-30"
                         >
                           Cancelar
                        </button>
                        <button 
                          type="submit" 
                          disabled={isUpdatingMetadata || !editingListName.trim()}
                          className="h-16 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                         >
                           {isUpdatingMetadata ? 'Salvando...' : 'Atualizar'}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Deletion Friction Modal */}
      <AnimatePresence>
         {listToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ contentVisibility: 'auto' }}>
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => !isDeleting && setListToDelete(null)}
                 className="absolute inset-0 bg-black/90 backdrop-blur-xl"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-lg bg-[#0e0a0a] border border-[#ff3d71]/30 p-12 rounded-[3.5rem] shadow-4xl space-y-8 text-center z-10"
               >
                  {itemsCountToDelete === 0 ? (
                     <>
                        <div className="size-20 rounded-[2rem] bg-[#ff3d71]/10 border border-[#ff3d71]/20 flex items-center justify-center text-[#ff3d71] mx-auto animate-bounce">
                           <Trash2 size={36} />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Excluir Lista?</h3>
                           <p className="text-slate-400 text-sm font-medium italic">
                              Esta lista está vazia. Tem certeza de que gostaria de removê-la permanentemente?
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                           <button 
                             type="button" 
                             disabled={isDeleting}
                             onClick={() => setListToDelete(null)}
                             className="h-16 rounded-2xl border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all disabled:opacity-30"
                           >
                              Voltar
                           </button>
                           <button 
                             type="button" 
                             disabled={isDeleting}
                             onClick={handleConfirmDelete}
                             className="h-16 rounded-2xl bg-[#ff3d71] text-white font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                           >
                             {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                           </button>
                        </div>
                     </>
                  ) : (
                     <>
                        <div className="size-24 rounded-[2.5rem] bg-[#ff3d71]/10 border-2 border-[#ff3d71] flex items-center justify-center text-[#ff3d71] mx-auto">
                           <AlertTriangle size={48} className="animate-pulse" />
                        </div>
                        <div className="space-y-3">
                           <div className="inline-block px-3 py-1 bg-[#ff3d71]/20 rounded-full text-[9px] font-black uppercase tracking-[0.34em] text-[#ff3d71] mb-1">
                              ALERTA DE SEGURANÇA SEVERO
                           </div>
                           <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Ação Destrutiva.</h3>
                           <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                              A lista <strong className="text-white">"{listToDelete.name}"</strong> não está vazia e fornece proteção do lar para <strong className="text-[#ff3d71] underline font-black">{itemsCountToDelete} itens</strong>.
                           </p>
                        </div>

                        <div className="space-y-2 pt-2 text-left">
                           <label className="text-[10px] font-black uppercase tracking-widest text-[#ff3d71]/80 italic ml-1">
                              Digite <span className="font-extrabold text-[#ff3d71] underline">APAGAR</span> para autorizar
                           </label>
                           <input 
                             type="text" 
                             autoFocus
                             value={confirmWord}
                             onChange={(e) => setConfirmWord(e.target.value)}
                             placeholder="DIGITE A PALAVRA DE CONFIRMAÇÃO..."
                             className="w-full h-16 px-6 bg-red-500/5 border border-[#ff3d71]/30 rounded-2xl text-center text-lg font-black text-[#ff3d71] placeholder:text-[#ff3d71]/30 focus:outline-none focus:border-[#ff3d71] transition-all uppercase"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <button 
                             type="button" 
                             disabled={isDeleting}
                             onClick={() => setListToDelete(null)}
                             className="h-16 rounded-2xl border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all disabled:opacity-30"
                           >
                             Abortar
                           </button>
                           <button 
                             type="button" 
                             disabled={isDeleting || confirmWord.trim().toUpperCase() !== 'APAGAR'}
                             onClick={handleConfirmDelete}
                             className="h-16 rounded-2xl bg-[#ff3d71] text-white font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-30"
                           >
                             {isDeleting ? 'Excluindo...' : 'Apagar tudo'}
                           </button>
                        </div>
                     </>
                  )}
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Dynamic Network Checker Modal */}
      <AnimatePresence>
         {isCheckingItems && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
               <div className="p-8 bg-[#0a1811] border border-primary/20 rounded-[2rem] flex flex-col items-center gap-4 text-center">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Calculando total de itens...</p>
               </div>
            </div>
         )}
      </AnimatePresence>

      {/* Toast alert indicator */}
      <AnimatePresence>
         {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-6 right-6 z-[120] p-4 rounded-[1.5rem] shadow-2xl flex items-center gap-3 border ${
                toast.type === 'error' ? 'bg-[#180a0a] border-[#ff3d71]/30 text-rose-400' : 'bg-[#0a1811] border-primary/30 text-emerald-400'
              }`}
            >
               <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                 toast.type === 'error' ? 'bg-[#ff3d71]/10 text-[#ff3d71]' : 'bg-primary/10 text-primary'
               }`}>
                  <Sparkles size={18} />
               </div>
               <div>
                  <h5 className="text-[10px] font-black uppercase tracking-wider">{toast.type === 'error' ? 'Erro' : 'Sucesso'}</h5>
                  <p className="text-[11px] font-bold text-slate-300">{toast.message}</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon, color = "text-white" }: any) => (
  <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-3">
     <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
        {icon}
        <span>{label}</span>
     </div>
     <p className={`text-2xl font-black italic uppercase tracking-tighter leading-none ${color}`}>{value}</p>
  </div>
);

export default Mneme;
