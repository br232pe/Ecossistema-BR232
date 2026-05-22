# Canal de Segurança Epoíēsa (SECURITY_CANON) - Regras do Firestore

Este arquivo define e documenta a **Garantia de Integridade e Segurança** do banco de dados (Firestore) do Ecossistema BR-232, zelando para que a evolução dos privilégios e políticas de privacidade ocorra de forma aditiva, modular, e sempre em conformidade com o **Cânone LTS**.

---

## 🔒 Arquitetura de Segurança em Camadas (firestore.rules)

Todas as regras descritas no arquivo `firestore.rules` seguem uma hierarquia de validação em camadas, dividindo o processo de decisão de acesso em subfunções independentes e complementares:

```
┌────────────────────────────────────────────────────────┐
│              HELPERS DE IDENTIDADE (Base)              │
│       isSignedIn(), isVerified(), isOwner(userId)     │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│             VALIDADORES DE HARDENING (Tipos)           │
│         isValidId(id), incoming(), existing()          │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│              CAMADA CANÔNICA LTS (Negócio)             │
│   isValidUser(), isValidPatron(), isValidAlert()...    │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│         CAMADA INCREMENTAL (Novas Restrições)          │
│ Restrições de contexto e ações pontuais && operacionais│
└────────────────────────────────────────────────────────┘
```

### 1. Helpers de Identidade
Funções de acesso mais básicas responsáveis por descobrir "Quem está solicitando esta operação?":
*   `isSignedIn()`: Retorna se o usuário está autenticado com o Firebase Auth.
*   `isVerified()`: Valida condições adicionais de segurança ou verificação para novos escritores da rede.
*   `isOwner(userId)`: Determina se o usuário requisitante é o verdadeiro autor/gerente do documento em foco, ou se é a conta agregadora (`SYSTEM`).

### 2. Validadores de Hardening
Filtros defensivos para evitar inserção de formatos maliciosos, estouro de campos string ou uso indébito do tráfego:
*   `isValidId(id)`: Limita o padrão e tamanho dos IDs a caracteres alfanuméricos com hífens e sublinhados, além de tamanho seguro (≤ 128 bytes).
*   `incoming()`: Representa o conjunto de dados propostos para escrita (novo conteúdo).
*   `existing()`: Representa o conjunto de dados atualmente gravados na malha de persistência.

### 3. Camada Canônica (LTS)
Esquemas de dados invioláveis prefixados na documentação canônica (como validações estruturais de integridade de persistência). Eles garantem que cada documento contenha chaves essenciais com tipos apropriados ao negócio:
*   `isValidUser(data)`: Valida se o perfil possui `uid`, `email`, `identities`, `stats`, data de criação e atualização sincronizadas com o tempo exato do servidor (`request.time`).
*   `isValidPatron(data)`: Restringe a propriedade de patronatários (Bancos de Fomento e lojistas) à verificação do criador real. Impede a auto-verificação do status `isVerified`.
*   `isValidAlert(data)`: Impede alertas fantasmas ao certificar a correspondência de `timestamp = request.time` e id da autoria.
*   `isValidClassified(data)`: Restringe o classificado para apenas três status canônicos permitidos: `['active', 'sold', 'expired']`.

### 4. Camada Incremental (Extensões)
Funções que especificam e estendem a proteção de propriedades ou comportamentos adicionais em fluxos de execução adjacentes.
*   Exemplo de transações da central `loyalty_transactions`: É validado o geofencing conceitual e imposta a integridade da mudança de status, de modo a impedir que usuários alterem pontuações computadas por patronos (`kmEarned`) sem a devida auditoria.

---

## 🛡️ Protocolo de Modificação e Adição de Regras

Para evitar quebras de estabilidade na integridade dos dados, novos controles devem ser implementados sem modificar as regras básicas de segurança já catalogadas. O procedimento correto de mitigação de vulnerabilidades é:

1.  **Preservação do Cânone**: Jamais desative ou remova as validações de blueprint essenciais do modelo `firestore.rules`.
2.  **Adição Incremental**: Sob novas regras de negócio limitadoras, implemente uma nova função incremental e encadeie-a usando o operador lógico `&&` nos gatilhos correspondentes:
    ```javascript
    allow update: if isOwner(existing().authorId)
      && isValidClassified(incoming()) // Lógica Canônica
      && isStatusProtegido(incoming(), existing()); // Lógica Incremental
    ```
3.  **Auditoria Geográfica Co-Piloto**: Garantia de que modificações nas coleções de alertas físicos, transações de selo do *Porta-Luvas* e localização de rotas respeitam a validação das distâncias máximas do eixo da rodovia.
