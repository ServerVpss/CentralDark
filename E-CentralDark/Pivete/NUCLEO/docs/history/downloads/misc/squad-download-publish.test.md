# OUTRO - squad-download-publish.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\integration\squad\squad-download-publish.test.js
**SHA:** 1185e62adffff157
**Timestamp:** 2026-08-28T02:19:40.088820
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: true, // Always dry-run in tests
- dryRun: true, // Use dry-run to avoid actual PR creation

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Integration Tests for Squad Download & Publish
 *
 * These tests verify the integration between SquadDownloader, SquadPublisher,
 * and other squad components (SquadValidator, SquadLoader).
 *
 * Note: Network-dependent tests are skipped by default.
 * Set AIOS_INTEGRATION_TESTS=true to run network tests.
 *
 * @see Story SQS-6: Download & Publish Tasks
 */

const path = require('path');
const fs = require('fs').promises;

// Mock child_process for GitHub CLI auth in CI environments
jest.mock('child_process', () => {
  const actual = jest.requireActual('child_process');
  return {
    ...actual,
    execSync: jest.fn((cmd, opts) => {
      // Mock gh auth status to return authenticated
      if (cmd === 'gh auth status') {
        return 'Logged in to github.com as ci-test-user';
      }
      // Fall through to actual for other commands
      return actual.execSync(cmd, opts);
    }),
  };
});

const {
  SquadDownloader,
  SquadPublisher,
  SquadValidator,
  SquadLoader,
} = require('../../../.aios-core/development/scripts/squad');

// Test paths - use unique directory to avoid parallel test collisions
const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures', 'squad');
const TEMP_PATH = path.join(__dirname, 'temp-download-publish');

// Check if network tests should run
const RUN_NETWORK_TESTS = process.env.AIOS_INTEGRATION_TESTS === 'true';

describe('Squad Download & Publish Integration', () => {
  let downloader;
  let publisher;
  let validator;
  let loader;

  beforeAll(async () => {
    // Create temp directory
    await fs.mkdir(TEMP_PATH, { recursive: true });
  });

  afterAll(async () => {
    // Clean up temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  beforeEach(() => {
    downloader = new SquadDownloader({
      squadsPath: TEMP_PATH,
      verbose: false,
    });

    publisher = new SquadPublisher({
      verbose: false,
      dryRun: true, // Always dry-run in tests
    });

    validator = new SquadValidator({
      verbose: false,
    });

    loader = new SquadLoader({
      squadsPath: TEMP_PATH,
    });
  });

  afterEach(async () => {
    // Clean temp directory between tests
    try {
      const entries = await fs.readdir(TEMP_PATH);
      for (const entry of entries) {
        await fs.rm(path.join(TEMP_PATH, entry), { recursive: true, force: true });
      }
    } catch {
      // Directory may not exist, ignore
    }
  });

  describe('Round-trip: create -> validate -> publish (Test 4.3)', () => {
    it('should complete full publish workflow with dry-run', async () => {
      // Step 1: Create a new squad manually (instead of using generator with template)
      const squadPath = path.join(TEMP_PATH, 'integration-test-squad');
      await fs.mkdir(squadPath, { recursive: true });
      await fs.mkdir(path.join(squadPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });

      await fs.writeFile(
        path.join(squadPath, 'squad.yaml'),
        `name: integration-test-squad
version: 1.0.0
description: Squad created for integration testing
author: Test Suite
license: MIT
components:
  tasks:
    - sample-task.md
`,
      );

      await fs.writeFile(
        path.join(squadPath, 'tasks', 'sample-task.md'),
        `---
task: Sample Task
responsavel: "@integration"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - input: Test input
Saida: |
  - output: Test output
Checklist:
  - "[ ] Sample step"
---

# Sample Task

This is a sample task for integration testing.
`,
      );

      expect(
        await fs
          .access(squadPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);

      // Step 2: Validate the created squad
      const validationResult = await validator.validate(squadPath);

      // May have warnings but should be structurally valid
      expect(validationResult).toHaveProperty('valid');
      expect(validationResult).toHaveProperty('errors');
      expect(validationResult).toHaveProperty('warnings');

      // Step 3: Load manifest to verify structure
      const manifest = await loader.loadManifest(squadPath);

      expect(manifest.name).toBe('integration-test-squad');
      expect(manifest.version).toBeDefined();

      // Step 4: Publish with dry-run (gh auth is mocked globally)
      const publishResult = await publisher.publish(squadPath);

      expect(publishResult.prUrl).toBe('[dry-run] PR would be created');
      expect(publishResult.branch).toContain('squad/integration-test-squad');
      expect(publishResult.manifest.name).toBe('integration-test-squad');
      expect(publishResult.preview).toBeDefined();
    });
  });

  describe('List available squads from registry (Test 4.4)', () => {
    // This test requires network access
    const conditionalTest = RUN_NETWORK_TESTS ? it : it.skip;

    conditionalTest(
      'should list squads from aios-squads regi
```