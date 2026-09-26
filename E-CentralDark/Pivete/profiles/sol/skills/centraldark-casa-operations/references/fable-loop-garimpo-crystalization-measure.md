# FABLE LOOP MEASURE for Garimpo de Planos de Cristalização (ex: "plano de cristalização do sistema único")

When the garimpo material in GARIMPO-CHEFE (or equivalent) is for a "plano de cristalização do sistema único" or similar blueprint:

## MEASURE steps (execute in order, report raw)
1. Repo state (always first):
   - `cd <CentralDark clone>`
   - `git status --short | head -10`
   - `git branch --show-current`
   - `git rev-parse HEAD`
   - `git ls-remote origin main | head -1`
   - `git log --oneline -5 origin/main`
   - Check for required artifacts from the plan: `git ls-tree -r --name-only <branch> | grep -E "(AUREOLA|auréola|DELTA-CONTINUO)"`

2. Folder contents (garimpo):
   - `cd <GARIMPO-CHEFE>`
   - `ls -1 | grep -E "(plano|cristalize|AIOS|deep-research)" | head -15`
   - Specifically list: "Criar zip cristalize*", "AIOS*", the plan .docx/.pdf, deep-research*.md, cristalize*.html, receipt

3. Plan content:
   - Read .md version of the plan (deep-research-report (3).md or equivalent) with read_file offset/limit for key sections (Auréola, VERDE, 5 steps, UI contract, one brain N hands).
   - If .docx: use python docx extract (head -100).
   - Note: the plan text usually describes the current universal method (auréola + cadeado + semantic green + trigger-fabric + fixed point + multibússola + receipt).

4. Ports/runtime:
   - `netstat -ano | findstr ":8099 :8788 :9119 :3030 :8645"` or powershell equivalent.
   - Report LISTENING with PIDs.

5. Skills loaded:
   - Confirm bundle: centraldark-casa-operations, auto-destilador, autonomous-dependa-boot, centraldark-lupa-drift-guard + kimetsu-legacy-* + centraldark-handoff-pattern.

6. Cross-reference:
   - Plan requires specific files (e.g. AUREOLA-BAHIA-BIBLICA.yml at docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/) — check if present in tree.
   - Previous "Criar zip cristalize*.html" = historical garimpo attempts of the *same* plan (saved ChatGPT sessions).
   - AIOS watch.html = prior garimpo using the method (PEGATUDO → hash → dedupe → costura → PR).
   - Reconcile: plan == current method in DELTA-CONTINUO.md; AUREOLA often missing → candidate for delta.

## Reporting (concise, evidence first)
- State summary block: branch, HEAD, dirty count, key ports, folder key files, plan title, missing required artifacts from plan.
- Use for RECONCILIAR: the material is prior development of the *same* "sistema único" method already in DELTA-CONTINUO. Delta = absorb useful (plan text, prior attempts) via PEGATUDO/DEDUPE into owners (DELTA-CONTINUO, create AUREOLA if per plan), no V2/V3.
- "continue !" signal = advance loop phase (e.g. MEASURE → RECONCILIAR) without re-asking or full re-measure.

## Pitfalls
- Do not treat historical crystalize attempts as current state.
- Plan text may match the method in repo — measure to confirm (git grep, ls-tree).
- Missing AUREOLA in tree despite plan requiring it = gap for minimal delta.
- Dirty workspace on pr-1381 common — measure before assuming clean.
- Use "continue !" to keep autonomy in the loop until FIXED_POINT.

## Example from 2026-09-03 session
- Material: plan docx + deep-research (3).md + AIOS watch + multiple Criar zip cristalize + receipt.
- Repo: pr-1381 dirty, no AUREOLA, DELTA present.
- Report led directly to RECONCILIAR (plan reconciles to universal method, missing AUREOLA as candidate).

See also: references/cristalizacao-garimpo-chefe-20260902.md for prior crystalization example.