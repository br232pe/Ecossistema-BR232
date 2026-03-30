import React from 'react';
import { 
  LogOut, 
  ShieldCheck, 
  User, 
  Mail, 
  MapPin,
  Settings
} from 'lucide-react';
import SmartHeader from '../components/SmartHeader';
import { useAuth } from '../src/contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-[#0a0f1d] min-h-screen pb-36 font-display text-white">
      <SmartHeader 
        title="Meu Perfil" 
        subtitle="Dados da Conta"
        rightAction={
          <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <Settings size={20} className="text-slate-400" />
          </button>
        }
      />

      <div className="p-6">
        {/* Cartão de Identidade */}
        <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="relative mb-6">
            <div className="size-32 rounded-[2rem] bg-slate-800 border-4 border-[#0a0f1d] overflow-hidden shadow-2xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-500">
                  <User size={48} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-3 -right-3 size-10 bg-primary rounded-xl flex items-center justify-center border-4 border-[#0a0f1d] text-[#0a0f1d] shadow-lg">
              <ShieldCheck size={20} />
            </div>
          </div>

          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">
            {user?.displayName || 'Viajante BR-232'}
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
            {user?.email || 'viajante@br232.com'}
          </p>

          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
             <div className="size-2 rounded-full bg-primary animate-pulse"></div>
             <span className="text-[10px] font-black uppercase text-primary tracking-widest">Membro Verificado</span>
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-4">Dados Pessoais</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
               <InfoItem icon={<User size={18}/>} label="Nome Completo" value={user?.displayName || 'Não informado'} />
               <div className="h-px bg-white/5 mx-6"></div>
               <InfoItem icon={<Mail size={18}/>} label="E-mail" value={user?.email || 'Não informado'} />
               <div className="h-px bg-white/5 mx-6"></div>
               <InfoItem icon={<MapPin size={18}/>} label="Região" value="Pernambuco, BR" />
            </div>
          </section>

          <button 
            onClick={logout} 
            className="w-full h-16 mt-8 flex items-center justify-center gap-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: any, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-6 hover:bg-white/[0.02] transition-colors">
    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white italic">{value}</p>
    </div>
  </div>
);

export default Profile;