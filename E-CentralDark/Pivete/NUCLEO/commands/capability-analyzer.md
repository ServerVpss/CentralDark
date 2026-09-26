# COMANDO - capability-analyzer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\capability-analyzer.js
**SHA:** 65e4833932ddb560
**Timestamp:** 2026-08-28T02:02:12.518925
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: error.error,

### Riscos
- risk: metricResult.risk || 'low',
- risk: 'low',
- risk: 'low',
- risk: 'low',
- risk: opportunity.risk,
- const hasHighRisk = changes.some(c => c.risk === 'high');
- const mediumRiskCount = changes.filter(c => c.risk === 'medium').length;
- risk: 'low',

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const SecurityChecker = require('./security-checker');

/**
 * Analyzes meta-agent capabilities and identifies improvement opportunities
 */
class CapabilityAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.coreDir = path.join(this.rootPath, 'aios-core');
    this.security = new SecurityChecker();
    
    // Capability categories
    this.categories = {
      error_handling: {
        weight: 0.2,
        metrics: ['try_catch_coverage', 'error_context', 'retry_logic', 'graceful_degradation'],
      },
      performance: {
        weight: 0.15,
        metrics: ['async_operations', 'caching', 'algorithm_efficiency', 'resource_usage'],
      },
      modularity: {
        weight: 0.15,
        metrics: ['function_size', 'coupling', 'cohesion', 'reusability'],
      },
      testing: {
        weight: 0.2,
        metrics: ['test_coverage', 'test_quality', 'edge_cases', 'mocking_strategy'],
      },
      documentation: {
        weight: 0.1,
        metrics: ['jsdoc_coverage', 'inline_comments', 'readme_quality', 'examples'],
      },
      security: {
        weight: 0.1,
        metrics: ['input_validation', 'sanitization', 'auth_checks', 'audit_trail'],
      },
      user_experience: {
        weight: 0.1,
        metrics: ['feedback_quality', 'error_messages', 'progress_tracking', 'help_text'],
      },
    };
  }

  /**
   * Analyze current capabilities
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Capability analysis
   */
  async analyzeCapabilities(options = {}) {
    const { target_areas = Object.keys(this.categories), currentImplementation } = options;
    
    console.log(chalk.blue('🔍 Analyzing current capabilities...'));
    
    const analysis = {
      timestamp: new Date().toISOString(),
      overall_score: 0,
      categories: {},
      improvement_opportunities: [],
      strengths: [],
      weaknesses: [],
    };

    // Analyze each category
    for (const category of target_areas) {
      if (!this.categories[category]) continue;
      
      const categoryAnalysis = await this.analyzeCategory(category, currentImplementation);
      analysis.categories[category] = categoryAnalysis;
      
      // Identify strengths and weaknesses
      if (categoryAnalysis.score >= 8) {
        analysis.strengths.push({
          category,
          score: categoryAnalysis.score,
          highlights: categoryAnalysis.highlights,
        });
      } else if (categoryAnalysis.score < 6) {
        analysis.weaknesses.push({
          category,
          score: categoryAnalysis.score,
          issues: categoryAnalysis.issues,
        });
      }
      
      // Add improvement opportunities
      analysis.improvement_opportunities.push(...categoryAnalysis.opportunities);
    }

    // Calculate overall score
    analysis.overall_score = this.calculateOverallScore(analysis.categories);
    
    // Sort opportunities by impact
    analysis.improvement_opportunities.sort((a, b) => b.impact - a.impact);
    
    return analysis;
  }

  /**
   * Analyze a specific capability category
   * @private
   */
  async analyzeCategory(category, basePath) {
    const categoryDef = this.categories[category];
    const analysis = {
      category,
      score: 0,
      metrics: {},
      issues: [],
      highlights: [],
      opportunities: [],
    };

    // Analyze each metric
    for (const metric of categoryDef.metrics) {
      const metricResult = await this.analyzeMetric(category, metric, basePath);
      analysis.metrics[metric] = metricResult;
      
      if (metricResult.score < 6) {
        analysis.issues.push({
          metric,
          score: metricResult.score,
          description: metricResult.description,
        });
        
        // Generate improvement opportunity
        if (metricResult.improvement) {
          analysis.opportunities.push({
            category,
            metric,
            description: metricResult.improvement,
            impact: (10 - metricResult.score) * categoryDef.weight,
            effort: metricResult.effort || 'medium',
            risk: metricResult.risk || 'low',
          });
        }
      } else if (metricResult.score >= 8) {
        analysis.highlights.push({
          metric,
          score: metricResult.score,
          description: metricResult.description,
        });
      }
    }

    // Calculate category score
    const metricScores = Object.values(analysis.metrics).map(m => m.score);
    analysis.score = metricScores.reduce((sum, score) => sum + score, 0) / metricScores.length;
    
    return analysis;
  }

  /**
   * Analyze a specific metric
   * @private
   */
  async analyzeMetric(category, metric, basePath) {
    const methodName = `analyze_${category}_${metric}
```