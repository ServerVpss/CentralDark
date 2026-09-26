# COMANDO - l0-constitution.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\l0-constitution.test.js
**SHA:** 265f2a6c2609d2e8
**Timestamp:** 2026-08-28T02:19:43.472201
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: 'test prompt',
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
 * L0 Constitution Processor Tests
 *
 * Tests for constitution rule loading, nonNegotiable validation,
 * graceful degradation on missing files, and ALWAYS_ON behavior.
 *
 * @story SYN-4 - Layer Processors L0-L3
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aios-core/core/synapse/layers/layer-processor');
const L0ConstitutionProcessor = require('../../.aios-core/core/synapse/layers/l0-constitution');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l0-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('L0ConstitutionProcessor', () => {
  let tempDir;
  let processor;

  beforeEach(() => {
    tempDir = createTempDir();
    processor = new L0ConstitutionProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to constitution', () => {
      expect(processor.name).toBe('constitution');
    });

    test('should set layer to 0', () => {
      expect(processor.layer).toBe(0);
    });

    test('should set timeout to 5ms', () => {
      expect(processor.timeout).toBe(5);
    });
  });

  describe('process()', () => {
    test('should load constitution rules from domain file', () => {
      // Given: constitution domain file with rules
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, [
        'CONSTITUTION_RULE_ART1_0=CLI First (NON-NEGOTIABLE)',
        'CONSTITUTION_RULE_ART2_0=Agent Authority (NON-NEGOTIABLE)',
        'CONSTITUTION_RULE_ART3_0=Story-Driven (MUST)',
      ].join('\n'));

      const context = {
        prompt: 'test prompt',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                alwaysOn: true,
                nonNegotiable: true,
                file: 'constitution',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(3);
      expect(result.rules[0]).toContain('CLI First');
      expect(result.metadata.layer).toBe(0);
      expect(result.metadata.source).toBe('constitution');
      expect(result.metadata.nonNegotiable).toBe(true);
    });

    test('should validate nonNegotiable flag from manifest', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, 'RULE_1=Test rule\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                nonNegotiable: true,
                file: 'constitution',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result.metadata.nonNegotiable).toBe(true);
    });

    test('should set nonNegotiable false when not in manifest', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, 'RULE_1=Test rule\n');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                file: 'constitution',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result.metadata.nonNegotiable).toBe(false);
    });

    test('should return null when domain file is missing', () => {
      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                file: 'nonexistent-file',
              },
            },
          },
        },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when domain file is empty', () => {
      const constitutionFile = path.join(tempDir, 'constitution');
      fs.writeFileSync(constitutionFile, '');

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: {
            domains: {
              CONSTITUTION: {
                state: 'active',
                file: 'constitution',
         
```