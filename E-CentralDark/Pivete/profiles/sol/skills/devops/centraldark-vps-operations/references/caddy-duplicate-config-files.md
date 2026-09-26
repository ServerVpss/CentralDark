# Duplicate Caddy Config Files — Orphaned and Active

Session 2026-08-28. Two files for the same domain:

## Files
- `/etc/caddy/centraldark-root.Caddyfile` (one L) — ORPHAN, not imported anywhere
- `/etc/caddy/centralldark-root.Caddyfile` (two Ls) — ACTIVE, imported by main Caddyfile

## Why it matters
The orphan file confuses diagnosis. Agent may read the wrong file and conclude wrong config.

## Lesson
Always check imports (`grep import /etc/caddy/Caddyfile`) to find which config files are ACTIVE vs orphaned.
