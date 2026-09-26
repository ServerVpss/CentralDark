# COMANDO - metrics-tracker.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\metrics-tracker.js
**SHA:** e08baea0b02b2f54
**Timestamp:** 2026-08-28T02:02:03.886227
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = new Date(entry.timestamp);
- const start = end - periodLength;

### Riscos
- risk: improvement.plan.riskLevel,
- if (entry.measurements.projected && entry.measurements.projected.risk === 'high') {

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Tracks metrics for self-improvement operations
 */
class MetricsTracker {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.metricsFile = path.join(this.rootPath, '.aios', 'improvement-metrics.json');
    this.maxEntries = options.maxEntries || 1000;
    
    // Metric categories
    this.categories = {
      performance: ['execution_time', 'memory_usage', 'cpu_usage'],
      quality: ['test_coverage', 'code_complexity', 'error_rate'],
      impact: ['files_modified', 'functions_improved', 'bugs_fixed'],
      user: ['approval_rate', 'rollback_rate', 'satisfaction_score']
    };
  }

  /**
   * Initialize metrics system
   * @returns {Promise<void>}
   */
  async initialize() {
    const metricsDir = path.dirname(this.metricsFile);
    
    try {
      await fs.mkdir(metricsDir, { recursive: true });
      
      // Initialize file if doesn't exist
      try {
        await fs.access(this.metricsFile);
      } catch {
        await this.saveMetrics({
          version: '1.0.0',
          created: new Date().toISOString(),
          improvements: [],
          aggregates: this.initializeAggregates(),
          trends: {}
        });
      }
    } catch (error) {
      console.error(chalk.red(`Failed to initialize metrics: ${error.message}`));
    }
  }

  /**
   * Record improvement metrics
   * @param {Object} improvement - Improvement data
   * @returns {Promise<void>}
   */
  async recordImprovement(improvement) {
    await this.initialize();
    
    const metrics = await this.loadMetrics();
    
    const entry = {
      improvement_id: improvement.improvement_id,
      timestamp: new Date().toISOString(),
      metrics: improvement.metrics || {},
      analysis: improvement.analysis || {},
      plan: improvement.plan || {},
      outcome: 'pending',
      measurements: await this.gatherMeasurements(improvement)
    };

    metrics.improvements.push(entry);
    
    // Keep only recent entries
    if (metrics.improvements.length > this.maxEntries) {
      metrics.improvements = metrics.improvements.slice(-this.maxEntries);
    }
    
    // Update aggregates
    await this.updateAggregates(metrics, entry);
    
    // Calculate trends
    metrics.trends = await this.calculateTrends(metrics);
    
    await this.saveMetrics(metrics);
    
    console.log(chalk.green(`📊 Metrics recorded for improvement: ${improvement.improvement_id}`));
  }

  /**
   * Update improvement outcome
   * @param {string} improvementId - Improvement ID
   * @param {Object} outcome - Outcome data
   * @returns {Promise<void>}
   */
  async updateOutcome(improvementId, outcome) {
    const metrics = await this.loadMetrics();
    
    const entry = metrics.improvements.find(i => i.improvement_id === improvementId);
    if (!entry) {
      throw new Error(`Improvement not found: ${improvementId}`);
    }
    
    entry.outcome = outcome.status; // 'success', 'failed', 'rolled_back'
    entry.outcome_details = outcome;
    entry.end_timestamp = new Date().toISOString();
    
    // Calculate duration
    const start = new Date(entry.timestamp);
    const end = new Date(entry.end_timestamp);
    entry.duration_ms = end - start;
    
    // Update aggregates based on outcome
    await this.updateOutcomeAggregates(metrics, entry);
    
    await this.saveMetrics(metrics);
  }

  /**
   * Get improvement report
   * @param {string} improvementId - Improvement ID
   * @returns {Promise<Object>} Improvement report
   */
  async getImprovementReport(improvementId) {
    const metrics = await this.loadMetrics();
    const entry = metrics.improvements.find(i => i.improvement_id === improvementId);
    
    if (!entry) {
      throw new Error(`Improvement not found: ${improvementId}`);
    }
    
    const report = {
      improvement_id: improvementId,
      timestamp: entry.timestamp,
      outcome: entry.outcome,
      duration: entry.duration_ms ? `${(entry.duration_ms / 1000).toFixed(2)}s` : 'ongoing',
      metrics: entry.metrics,
      measurements: entry.measurements,
      impact_summary: this.generateImpactSummary(entry),
      recommendations: this.generateRecommendations(entry)
    };
    
    return report;
  }

  /**
   * Get dashboard data
   * @param {Object} options - Dashboard options
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(options = {}) {
    const { period = '7d' } = options;
    const metrics = await this.loadMetrics();
    
    const cutoff = this.getPeriodCutoff(period);
    const recentImprovements = metrics.improvements.filter(
      i => new Date(i.timestamp) > cutoff
    );
    
    const dashboard = {
      period,
      summary: {
        total_improvements: recentImprovements.length,
        successful: recentImprovements.filter(i => i.outcome === 'success').length,
        failed: recentImprovements.filter(i => i.outcome === 'faile
```