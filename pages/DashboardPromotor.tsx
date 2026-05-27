import React, { useState } from 'react';
import { Copy, Check, MousePointerClick, UserCheck, DollarSign, Wallet, ShieldAlert, CheckCircle, Smartphone, Mail, FileText, Share2 } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

const DashboardPromotor: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'cockpit' | 'repasse'>('cockpit');
  const [copied, setCopied] = useState(false);
  
  // KYC Form State
  const [pixType, setPixType] = useState<'cpf_cnpj' | 'phone' | 'email' | 'random'>('cpf_cnpj');
  const [pixKey, setPixKey] = useState('');
  const [isKycValidated, setIsKycValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const referralLink = `https://ecobr232.com/iniciar?ref=${profile?.uid ? `gl_${profile.uid.substring(0, 6)}` : 'gl_mock123'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast('Link de vinculação copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleValidateKyc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixKey.trim() || pixKey.length < 5) {
      showToast('Por favor, informe uma chave Pix válida.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsKycValidated(true);
      showToast('Conta recebedora homologada com sucesso no ambiente Sandbox!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050d09] text-white p-4 md:p-8 font-sans selection:bg-[#00E676] selection:text-black">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f14] border-l-4 border-[#00E676] text-white px-4 py-3 shadow-xl flex items-center space-x-2 rounded-none transition-all duration-350 animate-fade-in animate-slide-up">
          <CheckCircle size={18} className="text-[#00E676] shrink-0" />
          <span className="text-xs font-mono uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Header Corporativo */}
      <header className="mb-8 border-b border-emerald-950 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E676]">Módulo de Expansão de Rede</span>
          <h1 className="text-2xl font-black uppercase tracking-wider mt-1 font-mono italic">
            Dashboard do Promotor <span className="text-[#00E676]">Galho</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
            Gestão de atração, conversão e monitoramento de novos entrantes para o Ecossistema BR-232, integrados ao Split do gateway financeiro.
          </p>
        </div>
        <div className="bg-[#0b1c12] border border-emerald-900 px-4 py-2 font-mono rounded-none">
          <span className="block text-[8px] uppercase text-slate-400 leading-tight">Promotor Autenticado</span>
          <span className="text-xs font-bold block text-[#00E676]">{user?.email || 'promoter_branch@ecobr232.com'}</span>
          <span className="text-[9px] text-slate-500 uppercase mt-0.5 block">Nível: Ponta de Vinculação</span>
        </div>
      </header>

      {/* Sistema de Abas */}
      <div className="flex border-b border-emerald-950 mb-8 rounded-none">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 font-mono transition-all duration-200 rounded-none ${
            activeTab === 'cockpit'
              ? 'border-[#00E676] text-[#00E676] bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-emerald-950/10'
          }`}
        >
          Cockpit de Conversão
        </button>
        <button
          onClick={() => setActiveTab('repasse')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 font-mono transition-all duration-200 rounded-none ${
            activeTab === 'repasse'
              ? 'border-[#00E676] text-[#00E676] bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-emerald-950/10'
          }`}
        >
          Dados de Repasse
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <main className="grid grid-cols-1 gap-8">
        
        {/* ABA: COCKPIT DE CONVERSÃO */}
        {activeTab === 'cockpit' && (
          <div className="space-y-8 animate-fade-in">
            {/* Bloco Central de Vinculação */}
            <section className="bg-[#0b1410] border border-emerald-900/60 p-6 rounded-none">
              <div className="flex items-center space-x-2 text-[#00E676] text-xs font-black uppercase tracking-wider mb-4">
                <Share2 size={16} />
                <span>Link Único de Vinculação Regional</span>
              </div>
              <p className="text-xs text-slate-300 mb-4 max-w-2xl">
                Divulgue este link para novos usuários com perfil de consumo ou operação. Qualquer cadastro realizado a partir deste canal registrará você como promotor galho atribuído para recebimento de comissões.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <div className="flex-1 bg-black/40 border border-emerald-950 px-4 py-3 text-sm font-mono text-emerald-400 flex items-center overflow-x-auto whitespace-nowrap rounded-none scrollbar-thin select-all">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="bg-[#00E676] hover:bg-[#00c564] text-black font-black uppercase tracking-widest text-xs px-6 py-4 flex items-center justify-center space-x-2 shrink-0 transition-colors duration-150 rounded-none cursor-pointer"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>
            </section>

            {/* Grid de Métricas de Performance */}
            <section>
              <div className="text-xs font-black uppercase tracking-widest text-[#00E676] mb-4 font-mono">
                Métricas de Engajamento e Desempenho
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Clique no Link */}
                <div className="bg-[#080f0a] border border-emerald-950 p-6 rounded-none relative overflow-hidden group">
                  <div className="absolute right-4 top-4 text-emerald-950 group-hover:text-emerald-900 transition-colors duration-200">
                    <MousePointerClick size={48} strokeWidth={1} />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                    Cliques no Link
                  </span>
                  <p className="text-4xl font-bold font-mono text-white leading-none">142</p>
                  <div className="mt-4 pt-4 border-t border-emerald-950/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Taxa de Atividade Geral</span>
                    <span className="text-[#00E676]">MOCK ATIVO</span>
                  </div>
                </div>

                {/* Conversões Ativas */}
                <div className="bg-[#080f0a] border border-emerald-950 p-6 rounded-none relative overflow-hidden group">
                  <div className="absolute right-4 top-4 text-emerald-950 group-hover:text-emerald-900 transition-colors duration-200">
                    <UserCheck size={48} strokeWidth={1} />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                    Conversões Ativas
                  </span>
                  <p className="text-4xl font-bold font-mono text-[#00E676] leading-none">18</p>
                  <div className="mt-4 pt-4 border-t border-emerald-950/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Usuários Cadastrados</span>
                    <span className="text-[#00E676]">Atribuição Concluída</span>
                  </div>
                </div>

                {/* Comissão Acumulada */}
                <div className="bg-[#080f0a] border border-emerald-950 p-6 rounded-none relative overflow-hidden group">
                  <div className="absolute right-4 top-4 text-emerald-950 group-hover:text-emerald-900 transition-colors duration-200">
                    <DollarSign size={48} strokeWidth={1} />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                    Comissão Gerada (5%)
                  </span>
                  <p className="text-4xl font-bold font-mono text-white leading-none">R$ 85,50</p>
                  <div className="mt-4 pt-4 border-t border-emerald-950/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Para Repasse Gateway</span>
                    <span className="text-yellow-500 font-bold uppercase">Aguardando KYC</span>
                  </div>
                </div>

              </div>
            </section>

            {/* Estrutura Didática das Regras Financeiras */}
            <section className="bg-[#080f0b] border border-emerald-950 p-6 rounded-none">
              <div className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3 font-mono">
                Regra Operacional de Repasses do Gateway (Split de Receita)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Todas as interações tarifadas geradas pelos usuários indicados por você acionam a redistribuição mecânica do gateway de pagamento. 
                Sendo um cadastro vinculado à sua conta, você recebe permanentemente a taxa de comissão de <strong className="text-white">5% (cinco por cento)</strong> sobre a receita do SaaS do ecossistema e/ou corridas operadas pelo usuário. Os repasses são calculados e liquidados instantaneamente na sua carteira homologada.
              </p>
            </section>
          </div>
        )}

        {/* ABA: DADOS DE REPASSE (KYC) */}
        {activeTab === 'repasse' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Painel do Formulário */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#0b1410] border border-emerald-900/60 p-6 rounded-none">
                <div className="flex items-center space-x-2 text-[#00E676] text-xs font-black uppercase tracking-wider mb-4">
                  <Wallet size={16} />
                  <span>Configuração de Split Bancário</span>
                </div>
                
                <form onSubmit={handleValidateKyc} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2 font-mono">
                      Tipo de Chave Pix
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPixType('cpf_cnpj')}
                        className={`py-3 px-2 border text-[10px] font-black uppercase tracking-wider font-mono transition-all rounded-none ${
                          pixType === 'cpf_cnpj'
                            ? 'border-[#00E676] text-[#00E676] bg-emerald-950/20'
                            : 'border-emerald-950 text-slate-400 bg-transparent hover:border-emerald-900'
                        }`}
                      >
                        <FileText size={14} className="mx-auto mb-1" />
                        CPF/CNPJ
                      </button>
                      <button
                        type="button"
                        onClick={() => setPixType('phone')}
                        className={`py-3 px-2 border text-[10px] font-black uppercase tracking-wider font-mono transition-all rounded-none ${
                          pixType === 'phone'
                            ? 'border-[#00E676] text-[#00E676] bg-emerald-950/20'
                            : 'border-emerald-950 text-slate-400 bg-transparent hover:border-emerald-900'
                        }`}
                      >
                        <Smartphone size={14} className="mx-auto mb-1" />
                        Telefone
                      </button>
                      <button
                        type="button"
                        onClick={() => setPixType('email')}
                        className={`py-3 px-2 border text-[10px] font-black uppercase tracking-wider font-mono transition-all rounded-none ${
                          pixType === 'email'
                            ? 'border-[#00E676] text-[#00E676] bg-emerald-950/20'
                            : 'border-emerald-950 text-slate-400 bg-transparent hover:border-emerald-900'
                        }`}
                      >
                        <Mail size={14} className="mx-auto mb-1" />
                        E-mail
                      </button>
                      <button
                        type="button"
                        onClick={() => setPixType('random')}
                        className={`py-3 px-2 border text-[10px] font-black uppercase tracking-wider font-mono transition-all rounded-none ${
                          pixType === 'random'
                            ? 'border-[#00E676] text-[#00E676] bg-emerald-950/20'
                            : 'border-emerald-950 text-slate-400 bg-transparent hover:border-emerald-900'
                        }`}
                      >
                        <Wallet size={14} className="mx-auto mb-1" />
                        Aleatória
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pixKeyInput" className="block text-[10px] font-black uppercase tracking-wider text-slate-300 mb-2 font-mono">
                      Chave Pix
                    </label>
                    <input
                      id="pixKeyInput"
                      type="text"
                      required
                      placeholder={
                        pixType === 'cpf_cnpj' ? 'Digite o CPF ou CNPJ (apenas números)' :
                        pixType === 'phone' ? 'Digite o número de telefone (+55...)' :
                        pixType === 'email' ? 'Digite o seu endereço de e-mail cadastrado' :
                        'Digite a chave aleatória gerada pelo banco'
                      }
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="w-full bg-black/60 border border-emerald-950 px-4 py-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-[#00E676] rounded-none placeholder-slate-600"
                    />
                  </div>

                  {/* Alerta Estrito de Segurança e Antifraude */}
                  <div className="bg-[#12130e] border-l-2 border-yellow-500/80 p-4 text-xs flex items-start space-x-3 rounded-none">
                    <ShieldAlert size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-slate-300 italic">
                      Para conformidade bancária e antifraude, a chave Pix deve obrigatoriamente pertencer à mesma titularidade (CPF/CNPJ) do Promotor cadastrado.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-950/30 hover:bg-emerald-950/50 border border-[#00E676] text-[#00E676] font-black uppercase tracking-widest text-xs py-4 transition-all duration-150 rounded-none cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <div className="size-4 border-2 border-t-transparent border-[#00E676] animate-spin"></div>
                      ) : (
                        <span>Validar Conta Recebedora</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Painel do Status de Liquidação e Legenda de Segurança */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#080f0a] border border-emerald-950 p-6 rounded-none">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#00E676] block mb-3 font-mono">
                  Status de Credenciamento
                </span>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-emerald-950/60">
                    <span className="text-xs text-slate-400">Titularidade CPF:</span>
                    <span className="text-xs font-mono text-slate-300">***.394.***-23</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-950/60">
                    <span className="text-xs text-slate-400">Tipo de Receptor:</span>
                    <span className="text-xs text-slate-300 font-mono">Pessoa Física</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-950/60">
                    <span className="text-xs text-slate-400">Ambiente do Gateway:</span>
                    <span className="text-xs font-mono text-yellow-500 font-black">SANDBOX ACT</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-slate-400">Status KYC:</span>
                    {isKycValidated ? (
                      <span className="bg-[#052816] text-[#00E676] text-[9px] font-black uppercase px-2 py-0.5 border border-emerald-800 font-mono">
                        HABILITADO
                      </span>
                    ) : (
                      <span className="bg-[#1f0f0c] text-yellow-500 text-[9px] font-black uppercase px-2 py-0.5 border border-[#4a1c12] font-mono">
                        PENDENTE
                      </span>
                    )}
                  </div>
                </div>

                {isKycValidated && (
                  <div className="mt-6 p-4 bg-[#0a1e13] border border-[#00E676]/40 text-xs text-emerald-400 font-mono rounded-none">
                    ✓ Homologação bancária e Split de Pix configurado com a API Pagar.me. Suas taxas serão creditadas diretamente em D+0 para chaves Pix validadas.
                  </div>
                )}
              </div>

              <div className="bg-[#080f0a] border border-emerald-950 p-6 rounded-none">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2 font-mono">
                  Auditoria de Repasses
                </span>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Todos os recebimentos gerados pelo gateway de pagamento passam pelo motor mecânico interno do ecossistema antes do repasse final. Tentativas de lavagem, fraudes ou manipulação de links resultam em suspensão imediata de repasses fiscais e bloqueio completo de credenciais.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DashboardPromotor;
