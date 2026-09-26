---
name: fable-loop
description: "FABLE LOOP: distributed sources, not parallel systems."
version: 1.0.0
category: autonomous-operation
---

# FABLE LOOP — Canonical Operational Autoload Contract

## O que é

FABLE LOOP은 대형/복합/다중 도메인 작업에서 **고정점(fixed point)까지 총 자율성**을 발휘하기 위한 Canonical Operational Autoload Contract임. 독립된 두 번째 엔진이나 소유자가 아님. 기존 `!CENTRALDARK` 마스터 퍼널을 통해 진입함.

**핵심 원칙:**
```
CAPABILITY != AUTHORITY
AUTONOMY_MEANS_CONTINUE_WITHIN_PROVEN_SCOPE
EXECUTOR_CANNOT_SELF_APPROVE
JUDGE_DOES_NOT_MUTATE
```

## 활성화 조건

FABLE LOOP은 다음 조건에서 **자동 활성화**되어야 함:

```
FABLE_LOOP_AUTOLOAD = 
  LARGE_TASK OR COMPLEX_TASK OR MULTI_DOMAIN_TASK OR 
  LONG_RUNNING_AUTONOMOUS_TASK OR HIGH_UNCERTAINTY_RECONCILIATION OR 
  USER_REQUESTS_TOTAL_AUTONOMY
```

사용자 신호: "총 자율성으로", "FABLE LOOP 실행", "10개 프런트", "고정점까지", "모든 스킬 사용", "재시작 금지"

## 마스터 퍼널 진입 (필수)

```
ANY_RECOGNIZED_TRIGGER → NORMALIZE_ALIAS → !CENTRALDARK → #ACORDAR 
→ !CALIBRAR → #CRISTALIZAR · FABLE_LOOP → MEASURE
```

FABLE_LOOP은 새 엔진/소유자/명령을 만들지 않음. `!FABLE_LOOP`, `#FABLER_LOOP` 등 모든 변형은 `!CENTRALDARK`로 정규화됨.

## 분산 소스 패턴 (핵심 기법)

`skill_view`가 짧은 플레이스홀더/파일 없음 반환 시:
1. 저장소에서 분산 소스 검색 (`git ls-tree`, `find`, `search_files`)
2. 기존 계약/문서 사용 (cot-react-loop, fabler-system, loop.mjs, sync-loop.sh, MODO-OPERACIONAL-LOOP, LEARNING_CRYSTAL_LOOP 등)
3. 분산 소스 구성 → 계약 완성
4. 두 번째 엔진/소유자/병렬 아키텍처 생성 금지

```
REGRA_FONTE_DISTRIBUIDA = usar contratos úteis já existentes; ausência 
de skill nomeada exatamente fable-loop NÃO autoriza criar segundo motor, 
segundo owner ou arquitetura paralela.
```

적용 예: 이 세션에서 `fable-loop` 스킬이 없었지만 10개 분산 소스(cot-react-loop/SKILL.md, fabler-system.md, loop.mjs, sync-loop.sh, MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md, LEARNING_CRYSTAL_LOOP.yml, 004-hermes-24h-loop-autonomo.md, triagem-fabler-pendencias.md, LoopDiagram.tsx, dependabot-squash-loop.mmd, centraldark-pattern-intelligence, kimetsu-legacy references)를 찾아 계약 구성.

## 10개 프런트 (Reader, 병렬 인지)

```text
READER_FRONTS_TARGET=10
FRONTS_ARE_READERS_NOT_WRITERS=true
PARALLELIZE_PERCEPCAO=true
SERIALIZE_MUTACAO_PER_SCOPE=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
RENDEZVOUS_REQUIRED=true
NO_FAKE_PARALLELISM=true
```

| # | Front | Saída Esperada |
|---|-------|----------------|
| 01 | REPO_MAIN_HEAD_CURRENT_STATE | branch, HEAD, dirty, PRs abertos, writer ativo |
| 02 | LINEAGE_ISSUES_PRS_COMMITS_BRANCHES | histórico de commits, merges, conflitos resolvidos |
| 03 | DRIVE_DOCS_RECEIPTS | receipts, PDFs, notas, mapeamento Drive↔GitHub |
| 04 | CASA_WORKTREES_RUNTIME | worktrees ativos, PIDs, ports, health |
| 05 | OWNERS_ARCHITECTURE_CONTRACTS | skills, triggers, configs, owners por escopo |
| 06 | SKILLS_TOOLS_AUTOMATION | skills carregadas, ferramentas disponíveis, gaps |
| 07 | PROVIDERS_MODELS_ROUTER | modelos ativos, fallbacks, latency, health |
| 08 | TESTS_FALSIFIERS_COUNTERPROOF | testes existentes, falsificadores, contraprovas |
| 09 | INFRA_PERFORMANCE_SECURITY | VPS, secrets, GPU, TTS, rede, segredos |
| 10 | DOCUMENTATION_HANDOFF_NEXT_CURSOR | handoff ChatGPT format, next_cursor, blockers |

**프런트는 Reader임. Writer 아님.** 모든 프런트 반환 ≠ 자동 고정점.

### Rendezvous Protocol (obrigatório após 10 fronts)

```
1. COLLECT → todas as 10 saídas chegam
2. RECONCILE → cruzar claims, HEADs, hashes, runtime observations
3. OWNER_MATCH → cada delta útil vai para owner existente (REUSE_BEFORE_CREATE)
4. ONE_WRITER_PER_SCOPE → PR único por escopo mutável
5. PATCH_MINIMUM → delta mínimo que resolve
6. TEST → prova no mesmo HEAD
7. COUNTERPROOF → Meta Lupa derruba cada claim
8. REALITY_JUDGE → PASS / FAIL / BLOCKER
9. FIXED_POINT → todas as condições satisfeitas
10. REGISTER → receipt persistido, next_cursor, boot refresh
```

## Canonical 흐름

```
TRIGGER → NORMALIZE → !CENTRALDARK → #ACORDAR → !CALIBRAR 
→ #CRISTALIZAR·FABLE_LOOP → 10_READERS → RENDEZVOUS → RECONCILE 
→ REALITY_SCOPE_GATE → OWNER_MATCH → ONE_WRITER_PER_SCOPE 
→ PATCH_MINIMUM → TEST → COUNTERPROOF → REALITY_JUDGE 
→ FIXED_POINT → REGISTER → BOOT_REFRESH → NEXT_CURSOR
```

## 총 자율성 규칙

```
AUTONOMY_MEANS_CONTINUE_WITHIN_PROVEN_SCOPE=true
AUTONOMY_DOES_NOT_GRANT_NEW_AUTHORITY=true
EXECUTOR_CANNOT_SELF_APPROVE=true
JUDGE_DOES_NOT_MUTATE=true
SECRET_EXPOSURE_FORBIDDEN=true
NEVER_PRINT_RAW_SECRET=true
NEVER_PERSIST_RAW_SECRET=true
```

자율성 = 입증된 범위 내 계속. 새 권한 부여 아님.

## 도구 실패 처리

```text
SE_TOOL_OR_PATH_FAILS → CLASSIFY_FAILURE → SEARCH_EXISTING_ALTERNATIVE 
→ RECONCILE → CONTINUE
```

- 도구 실패 → 대체 경로 검색 → 계속
- 스킬 이름 부재 → 분산 소스 검색 → 기존 계약 사용
- 제공자 실패 → 대체 제공자 → 계속
- **실패를 "작동하지 않음"으로 기록하지 말고 대체 패턴 캡처**

## Windows‑Specific Script Execution

When running Hermes cron jobs or scripts on Windows, prefer using **.bat wrappers** or **cmd.exe /c** to invoke **.sh** or **.ps1** scripts to avoid 'Script not found' or syntax errors due to line endings or missing bash.

### Pitfall
- Calling a `.sh` script directly in a cron job (no-agent mode) may fail with `Script not found` or `SyntaxError: invalid syntax` because the scheduler tries to execute it via Python or expects a Unix shebang.
- Using `bash.exe` directly may still fail if the script contains Windows‑style line endings or relies on Unix‑only utilities.

### Solution
1. Create a simple `.bat` wrapper in the same folder as the target script:
   ```bat
   @echo off
   rem Wrapper to run <script>.sh via Git bash
   "C:\\Program Files\\Git\\usr\\bin\\bash.exe" \"%~dp0<script>.sh\"
   ```
   or for PowerShell scripts:
   ```bat
   @echo off
   powershell -NoProfile -ExecutionPolicy Bypass -File \"%~dp0<script>.ps1\"
   ```
2. Update the cron job to point to the `.bat` wrapper with `--no-agent` (or let the wrapper handle execution).
3. Verify the wrapper works by running it manually before committing.
4. Ensure the script file has Unix line endings (LF) if it will be invoked via Git bash; otherwise use `dos2unix` or convert.
5. Prefer using the built-in `system-breathing.bat` pattern as a template.

### Verification
- After editing a cron job, run `hermes cron run <job_id>` to see immediate output.
- Check logs in `/e/CentralDark/Pivete/logs/` for success.

Apply this pattern to any Windows‑targeted script (system‑breathing, dependabot‑monitor, screenpipe‑monitor, etc.).

## 고정점

```
FIXED_POINT_REQUIRES:
- MISSION_OBJECTIVE_PROVEN
- ALL_MATERIAL_FINDINGS_SCOPED_AND_RECONCILED
- NO_MATERIAL_UNKNOWN
- OWNER_MAP_PROVEN
- REQUIRED_TESTS_PASS
- COUNTERPROOF_SURVIVES
- NO_REGRESSION
- RECEIPT_PERSISTED
- NEXT_CURSOR_PERSISTED

IF_GIT_PROMOTION_APPLIES:
TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD
CI_GREEN_ON_LATEST_HEAD=true

ALL_10_FRONTS_RETURNED != FIXED_POINT_AUTOMATICALLY
FIXED_POINT_IS_REALITY_JUDGMENT=true
```

## 학습 크리스탈화

```
OBSERVED_FAILURE → CAUSE → OWNER → FALSIFIER → MINIMUM_PATCH 
→ NEGATIVE_TEST → POSITIVE_TESTS → COUNTERPROOF → RECEIPT 
→ GENERALIZE_IN_EXISTING_OWNER

CRYSTALLIZED_LEARNING_REQUIRES_REAL_FAILURE_AND_PROOF=true
NO_SECOND_FABLE_ENGINE=true
NO_V2_V3_V4=true
```

## Garimpo Plan Absorption Pattern (Auréola Panel Crystallization)

When garimpo/plan describes a "painel honesto" or missing contract owner (e.g. Auréola as system panel):

1. MEASURE: confirm absence in tree (ls-tree/grep on pr-1381/main), extract plan text (deep-research md).
2. RECONCILIAR: PEGATUDO plan prose → minimal YAML contract at canonical path (docs/ARQUITETURA/.../AUREOLA-BAHIA-BIBLICA.yml). Include exact VERDE formula, UI semantic contract, one-brain-N-hands architecture, gates, provenance. Patch delta owner (DELTA-CONTINUO.md) with 1-line reference.
3. Dedupe: treat prior "Criar zip cristalize" attempts as HISTORICAL; do not promote.
4. META_LUPA + CONTRAPROVA: string match (grep VERDE / "um cérebro" / ui_action_contract / FIXED_POINT), git evidence only the referenced file + link, no contradictions with SOUL/DELTA/skills.
5. FIXED_POINT: verify all conditions (INTENÇÃO ALINHADA via absorption, LIVE STATE measured, DELTA MÍNIMO, EVIDÊNCIA, CONTRAPROVA, MESMO HEAD).
6. REGISTRA: dedicated receipt (AUREOLA-ROUND1-RECEIPT.md) in fabric dir with checkpoint.

Example outcome (2026-09-03): AUREOLA file created with plan text, linked, fixed point declared. See `references/garimpo-plan-absorption-aureola-20260903.md` for full transcript, commands, verification.

This is distributed-source absorption (plan as source), not new engine.

## Ciclo Único Operacional (from garimpo paste #4)

The garimpo paste provides the distilled operational contract for the single cycle. Embed and follow this exactly in FABLE LOOP absorption and reconciliation:

```
!CENTRALDARK #ACORDAR !CALIBRAR

Pega todas as peças já existentes desta missão — código, PRs, commits, branches, notas, BRAIN/Obsidian, GitHub, conectores, MCP, Hermes, SOUL, AURÉOLA, MULTIBÚSSOLA, PEGATUDO, testes, receipts e pendências — e transforma tudo em UM ÚNICO CICLO OPERACIONAL, sem criar V2/V3, sem segundo cérebro e sem abandonar legado.

Primeiro recupera a INTENÇÃO ATUAL DO CHEFE. Depois mede o estado vivo de cada superfície aplicável. Histórico serve como minério; estado atual manda.

O ciclo único é:

INTENÇÃO → 👑 AURÉOLA → #ACORDAR → !CALIBRAR → 👑 MULTIBÚSSOLA → PEGATUDO → MEDIR ESTADO VIVO → DEDUPE → RECONCILIAR → OWNER EXISTENTE → ONE WRITER → 👑 COSTURAR DELTA MÍNIMO → TESTAR → CONTRAPROVAR → REALITY JUDGE → SEMANTIC GREEN → CI DO MESMO HEAD → FIXED POINT → 👑 LOCK → REGISTRAR → HANDOFF → BOOT

Em cada fase, mostre no topo somente a telemetria necessária:
onde estamos → em qual eixo → para onde estamos indo → qual owner → qual próximo gate → qual estado da prova.

Toda peça encontrada deve terminar em uma destas classes: REUSE, ABSORB, SUPERSEDE, HISTORICAL, UNKNOWN ou REMOVE-CANDIDATE. Nada é apagado só porque parece redundante; primeiro prove que a capacidade já está preservada no sistema único.

Casa, GitHub, VPS, Desktop, Web, MCP, Telegram, Obsidian e demais superfícies não são sistemas diferentes. São braços do mesmo organismo. Cada braço mede e prova apenas aquilo que pertence ao seu território, mas todos obedecem ao mesmo contrato.

Quando existir conflito, não escolha “current” ou “incoming” cegamente. Leia a intenção dos dois lados, preserve capacidades compatíveis, elimine duplicação semântica e produza uma única versão reconciliada.

Para toda mutação material: registre antes de relatar ao CHEFE. O fechamento só pode começar com:
JÁ REGISTREI → owner → arquivo → commit SHA → HEAD → teste → contraprova → CI same-head → bloqueios restantes.

Se algo já atingiu Fixed Point real, vira 👑 READ-ONLY por padrão. Nova alteração exige intenção explícita do CHEFE e deve avisar que está reabrindo uma decisão anteriormente selada, preservando o LAST_GOOD_STATE.

UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
HISTORICAL != CURRENT
REACTION != PROOF
MODEL != IDENTITY
SURFACE != NEW_SYSTEM

Termine somente quando o próximo agente conseguir continuar sem adivinhar nada material.
```

See `references/ciclo-unico-operacional-paste4.md` for the exact source paste. Use this cycle as the master flow in all FABLE LOOP rendezvous, reconciliation and absorption steps. Update any local cycle descriptions to match this canonical version.

## 인간 역할

```
MACHINE_IS_EXTERNAL_MEMORY=true
CHEFE_IS_NOT_STATE_LOOKUP=true
SEARCH_BEFORE_ASK=true
IF_STATE_IS_DISCOVERABLE_BY_TOOLS → DISCOVER_IT
IF_ONLY_INTENT_OR_AUTHORITY_IS_MISSING → ASK_CHEFE
```

## Claude Code CLI 사용 (속도 향상)

대형 자율 작업에서 전체 컨텍스트 로드 대신 **Claude Code CLI 단계별 사용**:

```bash
claude -p '<단계별 프롬프트>' --allowedTools 'Read,Write,Bash,Edit' --max-turns 15 --model sonnet
```

사용자 "Claude Code CLI를 전체에 사용하라" 지시 시 특히 적용. 컨텍스트 절약, 속도 향상, 단계별 검증, 실패 시 재실행 용이.

## 기술 증명 경계

```
TECHNICAL_BOUNDARY = este pacote e seus Mermaid/PDF provam o contrato 
local e a integridade do artefato; não provam sozinho que Gemini, OAuth, 
GitHub ou centraldark-router estão READY no runtime vivo.
```

## 참고 파일

- `references/agi-self-improvement-archive.md`
- `references/distributed-sources-discovery.md`
- `references/garimpo-plan-absorption-aureola-20260903.md` (Auréola panel crystallization example)

## 관련 계약 (참조/구성)

- DELTAUNIFICADO (Google Drive) — FABLE LOOP 섹션
- CENTRALDARK-MASTER-PEGATUDO — 통합 계약
- RECONCILIAR-TOTAL.yml — 조정 계약
- ARCHITECTURE MASTER — 아키텍처
