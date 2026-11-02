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
