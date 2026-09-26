# COMANDO - pr-review-ai.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\pr-review-ai.js
**SHA:** cfe154d2e7bed2a9
**Timestamp:** 2026-08-28T02:02:13.861454
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- oldStart: parseInt(match[1]),
- newStart: parseInt(match[3]),
- const prompt = this.buildPrompt(prData, staticFindings);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * PR Review AI
 * AI-powered Pull Request review system
 *
 * Analyzes PRs for:
 * - Code quality issues
 * - Security vulnerabilities
 * - Performance concerns
 * - Redundancy and duplication
 * - False positives and incorrect assumptions
 * - Test coverage
 *
 * Based on Auto-Claude's AI PR Reviewer architecture.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ============================================================================
// REVIEW CATEGORIES
// ============================================================================

const ReviewCategory = {
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  CODE_QUALITY: 'code_quality',
  REDUNDANCY: 'redundancy',
  TEST_COVERAGE: 'test_coverage',
  DOCUMENTATION: 'documentation',
  BEST_PRACTICES: 'best_practices',
  ARCHITECTURE: 'architecture',
};

const Severity = {
  CRITICAL: 'critical', // Must fix before merge
  HIGH: 'high', // Should fix before merge
  MEDIUM: 'medium', // Consider fixing
  LOW: 'low', // Suggestion
  INFO: 'info', // Informational
};

const Verdict = {
  APPROVE: 'approve',
  REQUEST_CHANGES: 'request_changes',
  COMMENT: 'comment',
};

// ============================================================================
// DIFF ANALYZER
// ============================================================================

class DiffAnalyzer {
  /**
   * Parse a unified diff into structured changes
   * @param {string} diff - Unified diff content
   * @returns {Array} Parsed changes
   */
  parseDiff(diff) {
    const files = [];
    const fileRegex = /^diff --git a\/(.+) b\/(.+)$/gm;
    const hunkRegex = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)$/gm;

    let currentFile = null;
    const lines = diff.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // New file
      if (line.startsWith('diff --git')) {
        if (currentFile) files.push(currentFile);
        const match = line.match(/diff --git a\/(.+) b\/(.+)/);
        currentFile = {
          path: match ? match[2] : 'unknown',
          hunks: [],
          additions: 0,
          deletions: 0,
          isNew: false,
          isDeleted: false,
          isBinary: false,
        };
      }

      // File metadata
      if (line.startsWith('new file')) {
        if (currentFile) currentFile.isNew = true;
      }
      if (line.startsWith('deleted file')) {
        if (currentFile) currentFile.isDeleted = true;
      }
      if (line.includes('Binary files')) {
        if (currentFile) currentFile.isBinary = true;
      }

      // Hunk header
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)/);
        if (match && currentFile) {
          currentFile.hunks.push({
            oldStart: parseInt(match[1]),
            oldCount: parseInt(match[2] || '1'),
            newStart: parseInt(match[3]),
            newCount: parseInt(match[4] || '1'),
            context: match[5] || '',
            lines: [],
          });
        }
      }

      // Diff lines
      if (currentFile && currentFile.hunks.length > 0) {
        const currentHunk = currentFile.hunks[currentFile.hunks.length - 1];
        if (line.startsWith('+') && !line.startsWith('+++')) {
          currentHunk.lines.push({ type: 'add', content: line.substring(1) });
          currentFile.additions++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          currentHunk.lines.push({ type: 'del', content: line.substring(1) });
          currentFile.deletions++;
        } else if (line.startsWith(' ')) {
          currentHunk.lines.push({ type: 'context', content: line.substring(1) });
        }
      }
    }

    if (currentFile) files.push(currentFile);
    return files;
  }

  /**
   * Extract added lines from parsed diff
   */
  getAddedLines(parsedDiff) {
    const added = [];
    for (const file of parsedDiff) {
      for (const hunk of file.hunks) {
        let lineNum = hunk.newStart;
        for (const line of hunk.lines) {
          if (line.type === 'add') {
            added.push({
              file: file.path,
              line: lineNum,
              content: line.content,
            });
          }
          if (line.type !== 'del') lineNum++;
        }
      }
    }
    return added;
  }

  /**
   * Get statistics from parsed diff
   */
  getStats(parsedDiff) {
    return {
      filesChanged: parsedDiff.length,
      additions: parsedDiff.reduce((sum, f) => sum + f.additions, 0),
      deletions: parsedDiff.reduce((sum, f) => sum + f.deletions, 0),
      newFiles: parsedDiff.filter((f) => f.isNew).length,
      deletedFiles: parsedDiff.filter((f) => f.isDeleted).length,
      binaryFiles: parsedDiff.filter((f) => f.isBinary).length,
    };
  }
}

// ============================================================================
// CODE ANALYZERS
// =======================
```