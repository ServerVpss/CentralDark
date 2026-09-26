---
name: centraldark-hub-control-plane
description: "Integrate, extend, or audit the CentralDark HUB control plane. Covers the existing HUB React app (apps/modulos/hub), its Supabase project (lyoigsqluyktoclwdaft), the Lovable/cockpit HUB button, and the MetaLupa 'extend, don't create V2' discipline for HUB work."
version: 1.0.0
platforms: [windows]
metadata:
  hermes:
    tags: [centraldark, hub, supabase, lovable, cockpit, control-plane]
    related_skills: [meta-lupa, hermes-casa-pivete]
---

# CentralDark HUB Control Plane

## Overview

The "HUB" is NOT something to build from scratch. It already exists as a React app and
is the canonical control plane for CentralDark. This skill prevents the recurring failure
of spinning up a "second HUB" / V2 when the mission really wants a small extension of the
existing one (MetaLupa principle 11: preserve and evolve, don't duplicate).

## Canonical facts (verified 2026-07-22)

- **HUB app:** `apps/modulos/hub/` — Vite + React + Tailwind, integrated with Supabase
  `lyoigsqluyktoclwdaft`. Deployed at `https://hub.centralldark.com`.
- **Supabase project:** `lyoigsqluyktoclwdaft` (CentralDark, São Paulo). CLI: `npx supabase`
  (v2.84.4 observed); link with `npx supabase link --project-ref lyoigsqluyktoclwdaft`.
- **HUB client:** `apps/modulos/hub/src/integrations/supabase/hub-client.ts` (anon key
  hardcoded — pre-existing pattern, not introduced by extensions).
- **HUB tabs (existing):** Dashboard, Hermes, Gateway, Catálogo, Políticas, Conectores,
  Abacus, Auditoria. Each tab = `src/components/<area>/<Area>Tab.tsx` + a `use<Area>` hook
  in `src/hooks/`.
- **HUB migrations:** `apps/modulos/hub/supabase/migrations/` (pattern: idempotent
  `CREATE TABLE IF NOT EXISTS` + RLS `select authenticated, all service_role`).
- **HUB edge functions:** `apps/modulos/hub/supabase/functions/` (pattern copied from
  `hub-create-api-key` — JWT auth, `has_role` admin check, service_role write, audit log).
- **Lovable/cockpit button:** the app-ROOT `src/shared/layout/Sidebar.tsx` had a
  "Hub Segurança" item pointing at the DEAD route `/hub` (removed from root `App.tsx`).
  The fix is an EXTERNAL link to `https://hub.centralldark.com` (opens in new tab), not a
  new embedded route. Handler must check `item.external` and call
  `window.open(item.path, '_blank', 'noopener,noreferrer')`.

## Extension discipline (do this, not V2)

1. **Add a tab:** create `src/components/<area>/<Area>Tab.tsx` + `src/hooks/use<Area>.ts`
   (copy the `usePolicies`/`useAudit` pattern), register the trigger + content in `HubPage.tsx`.
2. **Add state:** new migration with idempotent tables + RLS + `api.*` compat views; reuse
   existing tables (`api.policies`, `api.audit_log`, `oauth_connections`, `catalog_tools`).
3. **Add a command surface:** edge function in `supabase/functions/` modeled on
   `hub-create-api-key` (auth → scope → audit → insert). Never run long tasks inside the fn.
4. **Never** recreate the HUB, the Supabase project, or the cockpit as a parallel structure.

## Protected-area note

`apps/modulos/hub/` is a PROTECTED area in `CLAUDE.md §9.2` (consolidated 05/07/2026).
Editing it requires explicit Pivete authorization ("PERMITO PIVETE" or exact scope). A
mission that says "integrate the HUB" without that phrase is a material conflict → STOP-WRITE
until authorized. Non-destructive extension was authorized 2026-07-22 with "PERMITO PIVETE
SEM AÇÃO DESTRUTIVAS".

## Verification recipe (run before push/PR)

```bash
cd apps/modulos/hub
npm install --no-audit --no-fund          # ~120 pkgs, 41s observed
npm install -D @types/node@^20             # tsconfig references node types; pre-existing gap
npx tsc -b                                 # typecheck — must exit 0
npx vite build                             # production build — must emit dist/ and exit 0
```

- `tsc -b` green + `vite build` green were both achieved for the Missões extension
  (1729 modules transformed, BUILD_EXIT=0). Warnings about chunk >500kB and dynamic import
  of `hub-client.ts` are PRE-EXISTING, not from the diff.
- **Gap (document, don't fake):** the ROOT TelePanel project (`src/`) has no `node_modules`
  locally; heavy typecheck of `Sidebar.tsx` was skipped (install ~800MB). A 4-line change
  (`item.external` + `window.open` in 2 handlers) is TS-valid by inspection — state the gap
  honestly in the report; never claim a green root build you didn't run.
- NEVER `npx supabase db push` to production during a review-only mission — migrations stay
  in the PR for Pivete to apply after approval.

## Workflow pitfalls (user corrections — embed, don't relearn)

1. **PARE DE PROCURAR ARQUIVOS SOLTOS.** When a canonical skill source is named as a
   **git tree path** (`origin/pivete/dev:.agents/skills/<nome>/SKILL.md`), do NOT keep
   hunting the filesystem for loose `.md` / `.lnk` / downloaded copies. Resolve it to the
   fixed local destination `E:\CentralDark\Pivete\CentralDark\.agents\skills\<nome>\`,
   recover via `git checkout <remote> -- <path>` onto a work branch, then extend IN PLACE.
   No `V2`, no second skill, no parallel file, no `E:\CentralDark` root save.
2. **Authorization flow.** Protected area (CLAUDE.md §9.2) needs literal "PERMITO PIVETE"
   (or exact scope). Once the user says "CONFIRMO" / "VÁ ATÉ O FIM", finish the merge
   without re-asking — do not loop back for consent on a step already authorized.
3. **git add -A breaks on junk `NUL`.** In this repo a 95-byte untracked `NUL` file makes
   `git add -A` fail (`short read while indexing NUL`). Stage explicit paths instead.
4. **Don't claim 100% when the harness blocks re-verification.** If a consent gate blocks
   re-running a test, report the blocker honestly; never seal "verified" on an un-run check.

## References

- `references/hub-architecture.md` — full map of HUB tabs, hooks, migrations, edge functions.
- `references/verify-recipe.md` — exact commands, expected output, and known pre-existing warnings.
- `references/lupa-skill-lookup-pitfall.md` — histórico da armadilha de identidade; a referência operacional vigente é somente `meta-lupa` em `origin/main`, com a correção de arquivos soltos e o workaround de junk files no `git add -A`.
- `references/verify-before-push.md` — run `tsc -b` + `vite build` BEFORE push, not after; documents the honest root-build gap.
