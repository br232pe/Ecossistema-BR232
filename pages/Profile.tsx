import React from 'react';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  ShieldCheck, 
  TrendingUp, 
  History, 
  Settings, 
  LogOut, 
  MapPin, 
  Zap,
  Award,
  ChevronRight,
  Bell,
  ShoppingBag,
  Tag
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

      <header className="px-6 pt-12 pb-20 relative z-10 flex flex-col items-center">
         <div className="relative group">
            <div className="size-32 rounded-[2.5rem] bg-white/5 border border-white/10 p-1 backdrop-blur-3xl">
               <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center text-primary overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <UserIcon size={48} />
                  )}
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 size-10 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg border-4 border-[#05100a]">
               <Award size={20} />
            </div>
         </div>

         <div className="mt-8 text-center space-y-2">
            <h1 className="text-3xl font-black italic uppercase italic tracking-tighter leading-none">{user?.displayName || 'Motorista Anônimo'}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
               {profile.identities?.isPatron && <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded-full italic">Patrono</span>}
               {profile.identities?.isDriver && <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded-full italic">Elite</span>}
               <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-white/10 text-slate-400 border border-white/10 rounded-full italic">{profile.currentCity || 'Recife'}</span>
            </div>
         </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-10 space-y-10 relative z-20">
        
         {/* IP Breakdown - Diretriz Geoeconômica e Auditoria de Identidade */}
         <section className="bg-gradient-to-br from-[#0c1a14] to-[#05100a] rounded-[2.5rem] border border-primary/20 p-8 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] italic text-primary">Índice de Pertencimento</h2>
                  <span className="text-4xl font-black italic uppercase italic leading-none">{(profile.stats?.ip ?? 0).toFixed(1)}%</span>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                     <div className="flex items-center justify-between text-slate-500">
                        <TrendingUp size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">65%</span>
                     </div>
                     <div className="text-xl font-black italic leading-none">{(profile.stats?.merit ?? 0).toFixed(1)}%</div>
                     <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mérito Indiv.</div>
                  </div>
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                     <div className="flex items-center justify-between text-slate-500">
                        <ShieldCheck size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">35%</span>
                     </div>
                     <div className="text-xl font-black italic leading-none">{(profile.stats?.associationForce ?? 0).toFixed(1)}%</div>
                     <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Força Assoc.</div>
                  </div>
               </div>

               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.stats?.ip ?? 0}%` }}
                    className="h-full bg-primary"
                  />
               </div>
            </div>
           
           <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[80px] pointer-events-none"></div>
        </section>

        {/* Action Menu */}
        <div className="grid gap-4">
           <MenuButton 
             onClick={() => navigate('/meus-anuncios')}
             icon={<Tag size={20}/>} 
             label="Meus Anúncios" 
             desc="Gerencie suas ofertas na Feira Digital" 
           />
           <MenuButton 
             onClick={() => navigate('/porta-luvas')}
             icon={<ShoppingBag size={20}/>} 
             label="Porta-Luvas Digital" 
             desc="Resgate tickets de parada e KMs de Influência" 
           />
           <MenuButton 
             onClick={() => navigate('/registro')}
             icon={<Zap size={20}/>} 
             label="Giro Multimodal" 
             desc="Mudar ou Adicionar Identidades" 
           />
           <MenuButton icon={<Bell size={20}/>} label="Configurar Alertas" desc="Ative notificações pro raio de 50km" />
           <MenuButton icon={<ShieldCheck size={20}/>} label="Protocolo de Discrição" desc="Controle de privacidade e visibilidade" />
           <MenuButton icon={<History size={20}/>} label="Atividade Recente" desc="Últimos logs na malha" />
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col gap-3">
           <button className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all hover:bg-white/10 focus:bg-white/10">
              <Settings size={18} /> Configurações da Conta
           </button>
           <button 
             onClick={handleLogout}
             className="w-full h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all hover:bg-red-500/20 active:scale-95"
           >
              <LogOut size={18} /> Sair do Sistema
           </button>
        </div>

        {/* Version Info */}
        <div className="text-center space-y-1 opacity-20 hover:opacity-100 transition-opacity">
           <p className="text-[9px] font-black uppercase tracking-[0.5em]">ECOBR232</p>
           <p className="text-[8px] font-bold uppercase tracking-widest">Build v1.0.26-LTS</p>
        </div>

      </main>
    </div>
  );
};

const MenuButton = ({ icon, label, desc }: any) => (
  <button className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.08] transition-all text-left">
     <div className="flex items-center gap-6">
        <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-primary transition-all">
           {icon}
        </div>
        <div>
           <h4 className="text-sm font-black italic uppercase italic leading-none">{label}</h4>
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">{desc}</p>
        </div>
     </div>
     <ChevronRight size={18} className="text-slate-700 group-hover:text-primary transition-all group-hover:translate-x-1" />
  </button>
);

export default Profile;
