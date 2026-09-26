# COMANDO - session-manager.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\session-manager.test.js
**SHA:** b21c7a360e34a58b
**Timestamp:** 2026-08-28T02:19:43.552086
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const longPrompt =

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * SYNAPSE Session Manager — Unit Tests
 *
 * Tests for session CRUD, stale cleanup, auto-title, gitignore,
 * session continuity, and error handling.
 *
 * @story SYN-2 - Session Manager
 * @coverage Target: >90% for session-manager.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  createSession,
  loadSession,
  updateSession,
  deleteSession,
  cleanStaleSessions,
  generateTitle,
  ensureGitignore,
  SCHEMA_VERSION,
} = require('../../.aios-core/core/synapse/session/session-manager');

let tmpDir;
let sessionsDir;
let synapsePath;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-test-'));
  synapsePath = path.join(tmpDir, '.synapse');
  sessionsDir = path.join(synapsePath, 'sessions');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ============================================================
// 1. Session CRUD Operations (AC: 1)
// ============================================================

describe('Session CRUD', () => {
  test('createSession creates a valid session file with schema v2.0', () => {
    const session = createSession('test-uuid-001', tmpDir, sessionsDir);

    expect(session).toBeDefined();
    expect(session.uuid).toBe('test-uuid-001');
    expect(session.schema_version).toBe('2.0');
    expect(session.cwd).toBe(tmpDir);
    expect(session.label).toBe(path.basename(tmpDir));
    expect(session.title).toBeNull();
    expect(session.prompt_count).toBe(0);

    // Verify file exists on disk
    const filePath = path.join(sessionsDir, 'test-uuid-001.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('createSession auto-creates sessions directory if missing', () => {
    expect(fs.existsSync(sessionsDir)).toBe(false);

    createSession('test-uuid-002', tmpDir, sessionsDir);

    expect(fs.existsSync(sessionsDir)).toBe(true);
  });

  test('loadSession returns session object for existing session', () => {
    createSession('test-uuid-003', tmpDir, sessionsDir);

    const session = loadSession('test-uuid-003', sessionsDir);

    expect(session).not.toBeNull();
    expect(session.uuid).toBe('test-uuid-003');
    expect(session.schema_version).toBe('2.0');
  });

  test('loadSession returns null for non-existent session', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    const session = loadSession('non-existent', sessionsDir);

    expect(session).toBeNull();
  });

  test('updateSession merges partial updates and increments prompt_count', () => {
    createSession('test-uuid-004', tmpDir, sessionsDir);

    const updated = updateSession('test-uuid-004', sessionsDir, {
      active_agent: { id: 'dev', activated_at: '2026-02-10T10:00:00Z', activation_quality: 'full' },
    });

    expect(updated).not.toBeNull();
    expect(updated.prompt_count).toBe(1);
    expect(updated.active_agent.id).toBe('dev');
    expect(updated.active_agent.activation_quality).toBe('full');
  });

  test('updateSession returns null for non-existent session', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    const result = updateSession('non-existent', sessionsDir, { title: 'test' });

    expect(result).toBeNull();
  });

  test('deleteSession removes session file and returns true', () => {
    createSession('test-uuid-005', tmpDir, sessionsDir);
    const filePath = path.join(sessionsDir, 'test-uuid-005.json');

    expect(fs.existsSync(filePath)).toBe(true);

    const result = deleteSession('test-uuid-005', sessionsDir);

    expect(result).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  test('deleteSession returns false for non-existent session', () => {
    fs.mkdirSync(sessionsDir, { recursive: true });

    const result = deleteSession('non-existent', sessionsDir);

    expect(result).toBe(false);
  });
});

// ============================================================
// 2. Schema v2.0 Compliance (AC: 2)
// ============================================================

describe('Schema v2.0 Compliance', () => {
  test('session contains all required schema v2.0 fields', () => {
    const session = createSession('schema-test', tmpDir, sessionsDir);

    // Core fields
    expect(session).toHaveProperty('uuid');
    expect(session).toHaveProperty('schema_version', '2.0');
    expect(session).toHaveProperty('started');
    expect(session).toHaveProperty('last_activity');
    expect(session).toHaveProperty('cwd');
    expect(session).toHaveProperty('label');
    expect(session).toHaveProperty('title');
    expect(session).toHaveProperty('prompt_count');

    // State fields
    expect(session).toHaveProperty('active_agent');
    expect(session.active_agent).toEqual({
      id: null,
      activated_at: null,
      activation_quality: null,
    });
    expect(session).toHaveProperty('active_workflow', null);
    expect(session).toHaveProperty('active_squad', null);
    expect(session).toHaveProperty('active_task', null);

```