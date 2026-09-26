---
name: trigger-chain-verification
description: Execute trigger chain to verify state and emit boot record.
version: 1.0.0
author: Hermes Agent
---
# Trigger Chain Verification Skill

## Purpose
Execute the standardized trigger chain to verify system state, reconcile context, and produce a boot record:
```
#ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !REMEDIÇÃO → !FIXED_POINT → !REGISTRA → !BOOT
```
This ensures operational alignment with the CentralDark contract before any mutation or decision.

**Note:** The master trigger (`#ACORDAR + !CALIBRAR + !MULTIBUSSOLA`) is inherited automatically on bot entry per the `CONTRACT.yml` vivo; the chain then continues internally through the remaining steps.

## When to Use
- At the start of any technical session.
- After a context reset, model change, or prolonged idle.
- When the user issues `#ACORDAR` or any trigger in the chain.
- Before performing writes, deploys, or irreversible actions.

## Steps
1. **#ACORDAR** – Recover real state (with `EVERY_INPUT_IS_RECONCILABLE`):
   - Measure local (workspace, repo, runtime, logs, PR status, desktop files, .overclock-app reference, screenpipe bridge, GitHub remote HEAD when available).
   - Do NOT assume state from memory or old prints; do NOT invent `PASS` for missing measurements (e.g., `git ls-remote` not executed = PENDING, not PROVEN).
   - Load LEIA-ME-IA.md, AGENTS.md, SOUL-SOL.md, CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json.
   - Load LEIA-ME-IA.md, AGENTS.md, SOUL-SOL.md, CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json.
   - Measure branch, HEAD, PR, runtime, writer, tools.
   - Record evidence in a temporary note.

2. **!CALIBRAR** – Align interpretation, authority, scope, tools, proof to recovered state.
   - Verify intent matches SEGREDO/CHEFE.
   - Confirm Writer = NONE (or authorized writer).
   - Ensure frequency is lowest sufficient.

3. **!MULTIBÚSSOLA** – Observe target across all material axes:
   - Historical (A1), Live Repository (A2), Writers/Owners/Locks (A3), Runtime/Tools/Connections (A4), Continuity/Delta Replay (A5).
   - Intent/Language (C1), Authority/Scope/Permission (C2), Capabilities/Owners/Reuse (C3), Proof/Risk/Counterproof (C4), Frequency/Engine/Cost/Latency (C5).
   - Detect conflicts; if any, raise blocker and stop.

4. **!META_LUPA** – Load MetaLupa skill and verify canonical identity via AUTOLUPA_CANONICAL_SHA.
   - Apply proportional falsification based on risk.
   - Ensure no false green.

5. **!RECONCILIAR** – Apply reconciliation-before-creation:
   - Search existing capabilities.
   - Open primary implementation.
   - Cross‑reference with request.
   - Reuse or extend minimally; create only with proven gap.

6. **!CONTRAPROVA** – Seek counterevidence for any claim.
   - If contradictory evidence appears, investigate or abort.

7. **!REMEDIÇÃO** – Measure post‑action state (T1) and compare to T0.
   - Compute real delta.
   - Verdict: PROVADO or NÃO PROVADO (no meio‑termo).

8. **!FIXED_POINT** – Verify fixed point reached:
   - No new material, no new failure, no new information.
   - No candidate beats baseline.
   - Regression denominator passed.

9. **!REGISTRA** – Record proof:
   - Create `CENTRALDARK_AI_BOOT.yaml` (or equivalent) with:
     - soul, governance, context_reconciliation, history_preservation.
     - source_of_truth, observed_evidence, alignment, role, writer, frequency, fronts.
   - Include hash/proof if applicable.

10. **!BOOT** – Emit the boot record as readiness signal for any agent or flow.

## Pitfalls
- Skipping any step risks operating on stale or misaligned context.


## Step 1 — Measure BEFORE assuming state

Before any trigger step fires, measure the actual process that is holding the port/service:

- Find the PID holding the service port (`netstat -ano | findstr :<PORT>` on Windows; `ss -tlnp | grep :<PORT>` on Linux).
- Confirm whether that process is the one you expect (path, parent, launch method), not just that something is listening.
- Check env inheritance: `ps -eo pid,args,e` / `psutil` / process environment inspection — the env var may be present in your shell but absent in the running daemon process.
- Check log tail for bind/import errors (requests missing from system Python vs present in venv, etc.).

**Learned this session:** Omni Router health showed `hermes.configured=false` repeatedly even after relaunch attempts because the env var `HERMES_BASE_URL` did not reach the process that binds port 8099. Shell env export + subprocess did NOT carry the var into the long-lived router process.

## Step 4 — Do not treat partial config signals as end‑to‑end proof

`hermes.configured` and transport endpoints are partial signals. Health may show the service alive while the engine is still unconfigured for the right reason (missing env var, wrong transport, missing dependency in the running interpreter). Do not promote PASS from `service: ok` alone — verify the engine's configured flag AND that the integration actually routes (/models, /chat/completions test if applicable).

## Step — Injection point matters (env var must reach the binding process)

When a long‑running daemon reads config from `os.environ` at module import time, the injection must happen **before the module is imported in the SAME process that will bind the port**. Two common failure modes seen this session:

1. Shell wrapper + subprocess: the wrapper exports vars, then `exec`s/subprocess‑launches the router — but if a prior process already holds the port and the new process fails to bind or is not the one that actually runs, the envs never reach the listening process.
2. Python launcher that imports the router module: the launcher must use the SAME Python interpreter the router expects (here: `requests` was present only in the Hermes venv Python, not the system Python), and must set `os.environ[...]` BEFORE `from centraldark_omni_router import app`.

Pattern that worked here:

- Use the Hermes venv Python (`/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe`) so dependencies (`requests`) resolve.
- Set `os.environ["HERMES_BASE_URL"]` and `os.environ["CENTRALDARK_DEFAULT_ENGINE"]` in the launcher **before** `import centraldark_omni_router`.
- Ensure the port is free for THIS process to bind (kill any prior listener that lacks the envs).
- After launch, verify `curl -s http://127.0.0.1:8099/health` and check the engine's `configured` flag specifically — not just `ok: true`.

Contraproof applied here: when health kept returning `hermes.configured=false`, the measured cause was env‑inheritance / interpreter mismatch, not the router module itself.

## Output
A verified boot record (`CENTRALDARK_AI_BOOT.yaml`) that can be consumed by downstream processes to guarantee `READ_ONLY` until Writer is authorized.

## References\n- See `references/trigger-chain-example.md` for a concrete session log.\n- See `references/router-verification.md` for checking router readiness.\n- See `templates/boot-record.yaml` for a starter boot file.