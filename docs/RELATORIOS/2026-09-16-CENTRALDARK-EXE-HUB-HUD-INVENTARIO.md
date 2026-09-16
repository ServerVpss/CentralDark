# 👑🪬 CentralDark.exe · inventário do Hub/HUD unificado

Data: 2026-09-16
Base medida: `ServerVpss/CentralDark@c0a33271228bbb77168dca4ae64d4aa8e1201898`
Owner desktop: `apps/modulos/Bolt/source`
Regra: `REUSE_BEFORE_CREATE` + `ONE_SYSTEM_ONLY` + `UNKNOWN != PASS`

## Objetivo

Trazer para o próprio `CentralDark.exe` a experiência de cockpit mostrada nas referências visuais: contas, limites quando observáveis, harnesses, plugins, GitHub, MCP, runtime, browser, voz, memória, receipts e estatísticas em um único lugar.

O HUD deste PR não cria segundo cérebro, segundo auth ou segundo router. Ele projeta owners já existentes e mantém source separado de runtime.

## ✅ Já existe materialmente na main

| Capacidade | Estado de source | Owner / prova |
|---|---|---|
| `CentralDark.exe` Electron | PROVADO | `apps/modulos/Bolt/source`, `electron-builder.yml` |
| Cockpit unificado | PROVADO | `CentralDarkCockpitShell.client.tsx` |
| SOL widget flutuante | PROVADO | `sol-widget.tsx` + `electron/main/ui/window.ts` |
| mover/redimensionar widget | PROVADO | BrowserWindow `resizable: true` + bounds persistidos |
| editor + terminal + workbench | PROVADO | `app/components/workbench/` |
| GitHub stats | PROVADO | `app/routes/api.github-stats.ts` |
| múltiplos providers LLM | PROVADO | OpenAI, Anthropic, Google, Bedrock, Mistral, DeepSeek, Cohere, Cerebras, OpenRouter e outros no `package.json` |
| MCP SDK | PROVADO | `@modelcontextprotocol/sdk` + `apps/modulos/mcp/` |
| Desktop Commander multi-conta | PROVADO EM SOURCE | runtime manifest com `principal` + `conta2` |
| Screenpipe | PROVADO EM SOURCE | runtime manifest + health bridge |
| Omni Router health | PROVADO EM SOURCE | bridge Electron `centraldark:omni:health` |
| Dependabot | PROVADO | `.github/dependabot.yml` + workflow de auto-merge |
| CodeRabbit | PROVADO | `.coderabbit.yaml` + `scripts/coderabbit-bridge.mjs` |
| gráficos | PROVADO | `chart.js` + `react-chartjs-2` |
| drag/drop | PROVADO | `react-dnd` + HTML5 backend |
| painéis redimensionáveis | PROVADO | `react-resizable-panels` |
| persistência local | PROVADO | `electron-store` + localStorage no renderer |
| auto-update Windows | PROVADO | Electron updater + owner canônico do desktop |

## 🟢 Delta implementado neste PR

Novo `CentralDarkUnifiedHud` montado dentro da mesma rota/cockpit existente.

Ele entrega:

- HUD `position: fixed` arrastável pelo topo;
- resize nativo `both`, com tamanho e posição persistidos;
- polling periódico dos probes que já existem;
- contador de mudanças observadas;
- histórico local curto de snapshots, limitado e sem segredo;
- estatísticas GitHub quando o token já está autorizado na app;
- abas `RESUMO`, `CONTAS`, `CAPACIDADES`, `LACUNAS`;
- catálogo explícito de source provado, parcial, gaps e plugins opcionais;
- nenhuma quota inventada;
- nenhuma tela raspada para descobrir plano/limite de conta;
- `SOURCE != RUNTIME` permanece visível no próprio HUD.

## 🟡 Existe, mas ainda é parcial para a visão do CHEFE

| Área | O que existe | O que falta para fechar |
|---|---|---|
| ChatGPT/OpenAI | provider + conectores | adapter autorizado de conta/plano/uso/reset/rate limit |
| Claude/Anthropic | provider Anthropic | harness Claude Code + sessão/conta/limite no Hub |
| Gemini | provider Google | conta e quota no Hub |
| Codex/VS Code | editor, terminal, workbench e Git | adapter de harness/workspace/conta/telemetria |
| Browser | renderer/Electron e navegação web | painel unificado de sessões/permissões/cookies no CentralDark.exe |
| MCP | servidor e SDK | snapshot vivo `version/toolCount/health` projetado por IPC estreito no desktop |
| Desktop Commander | 2 perfis declarados | telemetria viva por perfil dentro do CentralDark.exe |
| Dependabot | configuração e workflows | feed de eventos/PRs/deltas diretamente no HUD |
| CodeRabbit | config e bridge | feed de findings/reviews diretamente no HUD |
| receipts | vários owners/documentos | stream compacto por mudança no HUD |

## 🔴 Ainda não temos fechado

1. **Unified Account Registry** — ligar identidades/sessões/capabilities sem criar auth paralelo; deve estender `oauth-broker`.
2. **Provider Usage Adapters** — quota, plano, tempo de reset e rate limits por provedor somente por fonte autorizada.
3. **Claude Code Harness Adapter** — integração explícita, não confundida com o provider Anthropic de inferência.
4. **Codex/VS Code Harness Adapter** — workspace/sessão/telemetria de execução.
5. **MCP Live Snapshot no desktop** — health + versão + toolCount via IPC tipado.
6. **Dependabot Event Feed** — dependência alterada vira evento do HUD, não “analytics mágico”.
7. **CodeRabbit Event Feed** — review vira sinal/recomendação, não autoridade.
8. **HUD Receipt Stream** — cada mudança relevante com timestamp, source_ref, causa e cursor.
9. **Conta/limite multi-provider real** — continua `ADAPTER_REQUIRED` até haver API/conector autorizado.
10. **Canonical Label Trace** — rastrear labels exigidas, labels presentes, labels faltando, ator e superfície de aplicação.

## 🧷 Rastreio de labels canônicas

O erro de label não deve depender de leitura manual de tela, CLI solto ou agente lembrar de aplicar etiqueta.

O HUD deve exibir um bloco próprio para PRs:

```text
PR_LABEL_TRACE
├── REQUIRED_LABELS      = labels exigidas pelo contrato do PR
├── PRESENT_LABELS       = labels realmente presentes no GitHub
├── MISSING_LABELS       = diferença exigidas - presentes
├── EXTRA_LABELS         = labels informativas, não bloqueantes
├── APPLIED_BY           = user | bot | cli | connector | unknown
├── APPLIED_FROM         = GitHub UI | GitHub CLI | ChatGPT connector | workflow | unknown
├── LABEL_SOURCE         = registry | workflow | manual | inferred
├── LABEL_CANONICAL      = true | false | unknown
├── LABEL_FORCED         = true | false
└── RECEIPT_REF          = commit/comment/run que provou a aplicação
```

Regra:

```text
LABEL_APPLIED != LABEL_CANONICAL
LABEL_PRESENT != LABEL_SCOPE_CORRECT
USER_FORCED_LABEL != CONTRACT_SATISFIED
MISSING_REQUIRED_LABEL != PASS
OPTIONAL_LABEL_MISSING != FAILURE
```

O defeito que este PR deve rastrear é:

```text
FALTA_DE_LABEL_CANONICA
→ identificar PR afetado
→ calcular labels obrigatórias
→ comparar com GitHub atual
→ mostrar faltantes no HUD
→ abrir próximo cursor
→ só aplicar automaticamente se contrato permitir
```

O HUD não deve criar nova taxonomia de labels. Ele deve consumir a fonte canônica existente e mostrar divergência.

## 📊 Dependabot e analytics

Dependabot já está presente, mas seu papel correto é **detectar e propor deltas de dependências**. Ele não substitui analytics de produto/runtime.

O HUD pode consumir eventos Dependabot e CodeRabbit como sinais. Para analytics mais profundo foram encontrados como plugins opcionais disponíveis:

- **PostHog** — product analytics, feature flags, errors e LLM analytics;
- **Datadog (Preview)** — observabilidade de produção.

Esses plugins são opcionais e não viram dependência do core. Conectar/instalar continua exigindo ação explícita da conta do usuário.

## 🧿 Contas e limites

O Hub deve mostrar cada conta/harness separadamente:

```text
ChatGPT
Claude Code
Gemini
Codex / VS Code
Desktop Commander · principal
Desktop Commander · conta2
GitHub
MCP / outros futuros hubs
```

Cada cartão deve poder expor, quando a fonte permitir:

```text
ACCOUNT
SESSION
PLAN
CAPABILITIES
USAGE
LIMIT
RESET_AT
RATE_LIMIT
HEALTH
LAST_MEASURED_AT
SOURCE_REF
```

Campos não medidos permanecem `UNKNOWN`/`ADAPTER_REQUIRED`.

## ⚖️ Critério do HUD adaptativo

O HUD cresce por dados observados, não por enfeite:

```text
mudança observada
→ novo snapshot
→ assinatura muda
→ contador sobe
→ evento entra no histórico
→ estatísticas recalculam
→ HUD projeta o novo estado
```

Layout do usuário também é preservado:

```text
posição + tamanho
→ localStorage
→ restauração na próxima sessão
```

## 🔒 Contraprova

```text
NEW_APP=false
NEW_ROUTER=false
NEW_AUTH=false
NEW_BRAIN=false
SCREEN_SCRAPING_FOR_QUOTA=false
UNKNOWN_TO_PASS=false
DEPENDABOT_AS_RUNTIME_AUTHORITY=false
CODERABBIT_AS_RUNTIME_AUTHORITY=false
OPTIONAL_ANALYTICS_REQUIRED_FOR_CORE=false
LABEL_PRESENT_TO_PASS=false
LABEL_FORCED_TO_PASS=false
LABEL_TRACE_REQUIRED=true
```

## 📌 Receipt do PR #1551

PR: `#1551 — feat(desktop): Hub HUD unificado + inventário de capacidades do CentralDark.exe`
Branch: `feat/centraldark-unified-hud-inventory-20260916`
Base do PR: `c0a33271228bbb77168dca4ae64d4aa8e1201898`
Head imediatamente anterior a este receipt: `811fe1964107bbcb1dad732f6a97a71c9ee34fa9`

### Placar do inventário implementado

```text
CAPACIDADES INVENTARIADAS     = 16
SOURCE_PROVED                 = 11
RUNTIME_PROBE_EXISTENTE       = 2
PARCIAL                       = 3

CONTAS/HARNESSES MAPEADOS     = 6
ADAPTER_REQUIRED              = 4
DESKTOP COMMANDER PROFILES    = 2

GAPS EXPLÍCITOS               = 8
PLUGINS ANALÍTICOS OPCIONAIS  = 2
LABEL_TRACE_REQUIRED          = 1
```

### O que o HUD do PR faz materialmente

```text
CENTRALDARK.EXE
│
├── HUD FLUTUANTE
│   ├── arrasta pelo cabeçalho
│   ├── resize manual
│   ├── posição persistente
│   ├── tamanho persistente
│   └── cresce automaticamente conforme entram mudanças
│
├── RESUMO
│   ├── CentralDark.exe
│   ├── Omni Router
│   ├── Screenpipe
│   └── GitHub stats
│
├── CONTAS
│   ├── ChatGPT
│   ├── Claude Code
│   ├── Gemini
│   ├── Codex / VS Code
│   ├── Desktop Commander principal
│   └── Desktop Commander conta2
│
├── CAPACIDADES
│   └── source / probe / parcial
│
└── LACUNAS
    ├── adapters de quota
    ├── unified account registry
    ├── Claude Code harness
    ├── Codex/VSCode harness
    ├── MCP live snapshot
    ├── Dependabot event feed
    ├── CodeRabbit event feed
    ├── receipt stream
    └── canonical label trace
```

### Estado de validação no momento deste receipt

```text
PR_OPEN             = PASS
HUD_IMPLEMENTADO    = SOURCE_PROVED
INVENTARIO          = SOURCE_PROVED
DRAG                = SOURCE_PROVED
RESIZE              = SOURCE_PROVED
AUTO_GROW_STATS     = SOURCE_PROVED
PERSISTENCIA_LAYOUT = SOURCE_PROVED
ANTI_FAKE_QUOTA     = SOURCE_PROVED
LABEL_TRACE         = DOCUMENTED_GAP

CI_HEAD             = QUEUED/PENDING
MERGE               = NOT_DONE
RUNTIME_EXE_NOVO    = UNKNOWN
```

Os workflows do PR foram disparados para o head do branch, mas ainda estavam em `queued/pending` na medição desta rodada. A tentativa anterior de executar o contrato em worktree temporária na VPS foi bloqueada pela autenticação HTTPS do `git fetch`; por isso `TEST_RUNTIME=UNKNOWN`, nunca `PASS` por inferência.

### Plugins analíticos encontrados

```text
PostHog   = AVAILABLE / OPTIONAL / NON_CORE
Datadog   = AVAILABLE / OPTIONAL / NON_CORE
```

PostHog encaixa no Hub para product analytics, feature flags, errors e LLM analytics. Datadog encaixa para observabilidade de runtime/serviços. Nenhum deles é requisito para o core da CentralDark.

### Fio da missão consolidado

Não criar um app parecido com ChatGPT/Codex. O owner já existe. O trabalho é absorver, gradualmente, as capacidades úteis dessas superfícies para o cockpit canônico do `CentralDark.exe`, mantendo um organismo único e promovendo `SOURCE → RUNTIME → PASS` somente com medição aplicável.

## 🌳 Arquitetura unificada canônica · vínculo com INTERLIGADOS

Este PR projeta o HUD dentro da arquitetura já cristalizada na `main`; ele não redefine owner, memória, roteamento ou autoridade.

```text
👑 CHEFE / INTENÇÃO
→ 👑🪬 !CENTRALDARK
→ 🔗 !># INTERLIGADOS
→ 🔎 META-LUPA              = OLHO CANÔNICO
   ├─ 🔥 META-GRILL          = encontra a ferida
   ├─ 💭 META-COGNIÇÃO       = organiza entendimento
   ├─ 🎼 META-ORQUESTRAÇÃO   = resolve encaminhamento lógico
   └─ 📡 META-START-LINK     = direção + proveniência + cursor
→ 🔄 !RECONCILIAR
→ 🎼 CAPABILITY-CONTRACT-ROUTER = roteamento operacional
   ├─ 🔁 COT-REACT-LOOP
   ├─ ⚖️ AUDITORIA-PR
   ├─ 🚂 ESTEIRA-MOTOR
   ├─ 🧠 BRAIN-MEMORY       = continuidade/memória
   ├─ 🪢 CONFLITO-GIT
   └─ 🧪 SANDBOX
→ 📚 CAPABILITY / TOOLS
→ 📡 TRANSPORTES
→ 🏠 CASA / VPS
→ ⚙️ HERMES / MCP / TOOLS / SERVIÇOS
→ ⚖️ !CONTRAPROVA
→ 💠 !FIXED_POINT
→ 🧾 !REGISTRA
→ ⚖️ REALIDADE
```

### Papéis sem sobreposição

```text
META_LUPA                 = OLHO_CANONICO
META_ORQUESTRACAO         = ENCAMINHAMENTO_LOGICO
CAPABILITY_CONTRACT_ROUTER = ROTEAMENTO_OPERACIONAL
BRAIN_MEMORY              = MEMORIA_CONTINUIDADE
META_START_LINK           = DIRECAO_PROVENIENCIA_CURSOR
TRANSPORT                 = CARREGA_SINAL_NAO_GOVERNA
EXECUTOR                  = HERMES_MCP_TOOLS_SERVICOS
REALIDADE                 = JUIZ
```

### Proveniência desta arquitetura

```text
ID=PR_PATTERNS_INTERLIGADOS_MAIN_20260916
MAIN_CANONICAL_HEAD=13a59e49c59574ffe631efb15848c3e14f39554c
ARCH_COMMIT=02e283d5356d0d1c258812138f06cd44dcb17aa4
ARVORE_HASH=3f169e698266b7fe51dec9acadfba36ace47f557
INDEX_COMMIT=13a59e49c59574ffe631efb15848c3e14f39554c
INDEX_HASH=912b1b8e1fbbb0672ae51a3dbcb7256f92e3449a
RECEIPT_HASH=bf82c3251f092ea9b45ac8bb440f15a26e1eee84
RASTRO=PRs → PADRÕES → SKILLS → CÂNONE → RUNTIME-FRONTIER → RECEIPT → INDEX → ÁRVORE-VISUAL → PR1551
```

### Cadeados herdados pelo HUD

```text
INTERLIGADOS != EXECUTAR_TUDO
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
NO_PARALLEL_ARCHITECTURE=true
META_ORCHESTRATION_IS_NOT_CAPABILITY_ROUTER=true
BRAIN_MEMORY_IS_NOT_ROUTER=true
META_START_LINK_IS_NOT_MEMORY_OWNER=true
TRANSPORT_IS_NOT_AUTHORITY=true
CAPABILITY_IS_NOT_AUTHORITY=true
DOCUMENTED != EXECUTED
SOURCE != RUNTIME_NOW
UNKNOWN != PASS
REALIDADE = JUIZ
```

O HUD do #1551 é uma projeção/observador desse organismo: mostra capacidades, sinais e lacunas; não vira cérebro, router normativo ou juiz.

## Próximo cursor

Depois deste PR ficar verde:

1. ligar `MCP Live Snapshot` ao bridge Electron;
2. criar adapters de uso/limites um provedor por vez;
3. alimentar HUD com Dependabot/CodeRabbit/receipts;
4. integrar contas ao `oauth-broker` existente;
5. implementar `PR_LABEL_TRACE` usando o registry canônico de labels;
6. somente depois promover claims de runtime com prova viva.
