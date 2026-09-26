# COMANDO - focus-area-recommender.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\quality-gates\focus-area-recommender.js
**SHA:** 0ee772078cfc2b2b
**Timestamp:** 2026-08-28T02:02:00.672368
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: /\.(api|routes|endpoints)\./i,
- pattern: /auth|login|password|token|jwt|session/i,
- pattern: /database|migration|schema|model/i,
- pattern: /component|page|view|ui|layout/i,
- pattern: /service|handler|controller|manager/i,
- pattern: /config|settings|env|yaml|json/i,
- pattern: /core|base|abstract|interface/i,
- pattern: /agent|workflow|task|orchestrat/i,
- pattern: /cache|performance|optimi/i,

### Riscos
- risk: 'high',
- risk: 'critical',
- risk: 'high',
- risk: 'medium',
- risk: 'high',
- risk: 'medium',
- risk: 'critical',
- risk: 'high',
- risk: 'medium',
- if (risk === 'critical') analysis.riskLevel = 'critical';

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Focus Area Recommender
 *
 * Generates strategic focus area recommendations for human review:
 * - Architecture decisions
 * - Business logic
 * - Security considerations
 * - UX/UI implications
 *
 * @module core/quality-gates/focus-area-recommender
 * @version 1.0.0
 * @story 3.5 - Human Review Orchestration (Layer 3)
 */

/**
 * Focus Area Recommender
 * Generates intelligent focus areas based on code changes and context
 */
class FocusAreaRecommender {
  /**
   * Create a new recommender
   * @param {Object} config - Recommender configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.strategicAreas = config.strategicAreas || [
      'architecture',
      'business-logic',
      'security',
      'ux',
      'performance',
      'data-integrity',
    ];
    this.skipAreas = config.skipAreas || [
      'syntax',
      'formatting',
      'simple-logic',
      'naming-conventions',
      'import-order',
    ];
  }

  /**
   * Generate focus area recommendations
   * @param {Object} context - Recommendation context
   * @returns {Promise<Object>} Focus area recommendations
   */
  async recommend(context = {}) {
    const { prContext = {}, layer1Result: _layer1Result = {}, layer2Result = {} } = context;

    const recommendations = {
      primary: [],
      secondary: [],
      skip: this.skipAreas,
      summary: '',
      highlightedAspects: [],
    };

    // Analyze changed files
    const fileAnalysis = this.analyzeChangedFiles(prContext.changedFiles || []);
    recommendations.highlightedAspects.push(...fileAnalysis.highlights);

    // Add primary focus areas
    recommendations.primary = this.determinePrimaryAreas(fileAnalysis, layer2Result);

    // Add secondary focus areas
    recommendations.secondary = this.determineSecondaryAreas(fileAnalysis, layer2Result);

    // Generate summary
    recommendations.summary = this.generateSummary(recommendations);

    return recommendations;
  }

  /**
   * Analyze changed files to determine focus areas
   * @param {Array} changedFiles - List of changed file paths
   * @returns {Object} File analysis results
   */
  analyzeChangedFiles(changedFiles = []) {
    const analysis = {
      categories: {},
      patterns: [],
      highlights: [],
      riskLevel: 'low',
    };

    const categoryPatterns = [
      {
        pattern: /\.(api|routes|endpoints)\./i,
        category: 'api',
        highlight: 'API endpoint changes detected',
        risk: 'high',
      },
      {
        pattern: /auth|login|password|token|jwt|session/i,
        category: 'security',
        highlight: 'Security-sensitive code changes',
        risk: 'critical',
      },
      {
        pattern: /database|migration|schema|model/i,
        category: 'data-integrity',
        highlight: 'Database/data model changes',
        risk: 'high',
      },
      {
        pattern: /component|page|view|ui|layout/i,
        category: 'ux',
        highlight: 'UI/UX component changes',
        risk: 'medium',
      },
      {
        pattern: /service|handler|controller|manager/i,
        category: 'business-logic',
        highlight: 'Business logic changes',
        risk: 'high',
      },
      {
        pattern: /config|settings|env|yaml|json/i,
        category: 'configuration',
        highlight: 'Configuration changes',
        risk: 'medium',
      },
      {
        pattern: /core|base|abstract|interface/i,
        category: 'architecture',
        highlight: 'Core architecture changes',
        risk: 'critical',
      },
      {
        pattern: /agent|workflow|task|orchestrat/i,
        category: 'aios-core',
        highlight: 'AIOS framework changes',
        risk: 'high',
      },
      {
        pattern: /cache|performance|optimi/i,
        category: 'performance',
        highlight: 'Performance-related changes',
        risk: 'medium',
      },
    ];

    // Analyze each file
    changedFiles.forEach((file) => {
      categoryPatterns.forEach(({ pattern, category, highlight, risk }) => {
        if (pattern.test(file)) {
          if (!analysis.categories[category]) {
            analysis.categories[category] = [];
            analysis.highlights.push(highlight);
          }
          analysis.categories[category].push(file);

          // Update risk level
          if (risk === 'critical') analysis.riskLevel = 'critical';
          else if (risk === 'high' && analysis.riskLevel !== 'critical') {
            analysis.riskLevel = 'high';
          } else if (risk === 'medium' && analysis.riskLevel === 'low') {
            analysis.riskLevel = 'medium';
          }
        }
      });
    });

    return analysis;
  }

  /**
   * Determine primary focus areas
   * @param {Object} fileAnalysis - File analysis results
   * @param {Object} layer2Result - Layer 2 results
   * @returns {Array} Primary focus areas
   */
  determinePrimaryAreas(fileAnalysis, layer2Result) {
    const primary = [];

    // Priority order for categories
    const prior
```