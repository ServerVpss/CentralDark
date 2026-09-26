# Health check 127.0.0.1 refused (ERR_CONNECTION_REFUSED)

**Signal**: User opens browser → `127.0.0.1:8788/health` → "connection refused".

**Root cause**: The `/health` endpoint is **strictly local** to the machine running the daemon. It is not exposed on the network and is not meant to be reached from another machine's browser.

## Correct verification paths (in order)

1. Inside Hermes chat (preferred):
   ```bash
   terminal curl http://127.0.0.1:8788/health
   ```
   Expect: `{"proved": true, "watcher_active": true, ...}`

2. From the exact same Windows machine that is running Hermes:
   - PowerShell: `curl http://127.0.0.1:8788/health -UseBasicParsing`
   - cmd: `curl http://127.0.0.1:8788/health`

3. Browser on the **same machine** only. If you are on a different machine (RDP, another PC, phone), it will refuse.

## What "proved: true" actually means
- Daemon process is alive
- Watcher thread is active
- It has processed files since last start (`processed_count`)
- Recent files landed in NUCLEO/ (commands/, contracts/, etc.)

Health returning `proved:true` + recent NUCLEO files = job is running.
Health alone + empty NUCLEO + "pasta lotada" = ignore patterns or no `scan_existing`.

## Quick triage when user reports "não está rodando"

```bash
# 1. Is the process even there?
ps aux | grep auto_destilador | grep -v grep

# 2. Health (from inside Hermes)
terminal curl http://127.0.0.1:8788/health

# 3. Recent crystals
ls -lt E:/CentralDark/Pivete/NUCLEO/commands | head -5
ls -lt E:/CentralDark/Pivete/NUCLEO/docs/history/downloads | head -5

# 4. Watch path actually being watched (from skill or log)
# Should contain the exact "PASTA DO CHEFE JOGA ARQUIVOS..." path
```

## Common false negatives

- Daemon was started with a different Python (uv python without watchdog) → process dies silently or never starts observer.
- Watch path in skill points to a folder the user thinks is "the lotada one", but the real heavy folder has a slightly different name.
- All heavy files are `.zip`/`.pdf`/`.html` and were previously ignored by `ignore_patterns`.
- User is checking health from a different machine/browser.

## Fix pattern

```bash
# Force a foreground run to see logs
cd E:/CentralDark/Pivete/skills/auto-destilador
python scripts/auto_destilador.py
# (or background with proper daemon robust wrapper)
```

Never treat "browser refused" as "daemon broken". Treat it as "wrong verification method". Always cross-check with process list + recent NUCLEO output.
