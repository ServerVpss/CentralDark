# Casa forensic trust map — 2026-09-03

## Purpose
How to classify “is this ours?” during multi-path forensic on the Casa PC, without promoting external narrative.

## Trust map (measure before promote)

| Asset | Verdict | Proof pattern |
|-------|---------|---------------|
| `http://127.0.0.1:8099/health` → `centraldark-omni-router` | 🟢 OURS | curl + owner `elite-gateway/scripts/centraldark_omni_router.py` |
| Screenpipe `:3030` | 🟢/🟡 runtime | curl `/health` (may flip healthy→degraded) |
| Profile `pivete` SOUL.md text HERMES-CASA | 🟢 identity | read file header; **icon is not identity** |
| `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\` | 🔴 not authority | isolated profile + chat HTML + AIOS Watch zips |
| AIOS/Synkra/BridgeMind forwards | 🔴 external candidate | fence: no secrets, no Writer |
| Hermes hub skill `building-adversary-infrastructure-tracking-system` | 🟡 hub, not Casa | AppData `hermes/skills/`; cancel Goal if not mission |
| Docker Desktop WSL minimal init | 🟢 local env | expected; not intrusion by default |
| Radeon `Videos\Radeon ReLive\unknown\*.png` | 🟡 historical visual | not current runtime proof |

## Dual Hermes config trap
- Active session often uses **profile** config: `...\profiles\pivete\config.yaml`
- Root `E:\CentralDark\Pivete\config.yaml` can lag (`fallback_providers: []`)
- Agent direct write to Hermes config may be **refused** → use `hermes config set`
- Fallback Casa (no NVIDIA key in chat):
  ```bash
  hermes config set fallback_providers '["centraldark-router"]'
  ```
- Provider base: `http://127.0.0.1:8099/v1` with models `nous/*:free` when listed

## External fence (CHEFE preference)
```
FORA = CANDIDATE
CASA = AUTHORITY
NO SECRETS IN CHAT/EMAIL
NO WRITER / NO PR ACCESS FOR OUTSIDERS
REUSE principle only (e.g. node --check), never import foreign branch-manager
```

## Process hygiene
- Many `Hermes.exe`: keep high-memory Desktop PIDs; light ~5MB often orphan CLI
- `taskkill` without elevation → exit 1; report PID list + admin one-liner
- Safe cache wipe: `hermes-agent/__pycache__`, `.pytest_cache`, `.pytest-cache`

## Forensic delivery format (CHEFE)
- Prefer **only** a 🟢/🟡/🔴 table + one-line notes
- No essay unless asked
- `UNKNOWN ≠ PASS`; historical HTML ≠ runtime

## Related open work (always remeasure)
- PR #1381: often CONFLICTING / dirty merge
- PR #1393: SOUL reanchor; may be MERGEABLE with failing gates
- TTS: Edge pt-BR until proven; avoid OpenAI ash + sk-or mismatch
