---
title: "Mapa Central do Cérebro Vivo — CentralDark"
status: CANONICO
date: 2026-06-29
updated: 2026-09-11T15:03:45-03:00
tags: [navegacao, moc, mapa, consciencia, intencao, continuidade, cross-chat, delta-util, semantica, proof-reuse]
category: "M-Mapa-Sistema"
sensitivity: INTERNAL
source: "owners canônicos da CentralDark + estado vivo medido + contexto cross-chat quando recuperável"
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: "LEIA-ME-IA.md + AGENTS.md + docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md"
consumer: "qualquer IA, CLI, agente, Hermes e navegação humana"
writer: SOL
---

# MAPA-DO-CEREBRO — UMA CASA, UMA DIREÇÃO

Este MOC é **mapa de navegação**, não um segundo cérebro e não um snapshot eterno de runtime. Números de tools, processos, portas e serviços só valem enquanto a chave material da prova não mudar.

## Norte

```text
👑 SEGREDO/CHEFE
   intenção + autoridade final
        │
        ▼
!CENTRALDARK   (quando explicitamente convocado)
        │
        ▼
☀ SOL
   preserva significado + coordena
        │
        ▼
#ACORDAR
   estado vivo / continuidade
        │
        ▼
!CALIBRAR
   intenção / escopo / ferramentas / prova
        │
        ▼
🧭 !MULTIBUSSOLA
   percepção material por vários eixos
        │
        ▼
⊛ !META_LUPA
   técnica de falsificação, não agente
        │
        ▼
!RECONCILIAR
   passado útil + presente vivo → um owner
        │
        ▼
✎ WRITER LEASE
   uma caneta por escopo
        │
        ▼
☿ PIVETE/HERMES
   executa + preserva + continua
        │
        ▼
!CONTRAPROVA
   provider/capacidade independente quando material
        │
        ▼
!REMEDIÇÃO
   T0 → efeito → T1
        │
        ▼
⚖ REALITY JUDGE
        │
        ▼
!FIXED_POINT
        │
        ▼
!REGISTRA
   receipt + aprendizado + proveniência + next cursor
        │
        ▼
✶ GRAFO / VETORES / BRAIN
   projeções e navegação derivadas
        │
        ▼
!BOOT
   próximo ciclo recuperável
```

A cadeia canônica completa está em:
`docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`.

## Papéis, sem mistura

```text
SEGREDO/CHEFE = HUMANO + INTENCAO + AUTORIDADE FINAL
SOL = COORDENADORA / RECONCILIADORA
PIVETE/HERMES = EXECUTOR + PRESERVACAO + CONTINUIDADE
MODELO = MOTOR SUBSTITUIVEL + PROVENIENCIA
MODELO != AUTORIDADE
META_LUPA = TECNICA
PERCEPCAO_MATERIAL = CAPACIDADE SEPARADA
CONTRAPROVA_PROVIDER = SUBSTITUIVEL POR CAPACIDADE
REALITY = JUDGE
GRAFO = DERIVADO, NAO AUTORIDADE
```

## Onde mora cada tipo de verdade

```text
IDENTIDADE / LEI DA CASA
→ LEIA-ME-IA.md
→ AGENTS.md
→ docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md

GATILHOS / CICLO / HERANCA ENTRE MOTORES
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml

PROPRIEDADES DE ARTEFATOS / NOTAS
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml

APRENDIZADO DURAVEL
→ owner canônico do assunto
→ docs/CONSCIENCIA/APRENDIZADOS.md

MAPA + PROVAS REUTILIZAVEIS
→ docs/CONSCIENCIA/MAPA-DO-CEREBRO.md

NAVEGACAO HUMANA
→ docs/BRAIN/

ESTADO TECNICO ATUAL
→ Git/PR/HEAD + runtime/log/efeito medidos no alvo correto
```

## Precedência por tipo de claim

Não existe uma fila única em que documento sempre vence realidade. A precedência depende do claim:

```text
CLAIM_DE_GOVERNANCA|IDENTIDADE|OWNER
→ CANONICO_ATUAL > MEMORIA_RELEVANTE > HISTORICO

CLAIM_DE_RUNTIME|EXECUCAO|ESTADO_ATUAL
→ EVIDENCIA_VIVA_DO_MESMO_ALVO > ESTADO_DESEJADO_DOCUMENTADO > HISTORICO

CLAIM_CROSS_CHAT
→ CONVERSA_ATUAL + HISTORICO_CHATGPT_RECUPERADO_QUANDO_ACESSIVEL + MATERIAL_FORNECIDO
→ DEDUPE + RECONCILIACAO
→ NAO_RECUPERADO = UNKNOWN
```

```text
DOCUMENTADO != EXECUTADO
MEMORIA != ESTADO_VIVO
GITHUB != MEMORIA_ENTRE_CHATS
CROSS_CHAT != CURRENT_STATE
ACTION != PROOF
```

Passado não é apagado. Ele entra como proveniência e delta candidato:

```text
PASSADO
→ DELTA_UTIL?
   SIM → RECONCILIAR NO OWNER ATUAL
   NAO → PRESERVAR COMO HISTORICO/SUPERSEDED QUANDO NECESSARIO
→ PRESENTE CONTINUA GOVERNANDO
```

## Reutilização de prova — não provar duas vezes o que não mudou

O sistema deve carregar prova já fechada como estado reutilizável. Isso não cria um novo gate; remove trabalho redundante dos gates e agentes existentes.

```text
PROVEN_DECISION
+ SAME_TARGET
+ SAME_PROOF_KEY
+ NO_NEW_CONTRADICTION
= REUSE_DECISION
```

```text
REUSE_DECISION
→ NAO_REABRIR_A_PROVA
→ NAO_PEDIR_AO_CHEFE
→ NAO_CRIAR_NOVO_GATE
→ NAO_CRIAR_NOVO_OWNER
→ IR_DIRETO_AO_PROXIMO_DELTA_NAO_PROVADO
```

A prova é invalidada somente pelo evento que realmente altera o claim:

```text
GIT/CI      → repo|PR|HEAD_SHA mudou
RUNTIME     → build|PID|porta|processo|config material mudou
MCP         → catalogVersion|policy mudou
DOCUMENTO   → revisão|hash|owner mudou
RECEIPT     → hash|issuer|PR|HEAD mudou
CROSS_CHAT  → nova evidência material contraditória apareceu
```

`PASSAGE_FREE` significa passagem livre sobre **prova ainda válida**, nunca bypass de segurança, autorização, secret boundary ou mudança material.

## Registro de provas reutilizáveis — escavação consolidada 2026-09-11

Este bloco cristaliza somente o que foi observado/provado ou fornecido como artefato exato. Estados vivos carregam sua própria condição de invalidação.

### P1 — MCP CentralDark conectado e catálogo observado

```text
OBSERVED_AT=2026-09-11T18:03:31Z
MCP_OK=true
DISPATCHER=mcp_admin_call
RUNTIME_TOOLS=114
DESTRUCTIVE_TOOLS=18
CATALOG_VERSION=v1-f8ff6720fec3
AUDIT_STARTUP_READY=true
PROOF_KEY=MCP_CATALOG_VERSION+POLICY
REUSE_UNTIL=catalogVersion|policy|runtime reload change
```

Política observada na mesma sessão:

```text
AUTO_SAFE=true
SENSITIVE_CONFIRMED=true
HARD_SECRET_BLOCK=true
OBRA_MODE=false
OBRA_FULL_ADMIN=false
SECRET_VALUES_RETURNED=false
```

A ferramenta existir no catálogo prova **capacidade catalogada**; não prova que toda tool está exposta em toda superfície. `AVAILABLE_HERE != POSSIBLE_GLOBALLY` e `UNAVAILABLE_HERE != IMPOSSIBLE`.

### P2 — GitHub main e VPS são corpos diferentes

```text
OBSERVED_AT=2026-09-11T18:03:45Z
GITHUB_MAIN=8954b313bc5eb56f83e44d6bf54a2c986bc9d970
VPS_BRANCH=main
VPS_HEAD=836f1f2f8db
VPS_BEHIND_MAIN=1
VPS_WORKTREE_DIRTY=true
DEPLOY_STATUS=ERRO
PROOF_KEY=GITHUB_MAIN+VPS_HEAD+VPS_WORKTREE
REUSE_UNTIL=qualquer um desses campos mudar
```

Na VPS, o snapshot observado tinha `CentralDark-AiDiag=stopped`, `CentralDark-WebhookDeploy=stopped` e `CentralDark-HermesVerificador=errored`, enquanto vários outros serviços permaneciam online. Isso é snapshot de runtime, não lei permanente.

### P3 — Elite Gateway existe, mas health de aplicação não deve ser inferido por PM2

```text
OBSERVED_AT=2026-09-11T18:03:37Z
PROCESS=CentralDark-EliteHTTP
PM2=online
LOCAL_ENDPOINT=http://localhost:8080/v1/chat/completions
PUBLIC_ENDPOINT=https://api.centralldark.com/v1/chat/completions
LOCAL_PROBE=HTTP_404
VERDICT=PROCESS_ONLINE_BUT_ENDPOINT_HEALTH_NOT_PROVEN
```

`PM2_ONLINE != API_PASS` permanece obrigatório.

### P4 — Google Drive acessível; Gmail vivo não foi provado nesta superfície

Na sessão, `/Google Drive` foi enumerado como mount externo e documentos reais foram listados. Também foi recuperado histórico documentando configuração Workspace com Drive e scopes de Gmail/Calendar/Contacts/Sheets/Docs.

```text
GOOGLE_DRIVE_CURRENT_ACCESS=PROVEN_IN_SESSION
GOOGLE_WORKSPACE_HISTORICAL_CONFIG=DOCUMENTED
GMAIL_CURRENT_DIRECT_ACCESS=NOT_PROVEN_IN_THIS_SESSION
GMAIL_TOOL_ATTEMPT=BLOCKED_BY_SESSION_PERMISSION
```

Regra: configuração histórica de Gmail não vira `GMAIL_LIVE=PASS`; se uma superfície futura ganhar acesso direto, mede somente esse delta.

### P5 — VS Code/túnel: evento histórico existe; portas 9000–9099 continuam sem prova atual

Logs recuperados desta data registram criação bem-sucedida de um socket `renderer-Tunnel-*` no VS Code remoto. Isso prova o evento naquele timestamp, não o estado atual nem uma porta específica.

```text
VSCODE_TUNNEL_SOCKET_EVENT=PROVEN_HISTORICAL
PORTS_9000_9099_CURRENT=UNKNOWN
DO_NOT_RESTATE_AS_CLOSED_OR_OPEN_WITHOUT_SOCKET_MEASUREMENT=true
```

### P6 — revisão universal: design aprovado; implementação ainda precisa usar owners existentes

O artefato exato da especificação foi fornecido e revisado nesta sessão. A decisão cristalizada é:

```text
MODEL=PROVENIENCE
MODEL_AUTHORITY=NONE
EXECUTOR_AUTHENTICATED_CANNOT_BE_SELF_DECLARED=true
TRUSTED_ISSUER+SAME_REPO+SAME_PR+SAME_HEAD+VALID_RECEIPT+PASS+ZERO_UNKNOWN_MATERIAL
= REVIEW_GATE_PASS
```

Owners vivos medidos na `main`:

```text
.github/workflows/pr-auto-review.yml
scripts/github-autonomia-green-guard.mjs
.github/workflows/autonomia-promocao.yml
```

Fato vivo: `pr-auto-review.yml` ainda contém a caixa `Revisão final Codex visível`, e `github-autonomia-green-guard.mjs` ainda exige pelo nome o workflow `PR auto-review (Codex + checklist)`. Portanto a normalização deve ser atômica nos consumidores ou preservar o nome consumido enquanto neutraliza a semântica. **Nenhum workflow/guard paralelo.**

Status desta prova:

```text
DESIGN=APPROVED
CURRENT_IMPLEMENTATION=NOT_YET_PROVEN_AS_NORMALIZED
NO_FALSE_GREEN=true
```

### P7 — execução por IA/agente não é proibida; autoridade e prova são separadas

A arquitetura viva já executa testes e comandos determinísticos em runners self-hosted. A regra correta é:

```text
AUTHORIZED_EXECUTION=ALLOWED
MODEL_NAME_IS_NOT_AUTHORITY=true
ACTION != PROOF
EXECUTOR_CANNOT_SELF_APPROVE=true
REALITY_IS_JUDGE=true
```

Logo, frases antigas do tipo `IA não executa código` só são válidas quando querem dizer `IA não pode transformar opinião em execução comprovada`. Como proibição absoluta, contradizem a arquitetura executora existente.

### P8 — promoção/autonomia já tem owner; não inventar segundo promotor

```text
PROMOTION_OWNER=.github/workflows/autonomia-promocao.yml
GREEN_GUARD=scripts/github-autonomia-green-guard.mjs
REQUIRED_SAME_PR_AND_HEAD=true
PENDING|SKIPPED|MISSING|FAIL != PASS
MERGE_POLICY=squash
```

O guard observado liga runs ao mesmo PR e ao mesmo `HEAD_SHA`. Isso deve ser reutilizado pela revisão universal em vez de criar arquitetura paralela.

### P9 — regra cross-chat consolidada

Contexto de chats, Library, Drive, documentos, memória privada e mensagens serve para recuperar decisões e evidências, não para fingir estado atual.

```text
RECOVER_BEFORE_REASK=true
CROSS_CHAT=READ_ONLY_CONTEXT
HISTORICAL_PROOF_REUSED_WHEN_PROOF_KEY_STILL_MATCHES=true
HISTORICAL_RUNTIME_STATE != CURRENT_RUNTIME_STATE
FAILURE_TO_READ_ONE_SOURCE != FAILURE_OF_WORLD
```

Se Gmail, um chat ou um conector específico estiver indisponível, o agente usa as demais fontes autorizadas e marca somente aquele eixo como `UNKNOWN/BLOCKED`, sem apagar o restante da prova já consolidada.

## Reconciliação cross-chat

Quando a missão pede recuperar outras conversas do ChatGPT, a Casa trata isso como **contexto read-only**, nunca como atalho para estado técnico:

```text
TEMA_ATUAL
→ RECUPERAR_CHAT_HISTORY_QUANDO_ACESSIVEL
→ CRUZAR_CONVERSAS_RELEVANTES
→ DEDUPE
→ PRESERVAR DECISOES + CORRECOES + APRENDIZADOS + PENDENCIAS
→ SEPARAR HISTORICO DE ESTADO_ATUAL
→ CONTRADICAO → META_LUPA + RECONCILIAR
→ NAO_RECUPERADO → UNKNOWN
→ SOMENTE DELTA_UTIL VAI AO OWNER EXISTENTE
```

```text
GITHUB_MUST_NOT_SUBSTITUTE_MISSING_CHAT_MEMORY=true
RECOVER_BEFORE_REASK=true
CROSS_CHAT_MODE=READ_ONLY
```

## Um cérebro lógico, várias superfícies

```text
GitHub + Google Drive/Workspace + Obsidian/BRAIN + Grafo + Vetores + Chat + CLI + MCP + Hermes
!= varios cerebros

N SUPERFICIES
→ N PERCEPCOES
→ UM RENDEZVOUS
→ UMA INTENCAO VIGENTE POR MISSAO
→ UM WRITER POR ESCOPO
→ UMA REALIDADE COMO JUDGE
```

`docs/BRAIN/`, Grafo Vivo, vetores, Drive e histórico de chats são navegação/índices/projeções/contexto. Eles não substituem os owners canônicos nem o runtime quando o claim é runtime.

## Nota boa precisa endereço e relação

Toda nota derivada que Hermes precise consumir deve carregar as propriedades do contrato:

```text
IDENTIDADE
+ TEMPO
+ CLASSIFICACAO
+ PROVENIENCIA
+ OWNER
(+ CONSUMER/WRITER quando aplicavel)
(+ RELACOES_SEMANTICAS quando houver ganho)
→ NOTA ROTEAVEL
```

Relação semântica liga conhecimento, mas não fabrica causalidade:

```text
SEMANTIC_LINK != PROOF
SEMANTIC_LINK != AUTHORITY
GRAPH_EDGE != CAUSALITY
```

Sem propriedades obrigatórias:

```text
NOT_FLASH_READY
```

## Linguagem humana não precisa parecer código

A fala do CHEFE pode ser curta, abreviada, metafórica ou cheia de digitação rápida sem perder intenção. A Casa deve preservar significado antes de exigir sintaxe perfeita.

```text
FALA_HUMANA
→ PRESERVAR_SIGNIFICADO
→ RESOLVER_CONTEXTO
→ MEDIR_REALIDADE
→ CONTRATO_DETERMINISTICO
```

Na apresentação ao humano, podem coexistir:

```text
CADENCIA_DE_VERSICULO_ORIGINAL_QUANDO_UTIL
+ BAIANES_FACIL
+ PRECISAO_TECNICA
+ PARALELISMO_NARRATIVO
```

Essa camada é apresentação. Não é autoridade religiosa, não altera prova e não substitui o contrato técnico.

## Conexões rápidas

- `LEIA-ME-IA.md` — porta universal atual.
- `AGENTS.md` — contrato dos agentes.
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` — identidade/invariantes.
- `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md` — entrada de IA + política de reuso de prova.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml` — ciclo mestre.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml` — gatilhos.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml` — propriedades.
- `docs/ARQUITETURA/CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md` — capacidade/instrumento/sinal.
- `docs/BRAIN/01-CONCEITOS/Banda/BANDA_COMPASSO_GLOBAL.md` — semântica musical de compasso compartilhado.
- `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md` — entrada humana do vault.
- `docs/CONSCIENCIA/APRENDIZADOS.md` — aprendizados duráveis.

## Regra final

```text
MUITOS_OLHOS=true
MUITOS_CHEFES=false
UMA_DIRECAO_POR_MISSAO=true
ONE_WRITER_PER_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
GRAPH_IS_DERIVED_NOT_AUTHORITY=true
ZERO_DUPLICATE_OWNER=true
REUSE_PROVEN_DECISION=true
REVALIDATE_ONLY_INVALIDATED_DELTA=true
NO_REDUNDANT_REPROOF=true
NO_NEW_GATE_FOR_ALREADY_PROVEN_FACT=true
```
