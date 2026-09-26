# OUTRO - squad-analyzer.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-analyzer.test.js
**SHA:** b6c1e02d22c0d6a6
**Timestamp:** 2026-08-28T02:19:50.165724
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadAnalyzer
 *
 * Test Coverage:
 * - analyze() returns complete analysis object
 * - loadManifest() loads and parses squad.yaml
 * - inventoryComponents() lists all component files
 * - calculateCoverage() computes correct metrics
 * - generateSuggestions() provides improvement hints
 * - formatReport() outputs console/markdown/json formats
 * - Error handling for missing squad, invalid manifest
 *
 * @see Story SQS-11: Squad Analyze & Extend
 */

const path = require('path');
const {
  SquadAnalyzer,
  SquadAnalyzerError,
  ErrorCodes,
  COMPONENT_DIRECTORIES,
} = require('../../../.aios-core/development/scripts/squad/squad-analyzer');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadAnalyzer', () => {
  let analyzer;
  let verboseAnalyzer;

  beforeEach(() => {
    analyzer = new SquadAnalyzer({ squadsPath: FIXTURES_PATH });
    verboseAnalyzer = new SquadAnalyzer({ squadsPath: FIXTURES_PATH, verbose: true });
  });

  describe('Constants', () => {
    it('should export ErrorCodes enum', () => {
      expect(ErrorCodes).toBeDefined();
      expect(ErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(ErrorCodes.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
      expect(ErrorCodes.YAML_PARSE_ERROR).toBe('YAML_PARSE_ERROR');
      expect(ErrorCodes.ANALYSIS_FAILED).toBe('ANALYSIS_FAILED');
    });

    it('should export COMPONENT_DIRECTORIES array', () => {
      expect(COMPONENT_DIRECTORIES).toBeDefined();
      expect(Array.isArray(COMPONENT_DIRECTORIES)).toBe(true);
      expect(COMPONENT_DIRECTORIES).toContain('agents');
      expect(COMPONENT_DIRECTORIES).toContain('tasks');
      expect(COMPONENT_DIRECTORIES).toContain('workflows');
      expect(COMPONENT_DIRECTORIES).toContain('templates');
      expect(COMPONENT_DIRECTORIES).toContain('tools');
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultAnalyzer = new SquadAnalyzer();
      expect(defaultAnalyzer.squadsPath).toBe('./squads');
    });

    it('should use custom squads path when specified', () => {
      expect(analyzer.squadsPath).toBe(FIXTURES_PATH);
    });

    it('should disable verbose mode by default', () => {
      expect(analyzer.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      expect(verboseAnalyzer.verbose).toBe(true);
    });
  });

  describe('SquadAnalyzerError', () => {
    it('should create error with code and message', () => {
      const error = new SquadAnalyzerError('TEST_ERROR', 'Test message', 'Test suggestion');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.suggestion).toBe('Test suggestion');
      expect(error.name).toBe('SquadAnalyzerError');
    });

    it('should create squadNotFound error with static method', () => {
      const error = SquadAnalyzerError.squadNotFound('my-squad');
      expect(error.code).toBe(ErrorCodes.SQUAD_NOT_FOUND);
      expect(error.message).toContain('my-squad');
      expect(error.suggestion).toContain('*list-squads');
    });

    it('should create manifestNotFound error with static method', () => {
      const error = SquadAnalyzerError.manifestNotFound('/path/to/squad');
      expect(error.code).toBe(ErrorCodes.MANIFEST_NOT_FOUND);
      expect(error.message).toContain('squad.yaml');
    });
  });

  describe('analyze()', () => {
    it('should return complete analysis for valid squad', async () => {
      const result = await analyzer.analyze('analyze-test-squad');

      expect(result).toBeDefined();
      expect(result.overview).toBeDefined();
      expect(result.inventory).toBeDefined();
      expect(result.coverage).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.squadPath).toBeDefined();
    });

    it('should include correct overview fields', async () => {
      const result = await analyzer.analyze('analyze-test-squad');

      expect(result.overview.name).toBe('analyze-test-squad');
      expect(result.overview.version).toBe('1.0.0');
      expect(result.overview.author).toBe('test');
    });

    it('should throw SquadAnalyzerError for non-existent squad', async () => {
      await expect(analyzer.analyze('non-existent-squad'))
        .rejects
        .toThrow(SquadAnalyzerError);
    });

    it('should respect suggestions option', async () => {
      const resultWithSuggestions = await analyzer.analyze('analyze-test-squad', { suggestions: true });
      const resultWithoutSuggestions = await analyzer.analyze('analyze-test-squad', { suggestions: false });

      expect(resultWithSuggestions.suggestions.length).toBeGreaterThanOrEqual(0);
      expect(resultWithoutSuggestions.suggestions).toHaveLength(0);
    });
  });

  describe('loadManifest()', () => {
    it('should load and parse squad.yaml', async () => {
      const squadPath = path.join(FIXTURES_PAT
```