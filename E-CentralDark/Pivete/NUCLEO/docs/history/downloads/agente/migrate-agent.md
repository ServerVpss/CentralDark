# AGENTE - migrate-agent.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\migrate-agent.js
**SHA:** 525f6e7b5dae89b8
**Timestamp:** 2026-08-28T02:02:13.056361
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- canExecute: true,
- canExecute: true,
- canExecute: capabilities.execution.canExecute || false,
- const { dryRun = false, backup = false, force = false } = options;
- dryRun: true,
- const dryRun = args.includes('--dry-run');

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Agent Migration Script (V2 → V3)
 * Story 2.4: Migrates agents to V3 format with Auto-Claude capabilities
 *
 * Usage:
 *   node migrate-agent.js <agent-id> [--dry-run] [--backup] [--force]
 *   node migrate-agent.js --list
 *
 * @module migrate-agent
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Paths
const AGENTS_DIR = '.aios-core/development/agents';
const BACKUP_DIR = '.aios/migration-backup';
const SCHEMAS_DIR = '.aios-core/schemas';

// Agent capability matrix based on role
const AGENT_CAPABILITIES = {
  pm: {
    specPipeline: {
      canGather: true,
      canWrite: true,
    },
  },
  architect: {
    specPipeline: {
      canAssess: true,
    },
    execution: {
      canCreatePlan: true,
      canCreateContext: true,
    },
  },
  analyst: {
    specPipeline: {
      canResearch: true,
    },
    memory: {
      canExtractPatterns: true,
    },
  },
  dev: {
    execution: {
      canExecute: true,
      canVerify: true,
      selfCritique: {
        enabled: true,
        checklistRef: 'story-dod-checklist.md',
      },
    },
    recovery: {
      canTrack: true,
      canRollback: true,
      maxAttempts: 3,
      stuckDetection: true,
    },
    memory: {
      canCaptureInsights: true,
    },
  },
  qa: {
    specPipeline: {
      canCritique: true,
    },
    execution: {
      canVerify: true,
    },
    qa: {
      canReview: true,
      canFixRequest: true,
      reviewPhases: 10,
      maxIterations: 5,
    },
  },
  devops: {
    worktree: {
      canCreate: true,
      canMerge: true,
      canCleanup: true,
    },
  },
  po: {
    specPipeline: {
      canGather: true,
      canWrite: true,
    },
  },
  sm: {
    // Scrum Master doesn't have specific Auto-Claude capabilities
  },
  'aios-master': {
    specPipeline: {
      canGather: true,
      canAssess: true,
      canResearch: true,
      canWrite: true,
      canCritique: true,
    },
    execution: {
      canCreatePlan: true,
      canCreateContext: true,
    },
  },
  'data-engineer': {
    execution: {
      canExecute: true,
      canVerify: true,
    },
    memory: {
      canExtractPatterns: true,
    },
  },
  'ux-design-expert': {
    specPipeline: {
      canResearch: true,
    },
    execution: {
      canCreateContext: true,
    },
  },
  'squad-creator': {
    execution: {
      canCreatePlan: true,
    },
  },
};

/**
 * Extract YAML content from markdown file
 */
function extractYamlFromMarkdown(content) {
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlockMatch) {
    try {
      return { yaml: yaml.load(yamlBlockMatch[1]), raw: yamlBlockMatch[1] };
    } catch (e) {
      return { error: e.message };
    }
  }
  return { yaml: null, raw: null };
}

/**
 * Check if agent already has V3 autoClaude section
 */
function isAlreadyV3(parsed) {
  return parsed?.autoClaude?.version === '3.0';
}

/**
 * Generate autoClaude section for an agent
 */
function generateAutoClaudeSection(agentId) {
  const capabilities = AGENT_CAPABILITIES[agentId] || {};

  const autoClaude = {
    version: '3.0',
    migratedAt: new Date().toISOString(),
  };

  // Add capabilities based on agent role
  if (capabilities.specPipeline) {
    autoClaude.specPipeline = {
      canGather: capabilities.specPipeline.canGather || false,
      canAssess: capabilities.specPipeline.canAssess || false,
      canResearch: capabilities.specPipeline.canResearch || false,
      canWrite: capabilities.specPipeline.canWrite || false,
      canCritique: capabilities.specPipeline.canCritique || false,
    };
  }

  if (capabilities.execution) {
    autoClaude.execution = {
      canCreatePlan: capabilities.execution.canCreatePlan || false,
      canCreateContext: capabilities.execution.canCreateContext || false,
      canExecute: capabilities.execution.canExecute || false,
      canVerify: capabilities.execution.canVerify || false,
    };
    if (capabilities.execution.selfCritique) {
      autoClaude.execution.selfCritique = capabilities.execution.selfCritique;
    }
  }

  if (capabilities.recovery) {
    autoClaude.recovery = capabilities.recovery;
  }

  if (capabilities.qa) {
    autoClaude.qa = capabilities.qa;
  }

  if (capabilities.memory) {
    autoClaude.memory = {
      canCaptureInsights: capabilities.memory.canCaptureInsights || false,
      canExtractPatterns: capabilities.memory.canExtractPatterns || false,
      canDocumentGotchas: capabilities.memory.canDocumentGotchas || false,
    };
  }

  if (capabilities.worktree) {
    autoClaude.worktree = capabilities.worktree;
  }

  return autoClaude;
}

/**
 * Convert autoClaude object to YAML string with proper indentation
 */
function autoClaudeToYaml(autoClaude) {
  return yaml.dump({ autoClaude }, { indent: 2, lineWidth: -1 }).trim();
}

/**
 * Insert autoClaude section into markdown content
 */
function insertAutoClaudeSection(content, autoClaudeYaml) {
  // Find the c
```