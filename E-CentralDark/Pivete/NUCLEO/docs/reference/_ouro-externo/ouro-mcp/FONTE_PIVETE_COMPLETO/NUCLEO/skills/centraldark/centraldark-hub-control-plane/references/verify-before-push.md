# Verify before push — not after

## What happened (2026-07-22)
The agent committed and pushed a branch + opened a PR draft, then a system reminder flagged
that no verification had actually been run. The agent had to re-run `tsc -b` + `vite build`
AFTER push. Wasteful and risky (a broken build could have been caught pre-push).

## Correct recipe (HUB monorepo)
```bash
cd apps/modulos/hub
npm install --no-audit --no-fund            # ~120 pkgs, 41s observed
npm install -D @types/node@^20               # tsconfig references node types; pre-existing gap
npx tsc -b                                   # typecheck — must EXIT 0
npx vite build                               # production build — must emit dist/ and EXIT 0
```

## Observed results (Missões extension)
- `tsc -b` → TSC_EXIT=0
- `vite build` → 1729 modules transformed, BUILD_EXIT=0, "✓ built in 7.02s"
- Pre-existing warnings (NOT from diff): chunk >500kB, dynamic import of `hub-client.ts`.

## Honest gap (state it, don't fake it)
The ROOT TelePanel project (`src/`) had no local `node_modules`; heavy typecheck of
`Sidebar.tsx` was skipped (install ~800MB). A 4-line change (`item.external` + `window.open`
in 2 handlers) is TS-valid by inspection. Document the gap in the report; never claim a green
root build you did not run.

## Production guard
NEVER `npx supabase db push` to production during a review-only mission. Migrations stay in
the PR for Pivete to apply after approval.
