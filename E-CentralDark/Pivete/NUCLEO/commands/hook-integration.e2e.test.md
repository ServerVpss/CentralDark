# COMANDO - hook-integration.e2e.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\e2e\hook-integration.e2e.test.js
**SHA:** 94ecf01a3cc78c7d
**Timestamp:** 2026-08-28T02:19:43.408541
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: 'test prompt',
- prompt: 'test prompt',
- prompt: 'test prompt',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * SYNAPSE E2E: Hook Integration Tests
 *
 * End-to-end tests for the SYNAPSE hook entry point (synapse-engine.js).
 * Tests the stdin/stdout JSON protocol by spawning the hook as a child process
 * and validating real output against the actual project .synapse/ configuration.
 *
 * @module tests/synapse/e2e/hook-integration.e2e
 * @story SYN-12 - Performance Benchmarks + E2E Testing
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

jest.setTimeout(30000);

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOK_PATH = path.join(PROJECT_ROOT, '.claude', 'hooks', 'synapse-engine.js');
const HOOK_EXISTS = fs.existsSync(HOOK_PATH);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run the hook via execSync with given stdin data.
 * Returns { stdout, exitCode } -- never throws on non-zero exit.
 *
 * @param {string} stdinData - Raw string to pipe to stdin
 * @param {object} [opts] - Extra options
 * @param {number} [opts.timeout=10000] - Timeout in ms
 * @returns {{ stdout: string, exitCode: number }}
 */
function runHookSync(stdinData, opts = {}) {
  const timeout = opts.timeout || 10000;
  try {
    const stdout = execSync(`node "${HOOK_PATH}"`, {
      input: stdinData,
      encoding: 'utf8',
      timeout,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout: stdout || '', exitCode: 0 };
  } catch (err) {
    // execSync throws on non-zero exit OR timeout
    return {
      stdout: (err.stdout || '').toString(),
      exitCode: err.status != null ? err.status : 1,
    };
  }
}

/**
 * Build a valid hook input JSON string.
 * @param {object} [overrides] - Fields to override
 * @returns {string} Stringified JSON input
 */
function buildInput(overrides = {}) {
  return JSON.stringify({
    sessionId: 'e2e-test-session',
    cwd: PROJECT_ROOT,
    prompt: 'test prompt',
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

const describeIfHookExists = HOOK_EXISTS ? describe : describe.skip;

describeIfHookExists('SYNAPSE E2E: Hook Integration', () => {

  // ========================================================================
  // 1. Hook produces valid JSON output with hookSpecificOutput key
  // ========================================================================

  test('hook produces valid JSON output with hookSpecificOutput key', () => {
    const input = buildInput();
    const { stdout, exitCode } = runHookSync(input);

    expect(exitCode).toBe(0);
    expect(stdout).toBeTruthy();

    const result = JSON.parse(stdout);
    expect(result).toHaveProperty('hookSpecificOutput');
    expect(result.hookSpecificOutput).toHaveProperty('additionalContext');
    expect(typeof result.hookSpecificOutput.additionalContext).toBe('string');
  });

  // ========================================================================
  // 2. Hook output additionalContext is a string (may contain synapse-rules
  //    XML when engine produces content, or empty string otherwise)
  // ========================================================================

  test('hook output additionalContext is a string conforming to expected format', () => {
    const input = buildInput();
    const { stdout, exitCode } = runHookSync(input);

    expect(exitCode).toBe(0);
    expect(stdout).toBeTruthy();

    const result = JSON.parse(stdout);
    const ctx = result.hookSpecificOutput.additionalContext;

    // additionalContext must be a string
    expect(typeof ctx).toBe('string');

    // When non-empty, it must be wrapped in <synapse-rules> tags
    if (ctx.length > 0) {
      expect(ctx).toContain('<synapse-rules>');
      expect(ctx).toContain('</synapse-rules>');
    }
  });

  // ========================================================================
  // 3. Hook with missing .synapse/ directory produces empty output
  // ========================================================================

  test('hook with missing .synapse/ directory produces empty output (silent exit)', () => {
    // Use a fresh temp dir as cwd -- guaranteed to NOT have a .synapse/ directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-e2e-no-synapse-'));
    try {
      const input = JSON.stringify({
        sessionId: 'e2e-no-synapse',
        cwd: tempDir,
        prompt: 'test prompt',
      });
      const { stdout, exitCode } = runHookSync(input);

      expect(exitCode).toBe(0);
      expect(stdout).toBe('');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // ========================================================================
  // 4. Hook with invalid JSON input
```