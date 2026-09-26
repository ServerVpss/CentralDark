# OUTRO - sentry-cleanup.yml
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\sentry-cleanup.yml
**SHA:** 40193af71723a39b
**Timestamp:** 2026-08-23T14:15:49.273474
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- workflow_run:
- dry_run:
- run: |
- DRY_RUN: ${{ github.event.inputs.dry_run || 'false' }}
- run: |
- DRY_RUN = os.environ.get("DRY_RUN", "false").lower() == "true"
- print(f"Dry run: {DRY_RUN}")
- if DRY_RUN:
- if DRY_RUN:

### Gaps
- version_gap:
- VERSION_GAP: ${{ github.event.inputs.version_gap || '5' }}
- VERSION_GAP = int(os.environ.get("VERSION_GAP", "5"))
- gap = current_version[2] - event_version[2]
- if gap >= VERSION_GAP:
- gap_part = f"gap={gap}" if gap is not None else "gap=n/a"
- gap = version_gap(current_version, event_version)

### Ouro Bruto (primeiros 5000 chars)
```
name: Sentry Cleanup - Resolve Stale Issues

on:
  # Run after app releases
  workflow_run:
    workflows: ["Release App (Beta)"]
    types: [completed]
  # Weekly sweep
  schedule:
    - cron: "0 9 * * 1" # Monday 9am UTC
  # Manual trigger
  workflow_dispatch:
    inputs:
      version_gap:
        description: "Minimum version gap to auto-resolve (default: 5)"
        required: false
        default: "5"
      dry_run:
        description: "Dry run - only log what would be resolved"
        type: boolean
        default: false

concurrency:
  # Prevent overlapping cleanup runs (schedule + dispatch + post-release).
  group: ${{ github.workflow }}
  cancel-in-progress: false

env:
  GIT_LFS_SKIP_SMUDGE: 1

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Get current versions
        id: versions
        run: |
          APP_VERSION=$(grep '^version = ' apps/screenpipe-app-tauri/src-tauri/Cargo.toml | sed 's/version = "\(.*\)"/\1/')
          SERVER_VERSION=$(grep '^version = ' Cargo.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
          echo "app_version=$APP_VERSION" >> $GITHUB_OUTPUT
          echo "server_version=$SERVER_VERSION" >> $GITHUB_OUTPUT
          echo "Current app version: $APP_VERSION"
          echo "Current server version: $SERVER_VERSION"

      - name: Resolve stale Sentry issues
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          APP_VERSION: ${{ steps.versions.outputs.app_version }}
          SERVER_VERSION: ${{ steps.versions.outputs.server_version }}
          VERSION_GAP: ${{ github.event.inputs.version_gap || '5' }}
          DRY_RUN: ${{ github.event.inputs.dry_run || 'false' }}
        run: |
          python3 << 'SCRIPT'
          import json
          import os
          import re
          import urllib.request
          import urllib.error

          SENTRY_TOKEN = os.environ["SENTRY_AUTH_TOKEN"]
          APP_VERSION = os.environ["APP_VERSION"]
          SERVER_VERSION = os.environ["SERVER_VERSION"]
          VERSION_GAP = int(os.environ.get("VERSION_GAP", "5"))
          DRY_RUN = os.environ.get("DRY_RUN", "false").lower() == "true"
          ORG_SLUG = "mediar"

          def sentry_request(url, method="GET", data=None):
              req = urllib.request.Request(url, method=method)
              req.add_header("Authorization", f"Bearer {SENTRY_TOKEN}")
              req.add_header("Content-Type", "application/json")
              if data:
                  req.data = json.dumps(data).encode()
              try:
                  resp = urllib.request.urlopen(req)
                  return json.loads(resp.read())
              except urllib.error.HTTPError as e:
                  print(f"  HTTP {e.code} for {url}")
                  return None

          def parse_version(release_str):
              """Extract semantic version from releases like 'screenpipe-app@2.5.84'."""
              m = re.search(r"@(\d+)\.(\d+)\.(\d+)", release_str or "")
              if m:
                  version = tuple(int(part) for part in m.groups())
                  return version, ".".join(str(part) for part in version)
              return None, None

          def parse_current_version(version_str):
              parts = version_str.split(".")
              if len(parts) < 3:
                  return None
              try:
                  return tuple(int(part) for part in parts[:3])
              except ValueError:
                  return None

          def get_current_version(project_slug):
              """Get the current semantic version for a project."""
              if project_slug == "screenpipe-app":
                  return parse_current_version(APP_VERSION)
              elif project_slug == "screenpipe-cli":
                  return parse_current_version(SERVER_VERSION)
              return None

          def version_gap(current_version, event_version):
              if not current_version or not event_version:
                  return None
              if current_version[:2] != event_version[:2]:
                  return None
              return current_version[2] - event_version[2]

          def should_resolve_version(current_version, event_version):
              if not current_version or not event_version:
                  return False, "unknown-version"
              if event_version[:2] < current_version[:2]:
                  return True, "older-major-minor"
              if event_version[:2] > current_version[:2]:
                  return False, "newer-major-minor"

              gap = current_version[2] - event_version[2]
              if gap >= VERSION_GAP:
                  return True, f"patch-gap-{gap}"
              return False, f"patch-gap-{gap}"

          def get_release_prefix(project_slug):
              if project_slug == "screenpipe-app":
                  return "screenpipe-app@"
              elif project_slug == "screenpipe-cli":
                  retu
```

---

# OUTRO - sentry-cleanup.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\sentry-cleanup.yml
**SHA:** 40193af71723a39bc08dc677fb95f767cbf46afe1510e46cb69f7641c0a94994
**Timestamp:** 2026-08-23T23:43:06.396236
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- workflow_run:
- dry_run:
- run: |
- DRY_RUN: ${{ github.event.inputs.dry_run || 'false' }}
- run: |
- DRY_RUN = os.environ.get("DRY_RUN", "false").lower() == "true"
- print(f"Dry run: {DRY_RUN}")
- if DRY_RUN:
- if DRY_RUN:

### Gaps
- version_gap:
- VERSION_GAP: ${{ github.event.inputs.version_gap || '5' }}
- VERSION_GAP = int(os.environ.get("VERSION_GAP", "5"))
- gap = current_version[2] - event_version[2]
- if gap >= VERSION_GAP:
- gap_part = f"gap={gap}" if gap is not None else "gap=n/a"
- gap = version_gap(current_version, event_version)

### Ouro Bruto (primeiros 5000 chars)
```
name: Sentry Cleanup - Resolve Stale Issues

on:
  # Run after app releases
  workflow_run:
    workflows: ["Release App (Beta)"]
    types: [completed]
  # Weekly sweep
  schedule:
    - cron: "0 9 * * 1" # Monday 9am UTC
  # Manual trigger
  workflow_dispatch:
    inputs:
      version_gap:
        description: "Minimum version gap to auto-resolve (default: 5)"
        required: false
        default: "5"
      dry_run:
        description: "Dry run - only log what would be resolved"
        type: boolean
        default: false

concurrency:
  # Prevent overlapping cleanup runs (schedule + dispatch + post-release).
  group: ${{ github.workflow }}
  cancel-in-progress: false

env:
  GIT_LFS_SKIP_SMUDGE: 1

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Get current versions
        id: versions
        run: |
          APP_VERSION=$(grep '^version = ' apps/screenpipe-app-tauri/src-tauri/Cargo.toml | sed 's/version = "\(.*\)"/\1/')
          SERVER_VERSION=$(grep '^version = ' Cargo.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
          echo "app_version=$APP_VERSION" >> $GITHUB_OUTPUT
          echo "server_version=$SERVER_VERSION" >> $GITHUB_OUTPUT
          echo "Current app version: $APP_VERSION"
          echo "Current server version: $SERVER_VERSION"

      - name: Resolve stale Sentry issues
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          APP_VERSION: ${{ steps.versions.outputs.app_version }}
          SERVER_VERSION: ${{ steps.versions.outputs.server_version }}
          VERSION_GAP: ${{ github.event.inputs.version_gap || '5' }}
          DRY_RUN: ${{ github.event.inputs.dry_run || 'false' }}
        run: |
          python3 << 'SCRIPT'
          import json
          import os
          import re
          import urllib.request
          import urllib.error

          SENTRY_TOKEN = os.environ["SENTRY_AUTH_TOKEN"]
          APP_VERSION = os.environ["APP_VERSION"]
          SERVER_VERSION = os.environ["SERVER_VERSION"]
          VERSION_GAP = int(os.environ.get("VERSION_GAP", "5"))
          DRY_RUN = os.environ.get("DRY_RUN", "false").lower() == "true"
          ORG_SLUG = "mediar"

          def sentry_request(url, method="GET", data=None):
              req = urllib.request.Request(url, method=method)
              req.add_header("Authorization", f"Bearer {SENTRY_TOKEN}")
              req.add_header("Content-Type", "application/json")
              if data:
                  req.data = json.dumps(data).encode()
              try:
                  resp = urllib.request.urlopen(req)
                  return json.loads(resp.read())
              except urllib.error.HTTPError as e:
                  print(f"  HTTP {e.code} for {url}")
                  return None

          def parse_version(release_str):
              """Extract semantic version from releases like 'screenpipe-app@2.5.84'."""
              m = re.search(r"@(\d+)\.(\d+)\.(\d+)", release_str or "")
              if m:
                  version = tuple(int(part) for part in m.groups())
                  return version, ".".join(str(part) for part in version)
              return None, None

          def parse_current_version(version_str):
              parts = version_str.split(".")
              if len(parts) < 3:
                  return None
              try:
                  return tuple(int(part) for part in parts[:3])
              except ValueError:
                  return None

          def get_current_version(project_slug):
              """Get the current semantic version for a project."""
              if project_slug == "screenpipe-app":
                  return parse_current_version(APP_VERSION)
              elif project_slug == "screenpipe-cli":
                  return parse_current_version(SERVER_VERSION)
              return None

          def version_gap(current_version, event_version):
              if not current_version or not event_version:
                  return None
              if current_version[:2] != event_version[:2]:
                  return None
              return current_version[2] - event_version[2]

          def should_resolve_version(current_version, event_version):
              if not current_version or not event_version:
                  return False, "unknown-version"
              if event_version[:2] < current_version[:2]:
                  return True, "older-major-minor"
              if event_version[:2] > current_version[:2]:
                  return False, "newer-major-minor"

              gap = current_version[2] - event_version[2]
              if gap >= VERSION_GAP:
                  return True, f"patch-gap-{gap}"
              return False, f"patch-gap-{gap}"

          def get_release_prefix(project_slug):
              if project_slug == "screenpipe-app":
                  return "screenpipe-app@"
              elif project_slug == "screenpipe-cli":
                  retu
```