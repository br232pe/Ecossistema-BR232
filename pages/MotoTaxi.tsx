import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, db } from '../src/contexts/AuthContext';
import { doc, updateDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { 
  Navigation, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Phone,
  Clock,
  Gauge,
  Map,
  ShieldAlert,
  Search,
  Filter,
  Users,
  AlertTriangle,
  Play,
  Pause,
  AlertOctagon,
  RefreshCw,
  Settings,
  Lock,
  Unlock,
  Layers,
  Wallet,
  CreditCard,
  Coins,
  QrCode,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingProfile } from '../src/types';
import { useSpeedGuard } from '../src/components/SafetyGuard';
import { calculateRates, calculateIndividualRideRate } from '../src/services/pricingEngine';
import { calculateEarningsBreakdown, EarningsBreakdown } from '../src/utils/driverEarnings';

// Tipo estrito para os motoristas homologados no ecossistema
interface Driver {
  id: string;
  name: string;
  route: string;
  driverType: 'independent' | 'associated';
  ip: number; // Índice de Pertencimento (Sincronizado via state engine)
  vehicle: string;
  plate: string;
  rides: number;
  rating: number;
  phone: string;
  status: 'online' | 'busy' | 'offline';
  progress: number; // Progressão síncrona na rota de serviço (0.0 a 1.0)
  cityNode: string; // Landmark ou Trecho operacional ativo
  avatarColor: string;
  coords: { x: number; y: number }; // Coordenadas estáticas base no radar
  planTier: 'bronze' | 'prata' | 'ouro';
  baseFare: number;
  pricePerKm: number;
}

// Catálogo Semente Logístico e Inteligente (MOCK_ACTIVE_DRIVERS) em estrita conformidade com a BR-232
const MOCK_ACTIVE_DRIVERS: Driver[] = [
  {
    id: "MT-811",
    name: "Rodrigo 'Yamaha' Silva",
    route: "Vitória de Santo Antão ↔ Pombos (Sede)",
    driverType: "associated",
    ip: 94.6,
    vehicle: "Yamaha Fazer FZ25",
    plate: "PDV-8E12",
    rides: 2310,
    rating: 4.9,
    phone: "5581987654321",
    status: "online",
    progress: 0.65,
    cityNode: "Posto BR Vitória - KM 52",
    avatarColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/35",
    coords: { x: 180, y: 150 },
    planTier: 'ouro',
    baseFare: 6.00,
    pricePerKm: 1.80
  },
  {
    id: "MT-812",
    name: "Beto do Grau (Roberto Lima)",
    route: "Pombos ↔ Gravatá (Sede)",
    driverType: "independent",
    ip: 88.2,
    vehicle: "Honda CB Twister 250",
    plate: "KGA-7F91",
    rides: 1240,
    rating: 4.8,
    phone: "5581977776666",
    status: "online",
    progress: 0.45,
    cityNode: "Subida Serra das Russas - KM 71",
    avatarColor: "bg-[#00E676]/20 text-[#00E676]/90 border border-[#00E676]/35",
    coords: { x: 340, y: 150 },
    planTier: 'prata',
    baseFare: 5.50,
    pricePerKm: 1.60
  },
  {
    id: "MT-813",
    name: "Severino de Mandacaru",
    route: "Gravatá ↔ Mandacaru / Russinhas (Distritos)",
    driverType: "associated",
    ip: 92.5,
    vehicle: "Honda Bros 160 NXR",
    plate: "PEY-4X22",
    rides: 3410,
    rating: 4.95,
    phone: "5581966665555",
    status: "busy",
    progress: 0.75,
    cityNode: "Estrada de Mandacaru - KM 8",
    avatarColor: "bg-[#00c853]/20 text-[#00c853] border border-[#00c853]/35",
    coords: { x: 420, y: 220 },
    planTier: 'ouro',
    baseFare: 7.00,
    pricePerKm: 2.00
  },
  {
    id: "MT-814",
    name: "Zé da Twister",
    route: "Bezerros ↔ Serra Negra / Sapucarana (Distritos)",
    driverType: "independent",
    ip: 83.1,
    vehicle: "Honda CB300 Twister",
    plate: "NQF-1C90",
    rides: 890,
    rating: 4.75,
    phone: "5581955554444",
    status: "online",
    progress: 0.25,
    cityNode: "Subida Serra Negra - KM 102",
    avatarColor: "bg-teal-500/20 text-teal-400 border border-teal-500/35",
    coords: { x: 580, y: 220 },
    planTier: 'bronze',
    baseFare: 5.00,
    pricePerKm: 1.50
  },
  {
    id: "MT-815",
    name: "Carlos Express (Carlos Souza)",
    route: "Caruaru ↔ Lajedo do Cedro",
    driverType: "associated",
    ip: 96.8,
    vehicle: "Honda Titan 160 S",
    plate: "OYO-9Y10",
    rides: 2100,
    rating: 4.88,
    phone: "5581944443333",
    status: "online",
    progress: 0.72,
    cityNode: "Distrito de Lajedo do Cedro",
    avatarColor: "bg-emerald-400/25 text-emerald-300 border border-emerald-400/30",
    coords: { x: 740, y: 220 },
    planTier: 'prata',
    baseFare: 6.50,
    pricePerKm: 1.70
  }
];

const MotoTaxiDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  // Estados locais para Telemetria e Simulação
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(MOCK_ACTIVE_DRIVERS[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'independent' | 'associated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(0);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_ACTIVE_DRIVERS);
  const [isLiveTelemetryActive, setIsLiveTelemetryActive] = useState<boolean>(true);
  
  // Estado para adicional noturno/rural (+30%) - Controlado p/ Prata & Ouro
  const [isExtraRateActive, setIsExtraRateActive] = useState<boolean>(false);

  // Estados de resiliência offline e Watchdog (Modo Moto-Táxi Elite)
  const [isSyncingState, setIsSyncingState] = useState<boolean>(false);
  const [watchdogFired, setWatchdogFired] = useState<boolean>(false);
  const [showSyncToast, setShowSyncToast] = useState<boolean>(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string>('');

  // Estados adicionais para Modal de Pagamento / Canal do Passageiro
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'eco_wallet' | 'pix' | 'cash' | 'credit_card'>('eco_wallet');
  const [pendingRideDriver, setPendingRideDriver] = useState<Driver | null>(null);
  
  // Estado para simulação de Corrida Ativa (Moto-Táxi Elite)
  const [activeRide, setActiveRide] = useState<{
    id: string;
    driverId: string;
    driverName: string;
    status: 'requesting' | 'in_progress' | 'completed';
    origin: string;
    destination: string;
    totalFare: number;
    paymentMethod: 'eco_wallet' | 'pix' | 'cash' | 'credit_card';
    passengerFeedback?: { rating: number; comment?: string };
    pilotFeedback?: {
      rating: number; // 1 a 5 estrelas - Nota geral.
      punctuality: boolean; // Estava no local?
      cordiality: boolean; // Fator Bem-estar/Respeito
      pillionSafety: boolean; // Comportamento seguro na garupa/capacete
    };
    gamification?: { ipPointsEarned: number; multiplierApplied: number; penaltyApplied?: boolean; boosterApplied?: boolean };
    breakdown?: EarningsBreakdown;
    isArchived?: boolean;
  } | null>(null);

  // Estados para avaliação temporária bilateral do Cockpit
  const [tempPilotRating, setTempPilotRating] = useState<number>(5);
  const [tempPunctuality, setTempPunctuality] = useState<boolean>(true);
  const [tempCordiality, setTempCordiality] = useState<boolean>(true);
  const [tempPillionSafety, setTempPillionSafety] = useState<boolean>(true);
  const [tempPassengerRating, setTempPassengerRating] = useState<number>(5);

  // Histórico de Corridas Recentes para alimentar o "Resultado de Corridas"
  const [rideHistory, setRideHistory] = useState<Array<{
    id: string;
    driverId: string;
    driverName: string;
    date: Date;
    origin: string;
    destination: string;
    totalFare: number;
    paymentMethod: 'eco_wallet' | 'pix' | 'cash' | 'credit_card';
    passengerFeedback?: { rating: number; comment?: string };
    pilotFeedback?: {
      rating: number; // 1 a 5 estrelas - Nota geral.
      punctuality: boolean; // Estava no local?
      cordiality: boolean; // Fator Bem-estar/Respeito
      pillionSafety: boolean; // Comportamento seguro na garupa/capacete
    };
    gamification: { ipPointsEarned: number; multiplierApplied: number; penaltyApplied?: boolean; boosterApplied?: boolean };
    breakdown: EarningsBreakdown;
    isArchived?: boolean;
  }>>([
    {
      id: "CORRIDA-1024",
      driverId: "MT-813",
      driverName: "Severino de Mandacaru",
      date: new Date(Date.now() - 3600000), // 1 hora atrás
      origin: "Centro de Gravatá",
      destination: "Distrito de Mandacaru",
      totalFare: 15.00,
      paymentMethod: 'cash',
      gamification: { ipPointsEarned: 6.0, multiplierApplied: 1.0 },
      breakdown: {
        grossRevenue: 15.00,
        maintenanceFund: 1.50,
        reserveFund: 0.75,
        fuelCost: 2.25,
        netProfit: 10.50
      }
    },
    {
      id: "CORRIDA-1025",
      driverId: "MT-814",
      driverName: "Zé da Twister",
      date: new Date(Date.now() - 7200000), // 2 horas atrás
      origin: "Terminal Bezerros",
      destination: "Serra Negra",
      totalFare: 22.50,
      paymentMethod: 'eco_wallet',
      gamification: { ipPointsEarned: 13.5, multiplierApplied: 1.5 },
      breakdown: {
        grossRevenue: 22.50,
        maintenanceFund: 2.25,
        reserveFund: 1.13,
        fuelCost: 3.38,
        netProfit: 15.74
      }
    }
  ]);

  // Gamification Hook: Calcula IP conforme distância, meio de pagamento e avaliação do piloto
  const calculateRideIP = (
    baseDistance: number, 
    payMethod: 'eco_wallet' | 'pix' | 'cash' | 'credit_card',
    pilotFb?: {
      rating: number;
      punctuality: boolean;
      cordiality: boolean;
      pillionSafety: boolean;
    }
  ) => {
    const basePoints = Math.max(2, Math.round(baseDistance * 1.2 * 10) / 10);
    let multiplier = payMethod === 'eco_wallet' ? 1.5 : 1.0;
    let penaltyApplied = false;

    // Regra Penalizadora: Se nota <= 2 ou cordialidade for falsa, anula multiplicador financeiro
    if (pilotFb) {
      if (pilotFb.rating <= 2 || !pilotFb.cordiality) {
        multiplier = 1.0;
        penaltyApplied = true;
      }
    }

    let ipPointsEarned = parseFloat((basePoints * multiplier).toFixed(1));
    let boosterApplied = false;

    // Regra Impulsionadora: Nota 5 e todos os critérios positivos concede bônus de +10% Social IP
    if (pilotFb && !penaltyApplied) {
      if (pilotFb.rating === 5 && pilotFb.punctuality && pilotFb.cordiality && pilotFb.pillionSafety) {
        ipPointsEarned = parseFloat((ipPointsEarned * 1.1).toFixed(1));
        boosterApplied = true;
      }
    }

    return {
      ipPointsEarned,
      multiplierApplied: multiplier,
      penaltyApplied,
      boosterApplied
    };
  };

  // Watchdog & Resiliência Offline para Mudanças de Estado
  const handleStateTransition = async (newStatus: 'requesting' | 'in_progress' | 'completed', customUpdates?: any) => {
    if (!activeRide) return;

    setIsSyncingState(true);
    setWatchdogFired(false);

    let watchdogTimeout: any = null;

    // Configuração do Watchdog Timer (10 segundos)
    const watchdogPromise = new Promise<never>((_, reject) => {
      watchdogTimeout = setTimeout(() => {
        setWatchdogFired(true);
        setIsSyncingState(false);
        setSyncToastMessage('Conexão oscilante. Operando com dados locais salvos.');
        setShowSyncToast(true);
        reject(new Error('TIMEOUT'));
      }, 10000);
    });

    try {
      const writePromise = async () => {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const rideRef = doc(db, 'mototaxi_rides', activeRide.id);
        
        // Objeto de Perfil Tarifário para Injeção de Tipo Estrita
        const pricingProfile: PricingProfile = {
          baseFare: selectedDriver ? selectedDriver.baseFare : 6.0,
          pricePerKm: selectedDriver ? selectedDriver.pricePerKm : 1.8
        };

        await setDoc(rideRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
          pricingProfile,
          ...customUpdates
        }, { merge: true });

        if (watchdogTimeout) clearTimeout(watchdogTimeout);
        setIsSyncingState(false);
      };

      await Promise.race([writePromise(), watchdogPromise]);

      setActiveRide(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus,
          ...customUpdates
        };
      });

    } catch (err: any) {
      if (err.message === 'TIMEOUT') {
        console.warn('[Watchdog Ativado] Gravando transito local de forma offline-first.');
        setActiveRide(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: newStatus,
            ...customUpdates
          };
        });
      } else {
        if (watchdogTimeout) clearTimeout(watchdogTimeout);
        setIsSyncingState(false);
        console.error('[Transition Erro] Firestore erro transitório:', err);
        setSyncToastMessage('Conexão oscilante. Operando com dados locais salvos.');
        setShowSyncToast(true);
        setActiveRide(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: newStatus,
            ...customUpdates
          };
        });
      }
    }
  };

  // Watchdog & Resiliência Offline para Despacho Inicial
  const handleDispatchRide = async (pendingDriver: Driver) => {
    const calculatedRate = calculateIndividualRideRate(pendingDriver.baseFare, pendingDriver.pricePerKm, 10.5, isExtraRateActive);
    const baseDistance = 10.5;
    const gamificationVal = calculateRideIP(baseDistance, selectedPaymentMethod);

    const generatedId = `CORRIDA-${Math.floor(1000 + Math.random() * 9000)}`;
    const pricingProfile: PricingProfile = {
      baseFare: pendingDriver.baseFare,
      pricePerKm: pendingDriver.pricePerKm
    };

    const newRide = {
      id: generatedId,
      driverId: pendingDriver.id,
      driverName: pendingDriver.name,
      status: 'requesting' as const,
      origin: 'Sede Bezerros (KM 102)',
      destination: pendingDriver.route.split('↔')[1]?.trim() || 'Distritos',
      totalFare: parseFloat(calculatedRate.toFixed(2)),
      paymentMethod: selectedPaymentMethod,
      gamification: gamificationVal
    };

    setIsSyncingState(true);
    setWatchdogFired(false);

    let watchdogTimeout: any = null;

    const watchdogPromise = new Promise<never>((_, reject) => {
      watchdogTimeout = setTimeout(() => {
        setWatchdogFired(true);
        setIsSyncingState(false);
        setSyncToastMessage('Conexão oscilante. Operando com dados locais salvos.');
        setShowSyncToast(true);
        reject(new Error('TIMEOUT'));
      }, 10000);
    });

    try {
      const writePromise = async () => {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const rideRef = doc(db, 'mototaxi_rides', generatedId);
        
        await setDoc(rideRef, {
          ...newRide,
          pricingProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        if (watchdogTimeout) clearTimeout(watchdogTimeout);
        setIsSyncingState(false);
      };

      await Promise.race([writePromise(), watchdogPromise]);

      setActiveRide(newRide);
      setDrivers(prev => prev.map(d => d.id === pendingDriver.id ? { ...d, status: 'busy' } : d));
      setShowPaymentModal(false);
      setPendingRideDriver(null);

    } catch (err: any) {
      console.warn('[Dispatch Fallback Ativado] Sincronização offline local tolerada:', err);
      // Fallback local instantâneo
      setActiveRide(newRide);
      setDrivers(prev => prev.map(d => d.id === pendingDriver.id ? { ...d, status: 'busy' } : d));
      setShowPaymentModal(false);
      setPendingRideDriver(null);
    }
  };

  // Transição 1: Muda status da corrida ativa para 'completed' para travar o Cockpit de Avaliação do Piloto
  const handleCompleteRide = async () => {
    if (!activeRide) return;

    const breakdownResult = calculateEarningsBreakdown(activeRide.totalFare);
    const baseDistance = parseFloat((activeRide.totalFare / 2.0).toFixed(1));
    const gamificationResult = calculateRideIP(baseDistance, activeRide.paymentMethod);

    setActiveRide(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'completed',
        gamification: gamificationResult,
        breakdown: breakdownResult
      };
    });
  };

  // Transição 2: Coleta avaliações mútuas, executa o Batch Write atômico e arquiva a corrida
  const handleFinalizeEvaluation = async (
    pilotFb: {
      rating: number;
      punctuality: boolean;
      cordiality: boolean;
      pillionSafety: boolean;
    },
    passengerFb: {
      rating: number;
      comment?: string;
    }
  ) => {
    if (!activeRide) return;

    const passengerId = user?.uid || 'MOCK-PASSENGER-123';
    const driverId = activeRide.driverId;
    const rideId = activeRide.id;

    const baseDistance = parseFloat((activeRide.totalFare / 2.0).toFixed(1));
    const gamificationResult = calculateRideIP(baseDistance, activeRide.paymentMethod, pilotFb);
    const breakdownResult = activeRide.breakdown || calculateEarningsBreakdown(activeRide.totalFare);

    const finalizedRide = {
      ...activeRide,
      status: 'completed' as const,
      passengerFeedback: passengerFb,
      pilotFeedback: pilotFb,
      gamification: gamificationResult,
      breakdown: breakdownResult,
      isArchived: true
    };

    // Persistência Atômica via writeBatch (Firebase V9)
    try {
      const batch = writeBatch(db);

      // A) Atualizar o IP e a Reputação no documento do Passenger (users/{passengerId})
      const passengerRef = doc(db, 'users', passengerId);
      const meritContribution = parseFloat((gamificationResult.ipPointsEarned * 0.65).toFixed(2));
      const assocContribution = parseFloat((gamificationResult.ipPointsEarned * 0.35).toFixed(2));

      batch.update(passengerRef, {
        'stats.ip': increment(gamificationResult.ipPointsEarned),
        'stats.merit': increment(meritContribution),
        'stats.associationForce': increment(assocContribution),
        'stats.reputation': increment(pilotFb.rating * 0.05), // Valorização social acumulada
        updatedAt: serverTimestamp()
      });

      // B) Atualizar a Reputação no documento do Driver (users/{driverId})
      const driverRef = doc(db, 'users', driverId);
      batch.update(driverRef, {
        'stats.reputation': increment(passengerFb.rating * 0.05),
        updatedAt: serverTimestamp()
      });

      // C) Atualizar o documento da corrida (mototaxi_rides/{rideId}) carimbando isArchived: true
      const rideRef = doc(db, 'mototaxi_rides', rideId);
      batch.set(rideRef, {
        id: rideId,
        passengerId,
        driverId,
        driverName: activeRide.driverName,
        origin: activeRide.origin,
        destination: activeRide.destination,
        totalFare: activeRide.totalFare,
        paymentMethod: activeRide.paymentMethod,
        passengerFeedback: passengerFb,
        pilotFeedback: pilotFb,
        gamification: gamificationResult,
        breakdown: breakdownResult,
        isArchived: true,
        createdAt: serverTimestamp()
      }, { merge: true });

      await batch.commit();
      console.log(`[Batch Commit Success] Ride ${rideId} archived. Passenger and Pilot rep updated.`);
    } catch (err) {
      console.warn("[Batch Write Warning] Limited Firestore rules or offline fallback simulated successfully:", err);
    }

    // Registra no histórico local
    setRideHistory(prev => [
      {
        id: finalizedRide.id,
        driverId: finalizedRide.driverId,
        driverName: finalizedRide.driverName,
        date: new Date(),
        origin: finalizedRide.origin,
        destination: finalizedRide.destination,
        totalFare: finalizedRide.totalFare,
        paymentMethod: finalizedRide.paymentMethod,
        passengerFeedback: passengerFb,
        pilotFeedback: pilotFb,
        gamification: gamificationResult,
        breakdown: breakdownResult,
        isArchived: true
      },
      ...prev
    ]);

    // Retorna o piloto ao status "online", incrementa corridas, acumula reputação e melhora o IP dele
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const currentRides = d.rides;
        const nextRating = parseFloat(((d.rating * currentRides + passengerFb.rating) / (currentRides + 1)).toFixed(2));
        return {
          ...d,
          status: 'online',
          rides: d.rides + 1,
          rating: nextRating,
          ip: Math.min(100, parseFloat((d.ip + 0.5).toFixed(1)))
        };
      }
      return d;
    }));

    // Mantém a corrida na tela como completed para exibir o painel de resultados com feedbacks
    setActiveRide(finalizedRide);
  };
  
  // Resgata velocidade real via Geolocation API usando o Guardião de Velocidade Integrado
  const { speed: actualSpeed } = useSpeedGuard(15);

  // Reconciliação em Tempo Real: isMoving ativo se velocidade real ou simulada exceder 15 km/h
  const isMoving = useMemo(() => {
    return simulatedSpeed > 15 || actualSpeed > 15;
  }, [simulatedSpeed, actualSpeed]);

  // Event Loop Ativo: Simulação de Telemetria Contínua dos Operadores de Moto-Táxi
  useEffect(() => {
    if (!isLiveTelemetryActive) return;

    const interval = setInterval(() => {
      setDrivers(prevDrivers => 
        prevDrivers.map(dr => {
          // Incrementa ou rotaciona o progresso da viagem simuladamente para dar sensação de vida ao ecossistema
          let nextProgress = dr.progress + (Math.random() * 0.04 - 0.02);
          if (nextProgress > 0.95) nextProgress = 0.1;
          if (nextProgress < 0.05) nextProgress = 0.9;
          
          return {
            ...dr,
            progress: parseFloat(nextProgress.toFixed(3))
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveTelemetryActive]);

  // Sincroniza o motorista selecionado para refletir a telemetria atualizada
  useEffect(() => {
    if (selectedDriver) {
      const updated = drivers.find(d => d.id === selectedDriver.id);
      if (updated) {
        setSelectedDriver(updated);
      }
    }
  }, [drivers, selectedDriver?.id]);

  // Auto-hide SyncToast after 5 seconds
  useEffect(() => {
    if (showSyncToast) {
      const timer = setTimeout(() => {
        setShowSyncToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSyncToast]);

  // Altera o plano de assinatura (Tier) do piloto selecionado para simular o feature gating
  const handleChangeSelectedDriverTier = (tier: 'bronze' | 'prata' | 'ouro') => {
    if (!selectedDriver) return;
    setDrivers(prev => prev.map(d => {
      if (d.id === selectedDriver.id) {
        return { ...d, planTier: tier };
      }
      return d;
    }));
  };

  // Filtra motoristas por tipo e busca
  const filteredDrivers = useMemo(() => {
    return drivers.filter(dr => {
      const matchesSearch = dr.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            dr.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            dr.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeFilter === 'all') return matchesSearch;
      return matchesSearch && dr.driverType === activeFilter;
    });
  }, [drivers, activeFilter, searchQuery]);

  // Calcula estatísticas gerais de operação baseadas no catálogo semente
  const statsOverview = useMemo(() => {
    const totalCount = drivers.length;
    const avgIp = drivers.reduce((acc, current) => acc + current.ip, 0) / totalCount;
    const onlineCount = drivers.filter(d => d.status === 'online').length;
    return {
      totalCount,
      avgIp: parseFloat(avgIp.toFixed(1)),
      onlineCount
    };
  }, [drivers]);

  // Custo base corporativo por corrida de Moto-Táxi (Fallback geral)
  const BASE_RIDE_RATE = 12.50;

  // Calculador síncrono de repartição do motor tarifário (pricingEngine.ts) baseado em perfil individual
  const financialMetrics = useMemo(() => {
    if (!selectedDriver) {
      return {
        receitaBruta: 0,
        fundoManutencao: 0,
        fundoReserva: 0,
        lucroReal: 0
      };
    }
    // Preço derivado do pricingProfile INDIVIDUAL de cada piloto (baseFare + pricePerKm * 10.5)
    const individualRate = calculateIndividualRideRate(selectedDriver.baseFare, selectedDriver.pricePerKm, 10.5, isExtraRateActive);
    return calculateRates(individualRate, isExtraRateActive, selectedDriver.rides);
  }, [selectedDriver, isExtraRateActive]);

  // Função para abrir canal direto via link técnico (WhatsApp) se estiver estacionado
  const handleContactDriver = (driver: Driver) => {
    if (isMoving) return;
    // Link padrão de contato de urgência/solicitação direta
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${driver.phone}&text=Olá,%20solicito%20atendimento%20de%20Moto-Táxi%20Elite%20na%20BR-232.%20Operador:%20${encodeURIComponent(driver.name)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div id="mototaxi-dashboard-viewport" className="min-h-screen bg-[#05100a] text-slate-100 pb-24 relative select-none">
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
      
      {/* Banner Superior Fixo de Segurança Ativa (Safety Guard) - Sem Ocultar a Interface */}
      <AnimatePresence>
        {isMoving && (
          <motion.div 
            id="safety-guard-fixed-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-[72px] z-40 bg-[#1f150c] border-b border-amber-500/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(245,158,11,0.05)] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <ShieldAlert size={20} className="animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  Modo Viagem Ativado <span className="size-2 bg-amber-500 rounded-full animate-ping"></span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">
                  Velocidade excedeu <span className="text-amber-500 font-bold">15 km/h</span>. Interações manuais desabilitadas por segurança, de acordo com o protocolo ECOBR232.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                VELOCIDADE: {Math.round(simulatedSpeed || actualSpeed)} KM/H
              </span>
              <button 
                id="btn-safety-bypass"
                onClick={() => setSimulatedSpeed(0)}
                className="px-3 py-1.5 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-all font-sans"
              >
                Simular Parada
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header de Telemetria Rodoviária */}
        <div id="dashboard-header-block" className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 rounded border border-[#00E676]/10">
                Módulo Operacional Ativo
              </span>
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
                Reconciliação Estável
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
              Moto-Táxi <span className="text-[#00E676] italic">Elite</span>
            </h1>
            <p className="text-slate-400 text-xs font-sans max-w-xl">
              Sistema de monitoramento e reputação de mototaxistas autorizados ao longo do corredor da rodovia BR-232, integrando telemetria avançada de tráfego.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate('/moto-taxi/planos')}
              className="px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl bg-gradient-to-r from-emerald-600 to-[#00E676] hover:from-emerald-500 hover:to-[#00c85c] text-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,198,83,0.15)] font-mono"
            >
              <Coins size={11} fill="currentColor" />
              Planos de Gestão Elite
            </button>

            <button
              id="btn-toggle-engine"
              onClick={() => setIsLiveTelemetryActive(!isLiveTelemetryActive)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all flex items-center gap-2 ${
                isLiveTelemetryActive 
                  ? 'bg-[#0c1a14] border-[#00E676]/30 text-[#00E676]' 
                  : 'bg-white/2 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw size={12} className={isLiveTelemetryActive ? "animate-spin" : ""} />
              {isLiveTelemetryActive ? "Telemetria Conectada" : "Telemetria Pausada"}
            </button>
          </div>
        </div>

        {/* Painel de Índices e Métricas Operacionais */}
        <div id="stats-dashboard-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-7 bg-[#0c1a14] border border-white/5 rounded-2xl flex items-center gap-5 relative overflow-hidden group">
            <div className="size-14 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] shrink-0">
              <Users size={22} />
            </div>
            <div className="text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00E676]/80">Pilotos Monitorados</span>
              <div className="font-mono text-2xl font-black mt-0.5 text-slate-100">{statsOverview.totalCount} Operadores</div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Rotas de Alimentação Distrital</span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00E676]/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          </div>

          <div className="p-7 bg-[#0c1a14] border border-white/5 rounded-2xl flex items-center gap-5 relative overflow-hidden group">
            <div className="size-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <TrendingUp size={22} />
            </div>
            <div className="text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">IP Médio de Linha</span>
              <div className="font-mono text-2xl font-black mt-0.5 text-purple-300">{statsOverview.avgIp}% Mínimo</div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Reputação e Mérito Ativo</span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          </div>

          <div className="p-7 bg-[#0c1a14] border border-white/5 rounded-2xl flex items-center gap-5 relative overflow-hidden group">
            <div className="size-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock size={22} />
            </div>
            <div className="text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Status Operacional</span>
              <div className="font-mono text-2xl font-black mt-0.5 text-emerald-300">{statsOverview.onlineCount} Ativos</div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Prontos para chamada rodoviária</span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          </div>
        </div>

        {/* Layout de 3 Colunas: Grid CSS Principal */}
        <div id="main-dashboard-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Coluna de Telemetria e Radar (Majestosa - lg:col-span-2) */}
          <div id="radar-section" className="lg:col-span-2 space-y-6">
            
            {/* Bloco de Radar e Mapa Rodoviário */}
            <div id="radar-card" className="bg-[#0c1a14] border border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col min-h-[460px]">
              
              {/* Overlay Grid e Radar Scan Line */}
              <div className="absolute inset-0 bg-[radial-gradient(#12261a_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
              
              {/* Cabeçalho do Cartão */}
              <div className="flex items-center justify-between z-10 border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-3 bg-emerald-500 rounded-full animate-ping"></div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#00E676] italic">Monitoramento BR-232</h3>
                    <p className="text-[9px] font-mono text-slate-500">RECONCILIAÇÃO DE VELOCIDADE EM REAL-TIME</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest">RAIO DE SEGURANÇA: 100KMs</span>
                </div>
              </div>

              {/* Mapa de Rota Interativo Baseado em SVG Inteligente */}
              <div id="radar-svg-container" className="flex-1 w-full relative bg-[#070e0a] rounded-2xl border border-white/5 overflow-hidden min-h-[280px]">
                {/* Sweep Circular de Radar Fictício no fundo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <div className="w-[120%] h-[120%] border border-emerald-500/20 rounded-full animate-spin [animation-duration:15s] flex items-center justify-around">
                    <div className="w-1/2 h-0.5 bg-gradient-to-r from-emerald-500/40 to-transparent transform origin-right rotate-45"></div>
                  </div>
                  <div className="absolute w-[80%] h-[80%] border border-emerald-500/15 rounded-full"></div>
                  <div className="absolute w-[40%] h-[40%] border border-emerald-500/10 rounded-full"></div>
                </div>

                <svg 
                  className="w-full h-full min-h-[280px]" 
                  viewBox="0 0 850 300" 
                  preserveAspectRatio="xMidYMid slice"
                >
                  {/* Definição de Gradientes e Filtros de Brilho */}
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="gradient-highway" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0a2a1b" />
                      <stop offset="50%" stopColor="#00E676" />
                      <stop offset="100%" stopColor="#023b1e" />
                    </linearGradient>
                  </defs>

                  {/* DESENHO DA RODOVIA PRINCIPAL BR-232 (Tronco Longitudinal) */}
                  <path 
                    d="M 50 150 Q 250 120 450 150 T 800 150" 
                    fill="none" 
                    stroke="url(#gradient-highway)" 
                    strokeWidth="8" 
                    offset="0.5"
                    className="opacity-40"
                  />
                  <path 
                    d="M 50 150 Q 250 120 450 150 T 800 150" 
                    fill="none" 
                    stroke="#00E676" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,8"
                    className="animate-[dash_20s_linear_infinite]"
                  />

                  {/* BRANCHES (RAMIFICAÇÕES DISTRITAIS REAIS DA TABELA) */}
                  {/* Rota 3: Gravatá to Mandacaru / Russinhas Distrital Path */}
                  <path 
                    d="M 420 150 Q 450 180 490 220" 
                    fill="none" 
                    stroke="#00E676" 
                    strokeWidth="3" 
                    strokeDasharray="2,5"
                    className="opacity-45"
                  />
                  {/* Rota 4: Bezerros to Serra Negra Distrital Path */}
                  <path 
                    d="M 580 150 Q 610 180 640 240" 
                    fill="none" 
                    stroke="#00E676" 
                    strokeWidth="3" 
                    strokeDasharray="2,5"
                    className="opacity-45"
                  />
                  {/* Rota 5: Caruaru to Lajedo do Cedro Path */}
                  <path 
                    d="M 740 150 L 740 240" 
                    fill="none" 
                    stroke="#00E676" 
                    strokeWidth="3" 
                    strokeDasharray="2,5"
                    className="opacity-45"
                  />

                  {/* CIDADES MARCADORAS DE SEDE (NODES DA BR-232 EXPANDIDA) */}
                  {[
                    { x: 50, label: "Recife" },
                    { x: 110, label: "Jaboatão" },
                    { x: 175, label: "Moreno" },
                    { x: 235, label: "Vitória S. Antão" },
                    { x: 295, label: "Pombos" },
                    { x: 355, label: "Gravatá" },
                    { x: 415, label: "Bezerros" },
                    { x: 475, label: "Caruaru" },
                    { x: 535, label: "São Caetano" },
                    { x: 600, label: "Pesqueira" },
                    { x: 665, label: "Arcoverde" },
                    { x: 730, label: "Serra Talhada" },
                    { x: 800, label: "Salgueiro" }
                  ].map((node, index) => (
                    <g key={index} className="cursor-pointer">
                      <circle cx={node.x} cy="150" r="7" fill="#05100a" stroke="#00E676" strokeWidth="2" filter="url(#glow)" />
                      <circle cx={node.x} cy="150" r="3" fill="#00E676" />
                      <text 
                        x={node.x} 
                        y="130" 
                        textAnchor="middle" 
                        fill="#94a3b8" 
                        className="text-[8px] font-black uppercase tracking-wider font-mono select-none pointer-events-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  ))}

                  {/* DISTRITOS SECUNDÁRIOS */}
                  {[
                    { x: 490, y: 220, label: "Mandacaru Distritos" },
                    { x: 640, y: 240, label: "Serra Negra" },
                    { x: 740, y: 240, label: "Lajedo do Cedro" }
                  ].map((dist, index) => (
                    <g key={index} className="cursor-pointer">
                      <circle cx={dist.x} cy={dist.y} r="5" fill="#0c1a14" stroke="#00e66b" strokeWidth="1.5" />
                      <text 
                        x={dist.x + 10} 
                        y={dist.y + 4} 
                        textAnchor="start" 
                        fill="#64748b" 
                        className="text-[8px] font-bold uppercase font-mono tracking-widest pointer-events-none"
                      >
                        {dist.label}
                      </text>
                    </g>
                  ))}

                  {/* PILOTOS ATIVOS PLOTADOS NO RADAR */}
                  {filteredDrivers.map(dr => {
                    // Calcula coordenadas intermediárias com base no progresso na rota
                    let cx = dr.coords.x;
                    let cy = dr.coords.y;

                    // Ajuste sutil na tela com base no progress simulado
                    if (dr.id === "MT-811") {
                      cx = 100 + (dr.progress * 150); 
                      cy = 150;
                    } else if (dr.id === "MT-812") {
                      cx = 250 + (dr.progress * 170); 
                      cy = 150;
                    } else if (dr.id === "MT-813") {
                      cx = 420 + (dr.progress * 70); 
                      cy = 150 + (dr.progress * 70);
                    } else if (dr.id === "MT-814") {
                      cx = 580 + (dr.progress * 60); 
                      cy = 150 + (dr.progress * 90);
                    } else if (dr.id === "MT-815") {
                      cx = 740;
                      cy = 150 + (dr.progress * 90);
                    }

                    const isSelected = selectedDriver?.id === dr.id;

                    return (
                      <g 
                        key={dr.id} 
                        className="cursor-pointer group/pin"
                        onClick={() => setSelectedDriver(dr)}
                      >
                        {/* Círculo de pulso elástico para destaque visual */}
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isSelected ? "18" : "12"} 
                          fill="transparent" 
                          stroke="#00E676" 
                          strokeWidth="1" 
                          className="animate-ping [animation-duration:2.5s]" 
                          opacity={isSelected ? 0.7 : 0.25}
                        />

                        {/* Círculo de base do motorista */}
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isSelected ? "10" : "7"} 
                          fill={isSelected ? "#00E676" : "#05100a"} 
                          stroke={isSelected ? "#fff" : "#00E676"} 
                          strokeWidth={isSelected ? "2.5" : "1.5"} 
                          className="transition-all duration-350"
                        />

                        {/* Rótulo de Identificação do Piloto */}
                        <text 
                          x={cx} 
                          y={cy - 16} 
                          textAnchor="middle" 
                          fill={isSelected ? "#00E676" : "#ffffff"} 
                          className="text-[8px] font-black font-mono tracking-wider bg-black/60 px-1 py-0.5 rounded pointer-events-none"
                        >
                          {dr.name.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legendas Básicas do Radar */}
                <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/4">
                  <div className="flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-widest text-[#94a3b8]">
                    <span className="w-5 h-1 bg-[#00E676] rounded block"></span>
                    BR-232 Tronco
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-widest text-[#94a3b8]">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-[#00e66b]/60 block"></span>
                    Distritais
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-widest text-[#94a3b8]">
                    <span className="size-2 rounded-full bg-emerald-500 block"></span>
                    Sede Operacional
                  </div>
                </div>
              </div>

              {/* Informações de Telemetria Detalhada do Operador Selecionado */}
              <AnimatePresence mode="wait">
                {selectedDriver ? (
                  <motion.div 
                    id="selected-driver-telemetry-panel"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="mt-6 p-8 bg-[#08120b] border border-[#00E676]/10 rounded-2xl flex flex-col gap-6 relative"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-start md:items-center gap-4">
                        {/* Avatar do Operador */}
                        <div className={`size-14 rounded-full flex items-center justify-center font-black text-sm uppercase shrink-0 ${selectedDriver.avatarColor}`}>
                          {selectedDriver.name[0]}
                          {selectedDriver.name.split(' ').slice(-1)[0][0]}
                        </div>
                        
                        <div className="text-left space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-black italic uppercase leading-none">{selectedDriver.name}</h4>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              selectedDriver.driverType === 'associated' 
                                ? 'bg-[#00c853]/15 text-[#00c853] border-[#00c853]/30' 
                                : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                            }`}>
                              {selectedDriver.driverType === 'associated' ? 'Credenciado Associação' : 'Elite Autônomo'}
                            </span>
                            
                            {/* Emblema Dinâmico de Plano de Assinatura */}
                            {selectedDriver.planTier === 'ouro' && (
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/35 text-yellow-400 animate-pulse">
                                ★ Plano Ouro Elite
                              </span>
                            )}
                            {selectedDriver.planTier === 'prata' && (
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-400/15 border border-slate-400/25 text-slate-300">
                                ◆ Plano Prata
                              </span>
                            )}
                            {selectedDriver.planTier === 'bronze' && (
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-700/10 border border-amber-700/20 text-amber-500">
                                ● Plano Bronze
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-slate-400 font-medium font-sans mt-1">
                            Rota ativa: <span className="text-[#00E676] font-bold">{selectedDriver.route}</span>
                          </p>
                          
                          {/* Telemetria e IP */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[9px] font-mono uppercase tracking-widest pt-1">
                            <span className="flex items-center gap-1">
                              <Gauge size={10} className="text-[#00E676]" /> {selectedDriver.vehicle} | {selectedDriver.plate}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Star size={10} fill="currentColor" className="text-yellow-500" /> {selectedDriver.rating}
                            </span>
                            <span>•</span>
                            <span className="text-[#00e66b] font-black">
                              {selectedDriver.ip}% IP (MÉRECO)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divisor Separador */}
                    <div className="h-px bg-white/5 w-full"></div>

                    {/* Botões de Ação para o Piloto Redesenhados como Linhas Distintas (Padrão Rubi) */}
                    <div className="flex flex-col gap-4 w-full">
                      
                      {/* Linha 1: Seleção de Adicional Dinâmico */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 p-4 rounded-xl border border-white/5 w-full">
                        <div className="text-left space-y-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">BANDA TARIFÁRIA DINÂMICA (REGIONAL)</span>
                          <p className="text-[8.5px] text-slate-500 font-sans">Ative a tarifa dinâmica Noturno/Rural (+30%) para bonificar trajetos de extrema dificuldade na rodovia.</p>
                        </div>
                        
                        <div className="shrink-0">
                          {selectedDriver.planTier === 'bronze' ? (
                            <div className="flex items-center gap-1">
                              <button
                                disabled
                                className="px-3 py-1.5 rounded-lg bg-white/2 border border-white/5 opacity-50 cursor-not-allowed text-[8px] font-black uppercase tracking-widest text-[#00E676] flex items-center gap-1.5 transition-all"
                                title="Disponível apenas para os Planos Prata e Ouro"
                              >
                                <Lock size={12} className="text-amber-500 shrink-0" />
                                <span className="text-amber-500 font-sans text-[7px] italic leading-none">(Exclusivo Prata/Ouro)</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsExtraRateActive(!isExtraRateActive)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${
                                isExtraRateActive
                                  ? 'bg-[#00E676] text-black shadow-[0_0_10px_rgba(0,230,118,0.2)]'
                                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                              }`}
                            >
                              {isExtraRateActive ? <Unlock size={11} className="shrink-0" /> : <Lock size={11} className="shrink-0" />}
                              {isExtraRateActive ? 'ADICIONAL ATIVO' : 'ATIVAR ADICIONAL'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Linha 2: Contato Síncrono */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 p-4 rounded-xl border border-white/5 w-full">
                        <div className="text-left space-y-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">COMUNICAÇÃO DIRETAMENTE PROTOCOLADA</span>
                          <p className="text-[8.5px] text-slate-500 font-sans">Abra o terminal de comunicação externa segura para contatar o piloto síncronamente via WhatsApp.</p>
                        </div>
                        <div className="shrink-0">
                          <button 
                            id={`btn-contact-${selectedDriver.id}`}
                            disabled={isMoving}
                            onClick={() => handleContactDriver(selectedDriver)}
                            className={`h-11 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                              isMoving 
                                ? 'bg-slate-900 border-white/5 text-slate-500 cursor-not-allowed' 
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95'
                            }`}
                            title={isMoving ? "Interações desabilitadas em trânsito" : "Abrir canal direto de contato síncrono"}
                          >
                            <Phone size={12} /> CONTATAR CANAL DIRETAMENTE
                          </button>
                        </div>
                      </div>

                      {/* Linha 3: Gerenciamento da Corrida / Solicitação de Trajeto */}
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border w-full ${
                        activeRide && activeRide.driverId === selectedDriver.id
                          ? 'bg-[#0a1811] border-emerald-500/20'
                          : 'bg-[#0d2e1b] border-[#00E676]/20'
                      }`}>
                        {activeRide && activeRide.driverId === selectedDriver.id ? (
                          <>
                            <div className="text-left space-y-0.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-[#00E676]">CORRIDA ATIVA • REQUISITADA</span>
                              <p className="text-[8.5px] text-emerald-500/80 font-sans">Canal de liquidação ativo via {
                                activeRide.paymentMethod === 'eco_wallet' ? 'Carteira BR-232' :
                                activeRide.paymentMethod === 'pix' ? 'Pix Transacional' :
                                activeRide.paymentMethod === 'cash' ? 'Dinheiro Físico' : 'Cartão de Crédito'
                              }.</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                              {activeRide.status === 'requesting' && (
                                <>
                                  <span className="text-[8px] font-mono font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-center">
                                    Aguardando Início
                                  </span>
                                  <button
                                    disabled={isSyncingState}
                                    onClick={() => handleStateTransition('in_progress')}
                                    className="h-10 px-5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[9px] tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                  >
                                    {isSyncingState ? (
                                      <>
                                        <RefreshCw size={11} className="animate-spin animate-flicker" />
                                        Sincronizando...
                                      </>
                                    ) : (
                                      <>
                                        <Play size={11} fill="currentColor" /> Iniciar Trajeto
                                      </>
                                    )}
                                  </button>
                                  {watchdogFired && (
                                    <button
                                      onClick={() => {
                                        setActiveRide(null);
                                        setDrivers(prev => prev.map(d => d.id === activeRide.driverId ? { ...d, status: 'online' } : d));
                                        setWatchdogFired(false);
                                        setIsSyncingState(false);
                                        setSyncToastMessage('Operação cancelada de forma offline-first.');
                                        setShowSyncToast(true);
                                      }}
                                      className="h-10 px-4 bg-red-650 hover:bg-red-600 text-white font-mono font-black uppercase text-[8px] tracking-widest rounded-xl border border-red-500/30 transition-all flex items-center justify-center gap-1 active:scale-95"
                                    >
                                      Recuperação Manual / Cancelar Despacho
                                    </button>
                                  )}
                                </>
                              )}

                              {activeRide.status === 'in_progress' && (
                                <>
                                  <span className="text-[8px] font-mono font-black text-[#00E676] uppercase tracking-widest bg-[#00E676]/10 border border-[#00E676]/20 px-3 py-2 rounded-xl text-center flex items-center gap-2 justify-center">
                                    <span className="size-1.5 rounded-full bg-[#00E676] animate-pulse"></span> Em Trânsito
                                  </span>
                                  <button
                                    onClick={handleCompleteRide}
                                    className="h-10 px-5 bg-red-500 hover:bg-red-400 text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                  >
                                    <Pause size={11} fill="currentColor" /> Finalizar Corrida
                                  </button>
                                </>
                              )}

                              {activeRide.status === 'completed' && (
                                <button
                                  onClick={() => {
                                    setActiveRide(null);
                                  }}
                                  className="h-10 px-5 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-black uppercase text-[9px] tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                  Nova Corrida / Liberar Piloto
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-left space-y-0.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-[#00E676]">SOLICITAÇÃO DE CORRIDA IMEDIATA</span>
                              <p className="text-[8.5px] text-emerald-500/80 font-sans">Despache e inicie uma corrida integrada com a rede regional de Bezerros com zero taxa de intermediação central.</p>
                            </div>
                            
                            <div className="shrink-0">
                              <button 
                                id={`btn-request-${selectedDriver.id}`}
                                disabled={isMoving || selectedDriver.status === 'busy'}
                                onClick={() => {
                                  if (!isMoving && selectedDriver.status !== 'busy') {
                                    setPendingRideDriver(selectedDriver);
                                    setShowPaymentModal(true);
                                  }
                                }}
                                className={`h-11 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                  isMoving 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                    : selectedDriver.status === 'busy'
                                      ? 'bg-red-500/10 border border-red-500/20 text-red-400/70 cursor-not-allowed'
                                      : 'bg-[#00E676] text-black hover:bg-[#00c85c] active:scale-95'
                                }`}
                              >
                                <Zap size={12} fill="currentColor" /> 
                                {selectedDriver.status === 'busy' ? "Ocupado" : "SOLICITAR CORRIDA AGORA"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-6 p-12 bg-[#08120b] border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-slate-500 text-xs italic">
                    Selecione um mototaxista no radar para acessar a telemetria em tempo real.
                  </div>
                )}
              </AnimatePresence>

              {/* COCKPIT DO PILOTO - RAIO-X FINANCEIRO (PPI-TRANCAR COMPLIANT) */}
              <AnimatePresence mode="wait">
                {selectedDriver && (
                  <motion.div
                    id="pilot-cockpit-finance-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="mt-6 bg-[#0c1a14] border border-white/5 rounded-[2rem] p-6 text-left space-y-6 animate-pulse-subtle"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
                          <Layers size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-[#00E676] italic">Cockpit do Piloto: Raio-X Financeiro</h3>
                          <p className="text-[9px] font-mono text-slate-500">MOTO-TÁXI ELITE - REPARTIÇÃO E DETALHAMENTO DE POTES</p>
                        </div>
                      </div>

                      {/* Simulador Interativo de Assinatura para Homologação */}
                      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                        <span className="text-[8px] font-black uppercase text-slate-500 px-2 font-mono">Alterar Plano:</span>
                        {(['bronze', 'prata', 'ouro'] as const).map(tier => (
                          <button
                            key={tier}
                            onClick={() => handleChangeSelectedDriverTier(tier)}
                            className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${
                              selectedDriver.planTier === tier
                                ? tier === 'ouro'
                                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                  : tier === 'prata'
                                    ? 'bg-slate-400/20 text-slate-200 border border-slate-400/30'
                                    : 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grid Principal Financeiro com Maior Espaçamento (Padrão Rubi) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Receita Bruta - Visível para TODOS os planos */}
                      <div className="p-6 bg-[#070f0b] border border-white/5 rounded-2xl flex flex-col justify-between h-36">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#00E676]">Receita Bruta</span>
                          <p className="text-[8.5px] text-slate-500 font-sans leading-none">Total acumulado</p>
                        </div>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-xs font-mono text-slate-500">R$</span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-slate-200 truncate">
                            {financialMetrics.receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Potes Financeiros / Inteligência Restrita - Exclusivos Ouro */}
                      {selectedDriver.planTier === 'ouro' ? (
                        <>
                          {/* Fundo de Manutenção (15%) */}
                          <div className="p-6 bg-[#070f0b] border border-yellow-500/20 rounded-2xl flex flex-col justify-between h-36">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">Fundo Manutenção</span>
                                <span className="text-[8px] font-sans text-yellow-400/90 bg-yellow-500/10 px-1.5 py-0.5 rounded font-black">15%</span>
                              </div>
                              <p className="text-[8.5px] text-slate-500 font-sans leading-none flex gap-1">Reservado p/ desgaste</p>
                            </div>
                            <div className="mt-4 flex items-baseline gap-1">
                              <span className="text-xs font-mono text-slate-500">R$</span>
                              <span className="text-lg sm:text-xl font-black font-mono text-yellow-400/90 truncate">
                                {financialMetrics.fundoManutencao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Fundo de Reserva (10%) */}
                          <div className="p-6 bg-[#070f0b] border border-purple-500/20 rounded-2xl flex flex-col justify-between h-36">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Fundo Reserva</span>
                                <span className="text-[8px] font-sans text-purple-400/80 bg-purple-500/10 px-1.5 py-0.5 rounded font-black">10%</span>
                              </div>
                              <p className="text-[8.5px] text-slate-500 font-sans leading-none">Reserva BR-232 & SOS</p>
                            </div>
                            <div className="mt-4 flex items-baseline gap-1">
                              <span className="text-xs font-mono text-slate-500">R$</span>
                              <span className="text-lg sm:text-xl font-black font-mono text-purple-300 truncate">
                                {financialMetrics.fundoReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Lucro Real (75%) */}
                          <div className="p-6 bg-[#0c2418] border border-[#00E676]/30 rounded-2xl flex flex-col justify-between h-36 shadow-[0_4px_20px_rgba(0,230,118,0.05)]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#00E676]">Lucro Real</span>
                                <span className="text-[8px] font-sans text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded font-black">75% LÍQUIDO</span>
                              </div>
                              <p className="text-[8.5px] text-slate-500 font-sans leading-none">Capital líquido real</p>
                            </div>
                            <div className="mt-4 flex items-baseline gap-1">
                              <span className="text-xs font-mono text-slate-500">R$</span>
                              <span className="text-xl sm:text-2xl font-black font-mono text-[#00E676] drop-shadow-[0_0_6px_rgba(0,230,118,0.3)] truncate">
                                {financialMetrics.lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Se for bronze ou prata: Renderiza apenas a Receita Bruta, e ao lado o Upsell Promo */
                        <div className="md:col-span-3 bg-[#06120b]/80 backdrop-blur-sm rounded-2xl border border-white/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden opacity-90 min-h-36">
                          {/* Efeito Borrado/Glassmorphism */}
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-20 pointer-events-none"></div>
                          
                          <div className="flex items-start gap-3 text-left">
                            <div className="size-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 mt-0.5">
                              <Lock size={14} />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-yellow-500">Recurso Corporativo Restrito</h4>
                              <p className="text-[11px] text-slate-300 font-sans font-medium leading-tight">
                                Desbloqueie o cálculo de Lucro Real e Fundos de Manutenção com o Plano Ouro
                              </p>
                              <p className="text-[9px] text-slate-500 font-sans leading-tight">
                                Monitore com exatidão o fundo preventivo do seu veículo e proteja suas margens na BR-232.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleChangeSelectedDriverTier('ouro')}
                            className="w-full sm:w-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all font-sans whitespace-nowrap active:scale-95 flex items-center justify-center gap-1"
                          >
                            <Unlock size={10} /> Upgrade para Ouro
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PAINEL DE RESULTADOS DA CORRIDA (RESUMO DE CORRIDA FINALIZADA) */}
              <AnimatePresence mode="wait">
                {activeRide && selectedDriver && activeRide.driverId === selectedDriver.id && activeRide.status === 'completed' && activeRide.breakdown && (
                  <motion.div
                    id="race-results-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mt-6 bg-gradient-to-br from-[#0c2e1b] to-[#071911] border-2 border-[#00E676]/40 rounded-[2rem] p-6 text-left space-y-4 shadow-[0_8px_32px_rgba(0,230,118,0.1)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E676]/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                      <div className="size-8 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#00E676] italic">Resultados da Corrida</h3>
                        <p className="text-[8px] font-mono text-slate-500 uppercase">Fórmula de Alocação Síncrona • ID: {activeRide.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Net Profit - Maior Destaque Visual */}
                      <div className="bg-black/40 border border-[#00E676]/35 rounded-2xl p-4 flex flex-col justify-between md:col-span-2 relative shadow-inner">
                        <div className="absolute top-3 right-3 bg-[#00E676]/15 text-[#00E676] px-2.5 py-0.5 rounded-full font-mono text-[7px] font-black uppercase tracking-widest border border-[#00E676]/20">
                          Lucro Líquido Real ~70%
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#00E676]">Net Profit (Lucro Real)</span>
                          <p className="text-[10px] text-slate-400">Parcela limpa destinada ao saldo financeiro direto do piloto.</p>
                        </div>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-xl font-black font-mono text-[#00E676]">R$</span>
                          <span className="text-4xl font-black font-mono text-[#00E676] tracking-tight drop-shadow-[0_0_12px_rgba(0,230,118,0.4)]">
                            {activeRide.breakdown.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Fundo de Manutenção Poupado Automaticamente */}
                      <div className="p-4 bg-[#070f0b] border border-yellow-500/20 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500">Fundo Manutenção</span>
                            <span className="text-[7px] font-mono text-yellow-400 bg-yellow-500/15 px-1.5 py-0.5 rounded font-black">10% Poupado</span>
                          </div>
                          <p className="text-[9px] text-slate-500 leading-tight">Valor retido pelo sistema para amortização de peças e revisões.</p>
                        </div>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-xs font-mono text-slate-500">R$</span>{' '}
                          <span className="text-2xl font-black font-mono text-yellow-400">
                            {activeRide.breakdown.maintenanceFund.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Fundo de Reserva Poupado Automaticamente */}
                      <div className="p-4 bg-[#070f0b] border border-[#a855f7]/25 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">Fundo Reserva</span>
                            <span className="text-[7px] font-mono text-purple-400 bg-[#a855f7]/15 px-1.5 py-0.5 rounded font-black">5% Poupado</span>
                          </div>
                          <p className="text-[9px] text-slate-500 leading-tight">Garantia securitária emergencial para SOS na BR-232.</p>
                        </div>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-xs font-mono text-slate-500">R$</span>{' '}
                          <span className="text-2xl font-black font-mono text-purple-400">
                            {activeRide.breakdown.reserveFund.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Custo do Combustível */}
                      <div className="p-4 bg-[#070f0b] border border-sky-500/15 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">Combustível</span>
                          <p className="text-[9px] text-slate-500 leading-tight">Alocação de consumo estimada para a distância percorrida (15%).</p>
                        </div>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-xs font-mono text-slate-500">R$</span>{' '}
                          <span className="text-2xl font-black font-mono text-sky-400">
                            {activeRide.breakdown.fuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Detalhe da receita bruta */}
                      <div className="p-4 bg-[#070f0b] border border-white/5 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tarifa Cheia</span>
                          <p className="text-[9px] text-slate-500 leading-tight">Gross revenue cobrado do passageiro no fechamento.</p>
                        </div>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-xs font-mono text-slate-500">R$</span>{' '}
                          <span className="text-2xl font-black font-mono text-slate-300">
                            {activeRide.breakdown.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Gamificação / Feedback de IP e Meio de Pagamento */}
                      <div className="p-4 bg-gradient-to-br from-[#0c2418] to-black border border-emerald-500/30 rounded-2xl flex flex-col justify-between md:col-span-2 relative shadow-lg">
                        <div className="absolute top-3 right-3 bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono text-[7px] font-black uppercase tracking-widest border border-emerald-500/20">
                          {activeRide.paymentMethod === 'eco_wallet' ? 'Multiplier Active (1.5x)' : 'Multiplier 1.0x'}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#00E676] flex items-center gap-1.5">
                            <span className="size-1.5 bg-[#00E676] rounded-full animate-pulse"></span>
                            Motor de Gamificação BR-232
                          </span>
                          <p className="text-[9.5px] text-slate-350 leading-tight">
                            Meio de Pagamento selecionado: <span className="text-white font-bold uppercase">{
                              activeRide.paymentMethod === 'eco_wallet' ? 'Carteira BR-232 (VIP)' : 
                              activeRide.paymentMethod === 'pix' ? 'Pix Transacional' :
                              activeRide.paymentMethod === 'cash' ? 'Dinheiro Físico' : 'Cartão de Crédito'
                            }</span>.
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {activeRide.paymentMethod === 'eco_wallet' 
                              ? '🔥 Excelente! Você ganhou +50% bônus de Índice de Pertencimento usando sua carteira digital.' 
                              : '💡 DICA: Use a Carteira BR-232 para obter um bônus multiplicador de 1.5x no seu IP de passageiro!'
                            }
                          </p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="space-y-0.5 leading-none font-mono">
                            <span className="text-[7.5px] text-slate-500 uppercase tracking-widest">Sua recompensa de IP</span>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-black text-emerald-300">+{activeRide.gamification?.ipPointsEarned || 0}</span>
                              <span className="text-[9px] text-slate-400 font-sans">Pontos IP</span>
                            </div>
                          </div>
                          {profile && (
                            <div className="text-right leading-none space-y-0.5 font-mono">
                              <span className="text-[7.5px] text-slate-500 uppercase tracking-widest">Seu IP Atualizado</span>
                              <p className="text-xs font-bold text-white mt-1">
                                {((profile?.stats?.ip || 0) + (activeRide.gamification?.ipPointsEarned || 0)).toFixed(1)} / 100
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                      <div className="text-left space-y-0.5">
                        <p className="text-[8px] font-mono text-slate-500">TRAJETO OPERACIONAL</p>
                        <p className="text-[10px] text-slate-300 leading-none">Origem: <span className="text-[#00E676] font-bold">{activeRide.origin}</span></p>
                        <p className="text-[10px] text-slate-300 leading-none mt-1">Destino: <span className="text-yellow-500 font-bold">{activeRide.destination}</span></p>
                      </div>
                      <button
                        onClick={() => setActiveRide(null)}
                        className="bg-[#00E676] hover:bg-[#00c85c] active:scale-95 text-black px-4 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap self-end sm:self-center"
                      >
                        Confirmar Reconciliação
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HISTÓRICO DE CORRIDAS DO MOTO-TÁXI ELITE */}
              <div id="moto-taxi-ride-history-card" className="mt-6 bg-[#0c1a14] border border-white/5 rounded-[2rem] p-6 text-left space-y-4">
                <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                  <div className="size-8 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#00E676] italic">Histórico de Corridas Recentes</h3>
                    <p className="text-[8px] font-mono text-slate-500 uppercase">Valores Alocados Automaticamente para o Motorista</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto no-scrollbar">
                  {rideHistory.filter(ride => ride.driverId === selectedDriver?.id).length > 0 ? (
                    rideHistory.filter(ride => ride.driverId === selectedDriver?.id).map(ride => (
                      <div key={ride.id} className="p-3.5 bg-black/30 border border-white/5 rounded-xl space-y-2 font-mono">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-[#00E676]">{ride.id}</span>
                          <span className="text-[9px] text-slate-500">{ride.date.toLocaleTimeString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-300">
                          <span>{ride.origin} → {ride.destination}</span>
                          <span className="font-extrabold text-[#00E676]">R$ {ride.totalFare.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        {/* Detalhes de Pagamento e IP Recompensado */}
                        <div className="flex items-center justify-between text-[8px] bg-black/45 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono">
                          <span className="text-slate-400">
                            PAGAMENTO: <span className="text-slate-200 font-bold uppercase">{
                              ride.paymentMethod === 'eco_wallet' ? 'Carteira BR-232 (VIP)' : 
                              ride.paymentMethod === 'pix' ? 'Pix' :
                              ride.paymentMethod === 'cash' ? 'Dinheiro' : 'Cartão de Crédito'
                            }</span>
                          </span>
                          <span className="text-emerald-400 font-black">
                            +{ride.gamification?.ipPointsEarned || 0} IP ({ride.gamification?.multiplierApplied || 1.0}x)
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-[8px] border-t border-white/5 pt-1.5 text-center text-slate-400 leading-tight">
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-[6.5px] uppercase">Net Profit</span>
                            <span className="font-black text-[#00E676]">R$ {ride.breakdown.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-yellow-500/80 text-[6.5px] uppercase">Manutenção</span>
                            <span className="font-black text-yellow-500">R$ {ride.breakdown.maintenanceFund.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-purple-400 text-[6.5px] uppercase">Reserva</span>
                            <span className="font-black text-purple-400">R$ {ride.breakdown.reserveFund.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sky-400 text-[6.5px] uppercase">Gasolina</span>
                            <span className="font-black text-sky-400">R$ {ride.breakdown.fuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-600 italic text-[10px] bg-[#05100a]/50 border border-dashed border-white/5 rounded-2xl font-sans">
                      Nenhuma corrida finalizada recentemente para este operador.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Console de Simulação Integrado de Telemetria de Velocidade */}
            <div id="simulation-console-card" className="bg-[#0c1a14] border border-white/5 rounded-[2rem] p-6 text-left space-y-4">
              <div className="flex items-center gap-2.5">
                <Gauge size={18} className="text-[#00E676]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Console de Reconciliação Síncrona (Safety Guard)</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Teste o módulo de interbravuras simulando velocidades superiores a 15 km/h. O sistema bloqueará interações manuais instantaneamente no DOM, ativando as diretrizes de proteção ativa contra acidentes rodoviários, de forma não-obstrutiva e com visualização ativa das rotas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-[#00E676] block mb-1">
                    Velocidade Simulada (Manual Slider)
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      id="speed-simulator-range"
                      type="range" 
                      min="0" 
                      max="60" 
                      value={simulatedSpeed} 
                      onChange={(e) => setSimulatedSpeed(parseInt(e.target.value))}
                      className="flex-1 accent-[#00E676] h-1.5 bg-[#05100a] rounded-lg border border-white/5 cursor-pointer"
                    />
                    <span className="font-mono text-sm font-black w-14 text-right pr-1">
                      {simulatedSpeed} KM/H
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-start md:justify-end gap-2 pt-2 md:pt-0">
                  <button 
                    id="btn-speed-0"
                    onClick={() => setSimulatedSpeed(0)}
                    className="flex-1 md:flex-none h-10 px-4 rounded-lg bg-[#05100a] hover:bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    0 km/h (Estacionado)
                  </button>
                  <button 
                    id="btn-speed-12"
                    onClick={() => setSimulatedSpeed(12)}
                    className="flex-1 md:flex-none h-10 px-4 rounded-lg bg-[#05100a] hover:bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    12 km/h (Manobra)
                  </button>
                  <button 
                    id="btn-speed-30"
                    onClick={() => setSimulatedSpeed(30)}
                    className="flex-1 md:flex-none h-10 px-4 rounded-lg bg-orange-950/20 text-orange-400 hover:bg-orange-950/30 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    30 km/h (Trajeto)
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Coluna Lateral de Pilotos Ativos (lg:col-span-1) */}
          <div id="drivers-feed-section" className="lg:col-span-1 space-y-6">
            
            {/* Bloco de Busca e Lista de Pilotos */}
            <div id="drivers-feed-card" className="bg-[#0c1a14] border border-white/5 rounded-[2.5rem] p-6 flex flex-col h-full min-h-[600px] overflow-hidden justify-between">
              
              <div className="space-y-4">
                {/* Cabeçalho */}
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#00E676] italic">Pilotos Ativos</h3>
                  <p className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">FILTRA DO SEGMENTO DE ALIMENTAÇÃO</p>
                </div>

                {/* Filtro de Busca de Palavras-Chave no DOM */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Search size={14} />
                  </span>
                  <input 
                    id="search-drivers-input"
                    type="text" 
                    placeholder="Pesquisar por nome ou rota..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-[#05100a] border border-white/5 rounded-xl text-xs font-medium placeholder-slate-600 focus:outline-none focus:border-[#00E676]/35 text-slate-200 transition-all"
                  />
                </div>

                {/* Seletor de Tipo Operacional */}
                <div className="flex bg-[#05100a] p-1 rounded-xl border border-white/5 gap-1">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'independent', label: 'Autônomos' },
                    { id: 'associated', label: 'Associações' }
                  ].map(tab => (
                    <button
                      id={`tab-filter-${tab.id}`}
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id as any)}
                      className={`flex-1 h-8 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        activeFilter === tab.id 
                          ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Feed Contínuo com Scroll Limitado */}
                <div id="drivers-feed-list" className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar pt-1">
                  {filteredDrivers.length > 0 ? (
                    filteredDrivers.map(dr => {
                      const isSelected = selectedDriver?.id === dr.id;
                      return (
                        <div 
                          id={`driver-card-item-${dr.id}`}
                          key={dr.id}
                          onClick={() => setSelectedDriver(dr)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left select-none relative group ${
                            isSelected 
                              ? 'bg-[#0e2217] border-[#00E676]/40' 
                              : 'bg-[#070f0b] border-white/5 hover:border-[#00e66b]/25 hover:bg-[#091510]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar Próprio com status de cor */}
                            <div className={`size-10 rounded-full flex items-center justify-center font-black text-xs uppercase shrink-0 ${dr.avatarColor} relative`}>
                              {dr.name[0]}
                              {dr.name.split(' ').slice(-1)[0][0]}
                              
                              <span className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#05100a] ${
                                dr.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}></span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <span className="text-[7px] font-black tracking-widest text-[#00E676] block">
                                {dr.id}
                              </span>
                              
                              <h4 className="text-xs font-black uppercase text-slate-200 truncate group-hover:text-white transition-colors">
                                {dr.name}
                              </h4>
                              
                              <p className="text-[9px] text-slate-500 truncate font-sans">
                                {dr.route}
                              </p>
                            </div>
                          </div>

                          {/* Seção Inferior Dinâmica do Card */}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                              dr.driverType === 'associated' 
                                ? 'bg-[#00c853]/10 text-[#00c853] border-[#00c853]/20' 
                                : 'bg-teal-500/5 text-teal-400 border-teal-500/15'
                            }`}>
                              {dr.driverType === 'associated' ? 'Credenciado Associação' : 'Elite Autônomo'}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <Star size={8} fill="currentColor" className="text-yellow-500" />
                              <span className="font-mono text-[9px] font-black text-slate-300">{dr.rating}</span>
                              <div className="size-1 bg-[#1a2e22] rounded-full"></div>
                              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">{dr.ip}% IP</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-white/2 border border-dashed border-white/5 rounded-2xl">
                      <AlertOctagon size={24} className="text-slate-500 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nenhum operador localizado</p>
                      <p className="text-[8px] text-slate-600 mt-1">Refine seus filtros ou termo de busca.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Detalhe Sutil do Rodapé do Painel */}
              <div id="license-footer" className="bg-[#05100a] p-4 rounded-2xl border border-white/5 mt-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#00E676]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Licenciamento Geral Ativo</span>
                </div>
                <p className="text-[8px] text-slate-500 leading-relaxed font-sans">
                  Todos os mototaxistas sementes possuem IP qualificado e aderência regulatória síncrona com os comandos estaduais da BR-232.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    {/* MODAL DE CONFIRMAÇÃO E PAGAMENTO HÍBRIDO (REGIONAL + GLOBAL) - PPI-TRANCAR COMPLIANT */}
    <AnimatePresence>
      {showPaymentModal && pendingRideDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-gradient-to-br from-[#0c1a14] to-[#040806] border border-emerald-500/30 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-7 md:p-8 text-left space-y-6 shadow-[0_20px_50px_rgba(0,198,83,0.15)] relative font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-widest text-[#00E676] italic">Confirmar Corrida</h3>
                  <p className="text-[9px] font-mono text-slate-500 uppercase">Moto-Táxi Elite • Canal do Passageiro</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setPendingRideDriver(null);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all font-mono"
              >
                Voltar
              </button>
            </div>

            {/* RADAR DE ESCOLHA (CHOICE RADAR DE PILOTOS) */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00E676] flex items-center gap-1.5">
                  <span className="size-2 bg-emerald-500 rounded-full animate-ping"></span>
                  1. Radar de Escolha • Selecione o Piloto
                </span>
                <p className="text-[9px] text-slate-400 leading-tight mt-1">
                  Selecione o piloto semente com base no IP e no preço individual cravado para 10.5 KMs:
                </p>
              </div>

              <div id="choice-radar-list" className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {drivers.filter(d => d.status === 'online').map(d => {
                  const driverRideRate = calculateIndividualRideRate(d.baseFare, d.pricePerKm, 10.5, isExtraRateActive);
                  const isChosen = pendingRideDriver.id === d.id;
                  return (
                    <div
                      key={d.id}
                      id={`radar-pilot-${d.id}`}
                      onClick={() => setPendingRideDriver(d)}
                      className={`p-3 rounded-2xl border text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all cursor-pointer ${
                        isChosen 
                          ? 'bg-emerald-950/40 border-[#00E676] text-white shadow-[0_0_15px_rgba(0,230,118,0.15)]' 
                          : 'bg-black/40 border-white/5 text-slate-300 hover:border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`size-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${d.avatarColor}`}>
                          {d.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-white leading-tight">{d.name}</p>
                          <p className="text-[8px] font-mono text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[#00E676]">{d.ip}% IP</span> • <span>★ {d.rating}</span> • <span>{d.vehicle}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-xs font-mono font-black text-white">R$ {driverRideRate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-[7.5px] font-mono text-slate-500">R$ {d.baseFare} base + R$ {d.pricePerKm}/km</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo da Viagem */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Piloto Escolhido</span>
                <span className="text-xs font-black text-[#00E676]">{pendingRideDriver.name}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Origem</span>
                <span className="text-[11px] text-slate-200">Sede Bezerros (KM 102)</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Destino Estimado</span>
                <span className="text-[11px] text-yellow-500 font-bold">{pendingRideDriver.route.split('↔')[1]?.trim() || 'Distritos'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Taxa de Intermediação</span>
                <span className="text-[9.5px] font-mono font-black text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/20">R$ 0,00 (Zero Take-Rate)</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00E676]">TARIFA UPFRONT CRAVADA</span>
                <div className="text-right">
                  <span className="text-sm font-black font-mono text-white">
                    R$ {calculateIndividualRideRate(pendingRideDriver.baseFare, pendingRideDriver.pricePerKm, 10.5, isExtraRateActive).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {isExtraRateActive && (
                    <p className="text-[7px] text-amber-500 font-mono font-black uppercase leading-none mt-0.5">+30% Adicional rural/noturno ativo</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seletor de Métodos de Pagamento */}
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00E676] mb-1">2. Selecione o Meio de Pagamento</span>
                <span className="text-[9px] text-slate-500 leading-tight">Escolha Carteira BR-232 para acelerar sua associação.</span>
              </div>

              <div className="space-y-2">
                {/* 1. Carteira BR-232 (Destaque VIP, Emerald Green) */}
                <button
                  id="btn-opt-wallet"
                  onClick={() => setSelectedPaymentMethod('eco_wallet')}
                  className={`w-full p-4 rounded-2xl flex flex-col items-start gap-1 text-left border transition-all duration-200 ${
                    selectedPaymentMethod === 'eco_wallet'
                      ? 'bg-emerald-950/40 border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]'
                      : 'bg-black/30 border-white/5 hover:border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Wallet className={`size-4 ${selectedPaymentMethod === 'eco_wallet' ? 'text-[#00E676]' : 'text-slate-400'}`} />
                      <span className={`text-[11px] font-black uppercase tracking-widest ${selectedPaymentMethod === 'eco_wallet' ? 'text-[#00E676]' : 'text-slate-200'}`}>Carteira BR-232</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-[#00E676]/15 text-[#00E676] px-2 py-0.5 rounded-full border border-[#00E676]/20 animate-pulse font-mono">
                      Destaque VIP
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-tight mt-1">
                    Processador síncrono com validação atômica de saldo e escrow de segurança.
                  </p>
                  <div className="mt-1.5 bg-[#00E676]/10 border border-[#00E676]/25 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 w-full">
                    <span className="size-1.5 bg-[#00E676] rounded-full animate-ping"></span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#00E676]">Ganhe +50% de Pontos IP usando seu saldo!</span>
                  </div>
                </button>

                {/* 2. Pix (Neutral Graphite) */}
                <button
                  id="btn-opt-pix"
                  onClick={() => setSelectedPaymentMethod('pix')}
                  className={`w-full p-3.5 rounded-xl flex items-center justify-between text-left border transition-all duration-200 ${
                    selectedPaymentMethod === 'pix'
                      ? 'bg-slate-900 border-white/30 shadow-inner'
                      : 'bg-black/30 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="size-4 text-slate-400" />
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Pix Transacional</span>
                      <p className="text-[8.5px] text-slate-400 leading-none mt-0.5">Liquidação instantânea direta por chave eletrônica.</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">1.0x IP</span>
                </button>

                {/* 3. Dinheiro (Neutral Graphite) */}
                <button
                  id="btn-opt-cash"
                  onClick={() => setSelectedPaymentMethod('cash')}
                  className={`w-full p-3.5 rounded-xl flex items-center justify-between text-left border transition-all duration-200 ${
                    selectedPaymentMethod === 'cash'
                      ? 'bg-slate-900 border-white/30 shadow-inner'
                      : 'bg-black/30 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Coins className="size-4 text-slate-400" />
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Dinheiro Físico</span>
                      <p className="text-[8.5px] text-slate-400 leading-none mt-0.5">Pagamento em espécie diretamente ao piloto.</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">1.0x IP</span>
                </button>

                {/* Secionamento elegante */}
                <div className="flex items-center gap-2 py-1 text-slate-500">
                  <div className="h-px bg-white/5 flex-1"></div>
                  <span className="text-[7.5px] font-mono font-black uppercase tracking-widest">Opção Fallback</span>
                  <div className="h-px bg-white/5 flex-1"></div>
                </div>

                {/* 4. Cartão de Crédito (Minimized) */}
                <button
                  id="btn-opt-card"
                  onClick={() => setSelectedPaymentMethod('credit_card')}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left border transition-all duration-200 ${
                    selectedPaymentMethod === 'credit_card'
                      ? 'bg-slate-900 border-white/20'
                      : 'bg-black/10 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-3.5 text-slate-500" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cartão de Crédito</span>
                      <p className="text-[8px] text-slate-600 leading-none">Hold de crédito síncrono via parceiro de checkout.</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 font-bold bg-white/2 px-1.5 py-0.5 rounded">1.0x IP</span>
                </button>
              </div>
            </div>

            {/* Escrow visual / Cash warning details */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-start gap-2.5 text-left">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[8.5px] text-slate-400 leading-normal">
                {selectedPaymentMethod === 'cash' 
                  ? "💵 Pagamento em Dinheiro diretamente ao Piloto. Contabilidade debitará automaticamente as taxas de fundo na reconciliação."
                  : "🔒 Garantia Escrow Ativo: Saldo retido (Hold de segurança de R$ 0,00 plataforma) com liberação e liquidação 100% direta ao piloto na finalização do serviço."
                }
              </span>
            </div>

            {/* Solicitão ativa button */}
            <button
              id="btn-dispatch-elite"
              disabled={isSyncingState || !pendingRideDriver}
              onClick={() => {
                if (pendingRideDriver) {
                  handleDispatchRide(pendingRideDriver);
                }
              }}
              className="w-full h-12 bg-[#00E676] hover:bg-[#00c85c] disabled:opacity-50 active:scale-95 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,198,83,0.25)] font-mono"
            >
              {isSyncingState ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Sincronizando Despacho...
                </>
              ) : (
                <>
                  <Zap size={14} fill="currentColor" /> Despachar e Chamar Elite
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* COCKPIT DE AVALIAÇÃO DO PILOTO (REGIONAL + GLOBAL) - BLOQUEIO DE TELA EM COMPLETED */}
    <AnimatePresence>
      {activeRide && activeRide.driverId === selectedDriver?.id && activeRide.status === 'completed' && !activeRide.pilotFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="w-full max-w-lg bg-gradient-to-b from-[#0e1f16] to-[#040806] border border-emerald-500/40 rounded-[2.5rem] p-7 md:p-8 text-left space-y-6 shadow-[0_20px_60px_rgba(0,198,83,0.2)] font-sans"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="size-12 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
                <Star size={24} fill="currentColor" className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-[#00E676] italic">Qualificação do Passageiro</h2>
                <p className="text-[9px] text-slate-500 font-mono uppercase">Canal de Reputação Bidirecional • BR-232</p>
              </div>
            </div>

            {/* Descrição */}
            <p className="text-[11px] text-slate-400 leading-tight">
              A corrida do Moto-Táxi Elite foi concluída! Para reativar seu status operacional no ecossistema de Bezerros, qualifique seu passageiro abaixo:
            </p>

            {/* 1. Estrelas do Passageiro */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#00E676] block">1. Calibre a Nota do Passageiro</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTempPilotRating(star)}
                    className="transition-transform active:scale-95 focus:outline-none"
                  >
                    <Star
                      size={24}
                      fill={star <= tempPilotRating ? "#00E676" : "none"}
                      className={star <= tempPilotRating ? "text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]" : "text-slate-600 hover:text-emerald-400"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Critérios de Avaliação */}
            <div className="space-y-3 pt-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#00E676] block">2. Critérios de Segurança e Respeito</span>

              {/* Critério A: Pontualidade */}
              <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-slate-200">Pontualidade Ativa</span>
                  <p className="text-[8.5px] text-slate-500">O passageiro estava pronto no ponto síncrono de partida?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTempPunctuality(prev => !prev)}
                  className={`px-3.5 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-all ${
                    tempPunctuality 
                      ? 'bg-[#00E676] text-black shadow-[0_0_10px_rgba(0,230,118,0.3)]' 
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {tempPunctuality ? 'Sim' : 'Não'}
                </button>
              </div>

              {/* Critério B: Cordialidade */}
              <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-slate-200">Cordialidade e Respeito</span>
                  <p className="text-[8.5px] text-slate-500">Postura polida e silenciosa durante a locomoção na rodovia.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTempCordiality(prev => !prev)}
                  className={`px-3.5 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-all ${
                    tempCordiality 
                      ? 'bg-[#00E676] text-black shadow-[0_0_10px_rgba(0,230,118,0.3)]' 
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {tempCordiality ? 'Sim' : 'Não'}
                </button>
              </div>

              {/* Critério C: Segurança na Garupa */}
              <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-slate-200">Segurança da Garupa (Safety)</span>
                  <p className="text-[8.5px] text-slate-500">Uso adequado do capacete e posicionamento correto nas curvas.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTempPillionSafety(prev => !prev)}
                  className={`px-3.5 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-all ${
                    tempPillionSafety 
                      ? 'bg-[#00E676] text-black shadow-[0_0_10px_rgba(0,230,118,0.3)]' 
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {tempPillionSafety ? 'Sim' : 'Não'}
                </button>
              </div>
            </div>

            {/* 3. Avaliação do Passageiro sobre o Piloto (Atribuído pelo Passageiro) */}
            <div className="p-3 bg-[#0a1410] border border-[#00E676]/10 rounded-xl space-y-1.5 text-left">
              <span className="text-[8.5px] font-black uppercase tracking-widest text-[#00E676] block">3. Canal de Retorno (Opinião do Passageiro)</span>
              <p className="text-[9.5px] text-slate-400 leading-tight">
                Em reciprocidade síncrona, o passageiro qualificou seu serviço operacional com:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star key={st} size={11} fill={st <= tempPassengerRating ? "#00E676" : "none"} className="text-[#00E676]" />
                  ))}
                </div>
                <span className="text-[8.5px] font-mono font-black text-[#00E676] uppercase">5.0 Estrelas • Excelente</span>
              </div>
            </div>

            {/* Submissão */}
            <button
              onClick={() => {
                const pilotFb = {
                  rating: tempPilotRating,
                  punctuality: tempPunctuality,
                  cordiality: tempCordiality,
                  pillionSafety: tempPillionSafety
                };
                const passengerFb = {
                  rating: tempPassengerRating,
                  comment: "Atendimento exemplar, direção segura na BR-232."
                };
                handleFinalizeEvaluation(pilotFb, passengerFb);
              }}
              className="w-full h-11 bg-[#00E676] hover:bg-[#00c85c] active:scale-95 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,198,83,0.25)] font-mono"
            >
              <CheckCircle size={14} /> Registrar Avaliação & Liberar Canal
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

      {/* Real-time SyncToast Element */}
      <AnimatePresence>
        {showSyncToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-black/95 border border-amber-500/30 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center justify-between gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <p className="text-[10px] font-mono font-black uppercase text-slate-100 leading-normal tracking-wide">
                {syncToastMessage}
              </p>
            </div>
            <button
              onClick={() => setShowSyncToast(false)}
              className="text-slate-400 hover:text-white text-[9px] font-mono uppercase bg-white/5 px-2 py-1 rounded-lg border border-white/5 active:scale-95 transition-all text-center leading-none"
            >
              FECHAR
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotoTaxiDashboard;
