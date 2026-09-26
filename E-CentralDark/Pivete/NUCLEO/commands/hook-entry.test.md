# COMANDO - hook-entry.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\hook-entry.test.js
**SHA:** baf77a4330f97c4e
**Timestamp:** 2026-08-28T02:19:43.637892
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: 'test prompt',
- const input = buildInput(tmpDir, { prompt: 'hello world' });
- xml: JSON.stringify({ receivedPrompt: prompt, receivedSession: session }),
- const input = buildInput(tmpDir, { prompt: 'my test prompt' });
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * SYNAPSE Hook Entry Point — Unit Tests
 *
 * Tests for stdin/stdout JSON protocol, silent exit, error handling,
 * output format validation, and engine delegation.
 *
 * @module tests/synapse/hook-entry
 * @story SYN-7 - Hook Entry Point + Registration
 * @coverage Target: >90% for synapse-engine.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

jest.setTimeout(15000);

const HOOK_PATH = path.resolve(__dirname, '../../.claude/hooks/synapse-engine.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run the hook as a child process with given stdin data.
 * @param {*} stdinData - Data to pipe to stdin (stringified if object)
 * @param {number} [timeout=5000] - Process timeout in ms
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
function runHook(stdinData, timeout = 5000) {
  return new Promise((resolve) => {
    const proc = spawn('node', [HOOK_PATH], {
      timeout,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d; });
    proc.stderr.on('data', (d) => { stderr += d; });
    proc.on('close', (code) => {
      resolve({ stdout, stderr, code: code || 0 });
    });
    proc.on('error', () => {
      resolve({ stdout, stderr, code: 1 });
    });
    if (stdinData !== undefined) {
      const str = typeof stdinData === 'string' ? stdinData : JSON.stringify(stdinData);
      proc.stdin.write(str);
    }
    proc.stdin.end();
  });
}

/**
 * Create a temporary project directory with mock SYNAPSE modules.
 * @param {object} [opts] - Options for mock behavior
 * @param {boolean} [opts.noSynapse=false] - Skip creating .synapse/
 * @param {string} [opts.engineCode] - Custom engine.js code
 * @param {string} [opts.sessionCode] - Custom session-manager.js code
 * @returns {string} Path to temp project directory
 */
function createMockProject(opts = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-hook-test-'));

  if (!opts.noSynapse) {
    fs.mkdirSync(path.join(tmpDir, '.synapse', 'sessions'), { recursive: true });
  }

  const engineDir = path.join(tmpDir, '.aios-core', 'core', 'synapse');
  fs.mkdirSync(engineDir, { recursive: true });

  const engineCode = opts.engineCode || `
    class SynapseEngine {
      constructor(synapsePath) { this.synapsePath = synapsePath; }
      process(prompt, session) {
        return {
          xml: '<synapse-rules>\\nmocked output for: ' + prompt + '\\n</synapse-rules>',
          metrics: { layers: 4, elapsed: 12 },
        };
      }
    }
    module.exports = { SynapseEngine };
  `;
  fs.writeFileSync(path.join(engineDir, 'engine.js'), engineCode);

  const sessionDir = path.join(engineDir, 'session');
  fs.mkdirSync(sessionDir, { recursive: true });

  const sessionCode = opts.sessionCode || `
    function loadSession(sessionId, sessionsDir) {
      return { prompt_count: 5 };
    }
    module.exports = { loadSession };
  `;
  fs.writeFileSync(path.join(sessionDir, 'session-manager.js'), sessionCode);

  return tmpDir;
}

/**
 * Build a valid hook input object.
 * @param {string} cwd - Project directory
 * @param {object} [overrides] - Fields to override
 * @returns {object}
 */
function buildInput(cwd, overrides = {}) {
  return {
    sessionId: 'test-session-001',
    cwd,
    prompt: 'test prompt',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test Suites
// ---------------------------------------------------------------------------

describe('SYNAPSE Hook Entry Point (synapse-engine.js)', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // ==========================================================================
  // 1. stdin/stdout Protocol (AC: 1)
  // ==========================================================================

  describe('stdin/stdout JSON protocol', () => {
    test('valid input produces valid JSON output on stdout', async () => {
      tmpDir = createMockProject();
      const input = buildInput(tmpDir);
      const { stdout, code } = await runHook(input);

      expect(code).toBe(0);
      expect(stdout).toBeTruthy();

      const output = JSON.parse(stdout);
      expect(output).toHaveProperty('hookSpecificOutput');
      expect(output.hookSpecificOutput).toHaveProperty('additionalContext');
    });

    test('additionalContext contains engine XML output', async () => {
      tmpDir = createMockProject();
      const input = buildInput(tmpDir, { prompt: 'hello world' });
      const { stdout } = await runHook(input);

      const output = JSON.parse(stdout);
      expect(output.hookSpecificOutput.additionalContext).toContain('<sy
```