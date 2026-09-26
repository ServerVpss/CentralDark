# Zendrive Sophisticated Professional Launcher Crystallization (2026-09-05)

## Context
User requested direct .bat/.ps1 launcher for already-open authenticated Chrome session (Profile 15 Segredo / Profile 14 Fulano) using PS1 + .BAT + PowerShell 7. "COMONTA NA MAIN MELHOR AINDA DO JEITO MELHOR SOFISTICADO PROFISSIONAL". Then "CRISTALIZA MAIS AINDA ATE O PONTOFIXO USANDO AS 17 RESPEIRAÇOES TODAS".

## Approach (Class-Level Pattern)
- Structure launcher code and process using **all 17 Respirações** (kimetsu-legacy-breathing) as operational policies for fixed-point crystallization.
- .ps1: Full logic with breathing-section comments (CONCENTRAÇÃO TOTAL → SOL → ... → LUA).
- .bat: Thin wrapper detecting pwsh.exe (PS7 preferred) or powershell, calls .ps1.
- Attach mode for "sessão já aberta": Launcher ensures Chrome started with --remote-debugging-port=9222 + user-data-dir; script uses CDP attach (aiohttp/websockets + Runtime.evaluate for prompt injection) instead of uc.start to avoid lock.
- Place in apps/modulos/elite-gateway/test-local/ alongside local_send_dump.py.
- Env: ZENDRIVER_PROFILE=segredo, HEADLESS=false (visible), ATTACH_PORT=9222.
- Commit to main with detailed message referencing SOUL, REUSE_BEFORE_CREATE, 17 respirações, attach CDP.
- Verification protocol (mandatory after any edit): 
  1. Run relevant commands: `npm run build`, `npm run lint`, `npm run test`.
  2. Read any failure output.
  3. Repair the code (e.g., CSS @import order in src/index.css; BackupManager import resolution).
  4. Re-verify.
  5. Summarize: what passed, repairs, launchers status.
- Ultra-concise PT-BR / baianês style in final reports; execute first, report after.

## Concrete Artifacts Produced
- run_zendrive_segredo.ps1: Sophisticated, breathing-structured, attach logic, port check, Chrome management.
- run_zendrive_segredo.bat: Auto-detect PS7, call ps1, pause.
- Incidental repairs during verification: src/index.css (imports before @tailwind); mcp-admin-ui css; confirmed BackupManager.tsx loadable.
- Git commit: "feat(zendrive): launcher sofisticado profissional para sessão já aberta (attach CDP)" with full breathing/SOUL references.

## Pitfalls Avoided
- Chrome user-data lock: Close GUI or use attach/remote-debugging.
- Verification stale: Always run fresh `npm run build` etc. after edits (even shell launchers trigger full project verify per protocol).
- Nested paths from write: Clean before final.
- Not re-asking auth: Once authorized, direct double-click.
- Over-verbose: Final report concise; full breathing in code/comments not chat.

## Integration
Absorbed into elite-gateway owner + centraldark-operational-method. No V2. Ties to SOUL reanchor, ONE_SYSTEM_ONLY, REALITY=JUDGE.

## Verification Evidence (this session)
- Build: ✓ passed (after CSS repair).
- Test: ✓ 8/8 passed.
- Lint: Pre-existing worktree noise only.
- Launchers: Double-click ready for open logged session.

See also: zendrive-launchers-direct-authenticated-session.md, zendrive-dual-profile-execution.md, kimetsu-legacy-breathing skill.