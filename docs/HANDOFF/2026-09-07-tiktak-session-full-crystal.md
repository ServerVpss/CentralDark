# ⏳ TIKTAK — cristal da sessão completa / PR-mãe #1444

`MISSION_ID=CENTRALDARK_TIKTAK_FULL_SESSION_CRYSTAL_20260907`

## Regra desta passagem

```text
#TIKTAK
→ #ACORDAR
→ !CENTRALDARK
→ medir HEAD vivo
→ corrigir somente causa comprovada
→ reutilizar owner existente
→ aprender em paralelo sem criar cérebro novo
→ receipt
→ SAME_HEAD CI
→ Reality Judge
→ continuar até FIXED_POINT | HUMAN_FRONTIER comprovada | BLOCKED causal
```

## Baseline vivo antes deste cristal

```text
REPO=ServerVpss/CentralDark
MAIN=b3de3d82067c9476657d8fff3c6115f05afa079a

PR_MAE=#1444
BRANCH_1444=reconcile/garimpo-one-site-one-mcp-admin-20260906
HEAD_1444_ANTES_DESTE_ARQUIVO=1f60437c8a37023b1eaf8877d5e6b15050933d8b
PR_1444_OPEN=true
PR_1444_MERGEABLE=true
PR_1444_DRAFT=false

PR_OMNI=#1445
BRANCH_1445=feat/omniroute-capability-surface-722
HEAD_1445_APOS_FIX_PROPERTIES=5664a75036258a1cc711be75c08cce341673220a
```

`UNKNOWN != PASS`. O novo HEAD criado por este arquivo exige nova prova SAME_HEAD.

## Feridas causais abertas e tratadas

### #1444 — runner da arquitetura

Ferida medida no gate global: workflow novo usava GitHub-hosted Linux contra `GLOBAL_RUNNER_POLICY`.

Correção já preservada:

```text
.github/workflows/build-centraldark-architecture-package.yml
ubuntu-latest
→ [self-hosted, Linux]
```

Commit histórico: `c871fcad7b9782d5015ea11096261ca012703f3a`.

### #1444 — markers do Trigger Fabric

O verificador exigia os dois marcadores do pacote/contraprova.

Correção já preservada:

```text
Trigger Fabric Full Package
Fresh-extraction counterproof
```

Commit histórico: `c7855b8ccd552d918ab6ecdcce44d72023875157`.

### #1444 — instalador Desktop multiplataforma

A política da Casa proíbe `ubuntu-latest`, `windows-latest` e `macos-latest` nos workflows não isentos. O instalador precisava manter Linux para contrato e Windows para gerar `Setup.exe`, sem trocar o job Windows para Linux.

Correção desta rodada:

```text
.github/workflows/centraldark-desktop-windows-installer.yml
contract.runs-on: [self-hosted, Linux]
build-windows.runs-on: [self-hosted, Windows]
```

Commit: `1f60437c8a37023b1eaf8877d5e6b15050933d8b`.

Contraprova preservada:

```text
WINDOWS_SELF_HOSTED_AVAILABLE=UNKNOWN
CONFIG_POLICY_FIXED != WINDOWS_RUNTIME_PROVEN
```

### #1445 — FABLE / argValue

O workstream #1445 já avançou para um HEAD em que:

```text
FABLE_LOOP.default_routing=false
FABLE_LOOP.role=READ_ONLY_CALIBRATION_METHOD
argValue parser restaurado
```

Isso pertence à lane técnica #1445; não duplicar no #1444.

### #1445 — propriedades do artefato BRAIN

O Trigger Fabric do HEAD `09478cd...` provou Fixed Point Fabric e 41 testes, mas falhou em `ARTIFACT_PROPERTIES_VERIFY` porque o aprendizado OmniRoute não tinha:

```text
status
updated
category
sensitivity
source
source_class
source_rule
owner
```

Correção desta rodada no #1445:

```text
HEAD_1445=5664a75036258a1cc711be75c08cce341673220a
FILE=docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-09-06-OMNIROUTE-CAPABILITY-ABSORPTION.md
```

O arquivo agora segue o contrato de `verify_artifact_properties.py`. SAME_HEAD CI ainda precisa julgar.

## Runners / VPS / multiplataforma

### Provado

```text
GitHub Actions → self-hosted Linux runner = OBSERVADO
runner_name=vmi3256920-centraldark
Linux job pickup = PROVADO em runs anteriores
```

### Não provado

```text
DIRECT_SSH_FROM_THIS_CANETA=UNAVAILABLE
WINDOWS_SELF_HOSTED_RUNNER=UNKNOWN
VPS_FULL_RUNTIME=UNKNOWN
DEPLOYED_SITE_BINDING=UNKNOWN
```

A ausência de SSH direto nesta caneta não cancela GitHub Actions nem autoriza inventar runtime.

## Dependabot — reutilizar o que já existe

Owner atual:

```text
.github/workflows/dependabot-auto-merge.yml
scripts/dependabot/resolve-conflicts.sh
.agents/skills/git-conflict-resolve-house-standard/SKILL.md
```

O workflow já implementa:

```text
pull_request_target + schedule + workflow_dispatch
→ self-hosted Linux
→ prova escopo Dependabot
→ Signal Watcher
→ update-branch
→ remede mergeabilidade
→ conflito real ? resolve-conflicts.sh : continue
→ PATCH mergeável pode habilitar auto-merge squash
→ MINOR/MAJOR permanecem sob política própria
```

Logo:

```text
CREATE_DEPENDABOT_V2=false
CREATE_SECOND_CONFLICT_RESOLVER=false
```

Cada atualização deve gerar sinal/receipt e voltar ao mesmo owner.

## Aprendizado paralelo — sem cérebro novo

Owners existentes já observados:

```text
scripts/memory-linker/
scripts/memory-linker/dream-review-run.mjs
scripts/memory-linker/pattern-discovery.mjs
.agents/skills/session-intelligence-harvester/
.agents/skills/knowledge-compiler/
.agents/skills/vector-memory/
apps/modulos/HERMES-CORE/agents/GraphRAG-Master/
```

Fluxo permitido:

```text
EVENTO / PR / RUN / JOB / SCREENPIPE / MCP
→ Signal Watcher / Trigger Fabric
→ receipt bruto
→ memory-linker / harvester
→ dedupe
→ dream review / pattern discovery
→ knowledge compiler
→ owner + consumer + test
→ ouro somente quando provado
```

Regras:

```text
DIRECT_CANONICAL_MUTATION=false
AUTONOMY_QUEUE_DIRECT_APPLY=false
RAW_PRIVATE_REASONING_NOT_EXPOSED=true
VISIBLE_NEXT_STEP=true
```

## Multi-canetas / vários braços

```text
MANY_READERS=true
MANY_MODELS=true
MANY_CONNECTORS=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
REALITY_IS_JUDGE=true
```

GitHub, MCP, Screenpipe, VSCode, terminal, Hermes, SOL, ChatGPT, Claude, Gemini, Grok e Codex são canetas/capabilities/superfícies. Nenhum conector é autoridade sozinho.

```text
MODEL_VOTE != TRUTH
CONNECTOR != AUTHORITY
WRITER != JUDGE
```

## Compasso operacional TIKTAK

A cadência visível é progresso operacional, não chain-of-thought interna:

```text
♩ 1 = MEDIR
♩ 2 = EXECUTAR
♩ 3 = CONTRAPROVAR
♩ 4 = REGISTRAR
```

Cada compasso fecha com:

```text
HEAD
OWNER
DELTA
RESULTADO
EVIDÊNCIA
UNKNOWN
NEXT_CURSOR
```

## Arquitetura Plug & Play preservada

```text
SEGREDO/CHEFE
→ CentralDark Core
→ Hub
→ Omni Router
→ 1 API
→ 1 MCP
→ Trigger Fabric
→ Sector Resolver
→ Buzz/Salas
→ P1/P2/P3/P4 conforme risco
→ Teste
→ Counterproof
→ Runtime
→ Reality Judge
→ Receipt/POMBO
```

Preservar:

```text
BUZZ
GROK_BUILD
LOCAL_AI
ODS
OPENMAUSBOT
OPEN_LOVABLE
AIOX
ENXAME
OMEGA
FORJA
VOICE/SOL
ADMIN/COCKPIT
GRAPH_RAG
MEMORY_LINKER
SCREENPIPE
```

Nenhuma dessas reservas autoriza segundo brain/router/MCP/Hub.

## Casa local / storage / VSCode — plano preservado, não runtime provado

```text
E:\CentralDark
= Casa persistente / BRAIN / backups / fontes / dados pesados / pacotes / evidências

C:\centraldark-repo
= clone rápido / build / teste / preview / VSCode / benchmark

C:\tmp
= temporário; limpar somente por copy → hash verify → consumer check → delete
```

Regra:

```text
MOVE = COPY + VERIFY + DELETE
NO_BLIND_DELETE=true
```

A configuração completa de VSCode/Hermes/Desktop/Screenpipe/Gemini deve reutilizar owners existentes; runtime local continua `UNKNOWN` até execução na Casa.

## Garimpo de branches e histórico

Inventário anterior enumerou 494 branches. Isso prova o denominador, não equivalência semântica 494/494.

```text
BRANCH
→ comparar com main
→ SUPERSEDED | ABSORBED | UNIQUE_DELTA | CONFLICT | HISTORICAL | UNKNOWN
→ transferir apenas ouro exclusivo ao owner atual
```

Não ressuscitar branch inteira só porque tem nome histórico importante.

## Handoff PR-mãe ↔ lanes

```text
#1444 = rendezvous / índice / lineage / receipt-mãe
#1445 = OmniRoute / router capability lane
#1378 = sanitização CI/external-source quando aplicável
```

Regra:

```text
NO_CROSS_LANE_BLIND_COPY=true
CHILD_WORK_RETURNS_RECEIPT_TO_1444=true
```

## Feridas que ainda exigem SAME_HEAD

```text
PR_1444:
- Trigger Fabric
- porta-de-entrada
- lupa-conformance
- Lupa Drift Guard
- codex-validate
- PR auto-review
- aprendizado automático
- Pipeline Telegram + Painel
- Windows self-hosted disponibilidade quando o instalador for realmente executado

PR_1445:
- Trigger Fabric após fix das propriedades
- mergeability atual
- gates cancelados/queued precisam de SAME_HEAD novo
- runtime /health permanece UNKNOWN
```

## Critério de continuidade automática

```text
WHILE new_information AND safe_action_within_authority:
    continue

STOP only if:
    FIXED_POINT
    OR HUMAN_FRONTIER_PROVEN
    OR BLOCKED_WITH_EXACT_CAUSE
```

Não parar por:

```text
check amarelo antigo
branch histórica
comentário sem prova
opinião de agente
workflow cancelado por HEAD superado
```

## Próximos cursores

```text
CURSOR_A=#1444_HEAD_AFTER_THIS_CRYSTAL → SAME_HEAD CI → abrir primeira falha causal → corrigir owner mínimo
CURSOR_B=#1445@5664a750 → SAME_HEAD CI → validar ARTIFACT_PROPERTIES → abrir próxima falha causal
CURSOR_C=dependabot-auto-merge → manter único motor de conflitos + Signal Watcher + receipts
CURSOR_D=Windows self-hosted → provar runner antes de declarar instalador operacional
CURSOR_E=SSH/VPS direto → HUMAN_FRONTIER desta caneta; usar apenas se uma caneta autorizada com SSH real estiver disponível
```

## Veredito deste cristal

```text
SESSION_CRYSTALLIZED_IN_PR_1444=true
RUNNER_POLICY_LINUX_FIX=PROVEN_IN_GIT
TRIGGER_MARKERS=PROVEN_IN_GIT
DESKTOP_SELF_HOSTED_POLICY_FIX=PROVEN_IN_GIT
WINDOWS_RUNNER_RUNTIME=UNKNOWN
PR_1445_ARTIFACT_PROPERTIES_FIX=PROVEN_IN_GIT
PR_1445_SAME_HEAD_CI=UNKNOWN
PR_1444_SAME_HEAD_CI=UNKNOWN
FIXED_POINT=false
```

> Muitas mãos podem carregar a arca; uma caneta escreve por escopo; e o último selo pertence à realidade.
