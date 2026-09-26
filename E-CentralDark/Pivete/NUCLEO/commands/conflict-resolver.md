# COMANDO - conflict-resolver.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\conflict-resolver.js
**SHA:** 8971b9aca2ab23a9
**Timestamp:** 2026-08-28T02:02:03.646063
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- instruction: `Edit ${filePath} and run: git add "${fileInfo.file}"`

### Padroes
- const pattern = new RegExp(
- const pattern = new RegExp(
- const pattern = new RegExp(

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const _diffLib = require('diff');
const inquirer = require('inquirer');
const GitWrapper = require('./git-wrapper');

/**
 * Handles conflict detection and resolution for meta-agent modifications
 */
class ConflictResolver {
  constructor(options = {}) {
    this.git = new GitWrapper(options);
    this.rootPath = options.rootPath || process.cwd();
    this.strategies = {
      'ours': this.resolveOurs.bind(this),
      'theirs': this.resolveTheirs.bind(this),
      'manual': this.resolveManual.bind(this),
      'auto': this.resolveAuto.bind(this),
      'interactive': this.resolveInteractive.bind(this)
    };
  }

  /**
   * Detect conflicts in the repository
   * @returns {Promise<Object>} Conflict information
   */
  async detectConflicts() {
    try {
      const conflicts = await this.git.getConflicts();
      
      if (conflicts.length === 0) {
        return {
          hasConflicts: false,
          files: []
        };
      }

      const conflictDetails = [];
      for (const file of conflicts) {
        const content = await fs.readFile(
          path.join(this.rootPath, file),
          'utf-8'
        );
        
        const conflictInfo = this.parseConflictMarkers(_content);
        conflictDetails.push({
          file,
          conflicts: conflictInfo.conflicts,
          conflictCount: conflictInfo.conflicts.length,
          type: this.detectConflictType(file, conflictInfo)
        });
      }

      return {
        hasConflicts: true,
        files: conflictDetails,
        totalConflicts: conflictDetails.reduce((sum, f) => sum + f.conflictCount, 0)
      };
    } catch (error) {
      console.error(chalk.red(`Error detecting conflicts: ${error.message}`));
      return {
        hasConflicts: false,
        error: error.message
      };
    }
  }

  /**
   * Parse conflict markers in file content
   * @private
   */
  parseConflictMarkers(_content) {
    const conflicts = [];
    const lines = content.split('\n');
    let inConflict = false;
    let currentConflict = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      
      if (line.startsWith('<<<<<<<')) {
        inConflict = true;
        currentConflict = {
          startLine: lineNumber,
          ours: [],
          theirs: [],
          separator: null,
          endLine: null,
          branch: line.substring(8).trim()
        };
      } else if (inConflict && line.startsWith('=======')) {
        currentConflict.separator = lineNumber;
      } else if (inConflict && line.startsWith('>>>>>>>')) {
        currentConflict.endLine = lineNumber;
        currentConflict.theirBranch = line.substring(8).trim();
        conflicts.push(currentConflict);
        inConflict = false;
        currentConflict = null;
      } else if (inConflict && currentConflict) {
        if (currentConflict.separator === null) {
          currentConflict.ours.push(line);
        } else {
          currentConflict.theirs.push(line);
        }
      }
    }

    return { conflicts, totalLines: lineNumber };
  }

  /**
   * Detect the type of conflict
   * @private
   */
  detectConflictType(file, conflictInfo) {
    const ext = path.extname(file);
    const conflicts = conflictInfo.conflicts;

    // Check for specific conflict patterns
    for (const _conflict of conflicts) {
      const oursContent = conflict.ours.join('\n');
      const theirsContent = conflict.theirs.join('\n');

      // Whitespace only conflict
      if (oursContent.trim() === theirsContent.trim()) {
        return 'whitespace';
      }

      // Import/require conflict
      if ((oursContent.includes('import') || oursContent.includes('require')) &&
          (theirsContent.includes('import') || theirsContent.includes('require'))) {
        return 'imports';
      }

      // Version number conflict
      if (oursContent.match(/\d+\.\d+\.\d+/) && theirsContent.match(/\d+\.\d+\.\d+/)) {
        return 'version';
      }
    }

    // File type specific
    if (ext === '.json') return 'json';
    if (ext === '.yaml' || ext === '.yml') return 'yaml';
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) return 'code';
    if (ext === '.md') return 'markdown';

    return 'general';
  }

  /**
   * Resolve conflicts using a specific strategy
   * @param {string} strategy - Resolution strategy
   * @param {Object} options - Resolution options
   * @returns {Promise<Object>} Resolution result
   */
  async resolveConflicts(strategy = 'interactive', options = {}) {
    const conflictInfo = await this.detectConflicts();
    
    if (!conflictInfo.hasConflicts) {
      console.log(chalk.green('✅ No conflicts detected'));
      return { success: true, resolved: 0 };
    }

    console.log(chalk.yellow(
      `Found ${conflictInfo.totalConflicts} conflicts in ${conflictInfo.files.length} files`
    ));

    const resolver = this.strategies[strategy];
    if 
```

---

# COMANDO - conflict-resolver.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\conflict-resolver.js
**SHA:** 3d2794a66f16fcea
**Timestamp:** 2026-08-28T02:02:12.880189
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- instruction: `Edit ${filePath} and run: git add "${fileInfo.file}"`,

### Padroes
- const pattern = new RegExp(
- const pattern = new RegExp(
- const pattern = new RegExp(

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const diffLib = require('diff');
const inquirer = require('inquirer');
const GitWrapper = require('./git-wrapper');

/**
 * Handles conflict detection and resolution for meta-agent modifications
 */
class ConflictResolver {
  constructor(options = {}) {
    this.git = new GitWrapper(options);
    this.rootPath = options.rootPath || process.cwd();
    this.strategies = {
      'ours': this.resolveOurs.bind(this),
      'theirs': this.resolveTheirs.bind(this),
      'manual': this.resolveManual.bind(this),
      'auto': this.resolveAuto.bind(this),
      'interactive': this.resolveInteractive.bind(this),
    };
  }

  /**
   * Detect conflicts in the repository
   * @returns {Promise<Object>} Conflict information
   */
  async detectConflicts() {
    try {
      const conflicts = await this.git.getConflicts();
      
      if (conflicts.length === 0) {
        return {
          hasConflicts: false,
          files: [],
        };
      }

      const conflictDetails = [];
      for (const file of conflicts) {
        const content = await fs.readFile(
          path.join(this.rootPath, file),
          'utf-8',
        );
        
        const conflictInfo = this.parseConflictMarkers(content);
        conflictDetails.push({
          file,
          conflicts: conflictInfo.conflicts,
          conflictCount: conflictInfo.conflicts.length,
          type: this.detectConflictType(file, conflictInfo),
        });
      }

      return {
        hasConflicts: true,
        files: conflictDetails,
        totalConflicts: conflictDetails.reduce((sum, f) => sum + f.conflictCount, 0),
      };
    } catch (error) {
      console.error(chalk.red(`Error detecting conflicts: ${error.message}`));
      return {
        hasConflicts: false,
        error: error.message,
      };
    }
  }

  /**
   * Parse conflict markers in file content
   * @private
   */
  parseConflictMarkers(content) {
    const conflicts = [];
    const lines = content.split('\n');
    let inConflict = false;
    let currentConflict = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      
      if (line.startsWith('<<<<<<<')) {
        inConflict = true;
        currentConflict = {
          startLine: lineNumber,
          ours: [],
          theirs: [],
          separator: null,
          endLine: null,
          branch: line.substring(8).trim(),
        };
      } else if (inConflict && line.startsWith('=======')) {
        currentConflict.separator = lineNumber;
      } else if (inConflict && line.startsWith('>>>>>>>')) {
        currentConflict.endLine = lineNumber;
        currentConflict.theirBranch = line.substring(8).trim();
        conflicts.push(currentConflict);
        inConflict = false;
        currentConflict = null;
      } else if (inConflict && currentConflict) {
        if (currentConflict.separator === null) {
          currentConflict.ours.push(line);
        } else {
          currentConflict.theirs.push(line);
        }
      }
    }

    return { conflicts, totalLines: lineNumber };
  }

  /**
   * Detect the type of conflict
   * @private
   */
  detectConflictType(file, conflictInfo) {
    const ext = path.extname(file);
    const conflicts = conflictInfo.conflicts;

    // Check for specific conflict patterns
    for (const conflict of conflicts) {
      const oursContent = conflict.ours.join('\n');
      const theirsContent = conflict.theirs.join('\n');

      // Whitespace only conflict
      if (oursContent.trim() === theirsContent.trim()) {
        return 'whitespace';
      }

      // Import/require conflict
      if ((oursContent.includes('import') || oursContent.includes('require')) &&
          (theirsContent.includes('import') || theirsContent.includes('require'))) {
        return 'imports';
      }

      // Version number conflict
      if (oursContent.match(/\d+\.\d+\.\d+/) && theirsContent.match(/\d+\.\d+\.\d+/)) {
        return 'version';
      }
    }

    // File type specific
    if (ext === '.json') return 'json';
    if (ext === '.yaml' || ext === '.yml') return 'yaml';
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) return 'code';
    if (ext === '.md') return 'markdown';

    return 'general';
  }

  /**
   * Resolve conflicts using a specific strategy
   * @param {string} strategy - Resolution strategy
   * @param {Object} options - Resolution options
   * @returns {Promise<Object>} Resolution result
   */
  async resolveConflicts(strategy = 'interactive', options = {}) {
    const conflictInfo = await this.detectConflicts();
    
    if (!conflictInfo.hasConflicts) {
      console.log(chalk.green('✅ No conflicts detected'));
      return { success: true, resolved: 0 };
    }

    console.log(chalk.yellow(
      `Found ${conflictInfo.totalConflicts} conflicts in ${conflictInfo.files.length} files`,
    ));

    const resolver = this.strategies[strategy];
   
```