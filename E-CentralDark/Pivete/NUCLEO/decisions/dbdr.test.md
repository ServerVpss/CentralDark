# DECISAO - dbdr.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\templates\dbdr.test.js
**SHA:** 3640d1238d02022a
**Timestamp:** 2026-08-28T02:19:43.499268
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // Missing: status, dbType, owner, context, decision, migrationStrategy, rollbackPlan
- // Missing: rollbackPlan
- // Missing: migrationStrategy

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * DBDR Template Tests
 *
 * Test suite for Database Decision Record template.
 *
 * @module tests/dbdr
 * @story 3.10 - Template DBDR
 */

'use strict';

const path = require('path');
const { TemplateEngine } = require('../../.aios-core/product/templates/engine');

describe('DBDR Template', () => {
  let engine;

  beforeAll(() => {
    engine = new TemplateEngine({
      interactive: false,
      baseDir: path.join(__dirname, '..', '..'),
    });
  });

  /**
   * DBDR-01: Generate DBDR with required fields
   * Priority: P0
   * AC: AC3.10.6 - JSON Schema valida output gerado
   */
  describe('DBDR-01: Generate DBDR with required fields', () => {
    it('should generate a valid DBDR document with all required fields', async () => {
      const context = {
        number: 1,
        title: 'Implement User Audit Trail Table',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'Data Engineer',
        context: 'We need to track all user actions for compliance and debugging purposes.',
        decision: 'Create a dedicated audit_trail table with partitioning by date for performance.',
        migrationStrategy: 'Blue-green deployment with dual-write during migration period.',
        rollbackPlan: 'Restore from pre-migration backup and disable audit triggers if issues occur.',
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toBeDefined();
      expect(result.content).toContain('# DBDR 001: Implement User Audit Trail Table');
      expect(result.content).toContain('**Status:** Proposed');
      expect(result.content).toContain('**Owner:** Data Engineer');
      expect(result.content).toContain('**Database:** PostgreSQL');
      expect(result.content).toContain('## Context');
      expect(result.content).toContain('## Decision');
      expect(result.content).toContain('## Migration Strategy');
      expect(result.content).toContain('## Rollback Plan');
      expect(result.templateType).toBe('dbdr');
    });

    it('should fail validation without required fields', async () => {
      const incompleteContext = {
        number: 1,
        title: 'Test',
        // Missing: status, dbType, owner, context, decision, migrationStrategy, rollbackPlan
      };

      await expect(
        engine.generate('dbdr', incompleteContext, { validate: true, save: false }),
      ).rejects.toThrow(/required.*has no default|missing required/i);
    });
  });

  /**
   * DBDR-02: Schema changes table renders
   * Priority: P0
   * AC: AC3.10.2 - Inclui seção de Schema Changes específica
   */
  describe('DBDR-02: Schema changes table renders', () => {
    it('should render schema changes as a table', async () => {
      const context = {
        number: 2,
        title: 'Add User Preferences Schema',
        status: 'Approved',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing schema changes rendering in DBDR template.',
        decision: 'Add new user_preferences table with JSON column for flexibility.',
        migrationStrategy: 'Online migration with zero downtime using pg_repack.',
        rollbackPlan: 'Drop table and restore from backup if validation fails.',
        schemaChanges: [
          { table: 'user_preferences', changeType: 'CREATE', description: 'New preferences table' },
          { table: 'users', changeType: 'ALTER', description: 'Add preference_id foreign key' },
          { table: 'user_preferences', changeType: 'INDEX', description: 'Index on user_id' },
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      // Check table headers
      expect(result.content).toContain('| Table | Change Type | Description |');
      expect(result.content).toContain('|-------|-------------|-------------|');

      // Check table rows
      expect(result.content).toContain('`user_preferences`');
      expect(result.content).toContain('CREATE');
      expect(result.content).toContain('New preferences table');
      expect(result.content).toContain('ALTER');
      expect(result.content).toContain('INDEX');
    });

    it('should show placeholder when no schema changes', async () => {
      const context = {
        number: 3,
        title: 'Query Optimization Decision',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing empty schema changes rendering.',
        decision: 'Optimize existing queries without schema changes.',
        migrationStrategy: 'No schema migration needed, only query updates.',
        rollbackPlan: 'Revert query changes via git if performance degrades.',
        // No schemaChanges
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('_No schema changes required._');
    });
  });

  /**
   * DBDR-03: SQL blocks render correctly
   * Priority: P0
   */
 
```