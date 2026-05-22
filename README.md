# Ecossistema BR-232 - Arquitetura Canônica & Estabilidade LTS

Bem-vindo ao centro de documentação arquitetural e manual operacional do **Ecossistema BR-232** (ECOBR232). Este documento é atualizado de forma contínua e modular para servir como a verdade única sobre as regras de negócio geoeconômicas, integridade dos fluxos e a harmonia técnica de Long Term Support (LTS) da nossa malha lindeira em Pernambuco (Stack 2026).

---

## 🗺️ Visão Geral do Negócio e Pilares Estruturais

O Ecossistema BR-232 é desenhado especificamente para a digitalização, fortalecimento socioeconômico e conexão inteligente das comunidades às margens da rodovia federal BR-232. Nosso modelo se apoia em preceitos pragmáticos de cooperação e regras regulatórias estritas.

### 🚗 1. Regulamento Tríplice da Rodovia

*   **Monetização Freemium Cooperativa**:
    *   **Estrutura de Bancas**: Segmentação em categorias de visibilidade e benefícios: **Bronze**, **Prata** e **Ouro**.
    *   **Níveis de Associação**: Hierarquias de governança e participação coletiva: **Titan**, **Factor**, **Twister** e **Alta Cilindrada**.
*   **Hermenêutica do Pertencimento (Índice de Pertencimento - IP)**:
    *   O IP é o regulador supremo de relevância e prioridade visual.
    *   **Filtro do Algoritmo**: É composto por **65% de mérito individual** (presença ativa, contribuições, feedbacks, selos recebidos) e **35% de força da associação** (impacto coletivo da cooperativa na microrregião lindeira).
*   **Protocolo de Discrição e Ética**:
    *   A postura ética, silêncio profissional e qualidade dos prestadores são fatores cruciais. Desvios ou comportamento indébito geram penalidades diretas no ranking regional, de forma totalmente automatizada.
*   **Geopolítica da Rodovia**:
    *   Toda a interface e as notificações são baseadas na hierarquização geoeconômica das cidades sob a influência da rodovia, dividindo-as em **Tronco** (eixo principal), **Galhos** (vias de conexão direta) e **Raízes** (comunidades periféricas ligadas).
    *   **Raio Dinâmico**: Notificações e alertas circulam no raio geográfico de **50 km a 100 km** para salvaguardar a relevância máxima e contextualização da rede.
*   **Segurança Operacional (Safety Guard)**:
    *   Bloqueio automático por software contra uso durante condução. Caso o GPS registre velocidade superior a **15 km/h**, as funcionalidades interativas do sistema são suspensas até que o movimento cesse.

---

## 🛠️ Módulos de Engenharia e UX

1.  **Marketplace ("A Feira")**: Digitalização contínua das mercearias, comércios locais e pequenos produtores rurais das cidades lindeiras.
2.  **Fidelidade ("Porta-Luvas")**: Sistema modular de selos digitais que geram repetição de uso, com validação segura por geofencing de proximidade e QR Codes específicos (com restrição rígida a um raio útil de **100m** para controle de fraude).
3.  **Gestão de Memória ("Mnēmē")**: Central inteligente de auxílio a compras diárias e suprimentos domésticos ou comerciais, rastreando auditorias de preço em gôndolas e criando cooperação inter-familiar para aumentar a frequência de uso diário (DAU).
4.  **B2B Gamificado**: Substituição completa de descontos tarifários diretos por ganho de visibilidade regional e acumulação de **"Quilômetros de Influência"** como incentivo motivacional aos lojistas associados.

---

## 🏗️ Diretriz de Engenharia de Software (Estabilidade LTS)

Seguimos a **Arquitetura Canônica** de preservação e separação funcional absoluta:

```
┌────────────────────────────────────────────────────────┐
│                      ELEMENTO Y                        │
│                       (O Fluxo)                        │
│  UI Moderna, Dashboards, Navegação e Telas Dinâmicas   │
└───────────────────────────┬────────────────────────────┘
                            │ (Somente leitura / Adapters)
                            ▼
┌────────────────────────────────────────────────────────┐
│                      ELEMENTO X                        │
│                      (O Cânone)                        │
│     Lógica Imutável de Negócio, Regras de Dados        │
│          Modelos Canônicos de Estado e DB            │
└────────────────────────────────────────────────────────┘
```

1.  **Elemento X (O Cânone - Imutável)**:
    *   Contém a lógica de negócio principal, representações de dados canônicos do banco e validações invioláveis.
    *   **Proibição**: Qualquer inovação na interface ou novo fluxo do *Elemento Y* está **estritamente impedido de alterar** ou poluir o núcleo do *Elemento X*.
2.  **Elemento Y (O Fluxo - Dinâmico)**:
    *   Compreende as vistas de UI, transições fluidas de tela, novos recursos interativos e filtros contextuais.
    *   **Regra de Acesso**: Para acessar ou agregar dados da camada canônica, o *Elemento Y* deve utilizar interfaces declaradas estritamente como `readonly`, padrões do tipo **Adapter** ou **Decorators**. Nenhuma de suas lógicas deve alterar estados internos diretamente do núcleo sem passar pelo crivo das validações fundamentais.
3.  **Tecnologias LTS (Stable Stack)**:
    *   **React 18.x** para maior previsibilidade de ciclo de vida e estabilidade de renderização.
    *   **Vite 5.x** integrado com **TypeScript** tipado estritamente.
    *   **Tailwind CSS** para folha de estilos rápida e encapsulada.
    *   **Firebase / Firestore (SDK v9/v10 Modular)** como banco de dados NoSQL transacional em tempo real.

---

## 📂 Arquitetura de Diretórios e Fluxos

As pastas da aplicação respeitam de forma estrita as responsabilidades do sistema:

```
├── pages/                    # Telas principais (Elemento Y: O Fluxo)
│   ├── Welcome.tsx           # Tela inicial com o Radar de Atração Regional
│   ├── Home.tsx              # Dashboard centralizado do usuário com IP
│   ├── Mneme.tsx             # Central Mnēmē e Gerenciador de Listas
│   ├── Classifieds.tsx       # A Feira (Marketplace de anúncios regionais)
│   └── ...                   # Guias de serviços, alertas e planos de patronos
├── src/
│   ├── components/           # Componentes encapsulados e reutilizáveis
│   │   ├── SafetyGuard.tsx   # Bloqueador inteligente de velocidade por GPS
│   │   └── ...
│   ├── contexts/             # Provedores de estado (AuthContext, etc.)
│   ├── services/             # Elemento X: Integração com firestore e API regional
│   └── types.ts              # Contratos e Tipos Estritos globais da Stack LTS
├── firestore.rules           # Camadas estruturadas de segurança e hardening
└── metadata.json             # Metadados e permissões solicitadas por iframe
```

---

## 🔒 Governança de Validação e Build Sucesso

Todas as escritas e migrações de dados do Ecossistema BR-232 obedecem a uma verificação em tempo de build:
*   A integridade é validada utilizando o linter rígido integrado (`tsc --noEmit`).
*   Toda implementação nova é encapsulada prevenindo efeitos colaterais em documentos vizinhos ou lógicas canônicas anteriores.
