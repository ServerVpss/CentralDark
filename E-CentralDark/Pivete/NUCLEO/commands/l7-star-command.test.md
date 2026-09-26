# COMANDO - l7-star-command.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\l7-star-command.test.js
**SHA:** 0749fb99bee78cd2
**Timestamp:** 2026-08-28T02:19:43.330114
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: '*help',
- prompt: '*dev *brief implement the feature',
- prompt: 'just a regular prompt without commands',
- prompt: '',
- prompt: '*help',
- prompt: '*unknown-command',
- prompt: '*help and then *help again',
- prompt: '*run-tests for this feature',
- prompt: 'this is **bold** text and *italic* text',
- prompt: 'please *develop story SYN-5 now',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * L7 Star-Command Processor Tests
 *
 * Tests for star-command detection, multi-command support,
 * command block parsing, no-command handling, and edge cases.
 *
 * @story SYN-5 - Layer Processors L4-L7
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aios-core/core/synapse/layers/layer-processor');
const L7StarCommandProcessor = require('../../.aios-core/core/synapse/layers/l7-star-command');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l7-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('L7StarCommandProcessor', () => {
  let tempDir;
  let processor;

  beforeEach(() => {
    tempDir = createTempDir();
    processor = new L7StarCommandProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to star-command', () => {
      expect(processor.name).toBe('star-command');
    });

    test('should set layer to 7', () => {
      expect(processor.layer).toBe(7);
    });

    test('should set timeout to 5ms', () => {
      expect(processor.timeout).toBe(5);
    });
  });

  describe('process()', () => {
    test('should detect single star-command and load rules', () => {
      fs.writeFileSync(path.join(tempDir, 'commands'), [
        '[*help] COMMAND:',
        '0. Show available commands',
        '1. Use bullet points',
        '2. Max 5 items',
      ].join('\n'));

      const context = {
        prompt: '*help',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules).toHaveLength(3);
      expect(result.rules[0]).toContain('Show available commands');
      expect(result.metadata.layer).toBe(7);
      expect(result.metadata.commands).toContain('help');
    });

    test('should detect multiple star-commands in same prompt', () => {
      fs.writeFileSync(path.join(tempDir, 'commands'), [
        '[*dev] COMMAND:',
        '0. Code over explanation',
        '[*brief] COMMAND:',
        '0. Use bullet points only',
      ].join('\n'));

      const context = {
        prompt: '*dev *brief implement the feature',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.metadata.commands).toEqual(
        expect.arrayContaining(['dev', 'brief']),
      );
      expect(result.rules.length).toBeGreaterThanOrEqual(2);
    });

    test('should return null when no star-commands in prompt', () => {
      const context = {
        prompt: 'just a regular prompt without commands',
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

    test('should return null when commands file is missing', () => {
      const context = {
        prompt: '*help',
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

    test('should return null when command not found in commands file', () => {
      fs.writeFileSync(path.join(tempDir, 'commands'), [
        '[*help] COMMAND:',
        '0. Show commands',
      ].join('\n'));

      const context = {
        prompt: '*unknown-command',
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

    test('should deduplicate repeated star-commands in prompt', () => {
      fs.writeFileSync(path.join(tempDir, 'commands'), [
        '[*help] COMMAND:',
        '0. Show commands',
      ].join('\n'));

      const context = {
        prompt: '*help and then *help again',
        session: {},
        config: {
          synapsePath: tempDir,
          manifest: { domains: {
```