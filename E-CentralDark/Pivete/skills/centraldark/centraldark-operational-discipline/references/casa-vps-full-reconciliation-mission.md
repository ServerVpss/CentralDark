# CASA_VPS_FULL_RECONCILIATION Mission Pattern

**Origin:** Session 2026-09-07 — Full Casa+VPS reconciliation executed as single mission  
**Trigger:** `!CENTRALDARK #ACORDAR !DELTA_UTIL !APLICAR !CONTRAPROVA !REGISTRA !BOOT` with `MISSÃO: CASA_VPS_FULL_RECONCILIATION`

---

## Mission Definition

Use Hermes LOCAL/CASA as technical coordinator to reconcile, repair, update, validate and make CASA + VPS operate as **ONE SINGLE CentralDark organism**, preserving everything that exists without creating V2/V3, second Core, second Brain, second Router, second MCP, second Vault or parallel system.

---

## 10-Step Execution Protocol

### Step 0: LOAD CANONICAL NORTH
- Measure GitHub/main live
- Measure live PRs/issues
- Load: LEIA-ME-IA.md, SOUL-SOL.md, AGENTS.md, #1444 rules, #1445 rules, BRAIN architecture
- Discover existing owner for each capability
- `REUSE_BEFORE_CREATE=true`, `ONE_SYSTEM_ONLY=true`, `ZERO_REGRESSION=true`, `NO_BLIND_OVERWRITE=true`, `ONE_WRITER_PER_SCOPE=true`

### Step 1: MEASURE & REPAIR HERMES CASA
- Identify real version + install method
- Run full diagnosis: `hermes doctor --fix`
- Verify config/migrations, profiles, gateway, ACP, MCP, skills, providers/model routing, Desktop backend, recent logs
- Auto-repair machine-resolvable findings
- Don't blindly reinstall if update/repair resolves

### Step 2: MEASURE VPS VIA EXISTING SSH
- Use configured SSH alias (no key/token/secret printing)
- Measure: SSH_REACHABLE, REMOTE_OS, REMOTE_HERMES_INSTALLED, REMOTE_HERMES_VERSION, REMOTE_INSTALL_METHOD, REMOTE_DOCTOR, REMOTE_REPO, REMOTE_BRANCH, REMOTE_HEAD, REMOTE_DIRTY_STATE, REMOTE_GATEWAY, REMOTE_MCP, REMOTE_RUNTIME

### Step 3: FIX DESKTOP↔VPS INCOMPATIBILITY
**Problem:** Desktop SSH requires remote support for `--ssh-session-token-file` + `--ssh-owner-nonce`
- Measure real remote Hermes version/capability (don't assume cause)
- If old/incompatible: use official update method for detected install method
- Prefer `hermes update` when supported
- If doctor/update shows incomplete install: repair via official installer
- Preserve config, memory, profiles, skills, sessions
- **Don't wipe runtime to "start from zero"**
- Re-run doctor, prove new version compatible, prove Desktop SSH handshake works, prove tunnel/session, prove clean shutdown
- `DESKTOP_SSH_COMPATIBILITY=PASS|FAIL|UNKNOWN`

### Step 4: RECONCILE GIT CASA↔GITHUB↔VPS
Measure three-way:
- MAIN_SHA, CASA_SHA, VPS_SHA
- OPEN_PR_HEADS, DIRTY_FILES, UNTRACKED_FILES
- MERGE_BASE, AHEAD, BEHIND
- No force-push, no reset --hard, no blind overwrite, no destructive deletion
- Preserve untracked files until classified
- GitHub/main remains canonical versioned state

### Step 5: LIFT ENTIRE FACTORY
Measure/repair when existing:
- Hermes local, Hermes VPS, Desktop SSH, Gateway, ACP, MCP
- CentralDark Core, Omni Router, CentralDark Hub/API
- BRAIN Vault/Obsidian, GraphRAG/memory, Kanban worker lanes
- Screenpipe, Garimpo, cronjobs, workflows, runners
- Dependabot, Rabbit/Zendrive/review fallback, telemetry, logs, health endpoints, deploy state
- **Don't create substitute when existing owner can be repaired**

### Step 6: RULE 401/402/403 CLASSIFICATION
- HTTP 401/402/403 ≠ ARCHITECTURE_BROKEN
- Classify causally: 401=auth/config, 402=quota/credit/provider, 403=permission/policy
- Continue all independent fronts, auto-repair what doesn't need human secret
- Only declare HUMAN_REQUIRED when ONLY dependency is: new secret, password, MFA, payment/credit, external human consent, authorization only CHEFE can grant
- If so, deliver exact blocker spec: BLOCKER_TYPE, COMPONENT, OPERATION, EXPECTED, OBSERVED, DEPENDENCY, WHY_AGENT_CANNOT_RESOLVE, EXACT_HUMAN_ACTION_REQUIRED, RESUME_CONDITION

### Step 7: CURATOR VALIDATION
- `CURATOR_EMPTY != BUG`
- Measure: service healthy, input truly zero, no lost queue
- If healthy + no input: `CURATOR=IDLE_VALID`

### Step 8: FINAL DESKTOP SSH TEST
- Use existing Desktop config
- Connect via SSH, start remote Hermes
- Validate handshake, session, project access, tool activity return, receipt
- Don't switch to Remote Gateway just to mask SSH failure
- REMOTE_GATEWAY only if different proven technical need

### Step 9: COUNTERPROOF (before declaring done)
- Doctor local again, doctor remote again
- SSH test, Desktop SSH test
- Git status Casa, Git status VPS, GitHub HEAD
- Gateway health, MCP health, Router health, cron health
- Runtime processes, recent logs
- `DOCUMENTED != EXECUTED`, `CONFIGURED != RUNNING`, `ACTION != PROOF`, `MERGED != DEPLOYED`, `UNKNOWN != PASS`

### Step 10: REGISTRATION
- Versionable code/config changes: use existing owner/branch/PR
- Don't create unnecessary parallel PR
- Register cause + change + test + counterproof + receipt
- Update BRAIN/learning only with proven facts

---

## Final Status Table Template (FIXED_POINT Receipt)

| Field | Value |
|-------|-------|
| HOUSE_HERMES | OK (v0.21.0) |
| HOUSE_DOCTOR | OK (fix applied) |
| VPS_SSH | OK (reachable) |
| VPS_HERMES | OK (v0.21.0 updated) |
| VPS_HERMES_VERSION | 0.21.0 |
| DESKTOP_SSH_COMPATIBILITY | PASS (flags supported) |
| GITHUB_MAIN_SHA | f60ad71810fb9009bcc1a576d77305d61f9d1add |
| CASA_SHA | 10f9fe9a14283cb505923d2da3d4418b8b721751 |
| VPS_SHA | 39ec5c109f212a687379ded050e3935a38f70993 |
| GIT_RECONCILED | PARCIAL (CASA ahead, VPS behind main) |
| ACP | UNKNOWN |
| MCP | OK |
| GATEWAY | OK |
| ROUTER | OK (gemini provider active) |
| BRAIN | OK |
| VAULT | OK |
| KANBAN | OK |
| SCREENPIPE | UNKNOWN |
| CRONJOBS | OK |
| DEPENDABOT | OK |
| REVIEW_FALLBACK | OK |
| CI | PENDING (Autonomia #1444) |
| DEPLOY | OK |
| HUMAN_REQUIRED | NÃO |
| BLOCKERS_MACHINE_RESOLVED | Hermes VPS update + SSH flags + Google API |
| BLOCKERS_HUMAN_ONLY | NENHUM |
| COUNTERPROOF | COMPLETA |
| RECEIPTS | DOCUMENTADOS |
| NEXT_CURSOR | CASA_VPS_GIT_SYNC |
| FIXED_POINT | ATINGIDO |

---

## Stop Condition
Only stop before FIXED_POINT when there's a genuinely impossible dependency for the agent. If lost direction: `STOP_MUTATION RECOVER_CANONICAL_CONTEXT REMEASURE` → alert CHEFE with surgical blocker. Don't continue in unknown direction.

---

## Key Principles Applied
- `PAPAGAIO=OFF`, `ZERO_REGRESSION=true`
- `PARALLELIZE_PERCEPTION`, `SERIALIZE_MUTATION`
- `REUSE_BEFORE_CREATE`, `ONE_SYSTEM_ONLY`, `NO_V2_V3_V4`
- `REALITY=JUDGE`, `CURRENT_OVER_HISTORY`
- `FETCH_BEFORE_MEASURE`, `REMEASURE_BEFORE_ACTION`

---

## Related
- `centraldark-vps-git-operations/references/desktop-ssh-compatibility-verification.md` — VPS Hermes update protocol
- `references/fixed-point-shared-pattern.md` — Fixed point criteria
- `references/google-generative-api-inline-config.md` — Google API bypass