import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Wrench, 
  Home as HomeIcon, 
  Cpu, 
  Truck, 
  Zap, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  AlertTriangle, 
  ChevronRight, 
  Filter,
  Activity,
  Droplets,
  Lightbulb,
  Building2,
  Sprout
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import { useAuth } from '../src/contexts/AuthContext';

const VidaCidades: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Todas", icon: <Filter size={18} /> },
    { name: "Emergenciais", icon: <Zap size={18} />, color: "#ff4d4d" },
    { name: "Residenciais", icon: <HomeIcon size={18} />, color: "#00e676" },
    { name: "Técnicos", icon: <Cpu size={18} />, color: "#3b82f6" },
    { name: "Urbanos", icon: <Truck size={18} />, color: "#f59e0b" },
    { name: "Rurais", icon: <Sprout size={18} />, color: "#10b981" }
  ];

  useEffect(() => {
    const q = query(
      collection(db, 'services'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Todas" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#05100a] text-white font-sans pb-32">
      {/* Hero Section / Search */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden border-b border-white/5 px-6">
         <div className="absolute inset-0 bg-gradient-to-down from-primary/10 to-transparent opacity-50" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
         
         <div className="relative z-10 w-full max-w-4xl text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
               <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                 Vida das <span className="text-primary">Cidades</span>
               </h1>
               <p className="text-sm md:text-lg font-medium text-slate-400 uppercase tracking-widest max-w-2xl mx-auto">
                 A infraestrutura operacional da vida cotidiana regional na BR-232.
               </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative group max-w-2xl mx-auto"
            >
               <div className="absolute -inset-1 bg-primary/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
               <div className="relative flex items-center bg-white/5 border border-white/10 rounded-[2rem] p-2 backdrop-blur-3xl focus-within:border-primary/50 transition-all">
                  <div className="px-6 text-slate-500">
                    <Search size={24} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="O que você precisa agora? (Ex: Encanador, Pedreiro, Chaveiro)"
                    className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-slate-600 h-16"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="h-14 px-8 bg-primary text-black rounded-[1.5rem] font-black uppercase text-xs hover:bg-[#00c865] transition-all shrink-0">
                    Buscar
                  </button>
               </div>
            </motion.div>
         </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* Categories Bar */}
        <section className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4">
           {categories.map((cat) => (
             <button
               key={cat.name}
               onClick={() => setActiveCategory(cat.name)}
               className={`flex items-center gap-3 px-6 h-14 rounded-2xl border transition-all whitespace-nowrap ${
                 activeCategory === cat.name 
                 ? 'bg-primary border-primary text-black' 
                 : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
               }`}
             >
               <span className={activeCategory === cat.name ? 'text-black' : ''} style={{ color: activeCategory === cat.name ? undefined : cat.color }}>
                 {cat.icon}
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
             </button>
           ))}
        </section>

        {/* Urgency Alert Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Prestadores Disponíveis Agora</h2>
                <div className="flex items-center gap-2 text-primary">
                   <div className="size-2 bg-primary rounded-full animate-pulse" />
                   <span className="text-[8px] font-black uppercase tracking-widest italic">Visibilidade Low Cost</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredServices.length > 0 ? filteredServices.map((service, idx) => (
                   <ServiceCard key={service.id || idx} service={service} />
                 )) : (
                   <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/2">
                      <p className="text-slate-500 italic font-medium">Nenhum serviço encontrado para esta categoria ou busca.</p>
                   </div>
                 )}
              </div>
           </div>

           <aside className="space-y-8">
              <div className="p-8 bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 rounded-[2.5rem] relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 size-40 bg-red-500/10 blur-[80px] group-hover:bg-red-500/20 transition-all" />
                 <div className="relative space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="size-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                        <AlertTriangle size={24} />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-red-500 underline decoration-red-500/30 underline-offset-4">Emergência 24h</span>
                    </div>
                    <div>
                       <h3 className="text-2xl font-black italic uppercase leading-tight mb-2">Painel de <br/><span className="text-red-500">Urgências</span></h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                         Precisou agora? Veja quem atende com SLA de resposta em menos de 10 min.
                       </p>
                    </div>
                    <button 
                      onClick={() => navigate('/vida-cidades/urgencia')}
                      className="w-full h-14 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Abrir Canal de Urgência
                    </button>
                 </div>
              </div>

              <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seu Empreendimento</h4>
                 <div className="space-y-4">
                    <p className="text-sm text-slate-400 italic">É um prestador local? Apareça para toda a região com anúncios de baixo custo.</p>
                    <button 
                      onClick={() => navigate('/vida-cidades/prestadores')}
                      className="w-full h-14 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      Painel de Prestadores <ChevronRight size={14} />
                    </button>
                 </div>
              </div>
           </aside>
        </section>

      </main>
    </div>
  );
};

const ServiceCard = ({ service }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group flex flex-col gap-6 relative overflow-hidden"
  >
     {service.pricingModel === 'top' && (
       <div className="absolute top-0 right-0 pt-3 pr-6">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
             <div className="size-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00e676]" />
             <span className="text-[7px] font-black uppercase text-primary tracking-widest">Destaque Local</span>
          </div>
       </div>
     )}

     <div className="flex items-start gap-6">
        <div className="size-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
           {getCategoryIcon(service.category)}
        </div>
        <div className="space-y-1 pt-1">
           <h4 className="text-xl font-black italic uppercase leading-none">{service.title}</h4>
           <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1"><MapPin size={10} /> {service.neighborhood}, {service.city}</span>
              <span className="flex items-center gap-1 text-primary"><Star size={10} className="fill-primary" /> {service.rating || '5.0'}</span>
           </div>
        </div>
     </div>

     <div className="flex flex-wrap gap-2">
        {service.isUrgent && (
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[7px] font-black text-red-500 uppercase tracking-widest">
            Atende Agora
          </span>
        )}
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[7px] font-black text-slate-400 uppercase tracking-widest">
          {service.subCategory || 'Geral'}
        </span>
     </div>

     <div className="flex items-center gap-3 pt-2">
        <a 
          href={`https://wa.me/${service.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-12 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#00c865] active:scale-95 transition-all shadow-[0_5px_15px_#00e676]/20"
        >
          WhatsApp <Phone size={14} />
        </a>
        <button className="h-12 w-12 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/5 transition-all">
          <ChevronRight size={18} />
        </button>
     </div>
  </motion.div>
);

const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case 'Emergenciais': return <Zap size={28} />;
    case 'Residenciais': return <Droplets size={28} />;
    case 'Técnicos': return <Cpu size={28} />;
    case 'Urbanos': return <Truck size={28} />;
    case 'Rurais': return <Sprout size={28} />;
    default: return <Wrench size={28} />;
  }
};

export default VidaCidades;
