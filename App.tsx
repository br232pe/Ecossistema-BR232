import React, { Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

// Componente ScrollToTop para garantir fluidez na navegação
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { APIProvider } from '@vis.gl/react-google-maps';

// Componente de Blindagem
import ErrorBoundary from './components/ErrorBoundary';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy Loading Modules (Code Splitting)
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import Classifieds from './pages/Classifieds';
import DashboardUsuario from './pages/DashboardUsuario';
import DashboardAssociacao from './pages/DashboardAssociacao';
import DashboardViagens from './pages/DashboardViagens';
import VidaCidades from './pages/VidaCidades';
import DashboardPrestadores from './pages/DashboardPrestadores';
import DashboardUrgencia from './pages/DashboardUrgencia';
import PatronPlans from './pages/PatronPlans';
const CommunityLife = React.lazy(() => import('./pages/CommunityLife'));
const Blog = React.lazy(() => import('./pages/Blog'));
const Patrons = React.lazy(() => import('./pages/Patrons'));
const RegisterPatron = React.lazy(() => import('./pages/RegisterPatron'));
const ReportAlert = React.lazy(() => import('./pages/ReportAlert'));
const MotoTaxi = React.lazy(() => import('./pages/MotoTaxi'));
const PostAd = React.lazy(() => import('./pages/PostAd'));
const MyAds = React.lazy(() => import('./pages/MyAds'));
const Roadmap = React.lazy(() => import('./pages/Roadmap'));
const Profile = React.lazy(() => import('./pages/Profile'));
const LoyaltyManager = React.lazy(() => import('./pages/LoyaltyManager'));
const MultimodalRegistration = React.lazy(() => import('./pages/MultimodalRegistration'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Terms = React.lazy(() => import('./pages/Terms'));
const PolicyCenter = React.lazy(() => import('./pages/PolicyCenter'));
// Módulos de Fidelidade
const LoyaltyWallet = React.lazy(() => import('./pages/LoyaltyWallet'));
// Módulos Mnēmē
const Mneme = React.lazy(() => import('./pages/Mneme'));
const MnemeListDetail = React.lazy(() => import('./pages/MnemeList'));
const MnemeMarket = React.lazy(() => import('./pages/MnemeMarket'));
const MnemeDashboard = React.lazy(() => import('./pages/MnemeDashboard'));
const BlogEditor = React.lazy(() => import('./pages/BlogEditor'));
const ServicesGuide = React.lazy(() => import('./pages/ServicesGuide'));

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  // Garantir que a malha não quebre por erros de hash tracking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash !== '' && !hash.startsWith('#/')) {
        window.location.hash = '#/' + hash.substring(1);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050d09] flex flex-col items-center justify-center text-primary">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Autenticando na Malha...</p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#050d09] text-white font-display selection:bg-primary selection:text-black leading-relaxed">
        <SafetyGuard />
        <Layout auth={isAuthenticated}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<ErrorBoundary moduleName="Autenticação"><Login /></ErrorBoundary>} />
              <Route path="/registrar" element={<ErrorBoundary moduleName="Autenticação"><Login /></ErrorBoundary>} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/politica-de-privacidade" element={<PolicyCenter />} />
              <Route path="/termos-e-uso" element={<PolicyCenter />} />
              <Route path="/central-de-politicas" element={<PolicyCenter />} />
              <Route path="/registro" element={<ProtectedRoute><MultimodalRegistration /></ProtectedRoute>} />
              <Route path="/porta-luvas" element={<ProtectedRoute><LoyaltyManager /></ProtectedRoute>} />
              <Route path="/meus-anuncios" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
              
              {/* Módulos Core */}
              <Route path="/portal" element={<ErrorBoundary moduleName="Portal do Ecossistema"><Home auth={isAuthenticated} /></ErrorBoundary>} />
              <Route path="/dashboard" element={<ProtectedRoute><ErrorBoundary moduleName="Painel do Usuário"><DashboardUsuario /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard-associacao" element={<ProtectedRoute><ErrorBoundary moduleName="Painel de Associação"><DashboardAssociacao /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/dashboard-viagens" element={<ProtectedRoute><ErrorBoundary moduleName="Painel de Viagens"><DashboardViagens /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/vida-cidades" element={<ErrorBoundary moduleName="Vida das Cidades"><VidaCidades /></ErrorBoundary>} />
              <Route path="/planos" element={<ErrorBoundary moduleName="Planos e Patronos"><PatronPlans /></ErrorBoundary>} />
              <Route path="/vida-cidades/prestadores" element={<ProtectedRoute><ErrorBoundary moduleName="Painel do Prestador"><DashboardPrestadores /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/vida-cidades/urgencia" element={<ErrorBoundary moduleName="Canal de Urgência"><DashboardUrgencia /></ErrorBoundary>} />
              <Route path="/alertas" element={<ErrorBoundary moduleName="Monitoramento"><Alerts /></ErrorBoundary>} />
              <Route path="/classificados" element={<ErrorBoundary moduleName="Marketplace"><Classifieds /></ErrorBoundary>} />
              <Route path="/vida" element={<ErrorBoundary moduleName="Vida Comunitária"><CommunityLife auth={isAuthenticated} /></ErrorBoundary>} />
              <Route path="/blog" element={<ErrorBoundary moduleName="Notícias"><Blog /></ErrorBoundary>} />
              <Route path="/blog/editor" element={<ProtectedRoute><ErrorBoundary moduleName="Editor de Blog"><BlogEditor /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/guia-servicos" element={<ErrorBoundary moduleName="Guia de Serviços"><ServicesGuide /></ErrorBoundary>} />
              <Route path="/patronos" element={<ErrorBoundary moduleName="Parceiros"><Patrons /></ErrorBoundary>} />
              <Route path="/patronos/registrar" element={<ErrorBoundary moduleName="Cadastro de Patrono"><RegisterPatron /></ErrorBoundary>} />
              <Route path="/roadmap" element={<Roadmap />} />
              
              {/* Módulo Especializado: Moto-Táxi */}
              <Route path="/moto-taxi" element={<ErrorBoundary moduleName="Ranking Moto-Táxi"><MotoTaxi /></ErrorBoundary>} />

              {/* Módulo Fidelidade */}
              <Route path="/fidelidade" element={<ProtectedRoute><ErrorBoundary moduleName="Porta-Luvas Digital"><LoyaltyWallet /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/fidelidade/gerir" element={<ProtectedRoute><ErrorBoundary moduleName="Gestor Fidelidade"><LoyaltyManager /></ErrorBoundary></ProtectedRoute>} />

              {/* Módulo Mnēmē (Gestão Doméstica) */}
              <Route path="/mneme" element={<ProtectedRoute><ErrorBoundary moduleName="Mnēmē"><Mneme /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/mneme/lista/:id" element={<ProtectedRoute><ErrorBoundary moduleName="Lista Mnēmē"><MnemeListDetail /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/mneme/dashboard" element={<ProtectedRoute><ErrorBoundary moduleName="Dashboard Mnēmē"><MnemeDashboard /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/mneme/mercado" element={<ProtectedRoute><ErrorBoundary moduleName="Consultor de Gôndola"><MnemeMarket /></ErrorBoundary></ProtectedRoute>} />

              {/* Rotas Protegidas */}
              <Route path="/perfil" element={<ProtectedRoute><ErrorBoundary moduleName="Perfil do Usuário"><Profile /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/reportar" element={<ProtectedRoute><ErrorBoundary moduleName="Reporte de Alertas"><ReportAlert /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/anunciar" element={<ProtectedRoute><ErrorBoundary moduleName="Gestor de Anúncios"><PostAd /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/anunciar/:adId" element={<ProtectedRoute><ErrorBoundary moduleName="Editor de Anúncio"><PostAd /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><ErrorBoundary moduleName="Admin Dashboard"><AdminDashboard /></ErrorBoundary></AdminRoute>} />
            </Routes>
          </Suspense>
        </Layout>
      </div>
    </Router>
  );
};

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || import.meta.env.VITE_GOOGLE_MAP || '';

const App: React.FC = () => (
  <ErrorBoundary moduleName="Aplicativo">
    <AuthProvider>
      <APIProvider apiKey={API_KEY} version="weekly" libraries={['marker', 'places', 'geocoding', 'routes']}>
        <AppContent />
      </APIProvider>
    </AuthProvider>
  </ErrorBoundary>
);


const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary space-y-4">
    <Loader2 size={40} className="animate-spin" />
    <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Carregando Módulo...</p>
  </div>
);

const SafetyGuard: React.FC = () => {
  const [speedAlert, setSpeedAlert] = useState(false);
  
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    
    let watchId: number;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => { 
          const speed = pos.coords.speed || 0;
          if (speed > 15) setSpeedAlert(true); 
          else setSpeedAlert(false); 
        },
        () => {
          // Ignoramos erros de permissão ou timeout para não travar a aplicação
        }, 
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 }
      );
    } catch (e) {
      console.warn('SafetyGuard Geolocation failed to initialize');
    }
    
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (!speedAlert) return null;
  return (
    <div className="fixed inset-0 z-[10000] bg-red-600 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <span className="material-symbols-outlined text-[120px] text-white mb-6 filled">front_hand</span>
      <h2 className="text-white text-3xl font-black mb-4 italic uppercase">Vixe! Tá correndo é?</h2>
      <p className="text-white/90 text-lg font-bold mb-8">Pare o carro num lugar seguro pra usar o app!</p>
      <button onClick={() => setSpeedAlert(false)} className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black uppercase shadow-2xl active:scale-95 transition-transform">Já parei!</button>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode, auth: boolean }> = ({ children, auth }) => {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <main className="flex-1">
        {children}
      </main>
      <BottomNav auth={auth} />
    </div>
  );
};

const BottomNav: React.FC<{ auth: boolean }> = ({ auth }) => {
  const location = useLocation();
  
  const hiddenPrefixes = [
    '/reportar', 
    '/anunciar', 
    '/login', 
    '/registrar',
    '/termos', 
    '/politica-de-privacidade',
    '/termos-e-uso',
    '/central-de-politicas',
    '/fidelidade/gerir', 
    '/mneme/lista', 
    '/mneme/mercado'
  ];

  const shouldHide = location.pathname === '/' || hiddenPrefixes.some(p => location.pathname.startsWith(p));

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)] bg-[#050d09]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <nav className="h-20 px-6 flex items-center justify-between max-w-lg mx-auto relative gap-1">
        <NavItem to="/portal" icon="explore" label="Portal" active={location.pathname === '/portal'} />
        <NavItem to="/dashboard" icon="dashboard" label="Painel" active={location.pathname === '/dashboard'} />
        <NavItem to="/mneme" icon="shopping_basket" label="Cesta" active={location.pathname.startsWith('/mneme')} />
        
        {/* Destaque Central: Fidelidade */}
        <div className="relative -top-6">
           <Link to="/alertas" className="size-16 rounded-[1.2rem] bg-primary flex items-center justify-center shadow-[0_10px_30px_rgba(0,230,118,0.3)] border-4 border-[#050d09] active:scale-95 transition-transform group">
              <span className="material-symbols-outlined text-black text-[28px] group-hover:rotate-12 transition-transform">map</span>
           </Link>
        </div>

        <NavItem to="/fidelidade" icon="confirmation_number" label="Porta-luvas" active={location.pathname === '/fidelidade'} />
        <NavItem 
          to={auth ? "/perfil" : "/login"} 
          icon={auth ? "account_circle" : "person"} 
          label={auth ? "Perfil" : "Entrar"} 
          active={location.pathname === '/perfil' || location.pathname === '/login'} 
        />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: string; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-14 ${active ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}>
    <span className={`material-symbols-outlined text-[26px] ${active ? 'filled scale-110' : ''} transition-transform`}>
      {icon}
    </span>
    <span className={`text-[9px] font-black uppercase tracking-tight ${active ? 'opacity-100' : 'opacity-70'}`}>
      {label}
    </span>
  </Link>
);

export default App;
