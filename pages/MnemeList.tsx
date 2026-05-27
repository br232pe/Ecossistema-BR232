import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Menu, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Settings,
  Users,
  BrainCircuit, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Sparkles, 
  Loader2, 
  Calendar, 
  RefreshCcw,
  Search,
  DollarSign,
  Barcode,
  TrendingUp
} from 'lucide-react';
import { mnemeService } from '../src/services/mnemeService';
import { calendarService } from '../src/services/calendarService';
import { BarcodeScannerModal } from '../src/components/BarcodeScannerModal';
import { MnemeList as MnemeListType, MnemeItem } from '../src/types';
import { MNEME_CATALOG, CatalogItem, getCategoryIcon } from '../src/constants/mnemeCatalog';
import { useAuth } from '../src/contexts/AuthContext'; 
import { db } from '../src/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { TIER_CATEGORIES } from '../src/constants/Categories';
import { seedCatalog } from '../src/constants/SeedCatalog';

const PRESET_WEIGHTS = [
  "1 un", "2 un", "3 un", "4 un", "5 un", "6 un", "10 un", "100g", "200g", "250g", "500g", "1kg", "2kg", "5kg", "200ml", "350ml", "500ml", "1L", "1.5L", "2L"
];

const normalizePrice = (value: string): number => {
  if (!value) return 0;
  const replaced = value.replace(',', '.');
  const parsed = parseFloat(replaced);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper robusto para obter timestamp numérico, evitando NaNs oriundos do cache local com serverTimestamp()
const safeGetTimeLocal = (timestamp: any): number => {
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

const formatHistoryDate = (dateVal: any): string => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    if (dateVal.includes('/') && dateVal.length <= 10) return dateVal;
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    } catch (e) {}
    return dateVal.substring(0, 10);
  }
  if (dateVal.toMillis && typeof dateVal.toMillis === 'function') {
    return new Date(dateVal.toMillis()).toLocaleDateString('pt-BR');
  }
  if (dateVal.seconds) {
    return new Date(dateVal.seconds * 1000).toLocaleDateString('pt-BR');
  }
  if (dateVal instanceof Date) {
    return dateVal.toLocaleDateString('pt-BR');
  }
  return String(dateVal);
};

const MnemeList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listTopRef = React.useRef<HTMLDivElement>(null);
  const { user, accessToken, loginWithGoogle } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [list, setList] = useState<MnemeListType | null>(null);
  const [items, setItems] = useState<MnemeItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(TIER_CATEGORIES[0]);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [travelPlans, setTravelPlans] = useState<any[]>([]);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Catalog State
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogResults, setCatalogResults] = useState<CatalogItem[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);

  // Completion State
  const [itemToComplete, setItemToComplete] = useState<MnemeItem | null>(null);
  const [completionPrice, setCompletionPrice] = useState('');
  const [completionLocation, setCompletionLocation] = useState('');

  // Editing State
  const [editingItem, setEditingItem] = useState<MnemeItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCategory, setEditCategory] = useState<string>(TIER_CATEGORIES[0]);
  const [editPrice, setEditPrice] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Quick Add State for Brand & Weight/Qty
  const [selectedBrand, setSelectedBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [showCustomBrandInput, setShowCustomBrandInput] = useState(false);

  const [selectedWeight, setSelectedWeight] = useState('1 un');
  const [customWeight, setCustomWeight] = useState('');
  const [showCustomWeightInput, setShowCustomWeightInput] = useState(false);
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');

  // Edit State for Brand & Weight
  const [editBrand, setEditBrand] = useState('');
  const [editCustomBrand, setEditCustomBrand] = useState('');
  const [showEditCustomBrand, setShowEditCustomBrand] = useState(false);

  const [editWeight, setEditWeight] = useState('');
  const [editCustomWeight, setEditCustomWeight] = useState('');
  const [showEditCustomWeight, setShowEditCustomWeight] = useState(false);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!id || !user) return;

    // Carregar Metadados da Lista
    const fetchList = async () => {
      // 1. Tentar primeiro obter do backup local instantaneamente para evitar tela de loading ou travar no mobile
      const cachedList = mnemeService.getLocalList(user.uid, id);
      if (cachedList) {
        setList(cachedList);
      }

      if (id.startsWith('temp_') || id.startsWith('local_')) {
        if (!cachedList) {
          setList({
            id,
            name: 'Cesta do Lar',
            ownerId: user.uid,
            authorizedUsers: [user.uid],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        return;
      }

      try {
        const docRef = doc(db, 'mneme_lists', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const listData = { id: snap.id, ...snap.data() } as MnemeListType;
          setList(listData);
          
          // Auto-join with UID if joined by email
          if (user && listData.authorizedUsers.includes(user.email || '') && !listData.authorizedUsers.includes(user.uid)) {
            await mnemeService.addAuthorizedUser(id, user.uid);
          }
        } else if (!cachedList) {
          setList({
            id,
            name: 'Cesta do Lar',
            ownerId: user.uid,
            authorizedUsers: [user.uid],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (err) {
        console.warn("Erro sutil ao carregar dados da lista do firestore:", err);
        if (!cachedList) {
          setList({
            id,
            name: 'Cesta do Lar (Offline)',
            ownerId: user.uid,
            authorizedUsers: [user.uid],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    };
    fetchList();

    // Sincronização em tempo real dos itens
    const unsubscribe = mnemeService.subscribeToItems(id, (updatedItems: MnemeItem[]) => {
      setItems(updatedItems);
      // Inicializar expansão de seções que tem itens
      const sectionsWithItems = [...new Set(updatedItems.map((i: MnemeItem) => i.category))];
      setExpandedSections(prev => {
        const next: Record<string, boolean> = { ...prev };
        sectionsWithItems.forEach((s: string) => {
           if (next[s] === undefined) next[s] = true;
        });
        return next;
      });
    });

    return () => unsubscribe();
  }, [id, user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setCatalogResults([]);
      setShowCatalog(false);
      return;
    }

    const filtered = MNEME_CATALOG.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
    
    setCatalogResults(filtered);
    setShowCatalog(true);
  }, [searchQuery]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !id || !user) return;

    const brand = showCustomBrandInput ? customBrand : selectedBrand;
    const finalWeight = showCustomWeightInput ? customWeight : selectedWeight;
    const priceValue = normalizePrice(newItemPrice);
    const qtyNum = Math.max(1, Math.floor(parseInt(newItemQuantity, 10) || 1));
    const nameToSubmit = newItemName.trim();
    const categoryToSubmit = selectedCategory;

    // Reset de estado síncrono e imediato (sem aguardar o banco de dados) para melhor UX
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQuantity('1');
    setCustomBrand('');
    setSelectedBrand('');
    setShowCustomBrandInput(false);
    setCustomWeight('');
    setSelectedWeight('1 un');
    setShowCustomWeightInput(false);
    setSearchQuery('');
    setShowCatalog(false);

    try {
      await mnemeService.addItem(id, user.uid, {
        name: nameToSubmit,
        category: categoryToSubmit,
        quantity: qtyNum,
        brand: brand || '',
        weightVolume: finalWeight || '1 un',
        price: priceValue
      });
      setShowToast(true);
      setTimeout(() => {
        listTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    } catch (err) {
      console.error("Erro ao adicionar produto:", err);
    }
  };

  const addCatalogItem = async (catalogItem: CatalogItem) => {
    if (!id || !user) return;

    // Limpeza síncrona imediata da busca de catálogo
    setSearchQuery('');
    setNewItemName('');
    setShowCatalog(false);

    try {
      await mnemeService.addItem(id, user.uid, {
        name: catalogItem.name,
        category: catalogItem.category,
        quantity: 1, // units, number
        weightVolume: catalogItem.defaultUnit || '1 un',
        vibe: catalogItem.classification
      });
      setShowToast(true);
      setTimeout(() => {
        listTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    } catch (err) {
      console.error("Erro ao adicionar item do catálogo:", err);
    }
  };

  const handleBarcodeItemAdded = async (item: {
    name: string;
    category: string;
    quantity: number;
    brand: string;
    weightVolume: string;
  }) => {
    if (!id || !user) return;
    try {
      await mnemeService.addItem(id, user.uid, {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        brand: item.brand || '',
        weightVolume: item.weightVolume || '1 un'
      });
      setShowToast(true);
      setTimeout(() => {
        listTopRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    } catch (err) {
      console.error("Erro ao adicionar produto via gôndola/barcode:", err);
    }
  };

  const handleToggleItem = async (item: MnemeItem) => {
    if (item.isCompleted) {
      // Se já está completo, apenas desmarcar
      await mnemeService.toggleItem(id!, item.id, false);
    } else {
      // Se vai completar, abrir modal de preço
      setItemToComplete(item);
      setCompletionPrice(item.price !== undefined && item.price > 0 ? String(item.price).replace('.', ',') : '');
      setCompletionLocation(list?.supermarketName || '');
    }
  };

  const confirmCompletion = async () => {
    if (!itemToComplete || !id) return;
    const finalPrice = normalizePrice(completionPrice);
    const finalLoc = completionLocation || list?.supermarketName || 'Mercado';
    
    await mnemeService.updateItem(itemToComplete.id, {
      isCompleted: true,
      price: finalPrice,
      location: finalLoc
    } as any);
    setItemToComplete(null);
    setCompletionLocation('');
  };

  const startEditing = (item: MnemeItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category || TIER_CATEGORIES[0]);
    setEditPrice(item.price !== undefined && item.price > 0 ? String(item.price).replace('.', ',') : '');
    setEditLocation(item.location || list?.supermarketName || 'Mercado');
    setEditQuantity(item.quantity !== undefined ? String(item.quantity) : '1');
    setSaveError(null);
    setIsSavingEdit(false);
    
    // Brand Config
    if (item.brand) {
      if (dynamicBrands.includes(item.brand)) {
        setEditBrand(item.brand);
        setShowEditCustomBrand(false);
      } else {
        setEditBrand("CUSTOM");
        setEditCustomBrand(item.brand);
        setShowEditCustomBrand(true);
      }
    } else {
      setEditBrand('');
      setShowEditCustomBrand(false);
    }

    // Weight/Quantity Config
    const w = item.weightVolume || '1 un';
    if (PRESET_WEIGHTS.includes(w)) {
      setEditWeight(w);
      setShowEditCustomWeight(false);
    } else {
      setEditWeight("CUSTOM");
      setEditCustomWeight(w);
      setShowEditCustomWeight(true);
    }
  };

  const saveEdit = async () => {
    if (!editingItem || isSavingEdit) return;
    setIsSavingEdit(true);
    setSaveError(null);

    const finalBrand = showEditCustomBrand ? editCustomBrand : editBrand;
    const finalWeight = showEditCustomWeight ? editCustomWeight : editWeight;
    const priceValue = normalizePrice(editPrice);
    const finalLoc = editLocation || list?.supermarketName || 'Mercado';
    const qtyNum = Math.max(1, Math.floor(parseInt(editQuantity, 10) || 1));

    const updateObj: any = {
      name: editName,
      quantity: qtyNum,
      brand: finalBrand || '',
      weightVolume: finalWeight || '1 un',
      category: editCategory,
      price: priceValue,
      location: finalLoc // <--- GARANTIR QUE ISTO SEJA ENVIADO
    };

    const itemIdToUpdate = editingItem.id;

    // BLOQUEIO E RAIO-X DE REFERÊNCIAS
    const targetId = itemIdToUpdate;
    const targetCollection = 'mneme_items';
    const payload = updateObj;

    console.warn('--- RAIO-X SALVAMENTO ---');
    console.warn('ID do Documento Alvo:', targetId);
    console.warn('Coleção Alvo:', targetCollection);
    console.warn('Payload a ser enviado:', payload);

    if (!targetId || targetId.startsWith('temp_') || targetId.startsWith('local_')) {
      setIsSavingEdit(false);
      setSaveError('ID Inválido ou Perdido (Produto temporário ou offline)');
      throw new Error('ID Inválido ou Perdido');
    }

    try {
      // 1. Gravar com await updateDoc (envolto no updateItem)
      await mnemeService.updateItem(itemIdToUpdate, updateObj);

      // 2. Correção de Imutabilidade (React 18 mapping)
      const editedProduct = {
        ...editingItem,
        ...updateObj,
        location: finalLoc
      };
      const updatedProducts = items.map(p => p.id === editedProduct.id ? editedProduct : p);
      setItems(updatedProducts);

      // Reset síncrono e fechamento apenas em caso de sucesso
      setEditingItem(null);
      setEditPrice('');
      setEditLocation('');
      setEditName('');
    } catch (err: any) {
      console.error('Falha FATAL no Firebase. Código:', err.code, 'Mensagem:', err.message);
      console.error("Erro ao atualizar produto editado no Firestore:", err);
      setSaveError(err instanceof Error ? err.message : "Erro interno ao salvar as alterações do produto no servidor.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const finalizePurchase = async () => {
    if (!id) return;
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    if (confirm(`Deseja finalizar esta compra e arquivar a lista? Total registrado: R$ ${total.toFixed(2)}`)) {
      await mnemeService.archiveList(id, total);
      navigate('/mneme');
    }
  };

  const [showGoldPlanToast, setShowGoldPlanToast] = useState(false);

  const syncCalendar = async () => {
    setShowGoldPlanToast(true);
    setTimeout(() => {
      setShowGoldPlanToast(false);
    }, 4000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !id) return;
    await mnemeService.grantAccess(id, inviteEmail);
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  const runAiAnalysis = async () => {
    setShowGoldPlanToast(true);
    setTimeout(() => {
      setShowGoldPlanToast(false);
    }, 4000);
  };

  // Marcas Dinâmicas derivadas da fusão do catálogo semente com os itens salvos localmente
  const dynamicBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    
    // 1. Extração de marcas nativas do seedCatalog
    if (seedCatalog) {
      Object.values(seedCatalog).forEach(item => {
        if (item && item.brand) {
          brandsSet.add(item.brand);
        }
      });
    }
    
    // 2. Extração de marcas personalizadas salvas na lista do sujeito
    items.forEach(item => {
      if (item && item.brand) {
        brandsSet.add(item.brand);
      }
    });
    
    return Array.from(brandsSet).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const tA = safeGetTimeLocal(a.createdAt);
      const tB = safeGetTimeLocal(b.createdAt);
      return tB - tA;
    });
  }, [items]);

  const groupedItems = useMemo(() => {
    return TIER_CATEGORIES.reduce((acc, section) => {
      const sectionItems = sortedItems.filter(i => i.category === section);
      if (sectionItems.length > 0) acc[section] = sectionItems;
      return acc;
    }, {} as Record<string, MnemeItem[]>);
  }, [sortedItems]);

  const volumeTotal = useMemo(() => {
    return items.length;
  }, [items]);

  const somaAcumulada = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.price || 0), 0);
  }, [items]);

  if (!list) return <div className="min-h-screen bg-[#05100a] flex items-center justify-center">Carregando Lista de Compras...</div>;

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-40">
      {/* Header Contextual (Responsive) */}
      <header className="px-6 py-10 sm:py-16 space-y-8 relative overflow-hidden flex-shrink-0 z-10">
         <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50" />
         
         <div className="flex items-center justify-between max-w-6xl mx-auto relative z-20">
            <div className="flex items-center gap-4 sm:gap-6">
               <button 
                 onClick={() => navigate('/mneme')}
                 className="size-12 sm:size-16 rounded-2xl sm:rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all"
               >
                  <ArrowLeft size={24} />
               </button>
               <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-3xl sm:text-5xl font-black italic uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">{list?.name || 'Carregando...'}</h1>
                  <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-bold uppercase italic text-slate-500 flex-wrap">
                     <MapPin size={12} className="text-primary" />
                     <span>{list?.supermarketName || 'Multimarcas Regional'}</span>
                     {!isOnline && (
                        <span className="ml-2 flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full text-[8px] font-black uppercase tracking-widest leading-none">
                           <span className="size-1 rounded-full bg-amber-500 animate-pulse" />
                           Rede Oscilante (Cache)
                        </span>
                     )}
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
               {/* Desktop Actions */}
               <div className="hidden sm:flex items-center gap-2">
                  {items.length > 0 && items.some(i => i.isCompleted) && (
                    <button 
                      onClick={finalizePurchase}
                      className="h-10 px-4 bg-primary text-black rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                    >
                       Finalizar Compra
                    </button>
                  )}
                  <button 
                    onClick={() => setIsInviteOpen(true)}
                    className="h-10 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all text-slate-300"
                  >
                     <Users size={14} className="text-primary" />
                     <span>Convidar</span>
                  </button>
               </div>

               <button 
                 onClick={() => setIsMenuOpen(!isMenuOpen)}
                 className="lg:hidden size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-95 transition-all"
               >
                 {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>

               <button 
                 className="hidden sm:flex size-14 sm:size-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-slate-400 hover:bg-white/10 transition-all"
               >
                  <Settings size={24} />
               </button>
            </div>
         </div>

          {/* PAINEL DE RESUMO CONTEXTUAL (SUB-HEADER) */}
          <div className="max-w-6xl mx-auto mt-6 relative z-20 grid grid-cols-3 gap-2 md:gap-4 p-4 bg-slate-950/50 backdrop-blur border border-white/5 rounded-2xl">
             <div className="flex flex-col justify-center px-1 md:px-4">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#ff751f]">Nome da Cesta</span>
                <span className="text-xs md:text-base font-bold text-white truncate">{list?.name}</span>
             </div>
             <div className="flex flex-col justify-center px-2 md:px-4 border-l border-white/5">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Volume Total</span>
                <span className="text-xs md:text-base font-black text-white">{volumeTotal} {volumeTotal === 1 ? 'item' : 'itens'}</span>
             </div>
             <div className="flex flex-col justify-center px-2 md:px-4 border-l border-white/5">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary">Soma Financeira</span>
                <span className="text-xs md:text-base font-black text-white">R$ {somaAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
             </div>
          </div>

         {/* Mobile Menu Overlay */}
         <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[100] bg-[#05100a] lg:hidden p-8 pt-24 space-y-8 flex flex-col items-center text-center overflow-y-auto font-sans focus:outline-none focus:ring-0"
              >
                 <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                    <X size={24} />
                 </button>
                 
                 <nav className="flex flex-col gap-6 w-full">
                    <button onClick={() => { navigate('/portal'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Portal BR232</button>
                    <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Central Cesta do Lar</button>
                    <button onClick={() => { navigate('/mneme/dashboard'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-[#ff751f]/10 border border-[#ff751f]/20 text-lg font-black uppercase tracking-[0.2em] italic text-[#ff751f]">Dashboard Cesta do Lar</button>
                    <button onClick={() => { navigate('/guia-servicos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Guia de Serviços</button>
                    <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-primary/10 border border-primary/20 text-lg font-black uppercase tracking-[0.2em] italic text-primary">Meu Painel</button>
                 </nav>
                 
                 <div className="w-full h-px bg-white/5" />
                 
                 <div className="flex flex-col gap-3 w-full pb-12">
                    <button onClick={() => { setIsInviteOpen(true); setIsMenuOpen(false); }} className="h-14 rounded-xl border border-primary/30 text-[10px] font-black uppercase text-primary tracking-widest flex items-center justify-center gap-2">
                       <Users size={16} /> Convidar Familiar
                    </button>
                    {items.length > 0 && items.some(i => i.isCompleted) && (
                       <button onClick={() => { finalizePurchase(); setIsMenuOpen(false); }} className="h-14 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-xl">
                          Finalizar Compra
                       </button>
                    )}
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </header>

      {/* Quick Add & Catalog Search */}
      <div className="px-6 -mt-6 relative z-50">
         <div className="p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                  <Search size={18} />
               </div>
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => searchQuery && setShowCatalog(true)}
                 placeholder="Buscar no Catálogo Regional..."
                 className="flex-1 bg-transparent border-none text-sm font-bold placeholder:text-slate-600 focus:ring-0"
               />
               
               {/* CAMADA INCREMENTAL: SCANNER DE GÔNDOLA POR CÓDIGO DE BARRAS */}
               <button
                 type="button"
                 onClick={() => setIsBarcodeOpen(true)}
                 className="px-3.5 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                 title="Escanear Código de Barras de Gôndola"
               >
                  <Barcode size={16} />
                  <span className="hidden sm:inline">Escanear</span>
               </button>
            </div>

            <AnimatePresence>
               {showCatalog && catalogResults.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="space-y-1 pt-2 border-t border-white/5"
                 >
                    {catalogResults.map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => addCatalogItem(item)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all group"
                      >
                         <div className="flex items-center gap-3">
                            <span className="text-lg">{getCategoryIcon(item.category)}</span>
                            <div className="text-left">
                               <p className="text-xs font-black uppercase tracking-tighter text-white">{item.name}</p>
                               <p className="text-[9px] font-bold text-slate-500 uppercase">{item.category} • {item.classification}</p>
                            </div>
                         </div>
                         <Plus size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                 </motion.div>
               )}
            </AnimatePresence>

            <form onSubmit={handleAddItem} className="space-y-4 pt-3 border-t border-white/5">
               <div className="flex gap-3">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/5 border-none text-[10px] font-black uppercase tracking-widest rounded-xl px-3 h-12 min-h-[48px] focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer text-white bg-[#030906] w-32 min-w-32"
                  >
                    {TIER_CATEGORIES.map(s => <option key={s} value={s} className="bg-[#05100a] text-white font-bold">{s}</option>)}
                  </select>
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Feijão, Arroz, Detergente..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:ring-1 focus:ring-primary placeholder:text-slate-600 focus:outline-none"
                  />
               </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Marca</label>
                     {showCustomBrandInput ? (
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Digitar marca..."
                            value={customBrand}
                            onChange={(e) => setCustomBrand(e.target.value)}
                            className="flex-1 h-10 px-3 bg-white/5 border border-primary/30 rounded-lg text-xs"
                          />
                          <button 
                            type="button" 
                            onClick={() => { setShowCustomBrandInput(false); setSelectedBrand(''); }}
                            className="px-2 bg-white/5 rounded-lg text-[9px] font-bold uppercase text-slate-400"
                          >
                             Lista
                          </button>
                       </div>
                     ) : (
                       <select 
                         value={selectedBrand}
                         onChange={(e) => {
                           if (e.target.value === "CUSTOM") {
                             setShowCustomBrandInput(true);
                           } else {
                             setSelectedBrand(e.target.value);
                           }
                         }}
                         className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#030906]"
                       >
                          <option value="" className="bg-[#05100a] text-slate-400">Sem marca / Genérico</option>
                          {dynamicBrands.map(b => <option key={b} value={b} className="bg-[#05100a] text-white">{b}</option>)}
                          <option value="CUSTOM" className="bg-[#05100a] text-primary font-bold">+ Nova...</option>
                       </select>
                     )}
                  </div>

                  <div className="space-y-1">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Peso / Quantidade</label>
                     {showCustomWeightInput ? (
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="ex: 800g"
                            value={customWeight}
                            onChange={(e) => setCustomWeight(e.target.value)}
                            className="flex-1 h-10 px-3 bg-white/5 border border-primary/30 rounded-lg text-xs"
                          />
                          <button 
                            type="button" 
                            onClick={() => { setShowCustomWeightInput(false); setSelectedWeight('1 un'); }}
                            className="px-2 bg-white/5 rounded-lg text-[9px] font-bold uppercase text-slate-400"
                          >
                             Lista
                          </button>
                       </div>
                     ) : (
                       <select 
                         value={selectedWeight}
                         onChange={(e) => {
                           if (e.target.value === "CUSTOM") {
                             setShowCustomWeightInput(true);
                           } else {
                             setSelectedWeight(e.target.value);
                           }
                         }}
                         className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#030906]"
                       >
                          {PRESET_WEIGHTS.map(w => <option key={w} value={w} className="bg-[#05100a] text-white">{w}</option>)}
                          <option value="CUSTOM" className="bg-[#05100a] text-primary font-bold">+ Outro...</option>
                       </select>
                     )}
                  </div>

                  <div className="space-y-1">
                     <>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Quantidade</label>
                           <input 
                             type="number" 
                             min="1"
                             step="1"
                             value={newItemQuantity}
                             onChange={(e) => {
                               const v = e.target.value;
                               const parsed = parseInt(v, 10);
                               if (v === '' || (!isNaN(parsed) && parsed > 0)) {
                                 setNewItemQuantity(v);
                               }
                             }}
                             className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#030906] focus:outline-none focus:border-primary font-bold"
                             required
                           />
                        </div>
                        <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Preço Unitário (R$)</label>
                     </>
                     <input 
                       type="text" 
                       inputMode="decimal"
                       placeholder="0,00"
                       value={newItemPrice}
                       onChange={(e) => setNewItemPrice(e.target.value)}
                       className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white bg-[#030906] focus:outline-none focus:border-primary"
                     />
                  </div>
               </div>

               <button type="submit" className="w-full h-11 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                  <Plus size={16} /> Adicionar na Lista
               </button>

               <AnimatePresence>
                  {showToast && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 overflow-hidden"
                    >
                       <CheckCircle2 size={12} className="text-emerald-400" />
                       <span>Produto Adicionado com Sucesso</span>
                    </motion.div>
                  )}
               </AnimatePresence>
            </form>
         </div>
      </div>

      <main className="px-6 mt-12 space-y-8" ref={listTopRef}>

         {/* List Content Grouped by Section */}
         <div className="space-y-6">
            {Object.keys(groupedItems).length === 0 && (
              <div className="text-center py-20 space-y-4">
                 <Sparkles size={40} className="mx-auto text-slate-800" />
                 <p className="text-slate-600 text-sm italic font-medium uppercase tracking-widest">A lista está limpa.</p>
              </div>
            )}

            {Object.entries(groupedItems).map(([section, sectionItems]) => (
              <div key={section} className="space-y-4">
                 <button 
                   onClick={() => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))}
                   className="w-full flex items-center justify-between py-2 border-b border-white/5"
                 >
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{section}</span>
                       <span className="text-[9px] px-2 py-0.5 bg-white/5 rounded-full font-bold text-slate-500">{sectionItems.length}</span>
                    </div>
                    {expandedSections[section] ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                 </button>

                 <AnimatePresence>
                    {expandedSections[section] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-2"
                      >
                         {sectionItems.map(item => (
                           <div 
                             key={item.id}
                             className={`rounded-2xl border transition-all flex flex-col overflow-hidden ${item.isCompleted ? 'bg-white/[0.02] border-transparent opacity-50' : 'bg-white/5 border-white/5 hover:border-primary/30'}`}
                           >
                              <div className="p-4 flex items-center justify-between group">
                              <div className="flex items-center gap-4 flex-1">
                                 <button 
                                    onClick={() => handleToggleItem(item)}
                                    className="size-12 min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95 shrink-0"
                                  >
                                     <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${item.isCompleted ? 'bg-primary border-primary text-black' : 'border-white/20 hover:border-primary'}`}>
                                        {item.isCompleted && <CheckCircle2 size={14} strokeWidth={3} />}
                                     </div>
                                  </button>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                       <span className={`text-sm font-bold italic uppercase transition-all ${item.isCompleted ? 'line-through text-slate-600' : 'text-white'}`}>{item.name}</span>
                                       {item.brand && (
                                         <span className="text-[9px] font-black text-amber-500 px-2 py-0.5 bg-amber-500/15 rounded uppercase tracking-wider">{item.brand}</span>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                       <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                          <Tag size={10} className="text-slate-500" />
                                          <span>{item.quantity ? `${item.quantity}x ` : ''}{item.weightVolume || '1 un'} {item.vibe ? `• ${item.vibe}` : ''}</span>
                                       </div>
                                       {item.price !== undefined && Number(item.price) > 0 && (
                                         <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded uppercase tracking-wider">
                                            R$ {Number(item.price).toFixed(2).replace('.', ',')}
                                         </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 {item.price !== undefined && Number(item.price) > 0 && (
                                   <div className="text-right hidden sm:block">
                                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Valor Unitário</p>
                                      <p className="text-xs font-black text-primary">R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
                                   </div>
                                 )}
                                 <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => startEditing(item)}
                                      className="size-12 min-h-[48px] min-w-[48px] rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
                                    >
                                       <Settings size={16} />
                                    </button>
                                     {item.priceHistory && item.priceHistory.length > 0 && (
                                        <button 
                                          onClick={() => setExpandedHistory(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                          className={`size-12 min-h-[48px] min-w-[48px] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center ${expandedHistory[item.id] ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                                          title="Histórico de Preços (Price Ledger)"
                                        >
                                           <TrendingUp size={16} />
                                        </button>
                                     )}
                                    <button 
                                      onClick={() => mnemeService.deleteItem(item.id)}
                                      className="size-12 min-h-[48px] min-w-[48px] rounded-xl hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-all flex items-center justify-center"
                                    >
                                       <Trash2 size={18} />
                                    </button>
                                 </div>
                              </div>
                           </div>

                           <AnimatePresence>
                              {expandedHistory[item.id] && item.priceHistory && item.priceHistory.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-white/5 bg-[#010302]/80 px-6 py-4 space-y-2 text-xs text-slate-400 font-sans"
                                >
                                   <div className="text-[9px] font-black uppercase text-primary tracking-widest mb-1.5 flex items-center gap-1.5">
                                      <TrendingUp size={12} /> Price Ledger (Histórico de Preços)
                                   </div>
                                   <div className="flex flex-wrap gap-x-4 gap-y-2">
                                      {item.priceHistory.map((hist, hIdx) => (
                                         <div key={hIdx} className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                            <span className="font-mono text-slate-500 font-medium text-[10px]">{formatHistoryDate(hist.date)}</span>
                                            <span className="font-extrabold text-white text-[11px]">R$ {Number(hist.price).toFixed(2).replace('.', ',')}</span>
                                            {hist.location && (
                                               <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 truncate max-w-[100px]">{hist.location}</span>
                                            )}
                                         </div>
                                      ))}
                                   </div>
                                </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                         ))}
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
            ))}
         </div>
        
        {/* IA Analysis Trigger */}
        <div className="space-y-6">
           {/* Widget de Sincronia de Agenda */}
           <div className="px-6 py-4 bg-[#ff751f]/10 border border-[#ff751f]/20 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-xl bg-[#ff751f]/20 flex items-center justify-center text-[#ff751f]">
                    <Calendar size={20} />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ff751f]">Sincronia de Agenda</h4>
                    <p className="text-[11px] font-bold italic text-slate-400">
                       {travelPlans.length > 0 
                         ? `${travelPlans.length} viagens detectadas na 232` 
                         : 'Sincronize suas viagens para arbitrar preços'
                       }
                    </p>
                 </div>
              </div>
              <button 
                onClick={syncCalendar}
                disabled={isSyncingCalendar}
                className="size-10 rounded-full bg-[#ff751f] text-black flex items-center justify-center hover:rotate-180 transition-all duration-500"
              >
                 {isSyncingCalendar ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
              </button>
           </div>

           <div className="p-1 rounded-[2rem] bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 shadow-2xl">
           <div className="p-6 bg-[#05100a] rounded-[1.9rem] border border-white/5 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       <BrainCircuit size={20} />
                    </div>
                    <div>
                       <h4 className="text-sm font-black italic uppercase italic tracking-widest text-primary">Análise Cesta do Lar</h4>
                       <p className="text-[10px] text-slate-500 font-medium italic">Inteligência Nutricional & Regional</p>
                    </div>
                 </div>
                 <button 
                  onClick={runAiAnalysis}

                  className="px-6 py-2 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                 >
                    Analisar Lista
                 </button>
              </div>

              {aiAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-invert prose-sm max-w-none p-4 bg-white/5 rounded-2xl border border-white/5 italic font-medium text-slate-300"
                >
                   {aiAnalysis}
                </motion.div>
              )}
           </div>
        </div>
     </div>

        {/* Widget "Sua Cidade, Seu Radar" - Refinement for Resident */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Oportunidades em {list.supermarketName?.split(' ')[0] || 'Gravatá'}</h3>
              <div className="flex items-center gap-2 text-primary font-black uppercase text-[8px] tracking-widest">
                 <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                 Radar Ativo
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-5 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative overflow-hidden group cursor-pointer"
              >
                 <div className="absolute top-0 right-0 p-4 text-white/5 -mr-2 -mt-2">
                    <Tag size={40} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Oferta Patrona</p>
                    <h5 className="text-sm font-black italic uppercase leading-none">Picanha Maturatta</h5>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-primary font-black italic">R$ 59,90</span>
                    <div className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded-md">KM 84</div>
                 </div>
                 <button className="w-full h-10 bg-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-black transition-all">Ver na Feira</button>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="p-5 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative overflow-hidden group cursor-pointer"
              >
                 <div className="absolute top-0 right-0 p-4 text-white/5 -mr-2 -mt-2">
                    <Sparkles size={40} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Em Classificados</p>
                    <h5 className="text-sm font-black italic uppercase leading-none">Freezer Vertical</h5>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-primary font-black italic">R$ 1.200</span>
                    <div className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded-md">KM 82</div>
                 </div>
                  <button className="w-full h-10 bg-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-black transition-all">Ver Detalhes</button>
               </motion.div>
            </div>
         </div>
      </main>



      {/* Toast de Funcionalidade Exclusiva Plano Ouro */}
      <AnimatePresence>
         {showGoldPlanToast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-80 z-[110] p-4 bg-[#0a1811] border border-amber-500/30 rounded-[1.5rem] shadow-2xl flex items-center gap-3"
            >
               <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                  <Sparkles size={18} />
               </div>
               <div>
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-500">Plano Ouro</h5>
                  <p className="text-[11px] font-bold text-slate-300">Funcionalidade exclusiva do Plano Ouro (Em breve).</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Manual Price Entry Modal */}
      <AnimatePresence>
         {itemToComplete && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setItemToComplete(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              style={{ willChange: "transform, opacity" }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0a1811] border border-primary/30 p-8 rounded-[2.5rem] shadow-4xl text-center space-y-6" style={{ willChange: "transform, opacity" }}
              >
                 <div className="space-y-4">
                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                       <DollarSign size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black italic uppercase tracking-tighter">Preço na Prateleira</h3>
                       <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Informar preço de {itemToComplete.name}</p>
                    </div>
                    
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">R$</span>
                       <input 
                         autoFocus
                         type="text" 
                         inputMode="decimal"
                         value={completionPrice}
                         onChange={(e) => setCompletionPrice(e.target.value)}
                         placeholder="0,00"
                         className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-2xl font-black text-white focus:outline-none focus:border-primary"
                       />
                    </div>

                    <div className="space-y-1 text-left">
                       <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Local da Compra (Supermercado)</label>
                       <input 
                         type="text" 
                         value={completionLocation}
                         onChange={(e) => setCompletionLocation(e.target.value)}
                         placeholder={list?.supermarketName || "Nome do estabelecimento..."}
                         className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => setItemToComplete(null)}
                         className="h-14 bg-white/5 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                       >
                          Pular
                       </button>
                       <button 
                         onClick={confirmCompletion}
                         className="h-14 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
                       >
                          Confirmar
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
         {editingItem && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !isSavingEdit && setEditingItem(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              style={{ willChange: "transform, opacity" }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0a1811] border border-white/10 p-8 rounded-[2.5rem] shadow-4xl text-center space-y-6" style={{ willChange: "transform, opacity" }}
              >
                 <div className="space-y-4">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Editar Item</h3>
                    
                    <div className="space-y-4 text-left">
                       <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-2">Nome</label>
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:border-primary"
                          />
                       </div>
                       
                       <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Categoria</label>
                                <select 
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value)}
                                  className="w-full h-11 px-3 bg-[#030906] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary appearance-none cursor-pointer text-white"
                                >
                                   {TIER_CATEGORIES.map(s => <option key={s} value={s} className="bg-[#05100a] text-white font-bold">{s}</option>)}
                                </select>
                             </div>

                             <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Peso / Qtd</label>
                                {showEditCustomWeight ? (
                                  <div className="flex gap-1.5 align-middle">
                                     <input 
                                       type="text" 
                                       placeholder="ex: 800g"
                                       value={editCustomWeight}
                                       onChange={(e) => setEditCustomWeight(e.target.value)}
                                       className="flex-1 h-11 px-3 bg-white/5 border border-primary/40 rounded-xl text-xs text-white focus:outline-none"
                                     />
                                     <button 
                                       type="button" 
                                       onClick={() => { setShowEditCustomWeight(false); setEditWeight(PRESET_WEIGHTS[0]); }}
                                       className="px-2 bg-white/5 rounded-xl text-[8px] uppercase font-bold text-slate-400"
                                     >
                                        Lista
                                     </button>
                                  </div>
                                ) : (
                                  <select 
                                    value={editWeight}
                                    onChange={(e) => {
                                      if (e.target.value === "CUSTOM") {
                                        setShowEditCustomWeight(true);
                                      } else {
                                        setEditWeight(e.target.value);
                                      }
                                    }}
                                    className="w-full h-11 px-3 bg-[#030906] border border-white/10 rounded-xl text-[10px] font-bold text-white cursor-pointer"
                                  >
                                     {PRESET_WEIGHTS.map(w => <option key={w} value={w} className="bg-[#05100a] text-white">{w}</option>)}
                                     <option value="CUSTOM" className="bg-[#05100a] text-primary font-bold">+ Outro...</option>
                                  </select>
                                )}
                             </div>
                          </div>

                          <div className="space-y-1">
                             <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Marca</label>
                             {showEditCustomBrand ? (
                               <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Digitar marca..."
                                    value={editCustomBrand}
                                    onChange={(e) => setEditCustomBrand(e.target.value)}
                                    className="flex-1 h-11 px-4 bg-white/5 border border-primary/40 rounded-xl text-xs text-white focus:outline-none"
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => { setShowEditCustomBrand(false); setEditBrand(''); }}
                                    className="px-3 bg-white/5 rounded-xl text-[9px] font-bold text-slate-400 uppercase"
                                  >
                                     Lista
                                  </button>
                               </div>
                             ) : (
                               <select 
                                 value={editBrand}
                                 onChange={(e) => {
                                   if (e.target.value === "CUSTOM") {
                                     setShowEditCustomBrand(true);
                                   } else {
                                     setEditBrand(e.target.value);
                                   }
                                 }}
                                 className="w-full h-11 px-4 bg-[#030906] border border-white/10 rounded-xl text-xs text-white cursor-pointer"
                               >
                                  <option value="" className="bg-[#05100a] text-slate-400">Sem marca / Genérico</option>
                                  {dynamicBrands.map(b => <option key={b} value={b} className="bg-[#05100a] text-white">{b}</option>)}
                                  <option value="CUSTOM" className="bg-[#05100a] text-primary font-bold">+ Adicionar outra...</option>
                               </select>
                             )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <>
                                  <div className="col-span-2 space-y-1">
                                    <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Quantidade</label>
                                    <input 
                                      type="number" 
                                      min="1"
                                      step="1"
                                      value={editQuantity}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        const parsed = parseInt(v, 10);
                                        if (v === '' || (!isNaN(parsed) && parsed > 0)) {
                                          setEditQuantity(v);
                                        }
                                      }}
                                      className="w-full h-11 px-3 bg-[#030906] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary font-bold mb-2"
                                      required
                                    />
                                  </div>
                                  <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Preço Unitário (R$)</label>
                                </>
                                <input 
                                  type="text" 
                                  inputMode="decimal"
                                  placeholder="0,00"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                                />
                             </div>

                             <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Local da Compra</label>
                                <input 
                                  type="text" 
                                  placeholder={list?.supermarketName || "Nome do local..."}
                                  value={editLocation}
                                  onChange={(e) => setEditLocation(e.target.value)}
                                  className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    {saveError && (
                       <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl text-center">
                          {saveError}
                       </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-4">
                       <button 
                         onClick={() => setEditingItem(null)}
                         disabled={isSavingEdit}
                         className="h-14 bg-white/5 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50"
                       >
                          Voltar
                       </button>
                       <button 
                         onClick={saveEdit}
                         disabled={isSavingEdit}
                         className="h-14 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-1 disabled:opacity-50"
                       >
                          {isSavingEdit ? 'Salvando...' : 'Salvar'}
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
         {isInviteOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsInviteOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              style={{ willChange: "transform, opacity" }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-sm bg-[#0a1811] border border-white/10 p-8 rounded-[2.5rem] shadow-3xl text-center space-y-6" style={{ willChange: "transform, opacity" }}
              >
                <div className="space-y-4">
                   <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">Convidar Familiar.</h3>
                   <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Sincronia familiar via ECOBR232</p>
                   
                   <form onSubmit={handleInvite} className="space-y-4">
                      <input 
                        type="email" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="E-mail do marido/esposa..."
                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-primary/50"
                      />
                      <button className="w-full h-14 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                         Enviar Convite
                      </button>
                   </form>
                </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Scanner de Gôndola por Código de Barras (LTS Incremental) */}
      <BarcodeScannerModal 
         isOpen={isBarcodeOpen} 
         onClose={() => setIsBarcodeOpen(false)} 
         onItemAdded={handleBarcodeItemAdded}
      />
    </div>
  );
};



export default MnemeList;
