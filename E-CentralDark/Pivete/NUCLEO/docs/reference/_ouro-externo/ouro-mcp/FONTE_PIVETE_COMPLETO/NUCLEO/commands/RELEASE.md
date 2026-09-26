# COMANDO - RELEASE.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\packages\screenpipe-mcp\RELEASE.md
**SHA:** 31ea479307f66336
**Timestamp:** 2026-08-23T14:17:19.551206
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:

### Ouro Bruto (primeiros 5000 chars)
```
# Releasing `screenpipe-mcp`

Publishing is a **GitHub Actions job**, not a local command: it needs the
`NPM_TOKEN` repo secret. No developer machine is expected to hold npm
credentials for this package.

---

## 0.19.0 — release notes (pending publish)

**Headline: `team-*` tools can finally be pointed at a customer's own query
gateway.** Orgs on the write-only archive tier keep telemetry in their own
object storage, served by a gateway inside their network; the hosted API has no
read path to that data. Before this release the base URL was a hardcoded
constant, so `team-search` / `team-devices` / `team-records` registered and then
failed with **HTTP 401** for every such org, and the only workaround was running
this MCP from source.

- `--team-api-url` flag, `SCREENPIPE_TEAM_API_URL` env var, and `gateway_url`
  in `~/.screenpipe/enterprise.json` now select the team API base, in that
  precedence order, falling back to `https://screenpi.pe/api/enterprise/v1`
  (`src/team-config.ts`).
- The token is unchanged (`sk_ent_…` via `SCREENPIPE_ENTERPRISE_TOKEN` or
  `team_api_token`); only the base moves.
- The HTTP transport no longer reports a frozen `0.14.0` as its version — both
  transports and the Sentry release tag now read `package.json` through
  `src/version.ts`.
- README documents the whole knob, including which install paths cannot reach a
  gateway yet.
- The release path now inspects its own artifact. `scripts/assert-pack-contents.js`
  (`npm run verify:pack`) runs in the step before `npm publish` and fails the
  release if the tarball is missing `dist/team-config.js` / `dist/version.js`, if
  a built file lost the override strings, or if the team API base is a hardcoded
  literal again — the exact shape of the 0.18.15 artifact. The `.mcpb` bundle gets
  the same treatment right after `mcpb pack`.

**Why 0.19.0 and not 0.18.16.** npm's `0.18.15` was built from a tree that
predated `src/team-config.ts`, and nobody bumped `package.json`, so the registry
and the repo both claimed "0.18.15" on two different trees. The version string
is the only handle support has on "which build is the customer running", so the
replacement must be unmistakable rather than one character away from the broken
one: `0.19.x` = has the gateway knob, `0.18.x` = does not. It is also the
semver-correct level, since this adds user-facing surface rather than fixing a
defect in shipped behaviour. Nothing depends on this package through a semver
range — every consumer in the monorepo uses `screenpipe-mcp@latest` — so the
minor bump changes no resolution.

**Known gaps that this release does NOT close** (documented under "Known limits"
in the README):

- Precedence step 3 needs the desktop app: it is the only writer of
  `gateway_url` into `~/.screenpipe/enterprise.json`, and only for a signed-in
  admin. On a server or CI box, set the env var or the flag by hand.
- The `.mcpb` bundle's `manifest.json` has no `user_config`/`env` block, so the
  Claude Desktop extension install has no UI for these variables.
- The `--http` transport still exposes `search_content` only; `team-*` is
  stdio-only.

---

## Before releasing

1. **The source commit must be on `main`.** `src/team-config.ts` arrived with
   PR #5400 (`feat(enterprise): write-only archive + customer-run query
   gateway`). Publishing from a feature branch ships a tree nobody reviewed as
   `latest`. Confirm — this asks whether the *file* is on `main`, not whether a
   particular sha is an ancestor, so it stays correct when the PR is squash- or
   rebase-merged and commit `930020705` ceases to exist:
   ```bash
   git fetch origin
   git cat-file -e origin/main:packages/screenpipe-mcp/src/team-config.ts 2>/dev/null \
     && echo "team-config.ts is on main — safe to release" \
     || echo "NOT on main — do not release"
   ```
2. **The version must not already be on npm.** `release-mcp.yml` now *fails* in
   that case instead of skipping quietly, but check first so you don't burn a
   run:
   ```bash
   node -p "require('./package.json').version"   # repo
   npm view screenpipe-mcp version               # registry — must differ
   ```
3. **Local gates green** (also enforced by `.github/workflows/test-mcp.yml`):
   ```bash
   cd packages/screenpipe-mcp
   bun install --frozen-lockfile
   bun run typecheck
   bun run build
   bun run test
   npm run verify:pack   # what the tarball would actually contain
   ```
   `verify:pack` is the same gate `release-mcp.yml` runs in the step immediately
   before `npm publish`, so a green run there means the artifact was checked, not
   assumed. It fails if `dist/team-config.js` / `dist/version.js` are missing from
   the pack list, if a built file lost `SCREENPIPE_TEAM_API_URL` / `--team-api-url`,
   or if the team API base is back to a hardcoded literal. `npm pack --dry-run`
   writes nothing and needs no npm auth, so it is safe to run anywhere.

## Publishing

Two equivalent triggers. Tag push is preferred — the tag is then a real record
of
```

---

# COMANDO - RELEASE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\packages\screenpipe-mcp\RELEASE.md
**SHA:** 31ea479307f66336694ec7fcfc7b64848dd3ae806a2df7b0647948687896f56c
**Timestamp:** 2026-08-23T23:44:15.040861
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:

### Ouro Bruto (primeiros 5000 chars)
```
# Releasing `screenpipe-mcp`

Publishing is a **GitHub Actions job**, not a local command: it needs the
`NPM_TOKEN` repo secret. No developer machine is expected to hold npm
credentials for this package.

---

## 0.19.0 — release notes (pending publish)

**Headline: `team-*` tools can finally be pointed at a customer's own query
gateway.** Orgs on the write-only archive tier keep telemetry in their own
object storage, served by a gateway inside their network; the hosted API has no
read path to that data. Before this release the base URL was a hardcoded
constant, so `team-search` / `team-devices` / `team-records` registered and then
failed with **HTTP 401** for every such org, and the only workaround was running
this MCP from source.

- `--team-api-url` flag, `SCREENPIPE_TEAM_API_URL` env var, and `gateway_url`
  in `~/.screenpipe/enterprise.json` now select the team API base, in that
  precedence order, falling back to `https://screenpi.pe/api/enterprise/v1`
  (`src/team-config.ts`).
- The token is unchanged (`sk_ent_…` via `SCREENPIPE_ENTERPRISE_TOKEN` or
  `team_api_token`); only the base moves.
- The HTTP transport no longer reports a frozen `0.14.0` as its version — both
  transports and the Sentry release tag now read `package.json` through
  `src/version.ts`.
- README documents the whole knob, including which install paths cannot reach a
  gateway yet.
- The release path now inspects its own artifact. `scripts/assert-pack-contents.js`
  (`npm run verify:pack`) runs in the step before `npm publish` and fails the
  release if the tarball is missing `dist/team-config.js` / `dist/version.js`, if
  a built file lost the override strings, or if the team API base is a hardcoded
  literal again — the exact shape of the 0.18.15 artifact. The `.mcpb` bundle gets
  the same treatment right after `mcpb pack`.

**Why 0.19.0 and not 0.18.16.** npm's `0.18.15` was built from a tree that
predated `src/team-config.ts`, and nobody bumped `package.json`, so the registry
and the repo both claimed "0.18.15" on two different trees. The version string
is the only handle support has on "which build is the customer running", so the
replacement must be unmistakable rather than one character away from the broken
one: `0.19.x` = has the gateway knob, `0.18.x` = does not. It is also the
semver-correct level, since this adds user-facing surface rather than fixing a
defect in shipped behaviour. Nothing depends on this package through a semver
range — every consumer in the monorepo uses `screenpipe-mcp@latest` — so the
minor bump changes no resolution.

**Known gaps that this release does NOT close** (documented under "Known limits"
in the README):

- Precedence step 3 needs the desktop app: it is the only writer of
  `gateway_url` into `~/.screenpipe/enterprise.json`, and only for a signed-in
  admin. On a server or CI box, set the env var or the flag by hand.
- The `.mcpb` bundle's `manifest.json` has no `user_config`/`env` block, so the
  Claude Desktop extension install has no UI for these variables.
- The `--http` transport still exposes `search_content` only; `team-*` is
  stdio-only.

---

## Before releasing

1. **The source commit must be on `main`.** `src/team-config.ts` arrived with
   PR #5400 (`feat(enterprise): write-only archive + customer-run query
   gateway`). Publishing from a feature branch ships a tree nobody reviewed as
   `latest`. Confirm — this asks whether the *file* is on `main`, not whether a
   particular sha is an ancestor, so it stays correct when the PR is squash- or
   rebase-merged and commit `930020705` ceases to exist:
   ```bash
   git fetch origin
   git cat-file -e origin/main:packages/screenpipe-mcp/src/team-config.ts 2>/dev/null \
     && echo "team-config.ts is on main — safe to release" \
     || echo "NOT on main — do not release"
   ```
2. **The version must not already be on npm.** `release-mcp.yml` now *fails* in
   that case instead of skipping quietly, but check first so you don't burn a
   run:
   ```bash
   node -p "require('./package.json').version"   # repo
   npm view screenpipe-mcp version               # registry — must differ
   ```
3. **Local gates green** (also enforced by `.github/workflows/test-mcp.yml`):
   ```bash
   cd packages/screenpipe-mcp
   bun install --frozen-lockfile
   bun run typecheck
   bun run build
   bun run test
   npm run verify:pack   # what the tarball would actually contain
   ```
   `verify:pack` is the same gate `release-mcp.yml` runs in the step immediately
   before `npm publish`, so a green run there means the artifact was checked, not
   assumed. It fails if `dist/team-config.js` / `dist/version.js` are missing from
   the pack list, if a built file lost `SCREENPIPE_TEAM_API_URL` / `--team-api-url`,
   or if the team API base is back to a hardcoded literal. `npm pack --dry-run`
   writes nothing and needs no npm auth, so it is safe to run anywhere.

## Publishing

Two equivalent triggers. Tag push is preferred — the tag is then a real record
of
```