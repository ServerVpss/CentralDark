# COMANDO - l6-keyword.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\l6-keyword.test.js
**SHA:** 16a4808479e83ed1
**Timestamp:** 2026-08-28T02:19:43.533045
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: 'check the security of this code',
- prompt: 'I need to write tests and check performance',
- prompt: 'just a random prompt',
- prompt: '',
- prompt: 'some prompt',
- prompt: 'security skip-rules please',
- prompt: 'security but no-inject please',
- prompt: 'dev agent help',
- prompt: 'dev testing help',
- prompt: 'security check',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * L6 Keyword Processor Tests
 *
 * Tests for keyword matching, exclusion, deduplication against
 * previous layers, no-match handling, and metadata correctness.
 *
 * @story SYN-5 - Layer Processors L4-L7
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aios-core/core/synapse/layers/layer-processor');
const L6KeywordProcessor = require('../../.aios-core/core/synapse/layers/l6-keyword');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l6-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('L6KeywordProcessor', () => {
  let tempDir;
  let processor;

  beforeEach(() => {
    tempDir = createTempDir();
    processor = new L6KeywordProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to keyword', () => {
      expect(processor.name).toBe('keyword');
    });

    test('should set layer to 6', () => {
      expect(processor.layer).toBe(6);
    });

    test('should set timeout to 15ms', () => {
      expect(processor.timeout).toBe(15);
    });
  });

  describe('process()', () => {
    test('should match keyword and load domain rules', () => {
      fs.writeFileSync(path.join(tempDir, 'security'), [
        'SEC_RULE_1=Validate all user inputs',
        'SEC_RULE_2=Use parameterized queries',
      ].join('\n'));

      const context = {
        prompt: 'check the security of this code',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              SECURITY: {
                file: 'security',
                recall: ['security', 'vulnerability'],
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toContain('Validate all user inputs');
      expect(result.metadata.layer).toBe(6);
      expect(result.metadata.matchedDomains).toContain('SECURITY');
      expect(result.metadata.skippedDuplicates).toHaveLength(0);
    });

    test('should match multiple domains with different keywords', () => {
      fs.writeFileSync(path.join(tempDir, 'testing'), 'TEST_RULE_1=Write tests first\n');
      fs.writeFileSync(path.join(tempDir, 'performance'), 'PERF_RULE_1=Optimize hot paths\n');

      const context = {
        prompt: 'I need to write tests and check performance',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              TESTING: { file: 'testing', recall: ['test', 'testing'] },
              PERFORMANCE: { file: 'performance', recall: ['performance', 'optimize'] },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(2);
      expect(result.metadata.matchedDomains).toEqual(
        expect.arrayContaining(['TESTING', 'PERFORMANCE']),
      );
    });

    test('should return null when no keywords match', () => {
      const context = {
        prompt: 'just a random prompt',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              SECURITY: { file: 'security', recall: ['security'] },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when prompt is empty', () => {
      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when no domains have recall keywords', () => {
      const context = {
        prompt: 'some prompt',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            globalExclude: [],
            domains: {
              AGENT_DEV: { file: 'agent-dev', agentTrigger: 'dev' },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should respect global exclusion', () => {
      fs.writeFileSync(path.join(tempDir, 'security'), 'SEC_RULE_1=Rule\n');

      const context = {
        prompt: 'security skip-
```