
# 📖 Glossário Ubíquo (Ubiquitous Language)

Este documento define os termos inegociáveis do Ecossistema BR-232. Desenvolvedores **DEVEM** usar estes termos no código (variáveis, funções) e na comunicação.

## 1. Taxonomia Geográfica
*   **Tronco:** Cidades cortadas diretamente pela BR-232. É a "via principal".
*   **Galhos:** Cidades lindeiras (até 50km do eixo) que dependem logisticamente da rodovia.
*   **Raízes:** Cidades de influência regional (até 100km) que alimentam o fluxo.
*   **Malha:** O conjunto total da rede conectada pelo app.

## 2. Atores e Perfis
*   **Viajante:** Usuário comum, motorista ou passageiro.
*   **Piloto:** Profissional de moto-frete ou moto-táxi. Não usar "Motoqueiro".
*   **Patrono:** Empresa ou entidade que patrocina o ecossistema.
*   **Titan/Factor:** Níveis de classificação de frotas comerciais.

## 3. Módulos do Sistema
*   **Mnēmē (Mnemê):** Módulo de gestão doméstica e lista de compras. Referência à deusa da memória.
    *   *Anámnēsis:* Funcionalidade de histórico e comparação de preços.
*   **Porta-Luvas:** A carteira digital de fidelidade do usuário.
*   **Screening:** Processo de análise via IA da situação econômica/social de uma cidade.

## 4. Métricas e Valores
*   **IP Score (Índice de Pertencimento):** Métrica de reputação do Piloto, baseada em ética e segurança, não apenas volume de entregas.
*   **Protocolo de Discrição:** Regra de negócio que impede gamificação excessiva ou distrações enquanto o usuário está em movimento (detectado via GPS).

## 5. Termos Técnicos Específicos
*   **Blindagem:** Uso de `ErrorBoundary` para isolar falhas.
*   **Modo Fundação:** Estado do aplicativo quando opera sem conexão ou sem API Key, usando dados locais simulados.
