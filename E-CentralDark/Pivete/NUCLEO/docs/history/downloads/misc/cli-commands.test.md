# OUTRO - cli-commands.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\tests\core\cli-commands.test.js
**SHA:** f67ab139ebac84a2
**Timestamp:** 2026-08-28T13:25:25.887522
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: true,
- dryRun: true,
- await orchestrate('TEST-001', { projectRoot: tempDir, dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * CLI Commands Tests
 *
 * Story: 0.9 - CLI Commands
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Tests for CLI command handlers.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  orchestrate,
  orchestrateStatus,
  orchestrateStop,
  orchestrateResume,
  commands,
} = require('../../.aios-core/core/orchestration/cli-commands');

describe('CLI Commands (Story 0.9)', () => {
  let tempDir;
  let originalLog;
  let logOutput;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `cli-commands-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    // Capture console output
    logOutput = [];
    originalLog = console.log;
    console.log = (...args) => {
      logOutput.push(args.join(' '));
    };
  });

  afterEach(async () => {
    console.log = originalLog;
    await fs.remove(tempDir);
  });

  describe('Command Exports (AC7)', () => {
    it('should export all commands', () => {
      expect(commands).toBeDefined();
      expect(commands['orchestrate']).toBe(orchestrate);
      expect(commands['orchestrate-status']).toBe(orchestrateStatus);
      expect(commands['orchestrate-stop']).toBe(orchestrateStop);
      expect(commands['orchestrate-resume']).toBe(orchestrateResume);
    });
  });

  describe('orchestrate (AC1)', () => {
    it('should require story ID', async () => {
      const result = await orchestrate(null, { projectRoot: tempDir });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('required');
    });

    it('should execute pipeline and return result', async () => {
      const result = await orchestrate('TEST-001', { projectRoot: tempDir });

      expect(result).toBeDefined();
      expect(typeof result.exitCode).toBe('number');
    });

    it('should support --epic flag (AC5)', async () => {
      const result = await orchestrate('TEST-001', {
        projectRoot: tempDir,
        epic: 4,
      });

      expect(result).toBeDefined();
      // Should attempt to start from epic 4
    });

    it('should support --dry-run flag (AC6)', async () => {
      const result = await orchestrate('TEST-001', {
        projectRoot: tempDir,
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.exitCode).toBe(0);

      // Dry run initializes for tech stack detection but doesn't execute full pipeline
      // State file may be created during initialization, but status should show dryRun
    });

    it('should support --strict flag', async () => {
      const result = await orchestrate('TEST-001', {
        projectRoot: tempDir,
        strict: true,
        dryRun: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('orchestrateStatus (AC2)', () => {
    it('should require story ID', async () => {
      const result = await orchestrateStatus(null, { projectRoot: tempDir });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(3);
    });

    it('should return error if no state found', async () => {
      const result = await orchestrateStatus('NONEXISTENT', { projectRoot: tempDir });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('not found');
    });

    it('should show status when state exists', async () => {
      // Create state file
      const statePath = path.join(tempDir, '.aios', 'master-orchestrator', 'TEST-001.json');
      await fs.ensureDir(path.dirname(statePath));
      await fs.writeJson(statePath, {
        status: 'in_progress',
        currentEpic: 4,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        epics: {
          3: { status: 'completed' },
          4: { status: 'in_progress' },
          6: { status: 'pending' },
          7: { status: 'pending' },
        },
        errors: [],
      });

      const result = await orchestrateStatus('TEST-001', { projectRoot: tempDir });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.state).toBeDefined();
      expect(result.state.status).toBe('in_progress');
    });
  });

  describe('orchestrateStop (AC3)', () => {
    it('should require story ID', async () => {
      const result = await orchestrateStop(null, { projectRoot: tempDir });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(3);
    });

    it('should return error if no state found', async () => {
      const result = await orchestrateStop('NONEXISTENT', { projectRoot: tempDir });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it('should stop execution and update state', async () => {
      // Create state file
      const statePath = path.join(tempDir, '.aios', 'master-orchestrator', 'TEST-001.json');
 
```