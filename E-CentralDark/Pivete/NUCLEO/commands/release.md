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

---

# COMANDO - release.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.github\workflows\release.yml
**SHA:** c9134f49db5669f9
**Timestamp:** 2026-08-28T02:02:28.998755
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: npm ci
- run: |
- run: |
- run: |
- run: |
- const recentRun = runs.data.workflow_runs.find(run =>
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Release
# Story 6.1 - Added concurrency

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag (e.g., v4.0.0)'
        required: true

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false  # Never cancel releases in progress

env:
  NODE_VERSION: '20'

permissions:
  contents: write
  actions: write

jobs:
  create-release:
    runs-on: ubuntu-latest
    outputs:
      release_id: ${{ steps.create_release.outputs.id }}
      upload_url: ${{ steps.create_release.outputs.upload_url }}
      version: ${{ steps.version.outputs.version }}
      tag: ${{ steps.version.outputs.tag }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Extract version from tag
        id: version
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            TAG="${{ github.event.inputs.tag }}"
          else
            TAG="${{ github.ref_name }}"
          fi
          VERSION=${TAG#v}
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "tag=$TAG" >> $GITHUB_OUTPUT

      - name: Generate changelog
        id: changelog
        run: |
          # Create a changelog based on recent commits
          echo "## 📋 What's New in v${{ steps.version.outputs.version }}" > CHANGELOG.md
          echo "" >> CHANGELOG.md
          
          # Get commits since last tag
          LAST_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
          if [ -n "$LAST_TAG" ]; then
            echo "### 🔄 Changes since $LAST_TAG:" >> CHANGELOG.md
            git log --pretty=format:"* %s (%h)" $LAST_TAG..HEAD >> CHANGELOG.md
          else
            echo "### 🎉 Initial Release Features:" >> CHANGELOG.md
            echo "* ✅ Complete Meta-Agent MVP and Framework Distribution" >> CHANGELOG.md
            echo "* 🔒 Security hardening with penetration testing" >> CHANGELOG.md
            echo "* ⚡ Performance optimization framework" >> CHANGELOG.md
            echo "* 📊 Privacy-conscious telemetry system" >> CHANGELOG.md
            echo "* 📦 Modular NPM package distribution" >> CHANGELOG.md
          fi
          
          echo "" >> CHANGELOG.md
          echo "## 📦 Installation" >> CHANGELOG.md
          echo "" >> CHANGELOG.md
          echo "| Package | Description | Installation |" >> CHANGELOG.md
          echo "|---------|-------------|--------------|" >> CHANGELOG.md
          echo "| [aios-core](https://www.npmjs.com/package/aios-core) | AI-Orchestrated System for Full Stack Development | \`npm install -g aios-core\` |" >> CHANGELOG.md

          echo "" >> CHANGELOG.md
          echo "## 🚀 Quick Start" >> CHANGELOG.md
          echo "" >> CHANGELOG.md
          echo "\`\`\`bash" >> CHANGELOG.md
          echo "# Install globally" >> CHANGELOG.md
          echo "npm install -g aios-core" >> CHANGELOG.md
          echo "" >> CHANGELOG.md
          echo "# Initialize in your project" >> CHANGELOG.md
          echo "aios init" >> CHANGELOG.md
          echo "\`\`\`" >> CHANGELOG.md

      - name: Create Release
        id: create_release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Create the release using GitHub CLI
          gh release create "${{ steps.version.outputs.tag }}" \
            --title "AIOS-FullStack ${{ steps.version.outputs.tag }}" \
            --notes-file CHANGELOG.md \
            --verify-tag || true
          
          # Get release info for outputs
          RELEASE_INFO=$(gh api repos/${{ github.repository }}/releases/tags/${{ steps.version.outputs.tag }})
          echo "id=$(echo "$RELEASE_INFO" | jq -r '.id')" >> $GITHUB_OUTPUT
          echo "upload_url=$(echo "$RELEASE_INFO" | jq -r '.upload_url')" >> $GITHUB_OUTPUT

  build-and-upload:
    needs: create-release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Prepare packages
        run: |
          # Create lib directories for packages that need them
          for pkg in .aios-core memory security performance telemetry; do
            if [ -d "$pkg" ]; then
              mkdir -p "$pkg/lib"
            fi
          done

      - name: Create distribution archive
        run: |
          VERSION="${{ needs.create-release.outputs.version }}"

          # Create output directory
          mkdir -p @synkra

          # Use tar with || true to ignore "file changed" warnings
          tar -czf @synkra/aios-core-${VERSION}.tar.gz \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=tests \
            --exclude='*.log' \
            --exclude='.github' \
            --exclude='*.tar.gz' \
            --exclude='*.zip' \
         
```

---

# COMANDO - release.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_meteor-decomp-develop\meteor-decomp-develop\.github\workflows\release.yml
**SHA:** d5352d1eaba3a393
**Timestamp:** 2026-08-28T11:50:56.967229
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: git fetch --tags --force --prune
- run: |
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Release

# Tag-only SemVer release automation — see issue #7.
#
# DESIGN: the annotated git tag `vX.Y.Z` is the SOLE source of truth. This repo
# has NO Cargo.toml and NO VERSION file, so there is nothing in the tree to
# rewrite. When a `develop` -> `master` release PR MERGES (or on a manual
# `workflow_dispatch`) this workflow:
#   1. reads the highest existing vX.Y.Z git tag,
#   2. bumps PATCH by default, or MINOR/MAJOR when the merged PR carried a
#      `release:minor` / `release:major` label,
#   3. creates + pushes the matching annotated vX.Y.Z tag on the merge commit
#      (NO commit is written back to the branch — only a tag),
#   4. publishes a GitHub Release with auto-generated notes, best-effort
#      appended with the current decomp progress (matched-function /
#      _rosetta file counts from tools/progress.py), and
#   5. announces the release to Discord (see docs/RELEASING.md).
#
# Why `pull_request_target` and NOT `push: branches: [master]`: a release PR is
# merged from `develop`, which is saturated with `[skip ci]` commits (the
# reconcile bot). A SQUASH merge folds all of those commit messages — `[skip ci]`
# included — into the squash commit's body, and GitHub then SKIPS every workflow
# for that push (it scans the HEAD commit message for skip markers). A
# `push: master` trigger therefore silently never fires for a squash-merged
# release. `pull_request_target` keys off the PR-merge EVENT, not the pushed
# commit, so it is immune to `[skip ci]` and fires for any merge method
# (squash / merge / rebase). `workflow_dispatch` is a manual fallback (e.g. to
# cut a release that a skipped push missed).
#
# SAFETY: despite `pull_request_target`, this workflow NEVER checks out or runs
# PR head code — it checks out `master` and only reads git tags + the merged PR's
# labels — so the usual `pull_request_target` code-execution risk (running
# attacker-controlled code with secrets in scope) does not apply.
#
# Why NO PAT: unlike the sibling Garlemald-Server/Client release workflows, this
# workflow pushes ONLY a tag (never a commit back to the branch). Tag pushes are
# not gated by branch protection (only commits to the branch are), so the default
# GITHUB_TOKEN (github.token) can push the tag AND create the Release even though
# `master` is protected — no fine-grained RELEASE_PAT is required.
#
# Why NO loop guard: nothing is committed back to `master`, so there is no
# re-trigger to guard against. The tag push creates no PR-close event and matches
# no trigger here, so it cannot re-run this workflow. We deliberately add NO
# bot-identity `if` guard and NO `[skip ci]` marker.
on:
  # Fire when a PR INTO master MERGES (a develop -> master release). For
  # pull_request_target, `branches` filters the BASE (target) branch, so only
  # master-targeting PRs match; the job `if` further requires merged == true.
  pull_request_target:
    types: [closed]
    branches: [master]
  # Manual fallback: cut a release on demand (e.g. recover a skipped push). Always
  # checks out + releases master HEAD regardless of the ref it is dispatched from.
  workflow_dispatch: {}

# Serialize releases so two quick merges produce monotonic tags (the second run
# waits for the first to push its tag, then computes the next from it).
concurrency:
  group: release
  cancel-in-progress: false

permissions:
  # Push the annotated tag + create the GitHub Release.
  contents: write
  # Needed for the commits/{sha}/pulls label lookup below. Specifying
  # `permissions` sets every unlisted scope to `none`, so this must be explicit
  # or the lookup 403s and every release silently falls back to a patch bump.
  pull-requests: read

jobs:
  release:
    # Release only when a PR actually MERGED into master (skip closed-without-merge),
    # or on a manual dispatch. The pull_request_target `branches` filter already
    # restricts to master-targeting PRs; the base.ref check is defense-in-depth.
    if: >-
      github.event_name == 'workflow_dispatch' ||
      (github.event.pull_request.merged == true &&
       github.event.pull_request.base.ref == 'master')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout master (full history + tags; default token can push a tag)
        uses: actions/checkout@v6
        with:
          # A merged pull_request_target/closed event means master already
          # contains the merge commit, so `ref: master` checks out the release
          # HEAD to tag. master is protected, but we only push a TAG (not gated by
          # branch protection), so the default GITHUB_TOKEN suffices — no RELEASE_PAT.
          token: ${{ github.token }}
          fetch-depth: 0
          ref: master

      - name: Fetch all tags
        run: git fetch --tags --force --prune

      - name: Determine bump level from the merged PR's labels
        id: level
        env:
          GH_TOKEN: ${{ github.token }}
          REPO: ${{ github.repository }}
        run: |
          set -euo pipefail
          # Re
```