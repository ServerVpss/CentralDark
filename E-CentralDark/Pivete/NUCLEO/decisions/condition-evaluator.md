# DECISAO - condition-evaluator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\condition-evaluator.js
**SHA:** 8bf565cf56194340
**Timestamp:** 2026-08-28T02:01:59.903405
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- shouldExecute: true,
- shouldExecute: result,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Condition Evaluator - Evaluates workflow conditions using TechStackProfile
 *
 * DETERMINISTIC: All evaluations use profile data,
 * no AI involvement in condition evaluation.
 *
 * Responsibilities:
 * - Evaluate condition strings against tech stack profile
 * - Determine if workflow phases should execute
 * - Provide skip reasons for non-applicable phases
 *
 * @module core/orchestration/condition-evaluator
 * @version 1.0.0
 */

/**
 * @typedef {import('./tech-stack-detector').TechStackProfile} TechStackProfile
 */

/**
 * @typedef {Object} PhaseEvaluationResult
 * @property {boolean} shouldExecute - Whether the phase should execute
 * @property {string} reason - Reason for the decision
 */

/**
 * Evaluates workflow conditions based on detected tech stack
 */
class ConditionEvaluator {
  /**
   * @param {TechStackProfile} techStackProfile - Profile from TechStackDetector
   */
  constructor(techStackProfile) {
    this.profile = techStackProfile;

    // Context for QA approval tracking (updated externally)
    this._qaApproved = false;
    this._phaseOutputs = {};
  }

  /**
   * Update QA approval status
   * @param {boolean} approved
   */
  setQAApproval(approved) {
    this._qaApproved = approved;
  }

  /**
   * Update phase outputs for context-aware conditions
   * @param {Object} outputs - Map of phase number to output data
   */
  setPhaseOutputs(outputs) {
    this._phaseOutputs = outputs;
  }

  /**
   * Evaluate a condition string
   * @param {string} condition - Condition like 'project_has_database'
   * @returns {boolean} Whether condition is met
   */
  evaluate(condition) {
    // Handle null/undefined conditions
    if (!condition) {
      return true;
    }

    // Built-in condition evaluators
    const evaluators = {
      // Tech stack conditions
      project_has_database: () => this.profile.hasDatabase,
      project_has_frontend: () => this.profile.hasFrontend,
      project_has_backend: () => this.profile.hasBackend,
      project_has_typescript: () => this.profile.hasTypeScript,
      project_has_tests: () => this.profile.hasTests,

      // Database-specific conditions
      supabase_configured: () =>
        this.profile.database.type === 'supabase' && this.profile.database.envVarsConfigured,
      database_has_rls: () => this.profile.database.hasRLS,
      database_has_migrations: () => this.profile.database.hasMigrations,

      // Frontend-specific conditions
      frontend_has_react: () => this.profile.frontend.framework === 'react',
      frontend_has_vue: () => this.profile.frontend.framework === 'vue',
      frontend_has_tailwind: () => this.profile.frontend.styling === 'tailwind',

      // Workflow state conditions
      qa_review_approved: () => this._checkQAApproval(),
      phase_2_completed: () => this._checkPhaseCompleted(2),
      phase_3_completed: () => this._checkPhaseCompleted(3),
      all_collection_phases_complete: () =>
        this._checkPhaseCompleted(1) &&
        this._checkPhaseCompleted(2) &&
        this._checkPhaseCompleted(3),

      // Composite conditions
      has_any_data_to_analyze: () =>
        this.profile.hasDatabase || this.profile.hasFrontend || this.profile.hasBackend,
    };

    // Check for built-in evaluator
    const evaluator = evaluators[condition];
    if (evaluator) {
      return evaluator();
    }

    // Handle negation first
    if (condition.startsWith('!')) {
      return !this.evaluate(condition.substring(1).trim());
    }

    // Handle complex condition expressions
    // LIMITATION: Mixed && and || without parentheses uses left-to-right evaluation
    // For predictable behavior, use only && or only || in a single expression
    const hasAnd = condition.includes('&&');
    const hasOr = condition.includes('||');

    if (hasAnd && hasOr) {
      // Warn about mixed operators - evaluate as && groups separated by ||
      // e.g., "a && b || c && d" becomes ["a && b", "c && d"], any group passing = true
      console.warn(
        `[ConditionEvaluator] Mixed && and || in condition: "${condition}". ` +
          'Using OR-of-ANDs evaluation. Consider using only one operator type.',
      );
      const orGroups = condition.split('||').map((g) => g.trim());
      return orGroups.some((group) => {
        if (group.includes('&&')) {
          return group.split('&&').every((c) => this.evaluate(c.trim()));
        }
        return this.evaluate(group);
      });
    }

    if (hasAnd) {
      return condition.split('&&').every((c) => this.evaluate(c.trim()));
    }

    if (hasOr) {
      return condition.split('||').some((c) => this.evaluate(c.trim()));
    }

    // Handle dot-notation access to profile
    if (condition.includes('.')) {
      return this._evaluateDotNotation(condition);
    }

    // Unknown condition - default to true (permissive)
    console.warn(`[ConditionEvaluator] Unknown condition: ${condition}`);
    return true;
  }

  /**
   * Evaluate dot-notation condition against profile
   * @pri
```