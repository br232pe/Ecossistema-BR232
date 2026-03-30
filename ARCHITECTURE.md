
# 🏛️ Arquitetura do Sistema: Ecossistema BR-232

> **Versão:** 1.0.0 (Foundation)
> **Stack:** Vite + React 18 + Firebase + Gemini AI
> **Paradigma:** Mobile-First Progressive Web App (PWA)

## 1. Visão Geral
O Ecossistema BR-232 é uma aplicação distribuída focada em alta resiliência (Offline-First capability) e performance em dispositivos móveis. A arquitetura segue o padrão **Component-Based**, onde cada módulo (Mnēmē, Monitor, Fidelidade) opera como um micro-frontend lógico dentro de um monólito modular.

## 2. Decisões Técnicas (ADR)

### 2.1. Framework Core (LTS)
Optou-se pelo **React 18.2.0** em detrimento do React 19/Canary.
*   **Motivo:** Estabilidade do ecossistema de bibliotecas (Lucide, Router) e prevenção de erros de hidratação.
*   **Router:** `react-router-dom` v6 com Lazy Loading (`React.Suspense`) para dividir o bundle e acelerar o First Contentful Paint (FCP).

### 2.2. Gestão de Estado e Dados
*   **Persistência Volátil (MVP):** `localStorage` via `services/db.ts` para dados do usuário (listas, rascunhos).
*   **Persistência Remota:** Firebase (Auth) para identidade.
*   **Inteligência Artificial:** Camada de serviço `geminiService.ts` que atua como *Facade* para a API do Google, com tratamento de erros (try/catch) e dados de *fallback* (mock) para garantir que a UI nunca quebre se a API cair.

### 2.3. Estilização
*   **Tailwind CSS:** Utility-first para garantir consistência visual e baixo peso de CSS.
*   **Design Tokens:** Cores (`primary`, `surface-dark`) definidas no `tailwind.config` e injetadas no `index.html`.

## 3. Estrutura de Diretórios
```
/
├── components/      # UI Atoms & Molecules (SmartHeader, ContextBar)
├── pages/           # Views/Screens (Roteadas)
├── services/        # Lógica de Negócio e Conexões Externas (DB, AI)
├── utils/           # Funções Puras (Cálculos de Preço, Formatação)
└── types.ts         # Contratos de Dados (TypeScript Interfaces)
```

## 4. Fluxo de Dados Crítico
1.  **Usuário** interage com a UI.
2.  **Componente** chama um **Service** (ex: `db.mneme.createList`).
3.  **Service** persiste no Storage e retorna o objeto atualizado.
4.  **Componente** atualiza o estado local (`useState`) para refletir a mudança imediatamente (Optimistic UI).

## 5. Segurança
*   **Blindagem:** Componente `ErrorBoundary.tsx` envolve todas as rotas principais. Falhas em módulos não derrubam o app.
*   **Validação:** Inputs de usuário são sanitizados antes de processamento.
