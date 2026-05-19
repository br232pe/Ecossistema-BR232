import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  MessageSquare, 
  Share2, 
  Flame, 
  Heart,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityLife: React.FC<{ auth?: boolean }> = ({ auth }) => {
  const navigate = useNavigate();

  const posts = [
    { 
      id: 1, 
      user: 'Júlio Rodovias', 
      city: 'Gravatá', 
      content: 'A feira de Bezerros tá excelente hoje! Muita variedade de artesanato no KM 102.', 
      likes: 24, 
      comments: 5,
      time: '1h'
    },
    { 
      id: 2, 
      user: 'Posto Sertanejo', 
      city: 'Arcoverde', 
      content: 'Parada obrigatória para quem sobe o sertão. Café fresquinho e pão na chapa 24h.', 
      likes: 56, 
      comments: 12,
      time: '3h',
      tag: 'Patrono'
    },
  ];

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-32">
      {/* Header */}
      <header className="px-6 py-12 text-center space-y-6 relative overflow-hidden">
         <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
               <Users size={16} className="text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Pulso da Comunidade BR232</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Vozes da <br/><span className="text-primary italic">Rodovia.</span></h1>
            <p className="text-slate-400 text-sm md:text-base font-medium italic max-w-xl mx-auto">Conectando histórias, dicas e a força de quem faz a malha acontecer.</p>
         </div>
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00E676 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-12">
        
        {/* Post Creator (Auth Only) */}
        {auth ? (
          <div className="p-1 px-1 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden focus-within:border-primary/40 transition-all">
             <div className="p-6 space-y-4">
                <textarea 
                  placeholder="O que está acontecendo no seu KM hoje?"
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium italic resize-none h-24 placeholder:text-slate-600"
                />
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="flex gap-2">
                      <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-500 hover:text-primary">
                         <MapPin size={18} />
                      </button>
                      <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-500 hover:text-primary">
                         <Globe size={18} />
                      </button>
                   </div>
                   <button className="h-12 px-8 bg-primary hover:bg-primary-dark text-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-primary/20">
                      Publicar
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="w-full p-8 bg-white/5 border border-white/10 rounded-[2rem] text-center space-y-4 group hover:border-primary/30 transition-all"
          >
             <h3 className="text-xl font-black italic uppercase italic leading-none group-hover:text-primary transition-colors">Entre para participar da conversa.</h3>
             <p className="text-slate-500 text-xs italic">Aumente seu Mérito Individual compartilhando informações úteis.</p>
          </button>
        )}

        {/* Community Feed */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic">Feed Regional</h3>
              <div className="flex gap-4">
                 <button className="text-[10px] font-black uppercase tracking-widest text-primary">Recentes</button>
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-600">Populares</button>
              </div>
           </div>

           <div className="space-y-6">
              {posts.map(post => (
                <div key={post.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.04] transition-all">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black italic text-xl">
                            {post.user[0]}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <h4 className="text-sm font-black italic uppercase italic leading-none">{post.user}</h4>
                               {post.tag && (
                                 <span className="px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[7px] font-black uppercase leading-none">{post.tag}</span>
                               )}
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">{post.city} • {post.time} atrás</p>
                         </div>
                      </div>
                      <button className="text-slate-700 hover:text-primary transition-colors">
                         <Share2 size={18} />
                      </button>
                   </div>
                   
                   <p className="text-base font-medium italic text-slate-300 leading-relaxed">
                      {post.content}
                   </p>

                   <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                      <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors group">
                         <Heart size={18} className="group-active:scale-125 transition-transform" />
                         <span className="text-[10px] font-black">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                         <MessageSquare size={18} />
                         <span className="text-[10px] font-black">{post.comments}</span>
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Ranking Highlight */}
        <section className="p-10 bg-[#0c1a14] border border-primary/20 rounded-[3rem] relative overflow-hidden group">
           <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                 <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-black">
                    <TrendingUp size={24} />
                 </div>
                 <h3 className="text-3xl font-black italic uppercase italic leading-tight">Elite da Malha.</h3>
                 <p className="text-slate-400 text-sm italic">Os usuários que mais contribuem com a segurança e economia da rodovia.</p>
                 <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    Ver Ranking Completo <ArrowUpRight size={16} />
                 </button>
              </div>
              <div className="space-y-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-black italic text-slate-600">#{i}</span>
                         <span className="text-sm font-black italic uppercase">Usuário_{i*12}</span>
                      </div>
                      <span className="text-[10px] font-black text-primary">98.2 IP</span>
                   </div>
                 ))}
              </div>
           </div>
           {/* Abstract pattern */}
           <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[80px] pointer-events-none group-hover:scale-110 transition-transform"></div>
        </section>

      </main>
    </div>
  );
};

export default CommunityLife;
