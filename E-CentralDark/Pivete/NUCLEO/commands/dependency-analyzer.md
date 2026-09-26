# COMANDO - dependency-analyzer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\dependency-analyzer.js
**SHA:** 64d6433a789a6895
**Timestamp:** 2026-08-28T02:02:03.824818
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing: [],
- missing: deps.missing

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Dependency Analyzer for AIOS-FULLSTACK
 * Analyzes and resolves dependencies between components
 * @module dependency-analyzer
 */

const fs = require('fs-extra');
const path = require('path');
const _yaml = require('js-yaml');
const chalk = require('chalk');

class DependencyAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.manifestPath = path.join(this.rootPath, 'aios-core', 'team-manifest.yaml');
    
    // Component paths
    this.paths = {
      agents: path.join(this.rootPath, 'aios-core', 'agents'),
      tasks: path.join(this.rootPath, 'aios-core', 'tasks'),
      workflows: path.join(this.rootPath, 'aios-core', 'workflows')
    };
    
    // Dependency cache
    this.dependencyCache = new Map();
  }

  /**
   * Analyze dependencies for a component
   * @param {string} componentType - Type of component (agent/task/workflow)
   * @param {Object} componentData - Component configuration data
   * @returns {Promise<Object>} Dependency analysis result
   */
  async analyzeDependencies(componentType, componentData) {
    const dependencies = {
      required: [],
      optional: [],
      missing: [],
      circular: false,
      graph: new Map()
    };
    
    switch (componentType) {
      case 'agent':
        await this.analyzeAgentDependencies(componentData, dependencies);
        break;
      case 'task':
        await this.analyzeTaskDependencies(componentData, dependencies);
        break;
      case 'workflow':
        await this.analyzeWorkflowDependencies(componentData, dependencies);
        break;
    }
    
    // Check for circular dependencies
    dependencies.circular = this.detectCircularDependencies(dependencies.graph);
    
    return dependencies;
  }

  /**
   * Analyze agent dependencies
   * @private
   */
  async analyzeAgentDependencies(agentData, dependencies) {
    // Check for task dependencies from commands
    if (agentData.commands && Array.isArray(agentData.commands)) {
      for (const command of agentData.commands) {
        const taskId = this.commandToTaskId(command);
        const taskPath = path.join(this.paths.tasks, `${taskId}.md`);
        
        if (await fs.pathExists(taskPath)) {
          dependencies.required.push({
            type: 'task',
            id: taskId,
            path: taskPath,
            reason: `Command '${command}' requires task`
          });
        } else {
          dependencies.missing.push({
            type: 'task',
            id: taskId,
            reason: `Command '${command}' requires task file`
          });
        }
      }
    }
    
    // Check for workflow dependencies
    if (agentData.workflows && Array.isArray(agentData.workflows)) {
      for (const workflowId of agentData.workflows) {
        const workflowPath = path.join(this.paths.workflows, `${workflowId}.yaml`);
        
        if (await fs.pathExists(workflowPath)) {
          dependencies.optional.push({
            type: 'workflow',
            id: workflowId,
            path: workflowPath,
            reason: 'Agent workflow reference'
          });
        }
      }
    }
    
    // Check for agent dependencies
    if (agentData.dependencies?.agents) {
      for (const agentId of agentData.dependencies.agents) {
        const agentPath = path.join(this.paths.agents, `${agentId}.md`);
        
        if (await fs.pathExists(agentPath)) {
          dependencies.required.push({
            type: 'agent',
            id: agentId,
            path: agentPath,
            reason: 'Explicit agent dependency'
          });
        } else {
          dependencies.missing.push({
            type: 'agent',
            id: agentId,
            reason: 'Required agent not found'
          });
        }
      }
    }
  }

  /**
   * Analyze task dependencies
   * @private
   */
  async analyzeTaskDependencies(taskData, dependencies) {
    // Check for agent dependency
    if (taskData.agentName) {
      const agentPath = path.join(this.paths.agents, `${taskData.agentName}.md`);
      
      if (await fs.pathExists(agentPath)) {
        dependencies.required.push({
          type: 'agent',
          id: taskData.agentName,
          path: agentPath,
          reason: 'Task belongs to agent'
        });
      } else {
        dependencies.missing.push({
          type: 'agent',
          id: taskData.agentName,
          reason: 'Agent not found for task'
        });
      }
    }
    
    // Check for other task dependencies
    if (taskData.dependencies?.tasks) {
      for (const taskId of taskData.dependencies.tasks) {
        const taskPath = path.join(this.paths.tasks, `${taskId}.md`);
        
        if (await fs.pathExists(taskPath)) {
          dependencies.required.push({
            type: 'task',
            id: taskId,
            path: taskPath,
            reason: 'Task dependency'
          });
        } else {
          dependencies.missing.push({
            type: 'task',
            id
```

---

# COMANDO - dependency-analyzer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\dependency-analyzer.js
**SHA:** e375efa02c1ac776
**Timestamp:** 2026-08-28T02:02:13.169581
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing: [],
- missing: deps.missing,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Dependency Analyzer for Synkra AIOS
 * Analyzes and resolves dependencies between components
 * @module dependency-analyzer
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class DependencyAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.manifestPath = path.join(this.rootPath, 'aios-core', 'team-manifest.yaml');
    
    // Component paths
    this.paths = {
      agents: path.join(this.rootPath, 'aios-core', 'agents'),
      tasks: path.join(this.rootPath, 'aios-core', 'tasks'),
      workflows: path.join(this.rootPath, 'aios-core', 'workflows'),
    };
    
    // Dependency cache
    this.dependencyCache = new Map();
  }

  /**
   * Analyze dependencies for a component
   * @param {string} componentType - Type of component (agent/task/workflow)
   * @param {Object} componentData - Component configuration data
   * @returns {Promise<Object>} Dependency analysis result
   */
  async analyzeDependencies(componentType, componentData) {
    const dependencies = {
      required: [],
      optional: [],
      missing: [],
      circular: false,
      graph: new Map(),
    };
    
    switch (componentType) {
      case 'agent':
        await this.analyzeAgentDependencies(componentData, dependencies);
        break;
      case 'task':
        await this.analyzeTaskDependencies(componentData, dependencies);
        break;
      case 'workflow':
        await this.analyzeWorkflowDependencies(componentData, dependencies);
        break;
    }
    
    // Check for circular dependencies
    dependencies.circular = this.detectCircularDependencies(dependencies.graph);
    
    return dependencies;
  }

  /**
   * Analyze agent dependencies
   * @private
   */
  async analyzeAgentDependencies(agentData, dependencies) {
    // Check for task dependencies from commands
    if (agentData.commands && Array.isArray(agentData.commands)) {
      for (const command of agentData.commands) {
        const taskId = this.commandToTaskId(command);
        const taskPath = path.join(this.paths.tasks, `${taskId}.md`);
        
        if (await fs.pathExists(taskPath)) {
          dependencies.required.push({
            type: 'task',
            id: taskId,
            path: taskPath,
            reason: `Command '${command}' requires task`,
          });
        } else {
          dependencies.missing.push({
            type: 'task',
            id: taskId,
            reason: `Command '${command}' requires task file`,
          });
        }
      }
    }
    
    // Check for workflow dependencies
    if (agentData.workflows && Array.isArray(agentData.workflows)) {
      for (const workflowId of agentData.workflows) {
        const workflowPath = path.join(this.paths.workflows, `${workflowId}.yaml`);
        
        if (await fs.pathExists(workflowPath)) {
          dependencies.optional.push({
            type: 'workflow',
            id: workflowId,
            path: workflowPath,
            reason: 'Agent workflow reference',
          });
        }
      }
    }
    
    // Check for agent dependencies
    if (agentData.dependencies?.agents) {
      for (const agentId of agentData.dependencies.agents) {
        const agentPath = path.join(this.paths.agents, `${agentId}.md`);
        
        if (await fs.pathExists(agentPath)) {
          dependencies.required.push({
            type: 'agent',
            id: agentId,
            path: agentPath,
            reason: 'Explicit agent dependency',
          });
        } else {
          dependencies.missing.push({
            type: 'agent',
            id: agentId,
            reason: 'Required agent not found',
          });
        }
      }
    }
  }

  /**
   * Analyze task dependencies
   * @private
   */
  async analyzeTaskDependencies(taskData, dependencies) {
    // Check for agent dependency
    if (taskData.agentName) {
      const agentPath = path.join(this.paths.agents, `${taskData.agentName}.md`);
      
      if (await fs.pathExists(agentPath)) {
        dependencies.required.push({
          type: 'agent',
          id: taskData.agentName,
          path: agentPath,
          reason: 'Task belongs to agent',
        });
      } else {
        dependencies.missing.push({
          type: 'agent',
          id: taskData.agentName,
          reason: 'Agent not found for task',
        });
      }
    }
    
    // Check for other task dependencies
    if (taskData.dependencies?.tasks) {
      for (const taskId of taskData.dependencies.tasks) {
        const taskPath = path.join(this.paths.tasks, `${taskId}.md`);
        
        if (await fs.pathExists(taskPath)) {
          dependencies.required.push({
            type: 'task',
            id: taskId,
            path: taskPath,
            reason: 'Task dependency',
          });
        } else {
          dependencies.missing.push({
            type: 'task',
        
```