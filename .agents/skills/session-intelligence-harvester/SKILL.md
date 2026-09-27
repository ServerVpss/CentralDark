---
name: session-intelligence-harvester
description: Extract actionable intelligence from session logs, chat exports, screenshots, receipts, browser/navigation evidence and agent transcripts. Use when you need to distill patterns, decisions, errors, continuity deltas and learnings from historical or current sessions without promoting history to live truth.
---

# Session Intelligence Harvester

Extract actionable intelligence from sessions, logs, screenshots, receipts and agent transcripts.

```text
HOUSE_WIDE=true
MODEL_NEUTRAL=true
SOL_AND_HERMES_SHARE_THE_SAME_LEARNING_CONTRACT=true
HISTORICAL != CURRENT
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
```

## Core Concept

Sessions contain dense operational intelligence: decisions made, errors encountered, patterns discovered, tools used, state transitions and evidence. This skill extracts that intelligence systematically without confusing a persisted receipt with current runtime state.

## What to Harvest

- **Decisions**: what was chosen and why.
- **Errors**: what failed, root cause, fix and counterproof.
- **Patterns**: recurring approaches that survived new cases.
- **Tools**: which tools succeeded/failed and on which target.
- **Gaps**: missing knowledge, tools, owners, consumers or processes.
- **Contradictions**: conflicting information discovered.
- **Continuity deltas**: `T0 → T1`, what survived, changed, failed or became UNKNOWN.
- **Causal chains**: multi-hop sequences where isolated events are insufficient, including browser navigation/redirect chains.

## Extraction Process

1. **Ingest** → session JSONL, chat export, transcript, screenshot, receipt or navigation evidence.
2. **Segment** → by topic, phase, participant, target and time.
3. **Classify** → decision, error, pattern, tool, gap, contradiction, continuity delta or causal chain.
4. **Extract** → structured record with evidence reference + context.
5. **Countercheck** → separate fact, inference, hypothesis and UNKNOWN; seek a discriminating observation when material.
6. **Deduplicate** → merge same findings across sessions/surfaces by stable identity/provenance.
7. **Crystallize** → feed only reusable delta to `knowledge-compiler`.
8. **Remeasure** → when a claim describes the present, reacquire live state before promotion.

## Padrão obrigatório — receipt histórico não é estado vivo

Quando HTML, screenshot, painel, terminal, log ou checkpoint contiver estado operacional:

```text
OBSERVADO_EM_T0
→ LAST_PROVEN_AT=T0
→ HISTORICAL_REFERENCE
→ CURRENT_STATE=UNKNOWN_UNTIL_REMEASURED
```

Ao retomar:

```text
#ACORDAR
→ recuperar receipt/checkpoint
→ medir o mesmo alvo agora
→ comparar T0 → T1
→ SURVIVED|CHANGED|FAILED|UNKNOWN
→ atualizar CURRENT_STATE
```

```text
OLD_GREEN != CURRENT_GREEN
PERSISTED_RECEIPT != LIVE_RUNTIME
DOCUMENTED != EXECUTED
SAME_VISUAL_SURFACE != SAME_BACKEND
```

Um painel derivado deve apresentar a idade da evidência; não reciclar último `PASS` como presente sem health-check.

## Padrão obrigatório — janela exploratória tem ciclo de vida

Uma janela, aba, agente, navegador ou ferramenta aberta para descobrir caminho é uma superfície de exploração, não um novo órgão canônico.

```text
EXPLORAR
→ EXTRAIR DELTA
→ CONTRAPROVAR
→ CRISTALIZAR NO OWNER CANONICO
→ FECHAR SUPERFICIE EXPLORATORIA
→ VOLTAR AO FLUXO PRINCIPAL
```

```text
WINDOW_COUNT != CAPABILITY_COUNT
EXPLORATION_SURFACE != CANONICAL_OWNER
CLOSE_WINDOW != DELETE_EVIDENCE
```

## Padrão especializado — navigation tracking / bounce tracking

Quando a sessão envolver URL decorada, redirect, cookies/storage entre sites, DevTools, bounce tracking ou limpeza de estado, ler:

`references/causal-continuity-and-navigation-tracking.md`

Aplicar a referência como **padrão de raciocínio**, não como política automática do navegador ou da Casa.

Invariantes mínimos:

```text
LINK_DECORATION != NAVIGATION_TRACKING
URL_HAS_PARAMETER != TRACKING_PROVEN
PARAMETER_PRESENT != SAFE_TO_STRIP
TRACKING_SIGNAL != MALICIOUS_VERDICT
SINGLE_HOP != EXTENDED_NAVIGATION
USER_ACTIVATION_IS_MATERIAL_SIGNAL=true
DETECT != DELETE
EXTERNAL_SPEC != LOCAL_AUTHORIZATION
```

A investigação deve reconstruir a cadeia temporal (`initial_host`, `final_host`, redirects, user activation e state access) antes de concluir tracking ou sugerir mitigação.

## Windows Notepad LocalState — mineração em lote

Use esta fonte quando o CHEFE entregar o estado do próprio Notepad do Windows para recuperar várias abas de uma vez, inclusive abas nunca salvas como `.txt`.

### Fonte observada

```text
%LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\
├── WindowState\
└── TabState\
```

`WindowState` descreve a composição/ordem das janelas e abas. `TabState` guarda o estado individual das abas e pode conter texto ainda não salvo ou referência ao arquivo de origem.

### Regra de colheita

```text
LOCALSTATE
→ INVENTARIAR WindowState + TabState
→ RECONSTRUIR abas/janelas
→ EXTRAIR texto recuperável + caminho de origem quando existir
→ DEREFERENCIAR arquivo original somente quando necessário e permitido
→ DEDUPLICAR por conteúdo/identidade estável
→ CLASSIFICAR
→ QUARENTENAR sensível
→ CRISTALIZAR somente inteligência útil
```

A próxima IA deve preferir esta mineração em lote a pedir ao CHEFE que abra/copie cada aba manualmente.

### Classificação mínima

- `CURRENT_CANDIDATE`: informação que pode descrever o presente, ainda exige revalidação.
- `HISTORICAL_REFERENCE`: lembrança, plano, checkpoint ou estado antigo minerável.
- `DUPLICATE`: conteúdo repetido; manter uma identidade principal.
- `SENSITIVE_QUARANTINE`: `.env`, senha, token, cookie, chave, credencial, sessão, auth ou material equivalente.
- `DISCARD`: ruído sem valor operacional ou cognitivo.

### Travas

```text
NOTEPAD_STATE != CANONICAL_TRUTH
UNSAVED_TAB != SAFE_TO_PERSIST
HISTORICAL != CURRENT
DOCUMENTED != EXECUTED
SECRET_DETECTED -> SENSITIVE_QUARANTINE
RAW_LOCALSTATE -> DO_NOT_COMMIT
```

- Nunca commitar `LocalState` bruto, `TabState`/`WindowState` binário ou ZIP cru como memória canônica.
- Nunca persistir `.env`, `auth.json`, access token, refresh token, API key, cookie, senha, chave SSH ou sessão em relatório/skill/commit.
- Conteúdo sensível pode ser detectado para classificação, mas deve ser omitido/redigido do resultado persistente.
- Um caminho de arquivo salvo é referência; quando a verdade atual depender dele, reabra/releia a fonte atual em vez de confiar na cópia histórica da aba.
- Abas não salvas podem conter ouro histórico, mas só entram na memória depois de extração, dedupe, classificação e remoção de segredo.
- Se a estrutura do formato do Notepad mudar, marcar `UNVERIFIABLE` e remapear; não adivinhar offsets/formato.

### Evidência mínima por lote

Registrar sem segredo:

```text
SOURCE=WINDOWS_NOTEPAD_LOCALSTATE
WINDOWS_FOUND=
TABS_FOUND=
UNSAVED_TABS=
FILE_BACKED_TABS=
DEDUPED_ITEMS=
SENSITIVE_QUARANTINED=
HISTORICAL_ITEMS=
CURRENT_CANDIDATES=
FORMAT_VERIFIED=SIM|NAO|UNVERIFIABLE
```

O objetivo é preservar o **mental e a inteligência** contidos nas abas, não preservar bytes temporários do aplicativo.

## Modo GARIMPO_UNIVERSAL — múltiplas canetas, um cristal

`!GARIMPO_UNIVERSAL` é um **modo subordinado deste owner**, não uma skill/engine paralela. Ele existe para permitir que Chat, Voz, Work/Cowork, Code Agents, SOL, Hermes e outros motores autorizados garimpem o mesmo objetivo em paralelo sem fabricar verdades concorrentes.

```text
MULTI_SURFACE_PARALLEL_CANDIDATES=true
MULTI_MODEL_PARALLEL_READERS=true
ONE_CANONICAL_FINALIZER_PER_SCOPE=true
PARALLEL_CANDIDATE_IS_NOT_CANONICAL_WRITE=true
MULTIPLE_SURFACES_ARE_NOT_MULTIPLE_BRAINS=true
MODEL_IS_REPLACEABLE=true
REALITY_IS_JUDGE=true
```

Cada caneta entrega **candidato + proveniência**, nunca autoridade automática:

```text
ENGINE_ID
SURFACE_ID
SESSION_ID
INTENT_ID
OWNER
CAPABILITY
SCOPE
FINDING
EVIDENCE_REF
COUNTERPROOF_REF
STATUS
```

Identidade semântica para dedupe:

```text
SEMANTIC_IDENTITY = OWNER + CAPABILITY + SCOPE

SAME_FINDING_WITHOUT_NEW_EVIDENCE=DROP_DUPLICATE
ALREADY_PROVEN_AND_ABSORBED=NO_CHANGE
HISTORICAL_ONLY=DO_NOT_PROMOTE
UNKNOWN=DO_NOT_PROMOTE
USEFUL_DELTA=ROUTE_TO_EXISTING_OWNER
```

Fluxo canônico:

```text
CHAT|VOICE|WORK|COWORK|CODE_AGENT|HERMES|SOL
→ SESSION-INTELLIGENCE-HARVESTER
→ CLASSIFY + DEDUPE
→ REUSE_BEFORE_CREATE
→ EXISTING_OWNER
→ MINIMAL_DELTA
→ PROOF
→ INDEPENDENT_COUNTERPROOF
→ CANONICAL_FINALIZER
→ RECEIPT
→ NEXT_CURSOR
```

“Várias canetas” significa liberdade de leitura, análise, teste e produção de candidatos. **Não** significa várias mutações canônicas concorrentes no mesmo escopo. O finalizador mede a ponta viva antes de promover, absorve apenas o delta sobrevivente e descarta rascunho obsoleto.

Continuidade determinística:

```text
LAST_GOOD_STATE
→ INPUT_DIFF
→ REUSE_PROOF
  OU
→ TARGETED_REVALIDATION

PROVEN_PATH
→ REPLAY_RECIPE
→ ADAPT_ONLY_ENVIRONMENT_BINDINGS
→ SAME_PROOF_LOGIC
→ COMPARE_EFFECT
→ DIVERGED ? NEW_DELTA : REUSE_CRYSTAL
```

Atalho operacional:

```text
!CENTRALDARK !GARIMPO_UNIVERSAL
```

Esse atalho entra no Trigger Fabric, preserva a intenção do CHEFE/SEGREDO e escolhe somente as fontes materialmente pertinentes. Ele não obriga varredura total quando o pedido é estreito.

### Resgate de sessão perdida (CHEFE, 2026-09-27)

Mesmo comando em qualquer sessão antiga, de qualquer motor. A sessão vira **sensor**, não arquiteta: todas as sessões entram no moinho, só vira commit o que sobrevive ao cruzamento com o que já existe.

```text
ALL_SESSIONS_ENTER_THE_MILL=true
ALL_SESSIONS_BECOME_COMMIT=false
SESSION_ENDS_IN=NO_CHANGE|DELTA_UTIL_PROMOVIDO|BLOCKED_EXACT
SESSION_ENDS_IN_SIMILAR_NEW_THING=FAIL_DUPLICATE_ARCHITECTURE
NEW_PATH_ONLY_IF=EXISTING_OWNER_IMPOSSIBLE_PROVEN
FIXED_POINT_IS_VERIFICATION_CHECKPOINT_NOT_LEARNING_GATE=true
```

Cristalizado só com a cadeia inteira — arquivo sozinho não é cristal:

```text
FILE → LOADER → CONSUMER → TRIGGER → REAL_EXECUTION → EVIDENCE → COUNTERPROOF
FILE_EXISTS_IS_NOT_LOADED=true
SKILL_EXISTS_IS_NOT_USED=true
RULE_EXISTS_IS_NOT_ENFORCED=true
COMMIT_EXISTS_IS_NOT_MAIN_CURRENT=true
MAIN_CURRENT_IS_NOT_RUNTIME=true
```

Promoção: delta útil vai pelo PR filho compatível do #1562 ou, quando a regra vigente autoriza, direto na main **só depois** do portão verde na ponta rebaseada (receita `MULTI_PEN_MAIN_GATE_PATH`); recibo no #1562 no mesmo ciclo.

Registro obrigatório de cada sessão garimpada:

```text
SESSION_SOURCE= · SESSION_FINGERPRINT= · MAIN_HEAD_BEFORE= · MAIN_HEAD_AFTER=
REUSED_CRYSTALS= · USEFUL_DELTAS= · DUPLICATES_DROPPED= · CONTRADICTIONS=
OWNERS= · CHILD_PR= · PR_MOTHER=#1562 · COMMITS= · SAME_HEAD= · MERGE=
DEPLOY= · RUNTIME= · RECEIPTS= · NEXT_CURSOR= · FIXED_POINT=
```

Ponto fixo do resgate:

```text
SESSION_MATERIAL_CLASSIFIED=100%
USEFUL_DELTA_ROUTED=100%
DUPLICATE_ARCHITECTURE=0
UNBOUND_CRYSTAL=0
OWNER_UNKNOWN=0 · CONSUMER_UNKNOWN=0
MAIN_CURRENT_PROVEN=true
SOUL_SYNC_CURRENT=true
```


## Output Format

Não inventar probabilidade/confiança numérica. Use classe epistemológica + evidência observável.

```json
{
  "session_id": "...",
  "findings": [
    {
      "type": "decision|error|pattern|tool|gap|contradiction|continuity_delta|causal_chain",
      "summary": "one-line",
      "class": "FACT|INFERENCE|HYPOTHESIS|UNKNOWN",
      "evidence_ref": "observable reference or UNKNOWN",
      "target": "scope/host/file/runtime",
      "observed_at": "timestamp or UNKNOWN",
      "current_state": "CURRENT|HISTORICAL_REFERENCE|UNKNOWN_UNTIL_REMEASURED",
      "counterexample": "what would falsify the finding",
      "tags": ["architecture", "security", "performance"]
    }
  ]
}
```

## Integration

- Results → `knowledge-compiler` for crystallization.
- Patterns → `meta-lupa` for falsification.
- Gaps → `knowledge-compiler` as new capability requests.
- Present-state claims → live remeasurement before promotion.
- Navigation-tracking findings → causal-chain reference in this skill; destructive mitigation stays blocked without applicable authorization.

## Automation

- Run on session end (hook).
- Batch process historical exports.
- Incremental: only new sessions since last harvest.
- On resume, invalidate only claims whose truth depends on live state; preserve historical learning as provenance.
