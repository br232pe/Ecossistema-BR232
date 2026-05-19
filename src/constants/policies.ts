export interface Policy {
  id: string;
  title: string;
  content: string;
}

export const POLICIES: Policy[] = [
  {
    id: 'termos-gerais',
    title: '1. Termos e Condições Gerais de Uso ECOBR232',
    content: `
      <h2>1. Objeto e Natureza do Serviço</h2>
      <p>O Ecossistema BR-232 opera estritamente como um canal tecnológico de veiculação de anúncios comerciais, listagens de negócios, classificados e utilidade pública (alertas regionais colaborativos). A plataforma funciona como uma vitrine digital de aproximação comercial, não atuando como intermediária, representante, compradora ou vendedora de qualquer transação efetuada entre os anunciantes e seus respectivos clientes finais.</p>

      <h2>2. Autenticação de Acesso via Google Auth</h2>
      <p>Para a publicação de anúncios, gerenciamento de listagens comerciais ou interações restritas no portal, exige-se a criação de um perfil de acesso. Esse processo ocorre de forma simplificada e segura por meio do sistema de autenticação do Google (Google Identity Platform). O cliente declara-se ciente de que:</p>
      <ul>
          <li>É o único e exclusivo responsável pela segurança e uso de sua conta de acesso.</li>
          <li>As informações de perfil importadas (nome e e-mail) serão vinculadas aos anúncios publicados para fins de atribuição de responsabilidade técnica e legal pelo conteúdo inserido.</li>
          <li>O Ecossistema BR-232 reserva-se o direito de suspender acessos que violem as regras de segurança ou apresentem indícios de fraude tecnológica.</li>
      </ul>

      <h2>3. Responsabilidades e Regras para Publicação de Conteúdo</h2>
      <p>Os anunciantes e clientes comerciais cadastrados são os únicos responsáveis civis e penais pelas informações, imagens, preços e veracidade dos anúncios ou alertas inseridos na plataforma. É terminantemente proibida a publicação de:</p>
      <ul>
          <li>Conteúdo ilícito, fraudulento, difamatório, ofensivo ou que infrinja direitos de propriedade intelectual de terceiros.</li>
          <li>Anúncios de produtos ou serviços cuja comercialização seja proibida pela legislação brasileira em vigor.</li>
          <li>Informações falsas ou deliberadamente enganosas em listagens de utilidade pública ou alertas regionais.</li>
      </ul>

      <h2>4. Limitação de Responsabilidade</h2>
      <p>Em conformidade com a legislação aplicável, o Ecossistema BR-232 não se responsabiliza por:</p>
      <ul>
          <li>Qualquer transação comercial, vício, defeito ou prejuízo financeiro decorrente das relações de compra, venda ou contratação estabelecidas diretamente entre os usuários e os anunciantes do portal.</li>
          <li>Instabilidades técnicas temporárias geradas por serviços de terceiros, incluindo provedores de internet, operadoras de telecomunicação ou falhas globais na infraestrutura de autenticação externa do Google.</li>
      </ul>

      <h2>5. Propriedade Intelectual</h2>
      <p>A estrutura tecnológica, código-fonte, identidade visual, marcas, marcas de serviço, patentes de design e bancos de dados do Ecossistema BR-232 são de propriedade exclusiva de seus desenvolvedores e mantenedores protegidos pelas leis de propriedade intelectual. A reprodução, engenharia reversa ou cópia não autorizada de qualquer elemento estrutural do portal é estritamente proibida.</p>

      <h2>6. Modificações dos Termos de Serviço</h2>
      <p>Estes Termos de Uso podem ser modificados a qualquer momento para adequação a novos modelos de negócios ou exigências normativas. O uso continuado da plataforma após a publicação de modificações constituirá a aceitação dos novos termos.</p>
    `
  },
  {
    id: 'politica-privacidade',
    title: '2. Política de Privacidade ECOBR232',
    content: `
      <p>ECOBR232 e seus parceiros (“ECOBR232”, “nós”, “nosso” e/ou “nossos”) valorizam a privacidade dos indivíduos que utilizam nosso website e serviços relacionados (coletivamente, nossos “Serviços”). Esta Política de Privacidade explica como coletamos, usamos e compartilhamos informações suas ou do seu dispositivo enquanto você utiliza os Serviços.</p>
      
      <p>Comprometida com a promoção do Ecossistema da BR232, esta Política de Privacidade visa assegurar a conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e boas práticas internacionais de governança da privacidade.</p>

      <div class="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/10 my-8 not-prose">
        <h3 class="text-slate-900 dark:text-white font-bold text-lg mb-4">Uso de Dados de Serviços de API do Google</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm mb-4">Para cumprir a Política de Dados do Usuário dos Serviços de API do Google, detalhamos abaixo como a Epoíēsa acessa, utiliza, armazena e compartilha seus dados do Google:</p>
        <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li><strong class="text-slate-900 dark:text-slate-200">• Dados acessados:</strong> Acessamos apenas as informações básicas do seu perfil do Google (nome completo, endereço de e-mail e foto de perfil).</li>
          <li><strong class="text-slate-900 dark:text-slate-200">• Utilização de dados:</strong> Utilizamos seus dados estritamente para fins de autenticação, criação de conta e personalização da experiência. Não utilizamos esses dados para treinar modelos de IA.</li>
          <li><strong class="text-slate-900 dark:text-slate-200">• Compartilhamento de dados:</strong> Não compartilhamos, vendemos ou transferimos seus dados de usuário do Google para terceiros.</li>
          <li><strong class="text-slate-900 dark:text-slate-200">• Retenção e Exclusão:</strong> Você pode solicitar a exclusão total e imediata dos seus dados a qualquer momento enviando um e-mail para <span class="text-primary font-bold">br232pe@gmail.com</span>.</li>
        </ul>
      </div>

      <h2>1. Informações que coletamos</h2>
      <p>Podemos coletar diversas informações suas ou sobre seus dispositivos a partir de várias fontes. Caso você não forneça suas informações quando solicitado, poderá não ser possível usar alguns ou todos os nossos Serviços.</p>

      <h2>2. Informações que você nos fornece</h2>
      <p><strong>Informações de cadastro e perfil:</strong> Ao se cadastrar, solicitamos seu endereço de e-mail e, em alguns casos, seu número de telefone. Se você se cadastrar usando uma conta de mídia social, também receberemos informações dessas redes sociais.</p>

      <h2>3. Informações que coletamos automaticamente</h2>
      <p>Ao utilizar os Serviços, usamos diversas ferramentas eletrônicas, como cookies e tecnologias semelhantes, para gerar automaticamente informações sobre como você usa e interage com os Serviços.</p>

      <h2>4. Como compartilhamos as informações</h2>
      <p>Compartilhamos informações com afiliadas, prestadores de serviços e conforme exigido por lei. Nossos Serviços são sociais, e seu perfil poderá ser visível para outros usuários.</p>

      <h2>5. Seus direitos e opções</h2>
      <p>Nos termos da LGPD, o usuário pode confirmar a existência de tratamento, acessar, corrigir, solicitar anonimização, portar dados, revogar consentimento e solicitar revisão de decisões automatizadas.</p>
    `
  },
  {
    id: 'termos-registro',
    title: '3. Termos e Condições de Registro ECOBR232',
    content: '<h2>Registro</h2><p>Conteúdo em atualização para conformidade LTS 2026...</p>'
  },
  {
    id: 'termos-anunciantes',
    title: '4. Termos e Condições Anunciantes ECOBR232',
    content: '<h2>Anunciantes</h2><p>Regras específicas para B2B e visibilidade premium em atualização...</p>'
  },
  {
    id: 'termos-comentarios',
    title: '5. Termos e Condições de Comentários do Usuário ECOBR232',
    content: '<h2>Comentários</h2><p>Protocolo de discrição e ética na malha rodoviária...</p>'
  }
];
