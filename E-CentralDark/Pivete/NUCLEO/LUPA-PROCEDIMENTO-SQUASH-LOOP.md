# LUPA — PROCEDIMENTO EXPLÍCITO: SQUASH LOOP MÉTODO SUPERIOR

Registrado por: HERMES-CASA (tencent/hy3:free)
Autoridade: SEGREDO/CHEFE (PERMITO SEGREDO + "só faz")
Data: 2026-08-26

## BOOT CANÔNICO

!CENTRALDARK → #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA_META → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !REMEDIÇÃO → REALITY_JUDGE → !REGISTRA

## PRINCÍPIOS (MÉTODO SUPERIOR)

### 1. META LUPA (falsificação crítica)
- PR `MERGEABLE` medido via `gh` = FATO de ausência de conflito (não por fé).
- Checks `QUEUED` / `SKIPPED` / `PENDING` ≠ PASS. Nunca promover verde falso.
- Botão "Squash and merge" habilitado no GitHub = evidência de mergeabilidade real.
- `UNKNOWN` / `SKIPPED` / `PENDING` nunca viram PASS.
- Conflito (`CONFLICTING`) = bloqueio material, para o squash.

### 2. MULTIBÚSSOLA (rota canônica)
- Intenção: SEGREDO autorizou (PERMITO SEGREDO).
- Gate: sem conflito + botão habilitado = squash.
- Writer: GitHub merge (operação atômica, sem escrita concorrente).
- Não invasão: branch `dependabot/*` → `@dependabot rebase` (o dono do branch cura). Nunca push manual em branch alheio.
- Paz e amor: várias canetas (janelas/agentes) numa só direção. Não brigar por writer.

### 3. SELF-HEALING (auto-cura até FIXED POINT)
- Conflito → `@dependabot rebase` (auto-cura canônica).
- Loop re-avalia até `MERGEABLE`.
- FIXED POINT (8 critérios):
  1. objective_closed — PR integrado na main
  2. counterproof_survived — GitHub confirma merge sem revert
  3. invariants_hold — labels canônicas (👑 PERMITO-SEGREDO + 🧠 AGENTE-HERMES + categoria)
  4. no_material_unknown — estado do PR conhecido (MERGEABLE/CONFLICTING medido)
  5. no_new_failure — squash não quebrou main
  6. no_new_info — procedimento estável, sem surpresa
  7. no_candidate_beats_baseline — método atual é o melhor conhecido
  8. regression_denominator_passed — zero regressão em PRs anteriores

## LOOP AUTÔNOMO (background)

Script: `E:\CentralDark\Pivete\scripts\loop-squash-prs.sh`
Log: `E:\CentralDark\Pivete\NUCLEO\loop-squash-YYYYMMDD.log`

Comportamento por ciclo (60s):
- `MERGEABLE` → `gh pr merge --squash --delete-branch`
- `CONFLICTING` + `dependabot/*` → `gh pr comment "@dependabot rebase"`
- `CONFLICTING` + não-dependabot → SKIP (não invade)

## EVIDÊNCIA DESTA SESSÃO

- #1195 vite-plugin-pwa-1.3.0 → MERGED (imagem 7 provou botão verde)
- #1197 types/node → MERGED
- #1198 tanstack/react-query → MERGED
- #1199 tailwindcss/typography → MERGED
- #1203 fix/dependabot-canonical-labels → MERGED (labels corrigidas antes)
- #1201 eslint/js-9.39.5 → CONFLICTING → rebase solicitado, loop re-check

## REGRA DE OURO

Não perguntar. Executar. Provar. Registrar. Paz e amor, uma direção.
