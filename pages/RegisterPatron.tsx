
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  MapPin, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowRight,
  Info,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import PlaceAutocomplete from '../src/components/PlaceAutocomplete';
import { validateAddress, AddressValidationResponse } from '../src/services/addressValidation';

const API_KEY = import.meta.env.VITE_GOOGLE_MAP || '';

const RegisterPatron: React.FC = () => {
  return <RegisterPatronContent />;
};

const RegisterPatronContent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [detailedAddress, setDetailedAddress] = useState('');
  
  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<AddressValidationResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleValidateAddress = async () => {
    if (!selectedPlace) {
      setValidationError("Selecione um ponto inicial no mapa primeiro.");
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      // We send the formatted address from Places + any extra details
      const addressToValidate = [selectedPlace.formattedAddress];
      if (detailedAddress) addressToValidate.unshift(detailedAddress);
      
      const result = await validateAddress(addressToValidate);
      setValidationResult(result);
      
      if (!result.result.verdict.addressComplete) {
         setValidationError("O endereço parece estar incompleto para fins de faturamento e geofencing.");
      }
    } catch (err) {
      setValidationError("Erro ao conectar com o serviço de validação do Google.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationResult?.result.verdict.addressComplete) {
      setValidationError("A validação do endereço é obrigatória para prosseguir.");
      return;
    }
    
    setLoading(true);
    // Simular registro no Firestore
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/patrons'), 3000);
    }, 2000);
  };

  const categories = [
    'Posto de Combustível',
    'Churrascaria / Restaurante',
    'Hotel / Pousada',
    'Oficina / Auto-Peças',
    'Lojista Independente'
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-[#05100a] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6"
        >
          <div className="size-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(0,230,118,0.3)]">
            <ShieldCheck size={48} className="text-black" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic uppercase italic">Solicitação Enviada</h2>
            <p className="text-slate-400 font-medium italic">Seu negócio passará pela auditoria de KMs de Influência. <br/>Redirecionando para a malha...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05100a] text-white pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-12 space-y-8">
        <header className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <ShieldCheck size={12} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Adesão ao Cânone</span>
           </div>
           <h1 className="text-4xl font-black italic uppercase tracking-tighter">
             Tornar-se <span className="text-primary">Patrono</span>
           </h1>
           <p className="text-slate-500 font-bold italic text-sm">
             A tecnologia Google Address Validation garante que seu ponto comercial seja georeferenciado com precisão para o ecossistema.
           </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
           {/* Section 1: Business Info */}
           <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                 <Store size={14} /> Dados do Empreendimento
              </h3>
              
              <div className="grid gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Nome Fantasia</label>
                   <input 
                     type="text"
                     value={businessName}
                     onChange={(e) => setBusinessName(e.target.value)}
                     required
                     placeholder="Ex: Posto Gravatá BR"
                     className="w-full h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-slate-700 italic"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Segmento</label>
                   <select 
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                     required
                     className="w-full h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all text-slate-400 italic appearance-none"
                   >
                     <option value="">Selecione uma categoria...</option>
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              </div>
           </div>

           {/* Section 2: Precise Location with Address Validation */}
           <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                   <MapPin size={14} /> Endereço Georeferenciado
                </h3>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Google API Active</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Busca no Mapa (Places API)</label>
                   <PlaceAutocomplete 
                     onPlaceSelect={(p) => setSelectedPlace(p)}
                     placeholder="Busque o nome do estabelecimento ou endereço aproximado..."
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Complemento / KM / Lote (Detalhes)</label>
                   <input 
                     type="text"
                     value={detailedAddress}
                     onChange={(e) => setDetailedAddress(e.target.value)}
                     placeholder="Ex: KM 64 Sul, Lote 4B"
                     className="w-full h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-slate-700 italic"
                   />
                </div>

                {/* Address Validation Trigger */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleValidateAddress}
                    disabled={isValidating || !selectedPlace}
                    className={`w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                      validationResult?.result.verdict.addressComplete 
                      ? 'bg-primary/20 text-primary border border-primary/40' 
                      : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                    }`}
                  >
                    {isValidating ? (
                      <>Validando Integridade <Loader2 size={16} className="animate-spin" /></>
                    ) : validationResult?.result.verdict.addressComplete ? (
                      <>Endereço Qualificado pelo Cânone <CheckCircle2 size={16} /></>
                    ) : (
                      <>Validar Endereço Comercial <ShieldCheck size={16} /></>
                    )}
                  </button>
                </div>

                {/* Validation Feedback */}
                <AnimatePresence>
                  {validationError && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4"
                    >
                      <ShieldAlert className="text-red-500 shrink-0" size={18} />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-red-500">Inconsistência de Localização</p>
                        <p className="text-[11px] font-bold text-slate-400 italic">{validationError}</p>
                      </div>
                    </motion.div>
                  )}

                  {validationResult && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                           <Info size={14} className="text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Relatório de Precisão</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                          validationResult.result.verdict.addressComplete ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-500'
                        }`}>
                          {validationResult.result.verdict.validationGranularity}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[11px] font-black italic uppercase text-white">{validationResult.result.address.formattedAddress}</div>
                        <div className="grid grid-cols-2 gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">
                          <div className="flex items-center gap-2">
                            {validationResult.result.verdict.addressComplete ? <CheckCircle2 size={10} className="text-primary" /> : <XCircle size={10} className="text-red-500" />}
                            <span>Endereço Completo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!validationResult.result.verdict.hasUnconfirmedComponents ? <CheckCircle2 size={10} className="text-primary" /> : <XCircle size={10} className="text-orange-500" />}
                            <span>Componentes Confirmados</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>

           <button
            type="submit"
            disabled={loading || !validationResult?.result.verdict.addressComplete}
            className="w-full h-20 bg-primary disabled:bg-white/10 disabled:text-slate-500 hover:bg-primary-dark text-black rounded-[2rem] font-black uppercase text-sm transition-all shadow-[0_20px_40px_rgba(0,230,118,0.15)] flex items-center justify-center gap-3"
           >
             {loading ? <Loader2 className="animate-spin" /> : <>Submeter para Auditoria de KMs <ArrowRight /></>}
           </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatron;
