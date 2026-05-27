import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCcw, Check, Sparkles, AlertCircle, Barcode, ShoppingCart, Plus, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TIER_CATEGORIES } from '../constants/Categories';
import { seedCatalog } from '../constants/SeedCatalog';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: {
    name: string;
    category: string;
    quantity: number;
    brand: string;
    weightVolume: string;
  }) => Promise<void>;
}


const PRESET_BRANDS = [
  "Nestlé", "Sadia", "Seara", "Três Corações", "Omo", "Ypê", "Colgate", "Quaker", "Heinz", "Hellmann's", "Dona Benta", "Vitarella", "Santa Clara", "Pilão", "Itambé", "Piracanjuba", "Artesanal BR-232", "Doce Agreste", "Sanhaçu"
];

const PRESET_WEIGHTS = [
  "1 un", "2 un", "3 un", "4 un", "5 un", "100g", "200g", "250g", "500g", "1kg", "2kg", "5kg", "200ml", "350ml", "500ml", "1L", "2L"
];

// Synth Audio Beep using Web Audio API for checkout-like feedback
const playScannerBeep = () => {
  try {
    const audio = new Audio('/sound/beep.mp3');
    audio.play().catch(e => {
      console.warn("HTML5 audio playback blocked or file missing, falling back to Web Audio synth:", e);
    });
  } catch (err) {
    console.warn("HTML5 Audio instantiation failed:", err);
  }
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.value = 1100; // crispy clear checkout chime frequency
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.22);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (err) {
    console.warn("Audio Context beep blocked or restricted:", err);
  }
};

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose, onItemAdded }) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Custom Registration Form State for Unrecognized Codes
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<string>(TIER_CATEGORIES[0]);
  const [itemBrand, setItemBrand] = useState('');
  const [itemWeight, setItemWeight] = useState('1 un');
  const [customBrand, setCustomBrand] = useState('');
  const [customWeight, setCustomWeight] = useState('');
  const [itemQuantity, setItemQuantity] = useState<string>('1');
  const [showCustomBrandInput, setShowCustomBrandInput] = useState(false);
  const [showCustomWeightInput, setShowCustomWeightInput] = useState(false);
  
  // Scanned item object if matched
  const [matchedItem, setMatchedItem] = useState<{
    name: string;
    category: string;
    brand: string;
    weight: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "barcode-scanner-container";

  // Cleanup helper to stop scanner hardware safely
  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping html5-qrcode scanner:", err);
      }
      scannerRef.current = null;
    }
  };

  const startScanning = async () => {
    setScannerError(null);
    setScannedCode(null);
    setMatchedItem(null);
    
    // Reset registration states
    setItemName('');
    setCustomBrand('');
    setCustomWeight('');
    setItemQuantity('1');
    setShowCustomBrandInput(false);
    setShowCustomWeightInput(false);
    setItemCategory(TIER_CATEGORIES[0]);
    setItemBrand('');
    setItemWeight('1 un');

    try {
      // Small timeout to guarantee DOM node rendering
      await new Promise(resolve => setTimeout(resolve, 250));
      
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.QR_CODE
      ];
      const scanner = new Html5Qrcode(scannerId, { verbose: false, formatsToSupport });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (videoWidth, videoHeight) => {
            // landscape laser targeting style for EAN-13 barcodes
            const boxWidth = Math.floor(videoWidth * 0.85);
            const boxHeight = Math.floor(videoWidth * 0.45);
            return {
              width: boxWidth,
              height: Math.max(120, boxHeight)
            };
          },
          aspectRatio: 1.7777778
        },
        (decodedText) => {
          handleOnCodeScanned(decodedText);
        },
        () => {
          // Failure called continuously on every frame when no code is current, quiet ignore
        }
      );
    } catch (err: any) {
      console.error("Barcode Initiation Failed:", err);
      setScannerError("Permissão de câmera não concedida ou dispositivo de vídeo indisponível.");
    }
  };

  const handleOnCodeScanned = (code: string) => {
    // Immediate beep feedback
    playScannerBeep();
    setScannedCode(code);
    
    // Auto-stop scanner feeds so the user is not flooded with camera feedback while editing/saving
    stopScanning();

    // Check pre-saved seed catalog first (normalizing leading zero if EAN-13 scanned as 13 digits)
    let matchCode = code;
    if (code.length === 13 && !code.startsWith('0')) {
      matchCode = "0" + code;
    }

    let match: { name: string; category: string; brand: string; weight: string } | null = null;
    const seedMatch = seedCatalog[matchCode] || seedCatalog[code];

    if (seedMatch) {
      // Determine weight if present in the product name
      const weightMatch = seedMatch.name.match(/\b\d+(?:g|kg|ml|L)\b/i);
      const weight = weightMatch ? weightMatch[0] : "1 un";
      match = {
        name: seedMatch.name,
        category: seedMatch.category,
        brand: seedMatch.brand,
        weight: weight
      };
    } else {
      // Check local storage customized registers
      try {
        const customDb = JSON.parse(localStorage.getItem('mneme_custom_barcodes') || '{}');
        if (customDb[code]) {
          match = customDb[code];
        } else if (customDb[matchCode]) {
          match = customDb[matchCode];
        }
      } catch (e) {
        console.error("Failed to fetch custom barcode registry from storage:", e);
      }
    }

    if (match) {
      setMatchedItem(match);
    } else {
      setMatchedItem(null);
      // Auto pre-populate default brand or values
      setItemName('');
    }
  };

  const handleAddMatchedItem = async (keepScanning: boolean) => {
    if (!matchedItem) return;
    setIsAdding(true);

    try {
      await onItemAdded({
        name: matchedItem.name,
        category: matchedItem.category,
        brand: matchedItem.brand,
        quantity: 1, // Matched items default to 1 unit
        weightVolume: matchedItem.weight
      });

      if (keepScanning) {
        setIsAdding(false);
        startScanning();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Failed to add scanned item:", error);
      setIsAdding(false);
    }
  };

  const handleRegisterAndAddItem = async (keepScanning: boolean) => {
    if (!scannedCode || !itemName.trim()) return;
    setIsAdding(true);

    const brandName = showCustomBrandInput ? customBrand : itemBrand;
    const finalWeightValue = showCustomWeightInput ? customWeight : itemWeight;
    const finalQuantity = Math.max(1, Math.floor(parseInt(itemQuantity, 10) || 1));

    const newProduct = {
      name: itemName,
      category: itemCategory,
      brand: brandName,
      weight: finalWeightValue
    };

    try {
      // Persist locally under user's custom catalog database
      const customDb = JSON.parse(localStorage.getItem('mneme_custom_barcodes') || '{}');
      customDb[scannedCode] = newProduct;
      localStorage.setItem('mneme_custom_barcodes', JSON.stringify(customDb));

      // Add actual item onto Firestore List
      await onItemAdded({
        name: newProduct.name,
        category: newProduct.category,
        brand: newProduct.brand,
        quantity: finalQuantity,
        weightVolume: newProduct.weight
      });

      if (keepScanning) {
        setIsAdding(false);
        startScanning();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Failed to register and add custom item:", error);
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          style={{ willChange: "transform, opacity" }}
          className="relative w-full max-w-md bg-[#05100a] border border-white/10 rounded-[2.5rem] shadow-4xl p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Barcode size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black italic uppercase tracking-wider text-white">Scanner de Gôndola</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Auditoria Geral de Ativos BR-232</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="size-12 min-h-[48px] min-w-[48px] rounded-xl bg-white/5 hover:bg-white/10 hover:text-rose-500 flex items-center justify-center text-slate-400 transition-all border border-white/5"
            >
              <X size={20} />
            </button>
          </div>

          {/* Core Applet Board */}
          <div className="flex-1 space-y-6">
            {!scannedCode ? (
              <div className="space-y-4">
                {/* Camera Container Frame */}
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 aspect-[4/3] bg-black/90 flex items-center justify-center">
                  
                  {/* Laser Scan Vector Animation */}
                  <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{
                      transform: 'translateY(150px)',
                      animation: 'scanLine 2.2s infinite ease-in-out'
                    }} />
                    
                    {/* Corner Reticles */}
                    <div className="absolute top-4 left-4 size-5 border-t-2 border-l-2 border-primary/60 rounded-tl-md" />
                    <div className="absolute top-4 right-4 size-5 border-t-2 border-r-2 border-primary/60 rounded-tr-md" />
                    <div className="absolute bottom-4 left-4 size-5 border-b-2 border-l-2 border-primary/60 rounded-bl-md" />
                    <div className="absolute bottom-4 right-4 size-5 border-b-2 border-r-2 border-primary/60 rounded-br-md" />
                  </div>

                  {/* html5-qrcode output target */}
                  <div id={scannerId} className="w-full h-full object-cover rounded-[1.8rem] overflow-hidden" />

                  {scannerError && (
                    <div className="absolute inset-0 bg-[#070101]/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                      <AlertCircle size={32} className="text-rose-500 animate-bounce" />
                      <p className="text-xs font-bold text-slate-300">{scannerError}</p>
                      <button
                        onClick={startScanning}
                        className="px-4 h-12 min-h-[48px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5"
                      >
                        <RefreshCcw size={14} /> Tentar Novamente
                      </button>
                    </div>
                  )}

                  {!scannerError && (
                    <div className="absolute top-3 left-3 bg-black/75 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur flex items-center gap-1.5 z-20">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider">Câmera Ativa</span>
                    </div>
                  )}
                </div>

                {/* Micro instructions / Sandbox codes */}
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-primary tracking-widest">
                    <HelpCircle size={12} className="text-primary" />
                    Dica de Teste (Sem Produto Físico)
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Você pode apontar a câmera para um código de barra na tela do PC, ou simplesmente utilizar estes códigos locais para testar a gravação:
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px]">
                    <button 
                      onClick={() => handleOnCodeScanned("07896481130045")}
                      className="bg-black/40 border border-white/5 hover:border-emerald-500/40 p-3 min-h-[48px] text-left rounded-lg text-emerald-400 font-bold uppercase truncate flex items-center justify-start"
                    >
                      🌽 Flocão Milho 500g
                    </button>
                    <button 
                      onClick={() => handleOnCodeScanned("07896481130373")}
                      className="bg-black/40 border border-white/5 hover:border-emerald-500/40 p-3 min-h-[48px] text-left rounded-lg text-emerald-400 font-bold uppercase truncate flex items-center justify-start"
                    >
                      🥣 Mingau Corilon 230g
                    </button>
                  </div>
                  <div className="text-[8px] text-center text-slate-600 uppercase font-black tracking-wider pt-1">
                    Suporta qualquer código de barra de mercado EAN-13 ativo
                  </div>
                </div>
              </div>
            ) : (
              /* Scanned Product Visual Result Card */
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/5 p-5 rounded-[2rem] text-center relative overflow-hidden">
                  <div className="text-[8px] font-black uppercase bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full w-max mx-auto mb-3">
                    EAN-13: {scannedCode}
                  </div>

                  {matchedItem ? (
                    /* MATCH FOUND DISPLAY */
                    <div className="space-y-4">
                      <div className="size-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto text-primary border border-primary/10">
                        <Check size={32} strokeWidth={3} className="animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black italic uppercase leading-tight text-white">{matchedItem.name}</h4>
                        <p className="text-xs font-bold text-primary/80 uppercase tracking-widest">{matchedItem.brand || "Marca Regional"}</p>
                      </div>

                      <div className="flex justify-center gap-4 text-[10px] font-black uppercase text-slate-500 pt-3 border-t border-white/5">
                        <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                          Categoria: <span className="text-white font-black">{matchedItem.category}</span>
                        </div>
                        <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                          Peso/Conteúdo: <span className="text-white font-black">{matchedItem.weight}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* UNRECOGNIZED BARCODE REGISTRATION FORM */
                    <div className="space-y-5 text-left pt-2">
                      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl">
                        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider leading-none">Novo Código Detectado</p>
                          <p className="text-[9px] text-slate-400 font-medium">Este código não consta no catálogo geral. Preencha os campos abaixo uma única vez para registrá-lo no seu celular!</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Nome do Produto */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Nome do Produto *</label>
                          <input
                            type="text"
                            placeholder="Ex: Coca-Cola Pet 1.5L, Sabão em Pó Brilhante..."
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>

                        {/* Categoria e Peso/Qtd Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Categoria</label>
                            <select
                              value={itemCategory}
                              onChange={(e) => setItemCategory(e.target.value)}
                              className="w-full h-11 px-3 bg-[#030906] border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest focus:outline-none cursor-pointer"
                            >
                              {TIER_CATEGORIES.map(s => <option key={s} value={s} className="bg-[#05100a] text-white">{s}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Peso / Qtd</label>
                            {showCustomWeightInput ? (
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  placeholder="ex: 800g"
                                  value={customWeight}
                                  onChange={(e) => setCustomWeight(e.target.value)}
                                  className="flex-1 h-11 px-2.5 bg-white/5 border border-amber-500/40 rounded-xl text-xs text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => { setShowCustomWeightInput(false); setItemWeight(PRESET_WEIGHTS[0]); }}
                                  className="px-2 bg-white/5 rounded-xl text-[8px] uppercase font-bold text-slate-400"
                                >
                                  Lista
                                </button>
                              </div>
                            ) : (
                              <select
                                value={itemWeight}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setShowCustomWeightInput(true);
                                  } else {
                                    setItemWeight(e.target.value);
                                  }
                                }}
                                className="w-full h-11 px-2.5 bg-[#030906] border border-white/10 rounded-xl text-[10px] font-bold text-white cursor-pointer focus:outline-none"
                              >
                                {PRESET_WEIGHTS.map(w => <option key={w} value={w} className="bg-[#05100a] text-white">{w}</option>)}
                                <option value="CUSTOM" className="bg-[#05100a] text-amber-500 font-bold">+ Outro...</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* Marca */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Marca / Produtor</label>
                          {showCustomBrandInput ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Digitar marca..."
                                value={customBrand}
                                onChange={(e) => setCustomBrand(e.target.value)}
                                className="flex-1 h-11 px-4 bg-white/5 border border-amber-500/40 rounded-xl text-xs text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => { setShowCustomBrandInput(false); setItemBrand(''); }}
                                className="px-3 bg-white/5 rounded-xl text-[9px] font-bold text-slate-400 uppercase"
                              >
                                Lista
                              </button>
                            </div>
                          ) : (
                            <select
                              value={itemBrand}
                              onChange={(e) => {
                                if (e.target.value === "CUSTOM") {
                                  setShowCustomBrandInput(true);
                                } else {
                                  setItemBrand(e.target.value);
                                }
                              }}
                              className="w-full h-11 px-4 bg-[#030906] border border-white/10 rounded-xl text-xs text-white cursor-pointer focus:outline-none"
                            >
                              <option value="" className="bg-[#05100a] text-slate-400">Sem marca / Genérico</option>
                              {PRESET_BRANDS.map(b => <option key={b} value={b} className="bg-[#05100a] text-white">{b}</option>)}
                              <option value="CUSTOM" className="bg-[#05100a] text-amber-500 font-bold">+ Adicionar outra...</option>
                            </select>
                          )}
                        </div>

                        {/* Quantidade */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Quantidade</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={itemQuantity}
                            onChange={(e) => {
                              const v = e.target.value;
                              const parsed = parseInt(v, 10);
                              if (v === '' || (!isNaN(parsed) && parsed > 0)) {
                                setItemQuantity(v);
                              }
                            }}
                            className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Action Bar */}
                <div className="flex flex-col gap-2.5 pt-2">
                  {matchedItem ? (
                    <>
                      <button
                        onClick={() => handleAddMatchedItem(true)}
                        disabled={isAdding}
                        className="w-full h-14 bg-primary text-black hover:bg-[#00c865] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isAdding ? <Loader className="animate-spin size-4" /> : <Plus size={16} strokeWidth={3} />}
                        Adicionar + Escanear Próximo
                      </button>
                      <button
                        onClick={() => handleAddMatchedItem(false)}
                        disabled={isAdding}
                        className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <ShoppingCart size={15} /> Adicionar e Fechar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRegisterAndAddItem(true)}
                        disabled={isAdding || !itemName.trim()}
                        className="w-full h-14 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
                      >
                        {isAdding ? <Loader className="animate-spin size-4" /> : <Check size={16} strokeWidth={3} />}
                        Registrar + Escanear Próximo
                      </button>
                      <button
                        onClick={() => handleRegisterAndAddItem(false)}
                        disabled={isAdding || !itemName.trim()}
                        className="w-full h-12 bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <ShoppingCart size={15} /> Registrar e Fechar
                      </button>
                    </>
                  )}

                  <button
                    onClick={startScanning}
                    disabled={isAdding}
                    className="w-full h-12 min-h-[48px] bg-transparent hover:text-white text-slate-500 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCcw size={12} /> Descartar e Escanear de Novo
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Internal mini loader spinning component
const Loader: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
