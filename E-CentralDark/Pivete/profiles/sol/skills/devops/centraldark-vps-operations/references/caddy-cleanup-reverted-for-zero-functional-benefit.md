# Caddy Cleanup Reverted — Zero Functional Benefit (2026-08-28)

## Context

During VPS housekeeping, the agent proposed removing 7 dead Caddy declarations:
- `bridge.centralldark.com` (respond 503)
- `builder.centralldark.com` (:5174 — dead Vite)
- `status.centralldark.com` ghost ports (4189, 8790, 9400)
- `gateway.centralldark.com` (:3100 — dead MultiZap)
- `bot.Caddyfile` import

## What happened

1. Agent backed up Caddy configs
2. Removed 7 declarations
3. Fixed `elite.centralldark.com`: 8080 → 8082
4. `caddy validate` passed
5. `caddy reload` succeeded
6. All tested domains returned 308 (redirect to HTTPS)

## Why it was reverted

The CHEFE applied the **"extensão segura, nunca substituição"** filter:

> "Toda alteração deve ser extensão segura, nunca substituição — apagar declaração é remoção, o oposto do que o fio exige. E o ganho é cosmético: rota morta não consome recurso, não degrada nada, não causa incidente. Só incomoda a vista. Risco não-zero, benefício funcional zero. Reprovado no meu próprio critério."

**Key principle:** When the functional benefit is zero (cosmetic cleanup only) and the risk is non-zero (recarrouting Caddy serving 19 domains including MCP), the change is NOT justified.

## When removal IS justified

- Service crashing with no fix
- Security (leak, exposed credential)
- Real duplication causing wrong behavior
- Explicit CHEFE order with defined scope

## Lesson

The agent's instinct was to "clean up" — but the CHEFE's filter is conservative: **preserve, don't hygienize**. A dead route doesn't consume resources, doesn't degrade anything, doesn't cause incidents. It only offends the eye. Not worth the risk.

## Correct pattern for future Caddy changes

1. Measure all domains → backends
2. Classify: alive / dead by nature / ghost port / wrong port
3. Apply filter: "Does this change EXTEND something, or does it REMOVE/SUBSTITUTE?"
4. If removal: "Is the functional benefit > 0?"
5. If zero benefit: DON'T TOUCH
6. If wrong port (like elite 8080→8082): this IS a fix (regression correction), not cleanup — justified

## Related pitfalls discovered in this session

### 1. awk cross-file leak (parser bug)

When extracting routes with `grep -A10 'domain' /etc/caddy/*.Caddyfile`, awk can leak domain names between files if multiple Caddyfiles match. This caused the agent to wrongly conclude builder and elite were swapped.

**Always read each Caddyfile in full, not parse multiple at once.** See `references/caddy-duplicate-config-files.md`.

### 2. SPA routing (path layers ≠ subdomains)

`centralldark.com` is one SPA with client-side routing (`try_files {path} /index.html`). Path layers are NOT separate backends. See `references/spa-routing-not-subdomains.md`.

### 3. Duplicate Caddy config files

Two files for same domain: `centraldark-root.Caddyfile` (one L, orphaned) vs `centralldark-root.Caddyfile` (two Ls, active). Always check imports to find which is active. See `references/caddy-duplicate-config-files.md`.
