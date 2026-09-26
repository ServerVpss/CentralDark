# COMANDO - show.js
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_aiox-core\aiox-core\.aios-core\cli\commands\metrics\show.js
**SHA:** c2c1257ebddacdf6
**Timestamp:** 2026-08-26T19:43:46.779589
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- console.log(`  Last Run:    ${formatRelativeTime(layer.lastRun)}`);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Metrics Show Command
 *
 * Display current quality gate metrics.
 *
 * @module cli/commands/metrics/show
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const { Command } = require('commander');
const { MetricsCollector } = require('../../../quality/metrics-collector');

/**
 * Format percentage for display
 * @param {number} value - Value between 0 and 1
 * @returns {string} Formatted percentage
 */
function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format duration for display
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Format relative time
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Never';
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Create the show subcommand
 * @returns {Command} Commander command instance
 */
function createShowCommand() {
  const show = new Command('show');

  show
    .description('Display current quality gate metrics')
    .option('-l, --layer <number>', 'Show specific layer only (1, 2, or 3)')
    .option('-f, --format <type>', 'Output format (table, json, csv)', 'table')
    .option('--history <count>', 'Show recent history', '10')
    .option('--trends', 'Show trend data', false)
    .option('-v, --verbose', 'Show detailed output', false)
    .action(async (options) => {
      try {
        const collector = new MetricsCollector();
        const metrics = await collector.getMetrics();

        // Handle JSON/CSV export
        if (options.format === 'json') {
          console.log(JSON.stringify(metrics, null, 2));
          process.exit(0);
        }

        if (options.format === 'csv') {
          const csv = await collector.export('csv');
          console.log(csv);
          process.exit(0);
        }

        // Table format display
        console.log('\n📊 Quality Gates Metrics');
        console.log('━'.repeat(60));
        console.log(`Last Updated: ${formatRelativeTime(metrics.lastUpdated)}`);
        console.log(`Retention: ${metrics.retentionDays} days`);
        console.log(`Total History: ${metrics.history.length} records`);

        // Filter by layer if specified
        const layers = options.layer
          ? [`layer${options.layer}`]
          : ['layer1', 'layer2', 'layer3'];

        // Display layer metrics
        for (const layerKey of layers) {
          const layer = metrics.layers[layerKey];
          const layerNum = layerKey.replace('layer', '');
          const layerNames = {
            1: 'Pre-commit',
            2: 'PR Automation',
            3: 'Human Review',
          };

          console.log(`\n📋 Layer ${layerNum}: ${layerNames[layerNum]}`);
          console.log('─'.repeat(40));

          if (!layer || layer.totalRuns === 0) {
            console.log('  No data available');
            continue;
          }

          const passIcon = layer.passRate >= 0.9 ? '🟢' :
            layer.passRate >= 0.7 ? '🟡' : '🔴';

          console.log(`  Pass Rate:   ${passIcon} ${formatPercent(layer.passRate)}`);
          console.log(`  Avg Time:    ${formatDuration(layer.avgTimeMs)}`);
          console.log(`  Total Runs:  ${layer.totalRuns}`);
          console.log(`  Last Run:    ${formatRelativeTime(layer.lastRun)}`);

          // Layer 2 specific metrics
          if (layerKey === 'layer2' && layer.autoCatchRate !== undefined) {
            console.log(`  Auto-Catch:  ${formatPercent(layer.autoCatchRate)}`);

            if (layer.coderabbit?.active) {
              const cr = layer.coderabbit;
              console.log('\n  CodeRabbit:');
              console.log(`    Findings: ${cr.findingsCount}`);
              if (cr.severityBreakdown) {
                const sb = cr.severityBreakdown;
                console.log(`    Critical: ${sb.critical}, High: ${sb.high}, Medium: ${sb.medium}, Low: ${sb.low}`);
              }
            }

            if (layer.quinn?.findingsCount > 0) {
              const q = layer.quinn;
              console.log('\n  Quinn:');
              console.log(`    Findings: ${q.findingsCount}`);
              if (q.topCategories?.length > 0) {
                console.log(`    Top Categories: ${q.topCategories.join(', ')}`);
              }
            }
          }
        }

        // Show trends if requested
        if (options.trends) {
    
```