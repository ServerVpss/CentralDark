# COMANDO - license-api.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\license\license-api.test.js
**SHA:** d282d442f4683b7e
**Timestamp:** 2026-08-28T02:19:40.245063
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = performance.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit tests for license-api.js
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-1, AC-7a, AC-7b - Activation, Deactivation (online/offline)
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { LicenseApiClient, licenseApi } = require('../../pro/license/license-api');
const { LicenseActivationError } = require('../../pro/license/errors');
const {
  setPendingDeactivation,
  clearPendingDeactivation,
  hasPendingDeactivation,
} = require('../../pro/license/license-cache');

describe('license-api', () => {
  let server;
  let serverPort;
  let serverUrl;
  let testDir;
  let originalCwd;

  // Create a mock HTTP server for testing
  function createMockServer(handler) {
    return new Promise((resolve) => {
      server = http.createServer(handler);
      server.listen(0, '127.0.0.1', () => {
        serverPort = server.address().port;
        serverUrl = `http://127.0.0.1:${serverPort}`;
        resolve();
      });
    });
  }

  function closeMockServer() {
    return new Promise((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  beforeEach(() => {
    // Create temp directory for pending deactivation tests
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-api-test-'));
    originalCwd = process.cwd;
    process.cwd = () => testDir;
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    await closeMockServer();

    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('LicenseApiClient constructor', () => {
    it('should use default config', () => {
      const client = new LicenseApiClient();

      expect(client.baseUrl).toBe(process.env.AIOS_LICENSE_API_URL || 'https://api.synkra.ai');
      expect(client.timeoutMs).toBe(10000);
    });

    it('should accept custom config', () => {
      const client = new LicenseApiClient({
        baseUrl: 'https://custom.api.com',
        timeoutMs: 5000,
      });

      expect(client.baseUrl).toBe('https://custom.api.com');
      expect(client.timeoutMs).toBe(5000);
    });
  });

  describe('activate', () => {
    it('should successfully activate license (AC-1)', async () => {
      const mockResponse = {
        key: 'PRO-TEST-1234-5678-ABCD',
        features: ['pro.squads.*', 'pro.memory.*'],
        seats: { used: 1, max: 5 },
        expiresAt: '2026-03-05T00:00:00Z',
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      await createMockServer((req, res) => {
        expect(req.method).toBe('POST');
        expect(req.url).toBe('/v1/license/activate');

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const data = JSON.parse(body);
          expect(data.key).toBe('PRO-TEST-1234-5678-ABCD');
          expect(data.machineId).toBe('test-machine-id');
          expect(data.aiosCoreVersion).toBe('3.0.0');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockResponse));
        });
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.activate('PRO-TEST-1234-5678-ABCD', 'test-machine-id', '3.0.0');

      expect(result.key).toBe('PRO-TEST-1234-5678-ABCD');
      expect(result.features).toEqual(['pro.squads.*', 'pro.memory.*']);
      expect(result.seats.max).toBe(5);
      expect(result.cacheValidDays).toBe(30);
      expect(result.activatedAt).toBeTruthy();
    });

    it('should handle invalid key error (401)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid key' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      await expect(client.activate('PRO-INVALID', 'machine', '1.0')).rejects.toThrow(
        LicenseActivationError,
      );

      try {
        await client.activate('PRO-INVALID', 'machine', '1.0');
      } catch (error) {
        expect(error.code).toBe('INVALID_KEY');
      }
    });

    it('should handle expired key error (403)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 'EXPIRED_KEY' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-EXPIRED', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('EXPIRED_KEY');
      }
    });

    it('should handle seat limit exceeded (403)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify
```