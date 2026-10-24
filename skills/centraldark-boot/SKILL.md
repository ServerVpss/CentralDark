---
name: centraldark-boot
description: Execute CentralDark boot to align and verify HUD.
---

Use when you need to execute the CentralDark boot sequence (#acordar) to align system state, verify HUD, and produce a deterministic boot receipt. Procedure first, pitfalls attached to steps.

Procedure:
1. Discover and change to the actual CentralDark repository root; do not assume a fixed drive or folder. Verify the canonical boot file exists before running it (for example, search for `scripts/trigger-fabric/centraldark_full_trigger_boot.py`, then `cd` to the directory that contains `scripts/` and `CENTRALDARK_AI_BOOT.yaml`).
2. Execute the boot loader from that verified root with a minimal input: `python scripts/trigger-fabric/centraldark_full_trigger_boot.py boot --input '{}'`
   - Ensure you are using the Hermes-internal python (the one activated in the session). If you get "python: can't open file", stop and rediscover the repository root and exact relative path before retrying; do not reinterpret the missing file as a boot failure.
3. The script prints a JSON object (may be preceded/followed by logs). Locate the first line that starts with `{` and collect until the end of the output. Parse this JSON.
4. From the parsed JSON, extract the `hud` object and report the following fields in a concise summary:
   - COGNITIVE_BIOS_STATUS
   - COGNITIVE_MODE
   - FIXED_POINT_STATE
   - NEXT_CURSOR
   - CURRENT_OWNER
   - WRITER
   - EVIDENCE_STATE
   - ACTIVE_FRONTS
   Example format: `COGNITIVE_BIOS_STATUS: LOADED | COGNITIVE_MODE: ADAPTIVE | FIXED_POINT_STATE: NOT_PROVEN | ...`
5. Verify that `runtime_preflight_contract.status` equals `BOUND` and `canonical_consumption.status` equals `BOUND`. If either is not BOUND, treat the boot as blocked and output an exact blocker receipt containing the mismatched field and its value.
6. (Optional) Persist the full JSON to a file for later diff: `echo '<JSON>' > boot-last.json` (ensure proper escaping).
- The boot is considered successful when the HUD shows expected values and all contracts are BOUND; otherwise follow the blocker procedure defined in the CentralDark SOUL.
- Distinguish global boot currency from scoped artifact currency: a target subtree can be equal to `origin/main` while the checkout HEAD is stale. Report the subtree fixed point separately and keep the global boot claim blocked until the repository-level prerequisite is resolved.

Always-on rules:
- Token matching is case-insensitive; `!ACORDAR`, `#ACORDAR`, `acordar` in command position are equivalent.
- Prose mentions of the trigger (e.g., "let's acordar") do not activate the boot; only explicit command tokens do.
- `UNKNOWN` is not a pass; any missing or unproven field must be reported as a blocker with exact receipt.
- Reuse before create: if the boot output indicates `active: false` and the input fingerprint matches a previous proven run, the system will reuse the proven path instead of re-executing phases.
- One writer per scope: the boot procedure is read‑only; it does not mutate the repository or runtime state.
- User preference: present the HUD summary first, then offer the full JSON on request; avoid verbose dumps unless asked.

Pitfalls:
- Before step 2, locate the boot file from the live workspace and verify its repository root, canonical HUD source, and live checkout; scratch/cache copies are test artifacts, not proof of the repository boot. Hardcoded paths such as `/c/CentralDark` can point at a different checkout and produce a false setup diagnosis.
- When boot returns `FAIL_CLOSED` with `HUD_MAIN_SOURCE_MISSING_OR_LINK`, report the exact owner/mirror and `next_cursor`; do not substitute a screenshot, demo projection, or cached copy for the live HUD.
- When invoking from MSYS/Git Bash, wrap the JSON input in single quotes (`'{}'`) to prevent shell expansion; double quotes may cause premature variable expansion.
- Do not treat the output line `[terminal] ran ...` as part of the JSON; it is a meta‑log from Hermes and must be ignored when locating the JSON start.
- If the JSON appears truncated (e.g., cut off by the tool’s output limit), increase the char limit via the web_extract tool or re‑run with a larger buffer; never assume missing fields are false.
- The `source_sha256` map is informational; a missing entry does not block boot, but a mismatch between expected and actual source files should be investigated as a potential drift.

References:
- See `references/example-boot-output.md` for a sample JSON payload and how to extract the HUD.