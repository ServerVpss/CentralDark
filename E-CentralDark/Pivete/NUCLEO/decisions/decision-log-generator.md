# DECISAO - decision-log-generator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\decision-log-generator.js
**SHA:** 0cae3db0b5b071e8
**Timestamp:** 2026-08-28T02:02:03.651584
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **Tests Run:** ${context.testsRun?.length || 0} tests

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Decision Log Generator for AIOS Framework
 *
 * Generates decision logs for yolo mode execution to track autonomous
 * decisions, files modified, tests run, and rollback information.
 *
 * @module decision-log-generator
 * @version 1.0.0
 * @created 2025-01-16 (Story 6.1.2.6)
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Calculates duration between start and end time
 *
 * @param {Object} context - Execution context
 * @returns {string} Formatted duration string
 */
function calculateDuration(context) {
  if (!context.endTime) {
    const elapsed = Date.now() - context.startTime;
    return formatDuration(elapsed) + ' (in progress)';
  }

  const duration = context.endTime - context.startTime;
  return formatDuration(duration);
}

/**
 * Formats milliseconds into human-readable duration
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Generates markdown list of key decisions (ADR format - AC3, AC7)
 *
 * @param {Array} decisions - Array of decision objects
 * @returns {string} Formatted markdown list
 */
function generateDecisionsList(decisions) {
  if (!decisions || decisions.length === 0) {
    return '*No autonomous decisions recorded.*';
  }

  let markdown = '';
  decisions.forEach((decision, index) => {
    markdown += `### Decision ${index + 1}: ${decision.description}\n\n`;
    markdown += `**Timestamp:** ${new Date(decision.timestamp).toISOString()}\n\n`;

    // Decision classification (AC7)
    if (decision.type) {
      markdown += `**Type:** ${decision.type}\n\n`;
    }
    if (decision.priority) {
      markdown += `**Priority:** ${decision.priority}\n\n`;
    }

    markdown += `**Reason:** ${decision.reason}\n\n`;

    if (decision.alternatives && decision.alternatives.length > 0) {
      markdown += '**Alternatives Considered:**\n';
      decision.alternatives.forEach(alt => {
        markdown += `- ${alt}\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Generates markdown list of files modified
 *
 * @param {Array} filesModified - Array of file paths
 * @returns {string} Formatted markdown list
 */
function generateFilesList(filesModified) {
  if (!filesModified || filesModified.length === 0) {
    return '*No files modified.*';
  }

  let markdown = '';
  filesModified.forEach(file => {
    const fileName = typeof file === 'string' ? file : file.path;
    const action = file.action || 'modified';
    markdown += `- \`${fileName}\` (${action})\n`;
  });

  return markdown;
}

/**
 * Generates markdown list of tests run
 *
 * @param {Array} testsRun - Array of test objects
 * @returns {string} Formatted markdown list
 */
function generateTestsList(testsRun) {
  if (!testsRun || testsRun.length === 0) {
    return '*No tests recorded.*';
  }

  let markdown = '';
  testsRun.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    markdown += `- ${status}: \`${test.name}\``;

    if (test.duration) {
      markdown += ` (${test.duration}ms)`;
    }

    if (!test.passed && test.error) {
      markdown += `\n  - Error: ${test.error}`;
    }

    markdown += '\n';
  });

  return markdown;
}

/**
 * Generates markdown list of files for rollback
 *
 * @param {Array} filesModified - Array of file paths
 * @returns {string} Formatted markdown list
 */
function generateRollbackFilesList(filesModified) {
  if (!filesModified || filesModified.length === 0) {
    return '*No files to rollback.*';
  }

  let markdown = '';
  filesModified.forEach(file => {
    const fileName = typeof file === 'string' ? file : file.path;
    markdown += `- ${fileName}\n`;
  });

  return markdown;
}

/**
 * Generates decision log for yolo mode execution
 *
 * @param {string} storyId - Story ID (e.g., "6.1.2.6")
 * @param {Object} context - Execution context
 * @param {string} context.agentId - Agent ID executing the story
 * @param {string} context.storyPath - Path to story file
 * @param {number} context.startTime - Start timestamp
 * @param {number} [context.endTime] - End timestamp
 * @param {string} context.status - Execution status
 * @param {Array} [context.decisions] - Array of decision objects
 * @param {Array} [context.filesModified] - Array of file paths modified
 * @param {Array} [context.testsRun] - Array of test results
 * @param {Object} [context.metrics] - Performance metrics
 * @param {string} [context.commitBefore] - Git commit hash before execution
 * @returns {Promise<string>} Path to decision log file
 */
async f
```