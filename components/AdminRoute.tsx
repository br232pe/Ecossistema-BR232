import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  // In a real app, you would check user role in Firestore
  // Here we simulate with email check or simply check if user exists
  const isAdmin = user && (user.email === 'br232pe@gmail.com' || user.email?.endsWith('@admin.com'));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05100a] flex flex-col items-center justify-center text-red-500">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Autenticação Admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
