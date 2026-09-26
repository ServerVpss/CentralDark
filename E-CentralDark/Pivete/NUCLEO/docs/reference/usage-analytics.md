# REFERENCIA - usage-analytics.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\usage-analytics.js
**SHA:** b65464e8bb37a80b
**Timestamp:** 2026-08-28T02:02:14.398485
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- agentPatterns.forEach(pattern => {
- taskPatterns.forEach(pattern => {
- workflowPatterns.forEach(pattern => {
- utilPatterns.forEach(pattern => {
- const namePattern = new RegExp(component.name || component.id, 'gi');
- usage_pattern: this.identifyUsagePattern(content, component),

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Usage pattern analyzer for Synkra AIOS framework components
 * Analyzes how components are used throughout the codebase
 */
class UsageAnalytics {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
    this.usageCache = new Map();
    this.patterns = {
      imports: [
        /require\(['"`]([^'"`]+)['"`]\)/g,
        /import .* from ['"`]([^'"`]+)['"`]/g,
        /import\(['"`]([^'"`]+)['"`]\)/g,
      ],
      taskCalls: [
        /\*([a-zA-Z-]+)/g,
        /executeTask\(['"`]([^'"`]+)['"`]\)/g,
      ],
      agentReferences: [
        /aios-developer/g,
        /meta-agent/g,
        /@agent\s+([a-zA-Z-]+)/g,
      ],
      utilCalls: [
        /require\(['"`]\.\.\/utils\/([^'"`]+)['"`]\)/g,
        /from ['"`]\.\.\/utils\/([^'"`]+)['"`]/g,
      ],
    };
  }

  /**
   * Analyze usage patterns for all components
   */
  async analyzeUsagePatterns(components) {
    const usage = {
      timestamp: new Date().toISOString(),
      component_usage: {},
      hotspots: [],
      unused_components: [],
      popular_components: [],
      usage_trends: {},
      cross_references: {},
      efficiency_score: 0,
      recommendations: [],
    };

    try {
      console.log(chalk.blue('Analyzing component usage patterns...'));

      // Analyze usage for each component
      for (const component of components) {
        const componentUsage = await this.analyzeComponentUsage(component);
        usage.component_usage[component.id] = componentUsage;
      }

      // Calculate derived metrics
      usage.hotspots = this.identifyHotspots(usage.component_usage);
      usage.unused_components = this.findUnusedComponents(usage.component_usage);
      usage.popular_components = this.findPopularComponents(usage.component_usage);
      usage.cross_references = await this.analyzeCrossReferences(components);
      usage.efficiency_score = this.calculateEfficiencyScore(usage);
      usage.recommendations = this.generateUsageRecommendations(usage);

      console.log(chalk.green(`✅ Analyzed usage for ${components.length} components`));
      return usage;

    } catch (error) {
      console.error(chalk.red(`Usage analysis failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze usage patterns for a single component
   */
  async analyzeComponentUsage(component) {
    const cacheKey = `${component.id}-${component.last_modified}`;
    
    if (this.usageCache.has(cacheKey)) {
      const cached = this.usageCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const usage = {
      component_id: component.id,
      type: component.type,
      direct_references: 0,
      indirect_references: 0,
      referencing_files: [],
      usage_contexts: [],
      popularity_score: 0,
      last_used: null,
      usage_frequency: 'never',
      dependency_depth: 0,
      integration_points: [],
    };

    try {
      // Search for direct references
      const directRefs = await this.findDirectReferences(component);
      usage.direct_references = directRefs.count;
      usage.referencing_files = directRefs.files;

      // Search for indirect references
      const indirectRefs = await this.findIndirectReferences(component);
      usage.indirect_references = indirectRefs.count;

      // Analyze usage contexts
      usage.usage_contexts = await this.analyzeUsageContexts(component, directRefs.files);

      // Calculate metrics
      usage.popularity_score = this.calculatePopularityScore(usage);
      usage.last_used = await this.findLastUsageDate(component);
      usage.usage_frequency = this.calculateUsageFrequency(usage);
      usage.dependency_depth = await this.calculateDependencyDepth(component);
      usage.integration_points = await this.findIntegrationPoints(component);

      // Cache the result
      this.usageCache.set(cacheKey, {
        timestamp: Date.now(),
        data: usage,
      });

      return usage;

    } catch (error) {
      console.warn(chalk.yellow(`Failed to analyze usage for ${component.id}: ${error.message}`));
      return usage;
    }
  }

  /**
   * Find direct references to a component
   */
  async findDirectReferences(component) {
    const references = {
      count: 0,
      files: [],
      locations: [],
    };

    try {
      const searchPaths = [
        path.join(this.rootPath, 'aios-core'),
        path.join(this.rootPath, 'tests'),
        path.join(this.rootPath, 'docs'),
        path.join(this.rootPath, 'examples'),
      ];

      for (const searchPath of searchPaths) {
        try {
          await fs.access(searchPath);
          await this.searchInDirectory(searchPath, component, references);
        } catch (error) {
          // Directory doesn't exist, skip
        }
      }

 
```