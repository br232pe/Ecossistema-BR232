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
      <h2>Privacidade e Proteção de Dados</h2>
      <p>O Ecossistema BR-232 respeita sua privacidade. Esta política descreve como coletamos e usamos seus dados ao utilizar a autenticação via Google.</p>
      <h3>Dados Coletados</h3>
      <p>Ao realizar login via Google Auth, recebemos apenas os dados básicos autorizados por você: Nome, E-mail e Foto de Perfil. Esses dados são utilizados exclusivamente para identificar suas publicações e garantir a segurança da plataforma.</p>
      <h3>Uso de Cookies</h3>
      <p>Utilizamos cookies essenciais para manter sua sessão ativa e garantir que as funcionalidades de personalização operem corretamente.</p>
      <h3>Compartilhamento</h3>
      <p>Não vendemos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Seus dados de contato de anúncios (como e-mail se você permitir) serão visíveis apenas nos anúncios que você publicar.</p>
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
