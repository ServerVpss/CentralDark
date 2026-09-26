# OUTRO - supabase-migrations.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\supabase-migrations.yml
**SHA:** cd586ac7356b51cc
**Timestamp:** 2026-08-26T19:31:32.422836
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Supabase Migrations

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'infra/supabase/migrations/**.sql'

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"

jobs:
  migrate:
    name: Apply Supabase Migrations
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout repo
        uses: actions/checkout@v5

      - name: Install psql
        run: |
          sudo apt-get update -qq
          sudo apt-get install -y -qq postgresql-client

      - name: Create migration tracking table
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DATABASE_URL }}
        run: |
          psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
          CREATE TABLE IF NOT EXISTS public._schema_migrations (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            checksum TEXT NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          GRANT ALL ON public._schema_migrations TO postgres, service_role, authenticated;
          GRANT USAGE, SELECT ON SEQUENCE public._schema_migrations_id_seq TO postgres, service_role, authenticated;
          SQL

      - name: Apply pending migrations
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DATABASE_URL }}
        run: |
          FAILED=0
          APPLIED=0
          SKIPPED=0

          for file in $(ls infra/supabase/migrations/*.sql 2>/dev/null | sort); do
            BASENAME=$(basename "$file")
            CHECKSUM=$(sha256sum "$file" | awk '{print $1}')

            # Check if already applied
            ALREADY=$(psql "$DATABASE_URL" -t -A -c \
              "SELECT COUNT(*) FROM public._schema_migrations WHERE filename = '$BASENAME'" 2>/dev/null || echo "0")

            if [ "$ALREADY" -gt 0 ]; then
              echo "⏭️  SKIP: $BASENAME (already applied)"
              SKIPPED=$((SKIPPED + 1))
              continue
            fi

            echo "🔄 APPLYING: $BASENAME"

            if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"; then
              # Register successful migration
              psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
                "INSERT INTO public._schema_migrations (filename, checksum) VALUES ('$BASENAME', '$CHECKSUM')"
              echo "✅ OK: $BASENAME"
              APPLIED=$((APPLIED + 1))
            else
              echo "❌ FAILED: $BASENAME"
              FAILED=$((FAILED + 1))
              break
            fi
          done

          echo ""
          echo "=== MIGRATION SUMMARY ==="
          echo "Applied: $APPLIED"
          echo "Skipped: $SKIPPED"
          echo "Failed:  $FAILED"

          if [ "$FAILED" -gt 0 ]; then
            echo "::error::Migration failed. Check logs above."
            exit 1
          fi

```

---

# OUTRO - supabase-migrations.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\infra\configs\supabase-migrations.yml
**SHA:** 964159e15892c404
**Timestamp:** 2026-08-26T19:32:49.969918
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Supabase Migrations

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**.sql'

jobs:
  migrate:
    name: Apply Supabase Migrations
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Install psql
        run: |
          sudo apt-get update -qq
          sudo apt-get install -y -qq postgresql-client

      - name: Create migration tracking table
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DATABASE_URL }}
        run: |
          psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
          CREATE TABLE IF NOT EXISTS public._schema_migrations (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            checksum TEXT NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          GRANT ALL ON public._schema_migrations TO postgres, service_role, authenticated;
          GRANT USAGE, SELECT ON SEQUENCE public._schema_migrations_id_seq TO postgres, service_role, authenticated;
          SQL

      - name: Apply pending migrations
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DATABASE_URL }}
        run: |
          FAILED=0
          APPLIED=0
          SKIPPED=0

          for file in $(ls supabase/migrations/*.sql 2>/dev/null | sort); do
            BASENAME=$(basename "$file")
            CHECKSUM=$(sha256sum "$file" | awk '{print $1}')

            # Check if already applied
            ALREADY=$(psql "$DATABASE_URL" -t -A -c \
              "SELECT COUNT(*) FROM public._schema_migrations WHERE filename = '$BASENAME'" 2>/dev/null || echo "0")

            if [ "$ALREADY" -gt 0 ]; then
              echo "⏭️  SKIP: $BASENAME (already applied)"
              SKIPPED=$((SKIPPED + 1))
              continue
            fi

            echo "🔄 APPLYING: $BASENAME"

            if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"; then
              # Register successful migration
              psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
                "INSERT INTO public._schema_migrations (filename, checksum) VALUES ('$BASENAME', '$CHECKSUM')"
              echo "✅ OK: $BASENAME"
              APPLIED=$((APPLIED + 1))
            else
              echo "❌ FAILED: $BASENAME"
              FAILED=$((FAILED + 1))
              break
            fi
          done

          echo ""
          echo "=== MIGRATION SUMMARY ==="
          echo "Applied: $APPLIED"
          echo "Skipped: $SKIPPED"
          echo "Failed:  $FAILED"

          if [ "$FAILED" -gt 0 ]; then
            echo "::error::Migration failed. Check logs above."
            exit 1
          fi

```