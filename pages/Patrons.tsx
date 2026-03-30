
import React from 'react';
import { MapPin, Building2, ExternalLink, Handshake } from 'lucide-react';
import SmartHeader from '../components/SmartHeader';

const Patrons: React.FC = () => {

  return (
    <div className="bg-background-dark min-h-screen text-white pb-32">
      <SmartHeader 
        title="Patronos" 
        subtitle="Hall de Apoiadores"
      />

      <main className="p-6 space-y-10">
        {/* Intro */}
        <section className="space-y-4">
          <h1 className="text-3xl font-black italic tracking-tighter leading-tight">
            Impulsionando o <br/><span className="text-primary">Ecossistema BR232</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase">
            Conectando Agreste, Sertão e Capital através de inovação e parceria.
          </p>
        </section>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button className="flex-1 py-3 px-4 bg-primary text-black rounded-xl font-black uppercase text-[10px] italic shadow-lg">Parceiros Corporativos</button>
          <button className="flex-1 py-3 px-4 text-slate-500 font-black uppercase text-[10px] italic">Patronos da Comunidade</button>
        </div>

        {/* Strategic Partners */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black italic uppercase tracking-tight italic">Parceiros Estratégicos</h3>
            <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Platinum</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            <PartnerHeroCard 
              img="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600"
              title="Agreste Tech Solutions"
              desc="Impulsionando a transformação digital ao longo do corredor nordestino com..."
              loc="Capital"
            />
            <PartnerHeroCard 
              img="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=600"
              title="Sertão Energy"
              desc="Liderando o setor de energias renováveis para empresas lindeiras na rodovia..."
              loc="Sertão"
            />
          </div>
        </section>

        {/* Gold Partners */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-yellow-400"></div>
            <h3 className="text-lg font-black italic uppercase tracking-tight">Parceiros Ouro</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <GoldCard icon="local_shipping" label="Logística Nordeste" />
            <GoldCard icon="agriculture" label="AgroValley" />
            <button className="col-span-2 h-20 bg-primary hover:bg-primary-dark text-black rounded-3xl font-bold text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,230,118,0.2)]">
              <Handshake size={20} /> Seja um Patrocinador
            </button>
            <GoldCard icon="school" label="Educa PE" />
            <GoldCard icon="construction" label="Construtora Via" />
          </div>
        </section>

        {/* Silver Partners */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-slate-400"></div>
            <h3 className="text-lg font-black italic uppercase tracking-tight">Parceiros Prata</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="aspect-square rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-600">
                 <span className="material-symbols-outlined text-2xl">
                    {['storefront', 'restaurant', 'pets', 'sports_soccer', 'local_cafe', 'directions_car'][i]}
                 </span>
               </div>
             ))}
          </div>
        </section>

        {/* Recent Patrons */}
        <section className="space-y-4 pt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Patronos Recentes</h3>
            <button className="text-[10px] font-black uppercase text-primary">Ver Todos</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Maria Silva', 'João Santos', 'Ana Oliveira', 'Pedro Costa', 'Carla Mendes', 'Lucas Pereira'].map(name => (
              <span key={name} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase">{name}</span>
            ))}
            <span className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase">+ 142 outros</span>
          </div>
        </section>
      </main>
    </div>
  );
};

const PartnerHeroCard = ({ img, title, desc, loc }: any) => (
  <div className="w-72 flex-shrink-0 bg-surface-dark rounded-[2.5rem] overflow-hidden border border-white/5 group">
    <div className="h-44 relative">
      <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt={title} />
      <div className="absolute top-4 right-4 px-3 py-1 bg-background-dark/80 backdrop-blur-md text-[9px] font-black uppercase rounded-lg border border-white/10 flex items-center gap-1.5">
        <MapPin size={10} className="text-primary" /> {loc}
      </div>
      <div className="absolute bottom-4 left-4 size-10 bg-white rounded-xl flex items-center justify-center text-black shadow-xl">
        <Building2 size={20} />
      </div>
    </div>
    <div className="p-6 space-y-3">
      <h4 className="font-black text-lg leading-tight">{title}</h4>
      <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase line-clamp-2 italic">{desc}</p>
      <button className="w-full mt-4 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-white/5 transition-all">
        Visitar Site <ExternalLink size={14} />
      </button>
    </div>
  </div>
);

const GoldCard = ({ icon, label }: any) => (
  <div className="h-32 rounded-[2rem] bg-surface-dark border border-white/5 flex flex-col items-center justify-center gap-3 hover:border-primary/30 transition-all cursor-pointer">
    <span className="material-symbols-outlined text-4xl text-slate-500">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-tight italic text-center px-4">{label}</span>
  </div>
);

export default Patrons;
