
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { MnemeList, MnemeTier } from '../types';
import { Plus, ShoppingCart, ChefHat, ArrowLeft, ScanBarcode, Crown, Trash2 } from 'lucide-react';

const Mneme: React.FC = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<MnemeList[]>([]);
  const [userTier, setUserTier] = useState<MnemeTier>(MnemeTier.FREE); // Mock tier
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    const data = await db.mneme.getLists();
    setLists(data);
  };

  const createNewList = async () => {
    setErrorMsg(null);
    if (userTier === MnemeTier.FREE && lists.length >= 1) {
      setErrorMsg("No plano FREE você só pode ter 1 lista ativa. Faça upgrade para ter listas ilimitadas!");
      return;
    }
    const newList = await db.mneme.createList(`Lista ${lists.length + 1}`);
    navigate(`/mneme/lista/${newList.id}`);
  };

  const deleteList = async (id: string) => {
    setErrorMsg(null);
    try {
      await db.mneme.deleteList(id);
      setLists(prev => prev.filter(l => l.id !== id));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Erro ao deletar lista:", error);
      setErrorMsg("Erro ao excluir lista. Tente novamente.");
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-slate-900 font-display pb-32">
      {/* High Contrast Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-none flex items-center gap-2">
              Mnēmē <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-normal">Beta</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase">Gestão Doméstica</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setUserTier(userTier === MnemeTier.GOLD ? MnemeTier.FREE : MnemeTier.GOLD)}
             className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${userTier === MnemeTier.GOLD ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
           >
             <Crown size={12} /> {userTier}
           </button>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase text-center animate-in fade-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}
        
        {/* Banner Consultor IA */}
        <div 
          onClick={() => navigate('/mneme/mercado')}
          className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl cursor-pointer active:scale-95 transition-all group"
        >
           <div className="absolute right-0 top-0 p-6 text-white/5 group-hover:scale-110 transition-transform duration-700">
              <ChefHat size={120} />
           </div>
           <div className="relative z-10 space-y-2">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-black mb-2 shadow-[0_0_20px_rgba(0,230,118,0.4)]">
                 <ScanBarcode size={24} />
              </div>
              <h2 className="text-2xl font-black italic uppercase leading-none">Consultor<br/>de Gôndola</h2>
              <p className="text-xs text-slate-400 font-medium max-w-[70%]">Use a IA para criar listas baseadas em receitas, eventos ou orçamento.</p>
           </div>
        </div>

        {/* Listas Ativas */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Minhas Listas</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lists.length} Ativa(s)</span>
           </div>

           {lists.length === 0 ? (
             <div className="py-12 text-center opacity-40">
                <ShoppingCart size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-sm font-bold uppercase text-slate-500">Nenhuma lista criada</p>
             </div>
           ) : (
             lists.map(list => (
               <div key={list.id} onClick={() => navigate(`/mneme/lista/${list.id}`)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                     <div className="size-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center font-black text-lg">
                        {list.items.filter(i => !i.checked).length}
                     </div>
                     <div>
                        <h4 className="font-black text-lg text-slate-900 leading-tight">{list.title}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{list.items.length} Itens • R$ {list.totalEstimated?.toFixed(2)} Est.</p>
                     </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(list.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
               </div>
             ))
           )}

           {/* Modal de Confirmação de Exclusão */}
           {confirmDeleteId && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-xs rounded-[2rem] p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                 <div className="size-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                   <Trash2 size={32} />
                 </div>
                 <div>
                   <h3 className="text-lg font-black uppercase italic leading-tight">Excluir Lista?</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase mt-1">Esta ação não pode ser desfeita.</p>
                 </div>
                 <div className="flex flex-col gap-2">
                   <button 
                     onClick={() => deleteList(confirmDeleteId)}
                     className="w-full h-12 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
                   >
                     Confirmar Exclusão
                   </button>
                   <button 
                     onClick={() => setConfirmDeleteId(null)}
                     className="w-full h-12 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                   >
                     Manter Lista
                   </button>
                 </div>
               </div>
             </div>
           )}
           
           <button 
             onClick={createNewList}
             className="w-full h-16 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-black uppercase hover:border-primary hover:text-primary transition-all"
           >
             <Plus size={24} /> Nova Lista
           </button>
        </div>

        {/* Anámnēsis Preview (Histórico) - Only for Silver/Gold */}
        <section className="pt-4 border-t border-slate-200">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Anámnēsis (Preços)</h3>
              {userTier === MnemeTier.FREE && <span className="text-[9px] bg-slate-200 px-2 py-1 rounded text-slate-500 font-bold uppercase">Bloqueado</span>}
           </div>
           
           {userTier === MnemeTier.FREE ? (
             <div className="p-4 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
               Faça upgrade para ver a evolução de preços dos seus produtos favoritos.
             </div>
           ) : (
             <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-1 bg-red-500 rounded-full"></div>
                   <div>
                      <p className="text-xs font-black uppercase text-slate-900">Feijão Carioca</p>
                      <p className="text-[10px] text-slate-500 font-bold">Subiu 15% em 30 dias</p>
                   </div>
                </div>
                <span className="text-sm font-black text-red-500">R$ 8,90</span>
             </div>
           )}
        </section>

      </main>
    </div>
  );
};

export default Mneme;
