# OUTRO - performance-benchmark.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\__tests__\performance-benchmark.js
**SHA:** dd780e05e8775da7
**Timestamp:** 2026-08-28T02:19:04.057446
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.start = null;
- this.start = performance.now();
- for (let run = 1; run <= CONFIG.runs; run++) {

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Installer Performance Benchmark
 * Story INS-2: Installer Performance Optimization
 *
 * Measures baseline performance metrics for the installer to track optimization progress.
 *
 * Usage:
 *   node performance-benchmark.js [--output <file>] [--runs <n>]
 *
 * Output:
 *   JSON report with phase timings and statistics
 */

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  runs: 3, // Number of runs for averaging
  outputFile: null, // Output file path (null = stdout)
  testProjectSize: 1000, // Number of files for test project
  verbose: false,
};

// Parse CLI arguments
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg === '--output' && arr[i + 1]) CONFIG.outputFile = arr[i + 1];
  if (arg === '--runs' && arr[i + 1]) CONFIG.runs = parseInt(arr[i + 1], 10);
  if (arg === '--verbose' || arg === '-v') CONFIG.verbose = true;
  if (arg === '--help' || arg === '-h') {
    console.log(`
AIOS Installer Performance Benchmark

Usage: node performance-benchmark.js [options]

Options:
  --output <file>   Save JSON report to file (default: stdout)
  --runs <n>        Number of benchmark runs (default: 3)
  --verbose, -v     Show detailed progress
  --help, -h        Show this help

Example:
  node performance-benchmark.js --output baseline.json --runs 5
`);
    process.exit(0);
  }
});

// Benchmark results structure
const results = {
  timestamp: new Date().toISOString(),
  system: {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    cpus: require('os').cpus().length,
    totalMemory: Math.round(require('os').totalmem() / 1024 / 1024) + ' MB',
  },
  config: { ...CONFIG },
  phases: {},
  summary: {},
};

/**
 * Timer utility for measuring phase durations
 */
class Timer {
  constructor(name) {
    this.name = name;
    this.start = null;
    this.end = null;
    this.runs = [];
  }

  begin() {
    this.start = performance.now();
  }

  stop() {
    this.end = performance.now();
    const duration = this.end - this.start;
    this.runs.push(duration);
    return duration;
  }

  getStats() {
    if (this.runs.length === 0) return null;
    const sorted = [...this.runs].sort((a, b) => a - b);
    return {
      min: Math.round(sorted[0]),
      max: Math.round(sorted[sorted.length - 1]),
      avg: Math.round(this.runs.reduce((a, b) => a + b, 0) / this.runs.length),
      median: Math.round(sorted[Math.floor(sorted.length / 2)]),
      runs: this.runs.map((r) => Math.round(r)),
      unit: 'ms',
    };
  }
}

// Phase timers
const timers = {
  directoryRead: new Timer('Directory Read (readdirSync)'),
  directoryReadWithTypes: new Timer('Directory Read (withFileTypes)'),
  statLoop: new Timer('Stat Loop (statSync per file)'),
  realpathSingle: new Timer('Realpath (single call)'),
  realpathDouble: new Timer('Realpath (double call - current)'),
  hashSequential: new Timer('Hash Files (sequential)'),
  hashParallelBatch: new Timer('Hash Files (parallel batch)'),
  fileCopySequential: new Timer('File Copy (sequential)'),
  fileCopyParallel: new Timer('File Copy (parallel)'),
  totalInstallSimulation: new Timer('Total Install Simulation'),
};

/**
 * Log if verbose mode is enabled
 */
function log(msg) {
  if (CONFIG.verbose) console.log(`[benchmark] ${msg}`);
}

/**
 * Get the .aios-core directory for benchmarking
 */
function getAiosCoreDir() {
  const projectRoot = path.resolve(__dirname, '../../../../');
  return path.join(projectRoot, '.aios-core');
}

/**
 * Benchmark: Directory read comparison
 */
async function benchmarkDirectoryRead(dir) {
  const files = fs.readdirSync(dir);

  // Method 1: readdirSync + statSync for each
  timers.statLoop.begin();
  for (const file of files) {
    const fullPath = path.join(dir, file);
    fs.statSync(fullPath).isDirectory();
  }
  timers.statLoop.stop();

  // Method 2: readdirSync with withFileTypes
  timers.directoryReadWithTypes.begin();
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    entry.isDirectory();
  }
  timers.directoryReadWithTypes.stop();

  return files.length;
}

/**
 * Benchmark: Realpath comparison
 */
async function benchmarkRealpath(files) {
  const sampleFiles = files.slice(0, 100); // Sample 100 files

  // Method 1: Single realpath call
  timers.realpathSingle.begin();
  for (const file of sampleFiles) {
    fs.realpathSync(file);
  }
  timers.realpathSingle.stop();

  // Method 2: Double realpath call (current behavior)
  timers.realpathDouble.begin();
  for (const file of sampleFiles) {
    fs.realpathSync(file);
    fs.realpathSync(path.dirname(file)); // Simulates the duplicate call
  }
  timers.realpathDouble.stop();
}

/**
 * Benchmark: File hashing comparison
 */
async function benchmarkHashing(files) {
  const sampleFiles = files.slice(0, 200); // Sample 200
```