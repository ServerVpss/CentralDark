# MISSAO - squad-publisher.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-publisher.test.js
**SHA:** 67477d40897ee20b
**Timestamp:** 2026-08-28T02:19:50.400342
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: false,
- const dryRunPublisher = new SquadPublisher({ dryRun: true });
- 'Run: gh auth login',
- expect(error.suggestion).toBe('Run: gh auth login');
- 'Run: gh auth login',
- expect(str).toContain('Suggestion: Run: gh auth login');
- const dryRunPublisher = new SquadPublisher({ dryRun: true });
- const dryRunPublisher = new SquadPublisher({ dryRun: true });
- dryRun: true,
- dryRun: true,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadPublisher
 *
 * Test Coverage:
 * - checkAuth() detects gh auth status
 * - publish() validates before publishing
 * - publish() fails without auth
 * - --dry-run doesn't create PR
 * - generatePRBody() includes metadata
 * - Error handling with proper error codes
 *
 * @see Story SQS-6: Download & Publish Tasks
 */

const path = require('path');
const fs = require('fs').promises;
const {
  SquadPublisher,
  SquadPublisherError,
  PublisherErrorCodes,
  AIOS_SQUADS_REPO,
  SAFE_NAME_PATTERN,
  sanitizeForShell,
  isValidName,
} = require('../../../.aios-core/development/scripts/squad');

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
}));

const { execSync } = require('child_process');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');
const TEMP_PATH = path.join(__dirname, 'temp-publish');

describe('SquadPublisher', () => {
  let publisher;
  let consoleLogSpy;

  beforeEach(async () => {
    // Create publisher
    publisher = new SquadPublisher({
      verbose: false,
      dryRun: false,
    });

    // Spy on console
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Clean up temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
    await fs.mkdir(TEMP_PATH, { recursive: true });

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    // Clean up temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  describe('Constants', () => {
    it('should export AIOS_SQUADS_REPO', () => {
      expect(AIOS_SQUADS_REPO).toBe('SynkraAI/aios-squads');
    });

    it('should export PublisherErrorCodes enum', () => {
      expect(PublisherErrorCodes).toBeDefined();
      expect(PublisherErrorCodes.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(PublisherErrorCodes.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
      expect(PublisherErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(PublisherErrorCodes.MANIFEST_ERROR).toBe('MANIFEST_ERROR');
      expect(PublisherErrorCodes.PR_ERROR).toBe('PR_ERROR');
      expect(PublisherErrorCodes.INVALID_SQUAD_NAME).toBe('INVALID_SQUAD_NAME');
    });

    it('should export SAFE_NAME_PATTERN', () => {
      expect(SAFE_NAME_PATTERN).toBeDefined();
      expect(SAFE_NAME_PATTERN).toBeInstanceOf(RegExp);
    });
  });

  describe('sanitizeForShell()', () => {
    it('should return empty string for null/undefined', () => {
      expect(sanitizeForShell(null)).toBe('');
      expect(sanitizeForShell(undefined)).toBe('');
      expect(sanitizeForShell('')).toBe('');
    });

    it('should keep safe characters unchanged', () => {
      expect(sanitizeForShell('my-squad')).toBe('my-squad');
      expect(sanitizeForShell('squad_v1.0')).toBe('squad_v1.0');
      expect(sanitizeForShell('test123')).toBe('test123');
    });

    it('should replace unsafe characters with hyphens', () => {
      expect(sanitizeForShell('my squad')).toBe('my-squad');
      expect(sanitizeForShell('test$squad')).toBe('test-squad');
      expect(sanitizeForShell('test;rm -rf /')).toBe('test-rm-rf');
    });

    it('should collapse multiple hyphens', () => {
      expect(sanitizeForShell('my---squad')).toBe('my-squad');
      expect(sanitizeForShell('test   squad')).toBe('test-squad');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(sanitizeForShell('-squad-')).toBe('squad');
      expect(sanitizeForShell('--test--')).toBe('test');
    });
  });

  describe('isValidName()', () => {
    it('should return true for valid names', () => {
      expect(isValidName('my-squad')).toBe(true);
      expect(isValidName('squad_v1.0')).toBe(true);
      expect(isValidName('test123')).toBe(true);
      expect(isValidName('Squad-Name_v2.1.0')).toBe(true);
    });

    it('should return false for invalid names', () => {
      expect(isValidName('my squad')).toBe(false);
      expect(isValidName('test;rm')).toBe(false);
      expect(isValidName('test$var')).toBe(false);
      expect(isValidName('test\nline')).toBe(false);
    });

    it('should return false for null/undefined/empty', () => {
      expect(isValidName(null)).toBe(false);
      expect(isValidName(undefined)).toBe(false);
      expect(isValidName('')).toBe(false);
    });
  });

  describe('Constructor', () => {
    it('should disable verbose mode by default', () => {
      const defaultPublisher = new SquadPublisher();
      expect(defaultPublisher.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      const verbosePublisher = new SquadPublisher({ verbose: true });
      expect(verbosePublisher.verbose).toBe(true);
    });

    it('should disable dry run by default', () => {
      const defaultPublisher = new SquadPublisher();
      expect(d
```