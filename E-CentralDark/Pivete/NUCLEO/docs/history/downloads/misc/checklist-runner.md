# OUTRO - checklist-runner.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\checklist-runner.js
**SHA:** 0f40d2287efb504d
**Timestamp:** 2026-08-28T02:01:59.882136
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const yamlBlockPattern = /```ya?ml\n([\s\S]*?)```/g;
- const checkboxPattern = /^[-*]\s*\[[ x]\]\s*(.+)$/gm;

### Riscos
- * - blocker: true | false (stops execution if fails)
- blocker: false,
- blocker: category === 'pre-conditions',
- blocker: item.blocker !== false && category !== 'manual',
- blocker: item.blocker,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Checklist Runner - Executes validation checklists programmatically
 *
 * DETERMINISTIC: Parses checklist markdown files and evaluates items
 * using code-based rules, no AI involvement in validation.
 *
 * Checklist items can define:
 * - tipo: pre-condition | post-condition | acceptance-criterion
 * - blocker: true | false (stops execution if fails)
 * - validação: Code-based validation rule
 *
 * @module core/orchestration/checklist-runner
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Runs checklist validations programmatically
 */
class ChecklistRunner {
  /**
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.checklistsPath = path.join(projectRoot, '.aios-core', 'product', 'checklists');
  }

  /**
   * Run a checklist against target file(s)
   * @param {string} checklistName - Checklist file name
   * @param {string|string[]} targetPaths - Path(s) to validate
   * @returns {Promise<Object>} Validation result
   */
  async run(checklistName, targetPaths) {
    const result = {
      checklist: checklistName,
      passed: true,
      items: [],
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // Load checklist
    const checklist = await this.loadChecklist(checklistName);
    if (!checklist) {
      result.passed = false;
      result.errors.push(`Checklist not found: ${checklistName}`);
      return result;
    }

    // Parse checklist items
    const items = this.parseChecklistItems(checklist);

    // Evaluate each item
    for (const item of items) {
      const itemResult = await this.evaluateItem(item, targetPaths);
      result.items.push(itemResult);

      if (!itemResult.passed) {
        if (item.blocker) {
          result.passed = false;
          result.errors.push(`Blocker failed: ${item.description}`);
        }
      }
    }

    return result;
  }

  /**
   * Load checklist file content
   * @param {string} checklistName - Checklist file name
   * @returns {Promise<string|null>} Checklist content or null
   */
  async loadChecklist(checklistName) {
    const fileName = checklistName.endsWith('.md') ? checklistName : `${checklistName}.md`;
    const filePath = path.join(this.checklistsPath, fileName);

    if (await fs.pathExists(filePath)) {
      return await fs.readFile(filePath, 'utf8');
    }

    return null;
  }

  /**
   * Parse checklist markdown into structured items
   * @param {string} content - Checklist markdown content
   * @returns {Object[]} Parsed checklist items
   */
  parseChecklistItems(content) {
    const items = [];

    // Pattern 1: YAML code blocks with checklist items
    const yamlBlockPattern = /```ya?ml\n([\s\S]*?)```/g;
    let yamlMatch;
    while ((yamlMatch = yamlBlockPattern.exec(content)) !== null) {
      try {
        const yamlContent = yaml.load(yamlMatch[1]);
        if (yamlContent) {
          // Handle pre-conditions, post-conditions, acceptance-criteria
          for (const key of ['pre-conditions', 'post-conditions', 'acceptance-criteria']) {
            if (yamlContent[key]) {
              for (const item of yamlContent[key]) {
                items.push(this.normalizeItem(item, key));
              }
            }
          }
        }
      } catch (_e) {
        // Invalid YAML - continue
      }
    }

    // Pattern 2: Markdown checkboxes with descriptions
    const checkboxPattern = /^[-*]\s*\[[ x]\]\s*(.+)$/gm;
    let checkboxMatch;
    while ((checkboxMatch = checkboxPattern.exec(content)) !== null) {
      const description = checkboxMatch[1].trim();
      // Skip if already parsed from YAML
      if (!items.some(i => i.description.includes(description.substring(0, 30)))) {
        items.push({
          description,
          tipo: 'manual',
          blocker: false,
          validation: null,
        });
      }
    }

    return items;
  }

  /**
   * Normalize a checklist item to standard format
   * @param {Object|string} item - Raw item from YAML or markdown
   * @param {string} category - Item category (pre-condition, etc.)
   * @returns {Object} Normalized item
   */
  normalizeItem(item, category) {
    if (typeof item === 'string') {
      return {
        description: item,
        tipo: category,
        blocker: category === 'pre-conditions',
        validation: null,
      };
    }

    // Item is an object with YAML structure
    const firstKey = Object.keys(item)[0];
    const description = firstKey.replace(/^\[[ x]\]\s*/, '').trim();

    return {
      description,
      tipo: item.tipo || category,
      blocker: item.blocker !== false && category !== 'manual',
      validation: item.validação || item.validation || null,
      errorMessage: item.error_message || null,
    };
  }

  /**
   * Evaluate a single checklist item
   * @param {Object} item - Checklist item to evaluate
   * @param {string|string[]} target
```