# OUTRO - squad-analyze-extend.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\integration\squad\squad-analyze-extend.test.js
**SHA:** 1f7777299c1039de
**Timestamp:** 2026-08-28T02:19:40.067814
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Integration Tests for Squad Analyze & Extend
 *
 * Test Coverage:
 * - Complete analyze workflow from command to output
 * - Complete extend workflow with all component types
 * - Analyze -> Extend -> Validate pipeline
 * - Template rendering with all placeholders
 * - Manifest updates preserve YAML formatting
 * - Multiple component additions in sequence
 *
 * @see Story SQS-11: Squad Analyze & Extend
 */

const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const { SquadAnalyzer } = require('../../../.aios-core/development/scripts/squad/squad-analyzer');
const { SquadExtender } = require('../../../.aios-core/development/scripts/squad/squad-extender');

// Test directory for integration tests - use unique directory to avoid parallel test collisions
const INTEGRATION_PATH = path.join(__dirname, 'temp-analyze-extend');

describe('Squad Analyze & Extend Integration', () => {
  let analyzer;
  let extender;
  let testSquadPath;

  beforeAll(async () => {
    // Create integration test directory
    await fs.mkdir(INTEGRATION_PATH, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup integration test directory
    try {
      await fs.rm(INTEGRATION_PATH, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  beforeEach(async () => {
    // Create fresh test squad for each test
    testSquadPath = path.join(INTEGRATION_PATH, `test-squad-${Date.now()}`);

    // Create squad structure
    await fs.mkdir(path.join(testSquadPath, 'agents'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'tasks'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'workflows'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'checklists'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'templates'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'tools'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'scripts'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'data'), { recursive: true });

    // Create initial manifest
    const manifest = {
      name: 'integration-test-squad',
      version: '1.0.0',
      description: 'Integration test squad',
      author: 'test',
      aios: { minVersion: '2.1.0' },
      components: {
        agents: ['initial-agent.md'],
        tasks: [],
        workflows: [],
        checklists: [],
        templates: [],
        tools: [],
        scripts: [],
        data: [],
      },
    };
    await fs.writeFile(path.join(testSquadPath, 'squad.yaml'), yaml.dump(manifest));

    // Create initial agent
    await fs.writeFile(
      path.join(testSquadPath, 'agents', 'initial-agent.md'),
      '# initial-agent\n\nInitial test agent.\n',
    );

    // Initialize analyzer and extender pointing to parent directory
    analyzer = new SquadAnalyzer({ squadsPath: INTEGRATION_PATH });
    extender = new SquadExtender({ squadsPath: INTEGRATION_PATH });
  });

  describe('Complete Analyze Workflow', () => {
    it('should analyze squad and return complete report', async () => {
      const squadName = path.basename(testSquadPath);
      const result = await analyzer.analyze(squadName);

      // Verify overview
      expect(result.overview.name).toBe('integration-test-squad');
      expect(result.overview.version).toBe('1.0.0');
      expect(result.overview.author).toBe('test');

      // Verify inventory
      expect(result.inventory.agents).toContain('initial-agent.md');
      expect(result.inventory.tasks).toHaveLength(0);

      // Verify coverage
      expect(result.coverage.agents.total).toBe(1);
      expect(result.coverage.agents.withTasks).toBe(0);

      // Verify suggestions exist
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should format report in all output formats', async () => {
      const squadName = path.basename(testSquadPath);
      const result = await analyzer.analyze(squadName);

      // Console format
      const consoleReport = analyzer.formatReport(result, 'console');
      expect(consoleReport).toContain('Squad Analysis');
      expect(consoleReport).toContain('integration-test-squad');

      // JSON format
      const jsonReport = analyzer.formatReport(result, 'json');
      const parsed = JSON.parse(jsonReport);
      expect(parsed.overview.name).toBe('integration-test-squad');

      // Markdown format
      const mdReport = analyzer.formatReport(result, 'markdown');
      expect(mdReport).toContain('# Squad Analysis');
      expect(mdReport).toContain('## Overview');
    });
  });

  describe('Complete Extend Workflow', () => {
    it('should add agent component', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'agent',
        name: 'new-agent',
        description: 'A new agent for testing',
      });

      expect(
```