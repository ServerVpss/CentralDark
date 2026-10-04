---
title: "Mapa Central do Cérebro Vivo — CentralDark"
status: CANONICO
date: 2026-06-29
updated: 2026-10-03T16:39:16-03:00
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

## Norte CURRENT — direto, sem ritual obrigatório

```text
👑 CHEFE fala
   ↓
INTENÇÃO VIGENTE
   ↓
RECUPERAR CURRENT somente do que importa
   ↓
ESCOLHER QUALQUER CAPABILITY VIVA + AUTORIZADA
   ↓
FAZER
   ↓
READBACK / EFEITO REAL
   ↓
SE FALHOU LOCALMENTE → OUTRA ROTA AUTORIZADA
   ↓
SE FECHOU → CONTINUAR O FIO
```

`#ACORDAR`, `!CALIBRAR`, `!MULTIBÚSSOLA`, `!META_LUPA`, `!RECONCILIAR`, `!CONTRAPROVA`, `!FIXED_POINT` e `!REGISTRA` continuam como lentes/ferramentas sob demanda. Não são escada obrigatória, permissão nem freio de intenção autorizada.

A cadeia histórica completa permanece disponível em:
`docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml` como biblioteca/compatibilidade, não como trilho obrigatório.

## Papéis, sem mistura

```text
SEGREDO/CHEFE = HUMANO + INTENCAO + AUTORIDADE FINAL
SOL = COORDENADORA / RECONCILIADORA
HERMES = EXECUTOR + PRESERVACAO + CONTINUIDADE
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


## Receita executável de caminho já provado

Quando uma sequência operacional já foi fechada com prova suficiente, o sistema não recomeça a investigação do zero. O caminho sobrevivente vira **receita executável versionada**, com fingerprint e critérios explícitos de invalidação.

```text
CAMINHO_JA_PROVADO
→ SELAR_RECEITA_EXECUTÁVEL
→ GUARDAR_FINGERPRINT
→ PRÓXIMO_EXECUTOR_CARREGA_A_RECEITA
→ ADAPTA_SOMENTE_BINDINGS_DO_AMBIENTE
→ EXECUTA_A_MESMA_SEQUÊNCIA
→ RODA_A_MESMA_PROVA
→ COMPARA_RESULTADO_FORMATO_EFEITO
→ DIVERGIU = DELTA_NOVO
→ NÃO_DIVERGIU = REUTILIZA_CRISTAL
```

### Estrutura mínima da receita

```text
RECIPE_ID
OWNER
SCOPE
SOURCE_COMMIT|SOURCE_RECEIPT
PROOF_KEY
ARTIFACT_FINGERPRINT
DEPENDENCY_FINGERPRINT
POLICY_OR_GATE_VERSION
ENVIRONMENT_BINDINGS
EXECUTION_SEQUENCE
EXPECTED_RESULT
EXPECTED_FORMAT
EXPECTED_EFFECT
PROOF_SEQUENCE
INVALIDATION_EVENTS
NEXT_CURSOR
```

A receita separa **lógica estável** de **bindings de ambiente**. O próximo executor pode adaptar somente caminho, host, porta, container, credencial indireta, runtime ou adapter quando esses campos forem declarados como bindings; ele não reescreve a sequência canônica sem contraprova.

```text
SAME_RECIPE
+ SAME_PROOF_KEY
+ SAME_FINGERPRINT
+ BINDINGS_COMPATÍVEIS
+ SAME_RESULT_FORMAT_EFFECT
= REUSE_CRYSTAL
```

Se houver divergência material em resultado, formato ou efeito:

```text
DIVERGENCE
→ PRESERVAR_CRISTAL_ANTERIOR
→ ISOLAR_DELTA
→ REMEDIR_SOMENTE_DELTA
→ NOVA_PROVA
→ NOVA_RECEITA_OU_NOVA_REVISAO
```

**Fato comprovado não se repete por cerimônia.** Repete-se somente a prova mínima definida pela própria receita para confirmar equivalência no novo binding ou quando a `PROOF_KEY` for invalidada.

### Critérios consolidados desta sessão

```text
REALIDADE=JUDGE
UNKNOWN != PASS
UNKNOWN_BY_ACCESS != FAIL_GLOBAL
UNAVAILABLE_HERE != IMPOSSIBLE
ONE_SYSTEM_ONLY=true
ONE_HERMES_LOGICAL=true
N_EXECUTORS_ALLOWED=true
ONE_WRITER_PER_SCOPE=true
GITHUB_CANON != VPS_RUNTIME
VPS_RUNTIME != CASA_RUNTIME
NO_BLIND_OVERWRITE=true
REUSE_BEFORE_CREATE=true
IMPROVE_BEFORE_REPLACE=true
SIMPLIFY_BEFORE_EXPAND=true
MEASURE_BEFORE_MUTATE=true
NO_REDUNDANT_REPROOF=true
NO_NEW_GATE_FOR_ALREADY_PROVEN_FACT=true
```

- GitHub conserva o canon versionado; VPS e Casa conservam seus estados vivos próprios.
- VPS, Casa e GitHub são reconciliados; nenhum deles sobrescreve automaticamente o outro.
- Casa pode executar o mesmo Hermes lógico em container; isso não cria segundo Hermes.
- Hermes pode coordenar N executores; executor não vira nova autoridade, novo owner ou novo cérebro.
- Integração opcional não vira bloqueio global só por estar ausente/falhando; só bloqueia quando o claim atual realmente depende dela.
- Sucesso sem mudança durável de arquivo gera receipt/prova; não exige commit artificial.
- Mudança durável e reutilizável deve ser cristalizada no owner correto e versionada.
- Quando `!CENTRALDARK` já for o gatilho composto declarado pelo Trigger Fabric vigente, não duplicar manualmente subgatilhos na entrada; primeiro consumir o grafo canônico do próprio trigger.
- `api.github.com/meta` é sensor de infraestrutura GitHub; não substitui checks/statuses/mergeability de PR.
- OAuth/MCP autenticado, tool list e processo Remote/Tray são provas distintas; bridge fim-a-fim só é PASS quando uma tool call atravessa o bridge e retorna resposta válida.


## 🧭 Roteador comportamental de setores — onde cada capacidade mora

Este mapa também governa **roteamento de comportamento**. A IA não deve escolher uma ferramenta primeiro e tentar encaixar a missão depois. Deve classificar a intenção pelo setor, localizar o owner canônico, escolher a superfície disponível e só então executar/provar.

```text
SECTOR_ROUTER_REQUIRED=true
ROUTE_INTENT_TO_SECTOR_BEFORE_TOOL=true
ROUTE_BY_CAPABILITY_NOT_TOOL_NAME=true
SECTOR_OWNER_UNKNOWN_STAYS_UNKNOWN=true
ONE_PATH_FAILURE_IS_NOT_SYSTEM_FAILURE=true
MULTI_PATH_FAILOVER_BEFORE_GLOBAL_BLOCKED=true
CURRENT_RUNTIME_STATE_IS_NOT_CANONICAL_OWNER=true
MAP_IS_ROUTER_NOT_SECOND_BRAIN=true
```

Fluxo:

```text
INTENÇÃO DO CHEFE
→ CLASSIFICAR SETOR
→ LOCALIZAR OWNER
→ IDENTIFICAR SUPERFÍCIE/RUNTIME
→ REUSE_BEFORE_CREATE
→ ESCOLHER MENOR ROTA VIVA
→ FALLBACK DO MESMO SETOR QUANDO EXISTIR
→ PROVA APLICÁVEL
→ REGISTRAR DELTA
```

### Matriz de setores da CentralDark

| Setor/capability | Owner canônico / endereço | Papel | Regra de roteamento |
|---|---|---|---|
| 👑 Intenção e autoridade humana | SEGREDO/CHEFE + `SOUL-SOL.md` | define objetivo, prioridade e autorização | modelo não inventa contrato mental |
| 🧬 Identidade e lei da Casa | `LEIA-ME-IA.md` + `AGENTS.md` + `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` | invariantes e precedência | carregar antes de alterar significado |
| 🧭 Navegação/onde fica cada coisa | `docs/CONSCIENCIA/MAPA-DO-CEREBRO.md` | roteador de setores/owners | consultar antes de procurar ferramenta |
| 🧠 Gramática e aprendizado comportamental | `SOL-GRAMATICA-DE-ENSINO.yml` + `.agents/skills/centraldark-operational-method/SKILL.md` | transformar correções do CHEFE em comportamento reutilizável | próximo executor herda sem reensino |
| 🔄 Orquestração/ciclo | `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml` + `TRIGGERS.yml` | ciclo ponta a ponta | não criar segundo orquestrador |
| ☿ Execução agêntica | `apps/modulos/HERMES-CORE/` | execução/coordenadores/especialistas | executor não vira autoridade |
| 🧰 Skills/capabilities | `.agents/skills/` | catálogo de capacidades | catálogo grande → selecionar poucas discriminantes |
| 🎙️ Voz | `.claude/skills/synced/voice-semantic-classifier/SKILL.md` | superfície de voz/ASR | VOICE_IS_SURFACE_NOT_BRAIN |
| ⚖ Evidência/gates | `SEMANTIC-GREEN-GATE.yml` + Fixed Point Fabric + Reality Judge | filtrar claim/falso-verde | ACTION != PROOF; UNKNOWN != PASS |
| 🐙 GitHub/canon versionado | `ServerVpss/CentralDark@main` | rendezvous canônico de código/docs | main atual > histórico |
| ⚓ PR-MÃE | PR `#1562` | ledger/rendezvous permanente | receipt/handoff; não é segundo writer |
| 🖥️ Cockpit/UI atual | `apps/modulos/Bolt/source/` + Hub inventory | superfície visual atual | visual != autoridade |
| 🧩 AionUi/AionCore | integração alvo/donor medida em 2026-10-01 | shell/cockpit + agent bus reutilizáveis | TARGET/DONOR; não promover a owner atual sem integração provada |
| 🧪 Hermes WebUI antiga | `apps/modulos/WebUI/` | DONOR de capacidades/UX | DONOR_IS_NOT_SOURCE_OF_TRUTH |
| 🌐 Rede privada | Tailscale + `scripts/remote-bridge/README-HUMANO-BRIDGE-TAILSCALE-OAUTH.md` | PRIVATE_SPINE | transporte != GUI |
| ⌨️ Controle remoto textual | SSH + `docs/CONSCIENCIA/05-SSH-VPS.md` | CONTROL_PLANE | usar para reparar serviços/GUI quando shell estiver vivo |
| 🖱️ Desktop remoto interativo | AnyDesk no runtime alvo | INTERACTIVE_GUI | GUI != network spine |
| 🆘 Resgate fora de banda | Contabo VNC/Rescue | OUT_OF_BAND_RESCUE | usar quando SO/rede interna não sustentarem as rotas normais |
| 🐧 Corpo/SO | `centraldark-os` / openKylin runtime | substrate operacional | OS != identidade CentralDark |
| 🏠 Casa | Windows SEGREDO + Remote Desktop Commander | edge/local executor + percepção | CASA_OFFLINE não invalida VPS |
| 🖥️ VPS/runtime | runtime medido no host atual | corpo always-on / efeito real | DOCUMENTED != DEPLOYED |
| 🔐 Vault/secrets | `/root/CentralDark/secrets` + `docs/CONSCIENCIA/13-COFRE-SECRETS-CENTRALIZADO.md` | owner de segredo/credencial | valor não vai para Git/log/receipt |
| ☁️ Drive/transferência | Google Drive/rclone + rotas OAuth autorizadas | storage/transfer externo | auth é binding; Drive não vira fonte de verdade de runtime |
| 🤖 Bots/Telegram | `apps/bot-telegram/` + `unified-bot.cjs` | canais | perfil/boot/menu diferenciam; token não mistura |
| 🛡️ Guardião/segurança | `docs/CONSCIENCIA/DARKAI/GUARDIAO-CONFIG.md` + perfil Guardião no bot unificado | segurança/notificação | setor de segurança não vira segundo cérebro |
| 🕒 Horário | `central-horario/` | owner global de tempo humano/máquina | um sistema de horário |
| 🏗️ Builder | `apps/modulos/Bolt/` | construtor/aplicações | evoluir owner atual antes de criar paralelo |
| 🔌 MCP/conectores | `apps/modulos/mcp/` + contratos MCP | ferramentas externas/capabilities | conexão != autoridade |
| 📚 Memória/aprendizado | `docs/CONSCIENCIA/APRENDIZADOS.md` + `docs/CONSCIENCIA/LEMBRANCAS/` + memory-linker | cristal durável | sessão isolada != aprendizado permanente |
| 🔎 Grafo/BRAIN | `docs/BRAIN/` + GraphRAG/Semantic Linker | navegação/relações | GRAPH_EDGE != CAUSALITY; grafo != autoridade |
| 🚦 CI/PR/review | `.github/workflows/` + guards existentes | gates de integração | SAME_HEAD; pending/skipped != pass |

### Contrato de acesso remoto híbrido

O setor de acesso remoto é **multi-path**; nenhuma ferramenta sozinha representa a disponibilidade da máquina.

```text
REMOTE_ACCESS_IS_MULTI_PATH=true
TAILSCALE_ROLE=PRIVATE_SPINE
ANYDESK_ROLE=INTERACTIVE_GUI
SSH_ROLE=CONTROL_PLANE
CONTABO_VNC_ROLE=OUT_OF_BAND_RESCUE
ONE_PATH_FAILURE_IS_NOT_MACHINE_FAILURE=true
FAILOVER_BEFORE_BLOCKED=true
GUI_FAILURE_CAN_BE_REPAIRED_OVER_SSH=true
SSH_FAILURE_CAN_BE_REPAIRED_OVER_GUI_WHEN_GUI_IS_LIVE=true
OS_OR_NETWORK_FAILURE_CAN_ESCALATE_TO_VNC_RESCUE=true
```

### Receipt vivo — acesso remoto observado em 2026-10-01

Este bloco é **snapshot de runtime**, não lei eterna. Invalidar ao mudar tailnet, IP, serviço, sessão gráfica, firewall, DNS ou reboot relevante.

```text
OBSERVED_AT=2026-10-01
CASA_TAILSCALE_NODE=segredo
CASA_TAILSCALE_IPV4=100.123.93.25
CENTRALDARK_OS_NODE=centraldark-os
CENTRALDARK_OS_TAILSCALE_IPV4=100.90.199.124
TAILSCALE_PING_CASA_TO_CENTRALDARK_OS=PASS
ANYDESK_ID_PRESENT=1910522390
ANYDESK_DIRECT_OVER_TAILSCALE_7070_CONNECT=PASS
ANYDESK_REMOTE_SESSION_RESULT=desk_rt_ipc_error
ANYDESK_SOCKET_REACHED_REMOTE_BEFORE_CLOSE=true
CASA_ANYDESK_DNS_CRL_RESOLUTION_ERROR=OBSERVED
REMOTE_LINUX_DNS=UNKNOWN
REMOTE_ACTIVE_SESSION_X11=UNKNOWN
SSH_FROM_THIS_CHAT_INTERACTIVE_SHELL=UNKNOWN
CONTABO_VNC_PRESERVED=USER_AND_PARALLEL_EXECUTOR_REPORTED
```

Leitura causal desta sessão:

```text
TAILSCALE_NETWORK_REACHABILITY=PROVED
ANYDESK_7070_ROUTE_OVER_TAILSCALE=PROVED
ANYDESK_SESSION_CLOSE_IS_POST_NETWORK_CONNECTION=true
GENERIC_OPEN_PORT_FIX_IS_NOT_FIRST_DISCRIMINANT=true
NEXT_DISCRIMINANTS=[REMOTE_ACTIVE_DISPLAY_TYPE, REMOTE_ANYDESK_TRACE, REMOTE_DNS, REMOTE_FIREWALL]
```

Não promover o estado acima a PASS global. Exemplo: `TAILSCALE=PASS` não prova `ANYDESK=PASS`; `ANYDESK_ID_PRESENT` não prova sessão gráfica; Xorg instalado/configurado não prova que a sessão ativa é `Type=x11`.

### Regra de aprendizagem por setor

Quando uma missão encontra um novo owner ou corrige um endereço existente:

```text
ACHADO_DE_SETOR
→ VALIDAR OWNER/CAPABILITY
→ ATUALIZAR ESTE MAPA
→ ATUALIZAR APRENDIZADO DURÁVEL SE O DELTA FOR REUTILIZÁVEL
→ LIGAR RELAÇÃO SEMÂNTICA
→ TESTAR ROTEAMENTO
→ PRÓXIMO EXECUTOR NÃO RECOMEÇA DO ZERO
```

Se um setor novo não tiver owner provado:

```text
SECTOR_OWNER_UNKNOWN
→ NÃO INVENTAR OWNER
→ DISCOVER_EXISTING_OWNER
→ REUSE_BEFORE_CREATE
→ CRIAR SOMENTE SE GAP MATERIAL CONTINUAR
```


### Plano do cockpit recuperável

Owner vigente: [docs/ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/INVENTARIO-KERNEL-PROPRIO.md](../ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/INVENTARIO-KERNEL-PROPRIO.md). Recuperar a seção **Plano vigente recuperável — 2026-10-01** antes de integrar AionUi/AionCore. PLAN_STATUS=CANONICAL_DESIGN_BINDING_PENDING; NEXT_CURSOR=S0_INVENTORY_AND_OWNER_BINDING. A tabela de setores localiza capacidades; não comprova bindings em runtime.

### Casa como cliente da IA na VPS — CURRENT 2026-10-01

No momento a Casa consome a API; a IA nativa executa na VPS. Rotas, imagem, diagrama e teste discriminante: [VPS-IA-NATIVA-ROTAS.md](VPS-IA-NATIVA-ROTAS.md). Pontuação, embedding e TTS com inferência PASS; conversa KylinBot PASS após reutilização de OAuth Codex da Casa; MCP instalado ainda não é sessão provada. Papel futuro Casa/GPU permanece plano, não obrigação atual.


## Binding de papéis vigente — 2026-10-04

## ROLE BINDING CANÔNICO — SOL ↔ HERMES (2026-10-04)

Este contrato elimina `PIVETE` como papel técnico atual. O termo pode sobreviver apenas como vocativo regional ou proveniência histórica; não cria identidade, agente, owner, autoridade nem executor.

```text
SEGREDO/CHEFE = HUMANO + INTENCAO + AUTORIDADE_FINAL
SOL = COORDENACAO_COGNITIVA_OFICIAL
HERMES = EXECUTOR_PRESERVACAO_CONTINUIDADE
MODELO = MOTOR_SUBSTITUIVEL
VOICE|TEXT|CHAT|AION|DESKTOP = SUPERFICIES_DA_SOL
PIVETE_ROLE = RETIRED
PIVETE = VOCATIVE_OR_HISTORICAL_ONLY
```

SOL não é uma janela nem um provider. Voz e texto são superfícies pelas quais a função SOL conversa, recupera a cabeça externalizada do CHEFE, reconcilia intenção/CURRENT e produz direção operacional. Hermes não precisa assumir a identidade SOL para ter autonomia: recebe a missão resolvida e executa com shell/tools até fixed point aplicável.

```text
CHEFE
→ SOL_INTERPRETA_E_COORDENA
→ HERMES_EXECUTA
→ PROVA_CONTRAPROVA
→ REALIDADE_JULGA_O_EFEITO
→ SOL_DEVOLVE_ESTADO_AO_CHEFE
```

### Correção automática de drift de papel

Qualquer consumidor CURRENT/operacional que encontrar binding técnico `PIVETE/HERMES`, `PIVETE=EXECUTOR`, `PIVETE=ORQUESTRADOR` ou equivalente deve corrigir o binding para o padrão atual **sem pedir nova permissão**, pois esta correção já foi autorizada pelo CHEFE e não altera a intenção; remove ambiguidade.

```text
ROLE_DRIFT_AUTO_REPAIR=true
CURRENT_PIVETE_TECHNICAL_ROLE → HERMES
PIVETE_HISTORICAL_PROVENANCE → PRESERVE_AS_HISTORY
PIVETE_VOCATIVE → ALLOWED_NO_TECHNICAL_MEANING
DO_NOT_REWRITE_HISTORICAL_EVIDENCE_AS_IF_IT_NEVER_EXISTED=true
NO_NEW_AGENT_FOR_ROLE_SPLIT=true
SOL_COORDINATES_HERMES_EXECUTES=true
```

### Operação prática atual

Enquanto a superfície SOL não possuir shell/bridge vivo, SOL deve gerar para o CHEFE o comando/missão derivado dos Docs/CURRENT; não fingir execução. O CHEFE pode abrir terminais/painéis e entregar a missão ao Hermes, que possui shell e executa.

Quando uma ponte como Zendrive/Desktop/MCP provar shell vivo, a mesma SOL pode orquestrar Hermes por essa rota; a identidade não muda.

```text
SOL_WITHOUT_SHELL = INTENT_INTERPRETER + COMMAND_GENERATOR + COORDINATOR
HERMES_WITH_SHELL = EXECUTOR
SOL_WITH_PROVEN_SHELL_BRIDGE = COORDINATOR_THROUGH_HERMES
EXECUTION_CLAIM_REQUIRES_RUNTIME_READBACK=true
AGENT_SWARM_REQUIRED=false
HERMES_SINGLE_EXECUTOR_IS_SUFFICIENT_WHEN_CAPABILITY_COVERS_MISSION=true
SPECIALISTS_ARE_OPTIONAL_CAPABILITIES_NOT_REQUIRED_IDENTITIES=true
```

