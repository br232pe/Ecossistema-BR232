# ECOBR232 - Manifesto de Arquitetura Trancada (LTS)

Este documento estabelece a Baseline Sistêmica do projeto. É expressamente proibida qualquer modificação estrutural que viole os 6 pelouros de engenharia descritos abaixo.

## 1. Topologia de Banco de Dados de Instância Única (Single Source of Truth)
Toda a infraestrutura de persistência opera exclusivamente na instância `(default)`. As chamadas à inicialização do Firestore utilizam apenas `getFirestore(app)`. O isolamento de domínios ocorre obrigatoriamente através da hierarquia de coleções e subcoleções. Proibida a criação de múltiplos bancos de dados.

## 2. Integridade ACID Global (Transacionalidade Unificada)
Modificações correlatas de estado multimodular ou operações de múltipla escrita concorrente devem ser executadas de forma atômica utilizando o método nativo `runTransaction` do Firebase Firestore. Proibida a execução de escritas desconectadas ou redundantes.

## 3. Gestão de Cache e Concorrência (Substituição Determinística)
O armazenamento local (`localStorage`) opera puramente como uma visualização otimista inicial descartável (read-only instant fallback). Toda escuta em tempo real (`onSnapshot`) ou carregamento ativo (`getDoc`) tem autoridade absoluta e deve sobrescrever o estado local. É proibido mesclar dados de forma que permita a reinjeção de 'dados fantasmas' excluídos no servidor.

## 4. Hidratação Atômica de Sessão e DOM Reconciliation
O estado de inicialização no cliente não pode disparar múltiplos ciclos de renderização com informações parciais. O provedor `AuthContext` utiliza State Batching, aguardando a resolução integral do usuário de autenticação e de seu perfil no Firestore antes de liberar o estado de `loading`. O timeout de resiliência de rede é fixado estritamente em 5000ms.

## 5. Otimização do Event Loop e Segurança Geográfica
É proibida a concorrência de requisições à API de geolocalização. O acoplamento do controle de segurança veicular (`SafetyGuardOverlay`) ocorre em instância única no topo da árvore de componentes, evitando re-renders redundantes e vazamento de memória.

## 6. Stack Tecnológica Rigorosa (LTS)
Toda a base é sustentada por ferramentas estáveis, focadas no 'Build Sucesso'. Uso exclusivo de React 18.x, Vite 5.x, TypeScript (com checagem estrita de tipos) e Firebase Modular V9/V10. Terminologias românticas ou ambíguas estão banidas do código e dos logs.
