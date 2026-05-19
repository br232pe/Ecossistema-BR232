import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Send, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  Layout, 
  ChevronLeft,
  Eye,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/contexts/AuthContext';
import { useAuth } from '../src/contexts/AuthContext';
import { BlogPost } from '../src/types';

const BlogEditor: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: "",
    excerpt: "",
    content: "",
    category: "Mobilidade",
    coverImage: "",
    status: 'draft'
  });

  const categories = ["Mobilidade", "Cultura", "Negócios", "Vida Regional", "Logística"];

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'blog_posts'), where('authorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMyPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!user?.uid) return;
    
    const postData = {
      ...currentPost,
      authorId: user.uid,
      authorName: profile?.displayName || "Autor Anônimo",
      status,
      updatedAt: serverTimestamp(),
      publishedAt: status === 'published' ? serverTimestamp() : currentPost.publishedAt || null,
      createdAt: currentPost.id ? currentPost.createdAt : serverTimestamp()
    };

    try {
      if (currentPost.id) {
        await updateDoc(doc(db, 'blog_posts', currentPost.id), postData);
      } else {
        await addDoc(collection(db, 'blog_posts'), postData);
      }
      setIsEditing(false);
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const resetForm = () => {
    setCurrentPost({
      title: "",
      excerpt: "",
      content: "",
      category: "Mobilidade",
      coverImage: "",
      status: 'draft'
    });
  };

  const editPost = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const deletePost = async (id: string) => {
    if (confirm("Deseja realmente excluir este artigo?")) {
      await deleteDoc(doc(db, 'blog_posts', id));
    }
  };

  return (
    <div className="min-h-screen bg-[#050d09] text-white font-sans pb-32">
      <header className="sticky top-0 z-50 bg-[#050d09]/90 backdrop-blur-md border-b border-white/5 px-6 py-6">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/blog')} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                  <ChevronLeft />
               </button>
               <div>
                  <h1 className="text-xl font-black italic uppercase italic leading-none mb-1">Painel do Autor</h1>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    WordPress Style CMS • ECOBR232
                  </p>
               </div>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="h-12 px-8 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#00c865] transition-all"
              >
                Escrever Artigo <FileText size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-4">
                 <button onClick={() => { setIsEditing(false); resetForm(); }} className="text-[10px] font-black uppercase px-4 text-slate-500 hover:text-white">Cancelar</button>
                 <button 
                   onClick={() => handleSave('draft')}
                   className="h-12 px-6 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 transition-all"
                 >
                   Rascunho <Save size={16} />
                 </button>
                 <button 
                   onClick={() => handleSave('published')}
                   className="h-12 px-8 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#00c865] transition-all"
                 >
                   Publicar <Send size={16} />
                 </button>
              </div>
            )}
         </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
         <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard label="Artigos Publicados" value={myPosts.filter(p => p.status === 'published').length} color="#00e676" />
                    <StatCard label="Total de Views" value="2.8k" color="#3b82f6" />
                    <StatCard label="Rascunhos" value={myPosts.filter(p => p.status === 'draft').length} color="#f59e0b" />
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Meus Artigos</h3>
                    <div className="grid gap-4">
                       {myPosts.length > 0 ? myPosts.map(post => (
                         <div key={post.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-8">
                               <div className="size-20 rounded-3xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center text-slate-700">
                                  {post.coverImage ? (
                                    <img src={post.coverImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                                  ) : <ImageIcon size={32} />}
                               </div>
                               <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                     <h4 className="text-xl font-black italic uppercase leading-none">{post.title}</h4>
                                     <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border ${
                                       post.status === 'published' ? 'border-primary/20 text-primary bg-primary/5' : 'border-slate-700 text-slate-500 bg-white/2'
                                     }`}>
                                       {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                     </span>
                                  </div>
                                  <div className="flex items-center gap-6 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                     <span className="flex items-center gap-1.5"><Clock size={10} /> Há 3 dias</span>
                                     <span className="flex items-center gap-1.5 font-bold text-white"><Eye size={10} /> 342 views</span>
                                     <span className="px-2 py-0.5 bg-white/5 rounded-md">{post.category}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <button onClick={() => editPost(post)} className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Editar</button>
                               <button onClick={() => post.id && deletePost(post.id)} className="size-12 flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors">
                                  <Trash2 size={20} />
                               </button>
                            </div>
                         </div>
                       )) : (
                         <div className="py-32 text-center bg-white/2 border border-dashed border-white/10 rounded-[3rem]">
                            <p className="text-slate-500 text-sm italic font-medium">Nenhum artigo escrito ainda.</p>
                         </div>
                       )}
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-12"
              >
                 {/* Main Editor Surface */}
                 <div className="lg:col-span-2 space-y-10">
                    <input 
                       type="text" 
                       placeholder="Título do seu artigo..."
                       className="w-full bg-transparent border-none text-5xl md:text-6xl font-black italic uppercase italic tracking-tighter outline-none placeholder:text-slate-800"
                       value={currentPost.title}
                       onChange={(e) => setCurrentPost({...currentPost, title: e.target.value})}
                    />

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Introdução (Excerpt)</label>
                       <textarea 
                          placeholder="Um breve resumo que aparece nos feeds..."
                          className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 outline-none focus:border-primary/40 transition-all resize-none text-slate-300 italic font-medium"
                          value={currentPost.excerpt}
                          onChange={(e) => setCurrentPost({...currentPost, excerpt: e.target.value})}
                       />
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Conteúdo Principal</label>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                             <span>HTML/Markdown Suportado</span>
                          </div>
                       </div>
                       <textarea 
                          placeholder="Comece sua narrativa aqui..."
                          className="w-full h-[600px] bg-white/5 border border-white/10 rounded-[2rem] p-10 outline-none focus:border-primary/40 transition-all resize-none text-lg text-slate-300 leading-relaxed font-serif"
                          value={currentPost.content}
                          onChange={(e) => setCurrentPost({...currentPost, content: e.target.value})}
                       />
                    </div>
                 </div>

                 {/* Sidebar Settings */}
                 <aside className="space-y-8">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8 sticky top-32">
                       <h3 className="text-xl font-black italic uppercase">Configurações</h3>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Categoria</label>
                          <select 
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none appearance-none text-xs font-black uppercase tracking-widest"
                            value={currentPost.category}
                            onChange={(e) => setCurrentPost({...currentPost, category: e.target.value})}
                          >
                             {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center justify-between">
                            Imagem de Capa <ImageIcon size={14} />
                          </label>
                          <div className="aspect-video bg-black/40 rounded-3xl border border-white/10 overflow-hidden group relative">
                             {currentPost.coverImage ? (
                               <>
                                 <img src={currentPost.coverImage} className="w-full h-full object-cover" alt="" />
                                 <button onClick={() => setCurrentPost({...currentPost, coverImage: ""})} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-black transition-colors opacity-0 group-hover:opacity-100">
                                    <X size={14} />
                                 </button>
                               </>
                             ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-700">
                                  <ImageIcon size={32} />
                                  <span className="text-[8px] font-black uppercase tracking-widest">Ainda sem imagem</span>
                               </div>
                             )}
                          </div>
                          <input 
                            type="text" 
                            placeholder="URL da imagem..."
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[10px] outline-none"
                            value={currentPost.coverImage}
                            onChange={(e) => setCurrentPost({...currentPost, coverImage: e.target.value})}
                          />
                       </div>

                       <div className="pt-8 border-t border-white/5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6">Preview em Tempo Real</h4>
                          <button className="w-full h-14 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                             Ver Visualização <Eye size={16} />
                          </button>
                       </div>
                    </div>
                 </aside>
              </motion.div>
            )}
         </AnimatePresence>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, color }: any) => (
  <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-2 group hover:border-white/20 transition-all">
     <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</div>
     <div className="text-4xl font-black italic italic leading-none" style={{ color }}>{value}</div>
  </div>
);

export default BlogEditor;
