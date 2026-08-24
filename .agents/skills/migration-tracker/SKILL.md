---
name: migration-tracker
description: Track database migrations, schema changes, and data transformations across environments. Use when managing schema evolution, rolling out changes, or debugging migration issues.
---

# Migration Tracker

Systematic tracking of database schema changes across environments.

## Core Concepts
- **Migration**: Single atomic schema change (up + down)
- **Version**: Sequential or timestamp-based ordering
- **Environment**: Local, staging, production
- **State**: Applied, pending, failed, rolled back

## Migration Lifecycle
1. **Create** → Write up/down SQL or code
2. **Test** → Apply to local/dev, verify
3. **Review** → PR with migration + tests
4. **Deploy** → CI applies to staging
4. **Verify** → Smoke tests, data integrity checks
5. **Promote** → Production with rollback plan

## Tracking Schema
```sql
CREATE TABLE migration_log (
  version VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  applied_by TEXT,
  environment TEXT,
  status TEXT CHECK (status IN ('applied','failed','rolled_back')),
  rollback_sql TEXT
);
```

## Best Practices
- One logical change per migration
- Include down/rollback SQL
- Compute checksum (SHA256) of migration content
- Never modify applied migrations — create new ones
- Test rollback in staging before production
- Idempotent where possible (IF NOT EXISTS, etc.)

## Tools Integration
- Version-controlled migration files
- CI runs migrations on staging
- Automated checksum verification
- Rollback scripts in same PR

## Zero-Downtime Patterns
- Expand → migrate data → contract (3-phase)
- Backfill in batches
- Read/write both old/new during transition
- Feature flags for new columns
