# 🧿 CentralDark · Cristal Full da Sessão Casa / Remote / Screenpipe

status: "CRYSTALLIZED_ON_MAIN"
authority: "SEGREDO/CHEFE"
owner_mode: "REUSE_EXISTING_BODY"

## Intenção preservada

> O objeto evolui no mesmo corpo. Expansão de domínio não é expansão de arquitetura paralela.

A CentralDark pode ganhar sensores, voz, rotas remotas, painel, observabilidade, agentes, Obsidian, Screenpipe, Hermes, VS Code e VPS sem nascer outro sistema para cada capacidade.

```text
MAIS BRAÇOS      = PERMITIDO
MAIS SENSORES    = PERMITIDO
MAIS DOMÍNIO     = PERMITIDO
MAIS CAPACIDADE  = PERMITIDO

SEGUNDO CORE     = PROIBIDO
SEGUNDO OWNER    = PROIBIDO
ATALHO PARALELO  = PROIBIDO
RENOMEAR PARA FINGIR EVOLUÇÃO = PROIBIDO
```

## Corpo único observado nesta sessão

```text
👑 CHEFE
   ↓ intenção
SOL / CENTRALDARK
   ↓ coordena e reconcilia

├─ CASA / SEGREDO
│  ├─ CentralDark Remote Tray
│  ├─ Desktop Commander Remote MCP
│  ├─ PowerShell Remoting
│  ├─ Screenpipe
│  ├─ WO Mic
│  ├─ Hermes local
│  ├─ Obsidian / BRAIN / CASA-VAULT
│  └─ VS Code
│
├─ VPS
│  ├─ MCP CentralDark :9100
│  ├─ Caddy
│  ├─ PM2 / Docker
│  ├─ Hermes runtime
│  └─ deploy / receipts
│
└─ GITHUB
   ├─ main
   ├─ owners canônicos
   ├─ PRs
   ├─ workflows
   └─ receipts duráveis
```

Percepção pode ocorrer em paralelo. Mutação do mesmo escopo continua serializada em um Writer.

## Remote Tray consolidado

A sessão evoluiu o `CentralDark Remote Tray` como casca mínima do Remote MCP existente, sem criar segundo owner.

Capacidades cristalizadas:

- single instance;
- auto reconnect com backoff;
- heartbeat;
- receipt atômico;
- log de sessão;
- preservação do output externo;
- detecção de URL de autorização;
- reaproveitamento do Context Sidecar;
- separação rigorosa entre processo vivo e device online.

Regra:

```text
PROCESSO_ATIVO != DEVICE_ONLINE
UNKNOWN != PASS
```

Durante a sessão foram observados: conexão local ao Desktop Commander MCP, conexão ao Remote MCP, restauração de sessão persistida, subscription do channel, marcação do device `SEGREDO` como online e presença rastreada.

Esses fatos provam a capacidade. `SEGREDO online agora` continua sendo aresta temporal e deve ser remensurada.

## Screenpipe

O Screenpipe foi classificado como sensor e memória temporal, nunca cérebro, Writer ou Judge.

Observações materializadas na sessão:

- home: `C:\Users\danda\.screenpipe`;
- processo `screenpipe-app.exe` observado;
- API local em `localhost:3030` quando o app está estável;
- bridge do navegador observado como conectado;
- captura visual viva observada;
- UI recorder observado;
- input tap e clipboard capture observados;
- captura de áudio configurada para `Always (continuous)`;
- transcrição com Whisper Tiny em português;
- endpoint Windows `Microfone (WO Mic Device)` presente;
- configuração persistida do Screenpipe contendo WO Mic como input selecionado;
- contadores de chunks e transcrições avançaram durante a investigação.

Ainda não foi provado fim a fim que conteúdo específico falado no telefone percorreu:

```text
PHONE
→ WO MIC
→ WINDOWS INPUT
→ SCREENPIPE
→ WHISPER
→ INTENT
→ ROUTER
→ ACTION
→ RECEIPT
```

Portanto `VOICE_FOLLOWS_INTENT_END_TO_END` permanece `NOT_PROVEN`.

## WO Mic e a porta 3030

O Windows observou `WOMicClient.exe` e `Microfone (WO Mic Device)`.

Também foi observada uma conexão do WO Mic para o telefone usando porta de destino 3030. Isso não é a mesma aresta de `localhost:3030` usada pelo Screenpipe.

```text
PHONE_DESTINATION:3030 != SCREENPIPE_LOCALHOST:3030
```

Logo, a sessão não provou colisão local de porta entre WO Mic e Screenpipe.

## Regra nova contra falso incidente durante intervenção humana

Quando o CHEFE reinicia ou reconfigura um componente explicitamente, uma ausência curta de listener ou `/health` durante a janela de restart é:

```text
🟡 EXPECTED_TRANSIENT
```

Não é automaticamente ferida.

Só sobe para vermelho quando:

```text
SEM intervenção esperada
+ serviço deveria estar disponível
+ janela de recuperação acabou
+ falha foi remensurada
→ 🔴 incidente material
```

A regra operacional é:

```text
EXPECTED_OPERATOR_ACTION muda a interpretação do sinal.
```

Isso impede o sistema de abrir incidente porque o operador está justamente mexendo no componente.

## Rotas de acesso da Casa e VPS

A sessão consolidou múltiplas rotas com papéis diferentes, todas como braços do mesmo sistema:

```text
Remote Desktop / MCP
→ medição e comando remoto da Casa

PowerShell Remoting
→ rota administrativa Windows

VS Code / SSH
→ desenvolvimento e acesso VPS

MCP CentralDark :9100
→ runtime de ferramentas CentralDark na VPS
```

Failover de rota não cria outro owner. Uma rota pode recuperar continuidade quando outra superfície fica temporariamente indisponível.

## VPS

Foi observado nesta linhagem de sessão:

- MCP local da VPS em `127.0.0.1:9100` respondendo health;
- versão do serviço retornada;
- catálogo com 113 tools no momento da medição;
- Caddy roteando `mcp.centralldark.com` para o backend 9100;
- `tunnel-client` conectado e usando o profile CentralDark MCP.

Esses fatos são históricos duráveis com proveniência. Estado atual de deploy e SHA da VPS continua temporal.

## Hermes

O runtime local real foi localizado em:

`C:\Users\danda\.hermes`

Foram observadas famílias de estado, sessões, memories, SOUL, cron, logs e skills. Hermes continua executor/preservador, não Judge.

A sessão também encontrou capacidades de Screenpipe e Obsidian no ecossistema Hermes, reforçando `REUSE_BEFORE_CREATE` em vez de criar adaptadores paralelos.

## Obsidian / segundo cérebro

GitHub continua sendo fonte técnica de verdade.

Obsidian é camada de navegação cognitiva. O alvo canônico observado para o cofre separado permanece:

`E:\CentralDark\Pivete\CASA-VAULT`

com fronteira:

```text
CASA-VAULT/00-CANONICO
↔
docs/BRAIN
```

Memória privada e anexos locais não devem entrar no Git por acidente.

Também foi observado que caminhos diferentes do BRAIN podem resolver para o mesmo corpo físico por junction. Dois caminhos não significam automaticamente dois cérebros.

## Divisão de trabalho dos agentes

```text
AGENTE CASA
→ inventário local
→ processos
→ apps
→ ports
→ bridges
→ CentralDark.exe
→ voz
→ logs / receipts

AGENTE VPS
→ PM2
→ Docker
→ Caddy
→ MCP / API
→ deploy
→ runtime
→ logs / receipts

GITHUB
→ main
→ owner canônico
→ PR / workflow
→ prova durável

SOL
→ cruza CASA ↔ VPS ↔ GITHUB
→ escolhe owner
→ serializa Writer
→ manda contraprova
```

## Observabilidade unificada

Objetivo preservado: um painel único de developer/admin, sem obrigar o CHEFE a abrir dez ferramentas para entender ruído.

Categorias mínimas:

```text
CHAT
GITHUB
CASA
VPS
APP_EXE
VOICE
SITE
REMOTE
SCREENPIPE
HERMES
OBSIDIAN
```

Cada evento relevante deve carregar quando disponível:

```text
correlation_id
timestamp
source
target
state
cause
evidence_ref
next_cursor
```

Logs técnicos podem ficar em inglês. Interface operacional deve privilegiar português.

## Fatos duráveis x arestas temporais

### Duráveis nesta sessão

- Remote Desktop/MCP existe e já respondeu PONG na Casa;
- Remote Tray já restaurou sessão persistida;
- Screenpipe existe e já capturou contexto vivo;
- browser bridge do Screenpipe já conectou;
- WO Mic endpoint existe no Windows;
- Hermes home e ativos de continuidade existem;
- Obsidian/BRAIN possuem owners existentes;
- MCP 9100 da VPS já respondeu health;
- GitHub é o estado durável canônico.

### Remedir sempre que CURRENT importar

- `SEGREDO` online agora;
- Screenpipe 3030 listening agora;
- input de áudio bindado agora;
- WO Mic mídia fluindo agora;
- voice → intent → router → action → receipt agora;
- CentralDark.exe rodando agora;
- SHA realmente deployed na VPS agora.

## Cadeado de evolução

```text
OBJECT_EVOLVES_IN_SAME_BODY=true
DOMAIN_EXPANSION_REUSES_CANONICAL_BODY=true
DOMAIN_EXPANSION_IS_NOT_PARALLEL_ARCHITECTURE=true
CAPABILITY_GROWTH_ATTACHES_TO_CANONICAL_OWNER=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ZERO_REGRESSION_REQUIRED=true
UNKNOWN_IS_NOT_PASS=true
```

Não usar nome numerado como atalho para criar owner paralelo. Evolução legítima acontece no mesmo lineage.

## Contraprova

```text
FILE_EXISTS != RUNTIME_RUNNING
PROCESS_ALIVE != DEVICE_ONLINE
CONNECTED_ONCE != CONNECTED_NOW
SCREENSHOT != HIDDEN_RUNTIME_PROOF
VNC != DEPLOY_PROOF
ACTION != PROOF
UNKNOWN != PASS
EXPECTED_TRANSIENT != INCIDENT
COMPONENT_UPDATED != FULL_PACKAGE_PROVED
```

## Estado final deste cristal

```text
REMOTE_CAPABILITY              = PROVEN
SCREENPIPE_VISUAL_CAPABILITY   = PROVEN
WO_MIC_WINDOWS_ENDPOINT        = PROVEN
VPS_MCP_CAPABILITY             = PROVEN
HERMES_LOCAL_CONTINUITY        = PROVEN
OBSIDIAN_OWNER_LINEAGE         = PROVEN
EXPECTED_OPERATOR_ACTION_RULE  = CRYSTALLIZED
SAME_BODY_DOMAIN_EXPANSION     = CRYSTALLIZED

APP_READY_END_TO_END           = NOT_PROVEN
VOICE_FOLLOWS_INTENT_END_TO_END= NOT_PROVEN
GLOBAL_FIXED_POINT             = NOT_PROVEN
```

## NEXT_CURSOR

```text
LOAD DURABLE FACTS
→ REMEASURE FIRST MUTABLE EDGE ONLY
→ bind Screenpipe/WO Mic audio if needed
→ prove transcription content
→ feed intent
→ router
→ action
→ receipt
→ counterproof
→ only then promote APP/VOICE readiness
```

Machine-readable receipt:
`docs/HANDOFF/2026-09-09-centraldark-casa-remote-screenpipe-cristal-full.json`

Executable counterproof:
`scripts/lupa/validar-cristal-casa-remote-screenpipe.mjs`
