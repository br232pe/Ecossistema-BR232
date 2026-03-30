import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, MapPin, Star, BadgeCheck, ChevronDown, MessageCircle } from 'lucide-react';
import SmartHeader from '../components/SmartHeader';
import { db, StoredAd } from '../services/db';

const Classifieds: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<StoredAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.ads.getAll().then(data => {
      setAds(data);
      setLoading(false);
    });
  }, []);

  const openWhatsApp = (phone?: string, title?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Vi seu anúncio "${title}" no Ecossistema BR232 e gostaria de mais informações.`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-background-dark min-h-screen text-white pb-32">
      <SmartHeader 
        title="Classificados" 
        subtitle="A Feira Digital da Rodovia"
        rightAction={
          <button className="size-10 bg-white/5 rounded-full flex items-center justify-center relative border border-white/5">
            <Bell size={20} className="text-slate-300" />
            <div className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full ring-2 ring-background-dark"></div>
          </button>
        }
      />

      {/* Search */}
      <div className="px-6 mb-6 mt-2">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Peças, Serviços, Produtos..." 
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 flex gap-3 overflow-x-auto no-scrollbar mb-8">
        <FilterPill active icon={<MapPin size={12}/>} label="Toda BR-232" showChevron />
        <FilterPill label="Recife" />
        <FilterPill label="Caruaru" />
        <FilterPill label="Serra Talhada" />
      </div>

      <div className="px-6 flex gap-3 overflow-x-auto no-scrollbar mb-8">
        <CategoryPill active label="Tudo" />
        <CategoryPill label="Mecânica" />
        <CategoryPill label="Peças" />
        <CategoryPill label="Turismo" />
        <CategoryPill label="Sulanca" />
      </div>

      <main className="space-y-10">
        {/* Featured Section */}
        <section className="space-y-4">
          <div className="px-6 flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight italic">Destaques Ouro</h3>
            <button className="text-[10px] font-black uppercase text-primary">Ver Todos</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4">
            {ads.filter(a => a.isPremium).map(ad => (
              <FeaturedCard 
                key={ad.id}
                img={ad.img}
                title={ad.title}
                cat={ad.category}
                loc={ad.city}
                rating={ad.rating.toFixed(1)}
                tag={ad.isPremium ? "Destaque" : ""}
                isVerified={ad.isVerified}
                onContact={() => openWhatsApp(ad.phone, ad.title)}
              />
            ))}
            {/* Fallback se não houver reais */}
            {ads.filter(a => a.isPremium).length === 0 && (
              <>
                <FeaturedCard 
                  img="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500"
                  title="Hotel Fazenda Gravatá"
                  cat="Turismo • Resort"
                  loc="Gravatá, PE • km 85"
                  rating="4.8"
                  tag="Top Rated"
                />
                <FeaturedCard 
                  img="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500"
                  title="EcoSolar Soluções"
                  cat="Energia • Obras"
                  loc="Arcoverde, PE"
                  rating="Verificado"
                  tag="Patrocinado"
                  isVerified
                />
              </>
            )}
          </div>
        </section>

        {/* Recent Listings */}
        <section className="px-6 space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight italic">Recentes na Feira</h3>
          <div className="space-y-4">
             {ads.filter(a => !a.isPremium).map(ad => (
               <ListItem 
                 key={ad.id}
                 img={ad.img}
                 title={ad.title}
                 cat={ad.category}
                 loc={ad.city}
                 price={ad.price}
                 isVerified={ad.isVerified}
                 onContact={() => openWhatsApp(ad.phone, ad.title)}
               />
             ))}
             {/* Fallback se não houver reais */}
             {ads.filter(a => !a.isPremium).length === 0 && (
               <>
                 <ListItem 
                   img="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=200"
                   title="Engenheiro Civil Sênior"
                   cat="Vaga de Emprego"
                   loc="Serra Talhada • Há 2h"
                   price="R$ 6k"
                 />
                 <ListItem 
                   img="https://images.unsplash.com/photo-1547949003-9792a18a2601?w=200"
                   title="Artesanato em Couro"
                   cat="Produtos Locais"
                   loc="Bezerros • Direto do Artesão"
                   price="R$ 150"
                 />
               </>
             )}
          </div>
        </section>
      </main>

      {/* FAB */}
      <button 
        onClick={() => navigate('/anunciar')}
        className="fixed bottom-24 right-6 size-16 bg-primary text-black rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,230,118,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-white/20"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const FilterPill = ({ active, icon, label, showChevron }: any) => (
  <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-tighter shrink-0 transition-all ${active ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-slate-400'}`}>
    {icon} {label} {showChevron && <ChevronDown size={14} />}
  </button>
);

const CategoryPill = ({ active, label }: any) => (
  <button className={`px-5 py-2 rounded-full border text-[11px] font-bold shrink-0 transition-all ${active ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-slate-500'}`}>
    {label}
  </button>
);

const FeaturedCard = ({ img, title, cat, loc, rating, tag, isVerified, onContact }: any) => (
  <div className="w-72 flex-shrink-0 bg-surface-dark rounded-[2rem] overflow-hidden border border-white/5 group cursor-pointer shadow-lg">
    <div className="h-44 relative overflow-hidden">
      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={title} />
      <div className={`absolute top-4 left-4 px-3 py-1 text-[9px] font-black uppercase rounded-lg shadow-lg ${tag === 'Top Rated' ? 'bg-primary text-black' : 'bg-blue-500 text-white'}`}>
        {tag}
      </div>
    </div>
    <div className="p-5 space-y-2">
      <h4 className="font-black text-base truncate italic uppercase">{title}</h4>
      <p className="text-[10px] font-bold text-slate-500 uppercase">{cat}</p>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
          <MapPin size={12} className="text-primary" /> {loc}
        </div>
        <div className="flex items-center gap-1">
          {isVerified ? (
            <div className="flex items-center gap-1 text-[10px] font-black text-blue-400 uppercase">
              <BadgeCheck size={14} fill="currentColor" className="text-white" /> Verificado
            </div>
          ) : (
            <>
              <Star size={12} className="text-yellow-500" fill="currentColor" />
              <span className="text-[10px] font-black">{rating}</span>
            </>
          )}
        </div>
      </div>
      <button 
        onClick={onContact}
        className="w-full mt-4 text-[10px] font-black uppercase text-primary border-t border-white/5 pt-4 flex items-center justify-end gap-2 hover:tracking-widest transition-all"
      >
        <MessageCircle size={14} /> Negociar no WhatsApp
      </button>
    </div>
  </div>
);

const ListItem = ({ img, title, cat, loc, price, isVerified, onContact }: any) => (
  <div onClick={onContact} className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-[2rem] hover:bg-white/10 hover:border-primary/20 transition-all group cursor-pointer">
    <div className="size-20 rounded-2xl overflow-hidden shrink-0">
      <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={title} />
    </div>
    <div className="flex-1 min-w-0 space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm truncate pr-2 italic uppercase">{title}</h4>
        {price && <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{price}</span>}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase">{cat}</p>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-1 text-[9px] text-slate-600 font-bold uppercase">
          <MapPin size={10} className="text-primary" /> {loc}
        </div>
        <div className="flex items-center gap-2">
           {isVerified && <BadgeCheck size={14} className="text-blue-400" />}
           <MessageCircle size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  </div>
);

export default Classifieds;
