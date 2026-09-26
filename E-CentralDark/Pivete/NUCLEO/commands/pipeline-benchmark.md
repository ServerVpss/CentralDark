# COMANDO - pipeline-benchmark.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\benchmarks\pipeline-benchmark.js
**SHA:** 7b795408e435d556
**Timestamp:** 2026-08-28T02:19:43.364312
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = 'Implement the user authentication feature';
- const startupStart = performance.now();
- const sessionStart = performance.now();
- const pipelineStart = performance.now();
- const fmtStart = performance.now();

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * SYNAPSE Pipeline Benchmark
 *
 * Story SYN-12: Performance Benchmarks + E2E Testing.
 * Measures execution time for SynapseEngine.process() across multiple iterations.
 * Reports p50/p95/p99 per layer and total pipeline.
 *
 * Usage:
 *   node tests/synapse/benchmarks/pipeline-benchmark.js [--warm] [--cold] [--iterations=100]
 *
 * Flags:
 *   --warm         Warm-start benchmark (reuse engine instance, default)
 *   --cold         Cold-start benchmark (new engine per iteration)
 *   --iterations=N Number of measured iterations (default: 100)
 *   --json         Output results as JSON only
 *
 * Performance Targets (from EPIC-SYN-INDEX):
 *   Total pipeline: <70ms (target), <100ms (hard limit)
 *   Layer individual: <15ms (<20ms hard, L0/L7: <5ms)
 *   Startup (.synapse/ discovery): <5ms (<10ms hard)
 *   Session I/O: <10ms (<15ms hard)
 *
 * @module tests/synapse/benchmarks/pipeline-benchmark
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SYNAPSE_PATH = path.join(PROJECT_ROOT, '.synapse');

const WARMUP_ITERATIONS = 5;
const DEFAULT_ITERATIONS = 100;

const TARGETS = {
  pipeline: { target: 70, hardLimit: 100 },
  layer: { target: 15, hardLimit: 20 },
  layerL0: { target: 5, hardLimit: 10 },
  layerL7: { target: 5, hardLimit: 10 },
  startup: { target: 5, hardLimit: 10 },
  sessionIO: { target: 10, hardLimit: 15 },
};

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { warm: true, cold: false, iterations: DEFAULT_ITERATIONS, json: false };

  for (const arg of args) {
    if (arg === '--cold') { options.cold = true; options.warm = false; }
    else if (arg === '--warm') { options.warm = true; options.cold = false; }
    else if (arg === '--json') { options.json = true; }
    else if (arg.startsWith('--iterations=')) {
      options.iterations = parseInt(arg.split('=')[1], 10) || DEFAULT_ITERATIONS;
    }
  }
  return options;
}

// ---------------------------------------------------------------------------
// Percentile
// ---------------------------------------------------------------------------

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function calcStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0] || 0,
    max: sorted[sorted.length - 1] || 0,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    mean: sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
    count: sorted.length,
  };
}

// ---------------------------------------------------------------------------
// Benchmark
// ---------------------------------------------------------------------------

async function runBenchmark(options) {
  const { SynapseEngine } = require(
    path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'engine.js'),
  );
  const { loadSession } = require(
    path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'session', 'session-manager.js'),
  );
  const { parseManifest } = require(
    path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'domain', 'domain-loader.js'),
  );

  const manifestPath = path.join(SYNAPSE_PATH, 'manifest');
  const mode = options.cold ? 'cold' : 'warm';
  const iterations = options.iterations;

  if (!options.json) {
    console.log(`\nSYNAPSE Pipeline Benchmark — ${mode} start, ${iterations} iterations`);
    console.log(`Synapse path: ${SYNAPSE_PATH}\n`);
  }

  // Verify .synapse/ exists
  if (!fs.existsSync(SYNAPSE_PATH)) {
    console.error('ERROR: .synapse/ directory not found. Run SYN-8 first.');
    process.exit(1);
  }

  const { formatSynapseRules } = require(
    path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'output', 'formatter.js'),
  );

  // Measure startup (manifest parse + engine construction)
  const startupDurations = [];
  const sessionIODurations = [];
  const pipelineDurations = [];
  const formatterDurations = [];
  const layerDurations = {}; // { layerName: number[] }

  const manifest = parseManifest(manifestPath);
  const prompt = 'Implement the user authentication feature';
  const session = {
    prompt_count: 5,
    active_agent: { id: 'dev', activated_at: new Date().toISOString() },
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: { last_bracket: 'MODERATE', last_tokens_used: 0, last_context_percent: 55 },
  };

  // Warm-up phase
  if (!options.json) {
    console.log(`Warm-up phase (${WARMUP_ITERATIONS} iterations)...`);
  }

  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    const engine = n
```