# COMANDO - executor-assignment.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\executor-assignment.js
**SHA:** d022d8bc01432958
**Timestamp:** 2026-08-28T02:01:59.940502
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- quality_gate: '@architect',
- quality_gate: '@dev',
- quality_gate: '@architect',
- quality_gate: '@dev',
- quality_gate: '@pm',
- quality_gate: '@pm',
- quality_gate: '@architect',
- * //   quality_gate: '@dev',
- quality_gate: config.quality_gate,
- * // Returns: { executor: '@dev', quality_gate: '@architect', quality_gate_tools: [...] }

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Executor Assignment Module - Dynamic assignment of executors and quality gates
 *
 * DETERMINISTIC: Assignment is based on keyword matching against story content.
 * No AI involvement in executor selection.
 *
 * PRD Reference: AIOS v2.0 "Projeto Bob" - Section 5 (Dynamic Executor Assignment)
 *
 * Responsibilities:
 * - Detect story type from content using keyword matching
 * - Assign executor based on work type
 * - Assign quality gate (always different from executor)
 * - Provide quality gate tools for each assignment
 *
 * @module core/orchestration/executor-assignment
 * @version 1.0.0
 */

/**
 * @typedef {Object} ExecutorAssignment
 * @property {string} executor - The assigned executor agent (e.g., '@dev')
 * @property {string} quality_gate - The quality gate reviewer (always different from executor)
 * @property {string[]} quality_gate_tools - Tools available for quality gate review
 */

/**
 * @typedef {Object} StoryTypeConfig
 * @property {string[]} keywords - Keywords that identify this story type
 * @property {string} executor - Default executor for this type
 * @property {string} quality_gate - Default quality gate for this type
 * @property {string[]} quality_gate_tools - Tools for quality gate review
 */

/**
 * Executor assignment table mapping work types to executors and quality gates
 * @constant {Object.<string, StoryTypeConfig>}
 */
const EXECUTOR_ASSIGNMENT_TABLE = {
  // General code: features, logic, handlers, services
  code_general: {
    keywords: [
      'feature',
      'logic',
      'handler',
      'service',
      'controller',
      'function',
      'class',
      'module',
      'implement',
      'api',
      'endpoint',
      'crud',
      'business',
    ],
    executor: '@dev',
    quality_gate: '@architect',
    quality_gate_tools: ['architecture_review', 'code_review', 'pattern_validation'],
  },

  // Database: schemas, RLS, migrations, queries
  database: {
    keywords: [
      'schema',
      'table',
      'migration',
      'rls',
      'query',
      'index',
      'constraint',
      'foreign_key',
      'database',
      'sql',
      'supabase',
      'postgres',
      'column',
      'relation',
    ],
    executor: '@data-engineer',
    quality_gate: '@dev',
    quality_gate_tools: ['schema_validation', 'migration_review', 'rls_test'],
  },

  // Infrastructure: CI/CD, deploy, environments
  infrastructure: {
    keywords: [
      'ci/cd',
      'cicd',
      'deploy',
      'environment',
      'docker',
      'kubernetes',
      'terraform',
      'pipeline',
      'infrastructure',
      'aws',
      'gcp',
      'azure',
      'nginx',
      'devops',
    ],
    executor: '@devops',
    quality_gate: '@architect',
    quality_gate_tools: ['infrastructure_review', 'security_scan', 'config_validation'],
  },

  // UI/UX: components, design, interface
  ui_ux: {
    keywords: [
      'component',
      'ui',
      'ux',
      'design',
      'interface',
      'layout',
      'styling',
      'responsive',
      'accessibility',
      'a11y',
      'css',
      'tailwind',
      'figma',
      'wireframe',
    ],
    executor: '@ux-design-expert',
    quality_gate: '@dev',
    quality_gate_tools: ['accessibility_check', 'design_review', 'component_validation'],
  },

  // Research: investigation, analysis, POC
  research: {
    keywords: [
      'research',
      'investigate',
      'analyze',
      'study',
      'compare',
      'evaluate',
      'poc',
      'proof',
      'concept',
      'benchmark',
      'assessment',
      'exploration',
    ],
    executor: '@analyst',
    quality_gate: '@pm',
    quality_gate_tools: ['research_validation', 'findings_review'],
  },

  // Architecture: design decisions, patterns, scalability
  architecture: {
    keywords: [
      'architecture',
      'design_decision',
      'pattern',
      'scalability',
      'refactor_major',
      'system_design',
      'adr',
      'rfc',
      'technical_decision',
      'microservice',
      'monolith',
    ],
    executor: '@architect',
    quality_gate: '@pm',
    quality_gate_tools: ['architecture_review', 'impact_analysis'],
  },
};

/**
 * Default assignment when no specific type is detected
 * @constant {ExecutorAssignment}
 */
const DEFAULT_ASSIGNMENT = {
  executor: '@dev',
  quality_gate: '@architect',
  quality_gate_tools: ['code_review', 'pattern_validation'],
};

/**
 * Detects the story type based on content analysis using keyword matching
 *
 * @param {string} storyContent - The story content (title, description, acceptance criteria)
 * @returns {string} The detected story type key (e.g., 'code_general', 'database')
 *
 * @example
 * const storyType = detectStoryType('Implement user authentication handler');
 * // Returns: 'code_general'
 *
 * @example
 * const storyType = detectStoryType('Create RLS policies for user table');
 * // Returns: 'database'
 */
function detectStoryType(storyContent) {
  if (!storyContent || typeof storyContent !== 'strin
```