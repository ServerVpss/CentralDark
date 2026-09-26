# Hermes cron por profile (Casa Windows / pivete)

## Same queue across surfaces
For profile `pivete`, one job list:

- Disk: `%LOCALAPPDATA%\hermes\profiles\pivete\cron\jobs.json`
- Ticker: gateway process of that profile (`hermes -p pivete gateway status`)
- UI: `http://127.0.0.1:9119/cron?profile=pivete` (page may 200; API may 401 — trust CLI)
- CLI: `hermes -p pivete cron list|status|run|pause|resume`

Default profile uses a **different** home: `%LOCALAPPDATA%\hermes\cron\`.

Official docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/cron

## Ticker ON ≠ jobs present
Live signals of engine only:

- `ticker_heartbeat` / `ticker_last_success` updating
- `cron status`: “Gateway is running — cron jobs will fire”
- `executions.db` may exist empty of useful history

If `jobs.json` is missing:

```text
hermes cron list → No scheduled jobs
```

That is empty queue, not a dead scheduler.

## Known pivete jobs (backup 2026-08-02)
Restored 2026-08-04 from `_backup-perfil-20260802\profiles\pivete\cron\jobs.json` (same SHA as state-snapshot):

| name | schedule | mode | script |
|------|----------|------|--------|
| atualizar-mapa-hermes | every 360m | no_agent | atualizar-mapa-hermes.py |
| atualizar-manual-sessao | 0 */6 * * * | no_agent | atualizar-manual-sessao.py |
| gateway-watchdog | */5 * * * * | no_agent | gateway-watchdog.py |
| GATE0-destilar-3-temp | every 360m | agent | destilar-3-temp.py |

Scripts live under `profiles\pivete\scripts\`. Thin `.sh` often `exec` canon under `E:\CentralDark\Pivete\NUCLEO\...`.

## Restore procedure (safe)
1. Backup current `cron\` if any.
2. Copy backup `jobs.json` → `profiles\pivete\cron\jobs.json`.
3. Clear runtime locks: `fire_claim=null`, unpause if needed, keep `enabled=true`.
4. **Restagger `next_run_at`** to now+minutes (old July timestamps cause immediate multi-fire).
5. Confirm scripts exist on disk.
6. `hermes -p pivete cron list` → N active.
7. Optionally `hermes -p pivete cron run <one no_agent job>`.
8. Fix wrappers if rc≠0 before leaving.

## Windows no-agent wrapper pitfalls
Python wrappers that do:

```python
subprocess.run([bash, r"C:\Users\...\script.sh"])
```

often get **rc=1 and empty stdout/stderr** under Git Bash.

Prefer MSYS path:

```text
/c/Users/danda/AppData/Local/hermes/profiles/pivete/scripts/foo.sh
```

or `Path.as_posix()` + drive → `/c/...`.

## Bash `set -euo pipefail` + empty grep
In `atualizar-mapa-hermes.sh`, this dies when key absent:

```bash
MEM_LIMIT_REAL="$(grep 'memory_char_limit:' "$CONFIG" | grep -oE '[0-9]+' | head -1)"
```

Fix (minimal):

```bash
MEM_LIMIT_REAL="$(grep ... | grep -oE '[0-9]+' | head -1 || true)"
MEM_LIMIT_REAL="${MEM_LIMIT_REAL:-?}"
```

Same for optional `grep -qi` chains: append `|| true` when non-match is valid.

## Proof checklist
```text
[ ] jobs.json exists, 4 names, enabled true
[ ] hermes -p pivete cron status → 4 active + gateway running
[ ] wrappers: mapa/manual/watchdog rc 0
[ ] mapa job: last run ok after pipefail fix
[ ] dashboard /cron?profile=pivete page loads (optional)
```

## Related Casa paths
- Manual LEIA: `E:\CentralDark\Pivete\NUCLEO\MANUAL-SESSAO-19-07-2026\LEIA-PRIMEIRO.md`
- BOOT: `...\BOOT-IA.md` (ações → `historico\acoes.jsonl`)
- Map target: `NUCLEO\motor\10-observabilidade\MAPA-HERMES-19-07-2026.md`
