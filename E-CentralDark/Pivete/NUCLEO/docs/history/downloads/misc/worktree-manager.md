# OUTRO - worktree-manager.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\worktree-manager.js
**SHA:** 5f10d59029b0dfb8
**Timestamp:** 2026-08-28T02:02:14.700066
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = storyId ? `merge-${storyId}-` : 'merge-';

### Ouro Bruto (primeiros 5000 chars)
```
const execa = require('execa');
const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk');

/**
 * @typedef {Object} WorktreeInfo
 * @property {string} storyId - The story identifier
 * @property {string} path - Absolute path to the worktree
 * @property {string} branch - Branch name (auto-claude/{storyId})
 * @property {Date} createdAt - When the worktree was created
 * @property {number} uncommittedChanges - Number of uncommitted changes
 * @property {'active'|'stale'} status - Worktree status (stale if > 30 days)
 */

/**
 * @typedef {Object} WorktreeManagerOptions
 * @property {number} [maxWorktrees=10] - Maximum number of concurrent worktrees
 * @property {string} [worktreeDir='.aios/worktrees'] - Directory for worktrees
 * @property {string} [branchPrefix='auto-claude/'] - Prefix for worktree branches
 * @property {number} [staleDays=30] - Days after which a worktree is considered stale
 * @property {string} [mergeLogDir='.aios/logs/merges'] - Directory for merge audit logs
 */

/**
 * @typedef {Object} MergeOptions
 * @property {boolean} [staged=false] - Merge without committing (--no-commit)
 * @property {boolean} [squash=false] - Squash commits before merge (--squash)
 * @property {boolean} [cleanup=false] - Remove worktree after successful merge
 * @property {string} [message] - Custom merge commit message
 */

/**
 * @typedef {Object} MergeResult
 * @property {boolean} success - Whether the merge was successful
 * @property {string} storyId - Story identifier that was merged
 * @property {string} sourceBranch - Branch that was merged from
 * @property {string} targetBranch - Branch that was merged into
 * @property {string[]} conflicts - List of conflicting files (if any)
 * @property {string} [commitHash] - Resulting commit hash (if committed)
 * @property {string} [error] - Error message if merge failed
 * @property {Date} timestamp - When the merge was attempted
 * @property {string} [logPath] - Path to merge audit log
 */

/**
 * WorktreeManager - Manages Git worktrees for isolated story development
 *
 * Provides functionality to create, list, and remove Git worktrees,
 * enabling parallel development of multiple stories in isolation.
 *
 * @example
 * const manager = new WorktreeManager('/path/to/repo');
 * await manager.create('STORY-42');
 * const worktrees = await manager.list();
 * await manager.remove('STORY-42');
 */
class WorktreeManager {
  /**
   * @param {string} [projectRoot] - Root path of the git repository
   * @param {WorktreeManagerOptions} [options] - Configuration options
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot || process.cwd();
    this.maxWorktrees = options.maxWorktrees || 10;
    this.worktreeDir = options.worktreeDir || '.aios/worktrees';
    this.branchPrefix = options.branchPrefix || 'auto-claude/';
    this.staleDays = options.staleDays || 30;
    this.mergeLogDir = options.mergeLogDir || '.aios/logs/merges';
    this.gitPath = 'git';
  }

  /**
   * Execute git command using execa
   * @private
   * @param {string[]} args - Git command arguments
   * @param {Object} [options] - Execution options
   * @returns {Promise<string>} Command stdout output
   */
  async execGit(args, options = {}) {
    try {
      const { stdout, stderr } = await execa(this.gitPath, args, {
        cwd: this.projectRoot,
        ...options,
      });

      if (stderr && !options.ignoreStderr) {
        console.warn(chalk.yellow(`Git warning: ${stderr}`));
      }

      return stdout.trim();
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * Get the worktree path for a story
   * @private
   * @param {string} storyId - Story identifier
   * @returns {string} Absolute path to worktree
   */
  getWorktreePath(storyId) {
    return path.join(this.projectRoot, this.worktreeDir, storyId);
  }

  /**
   * Get the branch name for a story
   * @private
   * @param {string} storyId - Story identifier
   * @returns {string} Branch name
   */
  getBranchName(storyId) {
    return `${this.branchPrefix}${storyId}`;
  }

  /**
   * Create a new worktree for a story
   *
   * @param {string} storyId - Story identifier (e.g., 'STORY-42')
   * @returns {Promise<WorktreeInfo>} Created worktree information
   * @throws {Error} If max worktrees limit reached or worktree already exists
   */
  async create(storyId) {
    // Check if worktree already exists
    if (await this.exists(storyId)) {
      throw new Error(`Worktree for story '${storyId}' already exists`);
    }

    // Check max worktrees limit
    const currentWorktrees = await this.list();
    if (currentWorktrees.length >= this.maxWorktrees) {
      throw new Error(
        `Maximum worktrees limit (${this.maxWorktrees}) reached. ` +
          `Remove stale worktrees before creating new ones.`
      );
    }

    const worktreePath = this.getWorktreePath(storyId);
    const branchName = this.getBranchName(sto
```