# COMANDO - installer.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\packages\aios-install\installer.test.js
**SHA:** cc641dc627bbd9c7
**Timestamp:** 2026-08-28T02:19:43.541557
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: jest.fn().mockReturnThis(),
- const logger = new InstallLogger({ dryRun: true });
- const logger = new InstallLogger({ dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Installer Tests
 *
 * Tests for the main installer logic including profile selection,
 * brownfield detection, and dry-run mode.
 */

'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');

// Mock modules
jest.mock('fs-extra');
jest.mock('execa', () => ({
  execa: jest.fn(),
}));
jest.mock('@clack/prompts', () => ({
  intro: jest.fn(),
  outro: jest.fn(),
  select: jest.fn(),
  confirm: jest.fn(),
  note: jest.fn(),
  isCancel: jest.fn(() => false),
  cancel: jest.fn(),
}));
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    info: jest.fn().mockReturnThis(),
  }));
});

const { execa } = require('execa');
const { select, confirm } = require('@clack/prompts');

const {
  InstallTimer,
  InstallLogger,
  detectBrownfield,
  tryLoadConfigResolver,
  createUserConfigDirect,
} = require('../../../packages/aios-install/src/installer');

describe('installer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.pathExists.mockResolvedValue(false);
    fs.existsSync.mockReturnValue(false);
    fs.ensureDir.mockResolvedValue();
    fs.readFile.mockResolvedValue('');
    fs.writeFile.mockResolvedValue();
  });

  describe('InstallTimer', () => {
    it('should track elapsed time', () => {
      // Given
      const timer = new InstallTimer();

      // When
      const elapsed = timer.elapsed();

      // Then
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan(1); // Should be nearly instant
    });

    it('should format elapsed time correctly', () => {
      // Given
      const timer = new InstallTimer();

      // When
      const formatted = timer.elapsedFormatted();

      // Then
      expect(formatted).toMatch(/^\d+s$/);
    });

    it('should detect timeout', () => {
      // Given
      const timer = new InstallTimer();

      // When
      const isTimeout = timer.checkTimeout(0); // 0 seconds max

      // Then
      // Even instant check might be > 0ms
      expect(typeof isTimeout).toBe('boolean');
    });
  });

  describe('InstallLogger', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log info messages', () => {
      // Given
      const logger = new InstallLogger();

      // When
      logger.info('Test message');

      // Then
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test message'));
    });

    it('should prefix dry-run messages', () => {
      // Given
      const logger = new InstallLogger({ dryRun: true });

      // When
      logger.info('Test message');

      // Then
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[DRY-RUN]'));
    });

    it('should log debug messages only when verbose', () => {
      // Given
      const loggerQuiet = new InstallLogger({ verbose: false });
      const loggerVerbose = new InstallLogger({ verbose: true });

      // When
      loggerQuiet.debug('Debug message');
      loggerVerbose.debug('Debug message');

      // Then
      expect(consoleSpy).toHaveBeenCalledTimes(1); // Only verbose logger
    });

    it('should log action messages in dry-run mode', () => {
      // Given
      const logger = new InstallLogger({ dryRun: true });

      // When
      logger.action('Create file');

      // Then
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Would:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Create file'));
    });
  });

  describe('detectBrownfield', () => {
    it('should detect greenfield (no existing AIOS)', () => {
      // Given
      fs.existsSync.mockReturnValue(false);

      // When
      const result = detectBrownfield('/test/project');

      // Then
      expect(result.isBrownfield).toBe(false);
      expect(result.hasLegacyConfig).toBe(false);
      expect(result.hasLayeredConfig).toBe(false);
    });

    it('should detect brownfield with legacy config', () => {
      // Given
      fs.existsSync.mockImplementation((p) => {
        // Only legacy config exists, not framework-config
        if (p.includes('core-config.yaml')) return true;
        if (p.includes('framework-config.yaml')) return false;
        if (p.includes('.aios-core') && !p.includes('.yaml')) return true;
        return false;
      });

      // When
      const result = detectBrownfield('/test/project');

      // Then
      expect(result.isBrownfield).toBe(true);
      expect(result.hasLegacyConfig).toBe(true);
      expect(result.hasLayeredConfig).toBe(false);
    });

    it('should detect brownfield with layered config', () => {
      // Given
      fs.existsSync.mockImplementation((p) => {
        if (p.incl
```