
# 🎨 Design System: BR-232 Noir

> **Identidade:** Futurismo Agreste, Alta Visibilidade, Modo Noturno Nativo.

## 1. Paleta de Cores (Tokens)

### Primárias (Ação & Destaque)
*   `primary`: `#00e676` (Emerald Green). Usado em CTAs, ícones ativos e selos de verificação.
*   `primary-dark`: `#00c853`. Hover states e bordas.
*   `secondary`: `#ffab00` (Amber). Usado para alertas, avisos e elementos de atenção.

### Superfícies (Modo Dark)
*   `background-dark`: `#050d09` (Preto Profundo com tintura verde). Fundo global.
*   `surface-dark`: `#0c1a14` (Camada 1). Cards e Paineis.
*   `surface-light`: `#12261d` (Camada 2). Headers e Elementos flutuantes.

### Texto
*   `text-white`: `#ffffff` (Títulos, Destaques).
*   `text-slate-400`: `#94a3b8` (Corpo, Descrições).
*   `text-slate-500`: `#64748b` (Metadados, Legendas).

## 2. Tipografia
*   **Família:** `Inter` (Google Fonts).
*   **Estilos:**
    *   *Display:* `font-black`, `uppercase`, `italic`. Usado em Títulos e Heróis. Ex: "ECOSSISTEMA BR232".
    *   *UI:* `font-bold`, `uppercase`. Usado em Botões, Badges e Tabs.
    *   *Body:* `font-medium`. Leitura geral.

## 3. Componentes Core

### 3.1. SmartHeader
Cabeçalho padrão com botão de voltar e título.
*   **Props:** `title`, `subtitle`, `rightAction`.
*   **Comportamento:** Sticky, com backdrop-blur.

### 3.2. Cards
*   **Border Radius:** `rounded-[2rem]` ou `rounded-3xl`. Curvas acentuadas são a assinatura visual.
*   **Bordas:** `border border-white/5`. Sutis, apenas para definição.
*   **Sombra:** `shadow-xl`.

### 3.3. Botões (CTAs)
*   **Altura:** `h-14` ou `h-16` (Touch-friendly).
*   **Texto:** Sempre `uppercase`, `tracking-widest`, `font-black`.

## 4. Ícones
*   **Biblioteca:** `lucide-react` (Estilo de linha) e `Material Symbols` (Estilo preenchido/sólido).
*   **Uso:** Lucide para UI geral, Material para ações de mapa/navegação.
