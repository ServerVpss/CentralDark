# MISSAO - claim-pr.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_meteor-decomp-develop\meteor-decomp-develop\.github\workflows\claim-pr.yml
**SHA:** 4b99422fadef5bca
**Timestamp:** 2026-08-28T11:50:49.652582
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Pin/free claim on PR

# D2 of issue #11 — the PR side of the claim lifecycle. A PR that ADDS a
# src/<bin>/_rosetta/FUN_<va>.cpp file pins the matching claim (state =
# pinned-by-PR, NO expiry) so the sweeper never reclaims work that is already
# in review. Closing the PR WITHOUT merging frees (deletes) the pinned claim;
# a MERGE leaves it for reconcile.yml's release-solved to drop once the solved
# state is on develop (solved-by-presence).
#
# Why `pull_request_target` (same posture as announce-pull-request.yml): a
# fork PR's `pull_request` run has NO repo secrets, so CLAIMS_BOT_TOKEN would
# be missing and the pin/free would silently never fire. `pull_request_target`
# runs in the BASE-repo context and HAS the secret.
#
# SAFETY — this is the dangerous trigger: it MUST NEVER checkout or execute the
# PR HEAD code. We only read EVENT METADATA (author, merged flag) and the diff
# FILENAMES (via `gh pr diff --name-only`, an API call — not a checkout), then
# mutate the orphan `claims` branch. No fork-controlled code ever runs with the
# secret in scope.
on:
  pull_request_target:
    types: [opened, reopened, closed]

# One run per PR + action; do not cancel so an opened-then-closed pair both run.
concurrency:
  group: claim-pr-${{ github.event.pull_request.number }}-${{ github.event.action }}
  cancel-in-progress: false

# The default GITHUB_TOKEN only needs to READ the PR diff filenames; the ledger
# push uses CLAIMS_BOT_TOKEN. pull-requests:read covers `gh pr diff`.
permissions:
  pull-requests: read
  contents: read

jobs:
  pin-or-free:
    runs-on: ubuntu-latest
    steps:
      # ---------------------------------------------------------------
      # 1) Bot-token guard — skip-with-warning if CLAIMS_BOT_TOKEN absent.
      # ---------------------------------------------------------------
      - name: Check for the claims bot token
        id: token
        env:
          CLAIMS_BOT_TOKEN: ${{ secrets.CLAIMS_BOT_TOKEN }}
        run: |
          set -euo pipefail
          if [ -z "${CLAIMS_BOT_TOKEN:-}" ]; then
            echo "::warning::CLAIMS_BOT_TOKEN secret is not set — skipping claim pin/free."
            echo "present=false" >> "$GITHUB_OUTPUT"
          else
            echo "present=true" >> "$GITHUB_OUTPUT"
          fi

      # ---------------------------------------------------------------
      # 2) Read the ADDED _rosetta filenames from the PR diff via the API.
      #    `gh pr diff --name-only` lists changed paths WITHOUT checking out
      #    the PR head, so no attacker code runs. We then map each added
      #    src/<bin>/_rosetta/FUN_<va>.cpp -> (binary, va) pair and emit a
      #    repeatable --binary/--va arg list per binary for claim.py.
      #
      #    NOTE: --name-only cannot tell added from modified; for the claim
      #    model that is fine — pin is idempotent, and a PR touching a
      #    _rosetta file IS the work that should be pinned/freed.
      # ---------------------------------------------------------------
      - name: Parse VAs from the PR diff filenames
        id: parse
        if: steps.token.outputs.present == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
          REPO: ${{ github.repository }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: |
          set -euo pipefail

          # API-only filename listing — never a PR-head checkout.
          files="$(gh pr diff "$PR_NUMBER" --repo "$REPO" --name-only || true)"

          # Match src/<bin>/_rosetta/FUN_<va>.cpp and capture (binary, va).
          # Build, per binary, a space-joined list of `--va 0x<va>` flags that
          # the pin/free steps splice straight into claim.py's argv.
          matches="$(printf '%s\n' "$files" \
            | grep -aoE 'src/[A-Za-z0-9_]+/_rosetta/FUN_[0-9a-fA-F]+\.cpp' \
            | sort -u || true)"

          if [ -z "$matches" ]; then
            echo "No _rosetta/FUN_*.cpp files in this PR diff — nothing to pin/free."
            echo "has_va=false" >> "$GITHUB_OUTPUT"
            exit 0
          fi

          # Emit a newline-delimited "binary va" table; the pin/free step turns
          # it into per-binary claim.py invocations. (Stored as an output via a
          # heredoc so multi-line survives.)
          table="$(printf '%s\n' "$matches" | sed -E 's#src/([^/]+)/_rosetta/FUN_([0-9a-fA-F]+)\.cpp#\1 0x\2#')"
          echo "Pinning/freeing VAs:"
          printf '%s\n' "$table"
          {
            echo "has_va=true"
            printf 'table<<TBL\n%s\nTBL\n' "$table"
          } >> "$GITHUB_OUTPUT"

      # ---------------------------------------------------------------
      # 3) Checkout the orphan claims branch with the bot PAT.
      # ---------------------------------------------------------------
      - name: Checkout the claims ledger branch
        if: steps.token.outputs.present == 'true' && steps.parse.outputs.has_va == 'true'
        uses: actions/checkout@v6
        with:
          ref: 
```