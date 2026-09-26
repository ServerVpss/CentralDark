# COMANDO - claim.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_meteor-decomp-develop\meteor-decomp-develop\.github\workflows\claim.yml
**SHA:** f3d041418532a457
**Timestamp:** 2026-08-28T11:50:52.168112
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Claim a function

# D1/D2 of issue #11 — the WRITE half of the fork-based distributed-decomp
# claim system. A contributor (or an agent) reserves a single VA so two people
# never decompile the same FUN_<va> in parallel.
#
# THE ATOMICITY MODEL (read tools/claim.py's header too):
#   The ledger is an orphan `claims` branch — ONE file per active claim at
#   claims/<bin>/<decimal_rva>.json. There is NO Actions-`concurrency` queue
#   here ON PURPOSE: Actions `concurrency` only de-dupes/cancels, it has no
#   FIFO and CANNOT serialise two racing claimers. The real compare-and-swap is
#   GitHub's serialized per-ref commit: we checkout `claims`, mutate the ledger
#   with claim.py, commit, and `git push`. A non-fast-forward push is REJECTED
#   if another writer advanced the ref between our fetch and our push — on
#   rejection we re-fetch/reset to the new tip, RE-RUN claim.py against the now
#   newer ledger, and retry (bounded, with backoff). create-if-not-exists falls
#   out for free: a ledger path can be added at most once per ref state.
#
# IDENTITY BINDING (security): `owner` is ALWAYS the trigger's AUTHENTICATED
# identity — github.event.comment.user.login for the comment path, the
# dispatching actor (github.actor) for the dispatch paths — NEVER request-body
# data a fork could spoof. A shared bot PAT for agent claims is forbidden;
# every agent authenticates as itself and we record github.actor.
on:
  issue_comment:
    types: [created]
  workflow_dispatch:
    inputs:
      binary:
        description: "Binary stem (e.g. ffxivgame)"
        required: true
        type: string
      va:
        description: "VA hex (0x...) or FUN_<va>"
        required: true
        type: string
  repository_dispatch:
    types: [claim]

# De-dupe rapid duplicate events for the SAME trigger (e.g. an edited+created
# burst); this is NOT the claim serialiser — the push-CAS below is. We do not
# cancel-in-progress so a queued run still gets its turn at the CAS.
concurrency:
  group: claim-${{ github.event.issue.number || github.run_id }}
  cancel-in-progress: false

# Least privilege: we push the `claims` branch with CLAIMS_BOT_TOKEN (a PAT,
# checked out below), so the default GITHUB_TOKEN only needs to write the
# acknowledgement comment back on the issue. issues:write covers that; nothing
# else is granted.
permissions:
  issues: write

jobs:
  claim:
    # Comment path: only act on a comment whose body starts with `/claim`, and
    # never on a comment the bot itself posted (loop guard). Dispatch paths
    # always run. A normal PR/issue comment that is not a /claim is ignored.
    if: >-
      (github.event_name == 'issue_comment'
        && startsWith(github.event.comment.body, '/claim')
        && github.event.comment.user.type != 'Bot')
      || github.event_name == 'workflow_dispatch'
      || github.event_name == 'repository_dispatch'
    runs-on: ubuntu-latest
    steps:
      # ---------------------------------------------------------------
      # 1) Resolve the request: (binary, va, owner) from the AUTHENTICATED
      #    trigger. owner is github.actor / comment.user.login — never body
      #    fields a fork controls. The raw comment body is parsed for the VA
      #    only (untrusted text -> a VA token, validated by a strict regex).
      # ---------------------------------------------------------------
      - name: Resolve claim request (authenticated owner + parsed VA)
        id: req
        env:
          EVENT_NAME: ${{ github.event_name }}
          # Comment path inputs (untrusted body, authenticated author).
          COMMENT_BODY: ${{ github.event.comment.body }}
          COMMENT_AUTHOR: ${{ github.event.comment.user.login }}
          # workflow_dispatch inputs (authenticated actor).
          WD_BINARY: ${{ github.event.inputs.binary }}
          WD_VA: ${{ github.event.inputs.va }}
          # repository_dispatch client_payload (authenticated actor; the
          # payload is data, so binary/va come from it but OWNER does not).
          RD_BINARY: ${{ github.event.client_payload.binary }}
          RD_VA: ${{ github.event.client_payload.va }}
          # The authenticated dispatching identity for both dispatch paths.
          DISPATCH_ACTOR: ${{ github.actor }}
        run: |
          set -euo pipefail

          case "$EVENT_NAME" in
            issue_comment)
              owner="$COMMENT_AUTHOR"
              raw_binary=""
              # Body shape: `/claim FUN_<va> [binary]` or `/claim 0x<va> [binary]`.
              # Pull the first VA-looking token and an optional binary stem.
              va_token="$(printf '%s' "$COMMENT_BODY" \
                | grep -oiE '(FUN_)?0?x?[0-9a-f]{4,8}' | head -n1 || true)"
              raw_binary="$(printf '%s' "$COMMENT_BODY" \
                | grep -oiE '\b(ffxivboot|ffxivconfig|ffxivgame|ffxivlogin|ffxivupdater)\b' \
                | head -n1 || true)"
              ;;
            workflow_dispatch)
              owner="$DISPATCH_AC
```