# COMANDO - qa-migration-validation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\qa-migration-validation.md
**SHA:** 742b17d4655c08c9
**Timestamp:** 2026-08-28T02:02:08.414874
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# Migration Validation Task

Validate database migrations are properly created and applied for schema changes.

**Absorbed from:** Auto-Claude PR Review Phase 5

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous validation with logging
- Minimal user interaction
- **Best for:** CI/CD integration

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explains migration requirements
- Educational context about database changes
- **Best for:** Learning, understanding migrations

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Full migration audit
- Zero ambiguity execution
- **Best for:** Production deployments

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: qaMigrationValidation()
responsavel: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must be valid story ID format (e.g., "6.3")

- campo: framework
  tipo: string
  origem: Auto-detect or explicit
  obrigatorio: false
  validacao: "supabase" | "prisma" | "drizzle" | "django" | "rails" | "sequelize"

**Saida:**
- campo: migration_report
  tipo: object
  destino: Return value
  persistido: false

- campo: issues_found
  tipo: number
  destino: Memory
  persistido: false

- campo: report_file
  tipo: file
  destino: docs/stories/{story-id}/qa/migration_validation.json
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Database framework detected
    tipo: pre-condition
    blocker: true
    validacao: |
      One of: supabase/, prisma/, drizzle/, migrations/, db/
    error_message: "Pre-condition failed: No database framework detected."

  - [ ] Schema changes detected in diff
    tipo: pre-condition
    blocker: false
    validacao: |
      Changes in schema files, models, or migration directories
    error_message: "Info: No schema changes detected, validation may be skipped."
```

---

## Supported Frameworks

### 1. Supabase

**Detection:**

```
supabase/
├── migrations/
│   └── *.sql
└── config.toml
```

**Validation Commands:**

```bash
supabase db diff          # Check for pending schema changes
supabase migration list   # List migrations status
supabase db lint          # Lint SQL migrations
```

**Checks:**

- [ ] Migration SQL file exists for schema changes
- [ ] Migration applied locally (supabase db reset)
- [ ] No pending schema diff
- [ ] RLS policies included if new tables
- [ ] Rollback migration exists (down.sql or reversible)

### 2. Prisma

**Detection:**

```
prisma/
├── schema.prisma
└── migrations/
    └── */migration.sql
```

**Validation Commands:**

```bash
npx prisma migrate status     # Check migration status
npx prisma validate           # Validate schema
npx prisma db pull --preview  # Compare with DB
```

**Checks:**

- [ ] schema.prisma updated with new models/fields
- [ ] Migration generated (prisma migrate dev)
- [ ] Migration applied locally
- [ ] No drift between schema and DB
- [ ] Indexes defined for foreign keys

### 3. Drizzle

**Detection:**

```
drizzle/
├── schema.ts
└── migrations/
    └── *.sql
```

**Validation Commands:**

```bash
npx drizzle-kit generate  # Generate migrations
npx drizzle-kit check     # Check schema
```

**Checks:**

- [ ] Schema file updated
- [ ] Migration SQL generated
- [ ] Types exported correctly

### 4. Django

**Detection:**

```
*/models.py
*/migrations/
manage.py
```

**Validation Commands:**

```bash
python manage.py makemigrations --dry-run  # Check pending
python manage.py showmigrations            # List status
python manage.py migrate --plan            # Show plan
```

**Checks:**

- [ ] Migration files created for model changes
- [ ] Migrations apply without errors
- [ ] No unapplied migrations
- [ ] Reversible migrations (has reverse operations)

### 5. Rails (ActiveRecord)

**Detection:**

```
db/
├── schema.rb
└── migrate/
    └── *.rb
```

**Validation Commands:**

```bash
rails db:migrate:status   # Check status
rails db:migrate:redo     # Test reversibility
```

**Checks:**

- [ ] Migration file exists
- [ ] Migration runs forward
- [ ] Migration runs backward (reversible)
- [ ] schema.rb updated

### 6. Sequelize

**Detection:**

```
migrations/
├── *.js
models/
├── index.js
```

**Validation Commands:**

```bash
npx sequelize-cli db:migrate:status  # Check status
```

**Checks:**

- [ ] Migration file created
- [ ] Up and down methods defined
- [ ] Migration applies successfully

---

## Command

```
*validate-migrations {story-id} [--framework supabase|prisma|drizzle|django|rails|sequelize]
```

**Parameters:**

- `story-id` (required): Story identifier (e.g., "6.3")
- `--framework` (optional): Force specific framework (default: auto-detect)

**Examples:**


```