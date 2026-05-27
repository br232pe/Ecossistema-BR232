import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PromoterRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05100a] flex flex-col items-center justify-center text-primary">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Autenticação Promotor...</p>
      </div>
    );
  }

  const isPromoter = user && (
    profile?.role === 'promoter_branch' || 
    profile?.role === 'admin' ||
    user.email === 'br232pe@gmail.com'
  );

  if (!isPromoter) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PromoterRoute;
