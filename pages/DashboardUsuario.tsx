import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SimaWizard from '../src/components/SimaWizard';
import { 
  Zap, 
  ShieldCheck,  
  TrendingUp, 
  Store, 
  ShoppingCart, 
  Wallet, 
  Bike, 
  Activity,
  ArrowRight,
  Settings,
  Lock,
  ChevronRight,
  Loader2,
  Compass,
  CheckCircle2,
  CircleDot,
  X,
  Eye,
  EyeOff,
  Award,
  User as UserIcon,
  LogOut,
  Navigation,
  Heart
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { firebaseService } from '../src/services/firebaseService';
import { updatePassword, deleteUser } from 'firebase/auth';
import { auth, db } from '../src/contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const DashboardUsuario: React.FC = () => {
  const { profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado unificado de Interesse Primário (Optimistic UI)
  const [activeInterest, setActiveInterest] = useState<string>('sima');

  // Controle de estados do Drawer de Configurações
  const isSettingsOpen = searchParams.get('settings') === 'true';

  // Estados do formulário de redefinição de Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pError, setPError] = useState('');
  const [pSuccess, setPSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Estados do formulário de exclusão de Conta
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Estados de feedback efêmero (Toast)
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [updatingInterest, setUpdatingInterest] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (searchParams.get('sima') === 'true') {
      setActiveInterest('sima');
    } else {
      // Ao ler o perfil do usuário na inicialização, se o campo activeInterest não existir, for nulo, ou estiver configurado como 'outro',
      // o sistema deve forçar o valor padrão localmente para 'sima' (Qualificação Perfil).
      const focoInicial = profile?.activeInterest && profile?.activeInterest !== 'outro' 
        ? profile.activeInterest 
        : 'sima';
      setActiveInterest(focoInicial);
    }
  }, [profile?.activeInterest, loading, searchParams]);

  if (loading) return null;

  const stats = profile?.stats || {
    ip: 0,
    merit: 0,
    associationForce: 0,
    totalKm: 0,
  };

  const identities = profile?.identities || {
    isConsumer: true,
    isPatron: false,
    isDriver: false,
    isGuardian: false,
    isSecretary: false,
    isAssociationManager: false,
    isTravelManager: false,
    isServiceProvider: false,
    isColumnist: false
  };

  // Switcher de interesse com Optimistic UI
  const handleInterestChange = async (interest: string) => {
    const prevInterest = activeInterest;
    setActiveInterest(interest);

    if (interest === 'sima') {
      setSearchParams({ sima: 'true' });
    } else if (searchParams.get('sima') === 'true') {
      setSearchParams({});
    }

    const focusLabels: Record<string, string> = {
      'mneme': 'Foco alterado para Cesta do Lar',
      'moto-taxi': 'Foco alterado para Moto-Táxi',
      'feira': 'Foco alterado para A Feira',
      'fidelidade': 'Foco alterado para Porta-Luvas',
      'outro': 'Foco alterado para Visão Geral',
      'sima': 'Foco alterado para SIMA (Perfil)'
    };

    setToastMessage(focusLabels[interest] || 'Foco atualizado com sucesso');
    setShowToast(true);
    const timeoutId = setTimeout(() => setShowToast(false), 3000);

    setUpdatingInterest(true);
    try {
      if (!auth.currentUser) throw new Error("Usuário não autenticado");
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        activeInterest: interest,
        updatedAt: serverTimestamp() // <--- CRÍTICO PARA PASSAR NA REGRA
      });
    } catch (err) {
      console.warn('Falha ao sincronizar foco com o Firestore:', err);
      // Rollback se falhar
      setActiveInterest(prevInterest);
      setToastMessage('Erro de rede: foco revertido');
    } finally {
      setUpdatingInterest(false);
    }
  };

  // Funções do Drawer
  const openSettings = () => setSearchParams({ settings: 'true' });
  const closeSettings = () => {
    setSearchParams({});
    setNewPassword('');
    setConfirmPassword('');
    setPError('');
    setPSuccess('');
    setDeleteConfirmOpen(false);
    setDeleteError('');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPError('As senhas inseridas não coincidem.');
      return;
    }
    setPasswordLoading(true);
    setPError('');
    setPSuccess('');
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPSuccess('Senha de acesso atualizada com sucesso!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPError('Usuário não autenticado no Firebase Auth.');
      }
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'auth/requires-recent-login') {
        setPError('Esta operação exige autenticação recente. Por favor, encerre a sessão e entre novamente antes de atualizar a senha.');
      } else {
        setPError('Falha corporativa ao atualizar senha. Tente novamente.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmOpen) {
      setDeleteConfirmOpen(true);
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        closeSettings();
        navigate('/');
      }
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'auth/requires-recent-login') {
        setDeleteError('Esta operação de alta sensibilidade requer login recente. Logue novamente antes de excluir.');
      } else {
        setDeleteError('Falha ao reportar e excluir documento e credenciais.');
      }
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Definição dos segmentos de foco baseado no modelo de serviços
  const segments = [
    {
      id: 'sima',
      title: 'SIMA (Sua Identidade na Malha)',
      tag: 'Qualificação Perfil',
      icon: <ShieldCheck size={22} />,
      color: '#00e66b',
      enabled: true,
      content: {
        what: 'Qualificação integrada de perfil e vocações autorizadas para atuação dentro da malha corporativa do ECOBR232.',
        where: 'Módulo primário do Cockpit de Bordo.',
        how: 'Preencha suas informações geográficas e vocações operacionais na rodovia.',
        benefits: ['Conformidade Legal', 'Identificação na Rodovia', 'Sincronização Atômica'],
        ctaLabel: 'Qualificar Perfil Agora',
        ctaPath: '/dashboard?sima=true'
      }
    },
    {
      id: 'mneme',
      title: 'Cesta do Lar (Mnēmē)',
      tag: 'Gestão Inteligente',
      icon: <ShoppingCart size={22} />,
      color: '#ff751f',
      enabled: true,
      content: {
        what: 'Gestão inteligente de suprimentos, compras planejadas e controle de gôndolas locais para economia mensal integrada.',
        where: 'Acesso pelo menu superior "Cesta do Lar" ou diretamente pelo atalho de cockpit abaixo.',
        how: 'Planeje sua listagem operacional e valide preços em comerciantes locais credenciados.',
        benefits: ['Previsibilidade Offline', 'Gôndolas Autogerenciáveis', 'Economia Direta Residencial'],
        ctaLabel: 'Gerenciar Cesta do Lar',
        ctaPath: '/mneme'
      }
    },
    {
      id: 'moto-taxi',
      title: 'Moto-Táxi & Giro',
      tag: 'Giro Profissional',
      icon: <Bike size={22} />,
      color: '#ff751f',
      enabled: identities.isDriver,
      content: {
        what: 'Painel completo para mototaxistas de elite licenciados, com telemetria ativa e bloqueio automático em velocidade.',
        where: 'Módulo reservado a operadores credenciados mediante nível de mérito.',
        how: 'Acione o GPS para monitorar corridas cooperativas, acumulando KMs de influência e bacia comercial.',
        benefits: ['Safety Guard Ativo (15km/h)', 'Geofencing de Parada (100m)', 'Metas e Rankings Locais'],
        ctaLabel: 'Iniciar Giro Operacional',
        ctaPath: '/moto-taxi'
      }
    },
    {
      id: 'feira',
      title: 'A Feira (Marketplace)',
      tag: 'Negócios Lindeiros',
      icon: <Store size={22} />,
      color: '#00e676',
      enabled: true,
      content: {
        what: 'Vitrine comercial digital para fomento, negócios e anúncios low cost de fornecedores estabelecidos ao longo da BR-232.',
        where: 'Menu global "A Feira" ou via QR Codes afixados nos estabelecimentos cooperados.',
        how: 'Cadastre suas promoções corporativas de impacto ou localize de forma offline as ofertas úteis no trecho.',
        benefits: ['Visibilidade Regional Expandida', 'Anúncios Low Cost Integrados', 'Reservas por Voz Seguras'],
        ctaLabel: 'Explorar Feira Digital',
        ctaPath: '/classificados'
      }
    },
    {
      id: 'fidelidade',
      title: 'Porta-Luvas (Fidelidade)',
      tag: 'Selos e Recompensas',
      icon: <Wallet size={22} />,
      color: '#00e676',
      enabled: true,
      content: {
        what: 'Sua carteira digital de cupons, bônus regionais e selos acumulados através de passagens georreferenciadas na rodovia.',
        where: 'Opção "Porta-Luvas" no cockpit central e navegação global.',
        how: 'Valide seu celular nos restaurantes e postos parceiros cumprindo a barreira de proximidade física ativa.',
        benefits: ['Segurança Antifraude Ativa', 'Recarga de KMs de Influência', 'Progresso de Divisões (Titan / Twist)'],
        ctaLabel: 'Abrir Meu Porta-Luvas',
        ctaPath: '/fidelidade'
      }
    },
    {
      id: 'outro',
      title: 'Operação Geral',
      tag: 'Abordagem Macro',
      icon: <CircleDot size={22} />,
      color: '#3b82f6',
      enabled: true,
      content: {
        what: 'Central unificada e integridade sistêmica com monitoramento de todos os modais corporativos autorizados.',
        where: 'Visualização padrão de boas-vindas do operador conectado.',
        how: 'Selecione qualquer canal de especialização na barra de controle lateral para mergulhar em micro-métricas dinâmicas.',
        benefits: ['Status Síncrono de Operações', 'Consolidação de Múltiplos Canais', 'Suporte Unificado Sopertek'],
        ctaLabel: 'Ir ao Hub Vida Cidades',
        ctaPath: '/vida-cidades'
      }
    }
  ];

  const currentSegment = segments.find(s => s.id === activeInterest) || segments[segments.length - 1];

  return (
    <div className="w-full flex flex-col md:flex-row shadow-2xl bg-[#050d09] text-white font-sans">
      {/* Sidebar de Controle Lateral (Idêntica à de /guia-servicos) */}
      <aside className="w-full md:w-80 lg:w-96 bg-[#0a1510] border-r border-white/5 p-8 flex flex-col gap-10 shrink-0 select-none pb-20">
         <div className="space-y-6">
            <div className="flex items-center gap-2 text-[#00e66b]">
               <Compass size={20} className="animate-spin-slow" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Painel de Controle</span>
            </div>
            
            {/* Bloco Operador - Presença Presidencial */}
            <div className="flex items-center gap-4 p-4 bg-white/2 border border-white/5 rounded-2xl">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-[#121d17] to-black border border-[#121d17] p-0.5 shrink-0 relative">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} className="w-full h-full object-cover rounded-xl" alt="Foto do Usuário" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 rounded-xl bg-slate-900">
                    <UserIcon size={20} />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 size-5 bg-[#00e66b] rounded-lg flex items-center justify-center text-black shadow-lg border border-black">
                  <Award size={10} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-black italic uppercase truncate text-slate-100">{profile?.displayName || 'Operador BR'}</h1>
                <p className="text-[8px] font-bold text-[#00e66b] tracking-widest uppercase mt-0.5 font-mono">
                  KM: {profile?.currentCity === 'Recife' ? '0' : '80'} ({profile?.currentCity || 'Recife'})
                </p>
              </div>
            </div>

            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Selecione o seu segmento de interesse primário para focar o cockpit de bordo.</p>
         </div>

         {/* Lista de Botões de Segmento do Cockpit */}
         <nav className="flex flex-col gap-3">
            {segments.map(item => {
              const representsActive = activeInterest === item.id;
              const isLocked = item.id === 'moto-taxi' && !identities.isDriver;

              return (
                <button
                  key={item.id}
                  onClick={() => !isLocked && handleInterestChange(item.id)}
                  disabled={isLocked}
                  className={`group flex items-center gap-5 p-4 rounded-[1.5rem] transition-all border text-left outline-none ${
                    isLocked ? 'opacity-30 cursor-not-allowed border-transparent' :
                    representsActive 
                      ? 'bg-white/5 shadow-lg shadow-black/50' 
                      : 'bg-transparent border-transparent hover:bg-white/2 hover:border-white/10'
                  }`}
                  style={{ borderColor: representsActive ? item.color : '' }}
                >
                   <div className={`size-11 rounded-2xl flex items-center justify-center transition-all ${
                     representsActive ? 'text-black scale-115' : 'bg-white/5 text-slate-500 group-hover:text-white'
                   }`} style={{ backgroundColor: representsActive ? item.color : '' }}>
                      {item.icon}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className={`text-[8.5px] font-black uppercase tracking-widest ${representsActive ? '' : 'text-slate-500'}`} style={{ color: representsActive ? item.color : '' }}>
                        {isLocked ? 'Bloqueado' : item.tag}
                      </div>
                      <div className={`text-xs font-black transition-colors ${representsActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                        {item.title}
                      </div>
                   </div>
                   {!isLocked && <ChevronRight size={14} className={`transition-all ${representsActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} style={{ color: item.color }} />}
                </button>
              );
            })}
         </nav>

         {/* Botão de Retorno ao Portal Home (ECOBR232 EIXO CAPITAL-SERTÃO) */}
         <button
           onClick={() => navigate('/portal')}
           className="group mt-2 flex items-center gap-5 p-5 bg-[#050d09] hover:bg-[#121d17]/50 border border-[#00e66b]/10 hover:border-[#00e66b]/30 rounded-[2rem] transition-all text-left outline-none shadow-lg active:scale-95"
         >
           <div className="size-12 rounded-2xl bg-[#121d17] border border-white/10 flex items-center justify-center p-2 shrink-0 group-hover:border-[#00e66b]/40 transition-colors">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                className="size-full object-contain"
                alt="ECOBR232 Logo"
                referrerPolicy="no-referrer"
              />
           </div>
           <div className="flex-1 min-w-0">
              <div className="text-lg font-black italic uppercase tracking-wider text-white group-hover:text-[#00e66b] transition-colors leading-none">
                 ECOBR232
              </div>
              <div className="text-[10px] font-bold text-[#00e66b] tracking-[0.2em] uppercase mt-1 leading-none">
                 EIXO CAPITAL-SERTÃO
              </div>
           </div>
         </button>

         {/* Rodapé da Sidebar: Ajustes Administrativos Rápidos */}
         <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
            <div className="p-6 bg-white/2 border border-white/5 rounded-3xl space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#00e66b]">Ajustes de Conta</span>
                  <button 
                     onClick={openSettings} 
                     className="px-2 py-1 bg-white/5 border border-white/10 hover:border-[#00e66b]/20 hover:text-[#00e66b] text-[8px] font-black uppercase rounded-lg transition-all"
                  >
                     Configurações
                  </button>
               </div>
               <p className="text-[10px] text-slate-400 font-medium italic">Altere sua senha de login corporativo, gerencie dados e consulte políticas integradas nesta bacia de controle lindeira.</p>
            </div>
         </div>
      </aside>

      {/* Área Principal de Conteúdo (Idêntica à de /guia-servicos) */}
      <main className="flex-1 min-h-screen relative overflow-y-auto pb-24">
         <div 
           className="absolute inset-x-0 top-0 h-96 bg-gradient-to-down opacity-50 pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(to bottom, ${currentSegment.color}07, transparent)` }} 
         />
         
          <AnimatePresence mode="wait">
            <motion.div
              key={activeInterest}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 max-w-5xl mx-auto px-10 py-16 space-y-16"
            >
               {activeInterest === 'sima' ? (
                 <SimaWizard onFinish={() => {
                   setToastMessage('Sua Identidade na Malha foi atualizada com sucesso!');
                   setShowToast(true);
                   setTimeout(() => setShowToast(false), 3000);
                   navigate('/dashboard');
                   setActiveInterest('outro');
                 }} />
               ) : (
                 <>
                   {/* Painel do IP: Cabine Presidencial Superior para eliminar a Solidão Visual */}
                   <section className="bg-gradient-to-b from-[#0c130e] to-black rounded-[2.5rem] border border-[#121d17] p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
                 <div className="space-y-4 flex-1 w-full text-left">
                   <div className="flex items-center justify-between gap-4">
                      <div>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: currentSegment.color }}>Índice de Pertencimento (IP)</h3>
                         <p className="text-[8px] font-mono font-bold text-slate-500 uppercase mt-0.5 tracking-wider">Métrica de Integração Ativa na Malha</p>
                      </div>
                      <span className="font-mono text-4xl font-black italic text-[#00e66b] animate-pulse">
                         {(stats.ip || 0).toFixed(1)}%
                      </span>
                   </div>
                   
                   {/* Linha Geométrica Progressiva de Pertencimento */}
                   <div className="h-2 w-full bg-[#15231c]/60 rounded-full overflow-hidden border border-white/5 relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, stats.ip))}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r"
                        style={{ backgroundImage: `linear-gradient(to right, ${currentSegment.color}, #00e66b)` }}
                      />
                   </div>
                 </div>

                 {/* Detalhamento Estrito de Contratos de IP */}
                 <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0 md:border-l md:border-white/5 md:pl-8 text-left">
                    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between gap-6 text-slate-500">
                        <span className="text-[7.5px] font-black uppercase tracking-wider">Mérito Individual</span>
                        <span className="font-mono text-[8.5px] font-bold text-[#00e66b]">65%</span>
                      </div>
                      <div className="font-mono text-xl font-black italic text-slate-100 leading-none">{(stats.merit || 0).toFixed(1)}%</div>
                      <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-none">Produtividade Pessoal</p>
                    </div>

                    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between gap-6 text-slate-500">
                        <span className="text-[7.5px] font-black uppercase tracking-wider">Força Associativa</span>
                        <span className="font-mono text-[8.5px] font-bold text-[#00e66b]">35%</span>
                      </div>
                      <div className="font-mono text-xl font-black italic text-slate-100 leading-none">{(stats.associationForce || 0).toFixed(1)}%</div>
                      <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-none">Conectividade Regional</p>
                    </div>
                 </div>
               </section>

               {/* Hero Detail do Segmento Ativo */}
               <section className="space-y-8 text-left">
                  <div className="size-20 rounded-3xl flex items-center justify-center text-black shadow-2xl" style={{ backgroundColor: currentSegment.color }}>
                     {React.cloneElement(currentSegment.icon as React.ReactElement, { size: 40 })}
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">
                       {currentSegment.title}
                     </h2>
                     <p className="text-2xl font-medium text-slate-400 leading-relaxed max-w-3xl italic border-l-4 pl-8" style={{ borderLeftColor: `${currentSegment.color}40` }}>
                        {currentSegment.content.what}
                     </p>
                  </div>
               </section>

               {/* Modificadores e atalhos na Grade de Detalhes baseadas nas regras estéticas */}
               <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {currentSegment.id === 'feira' ? (
                    <>
                      <DetailBox 
                        title="Gere Seus Anúncios" 
                        color={currentSegment.color}
                        icon={<Store size={22} />}
                        content={
                          <div className="space-y-4">
                            <p className="text-slate-400 font-medium">Controle e audite suas listagens comerciais, produtos lindeiros e campanhas ativas de atração.</p>
                            <button 
                              onClick={() => navigate('/meus-anuncios')} 
                              className="h-10 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#00e676] rounded-xl transition-all"
                            >
                              Meus Anúncios
                            </button>
                          </div>
                        }
                      />
                      <DetailBox 
                        title="Nova Vitrina Comercial" 
                        color={currentSegment.color}
                        icon={<Zap size={22} />}
                        content={
                          <div className="space-y-4">
                            <p className="text-slate-400 font-medium">Anuncie sua borracharia, restaurante ou serviço de guincho com custos altamente acessíveis por KM.</p>
                            <button 
                              onClick={() => navigate('/anunciar')} 
                              className="h-10 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#00e676] rounded-xl transition-all"
                            >
                              Criar Anúncio
                            </button>
                          </div>
                        }
                      />
                    </>
                  ) : currentSegment.id === 'moto-taxi' ? (
                    <>
                      <DetailBox 
                        title="Safety Guard Telemetria" 
                        color={currentSegment.color}
                        icon={<ShieldCheck size={22} />}
                        content={
                          <div className="space-y-2">
                             <p className="text-amber-500 font-bold uppercase text-[9px] tracking-wider animate-pulse">Bloqueio Operacional Ativado</p>
                             <p className="text-slate-400 font-medium">Bloqueio compulsório de segurança em tempo real se a velocidade do GPS superar 15 km/h.</p>
                          </div>
                        }
                      />
                      <DetailBox 
                        title="Bacia de Serviço Local" 
                        color={currentSegment.color}
                        icon={<Activity size={22} />}
                        content={
                          <div className="space-y-2">
                             <p className="text-slate-100 font-black uppercase text-[9px] font-mono">Bacia: Região Metropolitana de Recife / Gravatá</p>
                             <p className="text-slate-400 font-medium">Opere dentro do raio autorizado para resguardar a integridade das corridas ecológicas.</p>
                          </div>
                        }
                      />
                    </>
                  ) : (
                    <>
                      <DetailBox 
                        title="Onde Encontrar?" 
                        color={currentSegment.color}
                        icon={<Navigation size={22} />}
                        content={<p className="text-slate-300 font-medium">{currentSegment.content.where}</p>}
                      />
                      <DetailBox 
                        title="Como Funciona?" 
                        color={currentSegment.color}
                        icon={<Zap size={22} />}
                        content={<p className="text-slate-300 font-medium">{currentSegment.content.how}</p>}
                      />
                    </>
                  )}
               </section>

               {/* Principais Benefícios Corporativos do Canal de Foco */}
               <section className="space-y-8 text-left">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Destaques e Benefícios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {currentSegment.content.benefits.map((benefit, idx) => (
                        <div key={idx} className="p-8 bg-white/2 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all flex flex-col gap-6 text-left">
                           <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-primary" style={{ color: currentSegment.color }}>
                              <Heart size={20} />
                           </div>
                           <p className="text-sm font-bold uppercase tracking-widest text-slate-300 leading-snug">{benefit}</p>
                        </div>
                     ))}
                  </div>
               </section>

               {/* CTA de Acesso Rápido ao Módulo */}
               <section className="p-10 bg-white/5 border border-white/10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                  <div className="space-y-2">
                     <h4 className="text-2xl font-black italic uppercase leading-none">Pronto para utilizar este canal?</h4>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Acesse as ferramentas dedicadas do ecossistema.</p>
                  </div>
                  <button 
                    onClick={() => navigate(currentSegment.content.ctaPath)}
                    className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-[#00e66b] hover:text-black transition-all group shrink-0 shadow-xl"
                  >
                     {currentSegment.content.ctaLabel} 
                     <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
               </section>
             </>
           )}
        </motion.div>
         </AnimatePresence>
      </main>

      {/* Settings Retractable Sliding Drawer (Mantido Intacto na Funcionabilidade) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSettings}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000]"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0c130e] border-l border-[#121d17] z-[1001] shadow-2xl overflow-y-auto no-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#121d17] sticky top-0 bg-[#0c130e]/95 backdrop-blur z-20">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-[#00e66b]/10 border border-[#00e66b]/20 flex items-center justify-center text-[#00e66b]">
                    <Settings size={16} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 leading-none">Ajustes da Conta</h3>
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-tighter mt-1 block">Controle e Auditoria</span>
                  </div>
                </div>
                <button
                  onClick={closeSettings}
                  className="p-2 bg-[#121d17]/40 border border-[#121d17] hover:border-red-900/30 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Corpo */}
              <div className="p-6 space-y-6">
                
                {/* Seção 1: Segurança corporativa (Senha) */}
                <div className="space-y-4 text-left">
                  <div className="border-b border-[#121d17] pb-2">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Segurança & Senha</h4>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">Alteração de Senha do Firebase Auth</p>
                  </div>

                  {pError && (
                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-[9px] font-bold text-red-500 uppercase tracking-wide leading-normal">
                      {pError}
                    </div>
                  )}

                  {pSuccess && (
                    <div className="p-4 bg-emerald-950/20 border border-[#00e66b]/30 rounded-xl text-[9px] font-bold text-[#00e66b] uppercase tracking-wide leading-normal flex items-center gap-2">
                      <CheckCircle2 size={14} /> {pSuccess}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-wider text-slate-500">Nova Senha</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full h-11 px-4 bg-black/40 border border-[#121d17] focus:border-[#00e66b]/40 rounded-xl text-xs text-white placeholder-slate-700 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 p-1"
                        >
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-wider text-slate-500">Confirmar Nova Senha</label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full h-11 px-4 bg-black/40 border border-[#121d17] focus:border-[#00e66b]/40 rounded-xl text-xs text-white placeholder-slate-700 outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full h-11 bg-[#121d17] hover:bg-[#121d17]/80 border border-[#00e66b]/20 text-[#00e66b] hover:text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {passwordLoading ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Atualizando Senha...
                        </>
                      ) : 'Salvar Alteração'}
                    </button>
                  </form>
                </div>

                {/* Seção 2: Políticas e Legalidade */}
                <div className="space-y-3 pt-2 text-left">
                  <div className="border-b border-[#121d17] pb-2">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Políticas & Legalidade</h4>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">Termos corporativos de Operação</p>
                  </div>

                  <div className="grid gap-2">
                    <button
                      onClick={() => { closeSettings(); navigate('/termos'); }}
                      className="w-full h-12 bg-black/20 hover:bg-[#121d17]/40 border border-[#121d17] rounded-xl px-4 flex items-center justify-between text-left transition-all"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">Termos de Uso</span>
                      <ChevronRight size={14} className="text-slate-700" />
                    </button>
                    <button
                      onClick={() => { closeSettings(); navigate('/central-de-politicas'); }}
                      className="w-full h-12 bg-black/20 hover:bg-[#121d17]/40 border border-[#121d17] rounded-xl px-4 flex items-center justify-between text-left transition-all"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">Política de Privacidade</span>
                      <ChevronRight size={14} className="text-slate-700" />
                    </button>
                  </div>
                </div>

                {/* Seção 3: Ações Administrativas Críticas */}
                <div className="space-y-4 pt-4 border-t border-[#121d17]/60 text-left">
                  <div className="p-4 bg-red-950/10 border border-red-950 rounded-xl space-y-3">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-red-500">ZONA CRÍTICA DE COMANDO</h5>
                    <p className="text-[9.5px] text-slate-500 font-medium leading-normal italic">
                      Ações abaixo afetam de forma permanente o banco de dados e as permissões de acesso do operador.
                    </p>

                    {deleteError && (
                      <div className="p-3 bg-red-950/30 border border-red-900 rounded-lg text-[8.5px] font-bold text-red-500 uppercase leading-relaxed tracking-wider">
                        {deleteError}
                      </div>
                    )}

                    <div className="space-y-2">
                      {deleteConfirmOpen ? (
                        <div className="p-3 bg-black/40 border border-red-900/30 rounded-lg space-y-3">
                          <p className="text-[8px] font-black uppercase tracking-wider text-red-500 animate-pulse text-center">CONFIRMA A DELEÇÃO PERMANENTE?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={deleteLoading}
                              className="flex-1 h-10 bg-red-950/50 hover:bg-red-950/80 text-red-500 font-black uppercase text-[8.5px] tracking-wider rounded-lg border border-red-900/30 transition-all flex items-center justify-center"
                            >
                              {deleteLoading ? 'Excluindo...' : 'CONFIRMAR'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmOpen(false)}
                              disabled={deleteLoading}
                              className="flex-1 h-10 bg-[#121d17] text-slate-500 hover:text-white font-black uppercase text-[8.5px] tracking-wider rounded-lg border border-[#121d17] transition-all"
                            >
                              CANCELAR
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full h-11 bg-red-950/20 hover:bg-red-900/10 text-red-600 border border-red-900/30 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all inline-flex items-center justify-center gap-2"
                        >
                          EXCLUIR CONTA DEFINITIVAMENTE
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full h-11 bg-black/20 hover:bg-[#121d17] text-slate-400 hover:text-white border border-[#121d17] rounded-xl font-black uppercase text-[9px] tracking-widest transition-all inline-flex items-center justify-center gap-2"
                      >
                        <LogOut size={14} /> ENCERRAR SESSÃO ATIVA
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Success/Control Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] px-4 py-3 bg-[#0c130e] border border-[#00e66b]/30 rounded-xl text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          >
            <CheckCircle2 size={16} className="text-[#00e66b]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailBox = ({ title, content, icon, color }: any) => (
  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6 group hover:bg-white/10 transition-all text-left">
     <div className="size-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center transition-transform group-hover:scale-110" style={{ color }}>
        {icon}
     </div>
     <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</h4>
        <div className="text-sm font-bold text-white leading-relaxed">{content}</div>
     </div>
  </div>
);

export default DashboardUsuario;
