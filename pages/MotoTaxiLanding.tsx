import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Coins, 
  Settings, 
  CheckCircle, 
  Ticket, 
  BookOpen, 
  Percent, 
  ArrowRight, 
  Briefcase, 
  Check, 
  Server, 
  Info,
  ChevronRight,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import { isBetaActive } from '../src/utils/betaGuard';
import { SubscriptionCoupon } from '../src/types';

export default function MotoTaxiLanding() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Controle de Ciclo de Faturamento
  const [billingCycle, setBillingCycle] = useState<'trimestral' | 'anual'>('anual');
  
  // Controle de Cupom e Loteamento
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [coupons, setCoupons] = useState<Record<string, SubscriptionCoupon>>({});
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  
  // Estado para Erro de Compra Corporativa
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Modal de Transparência Tecnológica
  const [showTechModal, setShowTechModal] = useState(false);
  // Modal de Sucesso de Assinatura
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<{name: string, total: number, originalTotal: number} | null>(null);

  // Computed state compatível com o design anterior:
  const isCouponApplied = !!appliedCouponId && !!coupons[appliedCouponId] && coupons[appliedCouponId].isActive && isBetaActive();

  // Escuta em tempo real dos cupons do banco DEFAULT (ECOBR232 Rule 1 & Rule 3)
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(collection(db, 'subscription_coupons'), async (snapshot) => {
        try {
          const docsMap: Record<string, SubscriptionCoupon> = {};
          snapshot.forEach(docSnap => {
            docsMap[docSnap.id] = docSnap.data() as SubscriptionCoupon;
          });

          // Inicialização canônica autônoma das entidades de cupons
          const baseCoupons = {
            REGIONALISTA100: { discount: 1.0, currentUses: 0, maxUses: 100, isActive: true },
            CORDELISTA80: { discount: 0.8, currentUses: 0, maxUses: 100, isActive: true },
            BETA_ELITE: { discount: 0.7, currentUses: 0, maxUses: 99999, isActive: true }
          };

          for (const [key, val] of Object.entries(baseCoupons)) {
            if (!docsMap[key]) {
              try {
                await setDoc(doc(db, 'subscription_coupons', key), val);
                docsMap[key] = val;
              } catch (err) {
                console.warn(`[Silent Warn] Falha ao auto-inicializar cupom corporativo ${key}:`, err);
              }
            }
          }
          
          setCoupons(docsMap);
        } catch (innerErr) {
          console.warn('[Silent Warn] Erro interno no processamento de snapshot de cupons:', innerErr);
        }
      }, (error) => {
        console.warn('[Silent Warn] Falha de permissão ou conexão ao Firestore ao ouvir cupons:', error);
      });
    } catch (err) {
      console.warn('[Silent Warn] Erro ao registrar onSnapshot em subscription_coupons:', err);
    }

    return () => unsubscribe();
  }, []);

  // Preços Mensais Base
  const basePrices = {
    bronze: 39.90,
    prata: 59.90,
    ouro: 79.90
  };

  // Cálculo de Preços Conforme Ciclo de Faturamento e Cupom
  const calculatePlanCost = (plan: 'bronze' | 'prata' | 'ouro') => {
    const monthlyRate = basePrices[plan];
    let originalTotal = 0;
    let finalTotal = 0;
    
    if (billingCycle === 'trimestral') {
      originalTotal = monthlyRate * 3;
    } else {
      // Anual possui 20% de desconto real
      originalTotal = monthlyRate * 12 * 0.8;
    }

    const activeCoupon = appliedCouponId ? coupons[appliedCouponId] : null;
    if (activeCoupon && activeCoupon.isActive && isBetaActive()) {
      // O desconto residual de e.g. 0.7 resulta em pagar originalTotal * (1 - 0.7) = originalTotal * 0.3
      finalTotal = originalTotal * (1 - activeCoupon.discount);
    } else {
      finalTotal = originalTotal;
    }

    return {
      monthlyEquivalent: parseFloat((finalTotal / (billingCycle === 'trimestral' ? 3 : 12)).toFixed(2)),
      totalPrice: parseFloat(finalTotal.toFixed(2)),
      originalTotalPrice: parseFloat(originalTotal.toFixed(2)),
      savings: parseFloat((originalTotal - finalTotal).toFixed(2))
    };
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCheckoutError('');
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setAppliedCouponId(null);
      return;
    }

    if (!isBetaActive()) {
      setCouponError('O período promocional Beta expirou. Cupons desativados.');
      setAppliedCouponId(null);
      return;
    }

    const activeCoupon = coupons[code];
    if (activeCoupon) {
      if (!activeCoupon.isActive) {
        setCouponError('Este cupom promocional foi desativado.');
        setAppliedCouponId(null);
      } else if (activeCoupon.currentUses >= activeCoupon.maxUses) {
        setCouponError('Este lote de vagas promocionais já se esgotou.');
        setAppliedCouponId(null);
      } else {
        setAppliedCouponId(code);
      }
    } else {
      const isBetaSugg = isBetaActive() ? ' Tente aplicar BETA_ELITE' : '';
      setCouponError(`Cupom inválido no circuito BR-232.${isBetaSugg}`);
      setAppliedCouponId(null);
    }
  };

  const handleSelectPlan = async (planName: 'bronze' | 'prata' | 'ouro') => {
    setCheckoutError('');
    setIsCheckingOut(true);

    let checkoutPrice = 0;
    let actualPlanCost = calculatePlanCost(planName);

    try {
      if (appliedCouponId) {
        const couponRef = doc(db, 'subscription_coupons', appliedCouponId);
        
        await runTransaction(db, async (transaction) => {
          const couponSnap = await transaction.get(couponRef);
          
          if (!couponSnap.exists()) {
            throw new Error('CUPOM_INEXISTENTE');
          }

          const currentBetaActive = isBetaActive();
          const couponData = couponSnap.data() as SubscriptionCoupon;

          // Virada de Chave Financeira: Se isBetaActive() for false, rejeitar cupom promocional
          if (!currentBetaActive) {
            throw new Error('PROMOTIONAL_EXPIRED');
          }

          if (!couponData.isActive || couponData.currentUses >= couponData.maxUses) {
            throw new Error('COUPON_DEPLETED_OR_INACTIVE');
          }

          const nextUses = couponData.currentUses + 1;
          transaction.update(couponRef, { currentUses: nextUses });
          
          const originalPrice = planName === 'bronze' ? basePrices.bronze : planName === 'prata' ? basePrices.prata : basePrices.ouro;
          const cycleMultiplier = billingCycle === 'trimestral' ? 3 : 12 * 0.8;
          checkoutPrice = parseFloat((originalPrice * cycleMultiplier * (1 - couponData.discount)).toFixed(2));
        });

        setSelectedPlanDetails({
          name: planName.toUpperCase(),
          total: checkoutPrice,
          originalTotal: actualPlanCost.originalTotalPrice
        });
      } else {
        setSelectedPlanDetails({
          name: planName.toUpperCase(),
          total: actualPlanCost.totalPrice,
          originalTotal: actualPlanCost.originalTotalPrice
        });
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Erro de Processamento de Cupom:', err);
      if (err.message === 'PROMOTIONAL_EXPIRED') {
        setCheckoutError('Atenção: A transição temporal ocorreu (Fase Beta encerrada). O desconto de estruturação foi desativado e o checkout foi recalculado para o preço de tabela integral.');
        setAppliedCouponId(null);
      } else if (err.message === 'COUPON_DEPLETED_OR_INACTIVE') {
        setCheckoutError('Erro: Este lote promocional esgotou em tempo real. O checkout foi revertido para o valor de tabela original.');
        setAppliedCouponId(null);
      } else {
        setCheckoutError(`Erro de conexão com o banco de dados: ${err.message || err}`);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05100a] text-slate-100 font-sans pb-24 relative overflow-hidden">
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
              <p className="text-[8px] font-bold text-[#00E676] tracking-widest uppercase mt-1">Conectado: Gravatá</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <nav className="hidden lg:flex items-center gap-6 mr-4">
                 <button onClick={() => navigate('/mneme')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-[#00E676] transition-colors italic px-2 py-1">Cesta</button>
                 <button onClick={() => navigate('/guia-servicos')} className="text-[9px] font-black uppercase tracking-widest text-[#00e676] hover:text-[#00E676] transition-colors italic px-2 py-1">Serviços</button>
                 <button onClick={() => navigate('/planos')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-[#00E676] transition-colors italic px-2 py-1">Planos</button>
                 <button onClick={() => navigate('/blog')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-[#00E676] transition-colors italic px-2 py-1">Blog</button>
             </nav>
             
             <div className="hidden sm:flex items-center gap-3">
                <button 
                   onClick={() => navigate('/dashboard')}
                   className="px-4 py-2 bg-[#00E676]/10 border border-[#00E676]/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all"
                >
                   Meu Painel
                </button>
             </div>

             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00E676] active:scale-95 transition-all"
             >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>
      </header>

      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00E676]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-mono tracking-widest mb-10">
          <span className="cursor-pointer hover:text-[#00E676]" onClick={() => navigate('/moto-taxi')}>Moto-Táxi Elite</span>
          <span>/</span>
          <span className="text-[#00E676] font-black">Planos de Gestão Elite</span>
        </div>

        {/* HERO SECTION */}
        <div className="text-center space-y-6 max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#00E676]/10 border border-[#00E676]/35 rounded-full text-[#00E676]"
          >
            <Zap size={12} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider font-mono">Infraestrutura Profissional Piloto-Centric</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase italic leading-[1.1] sm:leading-none"
          >
            Sua Operação. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-emerald-400">
              Sua Soberania.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed md:leading-loose"
          >
            Liberte-se das taxas abusivas de aplicativos corporativos. No ecossistema BR-232, você configura sua própria tarifa de moto-táxi, gerencia seus fundos, e fica com 100% dos ganhos das corridas.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 w-full max-w-md mx-auto"
          >
            <button
              onClick={() => document.getElementById('pricing-plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00E676] hover:bg-[#00c85c] text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-[0_4px_20px_rgba(0,230,118,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2 font-mono"
            >
              Ver Planos e Preços <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/moto-taxi')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 font-black uppercase text-xs tracking-widest rounded-xl border border-white/10 transition-all flex items-center justify-center"
            >
              Voltar ao Simulador
            </button>
          </motion.div>
        </div>

        {/* 3 CARDS DE BENEFÍCIOS ESPECIAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#07130a] border border-[#00E676]/10 hover:border-[#00e66b]/35 p-6 rounded-3xl text-left space-y-4 transition-all duration-300 shadow-xl"
          >
            <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Settings size={22} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Gestão Preditiva (Potes)</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              O motor sínscrono do app realiza a separação automática dos fundos para cada corrida: 15% para manutenção preventiva da sua frota e 10% de fundo mitigador de riscos operacionais na rodovia. Segurança financeira real.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#07130a] border border-[#00E676]/10 hover:border-[#00e66b]/35 p-6 rounded-3xl text-left space-y-4 transition-all duration-300 shadow-xl"
          >
            <div className="size-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Segurança Ativa & Escrow</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              O ecossistema é blindado pelo protocolo Safety Guard (bloqueio manual de interações físicas se exceder 15 km/h) e liquidação em garantia (Escrow de Pagamento). Sem calotes, com segurança total nas vias de Bezerros.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#07130a] border border-[#00E676]/10 hover:border-[#00e66b]/35 p-6 rounded-3xl text-left space-y-4 transition-all duration-300 shadow-xl"
          >
            <div className="size-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Coins size={22} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Liberdade de Preço</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Seja verdadeiramente autônomo. Você tem total controle sobre sua tarifa: configure o preço de bandeirada base e o valor por KM rodado diretamente no seu perfil logístico. Os passageiros escolhem você pelo valor e IP no radar.
            </p>
          </motion.div>
        </div>

        {/* PRICING PLANS SECTION */}
        <div id="pricing-plans-section" className="space-y-12 max-w-6xl mx-auto pt-10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wider italic text-white">Escolha Seu Nível de Licenciamento</h2>
            <p className="text-slate-400 text-xs max-w-lg mx-auto">Selecione o plano ideal para as suas necessidades de transporte na BR-232.</p>
            
            {/* SELETOR TRIMESTRAL / ANUAL */}
            <div className="flex flex-col sm:inline-flex sm:flex-row items-center p-1.5 bg-[#06100a] border border-white/5 rounded-2xl gap-2 mt-6 w-full sm:w-auto">
              <button
                onClick={() => setBillingCycle('trimestral')}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                  billingCycle === 'trimestral'
                    ? 'bg-emerald-600/20 border border-emerald-500/30 text-[#00E676]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Faturamento Trimestral
              </button>
              <button
                onClick={() => setBillingCycle('anual')}
                className={`relative w-full sm:w-auto px-4 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                  billingCycle === 'anual'
                    ? 'bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Faturamento Anual
                <span className="bg-[#00E676] text-black font-black text-[7px] px-1.5 py-0.5 rounded-full absolute -top-2 -right-1 sm:-right-3 animate-bounce">
                  -20% Desconto
                </span>
              </button>
            </div>
          </div>

          {/* CUPOM DE DESCONTO */}
          <div className="max-w-md mx-auto p-5 bg-[#09160d] border border-emerald-500/20 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-[#00E676]">
              <Ticket size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest font-mono">Cupom Corporativo Ativo</span>
            </div>

            {/* GATILHOS DE ESCASSEZ DE CUPONS EM TEMPO REAL */}
            {isBetaActive() && (() => {
              const regionalista = coupons['REGIONALISTA100'];
              const cordelista = coupons['CORDELISTA80'];
              
              if (regionalista) {
                const remaining = Math.max(0, regionalista.maxUses - regionalista.currentUses);
                if (remaining > 0) {
                  return (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-1">
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-amber-500">
                        Aproveite o Lote Regionalista: Restam apenas <span className="font-mono text-white text-xs bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">{remaining}</span> vagas com 100% de desconto!
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Use o cupom: <span className="font-mono text-amber-300 font-extrabold">REGIONALISTA100</span>
                      </p>
                    </div>
                  );
                } else if (cordelista) {
                  const remainingCordelista = Math.max(0, cordelista.maxUses - cordelista.currentUses);
                  return (
                    <div className="p-3.5 bg-emerald-500/10 border border-[#00E676]/30 rounded-2xl text-center space-y-1">
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-[#00E676]">
                        Lote Regionalista Esgotado! Economize com o Lote de Transição.
                      </p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                        Use o cupom sugerido: <span className="font-mono text-white bg-emerald-950/60 px-1.5 py-0.5 rounded border border-[#00E676]/30 font-black">CORDELISTA80</span> para 80% de desconto!
                      </p>
                      {remainingCordelista > 0 && (
                        <p className="text-[7.5px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                          Vagas disponíveis: {remainingCordelista} de {cordelista.maxUses}
                        </p>
                      )}
                    </div>
                  );
                }
              }
              return null;
            })()}
            
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="DIGITE SEU CUPOM"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={isCheckingOut}
                  className="w-full h-10 px-4 bg-black/40 border border-white/10 rounded-xl text-center font-mono font-bold uppercase text-[11px] text-white placeholder-slate-600 tracking-wider focus:outline-none focus:border-[#00E676] disabled:opacity-50"
                />
                {isCouponApplied && (
                  <span className="absolute right-3 top-2.5 text-[#00E676]">
                    <CheckCircle size={14} />
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isCheckingOut}
                className="px-4 h-10 bg-white/5 hover:bg-white/10 text-slate-100 font-bold uppercase text-[10px] font-mono tracking-widest rounded-xl border border-white/10 transition-all disabled:opacity-50"
              >
                Aplicar
              </button>
            </form>

            <AnimatePresence>
              {couponError && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[9px] text-red-400 font-bold uppercase text-center mt-1">
                  {couponError}
                </motion.p>
              )}
              {checkoutError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-red-950/20 border border-red-500/20 rounded-2xl text-center text-[10px] text-red-400 leading-normal font-sans">
                  {checkoutError}
                </motion.div>
              )}
              {isCouponApplied && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1"
                >
                  <p className="text-[10px] text-[#00E676] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                    <Percent size={12} /> Cupom {appliedCouponId} Ativado! (-{((coupons[appliedCouponId!]?.discount || 0) * 100).toFixed(0)}% Real)
                  </p>
                  <button
                    onClick={() => setShowTechModal(true)}
                    className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-[#00E676] underline transition-all flex items-center justify-center gap-1 mx-auto mt-1"
                  >
                    <Info size={10} /> Ver Transparência Tecnológica (Custos Residual)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARDS DOS PLANOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            
            {/* 1. PLANO BRONZE */}
            {(() => {
              const cost = calculatePlanCost('bronze');
              return (
                <div className="bg-[#06100a] border border-white/5 p-5 xs:p-6 sm:p-8 rounded-[2rem] flex flex-col justify-between space-y-6 relative hover:border-[#00E676]/20 transition-all duration-300">
                  <div className="space-y-4">
                    <span className="text-[9px] font-black tracking-widest uppercase text-amber-500/80 px-2 py-0.5 rounded bg-amber-500/5 inline-block">
                      ● Nível Bronze
                    </span>
                    <h3 className="text-xl font-bold text-white uppercase italic">Operador Básico</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed min-h-[40px]">
                      Ideal para quem opera rotas secundárias ou locais de forma casual na cidade.
                    </p>
                    
                    {/* Preço */}
                    <div className="pt-4 border-t border-white/5 space-y-1">
                      {isCouponApplied ? (
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-500 line-through font-mono font-bold">
                            R$ {cost.originalTotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black font-mono text-white">
                              R$ {cost.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">
                              / {billingCycle === 'trimestral' ? 'Trimestre' : 'Ano'}
                            </span>
                          </div>
                          <p className="text-[8.5px] text-[#00E676] font-mono leading-none mt-1">
                            Equivalente a R$ {cost.monthlyEquivalent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black font-mono text-white">
                              R$ {cost.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">
                              / {billingCycle === 'trimestral' ? 'Trimestre' : 'Ano'}
                            </span>
                          </div>
                          <p className="text-[8.5px] text-slate-500 font-mono leading-none mt-1">
                            Equivalente a R$ {cost.monthlyEquivalent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-3 pt-6 border-t border-white/5 text-left text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span>Radar de Escolha Ativo</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span>Cadastramento Sintonizado</span>
                    </div>
                    <div className="flex items-start gap-2 opacity-50">
                      <Check size={14} className="text-slate-600 mt-0.5" />
                      <span className="line-through">Bloqueador Rural/Noturno manual</span>
                    </div>
                    <div className="flex items-start gap-2 opacity-50">
                      <Check size={14} className="text-slate-600 mt-0.5" />
                      <span className="line-through">Destaque VIP do IP no mapa</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('bronze')}
                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 active:scale-95 text-white border border-white/10 text-[9px] font-black font-mono tracking-widest uppercase rounded-xl transition-all"
                  >
                    Selecionar Plano Bronze
                  </button>
                </div>
              );
            })()}

            {/* 2. PLANO PRATA */}
            {(() => {
              const cost = calculatePlanCost('prata');
              return (
                <div className="bg-[#08170e] border border-emerald-500/20 p-5 xs:p-6 sm:p-8 rounded-[2rem] flex flex-col justify-between space-y-6 relative hover:border-emerald-500/40 transition-all duration-300 transform md:-translate-y-2 shadow-[0_15px_40px_rgba(0,230,118,0.03)]">
                  <span className="absolute top-4 right-4 bg-emerald-500/10 text-[#00E676] border border-emerald-500/20 text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full font-mono">
                    Mais Popular
                  </span>
                  
                  <div className="space-y-4">
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-300 px-2 py-0.5 rounded bg-slate-400/10 inline-block">
                      ◆ Nível Prata
                    </span>
                    <h3 className="text-xl font-bold text-white uppercase italic">Operador Profissional</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed min-h-[40px]">
                      Para operadoras regulares e pilotos dedicados com canais amplos nas sub-sedes.
                    </p>
                    
                    {/* Preço */}
                    <div className="pt-4 border-t border-white/5 space-y-1">
                      {isCouponApplied ? (
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-500 line-through font-mono font-bold">
                            R$ {cost.originalTotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black font-mono text-white">
                              R$ {cost.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">
                              / {billingCycle === 'trimestral' ? 'Trimestre' : 'Ano'}
                            </span>
                          </div>
                          <p className="text-[8.5px] text-[#00E676] font-mono leading-none mt-1">
                            Equivalente a R$ {cost.monthlyEquivalent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black font-mono text-white">
                              R$ {cost.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">
                              / {billingCycle === 'trimestral' ? 'Trimestre' : 'Ano'}
                            </span>
                          </div>
                          <p className="text-[8.5px] text-slate-500 font-mono leading-none mt-1">
                            Equivalente a R$ {cost.monthlyEquivalent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-3 pt-6 border-t border-white/5 text-left text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span>Radar de Escolha Ativo</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span>Cadastramento Sintonizado</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span>Banda Rural/Noturna ativa (+30%)</span>
                    </div>
                    <div className="flex items-start gap-2 opacity-50">
                      <Check size={14} className="text-slate-600 mt-0.5" />
                      <span className="line-through">Destaque VIP do IP no mapa</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('prata')}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-[#00c85c] active:scale-95 text-black text-[9px] font-black font-mono tracking-widest uppercase rounded-xl transition-all shadow-[0_4px_15px_rgba(0,198,83,0.15)]"
                  >
                    Selecionar Plano Prata
                  </button>
                </div>
              );
            })()}

            {/* 3. PLANO OURO */}
            {(() => {
              const cost = calculatePlanCost('ouro');
              return (
                <div className="bg-[#0f1f14] border border-[#00E676]/40 p-5 xs:p-6 sm:p-8 rounded-[2rem] flex flex-col justify-between space-y-6 relative hover:border-[#00e66b] transition-all duration-300 shadow-[0_15px_45px_rgba(0,230,118,0.06)]">
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#00E676] text-black border border-[#00E676] text-[7.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full font-mono shadow-[0_4px_10px_rgba(0,198,83,0.3)]">
                    Soberano Total
                  </span>

                  <div className="space-y-4">
                    <span className="text-[9px] font-black tracking-widest uppercase text-yellow-500 px-2 py-0.5 rounded bg-yellow-500/10 inline-block">
                      ★ Nível Ouro
                    </span>
                    <h3 className="text-xl font-bold text-white uppercase italic">Elite Soberano</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed min-h-[40px]">
                      Para canais regionais que exigem máxima relevância e total liberdade de regras fiscais.
                    </p>
                    
                    {/* Preço */}
                    <div className="pt-4 border-t border-white/5 space-y-1">
                      {isCouponApplied ? (
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-500 line-through font-mono font-bold">
                            R$ {cost.originalTotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black font-mono text-white">
                              R$ {cost.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">
                              / {billingCycle === 'trimestral' ? 'Trimestre' : 'Ano'}
                            </span>
                          </div>
                          <p className="text-[8.5px] text-[#00E676] font-mono leading-none mt-1">
                            Equivalente a R$ {cost.monthlyEquivalent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black font-mono text-white">
                              R$ {cost.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">
                              / {billingCycle === 'trimestral' ? 'Trimestre' : 'Ano'}
                            </span>
                          </div>
                          <p className="text-[8.5px] text-slate-500 font-mono leading-none mt-1">
                            Equivalente a R$ {cost.monthlyEquivalent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-3 pt-6 border-t border-white/5 text-left text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span>Radar de Escolha Ativo</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span>Cadastramento Sintonizado</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span>Banda Rural/Noturna ativa (+30%)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#00E676] mt-0.5" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 font-bold">Destaque VIP Ouro Síncrono</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('ouro')}
                    className="w-full py-3.5 bg-[#00E676] hover:bg-[#00c85c] active:scale-95 text-black text-[9px] font-black font-mono tracking-widest uppercase rounded-xl transition-all shadow-[0_5px_20px_rgba(0,198,83,0.3)]"
                  >
                    Selecionar Plano Ouro
                  </button>
                </div>
              );
            })()}

          </div>
        </div>

        {/* GEOGRAPHICAL MATRIX FOOTER SECTION */}
        <div className="mt-32 max-w-4xl mx-auto p-8 bg-[#060f0a] border border-white/5 rounded-[2.5rem] space-y-6 text-left">
          <div className="flex items-center gap-3">
            <span className="size-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[#00E676]">
              <Server size={16} />
            </span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#00E676]">Malha Integrada BR-232</h4>
              <p className="text-[9px] font-mono uppercase text-slate-500">Expansão de Sinal • Cobertura Rodoviária</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Nossa malha operacional inicial está totalmente configurada e conectada para faturamento síncrono nos seguintes nós geográficos da principal artéria de Pernambuco:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-[9px] font-mono uppercase tracking-wider text-slate-500 pt-2 border-t border-white/5">
            <div>• Recife (KM 0)</div>
            <div>• Jaboatão dos Guararapes</div>
            <div>• Moreno (KM 25)</div>
            <div>• Vitória de Santo Antão</div>
            <div>• Pombos (KM 52)</div>
            <div>• Gravatá (KM 84)</div>
            <div>• Bezerros (KM 102)</div>
            <div>• Caruaru (KM 130)</div>
            <div>• São Caetano (KM 150)</div>
            <div>• Pesqueira (KM 215)</div>
            <div>• Arcoverde (KM 250)</div>
            <div>• Serra Talhada</div>
            <div>• Salgueiro (+500km)</div>
          </div>
        </div>

      </div>

      {/* MODAL TRANSPARÊNCIA TECNOLÓGICA */}
      <AnimatePresence>
        {showTechModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gradient-to-b from-[#0b1a11] to-[#040806] border border-emerald-500/30 rounded-[2rem] p-6 text-left space-y-4"
            >
              <div className="flex items-center gap-3 text-[#00E676] pb-2 border-b border-white/5">
                <Info size={18} />
                <span className="text-xs font-black uppercase tracking-widest font-mono">Transparência Tecnológica</span>
              </div>
              
              <p className="text-xs text-slate-300 leading-normal font-sans">
                No Ecossistema BR-232, temos o compromisso corporativo de <strong className="text-white">Taxa Zero (0% Take Rate)</strong> sobre as suas corridas. Isso significa que todo centavo cobrado pelo transporte vai direto para o piloto.
              </p>
              
              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2">
                <span className="text-[9px] font-mono text-[#00E676] uppercase tracking-wider font-bold block">Destinação do Investimento Técnico Residual</span>
                <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                  Quando um cupom de faturamento regionalista ou de estruturação como <span className="font-mono text-[#00E676] font-bold">{appliedCouponId || (isBetaActive() ? 'BETA_ELITE' : 'ORDEM_ELITE')}</span> é ativado, qualquer valor residual é investido integralmente na manutenção técnica e segurança contínua da sua conta, garantindo funcionamento ininterrupto de sua ferramenta e alta estabilidade na malha rodoviária.
                </p>
              </div>

              <button
                onClick={() => setShowTechModal(false)}
                className="w-full h-10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-[9px] tracking-widest rounded-xl transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SUCESSO DO PLANO */}
      <AnimatePresence>
        {showSuccessModal && selectedPlanDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#0e2116] to-[#040806] border border-[#00E676]/40 rounded-[2.5rem] p-7 text-center space-y-6 shadow-[0_20px_50px_rgba(0,230,118,0.2)]"
            >
              <div className="size-16 rounded-full bg-[#00E676]/10 border border-[#00E676]/35 flex items-center justify-center text-[#00E676] mx-auto animate-bounce">
                <CheckCircle size={32} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Assinatura Solicitada</h3>
                <h2 className="text-xl font-black uppercase tracking-tight text-white italic">Elite {selectedPlanDetails.name}</h2>
              </div>

              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                <span className="text-[8px] font-mono text-[#00E676] uppercase tracking-wider block">Faturamento Seguro</span>
                <span className="text-2xl font-black font-mono text-white">R$ {selectedPlanDetails.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <p className="text-[9px] text-slate-500 font-sans leading-none">
                  Sua ferramenta de gestão está ativa e pronta para despacho.
                </p>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                Parabéns! Sua credencial operacional foi sintonizada na malha corporativa com liquidação instantânea por QR Code ou Pix síncrono.
              </p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/moto-taxi');
                }}
                className="w-full h-11 bg-[#00E676] hover:bg-[#00c85c] text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all font-mono"
              >
                Voltar ao Painel Operacional
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
         {isMenuOpen && (
            <motion.div
               initial={{ opacity: 0, x: '100%' }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed inset-0 z-[110] bg-[#05100a] lg:hidden p-8 pt-24 space-y-8 flex flex-col items-center text-center overflow-y-auto"
            >
               <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                  <X size={24} />
               </button>

               <nav className="flex flex-col gap-6 w-full">
                  <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-[#ff751f]/10 border border-[#ff751f]/20 text-lg font-black uppercase tracking-[0.2em] italic text-[#ff751f]">Cesta do Lar</button>
                  <button onClick={() => { navigate('/guia-servicos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Guia de Serviços</button>
                  <button onClick={() => { navigate('/planos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-primary/10 border border-primary/20 text-lg font-black uppercase tracking-[0.2em] italic text-primary">Planos & Patronos</button>
                  <button onClick={() => { navigate('/blog'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Blog da 232</button>
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

    </div>
  );
}
