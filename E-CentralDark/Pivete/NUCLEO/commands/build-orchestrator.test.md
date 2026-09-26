# COMANDO - build-orchestrator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\tests\core\build-orchestrator.test.js
**SHA:** 5fea459de374cd5e
**Timestamp:** 2026-08-28T13:25:25.562268
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: true,
- const ctx = { storyId: 'test', config: { ...orchestrator.config, dryRun: true } };
- config: { ...orchestrator.config, planDir: 'plan', dryRun: true },
- config: { ...orchestrator.config, dryRun: true },
- config: { ...orchestrator.config, dryRun: true },
- config: { ...orchestrator.config, dryRun: true },
- config: { ...orchestrator.config, dryRun: true },
- const prompt = orchestrator.buildSubtaskPrompt(subtask, execCtx, buildCtx);
- const prompt = orchestrator.buildSubtaskPrompt(subtask, execCtx, buildCtx);
- const prompt = orchestrator.buildSubtaskPrompt(subtask, execCtx, buildCtx);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Build Orchestrator Tests - Story EXC-1 (AC2)
 *
 * Tests for the 8-phase build pipeline including:
 * - Constructor and config defaults
 * - runPhase() wrapping and event emission
 * - build() with phase failure handling
 * - buildSubtaskPrompt() formatting
 * - validateSubtaskResult() success and rejection
 * - extractModifiedFiles()
 * - formatDuration()
 * - Enum values
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  createTempDir,
  cleanupTempDir,
  collectEvents,
} = require('./execution-test-helpers');

// Mock optional modules to prevent constructor errors
jest.mock('../../.aios-core/workflow-intelligence/engine/wave-analyzer', () => null);
jest.mock('../../.aios-core/infrastructure/scripts/worktree-manager', () => { throw new Error('not available'); });
jest.mock('../../.aios-core/core/memory/gotchas-memory', () => { throw new Error('not available'); });

const {
  BuildOrchestrator,
  OrchestratorEvent,
  Phase,
  DEFAULT_CONFIG,
} = require('../../.aios-core/core/execution/build-orchestrator');

// ═══════════════════════════════════════════════════════════════════════════════
//                              ENUMS & CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

describe('Build Orchestrator Enums', () => {
  test('OrchestratorEvent should have all expected events (BO-04)', () => {
    expect(OrchestratorEvent.BUILD_QUEUED).toBe('build_queued');
    expect(OrchestratorEvent.PHASE_STARTED).toBe('phase_started');
    expect(OrchestratorEvent.PHASE_COMPLETED).toBe('phase_completed');
    expect(OrchestratorEvent.PHASE_FAILED).toBe('phase_failed');
    expect(OrchestratorEvent.SUBTASK_EXECUTING).toBe('subtask_executing');
    expect(OrchestratorEvent.QA_STARTED).toBe('qa_started');
    expect(OrchestratorEvent.QA_COMPLETED).toBe('qa_completed');
    expect(OrchestratorEvent.MERGE_STARTED).toBe('merge_started');
    expect(OrchestratorEvent.MERGE_COMPLETED).toBe('merge_completed');
    expect(OrchestratorEvent.BUILD_COMPLETED).toBe('build_completed');
    expect(OrchestratorEvent.BUILD_FAILED).toBe('build_failed');
    expect(OrchestratorEvent.REPORT_GENERATED).toBe('report_generated');
  });

  test('Phase should have all 8 phases (BO-05)', () => {
    expect(Phase.INIT).toBe('init');
    expect(Phase.WORKTREE).toBe('worktree');
    expect(Phase.PLAN).toBe('plan');
    expect(Phase.EXECUTE).toBe('execute');
    expect(Phase.QA).toBe('qa');
    expect(Phase.MERGE).toBe('merge');
    expect(Phase.CLEANUP).toBe('cleanup');
    expect(Phase.REPORT).toBe('report');
  });

  test('DEFAULT_CONFIG should have expected defaults (BO-03)', () => {
    expect(DEFAULT_CONFIG.useWorktree).toBe(true);
    expect(DEFAULT_CONFIG.runQA).toBe(true);
    expect(DEFAULT_CONFIG.autoMerge).toBe(true);
    expect(DEFAULT_CONFIG.maxIterations).toBe(10);
    expect(DEFAULT_CONFIG.globalTimeout).toBe(45 * 60 * 1000);
    expect(DEFAULT_CONFIG.subtaskTimeout).toBe(10 * 60 * 1000);
    expect(DEFAULT_CONFIG.dryRun).toBe(false);
    expect(DEFAULT_CONFIG.verbose).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//                              CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe('BuildOrchestrator', () => {
  let orchestrator;
  let testDir;

  beforeEach(() => {
    testDir = createTempDir('build-orch-test-');
    orchestrator = new BuildOrchestrator({ rootPath: testDir });
  });

  afterEach(() => {
    if (orchestrator) {
      orchestrator.removeAllListeners();
    }
    cleanupTempDir(testDir);
  });

  describe('Constructor', () => {
    test('should create with default config (BO-01)', () => {
      const orch = new BuildOrchestrator();

      expect(orch.config.useWorktree).toBe(true);
      expect(orch.config.maxIterations).toBe(10);
      expect(orch.config.dryRun).toBe(false);
      expect(orch.activeBuilds).toBeInstanceOf(Map);
      expect(orch.activeBuilds.size).toBe(0);
    });

    test('should merge custom config with defaults (BO-02)', () => {
      const orch = new BuildOrchestrator({
        maxIterations: 5,
        dryRun: true,
        rootPath: '/custom/path',
      });

      expect(orch.config.maxIterations).toBe(5);
      expect(orch.config.dryRun).toBe(true);
      expect(orch.rootPath).toBe('/custom/path');
      // Defaults preserved
      expect(orch.config.useWorktree).toBe(true);
      expect(orch.config.globalTimeout).toBe(45 * 60 * 1000);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //                              runPhase()
  // ─────────────────────────────────────────────────────────────────────────────

  describe('runPhase()', () => {
    test('should emit phase events on success (BO-28)', async () => {
      const tracker = collectEvents(orchestrator, [
        OrchestratorEvent.PHASE_STARTED,
        OrchestratorE
```