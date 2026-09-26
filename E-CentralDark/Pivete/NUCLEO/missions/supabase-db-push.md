# MISSAO - supabase-db-push.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\supabase-db-push.yml
**SHA:** 2b6420c56bda9f90
**Timestamp:** 2026-08-26T19:30:49.535426
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: supabase-db-push.yml manual

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  manual_only:
    name: Manual only
    runs-on: ubuntu-latest
    steps:
      - name: Workflow desativado no push
        shell: bash
        run: |
          echo "Workflow tornado manual-only."
          echo "Arquivo: supabase-db-push.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```

---

# MISSAO - supabase-db-push.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\supabase-db-push.yml
**SHA:** 80517842cdc47dc2
**Timestamp:** 2026-08-26T19:31:23.956588
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: supabase link --project-ref lyoigsqluyktoclwdaft --password "$SUPABASE_DB_PASSWORD"
- run: supabase db push --password "$SUPABASE_DB_PASSWORD"

### Ouro Bruto (primeiros 5000 chars)
```
name: Supabase DB Push

on:
  workflow_dispatch:
  push:
    paths:
      - 'supabase/migrations/**'
      - '.github/workflows/supabase-db-push.yml'

permissions:
  contents: read

jobs:
  db-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Validate required secrets
        shell: bash
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: |
          set -euo pipefail
          test -n "${SUPABASE_ACCESS_TOKEN:-}" || { echo "::error::SUPABASE_ACCESS_TOKEN ausente nos Secrets do GitHub"; exit 1; }
          test -n "${SUPABASE_DB_PASSWORD:-}" || { echo "::error::SUPABASE_DB_PASSWORD ausente nos Secrets do GitHub"; exit 1; }
          echo "Secrets obrigatorios carregados sem mostrar valores."

      - name: Link project
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: supabase link --project-ref lyoigsqluyktoclwdaft --password "$SUPABASE_DB_PASSWORD"

      - name: Push migrations
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: supabase db push --password "$SUPABASE_DB_PASSWORD"

```