
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { MnemeList, MnemeItem, ProductMock } from '../types';
import { ArrowLeft, Plus, ScanBarcode, Camera, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

const MnemeListDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState<MnemeList | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (id) loadList(id);
  }, [id]);

  useEffect(() => {
    if (showScanner) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [showScanner]);

  const startScanner = async () => {
    setScanError(null);
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 150 } };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          setScanning(true);
          const product = await db.mneme.getProductByBarcode(decodedText);
          if (product) {
            await addItem(product.name, product.avgPrice);
            setShowScanner(false);
          } else {
            setScanError(`Produto não encontrado: ${decodedText}`);
            setScanning(false);
          }
        },
        (errorMessage) => {
          // Erros de leitura frequentes são normais, não logamos todos
        }
      );
    } catch (err) {
      console.error("Erro ao iniciar scanner:", err);
      setScanError("Não foi possível acessar a câmera.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Erro ao parar scanner:", err);
      }
    }
  };

  const loadList = async (listId: string) => {
    const lists = await db.mneme.getLists();
    const found = lists.find(l => l.id === listId);
    if (found) setList(found);
  };

  const addItem = async (name: string, price: number = 0) => {
    if (!list || !name) return;
    const newItem: MnemeItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category: 'Geral',
      quantity: 1,
      unit: 'un',
      checked: false,
      estimatedPrice: price
    };
    const updatedList = { ...list, items: [...list.items, newItem] };
    await db.mneme.updateList(updatedList);
    setList(updatedList);
    setNewItemName('');
  };

  const toggleCheck = async (itemId: string) => {
    if (!list) return;
    const updatedItems = list.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
    const updatedList = { ...list, items: updatedItems };
    await db.mneme.updateList(updatedList);
    setList(updatedList);
  };

  if (!list) return <div>Carregando...</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-slate-900 font-display relative">
      
      {/* Scanner Overlay */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
           <div className="flex-1 relative flex flex-col items-center justify-center">
              <div id="reader" className="w-full max-w-md"></div>
              
              {scanError && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2 mx-6">
                  <AlertCircle size={16} /> {scanError}
                </div>
              )}

              <div className="absolute bottom-10 inset-x-0 text-center text-white">
                 <p className="font-black uppercase tracking-widest text-sm mb-2">
                   {scanning ? 'Identificando Produto...' : 'Aponte para o Código de Barras'}
                 </p>
                 <button 
                   onClick={() => setShowScanner(false)} 
                   className="px-8 py-3 bg-white/10 text-white rounded-full font-black uppercase text-xs border border-white/20"
                 >
                    Cancelar
                 </button>
              </div>
           </div>
           <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 p-4 text-white"><X size={24}/></button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/mneme')} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-none">{list.title}</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase">
               {list.items.filter(i => i.checked).length}/{list.items.length} Concluídos
            </p>
          </div>
        </div>
        <button onClick={() => setShowScanner(true)} className="size-12 bg-slate-900 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all">
           <ScanBarcode size={20} />
        </button>
      </header>

      <main className="p-4 pb-32">
        {/* Input Rápido */}
        <div className="flex gap-2 mb-6">
           <input 
             value={newItemName}
             onChange={e => setNewItemName(e.target.value)}
             placeholder="Adicionar item manualmente..."
             className="flex-1 h-14 bg-white border border-slate-300 rounded-xl px-4 text-sm font-bold uppercase text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
             onKeyDown={e => e.key === 'Enter' && addItem(newItemName)}
           />
           <button onClick={() => addItem(newItemName)} disabled={!newItemName} className="size-14 bg-primary text-black rounded-xl flex items-center justify-center disabled:opacity-50">
              <Plus size={24} />
           </button>
        </div>

        {/* Lista de Itens */}
        <div className="space-y-3">
           {list.items.map(item => (
             <div 
               key={item.id} 
               onClick={() => toggleCheck(item.id)}
               className={`p-4 rounded-xl border flex items-center gap-4 transition-all cursor-pointer select-none ${item.checked ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}
             >
                <div className={`size-6 rounded-lg border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'}`}>
                   {item.checked && <Check size={14} strokeWidth={4} />}
                </div>
                <div className="flex-1">
                   <p className={`font-black uppercase text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>{item.name}</p>
                   {item.estimatedPrice && <p className="text-[10px] font-bold text-slate-500">R$ {item.estimatedPrice.toFixed(2)}</p>}
                </div>
             </div>
           ))}
        </div>
      </main>

    </div>
  );
};

export default MnemeListDetail;
