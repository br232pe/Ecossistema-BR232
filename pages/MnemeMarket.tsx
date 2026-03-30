
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSmartShoppingList } from '../geminiService';
import { db } from '../services/db';
import { ArrowLeft, ChefHat, Sparkles, Loader2, ArrowRight } from 'lucide-react';

const MnemeMarket: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    const data = await generateSmartShoppingList(prompt);
    setResult(data);
    setLoading(false);
  };

  const saveList = async () => {
    if (!result) return;
    const newList = await db.mneme.createList(prompt.slice(0, 20) + "...", result.items);
    navigate(`/mneme/lista/${newList.id}`);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white font-display">
      <header className="p-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full mb-6">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 mb-2">
           <ChefHat className="text-primary" size={32} />
           <h1 className="text-3xl font-black italic uppercase">Consultor<br/>de Gôndola</h1>
        </div>
        <p className="text-slate-400 text-sm font-medium">Descreva o que você precisa (ex: "Churrasco barato para 10 pessoas") e a IA monta sua lista.</p>
      </header>

      <main className="p-6 space-y-6">
        <div className="relative">
           <textarea 
             value={prompt}
             onChange={e => setPrompt(e.target.value)}
             placeholder="Ex: Lista para feijoada completa..."
             className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-lg font-medium resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
           />
           <button 
             onClick={handleGenerate}
             disabled={loading || !prompt}
             className="absolute bottom-4 right-4 size-10 bg-primary text-black rounded-xl flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform"
           >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
           </button>
        </div>

        {result && (
          <div className="bg-white rounded-[2rem] p-6 text-slate-900 animate-in slide-in-from-bottom-10">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase tracking-tight text-lg">Sugestão Gerada</h3>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold uppercase">{result.items.length} Itens</span>
             </div>
             
             {result.tips && (
               <div className="p-3 bg-yellow-50 text-yellow-800 text-xs font-medium rounded-xl mb-4 italic border border-yellow-200">
                  💡 {result.tips}
               </div>
             )}

             <ul className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {result.items.map((item: any, idx: number) => (
                   <li key={idx} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                      <span className="font-bold uppercase">{item.quantity} {item.unit} {item.name}</span>
                      <span className="text-slate-500">~R$ {item.estimatedPrice?.toFixed(2)}</span>
                   </li>
                ))}
             </ul>

             <button onClick={saveList} className="w-full h-14 bg-primary text-black rounded-xl font-black uppercase flex items-center justify-center gap-2 hover:bg-green-400 transition-colors">
                Criar Lista Agora <ArrowRight size={20} />
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MnemeMarket;
