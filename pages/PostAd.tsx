import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserCheck, Building2, ShoppingBag, ShieldCheck, CheckCircle2, Loader2, TreeDeciduous, GitBranch, Waves, Store } from 'lucide-react';
import { calculateAssociationFee } from '../utils/pricing';
import { db } from '../services/db';
import { BR232_TAXONOMY, InfluenceZone } from '../types';

const PostAd: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Form State
  const [category, setCategory] = useState<'Feira' | 'Piloto Solo' | 'PJ / Frotas'>('Feira');
  const [title, setTitle] = useState('');
  const [selectedZone, setSelectedZone] = useState<InfluenceZone>(InfluenceZone.TRONCO);
  const [city, setCity] = useState('Recife');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [pilotCapacity, setPilotCapacity] = useState(201);
  const [selectedPlan, setSelectedPlan] = useState('');

  // Beta Check
  const isBeta = new Date() < new Date('2026-02-10');

  useEffect(() => {
    if (location.state?.category) {
       const cat = location.state.category;
       setCategory(cat === 'Associação' ? 'PJ / Frotas' : cat);
    }
  }, [location.state]);

  const filteredCities = useMemo(() => {
    return BR232_TAXONOMY.filter(c => c.zone === selectedZone);
  }, [selectedZone]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await db.ads.save({
        title: category === 'Feira' ? title : `Piloto: ${title}`,
        category: category,
        city: city,
        price: category === 'Feira' ? price : 'Sob Consulta',
        phone: phone,
        img: "https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=400",
        isPremium: selectedPlan.includes('gold') || selectedPlan.includes('silver') || selectedPlan.includes('alta'),
        userId: 'current-user'
      });
      navigate('/classificados');
    } catch (e) {
      setErrorMsg('Erro ao salvar. Tente novamente!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans = {
    'Feira': [
      { id: 'f-bronze', name: 'Banca Bronze', duration: '7 Dias', price: 'Grátis', features: ['Até 3 Fotos', 'Visibilidade Básica', 'Ideal para Desapegos'] },
      { id: 'f-silver', name: 'Banca Prata', duration: '15 Dias', price: isBeta ? 'Gratuito (Beta)' : 'R$ 24,90', features: ['Até 7 Fotos', 'Destaque na Categoria', 'Ideal para Giro Rápido'] },
      { id: 'f-gold', name: 'Ponto Ouro', duration: '30 Dias', price: isBeta ? 'Gratuito (Beta)' : 'R$ 49,90', features: ['Até 12 Fotos', 'Destaque na Home', 'Selo Verificado'] },
    ],
    'Piloto Solo': [
      { id: 'p-solo', name: 'Selo de Responsa', duration: 'Mensal', price: isBeta ? 'Gratuito (Beta)' : 'R$ 19,90', features: ['QR Code Individual', 'Reputação no CPF', 'Portabilidade'] },
    ],
    'PJ / Frotas': [
      { id: 'a-titan', name: 'Nível Titan', duration: 'Até 50 vagas', price: isBeta ? 'Gratuito (Beta)' : 'R$ 250,00', features: ['Gestão de Frota', 'Selo Coletivo'] },
      { id: 'a-factor', name: 'Nível Factor', duration: 'Até 100 vagas', price: isBeta ? 'Gratuito (Beta)' : 'R$ 400,00', features: ['Prioridade Suporte', 'Relatórios Mensais'] },
      { id: 'a-alta', name: 'Alta Cilindrada', duration: '201+ vagas', price: isBeta ? 'Gratuito (Beta)' : `R$ ${calculateAssociationFee(pilotCapacity).toFixed(2)}`, features: ['Custo Marginal Decrescente', 'Destaque Regional'] },
    ]
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white pb-32">
      <header className="p-4 flex items-center gap-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-background-dark sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="material-symbols-outlined">arrow_back</button>
        <h1 className="text-lg font-bold italic uppercase">Criar Anúncio</h1>
        <div className="flex-1 text-right">
          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-full uppercase">Etapa {step}/3</span>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-8">
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase text-center animate-in fade-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-black italic uppercase">Qual seu negócio?</h2>
            <div className="space-y-3">
              <CategoryButton active={category === 'Feira'} onClick={() => setCategory('Feira')} icon={<Store/>} title="Feira & Negócios" desc="Produtos, Peças e Serviços Locais" />
              <CategoryButton active={category === 'Piloto Solo'} onClick={() => setCategory('Piloto Solo')} icon={<UserCheck/>} title="Piloto de Responsa" desc="Logística Individual (CPF)" />
              <CategoryButton active={category === 'PJ / Frotas'} onClick={() => setCategory('PJ / Frotas')} icon={<Building2/>} title="Frotas & Associações" desc="Gestão de Múltiplos Pilotos" />
            </div>
            <button onClick={() => setStep(2)} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg">Próximo</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-black italic uppercase">Local & Plano</h2>
            
            <div className="space-y-4 bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400">Zona de Influência</label>
                   <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setSelectedZone(InfluenceZone.TRONCO)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedZone === InfluenceZone.TRONCO ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-background-dark border-transparent text-slate-400'}`}>
                         <TreeDeciduous size={16}/>
                         <span className="text-[8px] font-black uppercase tracking-tighter">Tronco</span>
                      </button>
                      <button onClick={() => setSelectedZone(InfluenceZone.GALHOS)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedZone === InfluenceZone.GALHOS ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-slate-50 dark:bg-background-dark border-transparent text-slate-400'}`}>
                         <GitBranch size={16}/>
                         <span className="text-[8px] font-black uppercase tracking-tighter">Galhos</span>
                      </button>
                      <button onClick={() => setSelectedZone(InfluenceZone.RAIZES)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedZone === InfluenceZone.RAIZES ? 'bg-slate-600/10 border-slate-600 text-slate-600' : 'bg-slate-50 dark:bg-background-dark border-transparent text-slate-400'}`}>
                         <Waves size={16}/>
                         <span className="text-[8px] font-black uppercase tracking-tighter">Raízes</span>
                      </button>
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400">Cidade Base</label>
                   <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-black uppercase focus:ring-1 focus:ring-primary outline-none">
                      {filteredCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                   </select>
                </div>
            </div>

            <div className="space-y-4">
              {plans[category].map((plan) => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${selectedPlan === plan.id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg italic uppercase">{plan.name}</h3>
                    <span className="text-primary font-black">{plan.price}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400 italic mb-2">{plan.duration}</p>
                  <ul className="space-y-1">
                    {plan.features.map((f, i) => <li key={i} className="text-[10px] font-bold flex items-center gap-2"><CheckCircle2 size={12}/>{f}</li>)}
                  </ul>
                </button>
              ))}
            </div>
            <button disabled={!selectedPlan} onClick={() => setStep(3)} className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg disabled:opacity-50">Continuar</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-black italic uppercase">Detalhes Finais</h2>
            <div className="space-y-4">
              <InputField label={category === 'PJ / Frotas' ? 'Razão Social' : 'Título do Anúncio / Nome'} value={title} onChange={(e:any) => setTitle(e.target.value)} placeholder={category === 'Feira' ? "Ex: Vendo Motor CB 500" : "Ex: Expresso Agreste"} />
              {category === 'Feira' && <InputField label="Preço Sugerido" value={price} onChange={(e:any) => setPrice(e.target.value)} placeholder="Ex: R$ 50,00" />}
              <InputField label="WhatsApp de Contato" value={phone} onChange={(e:any) => setPhone(e.target.value)} placeholder="Ex: 81999999999" />
              
              <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="text-secondary shrink-0" />
                <p className="text-[10px] font-bold text-secondary-700 dark:text-secondary-400 leading-tight italic uppercase">
                  Honestidade é lei na rodovia. Anúncios falsos ou ilegais serão banidos e reportados. 
                </p>
              </div>
            </div>
            <button 
              disabled={isSubmitting || !title}
              onClick={handleSubmit} 
              className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Publicar na Malha'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const CategoryButton: React.FC<any> = ({ active, onClick, icon, title, desc }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${active ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 dark:border-white/5 bg-white dark:bg-surface-dark'}`}>
    <div className={`p-3 rounded-xl ${active ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-background-dark text-slate-400'}`}>{icon}</div>
    <div className="text-left"><h3 className="font-black text-sm uppercase italic">{title}</h3><p className="text-[10px] font-bold text-slate-500 uppercase">{desc}</p></div>
  </button>
);

const InputField: React.FC<any> = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{label}</label>
  <input value={value} onChange={onChange} className="w-full h-14 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-medium focus:ring-1 focus:ring-primary outline-none" placeholder={placeholder} /></div>
);

export default PostAd;