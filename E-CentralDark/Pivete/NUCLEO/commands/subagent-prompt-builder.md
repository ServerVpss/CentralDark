# COMANDO - subagent-prompt-builder.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\subagent-prompt-builder.js
**SHA:** 3da03371fa4cafa4
**Timestamp:** 2026-08-28T02:02:00.086063
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let prompt = `# AGENT TRANSFORMATION

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Subagent Prompt Builder - Assembles prompts from REAL TASKS
 *
 * This module does NOT generate generic prompts. Instead, it loads:
 * - Complete agent definition (.md file)
 * - Complete task definition (.md file)
 * - Referenced checklists
 * - Referenced templates
 *
 * The subagent receives the FULL task instructions, not a summary.
 *
 * @module core/orchestration/subagent-prompt-builder
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Builds structured prompts for subagents using real task definitions
 */
class SubagentPromptBuilder {
  /**
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.aiosCoreRoot = path.join(projectRoot, '.aios-core');

    // Paths to AIOS components
    this.paths = {
      agents: path.join(this.aiosCoreRoot, 'development', 'agents'),
      tasks: path.join(this.aiosCoreRoot, 'development', 'tasks'),
      checklists: path.join(this.aiosCoreRoot, 'product', 'checklists'),
      templates: path.join(this.aiosCoreRoot, 'product', 'templates'),
    };
  }

  /**
   * Build a complete prompt for a subagent
   * Loads REAL task files, NOT generic prompts
   *
   * @param {string} agentId - Agent identifier (e.g., 'architect', 'data-engineer')
   * @param {string} taskFile - Task file name (e.g., 'document-project.md')
   * @param {Object} context - Execution context
   * @returns {Promise<string>} Complete prompt for subagent
   */
  async buildPrompt(agentId, taskFile, context = {}) {
    // 1. Load complete agent definition
    const agentDef = await this.loadAgentDefinition(agentId);

    // 2. Load complete task definition
    const taskDef = await this.loadTaskDefinition(taskFile);

    // 3. Extract and load referenced checklists from task
    const checklists = await this.extractAndLoadChecklists(taskDef, context.checklist);

    // 4. Extract and load referenced templates from task
    const templates = await this.extractAndLoadTemplates(taskDef, context.template);

    // 5. Build context section from previous phases
    const contextSection = this.formatContextSection(context);

    // 6. Assemble the complete prompt
    return this.assemblePrompt({
      agentId,
      agentDef,
      taskFile,
      taskDef,
      checklists,
      templates,
      context,
      contextSection,
    });
  }

  /**
   * Load complete agent definition file
   * @param {string} agentId - Agent identifier
   * @returns {Promise<string>} Complete agent .md file content
   */
  async loadAgentDefinition(agentId) {
    // Try different file naming patterns
    const patterns = [
      `${agentId}.md`,
      `${agentId.replace(/-/g, '_')}.md`,
    ];

    for (const pattern of patterns) {
      const filePath = path.join(this.paths.agents, pattern);
      if (await fs.pathExists(filePath)) {
        return await fs.readFile(filePath, 'utf8');
      }
    }

    // Agent not found - return minimal definition
    console.warn(`[SubagentPromptBuilder] Agent definition not found: ${agentId}`);
    return `# Agent: ${agentId}\nNo definition file found.`;
  }

  /**
   * Load complete task definition file
   * @param {string} taskFile - Task file name
   * @returns {Promise<string>} Complete task .md file content
   */
  async loadTaskDefinition(taskFile) {
    // Ensure .md extension
    const fileName = taskFile.endsWith('.md') ? taskFile : `${taskFile}.md`;
    const filePath = path.join(this.paths.tasks, fileName);

    if (await fs.pathExists(filePath)) {
      return await fs.readFile(filePath, 'utf8');
    }

    // Try to find by action name (e.g., 'document-project' -> 'document-project.md')
    const altPath = path.join(this.paths.tasks, `${taskFile.replace('*', '')}.md`);
    if (await fs.pathExists(altPath)) {
      return await fs.readFile(altPath, 'utf8');
    }

    console.warn(`[SubagentPromptBuilder] Task definition not found: ${taskFile}`);
    return `# Task: ${taskFile}\nNo definition file found.`;
  }

  /**
   * Extract checklist references from task and load them
   * @param {string} taskDef - Task definition content
   * @param {string} overrideChecklist - Checklist from phase config (takes precedence)
   * @returns {Promise<Object[]>} Array of loaded checklists
   */
  async extractAndLoadChecklists(taskDef, overrideChecklist = null) {
    const checklists = [];

    // Priority 1: Override checklist from phase config
    if (overrideChecklist) {
      const content = await this.loadChecklist(overrideChecklist);
      if (content) {
        checklists.push({ name: overrideChecklist, content });
      }
    }

    // Priority 2: Checklists referenced in task frontmatter
    const frontmatterMatch = taskDef.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        if (frontmatter?.checklists) {
          for (const checklistNa
```