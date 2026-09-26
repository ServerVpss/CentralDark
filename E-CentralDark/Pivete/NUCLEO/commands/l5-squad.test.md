# COMANDO - l5-squad.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\l5-squad.test.js
**SHA:** e9ffec736afdb2c2
**Timestamp:** 2026-08-28T02:19:43.267331
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',
- prompt: '',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * L5 Squad Processor Tests
 *
 * Tests for squad discovery, namespace prefixing, cache TTL,
 * merge rules, active squad prioritization, graceful degradation,
 * and missing directory handling.
 *
 * @story SYN-5 - Layer Processors L4-L7
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aios-core/core/synapse/layers/layer-processor');
const L5SquadProcessor = require('../../.aios-core/core/synapse/layers/l5-squad');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l5-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Helper to create a squad structure with .synapse/manifest and domain files.
 */
function createSquad(projectRoot, squadName, manifestContent, domainFiles = {}) {
  const squadDir = path.join(projectRoot, 'squads', squadName, '.synapse');
  fs.mkdirSync(squadDir, { recursive: true });
  fs.writeFileSync(path.join(squadDir, 'manifest'), manifestContent);
  for (const [fileName, content] of Object.entries(domainFiles)) {
    fs.writeFileSync(path.join(squadDir, fileName), content);
  }
}

describe('L5SquadProcessor', () => {
  let tempDir;
  let processor;
  let synapsePath;

  beforeEach(() => {
    tempDir = createTempDir();
    synapsePath = path.join(tempDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });
    processor = new L5SquadProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to squad', () => {
      expect(processor.name).toBe('squad');
    });

    test('should set layer to 5', () => {
      expect(processor.layer).toBe(5);
    });

    test('should set timeout to 20ms', () => {
      expect(processor.timeout).toBe(20);
    });
  });

  describe('process()', () => {
    test('should discover squad domains and return rules', () => {
      createSquad(tempDir, 'copy-chief', [
        'HEADLINES_STATE=active',
        'HEADLINES_RECALL=headline,title',
      ].join('\n'), {
        'headlines': 'HEADLINES_RULE_1=Write compelling headlines\nHEADLINES_RULE_2=Use power words',
      });

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules.length).toBeGreaterThan(0);
      expect(result.metadata.layer).toBe(5);
      expect(result.metadata.squadsFound).toBe(1);
      expect(result.metadata.domainsLoaded.length).toBeGreaterThan(0);
    });

    test('should namespace domain keys with squad name uppercase', () => {
      createSquad(tempDir, 'my-squad', [
        'RULES_STATE=active',
      ].join('\n'), {
        'rules': 'Rule one\nRule two',
      });

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.metadata.domainsLoaded).toEqual(
        expect.arrayContaining([expect.stringContaining('MY-SQUAD_')]),
      );
    });

    test('should return null when squads/ directory is missing', () => {
      // tempDir has no squads/ directory
      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when squads/ exists but no squad has .synapse/', () => {
      fs.mkdirSync(path.join(tempDir, 'squads', 'empty-squad'), { recursive: true });

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when squad manifest has no domains', () => {
      const squadDir = path.join(tempDir, 'squads', 'bare-squad', '.synapse');
      fs.mkdirSync(squadDir, { recursive: true });
      fs.writeFileSync(path.join(squadDir, 'manifest'), 'DEVMODE=true\n');

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should discover multiple squads', () => {
      createSquad(tempDir, 'squad-alpha', 'ALPHA_STATE=active\n', {
        'alpha': 'Alpha rule 1',
      });
      createSquad(tempDir, 'squad-bet
```