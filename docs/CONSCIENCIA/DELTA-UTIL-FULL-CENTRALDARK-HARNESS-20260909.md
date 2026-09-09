# 🧿 DELTA ÚTIL FULL — CENTRALDARK HARNESS CASA

**Data:** 2026-09-09  
**Destino:** `main`  
**Tipo:** cristalização comprimida de arquitetura, fluxo, provas, pendências e próximos gates  
**Autoridade:** SEGREDO/CHEFE  

## 0. Lei Zero

Antes de responder, decidir ou mutar:

```text
CHEFE_INTENT
→ CENTRALDARK
→ LIVE_STATE
→ ALIGNMENT
→ MINIMAL_DELTA
→ EVIDENCE
→ COUNTERPROOF
→ REALITY_JUDGE
```

Invariantes:

```text
CURRENT > HISTORICAL
REALITY_JUDGE != VERDADE_ABSOLUTA
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
```

## 1. Fluxo canônico de `!CENTRALDARK`

```text
!CENTRALDARK
→ #ACORDAR
→ CALIBRAR
→ CARREGAR FATOS DURÁVEIS
→ MEDIR ESTADO VIVO
→ LOCALIZAR OWNER EXISTENTE
→ REUSE se existe
→ EXTEND se existe parcial
→ CREATE_MINIMAL só se gap for provado
→ EXECUTAR DELTA MÍNIMO
→ COUNTERPROOF
→ REMEASURE
→ RECEIPT
→ NEXT_CURSOR
```

Cadeia viva de ação:

```text
PROCESS
→ BRIDGE
→ INPUT_OR_VOICE
→ INTENT
→ ROUTER
→ ACTION
→ RECEIPT
```

## 2. Matemática operacional vinda do material de Lógica Computacional

O material `tlc23` entra como referência de arquitetura para:

```text
FACT
+ RULE
+ GOAL
→ DERIVATION
→ repetir até ponto fixo
→ MODEL_MINIMAL / FIXED_POINT_FORMAL
```

Tradução para a Casa:

```text
EXISTE → REUSE
EXISTE PARCIAL → EXTEND
ERRO + REMÉDIO PROVADO → APRENDE → REUSE NA PRÓXIMA
NÃO EXISTE + GAP PROVADO + EXTENSÃO INSUFICIENTE → CREATE_MINIMAL
CONTRADIÇÃO → FAIL_CLOSED
```

Cadeado epistemológico:

```text
FIXED_POINT_FORMAL != VERDADE_ABSOLUTA
PROVED_IN_SCOPE != VERDADE_ETERNA
REALITY_JUDGE = melhor estado justificável no escopo atual
```

## 3. Harness de prova

```text
CLAIM
→ CLASSIFY
→ REQUIRED_EVIDENCE
→ FORMAL/HORN_GATE
→ LIVE_TEST
→ COUNTERPROOF
→ PROOF_LEDGER
→ META_JUDGE
→ VERDICT
```

Estados permitidos:

```text
PROVED_IN_SCOPE
REFUTED_IN_SCOPE
SUPPORTED
PARTIALLY_SUPPORTED
UNKNOWN
UNDECIDABLE_IN_MODEL
OUT_OF_SCOPE
```

O Harness serve para testar claims com ataques, ausência, corrupção, rollback, atraso, tamper e divergência. Ele não declara verdade final; ele publica estado justificável com escopo, instrumento, versão e evidência.

## 4. Coordenação humano/agente em tempo real

```text
HUMANO / AGENTE toca escopo
→ META-LUPA
→ temperatura do escopo
   🔥 HOT  <= 60s
   🌡️ WARM <= 120s
   ❄️ COLD > 120s
→ 17 RESPIRAÇÕES
→ DELTA MÍNIMO
→ ONE_WRITER_PER_SCOPE
```

Sem timestamp confiável:

```text
UNKNOWN → mantém trava antiga → não assume frio por silêncio
```

## 5. Direct-to-main serializado

Quando a autoridade for explícita e o escopo for documentação/receipts/owner seguro:

```text
👑 INTENÇÃO AUTORIZADA
→ medir main atual
→ localizar owner existente
→ delta mínimo
→ GitHub Contents API
→ commit atômico
→ main avança
→ CI/runtime medem depois
```

Cuidado:

```text
MAIN_PRESENT != SAME_HEAD_CI_PASS
MERGED != DEPLOYED
COMMIT != RUNTIME_PASS
```

## 6. Instalador determinístico

Objetivo: o instalador não pode morrer só porque não existe provider, token ou IA configurada.

```text
SEM PROVIDER
→ OPTIONAL
→ menu continua vivo

SEM CLOUDFLARE TOKEN
→ SETUP
→ oferece configuração
→ não executa DNS APPLY

AÇÃO RODOU
→ POST_PROBE
→ CONTRAPROVA
→ PROVED só se medido
```

Pacote full:

```text
CENTRALDARK FULL BUNDLE
├─ VPS / Base
├─ CentralDark CLI
├─ Site / Apps
├─ MCP / Router
├─ Hermes / HERMES-CORE
├─ Obsidian Grafo Vivo
├─ Remote Bridge / Tray
├─ Harness / Observatory
└─ manifest + versões + checksums + receipts
```

Lei do pacote:

```text
COMPONENT_UPDATED != FULL_PACKAGE_PROVED
```

## 7. Ponte remota e Casa local

Pontes previstas:

```text
MCP CentralDark       → orquestração rica
PowerShell Remoting   → comando Windows/admin
VS Code SSH/Tunnel    → edição e desenvolvimento
Remote Desktop Tray   → bridge visual/operacional
Chrome DevTools MCP   → automação/observação de navegador
```

Regra:

```text
SESSÃO TEMPORÁRIA != BRIDGE-BASE
não matar a porta que mantém a Casa acessível
```

## 8. Captura de tela / Snapshot

Função operacional já validada em conversa:

```text
PowerShell
+ System.Windows.Forms.Screen
+ System.Drawing.Graphics.CopyFromScreen
→ PNG local
→ retorno pelo mesmo conector remoto
```

Modelo de produto:

```text
Snapshot Modal
├─ permitir uma vez
├─ permitir sessão
├─ permitir sempre
├─ negar
├─ selecionar monitor
├─ selecionar região
├─ anotar/desenhar
└─ anexar de volta ao fluxo interno
```

Sem upload externo obrigatório.

## 9. VS Code / Hermes / CLI Overlay

A extensão existente deve virar cabine, não duplicata:

```text
VS Code
→ CentralDark Extension
   ├─ Activity Bar própria
   ├─ Git Intelligence
   ├─ Hermes Router
   ├─ Terminal PowerShell 7
   ├─ CentralDark CLI
   ├─ MCP status
   ├─ logs/eventos
   └─ Reality Judge
```

Hermes:

```text
HERMES ORIGINAL
→ CENTRALDARK CLI OVERLAY
   ├─ pt-BR / en-US
   ├─ /language
   ├─ /lang pt-BR
   ├─ /updateBR
   └─ sync gate VPS→Git→PR/main conforme política
```

Não modificar Hermes upstream por dentro sem necessidade.

## 10. SOL POC / BridgeMind lado a lado

```text
CENTRALDARK CORE
├─ HARNESS_CANÔNICO
└─ SOL_POC_EXPERIMENTAL
      ↓
   MESMO PROOF_LEDGER
      ↓
   MESMO REALITY_JUDGE
```

Regra:

```text
PARALLEL_EXECUTION = pode
PARALLEL_AUTHORITY = não
```

## 11. Apps como capacidades, não coleção

```text
DEVICE EXPERIENCE BUS
├─ TELEMETRY PROVIDERS
│  ├─ Armoury Crate
│  ├─ AMD Software
│  ├─ G-Helper
│  └─ Observatory
├─ HARDWARE CONTROL
├─ LIGHTING BUS
├─ AUDIO BUS
├─ HID / PERIPHERAL BUS
├─ GRAPHICS BUS
├─ WINDOWS POLICY BUS
└─ CAPABILITY ARBITER
```

Cadeado:

```text
100 READERS
10 PROVIDERS
5 UIs
3 AGENTS
mas 1 WRITER por recurso físico
```

## 12. State Vault / retenção

```text
STATE_VAULT
├─ ACTIVE_MISSION
├─ TOOL_TRACE_CACHE
├─ CONVERSATION_CACHE
├─ REASONING_RECEIPT sem chain-of-thought privada
├─ RECEIPTS
└─ SESSION_CHECKPOINTS
```

Retenção padrão:

```text
30 dias
custom_days configurável
quota por classe
DRY_RUN antes de limpar
PIN_FOREVER só com promoção explícita
```

GitHub é memória fria/versionada; SQLite/JSONL local é banco vivo. Não commitar token, `.env`, banco bruto, cache cru ou transcript bruto.

## 13. NEXT_CURSOR

```text
1. Remedir main e PRs abertos.
2. Drenar SAME_HEAD CI dos heads atuais.
3. Se PR estiver mergeable=false, localizar causa antes de promover.
4. Ligar Horn/Reuse gate ao fluxo `!CENTRALDARK` em todos os owners de criação.
5. Integrar Beta 1 do instalador ao menu oficial só após sandbox/VPS.
6. Atualizar Harness local quando Remote Desktop voltar online.
7. Manter cada nova ideia como delta sobre owner existente.
```

## 14. Veredito deste receipt

```text
CRISTALIZADO_EM_MAIN = true
TIPO = documentação/arquitetura/receipt
EXECUTOU_RUNTIME = false
PROVA_RUNTIME = UNKNOWN
ZERO_REGRESSION_RUNTIME = UNKNOWN
ZERO_REGRESSION_DOC = SUPPORTED_BY_SCOPE
```

Este arquivo não substitui testes. Ele comprime o fio para evitar perda de contexto e orientar os próximos deltas mensuráveis.
