# AGENTE - agent-config-enrichment.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\tests\core\agent-config-enrichment.test.js
**SHA:** b2c15e17d19a60ee
**Timestamp:** 2026-08-28T13:25:25.396584
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests for Story ACT-8: Agent Config Loading + Document Governance
 *
 * Test Coverage:
 * - All 7 data files exist on disk
 * - Enriched agents load correct files from agent-config-requirements.yaml
 * - YAML parses correctly after enrichment
 * - All files referenced in config exist on disk
 * - Performance targets documented for all agents
 * - source-tree.md governance section contains all required files
 * - update-source-tree.md task file exists
 * - aios-master has *update-source-tree command
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Helper: load and parse YAML file
 */
function loadYaml(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(content);
}

/**
 * Helper: read file content
 */
function readFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Helper: check file exists
 */
function fileExists(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  return fs.existsSync(fullPath);
}

describe('Story ACT-8: Agent Config Enrichment', () => {
  let agentConfig;

  beforeAll(() => {
    agentConfig = loadYaml('.aios-core/data/agent-config-requirements.yaml');
  });

  describe('YAML Validity', () => {
    test('agent-config-requirements.yaml parses without errors', () => {
      expect(agentConfig).toBeDefined();
      expect(agentConfig.agents).toBeDefined();
      expect(typeof agentConfig.agents).toBe('object');
    });

    test('all expected agents have entries', () => {
      const expectedAgents = [
        'aios-master', 'dev', 'qa', 'devops', 'github-devops',
        'architect', 'po', 'sm', 'data-engineer', 'db-sage',
        'pm', 'analyst', 'ux-design-expert', 'squad-creator',
        'aios-developer', 'aios-orchestrator', 'default',
      ];

      for (const agentId of expectedAgents) {
        expect(agentConfig.agents).toHaveProperty(agentId);
      }
    });
  });

  describe('7 Required Data Files Exist on Disk', () => {
    const requiredFiles = [
      { path: 'docs/framework/coding-standards.md', owner: '@dev' },
      { path: 'docs/framework/tech-stack.md', owner: '@architect' },
      { path: '.aios-core/data/technical-preferences.md', owner: '@architect' },
      { path: '.aios-core/product/data/test-levels-framework.md', owner: '@qa' },
      { path: '.aios-core/product/data/test-priorities-matrix.md', owner: '@qa' },
      { path: '.aios-core/product/data/brainstorming-techniques.md', owner: '@analyst' },
      { path: '.aios-core/product/data/elicitation-methods.md', owner: '@po' },
    ];

    test.each(requiredFiles)('$path exists on disk (owner: $owner)', ({ path: filePath }) => {
      expect(fileExists(filePath)).toBe(true);
    });
  });

  describe('All Files Referenced in Config Exist', () => {
    test('every files_loaded path resolves to an existing file', () => {
      const missing = [];

      for (const [agentId, config] of Object.entries(agentConfig.agents)) {
        for (const fileEntry of (config.files_loaded || [])) {
          const fp = typeof fileEntry === 'string' ? fileEntry : fileEntry.path;
          if (fp && !fileExists(fp)) {
            missing.push({ agent: agentId, file: fp });
          }
        }
      }

      expect(missing).toEqual([]);
    });
  });

  describe('Enriched Agent: @pm', () => {
    test('pm now loads coding-standards.md and tech-stack.md', () => {
      const pm = agentConfig.agents.pm;
      expect(pm.files_loaded).toBeDefined();
      expect(pm.files_loaded.length).toBe(2);

      const paths = pm.files_loaded.map(f => f.path);
      expect(paths).toContain('docs/framework/coding-standards.md');
      expect(paths).toContain('docs/framework/tech-stack.md');
    });

    test('pm performance target is <100ms', () => {
      expect(agentConfig.agents.pm.performance_target).toBe('<100ms');
    });
  });

  describe('Enriched Agent: @ux-design-expert', () => {
    test('ux-design-expert now loads tech-stack.md and coding-standards.md', () => {
      const ux = agentConfig.agents['ux-design-expert'];
      expect(ux.files_loaded).toBeDefined();
      expect(ux.files_loaded.length).toBe(2);

      const paths = ux.files_loaded.map(f => f.path);
      expect(paths).toContain('docs/framework/tech-stack.md');
      expect(paths).toContain('docs/framework/coding-standards.md');
    });

    test('ux-design-expert performance target is <100ms', () => {
      expect(agentConfig.agents['ux-design-expert'].performance_target).toBe('<100ms');
    });
  });

  describe('Enriched Agent: @analyst', () => {
    test('analyst now loads brainstorming-techniques, tech-stack, and source-tree', () => {
      const analyst = agentConfig.agents.analyst;
      expect(analyst.files_loaded).toBeDefined();
      expect(analyst.files_loaded.length).toBe(3);

      c
```