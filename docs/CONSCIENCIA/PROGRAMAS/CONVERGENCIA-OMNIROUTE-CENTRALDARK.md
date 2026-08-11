# CONVERGÊNCIA OMNIROUTE → CENTRALDARK

Autoridade: SEGREDO/CHEFE
Issue-mãe: #722
PR-mãe permanente: #724
Branch-mãe: `program/centraldark-convergencia-omniroute-722`
Missão global relacionada: #604
Programa Casa/Mente relacionado: PR #554

## Direção final

```text
OMNIROUTE = CHASSIS/BASE MADURA
CENTRALDARK = IDENTIDADE/ORGANISMO FINAL
RESULTADO = UM ÚNICO PRODUTO CENTRALDARK
```

Não criar painel, router, app, grafo, vault ou produto paralelo sem `GAP_REAL` comprovado.

## PR-mãe permanente

A #724 é a espinha dorsal permanente de integração. Ela permanece `OPEN` + `Draft` enquanto o organismo existir.

Ela **não** deve virar um diff gigante escrito simultaneamente por vários agentes. O paralelismo acontece em lanes/PRs-filhos e converge para a branch-mãe.

```text
INTENÇÃO DO SEGREDO/CHEFE
→ ISSUE/LANE COM LABELS CANÔNICAS
→ 1 WRITER POR ESCOPO
→ PR-FILHO PEQUENO
→ BASE = program/centraldark-convergencia-omniroute-722
→ TESTE + CONTRAPROVA + RECEIPT
→ MERGE NA BRANCH-MÃE
→ #722/#724 ATUALIZADAS
→ REPETIR
```

PR legado que nasceu antes da mãe deve:

```text
SYNC_MOTHER
→ MERGE NORMAL, SEM FORCE-PUSH
→ TESTAR NOVAMENTE
→ RETARGET PARA BRANCH-MÃE
```

Não trocar a base no escuro se isso produzir conflito ou estado não-mergeável.

## Promoção para `main`

Uma PR mergeada não pode permanecer aberta para sempre. Portanto a #724, enquanto for control plane permanente, não é consumida diretamente pela `main`.

Quando um conjunto estiver provado:

```text
HEAD_EXATO_DA_MAE
→ SNAPSHOT/RELEASE CANDIDATE
→ PR CURTA DE PROMOÇÃO PARA main
→ GATES NO MESMO SHA
→ MERGE
→ #724 CONTINUA ABERTA
```

A PR de promoção não é outra PR-mãe. É apenas transporte de um snapshot provado.

## API única CentralDark

```text
API_OFICIAL=https://api.centralldark.com
API_AI_COMPAT=https://api.centralldark.com/v1
CONSUMIDORES_INTERNOS→API_OFICIAL
PROVEDORES_EXTERNOS→ATRÁS_DO_GATEWAY/ROUTER
NOVO_BYPASS_DIRETO_DE_PROVIDER=PROIBIDO
```

Regras:

- Hermes, SOL, Bolt, WebUI, revisores e novos consumidores não inventam endpoint próprio de IA;
- roteamento, fallback free/pago/local, quotas e analytics devem ficar atrás da API oficial;
- chamada direta a provider só pode existir dentro de componente explicitamente classificado como implementação interna de gateway/proxy/OAuth;
- dívida histórica existente é inventariada e migrada sem quebrar consumidor;
- nenhuma dívida nova de bypass entra.

Gate técnico desta frente: #708 / PR #709.

## Labels = contrato de trabalho

Catálogo canônico:

- `.github/workflows/bots-labels-seed.yml`;
- `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md`.

```text
SEM_LABEL_CANÔNICA = WORK_BLOCKED
PR_FILHO_SEM_LABEL = NÃO PROMOVE
ISSUE_SEM_LABEL = AGENTE NÃO ASSUME
LABEL_LEGADA = COMPATIBILIDADE SOMENTE DURANTE MIGRAÇÃO #707
```

O GitHub nativo permite criar Issue/PR sem label. O enforcement é operacional/determinístico: pode existir, mas agentes não trabalham e gates não liberam promoção até a classificação canônica existir.

Labels visíveis novas/ativas seguem `EMOJI + PT-BR + MAIÚSCULO`.

## Paralelismo profissional

Paralelo por escopo, não vários Writers no mesmo arquivo:

```text
#707  CLAUDE
      → migração do dialeto de labels/produtores/dispatcher

#709  CHATGPT/SOL
      → porta-de-entrada
      → API única
      → branch-mãe também passa pelos gates

#721  SONNET/CLAUDE
      → Artifact Builder

#725  CHATGPT/SOL
      → Sentinela → Hermes → Telegram

CODEX/JUDGE
      → revisão/read-only no HEAD exato
```

Regras:

- um Writer por arquivo/escopo;
- leitores/revisores podem trabalhar em paralelo;
- handoff explícito transfere Writer sem model-lock;
- Judge/revisor não disputa escrita;
- mensagem atrasada não reinicia missão;
- evidência nova vence contexto antigo;
- sem V2/V3/final-final.

A existência deste desenho não prova subagentes reais numa determinada sessão. Só chamar de agente independente quando houver processo/contexto realmente independente.

## Regras fixas

- GitHub remoto é a fonte da verdade técnica.
- `E:\CentralDark\` é Casa/fonte de trabalho local.
- OmniRoute é chassis, não módulo periférico.
- CentralDark entra no OmniRoute e o resultado final continua CentralDark.
- Pacotão 01–36 é a gramática do organismo; não criar pacote 37/38/39.
- Reuse-before-create.
- Um Writer por escopo.
- Sem escrita direta na `main`.
- `UNKNOWN/SKIPPED/QUEUED` não são `PASS`.
- Zero regressão.
- Nenhuma capacidade histórica é removida antes de consumidor + prova + substituto.
- Estado vivo não deve poluir a `main` com commits periódicos.

## Trilhos que alimentam #722/#724

- #604 — unificação operacional total;
- PR #554 — Casa + Mente Estendida;
- #708 / PR #709 — fronteira, workflows, API e gate de labels;
- #711 — Obsidian segundo cérebro;
- PR #637 — base Obsidian/Casa já mergeada;
- PR #677 — residência Casa E: e perfis SOL/Pivete;
- PR #668 — artefato automático/contrato de aprendizado;
- PR #721 — Artifact Builder universal;
- PR #725 — Sentinela → Hermes → Telegram;
- PR #667 — cápsula/evolução observável;
- PR #662 — autoridade SEGREDO/SOL/PIVETE já mergeada;
- PR #704 — gate final HERMES já mergeado;
- PR #705 — lupa-conformance já mergeado.

Outras issues/PRs/branches devem ser classificados antes de criar trabalho novo:

```text
KEEP
ABSORB_GOLD
MERGE_INTO_MOTHER
SUPERSEDED
HISTORICAL
BLOCKED
UNKNOWN
```

## Gate da PR-mãe

```text
OMNIROUTE_PINNED=PASS
PACKAGE_01_36=36/36
HISTORICAL_GOLD_INVENTORIED=PASS
DUPLICATE_CAPABILITIES_RESOLVED=PASS
MOTHER_SPINE_ROUTING=PASS
CANONICAL_LABELS_REQUIRED=PASS
CENTRALDARK_API_SINGLE_ENTRY=PASS
NEW_PROVIDER_BYPASS=0
OBSIDIAN=PASS_OR_EXPLICIT_BLOCK
SOL_HERMES_PROFILE_SWITCH=PASS_OR_EXPLICIT_BLOCK
GRAPH_2D_3D_CELESTIAL=PASS_OR_EXPLICIT_BLOCK
VOICE_LOCAL=PASS_OR_EXPLICIT_BLOCK
LOCAL_MODEL=PASS_OR_EXPLICIT_BLOCK
ARTIFACTS=PASS_OR_EXPLICIT_BLOCK
TELEGRAM_EVENT_MODEL=PASS_OR_EXPLICIT_BLOCK
SECRET_SCAN=PASS
ZERO_REGRESSION=PASS
SAME_SHA=PASS
WRITER_COLLISION=0
P0_OPEN=0
P1_OPEN=0
```

A #724 permanece `Draft` e aberta como control plane. Promoção para `main` acontece somente por snapshot provado no mesmo SHA e autorização aplicável.
