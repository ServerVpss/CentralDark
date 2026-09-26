# 🧿 CentralDark Universal Execution Standard

> **Status:** CANDIDATE_CANONICAL_UNTIL_SAME_HEAD_CI  
> **Owner herdado:** `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`  
> **Espinha herdada:** `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`  
> **Enforcer executável:** `scripts/lupa/universal-execution-standard.mjs`  
> **Regra:** `REUSE_OR_EXTEND_BEFORE_CREATE_MINIMAL`

## Intenção

Tornar a mesma régua aplicável à arquitetura inteira da CentralDark: CI, CD, workflow, `.exe`, app desktop, CLI, MCP, router, site, API, VPS, Obsidian, Remote Bridge, provider de modelo e superfícies futuras.

A regra não cria outro core. Ela adapta qualquer superfície para o contrato vivo existente:

```text
CAPABILITY REQUEST
→ MEDIR OWNER
→ MEDIR CAPABILITY
→ MEDIR MESMO ESCOPO
→ REUSE se já atende
→ EXTEND_EXISTING se atende parcialmente
→ CREATE_MINIMAL somente se gap for provado
→ POST_PROBE
→ GREEN só depois da prova
```

## Padrão único para CI/CD e executáveis

```text
CI/CD/WORKFLOW
→ precisa HEAD/escopo/proveniência
→ precisa usar gate existente quando houver equivalente
→ precisa same-head aplicável para PASS
→ novo workflow paralelo é suspeito até provar gap

.EXE / APP / DESKTOP
→ precisa hash ou assinatura
→ precisa launch probe
→ precisa log/receipt de execução
→ arquivo existir não prova app executado
```

## Suporte para N modelos

`N` pode ser zero, um ou muitos. O core não pode depender de um único provider para sobreviver.

```text
N_MODELS_SUPPORTED=true
FIXED_MODEL_DENOMINATOR=false
MODEL_VOTE_IS_TRUTH=false
MODEL_PROVIDER_MISSING != GLOBAL_FAILURE
NO_MODEL_AVAILABLE → DETERMINISTIC_FALLBACK_OR_SETUP
UNSUPPORTED_N_MODELS → ADD_ADAPTER_OR_ROUTER_CAPABILITY; DO_NOT_FORK_CORE
```

Modelos são motores, não autoridade. O roteador escolhe por saúde, capacidade, política, custo, latência e janela de contexto. A verdade operacional continua vindo de evidência, teste, runtime e receipt.

## Estados válidos

```text
REUSE              = owner + capability + mesmo escopo provados
EXTEND_EXISTING    = owner existe e precisa extensão mínima
CREATE_MINIMAL     = owner/capability/escopo são gap medido
DETERMINISTIC_FALLBACK = provider/modelo ausente, mas motor puro cobre a ação
BLOCKED_SETUP      = recurso obrigatório ausente
BLOCKED_UNKNOWN    = falta prova material
```

## Cadeado de realidade

```text
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
EXISTS != RUNNING
MODEL_COUNT != TRUTH
UNKNOWN != PASS
```

## Árvore aproximada

```text
CentralDark
├─ 🧠 Core canônico
│  ├─ LEIA-ME-IA.md
│  ├─ CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
│  └─ JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
├─ 🔁 CI/CD
│  ├─ porta-de-entrada.yml
│  ├─ validar-porta-de-entrada.mjs
│  └─ universal-execution-standard.mjs
├─ ⚙️ Executáveis / Apps
│  ├─ hash/assinatura
│  ├─ launch probe
│  └─ runtime receipt
├─ 🧩 MCP / Router / CLI
│  ├─ capability catalog
│  ├─ providerless fallback
│  └─ N model adapters
└─ 📜 Receipts
   ├─ same target
   ├─ same head quando aplicável
   └─ runtime observado
```

## Prova desta mudança

- `scripts/lupa/universal-execution-standard.mjs` é código puro sem provider.
- `scripts/lupa/agent-core-adapters.test.mjs` passa a chamar esse padrão dentro do gate existente `porta-de-entrada`.
- Nenhum workflow novo é criado.
- O padrão cobre CI/CD, `.exe`, fallback determinístico e `N` modelos sem transformar votação de modelo em verdade.
