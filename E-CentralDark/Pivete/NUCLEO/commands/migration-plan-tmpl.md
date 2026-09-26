# COMANDO - migration-plan-tmpl.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\migration-plan-tmpl.yaml
**SHA:** d0b8580cab768484
**Timestamp:** 2026-08-28T02:02:20.820756
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Tests to run:
- run: supabase db push

### Ouro Bruto (primeiros 5000 chars)
```
---
template_name: "Schema Migration Plan"
template_version: "1.0.0"
output_format: "markdown"
destination: "migration-plan.md"
description: "Plan and validate a safe schema migration with rollback and tests"

sections:
  - id: summary
    title: "Executive Summary"
    instruction: |
      Summarize the change:
      - Objective and scope
      - Risk level (Low/Med/High) and why
      - Environments impacted (dev/staging/prod)
      - Expected migration time window and rollback window
    elicit: true

  - id: change-set
    title: "Change Set"
    instruction: |
      Detail every schema change:
      - Tables created/altered/dropped
      - Columns added/modified/removed (types, defaults, constraints)
      - Indexes (create/alter/drop)
      - Functions/triggers/views (create/replace/drop)
      - RLS policies (add/remove/modify)
    elicit: true

  - id: dependencies
    title: "Dependencies & Ordering"
    instruction: |
      List dependencies and execution order:
      1) Extensions
      2) Tables & constraints
      3) Functions
      4) Triggers
      5) RLS
      6) Views / MatViews
      Note any cross-object dependencies that require two-phase rollout.
    elicit: true

  - id: data-migration
    title: "Data Migration & Backfill"
    instruction: |
      Strategies for migrating existing data safely at scale.

      ## Small Data Sets (< 100K rows)

      **Simple approach** for tables with few rows:

      ```sql
      -- Direct UPDATE (< 100K rows)
      UPDATE users SET email_address = email
      WHERE email_address IS NULL;

      -- Single transaction, fast execution
      ```

      **When safe**:
      - Small tables (< 100K rows)
      - Low traffic tables
      - Maintenance window available

      ## Large Data Sets (> 100K rows)

      **Batched approach** prevents table locks and reduces transaction size.

      ### Pattern 1: Basic Batching (Single Process)

      ```sql
      -- Backfill in batches to avoid long locks
      DO $$
      DECLARE
        batch_size INT := 1000;  -- Adjust based on row size and available memory
        rows_updated INT;
        total_updated INT := 0;
        batch_count INT := 0;
      BEGIN
        LOOP
          -- Update one batch
          WITH batch AS (
            SELECT id FROM users
            WHERE email_address IS NULL
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED  -- ⭐ CRITICAL: Avoid lock contention
          )
          UPDATE users
          SET email_address = email
          FROM batch
          WHERE users.id = batch.id;

          GET DIAGNOSTICS rows_updated = ROW_COUNT;
          EXIT WHEN rows_updated = 0;  -- No more rows to process

          total_updated := total_updated + rows_updated;
          batch_count := batch_count + 1;

          RAISE NOTICE 'Batch %: Updated % rows (total: %)',
            batch_count, rows_updated, total_updated;

          -- Throttle to avoid overloading DB
          PERFORM pg_sleep(0.1);  -- 100ms pause between batches
        END LOOP;

        RAISE NOTICE 'Backfill complete: % batches, % total rows',
          batch_count, total_updated;
      END $$;
      ```

      **Key techniques**:
      - `FOR UPDATE SKIP LOCKED` - Avoids lock contention, enables parallel processing
      - `LIMIT batch_size` - Controls transaction size
      - `pg_sleep()` - Throttles load, allows other transactions to proceed
      - `RAISE NOTICE` - Progress tracking

      ### Pattern 2: Parallel Batching (Multiple Workers)

      **For very large tables** (millions of rows), run multiple workers concurrently:

      ```sql
      -- Worker 1 (run in psql session 1)
      DO $$
      DECLARE
        batch_size INT := 5000;
        worker_id INT := 1;
        rows_updated INT;
      BEGIN
        LOOP
          WITH batch AS (
            SELECT id FROM orders
            WHERE status_new IS NULL
            ORDER BY id  -- ⭐ CRITICAL: Deterministic ordering
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED  -- Skip rows locked by other workers
          )
          UPDATE orders
          SET status_new = status
          FROM batch
          WHERE orders.id = batch.id;

          GET DIAGNOSTICS rows_updated = ROW_COUNT;
          EXIT WHEN rows_updated = 0;

          RAISE NOTICE '[Worker %] Updated % rows', worker_id, rows_updated;
          PERFORM pg_sleep(0.05);  -- Shorter pause with multiple workers
        END LOOP;
      END $$;

      -- Worker 2-4: Same script, different worker_id in RAISE NOTICE
      ```

      **Why it works**:
      - `FOR UPDATE SKIP LOCKED` allows workers to grab different rows
      - Each worker skips rows locked by others
      - No deadlocks or contention
      - Near-linear speedup (4 workers ≈ 4x faster)

      ### Pattern 3: Progress Tracking Table

      **Track progress** for resumable migrations:

      ```sql
      -- Create progress tracking table
      CREATE TABLE migration_progress (
        migration_name TEXT PRIMARY KEY,
  
```