import React, { Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Componente de Blindagem
import ErrorBoundary from './components/ErrorBoundary';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy Loading Modules (Code Splitting)
const Welcome = React.lazy(() => import('./pages/Welcome'));
const Login = React.lazy(() => import('./pages/Login'));
const Home = React.lazy(() => import('./pages/Home'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Classifieds = React.lazy(() => import('./pages/Classifieds'));
const CommunityLife = React.lazy(() => import('./pages/CommunityLife'));
const Blog = React.lazy(() => import('./pages/Blog'));
const Patrons = React.lazy(() => import('./pages/Patrons'));
const ReportAlert = React.lazy(() => import('./pages/ReportAlert'));
const MotoTaxi = React.lazy(() => import('./pages/MotoTaxi'));
const PostAd = React.lazy(() => import('./pages/PostAd'));
const Roadmap = React.lazy(() => import('./pages/Roadmap'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Manifesto = React.lazy(() => import('./pages/Manifesto'));
// Módulos de Fidelidade
const LoyaltyWallet = React.lazy(() => import('./pages/LoyaltyWallet'));
const LoyaltyManager = React.lazy(() => import('./pages/LoyaltyManager'));
// Módulos Mnēmē
const Mneme = React.lazy(() => import('./pages/Mneme'));
const MnemeListDetail = React.lazy(() => import('./pages/MnemeList'));
const MnemeMarket = React.lazy(() => import('./pages/MnemeMarket'));

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050d09] flex flex-col items-center justify-center text-primary">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Autenticando na Malha...</p>
      </div>
    );
  }

  useEffect(() => {
    // Corretor de URL para HashRouter em produção
    // Se a URL vier como /#dashboard (sem a barra após o #), nós corrigimos para #/dashboard
    const hash = window.location.hash;
    if (hash && !hash.startsWith('#/')) {
      const newHash = '#/' + hash.substring(1);
      window.location.hash = newHash;
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#050d09] text-white font-display selection:bg-primary selection:text-black">
        <SafetyGuard />
        <Layout auth={isAuthenticated}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<ErrorBoundary moduleName="Autenticação"><Login /></ErrorBoundary>} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/manifesto" element={<Manifesto />} />
              
              {/* Módulos Core */}
              <Route path="/dashboard" element={<ErrorBoundary moduleName="Dashboard Principal"><Home auth={isAuthenticated} /></ErrorBoundary>} />
              <Route path="/alertas" element={<ErrorBoundary moduleName="Monitoramento"><Alerts /></ErrorBoundary>} />
              <Route path="/classificados" element={<ErrorBoundary moduleName="Marketplace"><Classifieds /></ErrorBoundary>} />
              <Route path="/vida" element={<ErrorBoundary moduleName="Vida Comunitária"><CommunityLife auth={isAuthenticated} /></ErrorBoundary>} />
              <Route path="/blog" element={<ErrorBoundary moduleName="Notícias"><Blog /></ErrorBoundary>} />
              <Route path="/patronos" element={<ErrorBoundary moduleName="Parceiros"><Patrons /></ErrorBoundary>} />
              <Route path="/roadmap" element={<Roadmap />} />
              
              {/* Módulo Especializado: Moto-Táxi */}
              <Route path="/moto-taxi" element={<ErrorBoundary moduleName="Ranking Moto-Táxi"><MotoTaxi /></ErrorBoundary>} />

              {/* Módulo Fidelidade */}
              <Route path="/fidelidade" element={<ProtectedRoute><ErrorBoundary moduleName="Porta-Luvas Digital"><LoyaltyWallet /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/fidelidade/gerir" element={<ProtectedRoute><ErrorBoundary moduleName="Gestor Fidelidade"><LoyaltyManager /></ErrorBoundary></ProtectedRoute>} />

              {/* Módulo Mnēmē (Gestão Doméstica) */}
              <Route path="/mneme" element={<ProtectedRoute><ErrorBoundary moduleName="Mnēmē"><Mneme /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/mneme/lista/:id" element={<ProtectedRoute><ErrorBoundary moduleName="Lista Mnēmē"><MnemeListDetail /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/mneme/mercado" element={<ProtectedRoute><ErrorBoundary moduleName="Consultor de Gôndola"><MnemeMarket /></ErrorBoundary></ProtectedRoute>} />

              {/* Rotas Protegidas */}
              <Route path="/perfil" element={<ProtectedRoute><ErrorBoundary moduleName="Perfil do Usuário"><Profile /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/reportar" element={<ProtectedRoute><ErrorBoundary moduleName="Reporte de Alertas"><ReportAlert /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/anunciar" element={<ProtectedRoute><ErrorBoundary moduleName="Gestor de Anúncios"><PostAd /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><ErrorBoundary moduleName="Admin Dashboard"><AdminDashboard /></ErrorBoundary></AdminRoute>} />
            </Routes>
          </Suspense>
        </Layout>
      </div>
    </Router>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
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
    if (!navigator.geolocation) return;
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => { if ((pos.coords.speed || 0) > 15) setSpeedAlert(true); else setSpeedAlert(false); },
      () => {}, { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
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
    <div className="flex flex-col min-h-screen relative">
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <BottomNav auth={auth} />
    </div>
  );
};

const BottomNav: React.FC<{ auth: boolean }> = ({ auth }) => {
  const location = useLocation();
  
  // CORREÇÃO CRÍTICA: A verificação anterior ocultava o menu em TODAS as páginas
  // pois location.pathname sempre começa com '/'
  const hiddenPrefixes = [
    '/reportar', 
    '/anunciar', 
    '/login', 
    '/termos', 
    '/manifesto', 
    '/fidelidade/gerir', 
    '/mneme/lista', 
    '/mneme/mercado'
  ];

  const shouldHide = location.pathname === '/' || hiddenPrefixes.some(p => location.pathname.startsWith(p));

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)] bg-[#050d09]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <nav className="h-20 px-6 flex items-center justify-between max-w-lg mx-auto relative">
        <NavItem to="/dashboard" icon="home" label="Início" active={location.pathname === '/dashboard'} />
        <NavItem to="/alertas" icon="map" label="Mapa" active={location.pathname === '/alertas'} />
        
        {/* Destaque Central: Fidelidade */}
        <div className="relative -top-6">
           <Link to="/fidelidade" className="size-16 rounded-[1.2rem] bg-primary flex items-center justify-center shadow-[0_10px_30px_rgba(0,230,118,0.3)] border-4 border-[#050d09] active:scale-95 transition-transform group">
              <span className="material-symbols-outlined text-black text-[28px] group-hover:rotate-12 transition-transform">confirmation_number</span>
           </Link>
        </div>

        <NavItem to="/vida" icon="explore" label="Explorar" active={location.pathname === '/vida'} />
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