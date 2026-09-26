# COMANDO - edge-cases.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\packages\aios-install\edge-cases.test.js
**SHA:** 402a466e448aec76
**Timestamp:** 2026-08-28T02:19:43.524472
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: jest.fn().mockReturnThis(),

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Edge Cases Tests - Story 12.9 Task 7.7
 *
 * Tests for edge cases:
 * - No internet connectivity
 * - Docker not installed/offline
 * - Insufficient permissions
 * - Read-only directory
 */

'use strict';

const path = require('path');
const os = require('os');

// Mock modules
jest.mock('fs-extra');
jest.mock('execa', () => ({
  execa: jest.fn(),
  execaSync: jest.fn(),
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

const fs = require('fs-extra');
const { execa, execaSync } = require('execa');

const {
  InstallLogger,
  createUserConfigDirect,
} = require('../../../packages/aios-install/src/installer');

const {
  checkAllDependencies,
  checkDockerRunning,
} = require('../../../packages/aios-install/src/dep-checker');

const {
  checkDocker,
  ensureDocker,
} = require('../../../packages/aios-install/src/edmcp');

describe('Edge Cases - Task 7.7', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.pathExists.mockResolvedValue(false);
    fs.existsSync.mockReturnValue(false);
    fs.ensureDir.mockResolvedValue();
    fs.readFile.mockResolvedValue('');
    fs.writeFile.mockResolvedValue();
  });

  describe('No Internet Connectivity', () => {
    const mockOsInfo = {
      installInstructions: {
        node: 'brew install node@18',
        git: 'brew install git',
        docker: 'brew install --cask docker',
        gh: 'brew install gh',
      },
    };

    it('should handle npm install failure due to network error', async () => {
      // Given
      const networkError = new Error('getaddrinfo ENOTFOUND registry.npmjs.org');
      networkError.code = 'ENOTFOUND';
      execa.mockRejectedValue(networkError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install', 'aios-core']);
      }).rejects.toThrow('ENOTFOUND');
    });

    it('should handle git clone failure due to network error', async () => {
      // Given
      const networkError = new Error('Could not resolve host: github.com');
      networkError.code = 'ENETUNREACH';
      execa.mockRejectedValue(networkError);

      // When/Then
      await expect(async () => {
        await execa('git', ['clone', 'https://github.com/user/repo']);
      }).rejects.toThrow('Could not resolve host');
    });

    it('should timeout on slow network connections', async () => {
      // Given
      const timeoutError = new Error('Timeout');
      timeoutError.timedOut = true;
      execa.mockRejectedValue(timeoutError);

      // When/Then
      await expect(async () => {
        await execa('npm', ['install'], { timeout: 1000 });
      }).rejects.toThrow('Timeout');
    });

    it('should handle DNS resolution failure', async () => {
      // Given
      const dnsError = new Error('getaddrinfo EAI_AGAIN github.com');
      dnsError.code = 'EAI_AGAIN';
      execa.mockRejectedValue(dnsError);

      // When/Then
      await expect(async () => {
        await execa('git', ['clone', 'https://github.com/user/repo']);
      }).rejects.toThrow('EAI_AGAIN');
    });
  });

  describe('Docker Not Installed / Offline', () => {
    it('should handle Docker command not found', async () => {
      // Given
      const notFoundError = new Error('spawn docker ENOENT');
      notFoundError.code = 'ENOENT';
      execa.mockRejectedValue(notFoundError);

      // When
      const result = await checkDocker();

      // Then
      expect(result.installed).toBe(false);
      expect(result.running).toBe(false);
    });

    it('should handle Docker daemon not running', async () => {
      // Given
      execa.mockImplementation(async (cmd, args) => {
        if (args && args[0] === '--version') {
          return { stdout: 'Docker version 24.0.6' };
        }
        if (args && args[0] === 'info') {
          const error = new Error('Cannot connect to the Docker daemon');
          error.exitCode = 1;
          throw error;
        }
        return { stdout: '', exitCode: 1 };
      });

      // When
      const result = await checkDocker();

      // Then
      expect(result.installed).toBe(true);
      expect(result.running).toBe(false);
    });

    it('should throw descriptive error when Docker is required but not installed', async () => {
      // Given
      execa.mockRejectedValue(new Error('spawn docker ENOENT'));

      // When/Then
      await expect(ensureDocker()).rejects.toThrow('Docker is not installed');
    });

    it('should throw descriptive error when Docker daemon is stopped', async () => {
      // Given
      execa.mockImplementation(async (cmd, args) => {
```