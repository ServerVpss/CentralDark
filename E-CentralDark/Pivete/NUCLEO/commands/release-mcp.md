# COMANDO - release-mcp.yml
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\release-mcp.yml
**SHA:** c347820a4befa35a
**Timestamp:** 2026-08-23T14:15:49.224934
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: npm install
- run: npm run build
- run: cp ../../LICENSE.md .
- run: npm run verify:pack
- run: |
- run: |
- run: |
- run: ./mcp-publisher login github-oidc
- run: ./mcp-publisher publish

### Ouro Bruto (primeiros 5000 chars)
```
name: Release MCP

on:
  push:
    tags:
      - "mcp-v*"
  workflow_dispatch:
    inputs:
      allow_already_published:
        description: "Version is already on npm and that's expected — re-run only the registry/mcpb/GitHub-release steps. THE NPM REGISTRY WILL NOT CHANGE."
        type: boolean
        default: false

concurrency:
  # Serialize releases — aborting a release mid-flight is worse than waiting.
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

permissions:
  contents: write
  id-token: write # OIDC auth for the MCP Registry (io.github.screenpipe namespace)

env:
  GIT_LFS_SKIP_SMUDGE: 1

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Authenticate to npm
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          if [ -z "$NPM_TOKEN" ] || [ "${#NPM_TOKEN}" -lt 10 ]; then
            echo "::error::NPM_TOKEN secret looks invalid (length ${#NPM_TOKEN})"
            exit 1
          fi
          echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
          echo "registry=https://registry.npmjs.org/" >> ~/.npmrc
          USER=$(npm whoami) || { echo "::error::npm whoami failed — NPM_TOKEN auth invalid"; exit 1; }
          echo "npm authed as: $USER"

      - name: Install dependencies
        working-directory: packages/screenpipe-mcp
        run: npm install

      - name: Build
        working-directory: packages/screenpipe-mcp
        run: npm run build

      - name: Bundle license
        working-directory: packages/screenpipe-mcp
        run: cp ../../LICENSE.md .

      # The release path never looked at WHAT it was publishing, which is the
      # other half of the SCR-352 incident: 0.18.15 went to the registry with no
      # dist/team-config.js in the tarball at all, so every `team-*` tool 401'd
      # against a customer gateway. `npm publish` is irreversible (npm will not
      # let you replace a published version), so the artifact is asserted here,
      # in the last step before it ships — not only in test-mcp.yml, which does
      # not gate this workflow and does not run on a tag push. Same script both
      # places. `npm pack --dry-run` writes nothing and needs no auth.
      - name: Verify the tarball is a gateway-capable build
        working-directory: packages/screenpipe-mcp
        run: npm run verify:pack

      # A version already on npm used to SKIP quietly and let the whole workflow
      # report success — so "Release MCP" could be re-run forever and change
      # nothing. That is how screenpipe-mcp@0.18.15 stayed on the registry while
      # the repo moved on: the tree gained src/team-config.ts (customer-gateway
      # support for the team-* tools) but package.json still said 0.18.15, so
      # every release run no-op'd and gateway orgs kept getting a build that
      # 401'd (SCR-352). npm cannot overwrite a published version, so an
      # unbumped version is an ERROR, not a skip. The escape hatch exists only
      # for deliberately re-running the MCP-Registry / mcpb / GitHub-release
      # steps after a partial failure.
      - name: Publish to npm
        working-directory: packages/screenpipe-mcp
        env:
          ALLOW_ALREADY_PUBLISHED: ${{ inputs.allow_already_published }}
        run: |
          VER=$(node -p "require('./package.json').version")
          if npm view "screenpipe-mcp@$VER" version >/dev/null 2>&1; then
            if [ "$ALLOW_ALREADY_PUBLISHED" = "true" ]; then
              echo "::warning::screenpipe-mcp@$VER is already on npm — publish skipped on request. THE REGISTRY IS UNCHANGED BY THIS RUN."
            else
              echo "::error::screenpipe-mcp@$VER is already on npm. npm cannot overwrite a published version, so this run would publish NOTHING while reporting success. Bump packages/screenpipe-mcp/package.json (and server.json — src/version.test.ts enforces both), or re-dispatch with allow_already_published=true if you only need the MCP-Registry / mcpb / GitHub-release steps."
              exit 1
            fi
          else
            npm publish --access public
          fi

      # Publish to the official MCP Registry (registry.modelcontextprotocol.io).
      # Feeds downstream directories (Glama, mcp.so, PulseMCP). OIDC auth needs no
      # secrets for the io.github.screenpipe namespace. Runs after npm publish so the
      # package being referenced already carries the matching mcpName.
      - name: Sync server.json version from package.json
        working-directory: packages/screenpipe-mcp
        run: |
          VER=$(node -p "require('./package.json').version")
          jq --arg v "$VER" '.version = $v | .packages |= map(.version = $v)' server.json > server.tmp && mv server.tmp server.json
          echo "synced server.json version to $VER"

     
```

---

# COMANDO - release-mcp.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\release-mcp.yml
**SHA:** c347820a4befa35adee35bb916d60dee91d9c263f1fd4ea39857ededc7b6e7db
**Timestamp:** 2026-08-23T23:43:05.230823
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: npm install
- run: npm run build
- run: cp ../../LICENSE.md .
- run: npm run verify:pack
- run: |
- run: |
- run: |
- run: ./mcp-publisher login github-oidc
- run: ./mcp-publisher publish

### Ouro Bruto (primeiros 5000 chars)
```
name: Release MCP

on:
  push:
    tags:
      - "mcp-v*"
  workflow_dispatch:
    inputs:
      allow_already_published:
        description: "Version is already on npm and that's expected — re-run only the registry/mcpb/GitHub-release steps. THE NPM REGISTRY WILL NOT CHANGE."
        type: boolean
        default: false

concurrency:
  # Serialize releases — aborting a release mid-flight is worse than waiting.
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

permissions:
  contents: write
  id-token: write # OIDC auth for the MCP Registry (io.github.screenpipe namespace)

env:
  GIT_LFS_SKIP_SMUDGE: 1

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Authenticate to npm
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          if [ -z "$NPM_TOKEN" ] || [ "${#NPM_TOKEN}" -lt 10 ]; then
            echo "::error::NPM_TOKEN secret looks invalid (length ${#NPM_TOKEN})"
            exit 1
          fi
          echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
          echo "registry=https://registry.npmjs.org/" >> ~/.npmrc
          USER=$(npm whoami) || { echo "::error::npm whoami failed — NPM_TOKEN auth invalid"; exit 1; }
          echo "npm authed as: $USER"

      - name: Install dependencies
        working-directory: packages/screenpipe-mcp
        run: npm install

      - name: Build
        working-directory: packages/screenpipe-mcp
        run: npm run build

      - name: Bundle license
        working-directory: packages/screenpipe-mcp
        run: cp ../../LICENSE.md .

      # The release path never looked at WHAT it was publishing, which is the
      # other half of the SCR-352 incident: 0.18.15 went to the registry with no
      # dist/team-config.js in the tarball at all, so every `team-*` tool 401'd
      # against a customer gateway. `npm publish` is irreversible (npm will not
      # let you replace a published version), so the artifact is asserted here,
      # in the last step before it ships — not only in test-mcp.yml, which does
      # not gate this workflow and does not run on a tag push. Same script both
      # places. `npm pack --dry-run` writes nothing and needs no auth.
      - name: Verify the tarball is a gateway-capable build
        working-directory: packages/screenpipe-mcp
        run: npm run verify:pack

      # A version already on npm used to SKIP quietly and let the whole workflow
      # report success — so "Release MCP" could be re-run forever and change
      # nothing. That is how screenpipe-mcp@0.18.15 stayed on the registry while
      # the repo moved on: the tree gained src/team-config.ts (customer-gateway
      # support for the team-* tools) but package.json still said 0.18.15, so
      # every release run no-op'd and gateway orgs kept getting a build that
      # 401'd (SCR-352). npm cannot overwrite a published version, so an
      # unbumped version is an ERROR, not a skip. The escape hatch exists only
      # for deliberately re-running the MCP-Registry / mcpb / GitHub-release
      # steps after a partial failure.
      - name: Publish to npm
        working-directory: packages/screenpipe-mcp
        env:
          ALLOW_ALREADY_PUBLISHED: ${{ inputs.allow_already_published }}
        run: |
          VER=$(node -p "require('./package.json').version")
          if npm view "screenpipe-mcp@$VER" version >/dev/null 2>&1; then
            if [ "$ALLOW_ALREADY_PUBLISHED" = "true" ]; then
              echo "::warning::screenpipe-mcp@$VER is already on npm — publish skipped on request. THE REGISTRY IS UNCHANGED BY THIS RUN."
            else
              echo "::error::screenpipe-mcp@$VER is already on npm. npm cannot overwrite a published version, so this run would publish NOTHING while reporting success. Bump packages/screenpipe-mcp/package.json (and server.json — src/version.test.ts enforces both), or re-dispatch with allow_already_published=true if you only need the MCP-Registry / mcpb / GitHub-release steps."
              exit 1
            fi
          else
            npm publish --access public
          fi

      # Publish to the official MCP Registry (registry.modelcontextprotocol.io).
      # Feeds downstream directories (Glama, mcp.so, PulseMCP). OIDC auth needs no
      # secrets for the io.github.screenpipe namespace. Runs after npm publish so the
      # package being referenced already carries the matching mcpName.
      - name: Sync server.json version from package.json
        working-directory: packages/screenpipe-mcp
        run: |
          VER=$(node -p "require('./package.json').version")
          jq --arg v "$VER" '.version = $v | .packages |= map(.version = $v)' server.json > server.tmp && mv server.tmp server.json
          echo "synced server.json version to $VER"

     
```