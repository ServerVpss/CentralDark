# GATE-0 — Structured Local Mission Pattern (proven 2026-07-24)

When Pivete hands a mission file with PHASES + GATES + a PROIBIDO list (casa-only,
no VPS/cloud/deploy/restart), use this shape. It was validated end-to-end on the
pivete Windows home machine.

## Non-negotiable gates (from the annex class)
- Casa first; no VPS, no cloud, no deploy, no GitHub remote write.
- No automatic gateway restart (even if config changed — STOP for Pivete).
- No secret in chat, no `.env` value, no `state.db` with creds in backup.
- No second Hermes / second profile / second skill / second memory architecture.
- Runtime beats doc: if `hermes --version` disagrees with the annex's stated
  version, the installed binary wins. (Seen: annex said 1.0.0; real was 0.19.0.)
- Question is NOT authorization (separate R0 from R1+).

## Phase sequence that worked
0. **Prove single local runtime.** `hermes --version` + `wmic process` tree.
   Register LOCAL_PRODUCTION_HERMES_COUNT=1. If !=1 → BLOCKED, do not kill.
1. **Sanitized backup** outside active paths:
   `E:\CentralDark\backups\HERMES-GATE0-PRE-<ts>\` with only config.yaml,
   SOUL.md, memory trees (HOJE/SEMANA/REGRAS), skills-list.txt, MANIFEST.
   Generate SHA256 of the bundle. NEVER include `.env`/secrets/creds/state.db.
2. **Read-only provider inventory.** `env | sed 's/=.*/=<REDACTED>/'` for
   PRESENCE only. Health-test each free/included provider with a 1-token prompt
   (measures latency + confirms HEALTHY). Do NOT inject errors by mutating `.env`
   (annex forbids credential edits) — mark error-injection tests as NOT_EXECUTED.
3. **Minimal native correction.** Prefer `hermes --profile pivete config set KEY VAL`
   over file edit (patch/write_file REFUSES config.yaml). Re-read the file after.
4. **Idempotent 3-cycle test** of the memory destiller (see template below).
   Prove SEMANA non-empty, REGRAS stable, ORIGIN_LOCKED untouched, no duplicates
   across cycles.
5. **STOP for Pivete review.** Emit the report in the annex's exact FASE-10 block
   format. State RESTART_REQUIRED=SIM but RESTART_EXECUTED=NAO.

## Cron native trap
`cronjob create script=` rejects absolute/disk paths (e.g. `E:\CentralDark\...`).
Copy the script to `C:\Users\danda\AppData\Local\hermes\scripts\` and pass the
bare filename. Keep the NÚCLEO copy for version control; the scripts/ copy runs.

## Idempotent 3-temperaturas destiller (template — copy & adapt)
Canonical location: `E:\\CentralDark\\Pivete\\NUCLEO\\motor\\03-memoria\\destilar-3-temp.sh`
plus `~/.hermes/scripts/destilar-3-temp.sh` (cron copy).

Hard rules that survived 7 revisions (v4 was BROKEN — see pitfall 1l/1m below):
- **Move, don't copy:** datable HOJE lines leave HOJE and enter SEMANA; HOJE keeps
  only what stays open. Re-running must not re-append.
- **Dedupe by exact line, against SEMANA AND against the current batch** (M02-fix):
  before appending to SEMANA, `grep -qF` the content against SEMANA AND against a
  per-run temp; skip if present. A HOJE with 2 identical lines sends 1 (not 2) to
  SEMANA. (v4 only deduped against SEMANA, so a same-HOJE duplicate slipped through.)
- **Promote to REGRAS only lines whose SECTOR is `[regra]`** — use `grep -E "\\[regra\\]"`,
  NOT a bare substring like `REGRA` (it false-matches "REGRAS" inside other lines).
  Mark promoted lines with `[PROMOVIDO-<ts>]` so re-runs skip them.
- **Never touch `hermes-mente/memoria/`** (ORIGIN_LOCKED). It stays empty/intact.
- **CRLF-safe:** strip a trailing `\r` from every read line (`line="${line%$'\r'"`),
  because fixtures written by Python on Windows arrive as `\r\n`.
- **Temp files in `C:/tmp/...` (not `/tmp`)** — see pitfall 1k.
- **No `set -e`; keep `set -uo pipefail`** and guard the grep-pipe with `|| true`,
  because `grep` returns 1 on no-match and `set -e` would abort the whole run.

Verified-working v7 body (this is what lives at the canonical path as of 2026-07-24):
```bash
#!/usr/bin/env bash
# Destilador idempotente das 3 Temperaturas — GATE-0 (v7: a prova de set -e/pipefail, temp em C:/tmp)
set -uo pipefail
BASE="E:/CentralDark/Pivete/NUCLEO/motor/03-memoria/memoria"
HOJE="$BASE/HOJE.md"; SEMENA="$BASE/SEMANA.md"; REGRAS="$BASE/REGRAS.md"
TS=$(date '+%Y-%m-%d %H:%M')
TMP="C:/tmp/gate0_dst_tmp"; mkdir -p "$TMP"
T_HOJE="$TMP/hoje.tmp"; T_SEM="$TMP/sem.tmp"; T_REG="$TMP/reg.tmp"
cp "$HOJE" "$T_HOJE" 2>/dev/null || : > "$T_HOJE"
cp "$SEMANA" "$T_SEM" 2>/dev/null || : > "$T_SEM"
cp "$REGRAS" "$T_REG" 2>/dev/null || : > "$T_REG"
if [ -s "$T_HOJE" ]; then
  : > "$TMP/sem_cand.tmp"; : > "$TMP/hoje_keep.tmp"
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    [ -z "$line" ] && continue
    case "$line" in
      \[[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*) echo "$line" >> "$TMP/sem_cand.tmp" ;;
      *) echo "$line" >> "$TMP/hoje_keep.tmp" ;;
    esac
  done < "$T_HOJE"
  if [ -s "$TMP/hoje_keep.tmp" ]; then cp "$TMP/hoje_keep.tmp" "$HOJE"; else : > "$HOJE"; fi
  : > "$TMP/sem_uniq.tmp"
  if [ -s "$TMP/sem_cand.tmp" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      line="${line%$'\r'}"
      [ -z "$line" ] && continue
      if ! grep -qF "$line" "$T_SEM" 2>/dev/null && ! grep -qF "$line" "$TMP/sem_uniq.tmp" 2>/dev/null; then
        echo "$line" >> "$TMP/sem_uniq.tmp"
      fi
    done < "$TMP/sem_cand.tmp"
  fi
  if [ -s "$TMP/sem_uniq.tmp" ]; then
    { echo ""; echo "## $TS (destilado de HOJE)"; cat "$TMP/sem_uniq.tmp"; } >> "$T_SEM"
  fi
fi
if [ -s "$T_SEM" ]; then
  grep -E "\[regra\]" "$T_SEM" 2>/dev/null | while read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    if ! grep -qF "$line [PROMOVIDO" "$T_REG" 2>/dev/null; then
      echo "$line [PROMOVIDO-$TS]" >> "$T_REG"
    fi
  done || true
fi
cp "$T_SEM" "$SEMANA"; cp "$T_REG" "$REGRAS"
echo "DESTILACAO OK (idempotente v7): $TS" >&2
```

## Isolated memory-test harness (proven pattern — fixes the false-FAIL trap)
The first harness used 3 *shared* cycles and cross-contaminated cases (M13 zerando
HOJE no meio do ciclo sujava M03). Pivete required: fixture limpa por caso, nenhuma
ordem, M13 não altera estado de M03, restaurar snapshot após cada caso. The working
shape:
- Snapshot the live tree (`HOJE/SEMANA/REGRAS`) to `C:/tmp/gate0_snap` once.
- For each case M01..M20 × 3 ciclos: write a FRESH fixture to a throwaway worktree
  `C:/tmp/gate0_wt`, run the destiller via the **explicit git-bash**
  (`C:/Program Files/Git/bin/bash.exe`), assert, then (optionally) restore.
- After all cases: copy the snapshot back and assert SHAs match before/after.

CRITICAL harness pitfalls (all hit this session):
- **Invoke `C:/Program Files/Git/bin/bash.exe`, NOT `bash`** — see pitfall 1j.
  `subprocess.run(["bash", ...])` hits the WSL stub and the destiller never runs.
- **Use `C:/tmp/gate0_wt` for fixtures AND destiller temp** — see pitfall 1k.
  `/tmp` means different directories to Python vs MSYS bash.
- **Write fixtures with `newline="\n"` or accept CRLF** and strip `\r` in the script
  (the v7 destiller does the stripping). Python `open(path,"w").write()` on Windows
  emits `\r\n`; if the script does not strip `\r`, `case`/match patterns still work
  but temp-file `grep -qF` comparisons can mismatch on the trailing byte.
- **Do NOT set `set -e` in the destiller** when a `grep | while` pipe can legitimately
  find nothing — see pitfall 1m.

Minimal isolated-run snippet (Python):
```python
import os, subprocess, shutil, hashlib
BASH_EXE = "C:/Program Files/Git/bin/bash.exe"
WT = "C:/tmp/gate0_wt"; shutil.rmtree(WT, ignore_errors=True); os.makedirs(WT)
# copy destiller, rewrite BASE/HOJE/SEMANA/REGRAS to WT
w(W_HOJE, fixture_hot()); w(W_SEM, fixture_warm()); w(W_REG, "")
rc = subprocess.run([BASH_EXE, f"{WT}/dist.sh"], capture_output=True, text=True, errors="replace").returncode
# assert T-HOT in SEMANA, T-COLD in REGRAS, etc.
```

## Verification that mattered
- SEMANA byte count identical across cycles 2 and 3 ⇒ idempotent.
- `T-CONFLICT-001` (no `[regra]` sector) stayed OUT of REGRAS; `T-COLD-CANDIDATE-001`
  (has `[regra]`) promoted exactly once.
- `hermes-mente/memoria/HOJE.md` stayed 0 bytes ⇒ origin lock respected.
- 4/4 providers HEALTHY on real 1-token call (nous, hermesone, gemini, openrouter).
- Harness isolated: M01..M20 × 3 cycles, RESTORE_OK=True (live-tree SHAs identical
  before/after). False FAILs from shared-cycle contamination eliminated.
