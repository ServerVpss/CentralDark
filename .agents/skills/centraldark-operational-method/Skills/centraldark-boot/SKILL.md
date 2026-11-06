---
name: centraldark-boot
description: Execute CentralDark boot to align and verify HUD.
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

Use when you need to execute the CentralDark boot sequence (#acordar) to align system state, verify HUD, and produce a deterministic boot receipt. Procedure first, pitfalls attached to steps.

Procedure:
1. Bind the request to ServerVpss/CentralDark@main. Discover the active checkout root from the session (for example, git rev-parse --show-toplevel); do not assume C:\\CentralDark or another fixed drive. Verify that the root contains CENTRALDARK_AI_BOOT.yaml and scripts/trigger-fabric/centraldark_full_trigger_boot.py, and that HEAD matches a fresh git ls-remote origin refs/heads/main before claiming the contract is current.
2. Execute the boot loader from that verified checkout with a minimal input: python scripts/trigger-fabric/centraldark_full_trigger_boot.py boot --input '{}'. When --repo is omitted, the loader discovers its own root from its file location.
   - Ensure you are using the Hermes-internal python (the one activated in the session). If you get "python: can't open file", verify the path uses forward slashes and that you are in the correct directory.
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
5. Verify that runtime_preflight_contract.status equals BOUND and canonical_consumption.status equals BOUND. If either is not BOUND, report its exact value. A missing Hermes checkpoint blocks only mission resumption; it must not hide the canonical contract readback. HUD failure blocks operational continuation but must still return the already-read canonical state. Never claim that Hermes applied the contract in its active session without session-level evidence.
6. (Optional) Persist the full JSON to a file for later diff: `echo '<JSON>' > boot-last.json` (ensure proper escaping).
7. Classify canonical loading and mission resumption separately. CANONICAL_MAIN_LOADED_RESUME_BLOCKED means the current contract was read but mission continuation remains blocked; LOCAL_CONTRACTS_READ_CONTROL_PLANE_BLOCKED means the readback is available but current-main/HUD binding is unproven. Neither status proves Hermes applied the contract to an active session.

Always-on rules:
- Token matching is case-insensitive; `!ACORDAR`, `#ACORDAR`, `acordar` in command position are equivalent.
- Prose mentions of the trigger (e.g., "let's acordar") do not activate the boot; only explicit command tokens do.
- `UNKNOWN` is not a pass; any missing or unproven field must be reported as a blocker with exact receipt.
- Reuse before create: if the boot output indicates `active: false` and the input fingerprint matches a previous proven run, the system will reuse the proven path instead of re-executing phases.
- One writer per scope: the boot procedure is read‑only; it does not mutate the repository or runtime state.
- User preference: present the HUD summary first, then offer the full JSON on request; avoid verbose dumps unless asked.

Pitfalls:
- Before step 2, verify the resolved checkout is the current ServerVpss/CentralDark@main; a stale or unidentified checkout is not the canonical source.
- When invoking from MSYS/Git Bash, wrap the JSON input in single quotes (`'{}'`) to prevent shell expansion; double quotes may cause premature variable expansion.
- Do not treat the output line `[terminal] ran ...` as part of the JSON; it is a meta‑log from Hermes and must be ignored when locating the JSON start.
- If the JSON appears truncated (e.g., cut off by the tool’s output limit), increase the char limit via the web_extract tool or re‑run with a larger buffer; never assume missing fields are false.
- The `source_sha256` map is informational; a missing entry does not block boot, but a mismatch between expected and actual source files should be investigated as a potential drift.
- Boot can FAIL_CLOSED when a file is marked `git update-index --assume-unchanged`: it disappears from `git status` but still differs from the pinned main SHA. Re-enable tracking with `git update-index --no-assume-unchanged <file>` and re-run boot; do not treat the hidden drift as a pass. `ASSUME_UNCHANGED` is not `CLEAN`."

References:
- See `references/example-boot-output.md` for a sample JSON payload and how to extract the HUD.

## 🔧🛠️ Forja Viva no boot — política transversal, não bot específico (2026-10-15)

**Owner preservado:** este boot é o ponto de entrada **read-only** de contexto e contratos; não cria executor, serviço, scheduler ou gatilho novo. A política transversal é a skill `.agents/skills/centraldark-operational-method/SKILL.md`; o catálogo de aliases visuais é `docs/CONSCIENCIA/PADRAO-EMOJIS.md`; o espelho para Hermes é `.agents/skills/skill-synchronization/SKILL.md`. Telegram, MCP, VS Code, Claude/Hermes e cockpit **consomem** a mesma política conforme suas capacidades; não copiar regras divergentes em cada bot.

**BOOT_READBACK / anexos opcionais ao receipt existente:** registrar a referência de `MAIN_SHA` e owner da política, versão/sha do catálogo visual, `SKILL_SYNC` (`UNKNOWN|SYNCED`), `ACTIVE_SESSION_LOAD` (`UNKNOWN|PROVEN`), `OWNER_LOCK`, `NEXT_CURSOR`. Ausência desses campos no JSON do loader **não** autoriza inventar resultado; o boot antigo permanece compatível e um futuro adapter deve evoluir o owner do schema existente com teste. `SYNCED != LOADED != EXECUTED`.

**🍒🎰🎲 Outra melhoria antecipada:** propor o menor delta útil, reaproveitar owner e comprovar antes de promover. **🧹:** consultar receita de faxina em `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`; classificar `KEEP_ACTIVE` em checkout dirty/divergente e nunca disparar limpeza pelo boot. **🔧🛠️👨🏻‍🔧👀👁️🪡🎄🌞🌟✨☄️🔥🪛⚒️🎰🎲🫀🫆🧠:** aliases são interface para selecionar receitas, **não shell commands**, e exigem resolução de owner + permissões + dry-run/prova. O boot nunca faz merge/deploy, nunca interrompe escritor ativo e não assume controle de terminal por detectar uma janela.

**Critério de integração em Telegram ou qualquer porta:** carregar política/catálogo por versão canônica ou cache local verificado; apresentar o mesmo estado no cockpit; ações são delegadas apenas ao executor autenticado e com escopo. Offline: continuar com snapshot local comprovado, registrar receipt pendente e reconciliar sem sobrescrever mudanças divergentes quando reconectar.

## Conteudo complementar unificado - Michelin/Kimetsu 2026-11-02

### Incrementos incorporados da instalacao mae

1. Change to the CentralDark repository root. In Hermes terminal, run: `cd /c/CentralDark` (or `cd C:\CentralDark` if using Windows paths).
2. Execute the boot loader with a minimal input: `python scripts/trigger-fabric/centraldark_full_trigger_boot.py boot --input '{}'`
5. Verify that `runtime_preflight_contract.status` equals `BOUND` and `canonical_consumption.status` equals `BOUND`. If either is not BOUND, treat the boot as blocked and output an exact blocker receipt containing the mismatched field and its value.
7. The boot is considered successful when the HUD shows expected values and all contracts are BOUND; otherwise follow the blocker procedure defined in the CentralDark SOUL.
- Before step 2, verify that the file `scripts/trigger-fabric/centraldark_full_trigger_boot.py` exists and is executable; otherwise the error "python: can't open file" is a setup issue, not a boot failure.

### Incrementos incorporados da instalacao hermes

1. Discover and change to the actual CentralDark repository root; do not assume a fixed drive or folder. Verify the canonical boot file exists before running it (for example, search for `scripts/trigger-fabric/centraldark_full_trigger_boot.py`, then `cd` to the directory that contains `scripts/` and `CENTRALDARK_AI_BOOT.yaml`).
   - If the canonical local root is unavailable, measure `git ls-remote <canonical-url> refs/heads/main`, create an isolated read-only evidence checkout with `git clone --filter=blob:none --no-checkout --depth=1 --branch main`, and use `git show HEAD:<path>` to materialize only the boot/checkpoint files and their declared dependencies. This proves `main` content, not a live checkout or runtime.
   - Run checkpoint status/verify and the boot only after the required files and dependencies have been materialized; otherwise report `UNKNOWN/BLOCKED` rather than treating a missing file or import as a canonical boot result.
2. Execute the boot loader from that verified root with a minimal input: `python scripts/trigger-fabric/centraldark_full_trigger_boot.py boot --input '{}'`
   - Ensure you are using the Hermes-internal python (the one activated in the session). If you get "python: can't open file", stop and rediscover the repository root and exact relative path before retrying; do not reinterpret the missing file as a boot failure.
5. Verify that `runtime_preflight_contract.status` equals `BOUND` and `canonical_consumption.status` equals `BOUND`. If either is not BOUND, treat the boot as blocked and output an exact blocker receipt containing the mismatched field and its value.
- The boot is considered successful when the HUD shows expected values and all contracts are BOUND; otherwise follow the blocker procedure defined in the CentralDark SOUL.
- Distinguish global boot currency from scoped artifact currency: a target subtree can be equal to `origin/main` while the checkout HEAD is stale. Report the subtree fixed point separately and keep the global boot claim blocked until the repository-level prerequisite is resolved.
## Continuity-trigger preflight
When boot is entered through an explicit continuity trigger (`!CENTRALDARK`, `#ACORDAR`, or `!CALIBRAR`), run the existing entry owner before HUD work. In a fresh installation with no checkpoint, require the entry owner to return `NO_VERIFIED_CHECKPOINT` without fabricating a mission, receipt, or cursor; bootstrap is proven only when an explicit first checkpoint operation can then create and verify a checkpoint in an isolated root:
```bash
python3 scripts/hermes/centraldark-entry.py --status
python3 scripts/hermes/verified-checkpoint.py verify --mission latest
```
Require the preflight to return the latest verified checkpoint and `HASH_CHAIN_PASS`; then perform a read-only reconciliation of `HEAD`, `origin/main`, porcelain status, checkpoint owner, writer lock, and runtime readiness. Preserve a dirty checkout and report it as `DIRTY_PRESERVED`; do not switch checkouts or overwrite unrelated work. Emit the recovered contract as `INTENT_ID | GOAL | OWNER | MAIN_SHA | ACTIVE_WRITER | RECEIPT | NEXT_CURSOR`, using `UNKNOWN` for fields absent from the persisted checkpoint rather than manufacturing values.
Test each trigger in a fresh process and compare the recovered mission, receipt, integrity result, and cursor. A successful process exit is not sufficient if the JSON readback differs, is missing, or the boot ran before continuity recovery. If checkpoint recovery fails, fail closed before HUD/dispatch work and return the exact blocker. Do not interpret this clean bootstrap result as a permanent lock: perform the explicit first-run checkpoint probe separately, after the read-only no-history assertion, and read it back from a new process.
Do not invoke `status`, `verify`, or `resume` from inside a checkpoint writer operation: the writer lock makes nested reads legitimately unavailable. Release the writer, then read back from separate processes. Resolve entrypoint executors from `Path.home()` or `PATH`, never a hardcoded `/root` path, so portability does not change the authority being read.
- Before step 2, locate the boot file from the live workspace and verify its repository root, canonical HUD source, and live checkout; scratch/cache copies are test artifacts, not proof of the repository boot. Hardcoded paths such as `/c/CentralDark` can point at a different checkout and produce a false setup diagnosis.
- When the local root is unavailable, an isolated filtered clone plus `git show` is valid for measuring `main` and validating canonical source content, but never upgrade that evidence to `HEAD`, live runtime, or operational boot proof.
- When boot returns `FAIL_CLOSED` with `HUD_MAIN_SOURCE_MISSING_OR_LINK`, report the exact owner/mirror and `next_cursor`; do not substitute a screenshot, demo projection, or cached copy for the live HUD.
