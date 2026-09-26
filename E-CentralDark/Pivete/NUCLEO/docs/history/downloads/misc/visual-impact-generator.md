# OUTRO - visual-impact-generator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\visual-impact-generator.js
**SHA:** e05d36747f55b52f
**Timestamp:** 2026-08-28T02:02:14.511062
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- overall_risk: impactReport.riskAssessment.overallRisk,
- risk: component.severity,
- risk: impactReport.riskAssessment.overallRisk,

### Gaps
- gap: 20px;
- gap: 15px;

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Visual impact generator for Synkra AIOS framework
 * Creates visual representations of impact analysis results
 */
class VisualImpactGenerator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.visualCache = new Map();
    this.generationHistory = [];
    this.visualTemplates = new Map();
    this.initializeTemplates();
  }

  /**
   * Initialize visual templates
   */
  initializeTemplates() {
    // ASCII graph templates for different visualization types
    this.visualTemplates.set('impact_tree', {
      root: '📦',
      branch: '├──',
      lastBranch: '└──',
      vertical: '│',
      horizontal: '─',
      riskLevels: {
        critical: '🔴',
        high: '🟠', 
        medium: '🟡',
        low: '🟢',
      },
    });

    this.visualTemplates.set('dependency_graph', {
      target: '🎯',
      component: '📄',
      agent: '🤖',
      workflow: '🔄',
      task: '⚡',
      util: '🔧',
      connection: '→',
      impact: {
        critical: '‼️',
        high: '❗',
        medium: '⚠️',
        low: 'ℹ️',
      },
    });
  }

  /**
   * Generate comprehensive impact visualization
   */
  async generateImpactVisualization(impactReport, options = {}) {
    const visualId = `visual-${Date.now()}`;
    
    try {
      console.log(chalk.blue('🎨 Generating visual impact representation...'));
      
      const config = {
        format: options.format || 'visual',
        includeInteractive: options.includeInteractive || false,
        maxNodes: options.maxNodes || 50,
        showDetails: options.showDetails !== false,
        colorScheme: options.colorScheme || 'default',
        ...options,
      };

      const visualization = {
        visualId: visualId,
        format: config.format,
        timestamp: new Date().toISOString(),
      };

      // Generate different visualization types based on format
      switch (config.format) {
        case 'visual':
        case 'ascii':
          visualization.asciiGraph = await this.generateAsciiVisualization(impactReport, config);
          break;
        case 'html':
          visualization.htmlContent = await this.generateHtmlVisualization(impactReport, config);
          visualization.asciiGraph = await this.generateAsciiVisualization(impactReport, config);
          break;
        case 'json':
          visualization.jsonData = await this.generateJsonVisualization(impactReport, config);
          break;
        default:
          visualization.asciiGraph = await this.generateAsciiVisualization(impactReport, config);
      }

      // Generate impact summary
      visualization.impactSummary = this.generateImpactSummary(impactReport);
      
      // Generate component relationship map
      visualization.relationshipMap = await this.generateRelationshipMap(impactReport, config);
      
      // Generate risk heatmap
      visualization.riskHeatmap = this.generateRiskHeatmap(impactReport, config);

      // Cache the visualization
      this.visualCache.set(visualId, visualization);
      
      // Add to generation history
      this.generationHistory.push({
        visualId: visualId,
        targetComponent: impactReport.targetComponent.path,
        format: config.format,
        componentsVisualized: impactReport.dependencyAnalysis.affectedComponents.length,
        timestamp: visualization.timestamp,
      });

      console.log(chalk.green('✅ Visual impact representation generated'));
      console.log(chalk.gray(`   Format: ${config.format}`));
      console.log(chalk.gray(`   Components visualized: ${impactReport.dependencyAnalysis.affectedComponents.length}`));

      return visualization;

    } catch (error) {
      console.error(chalk.red(`Visual generation failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate ASCII-based visualization
   */
  async generateAsciiVisualization(impactReport, config) {
    const lines = [];
    const template = this.visualTemplates.get('impact_tree');
    
    // Header
    lines.push('');
    lines.push('📊 IMPACT ANALYSIS VISUALIZATION');
    lines.push('═'.repeat(50));
    lines.push('');

    // Target component
    const targetIcon = this.getComponentIcon(impactReport.targetComponent.type);
    const riskIcon = template.riskLevels[impactReport.riskAssessment.overallRisk] || '⚪';
    
    lines.push(`${targetIcon} Target Component: ${impactReport.targetComponent.path}`);
    lines.push(`${riskIcon} Risk Level: ${impactReport.riskAssessment.overallRisk.toUpperCase()}`);
    lines.push(`🔄 Modification: ${impactReport.modificationType}`);
    lines.push('');

    // Impact summary
    lines.push('📈 IMPACT SUMMARY');
    lines.push('─'.repeat(30));
    const summary = impactReport.summary;
    lines.push(`Affected Components: ${summary.affectedComponents}`);
    lines.push(`Propagation Depth: ${summary.propagationDepth}`);
    lines.push(`Critica
```