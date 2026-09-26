# COMANDO - surface-checker.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\surface-checker.js
**SHA:** 92e9d5bea78c3db4
**Timestamp:** 2026-08-28T02:02:00.096873
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Pattern: field operator value

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Surface Checker - Determines when Bob should surface to ask human
 *
 * Story 11.4: Bob Surface Criteria
 *
 * This module evaluates codified criteria to determine when the AI
 * should interrupt and ask for human decision, ensuring consistent
 * behavior regardless of LLM reasoning.
 *
 * @module core/orchestration/surface-checker
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * @typedef {Object} SurfaceContext
 * @property {number} [estimated_cost] - Estimated cost in USD
 * @property {string} [risk_level] - Risk level ('LOW', 'MEDIUM', 'HIGH')
 * @property {string} [risk_details] - Details about the risk
 * @property {number} [valid_options_count] - Number of valid options available
 * @property {string} [options_with_tradeoffs] - Formatted options with trade-offs
 * @property {number} [errors_in_task] - Number of consecutive errors in current task
 * @property {string} [error_summary] - Summary of errors encountered
 * @property {string} [action_type] - Type of action being performed
 * @property {string} [action_description] - Description of the action
 * @property {string} [affected_files] - Files affected by destructive action
 * @property {string} [requested_scope] - Requested scope
 * @property {string} [approved_scope] - Approved scope
 * @property {string} [scope_difference] - Difference between scopes
 * @property {boolean} [requires_api_key] - Whether operation requires API key
 * @property {boolean} [requires_payment] - Whether operation requires payment
 * @property {boolean} [requires_external_service] - Whether operation requires external service
 * @property {string} [dependency_description] - Description of external dependency
 */

/**
 * @typedef {Object} SurfaceResult
 * @property {boolean} should_surface - Whether Bob should surface to ask human
 * @property {string|null} criterion_id - ID of the triggered criterion (null if no surface)
 * @property {string|null} criterion_name - Name of the triggered criterion
 * @property {string|null} action - Action to take (null if no surface)
 * @property {string|null} message - Interpolated message to display (null if no surface)
 * @property {string|null} severity - Severity level (null if no surface)
 * @property {boolean} can_bypass - Whether this criterion can be bypassed in YOLO mode
 */

/**
 * @typedef {Object} ActionConfig
 * @property {string} type - Action type
 * @property {string} prompt_type - Prompt type to use
 * @property {string|null} default - Default value
 * @property {number} timeout_seconds - Timeout in seconds
 * @property {string} on_timeout - Action on timeout
 * @property {Array<{value: string, label: string}>} [options] - Options for select prompts
 * @property {string} [required_input] - Required input for explicit confirm
 */

class SurfaceChecker {
  /**
   * Create a SurfaceChecker instance
   * @param {string} [criteriaPath] - Path to criteria YAML file (optional, uses default)
   */
  constructor(criteriaPath = null) {
    this.criteriaPath =
      criteriaPath ||
      path.join(__dirname, 'bob-surface-criteria.yaml');
    this.criteria = null;
    this._loaded = false;
  }

  /**
   * Load criteria from YAML file
   * @returns {boolean} Whether loading was successful
   */
  load() {
    try {
      if (!fs.existsSync(this.criteriaPath)) {
        console.warn(`[SurfaceChecker] Criteria file not found: ${this.criteriaPath}`);
        return false;
      }

      const content = fs.readFileSync(this.criteriaPath, 'utf8');
      this.criteria = yaml.load(content);
      this._loaded = true;
      return true;
    } catch (error) {
      console.error(`[SurfaceChecker] Failed to load criteria: ${error.message}`);
      return false;
    }
  }

  /**
   * Ensure criteria are loaded
   * @private
   */
  _ensureLoaded() {
    if (!this._loaded) {
      this.load();
    }
  }

  /**
   * Evaluate a condition against the context
   * @param {string} condition - Condition expression
   * @param {SurfaceContext} context - Context to evaluate against
   * @returns {boolean} Whether condition is met
   */
  evaluateCondition(condition, context) {
    // Handle comparison operators
    // Pattern: field operator value
    // Supported: >, <, >=, <=, ==, !=

    // Greater than
    const gtMatch = condition.match(/^(\w+)\s*>\s*(\d+(?:\.\d+)?)$/);
    if (gtMatch) {
      const [, field, value] = gtMatch;
      return (context[field] || 0) > parseFloat(value);
    }

    // Greater than or equal
    const gteMatch = condition.match(/^(\w+)\s*>=\s*(\d+(?:\.\d+)?)$/);
    if (gteMatch) {
      const [, field, value] = gteMatch;
      return (context[field] || 0) >= parseFloat(value);
    }

    // Less than
    const ltMatch = condition.match(/^(\w+)\s*<\s*(\d+(?:\.\d+)?)$/);
    if (ltMatch) {
      const [, field, value] = ltMatch;
      return (context[field] || 0) < parseFloat(value);
    }

    // Less than or equal
    const lteMatch = conditio
```