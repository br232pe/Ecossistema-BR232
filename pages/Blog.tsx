
import React from 'react';
import SmartHeader from '../components/SmartHeader';

const Blog: React.FC = () => {

  return (
    <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <SmartHeader 
        title="Notícias" 
        subtitle="Regional Agreste/Sertão"
        rightAction={
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center text-slate-900 dark:text-white hover:text-primary size-10 rounded-full bg-white/5 border border-white/5"><span className="material-symbols-outlined text-[20px]">bookmark_border</span></button>
          </div>
        }
      />

      <main className="flex-1 pb-32">
        <div className="px-4 py-2">
          <div className="w-full relative bg-slate-200 dark:bg-surface-dark rounded-[2rem] overflow-hidden aspect-[4/3] shadow-lg group border border-slate-200 dark:border-white/5">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBP8qDjk97TkniNQrllgJmUeIyRlO2OWneeDw2eKGWUV9wkB4rTm3LwFaAKW_QWtcjE0QBkDYQnjvrsTLUaMcm5fkw9fvBdcYhh0obuh3DHJsKk3azvcnn12nk5PtpTpPF3Ihg-JnqEbOXZSYuXdUyNe2HI_UezQhnn32jJD6VZr6cD_fm3fjDXcE3fzu9mVDF95RVdGxuBFgrM8mh4mHZXhHn7hZp4zS06kZdsgGvA2iRKZtu9QqnWAF0WwV1DG0gYlXllsr0PfO31')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-60"></div>
          </div>
        </div>
        
        <div className="px-4 pt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">Inovação</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-surface-dark text-slate-600 dark:text-text-muted-dark border border-slate-200 dark:border-white/10">Agreste</span>
          </div>
          <h1 className="text-2xl font-black leading-tight tracking-tight mb-3">Hub de Inovação Inaugurado em Caruaru: Conectando o Interior</h1>
          <div className="flex items-center text-sm text-slate-500 dark:text-text-muted-dark gap-2 mb-6">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>24 Out, 2024</span>
            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span>5 min de leitura</span>
          </div>
        </div>

        <div className="px-4 space-y-6 text-base leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
          <p>A <strong className="text-slate-900 dark:text-white font-bold">rodovia BR-232</strong> é mais do que apenas uma estrada; é uma artéria vital de inovação pulsando através do coração de Pernambuco.</p>
          <p>O novo "Agreste Tech Hub" em Caruaru promete trazer conectividade de alta velocidade e espaços de co-working para a região.</p>
          <blockquote className="relative p-6 my-8 rounded-xl bg-primary/5 border-l-4 border-primary shadow-sm">
            <span className="material-symbols-outlined absolute top-4 left-4 text-primary opacity-20 text-4xl">format_quote</span>
            <p className="relative z-10 text-lg font-medium italic text-slate-800 dark:text-slate-100 pl-2">
              A inovação não conhece geografia. O próximo unicórnio pode nascer sob o sol do Sertão.
            </p>
          </blockquote>
        </div>

        <div className="mx-4 mt-8 p-4 rounded-2xl bg-white dark:bg-surface-dark flex items-start gap-4 shadow-sm border border-slate-200 dark:border-white/5">
          <div className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-primary shadow-sm shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_yzqc-IMhAGoe9obC13IBhcrf_phMEkdQxpV_DsG0_y0-YSd3I1zYGOWS6xz78tYmnf-gyubt5bYpcHk_KJed-0FxwKVjnSSPe1GSNGqFbSCMcp9CdYcktoRQZTjoIHLZvodanlOPlG2AblLW-iwyeI3nBZfaaDSgz67JqNEQDmd3q9z9Zfe_IMaJc4DYJahcF0BeLJK1_YCq2SAAD3az1GtLnAD-IfStsW0bzDHDx73bHZP8JVZbgDiy6XOji89t6kTmT9k8rW4S')" }}></div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">Maria Silva</h3>
            <p className="text-xs text-slate-500 dark:text-text-muted-dark leading-normal">Jornalista de Tecnologia cobrindo a região do Sertão. Apaixonada por inclusão digital.</p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-6 py-4 pb-10 flex items-center justify-between z-40">
        <div className="flex items-center gap-6">
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">thumb_up</span>
            <span className="text-[10px] font-bold">1.2k</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="text-[10px] font-bold">48</span>
          </button>
        </div>
        <button className="flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-white font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
          <span className="material-symbols-outlined text-[20px]">share</span>
          <span className="text-sm">Compartilhar</span>
        </button>
      </div>
    </div>
  );
};

export default Blog;
