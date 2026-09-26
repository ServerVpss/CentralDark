# COMANDO - cicd-discovery.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\cicd-discovery.js
**SHA:** 33b5ee4963600d50
**Timestamp:** 2026-08-28T02:02:12.600776
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: step.run,
- run: npx aios build --parallel --smart-cache
- circleci: `- run:
- run: npx aios test --discover --coverage`,
- circleci: `- run:
- run: npm run lint`,
- circleci: `- run:
- run: npx aios review --security-only
- circleci: `- run:
- run: npx aios status --report-ci

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * CI/CD Discovery
 * Gap Analysis Implementation
 *
 * Auto-detects CI/CD infrastructure in projects and provides
 * integration points for AIOS workflows.
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

/**
 * Provider configurations for different CI/CD systems
 */
const PROVIDERS = {
  'github-actions': {
    name: 'GitHub Actions',
    configPaths: ['.github/workflows'],
    configPatterns: ['*.yml', '*.yaml'],
    triggerTypes: ['push', 'pull_request', 'workflow_dispatch', 'schedule', 'release'],
  },
  'gitlab-ci': {
    name: 'GitLab CI',
    configPaths: ['.'],
    configPatterns: ['.gitlab-ci.yml', '.gitlab-ci.yaml'],
    triggerTypes: ['push', 'merge_request', 'schedule', 'pipeline', 'trigger'],
  },
  jenkins: {
    name: 'Jenkins',
    configPaths: ['.'],
    configPatterns: ['Jenkinsfile', 'jenkins.yml', 'jenkins.yaml'],
    triggerTypes: ['scm', 'cron', 'upstream', 'manual'],
  },
  circleci: {
    name: 'CircleCI',
    configPaths: ['.circleci'],
    configPatterns: ['config.yml', 'config.yaml'],
    triggerTypes: ['push', 'pull_request', 'schedule', 'api'],
  },
  'travis-ci': {
    name: 'Travis CI',
    configPaths: ['.'],
    configPatterns: ['.travis.yml', '.travis.yaml'],
    triggerTypes: ['push', 'pull_request', 'cron', 'api'],
  },
  'azure-pipelines': {
    name: 'Azure Pipelines',
    configPaths: ['.'],
    configPatterns: ['azure-pipelines.yml', 'azure-pipelines.yaml'],
    triggerTypes: ['push', 'pull_request', 'schedule', 'manual'],
  },
  bitbucket: {
    name: 'Bitbucket Pipelines',
    configPaths: ['.'],
    configPatterns: ['bitbucket-pipelines.yml'],
    triggerTypes: ['push', 'pull_request', 'manual', 'schedule'],
  },
  'aws-codepipeline': {
    name: 'AWS CodePipeline',
    configPaths: ['.'],
    configPatterns: ['buildspec.yml', 'buildspec.yaml'],
    triggerTypes: ['push', 'manual', 'cloudwatch'],
  },
};

/**
 * ConfigParser - Parses CI/CD configuration files
 */
class ConfigParser {
  constructor() {
    this.yamlParser = null;
  }

  /**
   * Parse YAML content (simple parser without external deps)
   */
  parseYaml(content) {
    // Simple YAML parser for CI/CD configs
    const result = {};
    const lines = content.split('\n');
    const stack = [{ obj: result, indent: -1 }];

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) continue;

      const indent = line.search(/\S/);
      const trimmed = line.trim();

      // Pop stack until we find parent with smaller indent
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      // Handle list items
      if (trimmed.startsWith('- ')) {
        const value = trimmed.substring(2).trim();
        const lastKey = Object.keys(parent).pop();
        if (lastKey && !Array.isArray(parent[lastKey])) {
          parent[lastKey] = [];
        }
        if (lastKey) {
          if (value.includes(':')) {
            const obj = {};
            const [k, v] = value.split(':').map((s) => s.trim());
            obj[k] = v || {};
            parent[lastKey].push(obj);
            stack.push({ obj: obj, indent: indent });
          } else {
            parent[lastKey].push(value);
          }
        }
        continue;
      }

      // Handle key-value pairs
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const key = trimmed.substring(0, colonIdx).trim();
        const value = trimmed.substring(colonIdx + 1).trim();

        if (value) {
          // Inline value
          parent[key] = value.replace(/^["']|["']$/g, '');
        } else {
          // Nested object
          parent[key] = {};
          stack.push({ obj: parent[key], indent: indent });
        }
      }
    }

    return result;
  }

  /**
   * Parse Jenkinsfile (Groovy-based)
   */
  parseJenkinsfile(content) {
    const result = {
      type: 'jenkinsfile',
      stages: [],
      agents: [],
      environment: {},
      triggers: [],
      options: [],
    };

    // Extract pipeline blocks
    const pipelineMatch = content.match(/pipeline\s*\{([\s\S]*)\}/);
    if (!pipelineMatch) {
      // Scripted pipeline
      result.type = 'scripted';
      const stageMatches = content.matchAll(/stage\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      for (const match of stageMatches) {
        result.stages.push({ name: match[1] });
      }
      return result;
    }

    const pipelineContent = pipelineMatch[1];

    // Extract agent
    const agentMatch = pipelineContent.match(/agent\s*\{([^}]+)\}/);
    if (agentMatch) {
      const agentContent = agentMatch[1].trim();
      if (agentContent.includes('docker')) {
        result.agents.push({ type: 'docker', config: agentContent });
      } else if (agentContent.includes('kubernetes')) {
        result.agents.push({ type: 'kubernetes', config: agentContent 
```