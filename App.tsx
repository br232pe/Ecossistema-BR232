import React, { Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';

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
import { SidebarLayout } from './src/components/SidebarLayout';

// Componente de Blindagem
import ErrorBoundary from './components/ErrorBoundary';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PromoterRoute from './components/PromoterRoute';

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
const MotoTaxiLanding = React.lazy(() => import('./pages/MotoTaxiLanding'));
const PostAd = React.lazy(() => import('./pages/PostAd'));
const MyAds = React.lazy(() => import('./pages/MyAds'));
const Roadmap = React.lazy(() => import('./pages/Roadmap'));
const LoyaltyManager = React.lazy(() => import('./pages/LoyaltyManager'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const DashboardPromotor = React.lazy(() => import('./pages/DashboardPromotor'));
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
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<ErrorBoundary moduleName="Autenticação"><Login /></ErrorBoundary>} />
            <Route path="/registrar" element={<ErrorBoundary moduleName="Autenticação"><Login /></ErrorBoundary>} />

            {/* Canal Operacional / Rotas sob Chassi SidebarLayout */}
            <Route element={<SidebarLayout auth={isAuthenticated} />}>
              <Route path="/termos" element={<Terms />} />
              <Route path="/politica-de-privacidade" element={<PolicyCenter />} />
              <Route path="/termos-e-uso" element={<PolicyCenter />} />
              <Route path="/central-de-politicas" element={<PolicyCenter />} />
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
              <Route path="/moto-taxi/planos" element={<ErrorBoundary moduleName="Planos Moto-Táxi"><MotoTaxiLanding /></ErrorBoundary>} />
              <Route path="/moto-taxi/landing" element={<ErrorBoundary moduleName="SaaS Moto-Táxi"><MotoTaxiLanding /></ErrorBoundary>} />

              {/* Módulo Fidelidade */}
              <Route path="/fidelidade" element={<ProtectedRoute><ErrorBoundary moduleName="Porta-Luvas Digital"><LoyaltyWallet /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/fidelidade/gerir" element={<ProtectedRoute><ErrorBoundary moduleName="Gestor Fidelidade"><LoyaltyManager /></ErrorBoundary></ProtectedRoute>} />

              {/* Módulo Mnēmē (Gestão Doméstica) */}
              <Route path="/mneme" element={<ProtectedRoute><ErrorBoundary moduleName="Mnēmē"><Mneme /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/mneme/lista/:id" element={<ProtectedRoute><ErrorBoundary moduleName="Lista Mnēmē"><MnemeListDetail /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/mneme/dashboard" element={<ProtectedRoute><ErrorBoundary moduleName="Dashboard Mnēmē"><MnemeDashboard /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/mneme/mercado" element={<ProtectedRoute><ErrorBoundary moduleName="Consultor de Gôndola"><MnemeMarket /></ErrorBoundary></ProtectedRoute>} />

              {/* Redirecionamento de Rota Depreciada */}
              <Route path="/perfil" element={<Navigate to="/dashboard" replace />} />
              <Route path="/reportar" element={<ProtectedRoute><ErrorBoundary moduleName="Reporte de Alertas"><ReportAlert /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/anunciar" element={<ProtectedRoute><ErrorBoundary moduleName="Gestor de Anúncios"><PostAd /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/anunciar/:adId" element={<ProtectedRoute><ErrorBoundary moduleName="Editor de Anúncio"><PostAd /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><ErrorBoundary moduleName="Admin Dashboard"><AdminDashboard /></ErrorBoundary></AdminRoute>} />
              <Route path="/promotor" element={<PromoterRoute><ErrorBoundary moduleName="Dashboard do Promotor"><DashboardPromotor /></ErrorBoundary></PromoterRoute>} />
              <Route path="/dashboard-promotor" element={<PromoterRoute><ErrorBoundary moduleName="Dashboard do Promotor"><DashboardPromotor /></ErrorBoundary></PromoterRoute>} />
              <Route path="/dashboard-tronco" element={<PromoterRoute><ErrorBoundary moduleName="Dashboard Promotor Tronco">
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#050d09] border border-emerald-900/40 m-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E676] mb-2">Módulo Territorial</span>
                  <h1 className="text-xl font-black uppercase tracking-wider font-mono">Dashboard do Promotor <span className="text-[#00E676]">Tronco</span></h1>
                  <p className="text-xs text-slate-400 mt-2 max-w-md font-sans">Esta interface está reservada para o escopo subsequente de governança territorial e gerenciamento de microrregiões da BR-232.</p>
                </div>
              </ErrorBoundary></PromoterRoute>} />
              <Route path="/dashboard-financeiro" element={<PromoterRoute><ErrorBoundary moduleName="Dashboard Financeiro">
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#050d09] border border-emerald-900/40 m-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E676] mb-2">Módulo de Auditoria</span>
                  <h1 className="text-xl font-black uppercase tracking-wider font-mono">Dashboard <span className="text-[#00E676]">Financeiro</span></h1>
                  <p className="text-xs text-slate-400 mt-2 max-w-md font-sans">Esta interface está reservada para o escopo subsequente de auditoria de caixas, split de pagamentos e liquidações gerais do ecossistema e do gateway bancário.</p>
                </div>
              </ErrorBoundary></PromoterRoute>} />
            </Route>
          </Routes>
        </Suspense>
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



export default App;
