# COMANDO - workflow-orchestrator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\workflow-orchestrator.js
**SHA:** fb89682ea86d33bf
**Timestamp:** 2026-08-28T02:02:00.283207
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- onPhaseStart: options.onPhaseStart || this._defaultPhaseStart.bind(this),
- shouldExecute: this._evaluateConditionLegacy(phase.condition),
- const prompt = await this.promptBuilder.buildPrompt(

### Gaps
- const missing = [];
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Workflow Orchestrator - Multi-Agent Workflow Execution
 *
 * Executes workflows using real subagents with proper persona transformation.
 * Each phase dispatches to a specialized agent that fully adopts its persona
 * and executes the defined task following AIOS methodology.
 *
 * @module core/orchestration/workflow-orchestrator
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

const SubagentPromptBuilder = require('./subagent-prompt-builder');
const ContextManager = require('./context-manager');
const ParallelExecutor = require('./parallel-executor');
const ChecklistRunner = require('./checklist-runner');

// V3.1 Components for Pre-Flight Detection and Skill Dispatch
const TechStackDetector = require('./tech-stack-detector');
const ConditionEvaluator = require('./condition-evaluator');
const SkillDispatcher = require('./skill-dispatcher');

/**
 * Orchestrates multi-agent workflow execution
 */
class WorkflowOrchestrator {
  /**
   * @param {string} workflowPath - Path to workflow YAML file
   * @param {Object} options - Execution options
   * @param {boolean} options.yolo - YOLO mode (less interaction)
   * @param {boolean} options.parallel - Enable parallel execution
   * @param {Function} options.onPhaseStart - Callback when phase starts
   * @param {Function} options.onPhaseComplete - Callback when phase completes
   * @param {Function} options.dispatchSubagent - Function to dispatch subagent (Task tool)
   */
  constructor(workflowPath, options = {}) {
    this.workflowPath = workflowPath;
    this.options = {
      yolo: options.yolo || false,
      parallel: options.parallel !== false, // Default true
      onPhaseStart: options.onPhaseStart || this._defaultPhaseStart.bind(this),
      onPhaseComplete: options.onPhaseComplete || this._defaultPhaseComplete.bind(this),
      dispatchSubagent: options.dispatchSubagent || null,
      projectRoot: options.projectRoot || process.cwd(),
    };

    this.workflow = null;
    this.promptBuilder = new SubagentPromptBuilder(this.options.projectRoot);
    this.contextManager = null;
    this.parallelExecutor = new ParallelExecutor();
    this.checklistRunner = new ChecklistRunner(this.options.projectRoot);

    // V3.1: Pre-flight detection and skill dispatch components
    this.techStackDetector = new TechStackDetector(this.options.projectRoot);
    this.skillDispatcher = new SkillDispatcher(this.options);
    this.conditionEvaluator = null; // Initialized after pre-flight detection
    this.techStackProfile = null; // Populated by pre-flight detection

    // Execution state
    this.executionState = {
      startTime: null,
      currentPhase: 0,
      completedPhases: [],
      failedPhases: [],
      skippedPhases: [],
    };
  }

  /**
   * Load and parse workflow definition
   * @returns {Promise<Object>} Parsed workflow
   */
  async loadWorkflow() {
    try {
      const content = await fs.readFile(this.workflowPath, 'utf8');
      this.workflow = yaml.load(content);

      // Extract workflow metadata
      const workflowId = this.workflow.workflow?.id || path.basename(this.workflowPath, '.yaml');
      this.contextManager = new ContextManager(workflowId, this.options.projectRoot);

      return this.workflow;
    } catch (error) {
      throw new Error(`Failed to load workflow: ${error.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                    DETERMINISTIC CODE SECTION
  //          All operations below do NOT depend on AI - pure JavaScript
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Setup all required directories before workflow execution
   * DETERMINISTIC: Creates folders via fs.ensureDir, no AI involved
   * @returns {Promise<string[]>} List of created directories
   */
  async setupDirectories() {
    const dirs = [
      'docs/architecture',
      'docs/frontend',
      'docs/prd',
      'docs/reviews',
      'docs/reports',
      'docs/stories',
      'supabase/docs',
      '.aios/workflow-state',
    ];

    const created = [];
    for (const dir of dirs) {
      const fullPath = path.join(this.options.projectRoot, dir);
      await fs.ensureDir(fullPath);
      created.push(dir);
      console.log(chalk.gray(`   📁 ${dir}`));
    }

    return created;
  }

  /**
   * Prepare phase execution - runs BEFORE subagent dispatch
   * DETERMINISTIC: All operations are code-based, not AI-dependent
   * @param {Object} phase - Phase configuration
   * @returns {Promise<Object>} Preparation result
   */
  async preparePhase(phase) {
    const results = { preActions: [], errors: [] };

    // 1. Create output directory if needed
    if (phase.creates) {
      const creates = Array.isArray(phase.creates) ? phase.creates : [phase.creates];
      for (const outputPath of creates) {
        const dir = path.dirname(outputPath);
     
```