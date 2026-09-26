# OUTRO - sandbox-tester.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\sandbox-tester.js
**SHA:** 019af2e23de70d7d
**Timestamp:** 2026-08-28T02:02:14.441720
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const isExcluded = exclude.some(pattern =>

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
let execa;
try {
  execa = require('execa').execa;
} catch {
  execa = null;
}
let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = { blue: s => s, green: s => s, red: s => s, yellow: s => s };
}
let tmp;
try {
  tmp = require('tmp-promise');
} catch {
  tmp = null;
}

/**
 * SandboxTester - Test improvements in isolated environment
 *
 * Refactored to use execa for cross-platform compatibility
 */
class SandboxTester {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.keepSandbox = options.keepSandbox || false;
    this.sandboxPath = null;
  }

  /**
   * Create isolated sandbox environment
   */
  async createSandbox() {
    try {
      if (!tmp) {
        throw new Error('tmp-promise module not available - install with: npm install tmp-promise');
      }
      const tmpDir = await tmp.dir({ unsafeCleanup: !this.keepSandbox });
      this.sandboxPath = tmpDir.path;

      if (this.verbose) {
        console.log(chalk.blue(`Sandbox created: ${this.sandboxPath}`));
      }

      return this.sandboxPath;
    } catch (error) {
      throw new Error(`Failed to create sandbox: ${error.message}`);
    }
  }

  /**
   * Copy project files to sandbox
   */
  async copyProject(sourcePath, options = {}) {
    const { exclude = ['node_modules', '.git', 'dist', 'build'] } = options;

    try {
      if (!this.sandboxPath) {
        await this.createSandbox();
      }

      // Get list of files to copy
      const files = await this.getProjectFiles(sourcePath, exclude);

      // Copy files maintaining structure
      for (const file of files) {
        const relativePath = path.relative(sourcePath, file);
        const destPath = path.join(this.sandboxPath, relativePath);

        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(file, destPath);
      }

      if (this.verbose) {
        console.log(chalk.green(`Copied ${files.length} files to sandbox`));
      }

      return files.length;
    } catch (error) {
      throw new Error(`Failed to copy project: ${error.message}`);
    }
  }

  /**
   * Get list of project files excluding specified patterns
   */
  async getProjectFiles(rootPath, exclude = []) {
    const files = [];

    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(rootPath, fullPath);

        // Check if excluded
        const isExcluded = exclude.some(pattern =>
          relativePath.includes(pattern) || entry.name === pattern,
        );

        if (isExcluded) continue;

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }

    await walk(rootPath);
    return files;
  }

  /**
   * Apply improvement to sandbox
   */
  async applyImprovement(improvement) {
    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      const { files, changes } = improvement;

      // Apply file changes
      for (const change of changes) {
        const filePath = path.join(this.sandboxPath, change.file);

        if (change.type === 'create') {
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, change.content);
        } else if (change.type === 'modify') {
          await fs.writeFile(filePath, change.content);
        } else if (change.type === 'delete') {
          await fs.unlink(filePath);
        }
      }

      if (this.verbose) {
        console.log(chalk.green(`Applied ${changes.length} changes to sandbox`));
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to apply improvement: ${error.message}`);
    }
  }

  /**
   * Run tests in sandbox
   */
  async runTests(options = {}) {
    const {
      testCommand = 'npm test',
      timeout = 60000,
    } = options;

    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      if (this.verbose) {
        console.log(chalk.blue('Running tests in sandbox...'));
      }

      const output = await this.runCommand(this.sandboxPath, testCommand, { timeout });

      return {
        success: true,
        output,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
      };
    }
  }

  /**
   * Run lint checks in sandbox
   */
  async runLint(options = {}) {
    const {
      lintCommand = 'npm run lint',
      timeout = 30000,
    } = options;

    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      if (this.verbose) {
        console.log(chalk.blue('Running lint in sandbox...'));
      }

      con
```