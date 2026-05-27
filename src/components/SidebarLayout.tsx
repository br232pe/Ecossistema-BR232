import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  Award, 
  User as UserIcon, 
  ShoppingCart, 
  Store, 
  Wrench, 
  Wallet, 
  Bike, 
  Compass,
  CircleDot
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Footer } from './Footer';
import { isBetaActive } from '../utils/betaGuard';

interface SidebarLayoutProps {
  children?: React.ReactNode;
  auth: boolean;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, auth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Esconder o Top Navbar nas rotas públicas iniciais de entrada (Welcome / Login)
  const hiddenPaths = [
    '/',
    '/login',
    '/registrar',
  ];

  const shouldHide = location.pathname === '/' || hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) {
    return (
      <div className="min-h-screen bg-[#030604] flex flex-col relative animate-fade-in">
        <div className="flex-1 w-full relative">
          {children || <Outlet />}
        </div>
        <Footer />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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

  // Listagem de links corporativos ativos (adaptativa ao status de autenticação)
  const navLinks = auth ? [
    { label: 'Meu Painel', route: '/dashboard', icon: <Compass size={14} /> },
    { label: 'Cesta do Lar', route: '/mneme', icon: <ShoppingCart size={14} /> },
    { label: 'A Feira', route: '/classificados', icon: <Store size={14} /> },
    { label: 'VIDA CIDADES', route: '/vida-cidades', icon: <Wrench size={14} /> },
    { label: 'Porta-Luvas', route: '/fidelidade', icon: <Wallet size={14} /> },
    { label: 'Guia da Malha', route: '/guia-servicos', icon: <Award size={14} /> }
  ] : [
    { label: 'Cesta', route: '/mneme', icon: <ShoppingCart size={14} /> },
    { label: 'Serviços', route: '/guia-servicos', icon: <Award size={14} /> },
    { label: 'Planos', route: '/planos', icon: <Wrench size={14} /> },
    { label: 'Blog', route: '/blog', icon: <Compass size={14} /> }
  ];

  // Adicionais sob verificação corporativa
  if (auth && identities.isDriver) {
    navLinks.push({ label: 'Moto-Táxi', route: '/moto-taxi', icon: <Bike size={14} /> });
  }

  return (
    <div className="w-full min-h-screen bg-[#050d09] text-white flex flex-col font-sans transition-all">
      {isBetaActive() && (
        <div id="global-beta-banner" className="w-full bg-gradient-to-r from-emerald-950 via-[#06100a] to-emerald-950 border-b border-[#00e66b]/30 py-2 px-4 text-center text-[10px] sm:text-xs font-semibold text-slate-300 relative overflow-hidden z-[60] flex items-center justify-center gap-2">
          <span className="flex h-1.5 w-1.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e66b] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00e66b]"></span>
          </span>
          <span className="tracking-wide">
            Modo Beta Ativo: Sistema em calibração até 31/12/2026. Opere com os benefícios dos cupons de estruturação.
          </span>
        </div>
      )}
      {/* Top Navbar Omnipresente (Baseado no Guia de Serviços) */}
      <header className="sticky top-0 z-50 bg-[#050d09]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 px-safe">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          {/* Logo Cooperativo à Esquerda */}
          <div 
            onClick={() => navigate(auth ? '/portal' : '/')} 
            className="flex items-center gap-4 cursor-pointer select-none active:opacity-80 transition-opacity"
          >
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shadow-lg shrink-0">
               <img 
                 src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                 className="size-full object-contain"
                 alt="BR232"
                 referrerPolicy="no-referrer"
               />
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-widest leading-none text-slate-100">Portal BR232</h1>
              <p className="text-[8px] font-bold text-[#00e66b] tracking-widest uppercase mt-1">
                {auth ? `Conectado: ${profile?.currentCity || 'Recife'}` : 'Acesso Visitante'}
              </p>
            </div>
          </div>

          {/* Links Globais no Centro (Desktop lg:flex) */}
          <nav className="hidden lg:flex items-center gap-6">
            <a
              href="/#/"
              className="text-[9px] font-black uppercase tracking-widest transition-colors px-2.5 py-1.5 rounded-lg border border-transparent flex items-center gap-1.5 text-slate-400 hover:text-white"
            >
              Início
            </a>
            {navLinks.map(link => {
              const representsActive = location.pathname.startsWith(link.route);
              return (
                <button
                  key={link.route}
                  onClick={() => navigate(link.route)}
                  className={`text-[9px] font-black uppercase tracking-widest transition-colors px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                    representsActive 
                      ? 'text-[#00e66b] bg-[#121d17]/50 border-[#00e66b]/20 font-black' 
                      : 'text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Dados e Perfil / Login e Registrar à Direita */}
          <div className="flex items-center gap-4">
            {auth ? (
              <>
                {/* IP Simplificado em Texto Monoespaçado */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[7.5px] font-black uppercase text-slate-500 tracking-wider">Índice Pertencimento</span>
                  <span className="font-mono text-xs font-black text-[#00e66b] mt-0.5 animate-pulse italic">
                    {(stats.ip || 0).toFixed(0)}% IP
                  </span>
                </div>

                {/* Avatar do Operador / Link Painel */}
                <Link 
                  to="/dashboard" 
                  className="size-9 rounded-xl bg-white/5 border border-white/10 p-0.5 relative shrink-0 transition-all hover:border-[#00e66b]/40 block active:scale-95"
                  title="Ir para o Cockpit Central"
                >
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} className="w-full h-full object-cover rounded-lg" alt="Avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 rounded-lg bg-slate-900">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 size-4 bg-[#00e66b] rounded-md flex items-center justify-center text-black shadow-lg">
                    <Award size={8} />
                  </div>
                </Link>

                {/* Ajustes Rápidos */}
                <button 
                  onClick={() => navigate('/dashboard?settings=true')}
                  className="hidden sm:flex size-9 rounded-xl bg-[#121d17]/30 border border-[#121d17] items-center justify-center text-slate-400 hover:text-white hover:border-[#00e66b]/20 transition-all active:scale-95"
                  title="Ajustes Corporativos"
                >
                  <Settings size={15} />
                </button>

                {/* Logout Sutil */}
                <button 
                  onClick={handleLogout}
                  className="hidden sm:flex size-9 rounded-xl bg-red-950/10 border border-red-950/20 items-center justify-center text-red-500 hover:bg-red-950/30 transition-all active:scale-95"
                  title="Encerrar Sessão Ativa"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#00e66b] hover:text-white transition-colors"
                >
                  Entrar
                </button>
                <div className="h-6 w-px bg-white/10"></div>
                <button 
                  onClick={() => navigate('/login?register=true')}
                  className="px-4 py-2 bg-[#00e66b] hover:bg-[#00c85c] text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all font-sans"
                >
                  Registrar
                </button>
              </div>
            )}

            {/* Botão de Menu Hambúrguer Móvel */}
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00e66b] active:scale-95 transition-all"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Hambúrguer Móvel Suspenso */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[110] bg-[#05100a] lg:hidden p-8 pt-24 space-y-8 flex flex-col items-center text-center overflow-y-auto w-full h-screen">
          <button 
            onClick={() => setMobileOpen(false)} 
            className="absolute top-6 right-6 size-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00e66b] border border-white/10"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col gap-3 w-full">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Links Corporativos</span>
            <a
              href="/#/"
              className="h-14 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-center gap-2"
            >
              Início
            </a>
            {navLinks.map(link => (
              <button 
                key={link.route}
                onClick={() => { navigate(link.route); setMobileOpen(false); }} 
                className="h-14 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-center gap-2"
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-white/5" />

          {auth ? (
            <>
              {/* Informações Operacionais Móveis */}
              <div className="space-y-4 w-full">
                <div className="p-4 bg-[#121d17]/40 border border-[#121d17] rounded-xl flex items-center gap-3">
                  <CircleDot size={18} className="text-[#00e66b] animate-pulse" />
                  <div className="text-left">
                    <span className="block text-[7px] font-black uppercase text-slate-500 tracking-wider">Pertencimento Ativo</span>
                    <span className="font-mono text-xs font-bold text-slate-300">{(stats.ip || 0).toFixed(1)}% IP</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full pb-12">
                <button 
                  onClick={() => { navigate('/dashboard?settings=true'); setMobileOpen(false); }} 
                  className="h-12 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-slate-300 tracking-widest flex items-center justify-center gap-2"
                >
                  <Settings size={14} /> Ajustes
                </button>
                <button 
                  onClick={() => { handleLogout(); setMobileOpen(false); }} 
                  className="h-12 rounded-xl bg-red-950/20 border border-red-900/30 text-[9px] font-black uppercase text-red-500 tracking-widest flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Encerrar Sessão
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 w-full pb-12">
              <button 
                onClick={() => { navigate('/login'); setMobileOpen(false); }} 
                className="h-12 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-[#00e66b] tracking-widest flex items-center justify-center gap-2"
              >
                Entrar
              </button>
              <button 
                onClick={() => { navigate('/login?register=true'); setMobileOpen(false); }} 
                className="h-12 rounded-xl bg-[#00e66b] text-black text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 font-sans"
              >
                Registrar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cockpit Central / Conteúdo Principal */}
      <div className="flex-1 flex flex-col w-full relative">
        <main className="flex-1 w-full relative">
          {children || <Outlet />}
        </main>
      </div>

      {/* Footer Unificado Corporativo */}
      <Footer />
    </div>
  );
};
