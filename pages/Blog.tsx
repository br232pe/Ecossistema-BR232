import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Search, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  Tag,
  PenTool,
  Menu,
  X
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import { useAuth } from '../src/contexts/AuthContext';
import { BlogPost } from '../src/types';

const Blog: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = ["Todos", "Mobilidade", "Cultura", "Negócios", "Vida Regional", "Logística"];

  useEffect(() => {
    const q = query(
      collection(db, 'blog_posts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty && !searchTerm) {
        seedInitialPost();
      }
      const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      setPosts(postsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchTerm]);

  const seedInitialPost = async () => {
    try {
      const initialPost: Partial<BlogPost> = {
        authorId: "system",
        authorName: "Editorial ECOBR232",
        title: "BR-232: A Espinha Dorsal da Nova Economia Regional",
        excerpt: "Como a digitalização da rodovia está transformando o fluxo de pessoas e negócios em Pernambuco.",
        content: `
          <p>A BR-232 não é apenas asfalto e sinalização; ela é o sistema circulatório de Pernambuco. Conectando a capital ao sertão, esta rodovia carrega consigo a história, a cultura e a força econômica do nosso estado.</p>
          
          <p>Com o ECOBR232, estamos dando o próximo passo: a digitalização desta infraestrutura. Imagine uma malha onde cada quilômetro é monitorado pela comunidade, onde o transporte alternativo é seguro e profissionalizado, e onde o pequeno comerciante de beira de estrada tem a mesma visibilidade digital de uma grande rede.</p>
          
          <h3>O Conceito de Pertencimento</h3>
          <p>O Índice de Pertencimento (IP) é o coração desta revolução. Não se trata apenas de usar um app, mas de construir uma reputação coletiva. Quando um motorista alerta sobre um perigo na pista ou um prestador de serviços em Bezerros atende com excelência, o ecossistema respira melhor.</p>
          
          <p>Estamos construindo uma infraestrutura operacional para a vida regional que mistura mobilidade, serviços e urgência. Este blog será a voz desta transformação.</p>
        `,
        category: "Mobilidade",
        status: 'published',
        coverImage: "https://images.unsplash.com/photo-1545642402-f8c5b9f71c1b?q=80&w=2000&auto=format&fit=crop",
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'blog_posts'), initialPost);
    } catch (err) {
      console.error("Erro ao semear blog:", err);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts[0];

  return (
    <div className="min-h-screen bg-[#050d09] text-white font-sans pb-32">
      {/* Header Stat Bar */}
      <header className="sticky top-0 z-50 bg-[#050d09]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 px-safe">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4 cursor-pointer select-none active:opacity-80 transition-opacity" onClick={() => navigate('/portal')}>
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shadow-lg shrink-0">
                 <img 
                   src="https://firebasestorage.googleapis.com/v0/b/ecossistema-br232.firebasestorage.app/o/Logo-BR232-8.png?alt=media&token=799984b2-18f5-4440-a1c2-a2f0f38c6d0c" 
                   className="size-full object-contain"
                   alt="BR232"
                   referrerPolicy="no-referrer"
                 />
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-widest leading-none">Portal BR232</h1>
              <p className="text-[8px] font-bold text-primary tracking-widest uppercase mt-1">Conectado: Recife</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <nav className="hidden lg:flex items-center gap-6 mr-4">
                 <button onClick={() => navigate('/mneme')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Cesta</button>
                 <button onClick={() => navigate('/guia-servicos')} className="text-[9px] font-black uppercase tracking-widest text-[#00e676] hover:text-primary transition-colors italic px-2 py-1">Serviços</button>
                 <button onClick={() => navigate('/planos')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic px-2 py-1">Planos</button>
                 <button onClick={() => navigate('/blog')} className="text-[9px] font-black uppercase tracking-widest text-[#ff751f] hover:text-primary transition-colors italic px-2 py-1 font-black">Blog</button>
             </nav>
             
             <div className="hidden sm:flex items-center gap-3">
                <button 
                   onClick={() => navigate('/dashboard')}
                   className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-all"
                >
                   Meu Painel
                </button>
             </div>

             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-95 transition-all"
             >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>
      </header>

      {/* Editorial Header */}
      <div className="relative py-16 px-6 border-b border-white/5 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
         
         <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Editorial Regional</span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                    O <span className="text-primary italic">Blog</span>
                  </h1>
                  <p className="text-slate-400 font-medium uppercase tracking-widest text-sm max-w-xl">
                    Vozes da BR-232: Análise, cultura e o cotidiano da vida em movimento.
                  </p>
               </div>

               {profile?.identities?.isColumnist && (
                 <button 
                   onClick={() => navigate('/blog/editor')}
                   className="h-16 px-10 bg-white text-black rounded-2xl flex items-center gap-4 hover:bg-primary transition-all group shrink-0"
                 >
                    <div className="flex flex-col items-start">
                       <span className="text-[10px] font-black uppercase tracking-widest">Área do Autor</span>
                       <span className="text-xs font-bold italic">Publicar Novo Artigo</span>
                    </div>
                    <PenTool size={24} className="group-hover:rotate-12 transition-transform" />
                 </button>
               )}
            </div>

            {/* Categories & Search Bar */}
            <div className="flex flex-col lg:flex-row items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl">
               <div className="flex bg-black/40 p-1.5 rounded-2xl overflow-x-auto w-full lg:w-auto no-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeCategory === cat ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
               <div className="flex-1 w-full relative">
                  <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="O que você quer ler hoje?"
                    className="w-full h-14 pl-16 pr-6 bg-transparent outline-none text-sm font-medium focus:bg-white/5 rounded-2xl transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
         </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-20 space-y-32">
        
        {/* Featured Post */}
        {!searchTerm && activeCategory === "Todos" && featuredPost && (
          <section>
             <motion.div 
               whileHover={{ y: -5 }}
               onClick={() => navigate(`/blog/${featuredPost.id}`)}
               className="group relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden cursor-pointer border border-white/10"
             >
                {featuredPost.coverImage && (
                  <img 
                    src={featuredPost.coverImage} 
                    alt={featuredPost.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 p-12 space-y-6">
                   <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-lg">Destaque</span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{featuredPost.category}</span>
                   </div>
                   <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-tight max-w-4xl">{featuredPost.title}</h2>
                   <div className="flex items-center gap-8 pt-4">
                      <div className="flex items-center gap-3">
                         <div className="size-10 rounded-full bg-white/20 border border-white/10" />
                         <span className="text-xs font-bold text-white/80">{featuredPost.authorName}</span>
                      </div>
                      <div className="h-4 w-px bg-white/20" />
                      <div className="flex items-center gap-2 text-slate-400">
                         <Calendar size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Há 2 dias</span>
                      </div>
                   </div>
                </div>
             </motion.div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="space-y-12">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Recentes no Feed</h3>
              <div className="flex items-center gap-2 text-primary">
                 <TrendingUp size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest italic">Mais Lidas</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredPosts.filter(p => !searchTerm && activeCategory === "Todos" ? p.id !== featuredPost?.id : true).map((post) => (
                <PostCard key={post.id} post={post} onClick={() => navigate(`/blog/${post.id}`)} />
              ))}
              
              {loading && [1,2,3].map(i => (
                <div key={i} className="space-y-6 animate-pulse">
                   <div className="aspect-[4/3] bg-white/5 rounded-[2rem]" />
                   <div className="space-y-3">
                      <div className="h-4 w-1/3 bg-white/10 rounded-full" />
                      <div className="h-8 w-full bg-white/10 rounded-xl" />
                      <div className="h-4 w-2/3 bg-white/10 rounded-full" />
                   </div>
                </div>
              ))}
           </div>

           {!loading && filteredPosts.length === 0 && (
             <div className="py-40 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/2">
                <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                   <Search size={32} />
                </div>
                <h4 className="text-xl font-black italic uppercase italic text-slate-400">Nenhum artigo encontrado.</h4>
                <p className="text-sm text-slate-600 uppercase tracking-widest font-bold mt-2">Tente ajustar seus filtros ou busca.</p>
             </div>
           )}
        </section>

      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
         {isMenuOpen && (
            <motion.div
               initial={{ opacity: 0, x: '100%' }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed inset-0 z-[110] bg-[#05100a] lg:hidden p-8 pt-24 space-y-8 flex flex-col items-center text-center overflow-y-auto"
            >
               <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 size-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                  <X size={24} />
               </button>

               <nav className="flex flex-col gap-6 w-full">
                  <button onClick={() => { navigate('/mneme'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-[#ff751f]/10 border border-[#ff751f]/20 text-lg font-black uppercase tracking-[0.2em] italic text-[#ff751f]">Cesta do Lar</button>
                  <button onClick={() => { navigate('/guia-servicos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Guia de Serviços</button>
                  <button onClick={() => { navigate('/planos'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-white/5 border border-white/10 text-lg font-black uppercase tracking-[0.2em] italic text-slate-300">Planos & Patronos</button>
                  <button onClick={() => { navigate('/blog'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-primary/10 border border-primary/20 text-lg font-black uppercase tracking-[0.2em] italic text-primary">Blog da 232</button>
                  <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} className="h-16 rounded-2xl bg-primary/10 border border-primary/20 text-lg font-black uppercase tracking-[0.2em] italic text-primary">Meu Painel</button>
               </nav>

               <div className="w-full h-px bg-white/5" />

               <div className="flex flex-col gap-3 w-full pb-12">
                  <button onClick={() => { navigate('/alertas'); setIsMenuOpen(false); }} className="h-14 rounded-xl border border-red-500/30 text-[10px] font-black uppercase text-red-500 tracking-widest">Alertas da Rodovia</button>
                  <button onClick={() => { navigate('/classificados'); setIsMenuOpen(false); }} className="h-14 rounded-xl border border-emerald-500/30 text-[10px] font-black uppercase text-emerald-500 tracking-widest">A Feira Digital</button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

const PostCard = ({ post, onClick }: { post: BlogPost, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    onClick={onClick}
    className="group flex flex-col gap-6 cursor-pointer"
  >
     <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/5">
        {post.coverImage ? (
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-800">
             <BookOpen size={64} />
          </div>
        )}
        <div className="absolute top-6 left-6">
           <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black uppercase text-white tracking-[0.2em] border border-white/10">
             {post.category}
           </span>
        </div>
     </div>

     <div className="space-y-3 px-2">
        <h4 className="text-2xl font-black italic uppercase leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
          {post.excerpt || "Leia mais sobre este assunto no ecossistema BR-232."}
        </p>
        
        <div className="pt-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                 <User size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.authorName}</span>
           </div>
           <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
              Ler Artigo <ArrowRight size={14} />
           </div>
        </div>
     </div>
  </motion.div>
);

export default Blog;
