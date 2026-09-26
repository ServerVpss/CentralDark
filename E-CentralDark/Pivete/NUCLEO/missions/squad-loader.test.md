# MISSAO - squad-loader.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-loader.test.js
**SHA:** 12cfceff57800d14
**Timestamp:** 2026-08-28T02:19:50.321893
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadLoader
 *
 * Test Coverage:
 * - resolve() finds existing squad
 * - resolve() throws SQUAD_NOT_FOUND for missing squad
 * - loadManifest() parses squad.yaml correctly
 * - loadManifest() parses config.yaml with deprecation warning
 * - loadManifest() throws YAML_PARSE_ERROR for malformed YAML
 * - listLocal() returns squads from directory
 * - listLocal() returns empty array when squads dir doesn't exist
 * - Performance metrics within targets
 * - Error handling with proper error codes
 *
 * @see Story SQS-2: Squad Loader Utility
 */

const path = require('path');
const {
  SquadLoader,
  SquadLoaderError,
  MANIFEST_FILES,
  DEFAULT_SQUADS_PATH,
  ErrorCodes,
} = require('../../../.aios-core/development/scripts/squad');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadLoader', () => {
  let loader;
  let consoleWarnSpy;
  let consoleLogSpy;

  beforeEach(() => {
    // Create loader with fixtures as squads path
    loader = new SquadLoader({
      squadsPath: FIXTURES_PATH,
      verbose: false,
    });

    // Spy on console methods
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should export MANIFEST_FILES with correct order', () => {
      expect(MANIFEST_FILES).toEqual(['squad.yaml', 'config.yaml']);
    });

    it('should export DEFAULT_SQUADS_PATH as ./squads', () => {
      expect(DEFAULT_SQUADS_PATH).toBe('./squads');
    });

    it('should export ErrorCodes enum', () => {
      expect(ErrorCodes).toBeDefined();
      expect(ErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(ErrorCodes.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
      expect(ErrorCodes.YAML_PARSE_ERROR).toBe('YAML_PARSE_ERROR');
      expect(ErrorCodes.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultLoader = new SquadLoader();
      expect(defaultLoader.squadsPath).toBe(DEFAULT_SQUADS_PATH);
    });

    it('should use custom squads path when specified', () => {
      const customLoader = new SquadLoader({ squadsPath: './custom/path' });
      expect(customLoader.squadsPath).toBe('./custom/path');
    });

    it('should disable verbose mode by default', () => {
      const defaultLoader = new SquadLoader();
      expect(defaultLoader.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      const verboseLoader = new SquadLoader({ verbose: true });
      expect(verboseLoader.verbose).toBe(true);
    });
  });

  describe('resolve()', () => {
    it('should resolve existing squad with squad.yaml (Test 4.1)', async () => {
      const result = await loader.resolve('valid-squad');

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('manifestPath');
      expect(result.path).toContain('valid-squad');
      expect(result.manifestPath).toContain('squad.yaml');
    });

    it('should resolve existing squad with config.yaml', async () => {
      const result = await loader.resolve('legacy-squad');

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('manifestPath');
      expect(result.path).toContain('legacy-squad');
      expect(result.manifestPath).toContain('config.yaml');
    });

    it('should throw SQUAD_NOT_FOUND for non-existent squad (Test 4.2)', async () => {
      await expect(loader.resolve('non-existent-squad')).rejects.toThrow(
        SquadLoaderError,
      );

      try {
        await loader.resolve('non-existent-squad');
      } catch (error) {
        expect(error).toBeInstanceOf(SquadLoaderError);
        expect(error.code).toBe(ErrorCodes.SQUAD_NOT_FOUND);
        expect(error.message).toContain('non-existent-squad');
        expect(error.suggestion).toContain('@squad-creator *create-squad');
      }
    });

    it('should throw MANIFEST_NOT_FOUND for squad without manifest', async () => {
      await expect(loader.resolve('invalid-squad')).rejects.toThrow(
        SquadLoaderError,
      );

      try {
        await loader.resolve('invalid-squad');
      } catch (error) {
        expect(error).toBeInstanceOf(SquadLoaderError);
        expect(error.code).toBe(ErrorCodes.MANIFEST_NOT_FOUND);
        expect(error.message).toContain('No manifest found');
        expect(error.suggestion).toContain('squad.yaml');
      }
    });

    it('should complete within 100ms (Test 4.7)', async () => {
      const start = Date.now();
      await loader.resolve('valid-squad');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('loadManifest()', () => {
    it('should parse squad.yaml correctly (Test 4.3)', async () => {
      const squadPath = path.join(FI
```